import randomstring from "randomstring";
import { getManager } from "typeorm";
import { EmailVerificationCode } from "../entity";
import { app, logger } from "..";
import { Mail, StaticController } from "./base";


/**
 * 验证码邮件
 */
class VerificationMail extends Mail {
  public readonly to: string;
  public readonly subject = "轻笔记 QNote 注册验证邮件"
  public readonly htmlBody: string;

  private buildBody(code: string) {
    return `<p>感谢您注册轻笔记 QNote！</p>
    <p>您的验证码是 <code>${code}</code>，请在 24 小时内完成注册。</p>
    `;
  }

  public constructor(to: string, code: string) {
    super();
    this.to = to;
    this.htmlBody = this.buildBody(code);
  }
}


export class EmailVerificationController extends StaticController {
  /**
   * Default to 24 hours valid span.
   */
  private validSpanInMilliseconds = 1000 * 60 * 60 * 24;

  public init(): void {
    return;
  }

  public async prepareVerificationCode(email: string): Promise<void> {
    const db = getManager();
    const code = randomstring.generate({ length: 4, readable: true, capitalization: "uppercase" });
    const mail = new VerificationMail(email, code);

    const emailVerificationCode = new EmailVerificationCode();
    emailVerificationCode.code = code;
    emailVerificationCode.email = email.toLowerCase();
    emailVerificationCode.validUntil = new Date(new Date().getTime() + this.validSpanInMilliseconds);

    await db.save(emailVerificationCode);
    await app.sendMail(mail);
  }

  public async verifyVerificationCode(email: string, code: string): Promise<boolean> {
    const db = getManager();
    email = email.toLowerCase();

    let ok = false;
    const codes = await db.find(EmailVerificationCode, { email, code });

    for (const code of codes) {
      if (code.isValid()) {
        ok = true;
        db.remove(code);
        break;
      }
    }

    return ok;
  }

  public async recycleVerificationCodes(): Promise<void> {
    const profiler = logger.startTimer();
    const db = getManager();

    const now = new Date();
    const expiredCodes = await db.find(EmailVerificationCode, {
      where: {
        validUntil: { $lt: now }
      }
    });

    let recycledCount = 0;
    for (const expiredCode of expiredCodes) {
      try {
        await db.remove(expiredCode);
      } catch {
        continue;
      }
      recycledCount++;
    }

    profiler.done({
      label:   EmailVerificationController.name,
      message: `已清理 ${recycledCount} 条过期验证码。`
    });
  }
}


export const emailVerificationController = new EmailVerificationController();
