import { Entity, ObjectIdColumn, Column, Unique } from "typeorm";
import { ObjectID } from "mongodb";


@Entity({ name: "users" })
@Unique(["username"])
export class User {
  @ObjectIdColumn()
  id: ObjectID

  @Column()
  username: string

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
