import nodemailer from "nodemailer";
import { logger } from "..";
import { StaticController } from "./base";


export class MailingController extends StaticController {
  private transporter: nodemailer.Transporter

  public init(): void {
    if (Boolean(process.env.MAIL_ENABLE)) {
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
      logger.info(`邮件已发送，详情：${info}`);
    } catch (err) {
      logger.error(err);
    }
  }
}
