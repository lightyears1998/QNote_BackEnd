import { Entity, ObjectIdColumn, ObjectID, Column, Unique } from "typeorm";


@Entity()
@Unique("unique title", ["title"])
export class Memorial {
  @ObjectIdColumn()
  id: ObjectID

  @Column()
  username: string

  @Column()
  title: string

  @Column()
  date: string
}
