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
  noteNum: number

  @Column()
  currentNoteNum: number

  @Column()
  giveUpNoteNum: number

  @Column()
  completeNoteNum: number
}
