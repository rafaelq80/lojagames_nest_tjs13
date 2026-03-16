import { INestApplication } from '@nestjs/common';
import request from 'supertest';
//import request = require('supertest');
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

    // Cria uma nova categoria e captura o ID
    const resposta = await request(app.getHttpServer())
      .post('/categorias')
      .set(authHeader(token))
      .send({
        tipo: 'E-Sports'
      });
    
      categoriaId = resposta.body.id;
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
  });

  it('02 - Deve Listar todas as Categorias', async () => {
   const resposta = await request(app.getHttpServer())
      .get('/categorias')
      .set(authHeader(token));

      expect(resposta.status).toBe(200);
  });

  it('03 - Deve Listar uma Categoria pelo ID', async () => {
    const resposta = await request(app.getHttpServer())
      .get(`/categorias/${categoriaId}`)
      .set(authHeader(token));

      expect(resposta.status).toBe(200);
  });

  it('04 - Deve Listar todas as Categorias pelo tipo', async () => {
    const resposta = await request(app.getHttpServer())
      .get(`/categorias/tipo/${categoria.tipo}`)
      .set(authHeader(token));

      expect(resposta.status).toBe(200);
  });

  it('05 - Deve Atualizar uma Categoria', async () => {
    const resposta = await request(app.getHttpServer())
      .put('/categorias')
      .set(authHeader(token))
      .send({
        id: categoriaId,
        tipo: 'Ação',
      });

      expect(resposta.status).toBe(200);
      expect(resposta.body.tipo).toEqual('Ação');
  });

  it('06 - Deve Deletar uma Categoria', async () => {
   const resposta = await request(app.getHttpServer())
      .delete(`/categorias/${categoriaId}`)
      .set(authHeader(token));

      expect(resposta.status).toBe(204);
  });

});