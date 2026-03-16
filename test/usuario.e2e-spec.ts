import { INestApplication } from '@nestjs/common';
//import request = require('supertest');
import request from 'supertest';
import { createTestingApp, authHeader, authenticateUser } from '../src/data/services/test.service';

describe('Testes dos Módulos Usuário e Auth (e2e)', () => {

  const usuario = {
    nome: 'Usuário',
    usuario: 'usuario@email.com.br',
    senha: 'user1234',
    foto: ' ',
    dataNascimento: '2000-02-20',
  }

  let token: string;
  let usuarioId: number;
  let app: INestApplication;
  
  beforeAll(async () => {

    jest.setTimeout(10000);
    app = await createTestingApp();
    token = await authenticateUser(app);

    // Cria um novo usuário e captura o ID
    const resposta = await request(app.getHttpServer())
      .post('/usuarios/cadastrar')
      .send({
        nome: 'João da Silva',
        usuario: 'joao@email.com.br',
        senha: 'joao1234',
        foto: ' ',
        dataNascimento: '2000-02-20',
      });

      usuarioId = resposta.body.id;
  });
  
  afterAll(async () => {
    await app.close();
  });
    
  it('01 - Deve Cadastrar Usuario', async () => {
    const resposta = await request(app.getHttpServer())
      .post('/usuarios/cadastrar')
      .send(usuario);
      
    expect(resposta.status).toBe(201);

  });

  it('02 - Deve Autenticar Usuario (Login)', async () => {
    const resposta = await request(app.getHttpServer())
      .post('/usuarios/logar')
      .send({
        usuario: 'usuario@email.com.br',
        senha: 'user1234',
      });

    expect(resposta.status).toBe(200);

  });

  it('03 - Não Deve Duplicar o Usuário', async () => {
    const resposta = await request(app.getHttpServer())
      .post('/usuarios/cadastrar')
      .send({
        nome: 'Usuário',
        usuario: 'usuario@email.com.br',
        senha: 'user1234',
        foto: ' ',
        dataNascimento: '2000-02-20',
      });

      expect(resposta.status).toBe(400);
  });

  it('04 - Deve Listar todos os Usuários', async () => {
    const resposta = await request(app.getHttpServer())
      .get('/usuarios/all')
      .set(authHeader(token));

      expect(resposta.status).toBe(200);
  });

  it('05 - Deve Atualizar um Usuário', async () => {
    const resposta = await request(app.getHttpServer())
      .put('/usuarios/atualizar')
      .set(authHeader(token))
      .send({
        id: usuarioId,
        nome: 'João da Silva Santos',
        usuario: 'joao@email.com.br',
        senha: 'joao1234',
        foto: ' ',
        dataNascimento: '2000-02-20',
      });

      expect(resposta.status).toBe(200);
      expect(resposta.body.nome).toEqual('João da Silva Santos');

  });

  it('06 - Deve Listar um Usuário pelo ID', async () => {
    const resposta = await request(app.getHttpServer())
      .get(`/usuarios/${usuarioId}`)
      .set(authHeader(token));

      expect(resposta.status).toBe(200);
  });

});