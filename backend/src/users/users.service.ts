import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

/**
 * Provides persistence operations for users.
 *
 * Process:
 * - Uses TypeORM repository methods to create, read, update, and delete users.
 */
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  /**
   * Persists a new user.
   *
   * Input:
   * - CreateUserDto with user fields.
   *
   * Output:
   * - Saved user entity.
   *
   * Possible errors:
   * - Database uniqueness errors for duplicated email.
   */
  async create(createUserDto: CreateUserDto) {
    const user = this.usersRepository.create(createUserDto);
    return await this.usersRepository.save(user);
  }

  /**
   * Retrieves all users.
   *
   * Output:
   * - Array of user entities.
   */
  async findAll() {
    return await this.usersRepository.find();
  }

  /**
   * Finds one user by UUID.
   *
   * Input:
   * - id: user UUID.
   *
   * Output:
   * - User entity or null.
   */
  async findOne(id: string) {
    return await this.usersRepository.findOneBy({ id });
  }

  /**
   * Updates user fields by UUID.
   *
   * Input:
   * - id: user UUID.
   * - UpdateUserDto with partial fields.
   *
   * Output:
   * - Updated user entity or null when ID does not exist.
   *
   * Possible errors:
   * - Database uniqueness errors for duplicated email.
   */
  async update(id: string, updateUserDto: UpdateUserDto) {
    await this.usersRepository.update(id, updateUserDto);
    return await this.findOne(id);
  }

  /**
   * Deletes a user by UUID.
   *
   * Input:
   * - id: user UUID.
   *
   * Output:
   * - Removed user entity or null when not found.
   */
  async remove(id: string) {
    const user = await this.findOne(id);
    if (!user) {
      return null;
    }

    await this.usersRepository.delete(id);
    return user;
  }

  /**
   * Finds one user by email.
   *
   * Input:
   * - email: unique email string.
   *
   * Output:
   * - User entity or null.
   */
  async findOneByEmail(email: string) {
    return await this.usersRepository.findOneBy({ email });
  }
}
