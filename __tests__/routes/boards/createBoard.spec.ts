import type { FastifyInstance } from 'fastify';

import { build, initDatabase, getAuthHeader } from '../../helpers';

describe('board create #integration', () => {
  let app: FastifyInstance;
  let user: { userId: string; token: string };

  beforeAll(async () => {
    app = await build({});

    await initDatabase(app);

    const response = await app.inject({
      method: 'POST',
      url: '/v1/auth/login',
      payload: { email: 'admin@example.com', password: 'admin' },
    });

    user = response.json();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('when auth header is not set', () => {
    it('should return 401 code', async () => {
      // Act
      const res = await app.inject({
        method: 'GET',
        url: '/v1/boards',
      });

      // Assert
      expect(res.statusCode).toBe(401);
    });
  });
  it('should return board', async () => {
    // Arrange
    const name = 'Foo';

    // Act
    const res = await app.inject({
      method: 'POST',
      url: '/v1/boards',
      payload: { name },
      headers: getAuthHeader(user.token),
    });
    const body = res.json();

    // Assert
    expect(res.statusCode).toBe(201);
    expect(body.id).toBeDefined();
    expect(body.name).toBe(name);
  });
});
