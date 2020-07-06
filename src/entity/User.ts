import { Entity, ObjectIdColumn, ObjectID, Column } from "typeorm";


@Entity({ name: "users" })
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
