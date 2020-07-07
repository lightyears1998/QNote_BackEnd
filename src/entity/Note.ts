import { Entity, ObjectIdColumn, ObjectID, Column, Unique } from "typeorm";


@Entity({ name: "notes" })
@Unique(["username", "noteID"])
export class Note {
  @ObjectIdColumn()
  id: ObjectID

  @Column()
  username: string

  @Column()
  noteID: number

  @Column()
  noteContent: string

  @Column()
  done = false
}