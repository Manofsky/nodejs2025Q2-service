import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class PublicRouteGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Check if route is marked as public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    // Check if route is /doc or /
    const request = context.switchToHttp().getRequest();
    const { url } = request;
    if (url === '/' || url.startsWith('/doc')) {
      return true;
    }

    // For all other routes, continue with JWT validation
    // This guard should not block requests, it only marks public routes
    // The actual JWT validation is done by JwtAuthGuard
    return false;
  }
}
