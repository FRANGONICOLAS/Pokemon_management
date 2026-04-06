import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

/**
 * Exposes authentication endpoints.
 *
 * Process:
 * 1. Receives request payloads validated by DTOs.
 * 2. Delegates business logic to AuthService.
 * 3. Returns service results or propagates framework exceptions.
 */
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Registers a new user account.
   *
   * Input:
   * - registerDto: user name, email, and plain password.
   *
   * Output:
   * - Success message confirming user creation.
   *
   * Possible errors:
   * - 400 Bad Request when email already exists.
   * - 400 Bad Request when DTO validation fails.
   */
  @Post('register')
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  /**
   * Authenticates an existing user.
   *
   * Input:
   * - loginDto: email and plain password.
   *
   * Output:
   * - Login response including a JWT token.
   *
   * Possible errors:
   * - 401 Unauthorized when email does not exist.
   * - 401 Unauthorized when password is invalid.
   * - 400 Bad Request when DTO validation fails.
   */
  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
}
