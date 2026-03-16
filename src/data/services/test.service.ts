import { INestApplication, Injectable } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { TypeOrmModule, TypeOrmModuleOptions, TypeOrmOptionsFactory } from "@nestjs/typeorm";
import request from 'supertest';
//import request = require('supertest');
import { AppModule } from "../../app.module";

@Injectable()
export class TestService implements TypeOrmOptionsFactory {

  // IMPORTANTE: O SQLite não aceita atributos BIGINT
  createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      type: "sqlite",
      database: ":memory:",
      autoLoadEntities: true,
      synchronize: true,
      dropSchema: true,
      logging: false,
    };
  }
}

// Cria o Ambiente de Testes
export const createTestingApp = async (): Promise<INestApplication> => {
  const moduleFixture = await Test.createTestingModule({
    imports: [
      TypeOrmModule.forRootAsync({
        useClass: TestService,  // Classe de conexão com o SQLite
      }),
      AppModule,
    ],
  }).compile();

  const app = moduleFixture.createNestApplication();
  await app.init();

  return app;
};

// Função de Autenticação para geração do Token
export const authenticateUser = async (app: INestApplication): Promise<string> => {

  // Cria o usuário
  await request(app.getHttpServer())
    .post('/usuarios/cadastrar')
    .send({
      nome: 'Root',
      usuario: 'root@root.com',
      senha: 'rootroot',
      foto: 'https://i.imgur.com/Tk9f10K.png',
      dataNascimento: '2000-01-01',
    });

  // Autentica o usuário e retorna o token
  const response = await request(app.getHttpServer())
    .post('/usuarios/logar')
    .send({
      usuario: 'root@root.com',
      senha: 'rootroot',
    });

  return response.body.token;
};

// Monta o header de autorização pronto para uso nos testes
export const authHeader = (token: string) => ({
  Authorization: token,
});