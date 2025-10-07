import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { SupabaseStrategy } from './supabase.strategy';
import { SupabaseGuard } from './supabase.guard';

@Module({
  imports: [ConfigModule],
  controllers: [AuthController],
  providers: [SupabaseStrategy, SupabaseGuard],
  exports: [],
})
export class AuthModule {}
