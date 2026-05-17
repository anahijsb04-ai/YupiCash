import nodemailer from "nodemailer";

export type MailAttachment = {
  filename: string;
  content: Buffer;
  contentType?: string;
};

export type SendMailOptions = {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  attachments?: MailAttachment[];
};

export async function sendMail(opts: SendMailOptions) {
  const port = Number(process.env.SMTP_PORT || 465);
  const secure = String(process.env.SMTP_SECURE || "true").toLowerCase() === "true";

  const user = process.env.SMTP_USER!;
  const pass = (process.env.SMTP_PASS || "").replaceAll(" ", "");

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port,
    secure,
    auth: { user, pass },
  });

  await transporter.verify(); // falla aquí si hay problema de SMTP

  return transporter.sendMail({
    from: process.env.SMTP_FROM || user,
    to: opts.to,
    subject: opts.subject,
    text: opts.text,
    html: opts.html,
    attachments: opts.attachments,
  });
}
