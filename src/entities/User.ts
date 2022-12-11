import { Entity, Collection, ManyToMany, Property } from '@mikro-orm/core';

import { BaseEntity } from './BaseEntity';
import { Board } from './Board';

@Entity()
export class User extends BaseEntity {
  @Property()
  name: string;

  @Property({ unique: true })
  email: string;

  @Property({ hidden: true })
  password: string;

  @ManyToMany(() => Board, 'users', { owner: true })
  boards = new Collection<Board>(this);

  constructor(name: string, email: string, password: string) {
    super();
    this.name = name;
    this.email = email;
    this.password = password;
  }
}
