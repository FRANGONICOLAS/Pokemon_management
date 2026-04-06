import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AddFavoritePokemonDto } from './dto/add-favorite-pokemon.dto';
import { UpdateFavoritePokemonDto } from './dto/update-favorite-pokemon.dto';
import { PokemonsService } from './pokemons.service';

interface AuthenticatedRequest extends Request {
  user: {
    userId: string;
    email: string;
  };
}

@Controller('pokemons/favorites')
@UseGuards(JwtAuthGuard)
export class PokemonsController {
  constructor(private readonly pokemonsService: PokemonsService) {}

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

  @Get()
  findAll(@Req() request: AuthenticatedRequest) {
    return this.pokemonsService.findAllFavorites(request.user.userId);
  }

  @Get(':favoriteId')
  findOne(
    @Req() request: AuthenticatedRequest,
    @Param('favoriteId') favoriteId: string,
  ) {
    return this.pokemonsService.findOneFavorite(request.user.userId, favoriteId);
  }

  @Patch(':favoriteId')
  update(
    @Req() request: AuthenticatedRequest,
    @Param('favoriteId') favoriteId: string,
    @Body() updateFavoritePokemonDto: UpdateFavoritePokemonDto,
  ) {
    return this.pokemonsService.updateFavorite(
      request.user.userId,
      favoriteId,
      updateFavoritePokemonDto,
    );
  }

  @Delete(':favoriteId')
  remove(
    @Req() request: AuthenticatedRequest,
    @Param('favoriteId') favoriteId: string,
  ) {
    return this.pokemonsService.removeFavorite(request.user.userId, favoriteId);
  }
}
