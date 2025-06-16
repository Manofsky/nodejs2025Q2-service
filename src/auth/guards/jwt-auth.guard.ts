import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { LoggingService } from '../../logging/logging.service';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private reflector: Reflector,
    private loggingService: LoggingService,
  ) {
    super();
  }

  canActivate(context: ExecutionContext) {
    // Check if route is public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Allow access to public routes
    if (isPublic) {
      return true;
    }

    // Check if route is /doc or /
    const request = context.switchToHttp().getRequest();
    const { url } = request;
    if (url === '/' || url.startsWith('/doc')) {
      return true;
    }

    // For all other routes, validate JWT token
    return super.canActivate(context);
  }

  handleRequest(err, user, info) {
    // Handle JWT validation errors
    if (err || !user) {
      this.loggingService.error('Authentication failed', { err, info });
      throw new UnauthorizedException('Authentication failed');
    }
    return user;
  }
}
