import { INestApplication } from '@nestjs/common';
import request from 'supertest';
//import request = require('supertest');
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

    // Cria uma categoria para testar o módulo
    await request(app.getHttpServer())
      .post('/categorias')
      .set(authHeader(token))
      .send({ tipo: 'E-Simulação' });

    // Cria um novo produto e captura o ID
      const resposta = await request(app.getHttpServer())
        .post('/produtos')
        .set(authHeader(token))
        .send({
          nome: 'Valorant',
          preco: 350.99,
          foto: '-',
          categoria: {
            id: 1,
          },
        });
        
      produtoId = resposta.body.id;

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

  });

  it('02 - Deve Listar todos os Produtos', async () => {
    const resposta = await request(app.getHttpServer())
      .get('/produtos')
      .set(authHeader(token));

      expect(resposta.status).toBe(200);
  });

  it('03 - Deve Listar um Produto pelo ID', async () => {
    const resposta = await request(app.getHttpServer())
      .get(`/produtos/${produtoId}`)
      .set(authHeader(token));

      expect(resposta.status).toBe(200);
  });

  it('04 - Deve Listar todos os Produtos pelo nome', async () => {
    const resposta = await request(app.getHttpServer())
      .get(`/produtos/nome/${produto.nome}`)
      .set(authHeader(token));

      expect(resposta.status).toBe(200);
  });

  it('05 - Deve Atualizar um Produto', async () => {
    const resposta = await request(app.getHttpServer())
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
      });
      
      expect(resposta.status).toBe(200);
      expect(resposta.body.nome).toEqual('Tomb Raider');
  });

  it('06 - Deve Deletar um Produto', async () => {
    const resposta = await request(app.getHttpServer())
      .delete(`/produtos/${produtoId}`)
      .set(authHeader(token));

      expect(resposta.status).toBe(204);
  });

  it('07 - Deve Listar os Produtos com preço maior do que o valor informado', async () => {
    const resposta = await request(app.getHttpServer())
      .get(`/produtos/preco_maior/250.00`)
      .set(authHeader(token));

      expect(resposta.status).toBe(200);
  });

  it('08 - Deve Listar os Produtos com preço menor do que o valor informado', async () => {
    const resposta = await request(app.getHttpServer())
      .get(`/produtos/preco_menor/260.00`)
      .set(authHeader(token));

      expect(resposta.status).toBe(200);
  });

});