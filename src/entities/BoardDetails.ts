import { Embedded, Entity, Property } from '@mikro-orm/core';
import { ObjectId } from '@mikro-orm/mongodb';

import { BaseEntity } from './BaseEntity';
import { List } from './List';
import { Card } from './Card';

@Entity()
export class BoardDetails extends BaseEntity {
  @Property()
  boardId: ObjectId;

  @Property({ default: [] })
  listIds: ObjectId[] = [];

  @Embedded(() => List, { array: true })
  lists: List[] = [];

  @Embedded(() => Card, { array: true })
  cards: Card[] = [];

  constructor(boardId: ObjectId) {
    super();
    this.boardId = boardId;
  }
}
