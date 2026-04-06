import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

interface JwtPayload {
  sub: string;
  email: string;
}

/**
 * Protects routes by validating Bearer JWT tokens.
 *
 * Process:
 * 1. Extracts token from the Authorization header.
 * 2. Verifies token signature and expiration.
 * 3. Injects authenticated user data into request.user.
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  /**
   * Determines if the request can access a protected route.
   *
   * Input:
   * - ExecutionContext with the incoming HTTP request.
   *
   * Output:
   * - true when token is valid.
   *
   * Possible errors:
   * - UnauthorizedException when token is missing.
   * - UnauthorizedException when token is invalid or expired.
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Missing bearer token');
    }

    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token);
      request['user'] = {
        userId: payload.sub,
        email: payload.email,
      };
      return true;
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }

  /**
   * Extracts a Bearer token from Authorization header.
   *
   * Input:
   * - Express request object.
   *
   * Output:
   * - Token string if present and well-formed, otherwise undefined.
   */
  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
