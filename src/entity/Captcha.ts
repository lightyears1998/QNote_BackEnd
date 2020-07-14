import captchaFactory from "svg-captcha";
import { Entity, ObjectIdColumn, Column } from "typeorm";
import { ObjectID } from "mongodb";


@Entity()
export class Captcha {
  @ObjectIdColumn()
  id: ObjectID

  /**
   * The image of this captcha
   */
  data?: string

  /**
   * The answer to this captcha
   */
  @Column()
  text: string

  /** 5 minutes */
  private millisecondsToExpire = 1000 * 60 * 5;

  @Column()
  validUntil: Date

  public constructor() {
    const captcha = captchaFactory.create();
    this.data = captcha.data;
    this.text = captcha.text;
    this.validUntil = new Date(new Date().getTime() + this.millisecondsToExpire);
  }
}
