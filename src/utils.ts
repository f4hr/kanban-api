import { ObjectId as ObjId } from '@mikro-orm/mongodb';

export type ObjectId = ReturnType<typeof genObjectID>;

export const genObjectID = (id?: string) => new ObjId(id);
