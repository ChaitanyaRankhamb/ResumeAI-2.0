export const fetchapi = async (url: string, options: any = {}, isRetry = false): Promise<Response> => {
  try {
    let res = await fetch(url, {
      ...options,
      credentials: "include",
    });

    // If access token expired and this is not already a retry, try refresh
    if (res.status === 401 && !isRetry && !url.includes('/auth/refresh')) {
      // Use the same origin as the failing request to avoid localhost/port mismatches.
      // (Hardcoding this breaks refresh when API_BASE_URL differs.)
      const refreshUrl = new URL(url).origin + "/auth/refresh";

      let refreshRes: Response | null = null;
      try {
        refreshRes = await fetch(refreshUrl, {
          method: "POST",
          credentials: "include",
        });
      } catch (refreshError) {
        // If refresh fails due to network/CORS, fall back to the original 401 response.
        // This prevents "Failed to fetch" from masking the real auth failure.
        return res;
      }

      // If refresh successful, retry original request
      if (refreshRes?.ok) {
        return fetchapi(url, options, true); // Mark as retry
      } else {
        // Refresh failed, return original failed response
        return res;
      }
    }

    return res;
  } catch (error) {
    console.error("fetchapi error:", error);
    throw error;
  }
};