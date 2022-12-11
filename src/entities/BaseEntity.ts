import { OptionalProps, PrimaryKey, Property, SerializedPrimaryKey } from '@mikro-orm/core';
import { ObjectId } from '@mikro-orm/mongodb';

export abstract class BaseEntity {
  [OptionalProps]?: 'createdAt' | 'updatedAt';

  @PrimaryKey()
  _id!: ObjectId;

  @SerializedPrimaryKey()
  id!: string;

  @Property()
  createdAt?: string = new Date().toISOString();

  @Property({ onUpdate: () => new Date().toISOString() })
  updatedAt?: string = new Date().toISOString();
}
