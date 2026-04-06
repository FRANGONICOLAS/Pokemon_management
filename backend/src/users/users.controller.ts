import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

/**
 * Exposes user CRUD endpoints.
 *
 * Process:
 * - Receives HTTP requests, validates DTOs, and delegates data operations to UsersService.
 */
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Creates a user.
   *
   * Input:
   * - CreateUserDto with name, email, and password.
   *
   * Output:
   * - Persisted user entity.
   *
   * Possible errors:
   * - 400 Bad Request when DTO validation fails.
   * - 409 Conflict when email uniqueness is violated by the database.
   */
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  /**
   * Lists all users.
   *
   * Output:
   * - Array of users.
   */
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  /**
   * Retrieves a user by ID.
   *
   * Input:
   * - id: user UUID.
   *
   * Output:
   * - User entity or null when not found.
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  /**
   * Updates a user partially by ID.
   *
   * Input:
   * - id: user UUID.
   * - UpdateUserDto with one or more fields.
   *
   * Output:
   * - Updated user entity or null when not found.
   *
   * Possible errors:
   * - 400 Bad Request when DTO validation fails.
   * - 409 Conflict when email uniqueness is violated by the database.
   */
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  /**
   * Deletes a user by ID.
   *
   * Input:
   * - id: user UUID.
   *
   * Output:
   * - Removed user entity or null when not found.
   */
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
