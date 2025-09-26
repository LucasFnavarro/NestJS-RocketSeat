import { Body, Controller, Post, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { compare } from "bcryptjs";
import { PrismaService } from "src/prisma/prisma.service";
import z from "zod";

const authenticateBodySchema = z.object({
  email: z.email(),
  password: z.string(),
});

type AuthenticateBodySchema = z.infer<typeof authenticateBodySchema>;

@Controller("/sessions")
export class AuthenticateController {
  constructor(
    private prisma: PrismaService, 
    private jwt: JwtService
  ) {}

  @Post()
  async handle(@Body() body: AuthenticateBodySchema) {
    const { email, password } = authenticateBodySchema.parse(body);

    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      throw new UnauthorizedException("User credentials do not match.");
    }

    const isPassword = await compare(password, user.password);

    if (!isPassword) {
      throw new UnauthorizedException("User credentials do not match.");
    }

    const accessToken = this.jwt.sign({
      sub: user.id,
    });

    return {
      access_token: accessToken,
    };
  }
}
