import type { FastifyPluginAsync } from 'fastify';

import { createCard } from './createCard';
import { updateCard } from './updateCard';
import { deleteCard } from './deleteCard';

export const cardParams = {
  description: 'Card ID',
  type: 'object',
  required: ['id'],
  properties: {
    id: { type: 'string' },
  },
} as const;

const cards: FastifyPluginAsync = async (server): Promise<void> => {
  createCard(server);
  updateCard(server);
  deleteCard(server);
};

export const autoPrefix = '/v1/cards';

export default cards;
