import { Entity, ObjectIdColumn, Column, Unique } from "typeorm";
import { ObjectID } from "mongodb";


@Entity({ name: "users" })
@Unique("unique username", ["username"])
@Unique("unique email", ["email"])
@Unique("unique displayEmail", ["displayEmail"])
export class User {
  @ObjectIdColumn()
  id: ObjectID

  @Column()
  username: string

  /**
   * `email` is always lowercase, whlie `displayEmail` can be mixed case
   */
  @Column({
    comment: "`email` is always lowercase, whlie `displayEmail` can be mixed case"
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
}
