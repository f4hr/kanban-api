import { join } from 'path';
import AutoLoad from '@fastify/autoload';

import type { FastifyPluginAsync } from 'fastify';
import type { AutoloadPluginOptions } from '@fastify/autoload';

export type AppOptions = {} & Partial<AutoloadPluginOptions>;

export const app: FastifyPluginAsync<AppOptions> = async (fastify, opts): Promise<void> => {
  fastify.register(AutoLoad, {
    dir: join(__dirname, 'plugins'),
    options: opts,
  });

  fastify.register(AutoLoad, {
    dir: join(__dirname, 'routes'),
    options: opts,
  });
};

export default app;
