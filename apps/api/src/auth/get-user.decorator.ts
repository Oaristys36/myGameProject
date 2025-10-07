import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';

export interface AuthUser {
  id: string;
  email?: string | null;
}

export const GetUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthUser => {
    const request = ctx.switchToHttp().getRequest<Request & { user?: AuthUser }>();
    const user = request.user;
    if (!user || !user.id) {
      throw new UnauthorizedException('Authenticated user not found');
    }
    return user;
  },
);