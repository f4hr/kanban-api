import { Entity, Collection, ManyToMany, Property } from '@mikro-orm/core';
import { ObjectId } from '@mikro-orm/mongodb';

import { BaseEntity } from './BaseEntity';
import { User } from './User';

@Entity()
export class Board extends BaseEntity {
  @Property()
  name: string;

  @Property()
  ownerId: ObjectId;

  @ManyToMany({ entity: () => User, mappedBy: 'boards' })
  users = new Collection<User>(this);

  constructor(name: string, ownerId: ObjectId) {
    super();
    this.name = name;
    this.ownerId = ownerId;
  }
}
