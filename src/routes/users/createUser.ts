import { FromSchema } from 'json-schema-to-ts';
import bcrypt from 'bcrypt';

import type { FastifyInstance } from 'fastify';

const SALT_ROUNDS = 10;

export function createUser(server: FastifyInstance) {
  const createUserBody = {
    description: 'Payload for creating a new user',
    type: 'object',
    required: ['email', 'name', 'password'],
    properties: {
      email: { type: 'string' },
      password: { type: 'string' },
      name: { type: 'string' },
    },
  } as const;

  server.post<{ Body: FromSchema<typeof createUserBody> }>(
    '/',
    {
      schema: {
        description: 'This is an endpoint for creating a new user',
        tags: ['users'],
        body: createUserBody,
        response: {
          201: {
            description: 'Success Response',
            type: 'null',
          },
        },
      },
    },
    async (request, reply) => {
      const { email, password, name } = request.body;

      if (email === '' || password === '') {
        reply.badRequest('One of fields (email, password) is empty');
        return;
      }

      try {
        // Check if email exists
        const user = await server.db.user.findOne({ email });
        if (user) {
          reply.badRequest('User with provided email already exists');
          return;
        }

        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
        const newUser = server.db.user.create({
          name,
          email,
          password: hashedPassword,
        });

        await server.db.em.flush();

        reply.code(201).send(newUser);
      } catch (err) {
        console.log(err);

        reply.internalServerError('Failed to create user');
      }
    },
  );
}
