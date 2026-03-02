import { buildVexuraEmailTemplate, VexuraEmailTemplateInput } from "@/lib/email/template";

type SendVexuraEmailInput = VexuraEmailTemplateInput & {
  to: string;
  subject: string;
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

  const html = buildVexuraEmailTemplate(input);

  return transporter.sendMail({
    from: `"Vexura" <${user}>`,
    to: input.to,
    subject: input.subject,
    html,
  });
}
