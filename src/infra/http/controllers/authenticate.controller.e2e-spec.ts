import { INestApplication } from "@nestjs/common";
import { AppModule } from "src/infra/app.module";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { PrismaService } from "src/infra/prisma/prisma.service";
import { hash } from "bcryptjs";

describe("Authenticate (E2E)", () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();

    prisma = moduleRef.get(PrismaService);

    await app.init();
  });

  test("[POST] /sessions", async () => {
    await prisma.user.create({
      data: {
        name: "John doe",
        email: "johndoe@example.com",
        password: await hash("123123", 8),
      },
    });

    const response = await request(app.getHttpServer()).post("/sessions").send({
      email: "johndoe@example.com",
      password: "123123",
    });

    expect(response.statusCode).toBe(201);
    expect(response.body).toEqual({
      access_token: expect.any(String),
    });
  });
});
