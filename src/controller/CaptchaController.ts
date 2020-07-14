import { getManager } from "typeorm";
import { Captcha } from "../entity";
import { StaticController } from "./base";


export class CaptchaController extends StaticController {
  public init(): void {
    return;
  }

  public async createCaptcha(): Promise<Captcha> {
    const db = getManager();

    const captcha = new Captcha();
    captcha.id = (await db.save(captcha)).id;

    return captcha;
  }

  public async verifyCaptcha(id: string, answer: string): Promise<boolean> {
    const db = getManager();
    const captcha = await db.findOne(Captcha, id);

    if (!captcha) {
      return false;
    }
    await db.remove(captcha);

    return captcha.validUntil >= new Date() && captcha.text.toLowerCase() === answer.toLowerCase();
  }
}


export const captchaController = new CaptchaController();
