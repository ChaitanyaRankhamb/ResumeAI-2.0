import { NextFunction, Request, Response } from "express";
import logger from "../config/logger.config";
import redisClient from "../config/redis.connection";

export interface RateLimitOptions {
  capacity: number; // Maximum burst bucket size
  windowMs: number; // Time window for full bucket refill in milliseconds
  keyPrefix: string; // Identifier prefix for the route group (e.g. "auth_login")
  cost?: number; // Tokens consumed per request (default: 1)
  message?: string; // Custom 429 error message
  keyGenerator?: (req: Request) => string; // Custom key extractor (defaults to userId or client IP)
}

/**
 * Atomic Lua script for distributed Token Bucket algorithm in Redis.
 * Executes in a single atomic transaction to avoid race conditions across backend replicas.
 */
const TOKEN_BUCKET_LUA_SCRIPT = `
local key = KEYS[1]
local capacity = tonumber(ARGV[1])
local refillRate = tonumber(ARGV[2]) -- tokens per millisecond
local cost = tonumber(ARGV[3])
local now = tonumber(ARGV[4])
local ttl = tonumber(ARGV[5])

local data = redis.call('HMGET', key, 'tokens', 'lastRefill')
local tokens = tonumber(data[1])
local lastRefill = tonumber(data[2])

if tokens == nil or lastRefill == nil then
  tokens = capacity
  lastRefill = now
else
  local elapsed = math.max(0, now - lastRefill)
  local refilled = elapsed * refillRate
  tokens = math.min(capacity, tokens + refilled)
  lastRefill = now
end

if tokens >= cost then
  tokens = tokens - cost
  redis.call('HMSET', key, 'tokens', tokens, 'lastRefill', lastRefill)
  redis.call('EXPIRE', key, ttl)
  
  local timeToFullMs = 0
  if tokens < capacity and refillRate > 0 then
    timeToFullMs = math.ceil((capacity - tokens) / refillRate)
  end
  
  return {1, math.floor(tokens), 0, timeToFullMs}
else
  redis.call('HMSET', key, 'tokens', tokens, 'lastRefill', lastRefill)
  redis.call('EXPIRE', key, ttl)
  
  local retryAfterMs = 0
  if refillRate > 0 then
    retryAfterMs = math.ceil((cost - tokens) / refillRate)
  end
  local timeToFullMs = 0
  if refillRate > 0 then
    timeToFullMs = math.ceil((capacity - tokens) / refillRate)
  end
  
  return {0, math.floor(tokens), retryAfterMs, timeToFullMs}
end
`;

/**
 * Extracts client IP considering reverse proxies (Nginx)
 */
const getClientIp = (req: Request): string => {
  const forwarded = req.headers["x-forwarded-for"];
  if (forwarded) {
    const ips = Array.isArray(forwarded)
      ? forwarded[0]
      : forwarded.split(",")[0];
    return ips.trim();
  }
  return req.ip || req.socket.remoteAddress || "127.0.0.1";
};

/**
 * Factory to create route-specific Token Bucket rate limiters
 */
