import { Entity, ObjectIdColumn, ObjectID, Column } from "typeorm";


@Entity({ name: "notes" })
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
