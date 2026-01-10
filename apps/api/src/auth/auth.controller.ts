import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { AUTH_COOKIE_NAME } from './auth.constants';
import {
  getAuthCookieClearOptions,
  getAuthCookieOptions
} from './auth.cookies';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService
  ) {}

  @Post('login')
  async login(
    @Body() body: LoginDto,
    @Res({ passthrough: true }) response: Response
  ) {
    const { accessToken, user } = await this.authService.login(
      body.email,
      body.password
    );

    response.cookie(
      AUTH_COOKIE_NAME,
      accessToken,
      getAuthCookieOptions(this.configService)
    );

    return { user };
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie(
      AUTH_COOKIE_NAME,
      getAuthCookieClearOptions(this.configService)
    );
    return { ok: true };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@Req() request: { user: { id: string; email: string; role: string } }) {
    return request.user;
  }
}
