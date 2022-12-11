import type { FastifyInstance } from 'fastify';

import { build } from '../helpers';

describe('root #integration', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await build({});
  });

  afterAll(async () => {
    await app.close();
  });

  it('should return status code 200', async () => {
    // Act
    const res = await app.inject({
      method: 'GET',
      url: '/',
    });
    const body = res.json();

    // Assert
    expect(res.statusCode).toBe(200);
    expect(body).toEqual({ root: true });
  });
});
