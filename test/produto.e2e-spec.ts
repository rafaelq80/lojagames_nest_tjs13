import { INestApplication } from '@nestjs/common';
import request = require('supertest');
import { createTestingApp, authenticateUser, authHeader } from '../src/data/services/test.service';


describe('Testes do Módulo Produto (e2e)', () => {

  const produto = {
    nome: 'Halo',
    preco: 250.99,
    foto: '-',
    categoria: {
      id: 1,
    },
  }

  let token: string;
  let produtoId: number;
  let app: INestApplication;

  beforeAll(async () => {
    jest.setTimeout(10000);
    app = await createTestingApp();
    token = await authenticateUser(app);

    // Criar categoria para testar o módulo
    await request(app.getHttpServer())
      .post('/categorias')
      .set(authHeader(token))
      .send({ tipo: 'E-Sports' });
  });

  afterAll(async () => {
    await app.close();
  });

  it('01 - Deve Cadastrar Produto', async () => {
    const resposta = await request(app.getHttpServer())
      .post('/produtos')
      .set(authHeader(token))
      .send(produto);
    expect(resposta.status).toBe(201);

    produtoId = resposta.body.id;
  });

  it('02 - Deve Listar todos os Produtos', async () => {
    return request(app.getHttpServer())
      .get('/produtos')
      .set(authHeader(token))
      .expect(200);
  });

  it('03 - Deve Listar um Produto pelo ID', async () => {
    return request(app.getHttpServer())
      .get(`/produtos/${produtoId}`)
      .set(authHeader(token))
      .expect(200);
  });

  it('04 - Deve Listar todos os Produtos pelo nome', async () => {
    return request(app.getHttpServer())
      .get(`/produtos/nome/${produto.nome}`)
      .set(authHeader(token))
      .expect(200);
  });

  it('05 - Deve Atualizar um Produto', async () => {
    return request(app.getHttpServer())
      .put('/produtos')
      .set(authHeader(token))
      .send({
        id: produtoId,
        nome: 'Tomb Raider',
        preco: 250.99,
        foto: '-',
        categoria: {
          id: 1,
        },
      })
      .expect(200)
      .then(resposta => {
        expect(resposta.body.nome).toEqual('Tomb Raider');
      });
  });

  it('06 - Deve Deletar um Produto', async () => {
    return request(app.getHttpServer())
      .delete(`/produtos/${produtoId}`)
      .set(authHeader(token))
      .expect(204);
  });

});