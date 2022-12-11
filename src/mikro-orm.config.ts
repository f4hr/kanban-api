import { Options } from '@mikro-orm/core';

import { BaseEntity, User, Board, BoardDetails, List, Card } from './entities';

const IS_DEV = process.env.NODE_ENV === 'development';
const { DATABASE_URL, DB_NAME, DB_USER, DB_PASSWORD } = process.env;

const options: Options = {
  type: 'mongo',
  entities: [User, Board, BoardDetails, List, Card, BaseEntity],
  clientUrl: DATABASE_URL,
  dbName: DB_NAME,
  user: DB_USER,
  password: DB_PASSWORD,
  debug: IS_DEV,
  seeder: {
    path: './dist/seeders',
    pathTs: './src/seeders',
    defaultSeeder: 'DatabaseSeeder',
    glob: '!(*.d).{js,ts}',
    emit: 'ts',
    fileName: (className: string) => className,
  },
};

export default options;
