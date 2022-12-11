import fp from 'fastify-plugin';
import { FastifyPluginAsync } from 'fastify';
import { EntityManager, EntityRepository, MikroORM, RequestContext } from '@mikro-orm/core';

import type { FastifyInstance as Fastify } from 'fastify';

import { User, Board, BoardDetails } from '../entities';

interface DB {
  server: Fastify;
  orm: MikroORM;
  em: EntityManager;
  user: EntityRepository<User>;
  board: EntityRepository<Board>;
  boardDetails: EntityRepository<BoardDetails>;
}

declare module 'fastify' {
  interface FastifyInstance {
    db: DB;
  }
}

const db = {} as DB;

const dbClientPlugin: FastifyPluginAsync = fp(async (fastify) => {
  try {
    db.orm = await MikroORM.init();
    db.em = db.orm.em;
    db.user = db.em.getRepository(User);
    db.board = db.em.getRepository(Board);
    db.boardDetails = db.em.getRepository(BoardDetails);

    fastify.decorate('db', db);

    fastify.addHook('onRequest', (_server, _rep, done) => {
      RequestContext.create(db.em, done);
    });

    fastify.addHook('onClose', async () => {
      await db.orm.close();
    });
  } catch (err) {
    console.log(err);
  }
});

export default dbClientPlugin;
