export type VexuraEmailTemplateInput = {
  title: string;
  bodyText: string;
  buttonText: string;
  buttonLink: string;
  previewText?: string;
};

export type VexuraAssetPreviewTemplateInput = VexuraEmailTemplateInput & {
  assetImageUrl: string;
  assetImageAlt?: string;
  assetCaption?: string;
};

export type VexuraMarketingTemplateInput = VexuraEmailTemplateInput & {
  eyebrow?: string;
  secondaryText?: string;
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderShell(content: string, previewText: string): string {
  const safePreviewText = escapeHtml(previewText);

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
            ${content}
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

export function buildVexuraMinimalTransactionalTemplate({
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

  const content = `<tr>
    <td style="padding-bottom:16px;">
      <h2 style="color:#ffffff; font-size:18px; margin:0; font-weight:600; line-height:1.3;">${safeTitle}</h2>
    </td>
  </tr>
  <tr>
    <td style="padding-bottom:24px;">
      <p style="color:#b8c0cc; font-size:14px; line-height:1.6; margin:0;">${safeBody}</p>
    </td>
  </tr>
  <tr>
    <td align="left" style="padding-bottom:28px;">
      <a href="${safeButtonLink}" style="display:inline-block; padding:11px 22px; font-size:14px; font-weight:bold; text-decoration:none; color:#ffffff; border-radius:6px; background:#1f2937; border:1px solid #2d3748;">${safeButtonText}</a>
    </td>
  </tr>`;

  return renderShell(content, previewText || title);
}

export function buildVexuraAssetPreviewTemplate({
  title,
  bodyText,
  buttonText,
  buttonLink,
  previewText,
  assetImageUrl,
  assetImageAlt,
  assetCaption,
}: VexuraAssetPreviewTemplateInput): string {
  const safeTitle = escapeHtml(title);
  const safeBody = escapeHtml(bodyText);
  const safeButtonText = escapeHtml(buttonText);
  const safeButtonLink = escapeHtml(buttonLink);
  const safeAssetImageUrl = escapeHtml(assetImageUrl);
  const safeAssetImageAlt = escapeHtml(assetImageAlt || "Asset preview");
  const safeAssetCaption = assetCaption ? escapeHtml(assetCaption) : "";

  const captionBlock = safeAssetCaption
    ? `<tr><td style="padding-top:10px; padding-bottom:26px;"><p style="margin:0; font-size:12px; color:#94a3b8; line-height:1.5;">${safeAssetCaption}</p></td></tr>`
    : `<tr><td style="padding-bottom:26px;"></td></tr>`;

  const content = `<tr>
    <td style="padding-bottom:18px;">
      <h2 style="color:#ffffff; font-size:20px; margin:0; font-weight:600; line-height:1.3;">${safeTitle}</h2>
    </td>
  </tr>
  <tr>
    <td style="padding-bottom:22px;">
      <p style="color:#b8c0cc; font-size:14px; line-height:1.6; margin:0;">${safeBody}</p>
    </td>
  </tr>
  <tr>
    <td style="padding-bottom:0;">
      <img src="${safeAssetImageUrl}" alt="${safeAssetImageAlt}" width="520" style="display:block; width:100%; max-width:520px; border-radius:10px; border:1px solid #232834;" />
    </td>
  </tr>
  ${captionBlock}
  <tr>
    <td align="center" style="padding-bottom:30px;">
      <a href="${safeButtonLink}" style="display:inline-block; padding:12px 28px; font-size:14px; font-weight:bold; text-decoration:none; color:#ffffff; border-radius:6px; background:#00c6ff; background-image:linear-gradient(90deg,#00c6ff,#7f5af0);">${safeButtonText}</a>
    </td>
  </tr>`;

  return renderShell(content, previewText || title);
}

export function buildVexuraMarketingTemplate({
  title,
  bodyText,
  buttonText,
  buttonLink,
  previewText,
  eyebrow,
  secondaryText,
}: VexuraMarketingTemplateInput): string {
  const safeTitle = escapeHtml(title);
  const safeBody = escapeHtml(bodyText);
  const safeButtonText = escapeHtml(buttonText);
  const safeButtonLink = escapeHtml(buttonLink);
  const safeEyebrow = eyebrow ? escapeHtml(eyebrow) : "NEW DROP";
  const safeSecondaryText = secondaryText ? escapeHtml(secondaryText) : "";

  const secondaryBlock = safeSecondaryText
    ? `<tr><td style="padding-top:14px; padding-bottom:0;"><p style="color:#8b93a5; font-size:13px; line-height:1.6; margin:0;">${safeSecondaryText}</p></td></tr>`
    : "";

  const content = `<tr>
    <td style="padding-bottom:10px;">
      <p style="margin:0; color:#7dd3fc; font-size:11px; font-weight:700; letter-spacing:1.2px;">${safeEyebrow}</p>
    </td>
  </tr>
  <tr>
    <td style="padding-bottom:16px;">
      <h2 style="color:#ffffff; font-size:24px; margin:0; font-weight:700; line-height:1.25;">${safeTitle}</h2>
    </td>
  </tr>
  <tr>
    <td style="padding-bottom:24px;">
      <p style="color:#c3cad5; font-size:15px; line-height:1.7; margin:0;">${safeBody}</p>
    </td>
  </tr>
  <tr>
    <td align="left" style="padding-bottom:6px;">
      <a href="${safeButtonLink}" style="display:inline-block; padding:12px 28px; font-size:14px; font-weight:bold; text-decoration:none; color:#ffffff; border-radius:6px; background:#00c6ff; background-image:linear-gradient(90deg,#00c6ff,#7f5af0);">${safeButtonText}</a>
    </td>
  </tr>
  ${secondaryBlock}`;

  return renderShell(content, previewText || title);
}

export function buildVexuraPlainTextTemplate({
  title,
  bodyText,
  buttonText,
  buttonLink,
}: VexuraEmailTemplateInput): string {
  return [
    "VEXURA",
    "",
    title,
    "",
    bodyText,
    "",
    `${buttonText}: ${buttonLink}`,
    "",
    "© 2026 Vexura.io — All rights reserved",
  ].join("\n");
}

export const buildVexuraEmailTemplate = buildVexuraMarketingTemplate;
