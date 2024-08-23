import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as request from 'supertest';
import { JwtPayload } from '../interfaces/jwt-payload';
import { AuthService } from '../auth.service';

@Injectable()
export class AuthGuard implements CanActivate {

  constructor( 
    private jwtService: JwtService,
    private authService: AuthService,
  ) {}

  async canActivate( context: ExecutionContext ): Promise<boolean> {

    
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader( request );

    if (!token) {
      throw new UnauthorizedException( 'No hay token' );
    }

    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(
        token,
        { secret: process.env.JWT_SEED }
      );
  
      const user = await this.authService.findUserById( payload.id );
      if ( !user ) throw new UnauthorizedException( 'El usuario no existe' );
      if ( !user.isActive ) throw new UnauthorizedException( 'El usuario no está activo' );

      // 💡 We're assigning the user to the request object here
      // so that we can access it in our route handlers
      request['user'] = user;

    } catch {
      throw new UnauthorizedException();
    }

    
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers['authorization'].split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
