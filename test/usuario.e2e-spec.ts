import { INestApplication } from '@nestjs/common';
import request = require('supertest');
import { createTestingApp, authHeader } from '../src/data/services/test.service';

describe('Testes dos Módulos Usuário e Auth (e2e)', () => {

  let token: string;
  let usuarioId: number;
  let app: INestApplication;

  beforeAll(async () => {
    jest.setTimeout(10000);
    app = await createTestingApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('01 - Deve Cadastrar Usuario', async () => {
    const resposta = await request(app.getHttpServer())
      .post('/usuarios/cadastrar')
      .send({
        nome: 'Usuário',
        usuario: 'usuario@email.com.br',
        senha: 'user1234',
        foto: ' ',
        dataNascimento: '2000-02-20',
      });
    expect(resposta.status).toBe(201);

    usuarioId = resposta.body.id;
  });

  it('02 - Deve Autenticar Usuario (Login)', async () => {
    const resposta = await request(app.getHttpServer())
      .post('/usuarios/logar')
      .send({
        usuario: 'usuario@email.com.br',
        senha: 'user1234',
      });
    expect(resposta.status).toBe(200);

    token = resposta.body.token;
  });

  it('03 - Não Deve Duplicar o Usuário', async () => {
    return request(app.getHttpServer())
      .post('/usuarios/cadastrar')
      .send({
        nome: 'Usuário',
        usuario: 'usuario@email.com.br',
        senha: 'user1234',
        foto: ' ',
        dataNascimento: '2000-02-20',
      })
      .expect(400);
  });

  it('04 - Deve Listar todos os Usuários', async () => {
    return request(app.getHttpServer())
      .get('/usuarios/all')
      .set(authHeader(token))
      .expect(200);
  });

  it('05 - Deve Atualizar um Usuário', async () => {
    return request(app.getHttpServer())
      .put('/usuarios/atualizar')
      .set(authHeader(token))
      .send({
        id: usuarioId,
        nome: 'Usuário Atualizado',
        usuario: 'usuario@email.com.br',
        senha: 'user1234',
        foto: ' ',
        dataNascimento: '2000-02-20',
      })
      .expect(200)
      .then(resposta => {
        expect(resposta.body.nome).toEqual('Usuário Atualizado');
      });
  });

  it('06 - Deve Listar um Usuário pelo ID', async () => {
    return request(app.getHttpServer())
      .get(`/usuarios/${usuarioId}`)
      .set(authHeader(token))
      .expect(200);
  });

});