export const createRateLimiter = (options: RateLimitOptions) => {
  const {
    capacity,
    windowMs,
    keyPrefix,
    cost = 1,
    message = "Too many requests. Please slow down and try again later.",
    keyGenerator,
  } = options;

  const refillRatePerMs = capacity / windowMs;
  const ttlSeconds = Math.ceil((windowMs / 1000) * 2); // Keep key alive for 2x the window
  const log = logger.child({ module: "RATE_LIMITER", keyPrefix });

  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // 1. Determine client identifier (User ID if authenticated, else IP)
      let clientId: string;
      if (keyGenerator) {
        clientId = keyGenerator(req);
      } else {
        const userId = (req as any).userId || (req as any).user?.id;
        clientId = userId ? `user:${userId}` : `ip:${getClientIp(req)}`;
      }

      const redisKey = `ratelimit:${keyPrefix}:${clientId}`;
      const now = Date.now();

      // 2. Execute atomic Lua token bucket script in Redis
      const result = (await redisClient.eval(TOKEN_BUCKET_LUA_SCRIPT, {
        keys: [redisKey],
        arguments: [
          capacity.toString(),
          refillRatePerMs.toString(),
          cost.toString(),
          now.toString(),
          ttlSeconds.toString(),
        ],
      })) as [number, number, number, number];

      const [allowed, remainingTokens, retryAfterMs, resetMs] = result;
      const retryAfterSec = Math.max(1, Math.ceil(retryAfterMs / 1000));
      const resetSec = Math.max(1, Math.ceil(resetMs / 1000));

      // 3. Set standard IETF RateLimit headers
      res.setHeader("RateLimit-Limit", capacity);
      res.setHeader("RateLimit-Remaining", Math.max(0, remainingTokens));
      res.setHeader("RateLimit-Reset", resetSec);

      // 4. Handle rejection
      if (allowed === 0) {
        res.setHeader("Retry-After", retryAfterSec);

        log.warn(
          {
            keyPrefix,
            clientId,
            capacity,
            remainingTokens,
            retryAfterSec,
            url: req.originalUrl || req.url,
            method: req.method,
          },
          `Rate limit exceeded: 429 Too Many Requests (Retry after ${retryAfterSec}s)`,
        );

        return res.status(429).json({
          success: false,
          error: "Too Many Requests",
          message,
          retryAfter: retryAfterSec,
        });
      }

      log.debug(
        { keyPrefix, clientId, remainingTokens, capacity },
        "Rate limit token consumed",
      );

      next();
    } catch (error: any) {
      // Fail-open strategy: If Redis fails, log the error but allow the request so users aren't locked out
      log.error(
        { err: error, message: error?.message, keyPrefix },
        "Rate limiter Redis failure - failing open",
      );
      next();
    }
  };
};

// ── Preset Tier Configurations ───────────────────────────────────────────────

/**
 * Strict: 5 requests per minute for sensitive Auth routes (Login, Register)
 */
export const authRateLimiter = createRateLimiter({
  capacity: 5,
  windowMs: 60 * 1000, // 1 minute
  keyPrefix: "auth_login_register",
  message: "Too many authentication attempts. Please try again after 1 minute.",
});

/**
 * Strict: 3 requests per 2 minutes for Resending Email Verification Codes
 */
export const resendCodeRateLimiter = createRateLimiter({
  capacity: 3,
  windowMs: 2 * 60 * 1000, // 2 minutes
  keyPrefix: "verify_resend_code",
  message:
    "Too many verification code requests. Please wait before requesting another code.",
});

/**
 * Moderate: 10 requests per minute for Verifying OTP/Email Codes
 */
export const verifyCodeRateLimiter = createRateLimiter({
  capacity: 10,
  windowMs: 60 * 1000, // 1 minute
  keyPrefix: "verify_code_submit",
  message: "Too many verification attempts. Please wait 1 minute.",
});

/**
 * Moderate: 10 requests per minute for Heavy Resume Uploads
 */
export const resumeUploadRateLimiter = createRateLimiter({
  capacity: 10,
  windowMs: 60 * 1000, // 1 minute
  keyPrefix: "resume_upload",
  message:
    "Resume upload rate limit reached (max 10 resumes per minute). Please wait a moment.",
});

/**
 * Generous: 30 requests per minute for Fetching Analyzed Resume Reports
 */
export const resumeAnalysisRateLimiter = createRateLimiter({
  capacity: 30,
  windowMs: 60 * 1000, // 1 minute
  keyPrefix: "resume_analysis_fetch",
  message: "Too many report requests. Please slow down.",
});

/**
 * Generous: 30 requests per minute for Real-Time Username Availability Checks
 */
export const checkUsernameRateLimiter = createRateLimiter({
  capacity: 30,
  windowMs: 60 * 1000, // 1 minute
  keyPrefix: "check_username",
  message: "Too many username checks. Please wait a moment.",
});

/**
 * Standard: 60 requests per minute for General Navigation & Profile Fetching (/me, etc.)
 */
export const generalApiRateLimiter = createRateLimiter({
  capacity: 60,
  windowMs: 60 * 1000, // 1 minute
  keyPrefix: "general_api",
  message: "API request rate limit exceeded. Please slow down.",
});
