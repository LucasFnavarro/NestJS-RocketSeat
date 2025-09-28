import { INestApplication } from "@nestjs/common";
import { AppModule } from "src/infra/app.module";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { PrismaService } from "src/infra/prisma/prisma.service";

describe("Create account (E2E)", () => {
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

  test("[POST] /accounts", async () => {
    const response = await request(app.getHttpServer()).post("/accounts").send({
      name: "John doe",
      email: "johndoe@example.com",
      password: "123123",
    });

    expect(response.statusCode).toBe(201);

    const userOnDatabase = await prisma.user.findUnique({
      where: {
        email: "johndoe@example.com",
      },
    });

    expect(userOnDatabase).toBeTruthy();
  });
});
