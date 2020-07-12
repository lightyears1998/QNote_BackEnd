import { Entity, Column, ObjectIdColumn } from "typeorm";
import { ObjectID } from "mongodb";


@Entity()
export class EmailVerificationCode {
  @ObjectIdColumn()
  id: ObjectID

  @Column()
  email: string

  @Column()
  code: string

  @Column()
  validUntil: Date

  public isValid(): boolean {
    return this.validUntil && new Date() < this.validUntil;
  }
}
