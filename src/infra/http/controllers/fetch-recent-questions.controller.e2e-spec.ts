import { INestApplication } from "@nestjs/common";
import { AppModule } from "src/infra/app.module";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { PrismaService } from "src/infra/prisma/prisma.service";
import { JwtService } from "@nestjs/jwt";

describe("Fetch questions (E2E)", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwt: JwtService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();

    prisma = moduleRef.get(PrismaService);
    jwt = moduleRef.get(JwtService);

    await app.init();
  });

  test("[GET] /questions", async () => {
    const user = await prisma.user.create({
      data: {
        name: "John Doe",
        email: "johndoe@example.com",
        password: "123123",
      },
    });

    const accessToken = jwt.sign({ sub: user.id });

    await prisma.question.createMany({
      data: [
        {
          title: "Question 01",
          slug: "question-01",
          content: "New Question",
          authorId: user.id,
        },
        {
          title: "Question 02",
          slug: "question-02",
          content: "New Question",
          authorId: user.id,
        },
      ],
    });

    const response = await request(app.getHttpServer())
      .get("/questions")
      .set("Authorization", `Bearer ${accessToken}`)
      .send();

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      questions: [expect.objectContaining({ title: "Question 01" })],
    });
  });
});
