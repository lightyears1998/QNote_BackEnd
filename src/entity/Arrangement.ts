import { Entity, ObjectIdColumn, ObjectID, Column } from "typeorm";


@Entity()
export class Arrangement {
  @ObjectIdColumn()
  id: ObjectID

  @Column()
  username: string

  @Column()
  timePoint: string

  @Column()
  title: string

  @Column()
  note: string
}
