export const verificationEmailTemplate = (
  username: string,
  otp: number
): string => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verify Your Email</title>

      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background-color: #f4f7f6;
          margin: 0;
          padding: 0;
          color: #333;
        }

        .container {
          max-width: 600px;
          margin: 40px auto;
          background-color: #ffffff;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }

        .header {
          background-color: #4f46e5;
          padding: 30px;
          text-align: center;
          color: #ffffff;
        }

        .header h1 {
          margin: 0;
          font-size: 24px;
          font-weight: 600;
        }

        .content {
          padding: 40px;
          line-height: 1.6;
        }

        .content p {
          margin-bottom: 20px;
        }

        .otp-container {
          background-color: #f3f4f6;
          padding: 20px;
          border-radius: 6px;
          text-align: center;
          margin: 30px 0;
        }

        .otp-code {
          font-size: 32px;
          font-weight: 700;
          letter-spacing: 5px;
          color: #4f46e5;
        }

        .footer {
          padding: 20px;
          text-align: center;
          font-size: 12px;
          color: #6b7280;
          background-color: #f9fafb;
        }

        .support-link {
          color: #4f46e5;
          text-decoration: none;
        }

        /* DARK MODE SUPPORT */
        @media (prefers-color-scheme: dark) {
          body {
            background-color: #0f172a;
            color: #e5e7eb;
          }

          .container {
            background-color: #1f2933;
            box-shadow: none;
          }

          .header {
            background-color: #6366f1;
            color: #ffffff;
          }

          .content {
            color: #e5e7eb;
          }

          .otp-container {
            background-color: #374151;
          }

          .otp-code {
            color: #818cf8;
          }

          .footer {
            background-color: #111827;
            color: #9ca3af;
          }

          .support-link {
            color: #818cf8;
          }
        }
      </style>
    </head>

    <body>
      <div class="container">
        <div class="header">
          <h1>Welfare-Scheme Platform</h1>
        </div>

        <div class="content">
          <p>Hello <strong>${username}</strong>,</p>

          <p>
            Welcome to the Welfare-Scheme Platform! To complete your registration 
            and ensure the security of your account, please verify your email 
            address using the code below:
          </p>

          <div class="otp-container">
            <div class="otp-code">${otp}</div>
          </div>

          <p>
            This verification code is valid for a limited time. If you did not 
            create an account with us, please ignore this email.
          </p>

          <p>
            If you have any questions, feel free to contact our 
            <a href="#" class="support-link">Support Team</a>.
          </p>

          <p>
            Best regards,<br>
            The Welfare-Scheme Team
          </p>
        </div>

        <div class="footer">
          &copy; ${new Date().getFullYear()} Welfare-Scheme Platform. All rights reserved.
        </div>
      </div>
    </body>
    </html>
  `;
};