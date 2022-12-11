import fp from 'fastify-plugin';
import fastifyJwt from '@fastify/jwt';

import type { FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify';

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: typeof authenticate;
  }
}

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: { userId: string };
    user: { userId: string };
  }
}

const { JWT_SECRET, JWT_ACCESS_TOKEN_MAX_AGE = '1h' } = process.env;

if (JWT_SECRET == null) {
  throw new Error('JWT_SECRET is not set in environment variables');
}

const authenticate = async (req: FastifyRequest, reply: FastifyReply) => {
  try {
    await req.jwtVerify({ maxAge: JWT_ACCESS_TOKEN_MAX_AGE });
    // await req.jwtVerify({ onlyCookie: true });
  } catch (_err) {
    reply.unauthorized();
  }
};

const jwtPlugin: FastifyPluginAsync = fp(async (fastify) => {
  fastify
    .register(fastifyJwt, {
      secret: JWT_SECRET,
      cookie: {
        cookieName: 'refreshToken',
        signed: false,
      },
      sign: {
        expiresIn: JWT_ACCESS_TOKEN_MAX_AGE,
      },
    })
    .decorate('authenticate', authenticate);
});

export default jwtPlugin;
