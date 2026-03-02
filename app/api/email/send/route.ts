import { NextResponse } from "next/server";
import { sendVexuraEmail } from "@/lib/email/mailer";

export const runtime = "nodejs";

type SendEmailRequest = {
  to: string;
  subject?: string;
  title?: string;
  bodyText?: string;
  buttonText?: string;
  buttonLink?: string;
  previewText?: string;
  variant?: "minimal" | "asset-preview" | "marketing";
  assetImageUrl?: string;
  assetImageAlt?: string;
  assetCaption?: string;
  eyebrow?: string;
  secondaryText?: string;
};

export async function POST(request: Request) {
  try {
    const body: SendEmailRequest = await request.json();

    if (!body?.to) {
      return NextResponse.json({ error: "Missing required field: to" }, { status: 400 });
    }

    const subject = body.subject || "Welcome to Vexura";

    const result = await sendVexuraEmail({
      to: body.to,
      subject,
      title: body.title || "Your Asset Is Ready",
      bodyText:
        body.bodyText ||
        "Your AI-generated vector asset has been successfully created and is now available in your dashboard.",
      buttonText: body.buttonText || "View Asset",
      buttonLink: body.buttonLink || "https://vexura.io/dashboard",
      previewText: body.previewText,
      variant: body.variant,
      assetImageUrl: body.assetImageUrl,
      assetImageAlt: body.assetImageAlt,
      assetCaption: body.assetCaption,
      eyebrow: body.eyebrow,
      secondaryText: body.secondaryText,
    });

    return NextResponse.json({
      success: true,
      messageId: result.messageId,
      accepted: result.accepted,
      rejected: result.rejected,
    });
  } catch (error: any) {
    console.error("Email send error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Failed to send email",
      },
      { status: 500 }
    );
  }
}
