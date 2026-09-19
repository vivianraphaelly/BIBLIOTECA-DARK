const request   = require('supertest');
const app       = require('../backend/src/app');
const sequelize = require('../backend/src/config/database');

beforeAll(async () => {
  await sequelize.sync({ force: true });
});

afterAll(async () => {
  await sequelize.close();
});

describe('Users API', () => {
  let userId;

  test('POST /users — cria usuário', async () => {
    const res = await request(app)
      .post('/users')
      .send({ name: 'João Silva', email: 'joao@email.com', password: 'senha123' });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body).not.toHaveProperty('password'); // senha não exposta
    userId = res.body.id;
  });

  test('POST /users — erro sem password', async () => {
    const res = await request(app)
      .post('/users')
      .send({ name: 'Sem Senha', email: 'semsenha@email.com' });
    expect(res.status).toBe(400);
  });

  test('GET /users — lista usuários', async () => {
    const res = await request(app).get('/users');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('GET /users/:id — busca por ID', async () => {
    const res = await request(app).get(`/users/${userId}`);
    expect(res.status).toBe(200);
    expect(res.body.email).toBe('joao@email.com');
  });

  test('POST /auth/login — login com credenciais corretas', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'joao@email.com', password: 'senha123' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
  });

  test('POST /auth/login — erro com senha errada', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'joao@email.com', password: 'errada' });
    expect(res.status).toBe(401);
  });

  test('PUT /users/:id — atualiza usuário', async () => {
    const res = await request(app)
      .put(`/users/${userId}`)
      .send({ name: 'João Atualizado' });
    expect(res.status).toBe(200);
  });

  test('DELETE /users/:id — remove usuário', async () => {
    const res = await request(app).delete(`/users/${userId}`);
    expect(res.status).toBe(200);
  });

  test('GET /users/:id — 404 após remoção', async () => {
    const res = await request(app).get(`/users/${userId}`);
    expect(res.status).toBe(404);
  });
});
