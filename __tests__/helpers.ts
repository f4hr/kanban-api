/* eslint-disable import/first */
require('dotenv').config();

import fastify from 'fastify';

import type { FastifyInstance } from 'fastify';

import { app as registerPlugins } from '../src/app';
import { DatabaseSeeder } from '../src/seeders/DatabaseSeeder';

export async function build(opts = {}) {
  const app = fastify(opts);
  await registerPlugins(app, opts);

  app.addHook('onClose', async () => {
    app.log.info('Server closed');
  });

  await app
    .listen({ port: 3000 })
    .then((address) => app.log.info(`Server started at ${address}`))
    .catch((err) => {
      app.log.error(err);
      process.exit(1);
    });

  return app;
}

export async function initDatabase(app: FastifyInstance) {
  const { orm } = app.db;
  orm.config.set('dbName', 'kanban');
  orm.config.getLogger().setDebugMode(false);
  await orm.config.getDriver().reconnect();
  const seeder = orm.getSeeder();

  await orm.getSchemaGenerator().clearDatabase();
  await orm.getSchemaGenerator().refreshDatabase();

  await seeder.seed(DatabaseSeeder);
}

export function getAuthHeader(token: string) {
  return { Authorization: `Bearer ${token}` };
}
