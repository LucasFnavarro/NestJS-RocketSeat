import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ZodValidationPipe } from "src/pipes/zod-validation-pipe";
import { PrismaService } from "src/prisma/prisma.service";
import z from "zod";

const pageQueryParamsSchema = z
  .string()
  .optional()
  .default("1")
  .transform(Number)
  .pipe(z.number().min(1));

const queryValidationPipe = new ZodValidationPipe(pageQueryParamsSchema);
type PageQueryParamSchema = z.infer<typeof pageQueryParamsSchema>;

@Controller("/questions")
@UseGuards(AuthGuard("jwt"))
export class FetchRecentQuestionsController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async handle(@Query("page", queryValidationPipe) page: PageQueryParamSchema) {
    const questions = await this.prisma.question.findMany({
      take: 5,
      skip: (page - 1) * 1,
      orderBy: {
        createdAt: "desc",
      },
    });

    return {
      questions,
      page,
    };
  }
}
