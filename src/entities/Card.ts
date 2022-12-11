import { Embeddable, Property } from '@mikro-orm/core';
import { ObjectId } from '@mikro-orm/mongodb';

@Embeddable()
export class Card {
  @Property()
  _id!: ObjectId;

  @Property()
  id!: string;

  @Property()
  name: string;

  @Property()
  boardId: ObjectId;

  @Property()
  listId: ObjectId;

  constructor(name: string, boardId: ObjectId, listId: ObjectId) {
    this._id = new ObjectId();
    this.id = this._id.toHexString();
    this.name = name;
    this.boardId = boardId;
    this.listId = listId;
  }
}
