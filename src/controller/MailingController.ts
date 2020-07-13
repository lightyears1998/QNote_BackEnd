import nodemailer from "nodemailer";
import { logger } from "..";
import { StaticController } from "./base";


export class MailingController extends StaticController {
  private transporter: nodemailer.Transporter

  public init(): void {
    if (String(process.env.MAIL_ENABLE).toLowerCase() === "true") {
      this.transporter = nodemailer.createTransport({
        host:   process.env.MAIL_HOST,
        port:   Number(process.env.MAIL_PORT),
        secure: Number(process.env.MAIL_PORT) === 465,
        auth:   {
          user: process.env.MAIL_USERNAME,
          pass: process.env.MAIL_PASSWORD
        }
      });
    }
  }

  public async sendMail(to: string, subject: string, htmlBody: string): Promise<void> {
    if (!this.transporter) {
      return;
    }

    try {
      const info = await this.transporter.sendMail({
        from:    process.env.MAIL_FROM,
        to:      to,
        subject: subject,
        html:    htmlBody
      });
      logger.info("邮件已发送。");
      logger.verbose(info);
    } catch (err) {
      logger.error(err);
    }
  }
}


export const mailingController = new MailingController();
