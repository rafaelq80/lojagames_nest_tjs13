import { INestApplication } from '@nestjs/common';
import request = require('supertest');
import { createTestingApp, authenticateUser, authHeader } from '../src/data/services/test.service';


describe('Testes do Módulo Categoria (e2e)', () => {

  const categoria = {
    tipo: 'Aventura',
  }

  let token: string;
  let categoriaId: number;
  let app: INestApplication;

  beforeAll(async () => {
    jest.setTimeout(10000);
    app = await createTestingApp();
    token = await authenticateUser(app);
  });

  afterAll(async () => {
    await app.close();
  });

  it('01 - Deve Cadastrar Categoria', async () => {
    const resposta = await request(app.getHttpServer())
      .post('/categorias')
      .set(authHeader(token))
      .send(categoria);
    expect(resposta.status).toBe(201);

    categoriaId = resposta.body.id;
  });

  it('02 - Deve Listar todas as Categorias', async () => {
    return request(app.getHttpServer())
      .get('/categorias')
      .set(authHeader(token))
      .expect(200);
  });

  it('03 - Deve Listar uma Categoria pelo ID', async () => {
    return request(app.getHttpServer())
      .get(`/categorias/${categoriaId}`)
      .set(authHeader(token))
      .expect(200);
  });

  it('04 - Deve Listar todas as Categorias pelo tipo', async () => {
    return request(app.getHttpServer())
      .get(`/categorias/tipo/${categoria.tipo}`)
      .set(authHeader(token))
      .expect(200);
  });

  it('05 - Deve Atualizar uma Categoria', async () => {
    return request(app.getHttpServer())
      .put('/categorias')
      .set(authHeader(token))
      .send({
        id: categoriaId,
        tipo: 'Ação',
      })
      .expect(200)
      .then(resposta => {
        expect(resposta.body.tipo).toEqual('Ação');
      });
  });

  it('06 - Deve Deletar uma Categoria', async () => {
    return request(app.getHttpServer())
      .delete(`/categorias/${categoriaId}`)
      .set(authHeader(token))
      .expect(204);
  });

});