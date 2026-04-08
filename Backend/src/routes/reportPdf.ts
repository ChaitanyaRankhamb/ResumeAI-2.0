import express, { Response } from "express";
import puppeteer, { Browser, Page } from "puppeteer";
import { authMiddleware, AuthRequest } from "../middlewares/auth.middleware";
import { AppError } from "../Error/appError";
import { userRepository } from "../database/mongo/user/userModelRepo";
import { fileRepository } from "../database/mongo/files/fileModelRepo";

const router = express.Router();

// GLOBAL browser (singleton)
let browser: Browser | null = null;

// Reusable browser instance
async function getBrowser(): Promise<Browser> {
  if (!browser || !browser.connected) {
    console.log(" Launching new browser...");
    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
  }
  return browser;
}

// Close browser on server shutdown (ONLY ONCE)
process.on("SIGINT", async () => {
  if (browser) {
    await browser.close();
    console.log("Browser closed on shutdown");
  }
  process.exit();
});

router.get(
  "/download/:fileId",
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    let page: Page | null = null;

    try {
      const { fileId } = req.params as { fileId: string };

      if (!fileId) {
        throw new AppError("fileId is required", 400);
      }

      const userId = req.userId;
      if (!userId) {
        throw new AppError("User is Unauthorized", 401);
      }

      // check user
      const user = await userRepository.findUserById(userId);
      if (!user) {
        throw new AppError("User not found", 404);
      }

      // check file
      const file = await fileRepository.findFileById(fileId);
      if (!file) {
        throw new AppError("File not found", 404);
      }

      // check file belongs to user
      if (file.userId.toString() !== userId) {
        throw new AppError("File not found", 404);
      }

      // get reused browser
      const browserInstance = await getBrowser();

      // create new page per request
      page = await browserInstance.newPage();

      // set auth cookie
      const accessToken = req.cookies?.accessToken;
      if (accessToken) {
        console.log(" Puppeteer PDF: setting accessToken cookie");
        await page.setCookie({
          name: "accessToken",
          value: accessToken,
          url: "http://localhost:3000",
        });
      } else {
        console.warn("Puppeteer PDF: no access token cookie available");
      }

      const url = `http://localhost:3000/dashboard/report?fileId=${fileId}`;

      await page.goto(url, {
        waitUntil: "networkidle0",
        timeout: 60000,
      });

      // minimal wait
      await page.waitForSelector("#report-container", { timeout: 30000 });

      // print mode
      await page.emulateMediaType("print");

      // disable animations
      await page.addStyleTag({
        content: `* { animation: none !important; transition: none !important; }`,
      });

      const pdfBuffer = await page.pdf({
        format: "A4",
        printBackground: true,
        preferCSSPageSize: true,
        margin: {
          top: "20px",
          bottom: "20px",
          left: "20px",
          right: "20px",
        },
      });

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=resume-report-${fileId}.pdf`,
      );

      return res.status(200).send(pdfBuffer);
    } catch (error) {
      console.error("Puppeteer PDF error:", error);
      console.error(
        "Error message:",
        error instanceof Error ? error.message : "Unknown error",
      );
      console.error(
        "Error stack:",
        error instanceof Error ? error.stack : "No stack trace",
      );

      return res.status(500).json({
        message: "Failed to generate PDF",
      });
    } finally {
      // ONLY close page (NOT browser)
      if (page) {
        try {
          await page.close();
        } catch (closeError) {
          console.warn("Warning: failed to close Puppeteer page", closeError);
        }
      }
    }
  },
);

export default router;