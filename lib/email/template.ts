export type VexuraEmailTemplateInput = {
  title: string;
  bodyText: string;
  buttonText: string;
  buttonLink: string;
  previewText?: string;
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function buildVexuraEmailTemplate({
  title,
  bodyText,
  buttonText,
  buttonLink,
  previewText,
}: VexuraEmailTemplateInput): string {
  const safeTitle = escapeHtml(title);
  const safeBody = escapeHtml(bodyText);
  const safeButtonText = escapeHtml(buttonText);
  const safeButtonLink = escapeHtml(buttonLink);
  const safePreviewText = escapeHtml(previewText || title);

  return `<!DOCTYPE html>
<html>
  <body style="margin:0; padding:0; background-color:#0d0f14; font-family:Arial, Helvetica, sans-serif;">
    <div style="display:none; max-height:0; overflow:hidden; opacity:0; mso-hide:all;">
      ${safePreviewText}
    </div>
    <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0; background-color:#0d0f14;">
      <tr>
        <td align="center" style="padding:0 16px;">
          <table width="600" cellpadding="0" cellspacing="0" style="width:100%; max-width:600px; background-color:#141821; border-radius:12px; padding:40px;">
            <tr>
              <td align="center" style="padding-bottom:30px;">
                <h1 style="color:#ffffff; margin:0; font-size:22px; letter-spacing:1px; font-weight:700;">
                  VEXURA
                </h1>
              </td>
            </tr>
            <tr>
              <td style="padding-bottom:20px;">
                <h2 style="color:#ffffff; font-size:20px; margin:0; font-weight:600; line-height:1.3;">
                  ${safeTitle}
                </h2>
              </td>
            </tr>
            <tr>
              <td style="padding-bottom:30px;">
                <p style="color:#b8c0cc; font-size:14px; line-height:1.6; margin:0;">
                  ${safeBody}
                </p>
              </td>
            </tr>
            <tr>
              <td align="center" style="padding-bottom:30px;">
                <a href="${safeButtonLink}" style="display:inline-block; padding:12px 28px; font-size:14px; font-weight:bold; text-decoration:none; color:#ffffff; border-radius:6px; background:#00c6ff; background-image:linear-gradient(90deg,#00c6ff,#7f5af0);">
                  ${safeButtonText}
                </a>
              </td>
            </tr>
            <tr>
              <td style="border-top:1px solid #232834; padding-top:20px;">
                <p style="color:#6b7280; font-size:12px; margin:0; text-align:center;">
                  © 2026 Vexura.io — All rights reserved
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}
