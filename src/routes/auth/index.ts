import { FromSchema } from 'json-schema-to-ts';
import bcrypt from 'bcrypt';

import type { FastifyPluginAsync } from 'fastify';

const IS_DEV = process.env.NODE_ENV === 'development';
const HOST = process.env.HOST || 'localhost';

const ACCESS_TOKEN_MAX_AGE = process.env.JWT_ACCESS_TOKEN_MAX_AGE || '1h';
const REFRESH_TOKEN_MAX_AGE = process.env.JWT_REFRESH_TOKEN_MAX_AGE || '1w';

const auth: FastifyPluginAsync = async (server): Promise<void> => {
  const createAuthBody = {
    description: 'Payload for user authentication',
    type: 'object',
    required: ['email', 'password'],
    properties: {
      email: { type: 'string' },
      password: { type: 'string' },
    },
  } as const;

  server.post<{ Body: FromSchema<typeof createAuthBody> }>(
    '/login',
    {
      schema: {
        description: 'This is an authentication endpoint',
        tags: ['auth'],
        body: createAuthBody,
        response: {
          201: {
            description: 'Success Response',
            type: 'object',
            properties: {
              userId: { type: 'string' },
              token: { type: 'string' },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const { email, password } = request.body;

      if (email === '' || password === '') {
        reply.badRequest();
        return;
      }

      const user = await server.db.user.findOne({ email });
      if (user == null) {
        reply.badRequest('Wrong email or password');
        return;
      }

      const isPasswordsMatch = await bcrypt.compare(password, user.password);

      if (!isPasswordsMatch) {
        reply.badRequest('Wrong email or password');
        return;
      }

      const token = await reply.jwtSign({ userId: user.id }, { expiresIn: ACCESS_TOKEN_MAX_AGE });

      const refreshToken = await reply.jwtSign(
        { userId: user.id },
        { expiresIn: REFRESH_TOKEN_MAX_AGE },
      );

      reply
        .setCookie('refreshToken', refreshToken, {
          domain: HOST,
          path: '/',
          secure: !IS_DEV,
          httpOnly: true,
          sameSite: true,
        })
        .code(201)
        .send({ userId: user.id, token });
    },
  );
};

export const autoPrefix = '/v1/auth';

export default auth;
