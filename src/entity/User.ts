import { Entity, ObjectIdColumn, Column, Unique } from "typeorm";
import { ObjectID } from "mongodb";


@Entity()
@Unique("unique username", ["username"])
@Unique("unique email", ["email"])
@Unique("unique displayEmail", ["displayEmail"])
export class User {
  @ObjectIdColumn()
  id: ObjectID

  @Column()
  username: string

  @Column()
  nickname: string

  /**
   * `email` is always lowercase, while `displayEmail` can be mixed case
   */
  @Column({
    comment: "`email` is always lowercase, while `displayEmail` can be mixed case"
  })
  email: string

  /**
   * `displayEmail` can be mixed case, see also comments of `email`
   */
  @Column({
    comment: "`displayEmail` can be mixed case, see also comments of `email`"
  })
  displayEmail: string

  @Column()
  password: string

  @Column({
    nullable: true
  })
  avatar?: string

  @Column({
    nullable: true
  })
  avatarUrl: string

  @Column()
  noteNum = 0

  @Column()
  currentNoteNum = 0

  @Column()
  giveUpNoteNum = 0

  @Column()
  completeNoteNum = 0

  constructor(username?: string, password?: string) {
    this.username = username;
    this.password = password;
  }

  public desensitization(): void {
    delete this.password;
    this.email = this.displayEmail;
    delete this.displayEmail;
  }
}
