import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { RegisterDto } from "./dto/register.dto";
import * as bcryptjs from "bcryptjs";
import { UsersService } from "../users/users.service";
import { LoginDto } from "./dto/login.dto";
import { JwtService } from "@nestjs/jwt/dist/jwt.service";

/**
 * Handles authentication use cases.
 *
 * Process:
 * - Registration validates uniqueness by email, hashes password, and creates a user.
 * - Login validates credentials and issues a signed JWT.
 */
@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService,
    private readonly jwtService: JwtService
  ) {}

  /**
   * Creates a new user with a hashed password.
   *
   * Input:
   * - RegisterDto containing name, email, and plain password.
   *
   * Output:
   * - Object with a success message.
   *
   * Possible errors:
   * - BadRequestException when email is already registered.
   */
  async register({ password, email, name }: RegisterDto) {
    const user = await this.usersService.findOneByEmail(email);

    if (user) {
      throw new BadRequestException("Email already exists");
    }

    const hashedPassword = await bcryptjs.hash(password, 10);

    await this.usersService.create({
      name,
      email,
      password: hashedPassword,
    });

    return {
      message: "User created successfully",
    };
  }

  /**
   * Validates user credentials and returns an access token.
   *
   * Input:
   * - LoginDto containing email and plain password.
   *
   * Output:
   * - Object with success message, email, and JWT token.
   *
   * Possible errors:
   * - UnauthorizedException when email is not found.
   * - UnauthorizedException when password does not match.
   */
  async login({ email, password }: LoginDto) {
    const user = await this.usersService.findOneByEmail(email);

    if (!user) {
      throw new UnauthorizedException("Invalid email");
    }

    const isPasswordValid = await bcryptjs.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException("Invalid password");
    }

    const payload = { email: user.email, sub: user.id };

    const token = await this.jwtService.signAsync(payload);

    return {
      message: "Login successful",
      email: user.email,
      token
    };
  }
}