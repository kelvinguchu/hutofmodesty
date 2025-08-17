export function generateForgotPasswordEmailHTML(args: any): string {
  const { req, token, user } = args || {};
  const resetPasswordURL = `${process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000"}/reset-password?token=${token}`;

  return `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Your Password - Hut of Modesty</title>
    <style>
      @media only screen and (max-width: 600px) {
        .email-container { width: 100% !important; margin: 0 !important; }
        .email-content { padding: 15px !important; }
        .header-padding { padding: 20px 15px !important; }
        .logo-container { padding: 10px 15px !important; }
        .logo-img { width: 140px !important; max-width: 140px !important; }
        .main-title { font-size: 24px !important; }
        .section-title { font-size: 18px !important; }
        .button-link {
          padding: 12px 20px !important;
          font-size: 14px !important;
          white-space: nowrap !important;
          display: inline-block !important;
          text-align: center !important;
        }
      }
    </style>
  </head>
  <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
    <div class="email-container" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
      
      <!-- Header with Logo -->
      <div class="header-padding" style="padding: 30px; background-color: #f8f9fa; text-align: center; border-bottom: 3px solid #6b3fae;">
        <div class="logo-container" style="background-color: #ffffff; display: inline-block; padding: 15px 25px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <img class="logo-img" src="https://hwn6k89767.ufs.sh/f/k0Qi0uf9dUswVZpzzikaMTreiOA9qxR5j0HCbX2aKGJDgfuy" width="180" height="auto" alt="Hut of Modesty" style="display: block; max-width: 180px; height: auto;" />
        </div>
      </div>

      <!-- Main Content -->
      <div class="email-content" style="padding: 30px;">
        
        <!-- Greeting -->
        <div style="margin-bottom: 25px;">
          <h1 class="main-title" style="color: #1f2937; font-size: 28px; font-weight: 600; margin: 0 0 10px; line-height: 1.2;">
            Reset Your Password
          </h1>
          <p style="color: #6b7280; font-size: 16px; margin: 0; line-height: 1.5;">
            Hello ${user.firstName || user.email},
          </p>
        </div>

        <!-- Reset Instructions -->
        <div style="margin-bottom: 30px;">
          <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 15px;">
            We received a request to reset your password for your Hut of Modesty account. If you didn't make this request, you can safely ignore this email.
          </p>
          <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 15px;">
            To reset your password, click the button below. This link will expire in 2 hours for security reasons.
          </p>
        </div>

        <!-- Reset Button -->
        <div style="text-align: center; margin: 30px 0;">
          <a class="button-link" href="${resetPasswordURL}" style="background-color: #6b3fae; border-radius: 8px; color: #ffffff; font-size: 16px; font-weight: bold; text-decoration: none; text-align: center; display: inline-block; padding: 14px 28px; margin: 0; white-space: nowrap; transition: background-color 0.3s ease;">
            Reset My Password
          </a>
        </div>

        <!-- Alternative Link -->
        <div style="margin: 25px 0; padding: 20px; background-color: #f9fafb; border-radius: 8px; border-left: 4px solid #6b3fae;">
          <p style="color: #374151; font-size: 14px; margin: 0 0 10px; font-weight: 600;">
            Having trouble with the button?
          </p>
          <p style="color: #6b7280; font-size: 14px; margin: 0; line-height: 1.5; word-break: break-all;">
            Copy and paste this link into your browser: <br>
            <a href="${resetPasswordURL}" style="color: #6b3fae; text-decoration: underline;">${resetPasswordURL}</a>
          </p>
        </div>

        <!-- Security Notice -->
        <div style="margin-top: 30px; padding: 15px; background-color: #fef3c7; border-radius: 8px; border-left: 4px solid #f59e0b;">
          <p style="color: #92400e; font-size: 14px; margin: 0; line-height: 1.5;">
            <strong>Security tip:</strong> Never share this link with anyone. If you didn't request this password reset, please contact our support team immediately.
          </p>
        </div>

      </div>

      <!-- Footer -->
      <div style="border-top: 1px solid #e6ebf1; padding: 20px 30px; text-align: center; background-color: #f8fafc;">
        <div style="color: #6b7280; font-size: 12px; line-height: 1.5; margin: 0 0 10px;">
          Questions? Contact us at 
          <a href="mailto:info@hutofmodesty.com" style="color: #6b3fae; text-decoration: underline;">
            info@hutofmodesty.com
          </a>
          or call us at +254748355387.
        </div>
        
        <div style="color: #6b7280; font-size: 12px; line-height: 1.5; margin: 0;">
          © ${new Date().getFullYear()} Hut of Modesty. All rights reserved.
        </div>
      </div>
    </div>
  </body>
</html>
  `.trim();
}

export function generateForgotPasswordEmailSubject(args: any): string {
  const { req, user } = args || {};
  return `Reset Your Password - Hut of Modesty`;
}
