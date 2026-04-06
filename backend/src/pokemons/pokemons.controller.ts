import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Put,
  Query,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AddFavoritePokemonDto } from './dto/add-favorite-pokemon.dto';
import { ListFavoritePokemonDto } from './dto/list-favorite-pokemon.dto';
import { UpdateFavoritePokemonDto } from './dto/update-favorite-pokemon.dto';
import { PokemonsService } from './pokemons.service';

interface AuthenticatedRequest extends Request {
  user: {
    userId: string;
    email: string;
  };
}

/**
 * Manages authenticated user's favorite pokemon endpoints.
 *
 * Process:
 * - Requires JWT authentication for all routes.
 * - Reads authenticated user from request.user.
 * - Delegates business logic to PokemonsService.
 */
@Controller('pokemon')
@UseGuards(JwtAuthGuard)
export class PokemonsController {
  constructor(private readonly pokemonsService: PokemonsService) {}

  /**
   * Adds a pokemon to the authenticated user's favorites.
   *
   * Input:
   * - request.user.userId from validated JWT.
   * - AddFavoritePokemonDto with pokemon identifier and optional notes/comments.
   *
   * Output:
   * - Created favorite record with pokemon relation.
   *
   * Possible errors:
   * - 401 Unauthorized when token is missing/invalid.
   * - 404 Not Found when user or pokemon cannot be resolved.
   * - 409 Conflict when pokemon is already favorited by that user.
   */
  @Post()
  create(
    @Req() request: AuthenticatedRequest,
    @Body() addFavoritePokemonDto: AddFavoritePokemonDto,
  ) {
    return this.pokemonsService.createFavorite(
      request.user.userId,
      addFavoritePokemonDto,
    );
  }

  /**
   * Lists favorite pokemon for the authenticated user with pagination.
   *
   * Input:
   * - request.user.userId from validated JWT.
   * - ListFavoritePokemonDto query params (page, limit).
   *
   * Output:
   * - Paginated object containing data and pagination metadata.
   *
   * Possible errors:
   * - 401 Unauthorized when token is missing/invalid.
   * - 404 Not Found when user does not exist.
   */
  @Get()
  findAll(
    @Req() request: AuthenticatedRequest,
    @Query() listFavoritePokemonDto: ListFavoritePokemonDto,
  ) {
    return this.pokemonsService.findAllFavorites(
      request.user.userId,
      listFavoritePokemonDto,
    );
  }

  /**
   * Retrieves one favorite pokemon for the authenticated user.
   *
   * Input:
   * - request.user.userId from validated JWT.
   * - id: identifier from route params.
   *
   * Output:
   * - Favorite record with pokemon relation.
   *
   * Possible errors:
   * - 401 Unauthorized when token is missing/invalid.
   * - 404 Not Found when favorite does not exist for that user.
   */
  @Get(':id')
  findOne(
    @Req() request: AuthenticatedRequest,
    @Param('id') id: string,
  ) {
    return this.pokemonsService.findOneFavorite(request.user.userId, id);
  }

  /**
   * Updates notes/comments of one favorite pokemon for the authenticated user.
   *
   * Input:
   * - request.user.userId from validated JWT.
   * - id: identifier from route params.
   * - UpdateFavoritePokemonDto with optional notes/comments.
   *
   * Output:
   * - Updated favorite record.
   *
   * Possible errors:
   * - 401 Unauthorized when token is missing/invalid.
   * - 404 Not Found when favorite does not exist for that user.
   */
  @Put(':id')
  update(
    @Req() request: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() updateFavoritePokemonDto: UpdateFavoritePokemonDto,
  ) {
    return this.pokemonsService.updateFavorite(
      request.user.userId,
      id,
      updateFavoritePokemonDto,
    );
  }

  /**
   * Removes one favorite pokemon for the authenticated user.
   *
   * Input:
   * - request.user.userId from validated JWT.
   * - id: identifier from route params.
   *
   * Output:
   * - Confirmation message and removed record payload.
   *
   * Possible errors:
   * - 401 Unauthorized when token is missing/invalid.
   * - 404 Not Found when favorite does not exist for that user.
   */
  @Delete(':id')
  remove(
    @Req() request: AuthenticatedRequest,
    @Param('id') id: string,
  ) {
    return this.pokemonsService.removeFavorite(request.user.userId, id);
  }
}
