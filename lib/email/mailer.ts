import {
  buildVexuraAssetPreviewTemplate,
  buildVexuraMarketingTemplate,
  buildVexuraMinimalTransactionalTemplate,
  buildVexuraPlainTextTemplate,
  VexuraAssetPreviewTemplateInput,
  VexuraEmailTemplateInput,
  VexuraMarketingTemplateInput,
} from "@/lib/email/template";

type VexuraTemplateVariant = "minimal" | "asset-preview" | "marketing";

type SendVexuraEmailInput = VexuraEmailTemplateInput & {
  to: string;
  subject: string;
  variant?: VexuraTemplateVariant;
  assetImageUrl?: string;
  assetImageAlt?: string;
  assetCaption?: string;
  eyebrow?: string;
  secondaryText?: string;
};

type NodeMailerModule = {
  createTransport: (config: any) => {
    sendMail: (message: any) => Promise<any>;
  };
};

function loadNodemailer(): NodeMailerModule {
  try {
    const dynamicRequire = eval("require");
    return dynamicRequire("nodemailer") as NodeMailerModule;
  } catch {
    throw new Error(
      'Nodemailer is not installed. Run "npm install nodemailer" to enable SMTP email sending.'
    );
  }
}

function getSmtpConfig() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || "465");
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !port || !user || !pass) {
    throw new Error("Missing SMTP environment variables. Required: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS.");
  }

  return { host, port, user, pass };
}

function buildHtmlByVariant(input: SendVexuraEmailInput): string {
  const variant = input.variant || "marketing";

  if (variant === "minimal") {
    return buildVexuraMinimalTransactionalTemplate(input);
  }

  if (variant === "asset-preview") {
    if (!input.assetImageUrl) {
      throw new Error("assetImageUrl is required when variant is 'asset-preview'.");
    }

    const payload: VexuraAssetPreviewTemplateInput = {
      ...input,
      assetImageUrl: input.assetImageUrl,
      assetImageAlt: input.assetImageAlt,
      assetCaption: input.assetCaption,
    };

    return buildVexuraAssetPreviewTemplate(payload);
  }

  const marketingPayload: VexuraMarketingTemplateInput = {
    ...input,
    eyebrow: input.eyebrow,
    secondaryText: input.secondaryText,
  };

  return buildVexuraMarketingTemplate(marketingPayload);
}

export async function sendVexuraEmail(input: SendVexuraEmailInput) {
  const { host, port, user, pass } = getSmtpConfig();
  const nodemailer = loadNodemailer();

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
  });

  const html = buildHtmlByVariant(input);
  const text = buildVexuraPlainTextTemplate(input);

  return transporter.sendMail({
    from: `"Vexura" <${user}>`,
    to: input.to,
    subject: input.subject,
    html,
    text,
  });
}
