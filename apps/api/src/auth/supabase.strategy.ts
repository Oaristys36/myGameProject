import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy, VerifiedCallback } from 'passport-jwt';
import jwksRsa from 'jwks-rsa';

@Injectable()
export class SupabaseStrategy extends PassportStrategy(Strategy, 'supabase') {
  constructor() {
    super({
      // Extraction du token depuis l'en-tête Authorization: Bearer <token>
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),

      // Algorithme utilisé par Supabase (ES256)
      algorithms: ['ES256'],

      // Issuer Supabase
      issuer: process.env.SUPABASE_ISSUER,

      // Récupération automatique de la clé publique via JWKS
      secretOrKeyProvider: jwksRsa.passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `${process.env.SUPABASE_ISSUER}/.well-known/jwks.json`,
      }) as any,
    });
  }

  async validate(payload: any, done: VerifiedCallback) {
    // payload contient sub, exp, role, email, etc. selon Supabase
    // Exemple simple : retourner l'objet utilisateur tel quel
    return done(null, {
      sub: payload.sub,
      email: payload.email,
      role: payload.role,
    });
  }
}
