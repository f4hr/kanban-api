import fp from 'fastify-plugin';
import fastifySwagger from '@fastify/swagger';

export default fp(async (fastify) => {
  fastify.register(fastifySwagger, {
    routePrefix: '/documentation',
    openapi: {
      openapi: '3.0.3',
      info: {
        title: 'Kanban API',
        description: 'Kanban board API',
        version: '0.1.0',
      },
      externalDocs: {
        url: 'https://swagger.io',
        description: 'More about Swagger',
      },
      servers: [
        {
          url: 'http://localhost:5000',
          description: 'Local development',
        },
      ],
      tags: [
        { name: 'users', description: 'Users related end-points' },
        { name: 'boards', description: 'Boards related end-points' },
        { name: 'lists', description: 'Lists related end-points' },
        { name: 'cards', description: 'Cards related end-points' },
        { name: 'auth', description: 'Auth related end-points' },
      ],
      components: {
        securitySchemes: {
          BearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
    },
    exposeRoute: true,
  });

  fastify.addSchema({
    $id: 'User',
    type: 'object',
    required: ['id', 'name', 'email', 'boards'],
    properties: {
      id: { type: 'string' },
      name: { type: 'string' },
      email: { type: 'string' },
      boards: { type: 'array', items: { type: 'string' } },
    },
  });

  fastify.addSchema({
    $id: 'UserDetails',
    type: 'object',
    required: ['id', 'userId', 'email'],
    properties: {
      id: { type: 'string' },
      userId: { type: 'string' },
      email: { type: 'string', format: 'email' },
    },
  });

  fastify.addSchema({
    $id: 'Board',
    type: 'object',
    required: ['id', 'name', 'ownerId', 'users'],
    properties: {
      id: { type: 'string' },
      name: { type: 'string' },
      ownerId: { type: 'string' },
      users: { type: 'array', items: { type: 'string' } },
    },
  });

  fastify.addSchema({
    $id: 'BoardDetails',
    type: 'object',
    required: ['id', 'listIds', 'lists', 'cards'],
    properties: {
      id: { type: 'string' },
      name: { type: 'string', nullable: true },
      boardId: { type: 'string' },
      listIds: { type: 'array', items: { type: 'string' } },
      lists: {
        type: 'object',
        additionalProperties: {
          $ref: 'List#',
        },
        nullable: true,
      },
      cards: {
        type: 'object',
        additionalProperties: {
          $ref: 'Card#',
        },
        nullable: true,
      },
    },
  });

  fastify.addSchema({
    $id: 'List',
    type: 'object',
    required: ['id', 'name', 'boardId'],
    properties: {
      id: { type: 'string' },
      name: { type: 'string' },
      boardId: { type: 'string' },
      cardIds: { type: 'array', items: { type: 'string' } },
    },
  });

  fastify.addSchema({
    $id: 'Card',
    type: 'object',
    required: ['id', 'name', 'listId', 'boardId'],
    properties: {
      id: { type: 'string' },
      name: { type: 'string' },
      boardId: { type: 'string' },
      listId: { type: 'string' },
    },
  });

  fastify.addSchema({
    $id: 'CardDetails',
    type: 'object',
    required: ['id', 'cardId'],
    properties: {
      id: { type: 'string' },
      cardId: { type: 'string' },
      description: { type: 'string', nullable: true },
    },
  });

  fastify.addSchema({
    $id: 'Error',
    type: 'object',
    required: ['statusCode', 'error', 'message'],
    properties: {
      statusCode: { type: 'integer' },
      error: { type: 'string' },
      message: { type: 'string' },
    },
    example: {
      statusCode: 404,
      error: 'Not Found',
      message: 'Requested resourse was not found',
    },
  });

  fastify.addSchema({
    $id: 'error/BadRequest',
    $ref: 'Error#',
    example: {
      statusCode: 400,
      error: 'Bad Request',
      message: 'Bad request',
    },
  });

  fastify.addSchema({
    $id: 'error/NotFound',
    $ref: 'Error#',
    example: {
      statusCode: 404,
      error: 'Not Found',
      message: 'Requested resourse was not found',
    },
  });
});
