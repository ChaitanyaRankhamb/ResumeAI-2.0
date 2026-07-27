import express, { Response } from "express";
import puppeteer, { Browser, Page } from "puppeteer";
import { AppError } from "../Error/appError";
import { fileRepository } from "../database/mongo/files/fileModelRepo";
import { userRepository } from "../database/mongo/user/userModelRepo";
import { authMiddleware, AuthRequest } from "../middlewares/auth.middleware";

const router = express.Router();

/**
 * =========================================
 * CONFIG
 * =========================================
 */

const FRONTEND_URL =
  process.env.FRONTEND_URL || "http://localhost:3000";

const PUPPETEER_TIMEOUT = 60_000;

const MAX_CONCURRENT_PAGES = 5;

/**
 * =========================================
 * GLOBAL SINGLETON BROWSER
 * =========================================
 */

let browser: Browser | null = null;

/**
 * Track active pages
 * Helps prevent Chrome crash under load
 */
let activePages = 0;

/**
 * =========================================
 * CREATE / REUSE BROWSER
 * =========================================
 */

async function getBrowser(): Promise<Browser> {
  try {
    /**
     * Launch new browser if:
     * - browser does not exist
     * - browser disconnected
     */

    if (!browser || !browser.isConnected()) {
      console.log("ðŸš€ Launching Puppeteer browser...");

      browser = await puppeteer.launch({
        headless: true,

        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",

          // Better stability in Docker / Nginx / Linux
          "--disable-dev-shm-usage",
          "--disable-gpu",
          "--no-first-run",
          "--no-zygote",
        ],

        // Use pipe instead of WebSocket for more stable connection
        pipe: true,

        timeout: PUPPETEER_TIMEOUT,
      });

      browser.on("disconnected", () => {
        console.error("âŒ Puppeteer browser disconnected");
        browser = null;
      });
    }

    return browser;
  } catch (error) {
    console.error("Failed to launch browser:", error);
    throw new AppError("Failed to initialize PDF engine", 500);
  }
}

/**
 * =========================================
 * GRACEFUL SHUTDOWN
 * =========================================
 */

async function shutdown() {
  try {
    console.log("ðŸ›‘ Shutting down gracefully...");

    if (browser) {
      await browser.close();
      browser = null;
    }

    process.exit(0);
  } catch (error) {
    console.error("Shutdown error:", error);
    process.exit(1);
  }
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

/**
 * =========================================
 * PDF DOWNLOAD ROUTE
 * =========================================
 */

router.get(
  "/download/:fileId",
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    let page: Page | null = null;

    try {
      /**
       * =========================================
       * BASIC VALIDATION
       * =========================================
       */

      const { fileId } = req.params as { fileId: string };

      if (!fileId) {
        throw new AppError("fileId is required", 400);
      }

      const userId = req.userId;

      if (!userId) {
        throw new AppError("Unauthorized", 401);
      }

      /**
       * =========================================
       * CONCURRENCY PROTECTION
       * =========================================
       */

      if (activePages >= MAX_CONCURRENT_PAGES) {
        return res.status(429).json({
          message:
            "PDF generation server is busy. Please try again later.",
        });
      }

      activePages++;

      /**
       * =========================================
       * USER VALIDATION
       * =========================================
       */

      const user = await userRepository.findUserById(userId);

      if (!user) {
        throw new AppError("User not found", 404);
      }

      /**
       * =========================================
       * FILE VALIDATION
       * =========================================
       */

      const file = await fileRepository.findFileById(fileId);

      if (!file) {
        throw new AppError("File not found", 404);
      }

      /**
       * Ensure file belongs to logged-in user
       */

      if (file.userId.toString() !== userId) {
        throw new AppError("File not found", 404);
      }

      /**
       * =========================================
       * GET BROWSER
       * =========================================
       */

      const browserInstance = await getBrowser();

      /**
       * =========================================
       * CREATE PAGE
       * =========================================
       */

      page = await browserInstance.newPage();

      /**
       * Prevent memory leaks
       */

      await page.setCacheEnabled(false);

      /**
       * =========================================
       * AUTH COOKIE
       * =========================================
       */

      const accessToken = req.cookies?.accessToken;

      if (accessToken) {
        await page.setCookie({
          name: "accessToken",
          value: accessToken,

          domain: new URL(FRONTEND_URL).hostname,

          path: "/",

          httpOnly: true,

          secure: FRONTEND_URL.startsWith("https"),

          sameSite: "Lax",
        });
      }

      /**
       * =========================================
       * GENERATE TARGET URL
       * =========================================
       */

      const reportUrl = `${FRONTEND_URL}/dashboard/report?fileId=${fileId}`;

      console.log("ðŸ“„ Generating PDF:", reportUrl);

      /**
       * =========================================
       * OPEN PAGE
       * =========================================
       */

      await page.goto(reportUrl, {
        waitUntil: "networkidle2",

        timeout: PUPPETEER_TIMEOUT,
      });

      /**
       * =========================================
       * WAIT FOR CONTENT
       * =========================================
       */

      await page.waitForSelector("#report-container", {
        timeout: 30_000,
      });

      /**
       * =========================================
       * PRINT OPTIMIZATION
       * =========================================
       */

      await page.emulateMediaType("print");

      /**
       * Disable animations
       */

      await page.addStyleTag({
        content: `
          * {
            animation: none !important;
            transition: none !important;
          }
        `,
      });

      /**
       * =========================================
       * GENERATE PDF
       * =========================================
       */

      const pdfBuffer = await page.pdf({
        format: "A4",

        printBackground: true,

        preferCSSPageSize: true,

        margin: {
          top: "20px",
          right: "20px",
          bottom: "20px",
          left: "20px",
        },

        timeout: PUPPETEER_TIMEOUT,
      });

      /**
       * =========================================
       * RESPONSE HEADERS
       * =========================================
       */

      res.setHeader("Content-Type", "application/pdf");

      res.setHeader(
        "Content-Disposition",
        `attachment; filename=resume-report-${fileId}.pdf`,
      );

      /**
       * =========================================
       * SEND PDF
       * =========================================
       */

      return res.status(200).send(pdfBuffer);
    } catch (error) {
      console.error("âŒ PDF generation failed:", error);

      return res.status(500).json({
        message: "Failed to generate PDF",
      });
    } finally {
      /**
       * =========================================
       * CLEANUP
       * =========================================
       */

      activePages--;

      if (page) {
        try {
          await page.close();
        } catch (closeError) {
          console.warn("Failed to close Puppeteer page:", closeError);
        }
      }
    }
  },
);

export default router;
