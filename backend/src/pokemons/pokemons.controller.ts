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

@Controller('pokemon')
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
  findAll(
    @Req() request: AuthenticatedRequest,
    @Query() listFavoritePokemonDto: ListFavoritePokemonDto,
  ) {
    return this.pokemonsService.findAllFavorites(
      request.user.userId,
      listFavoritePokemonDto,
    );
  }

  @Get(':id')
  findOne(
    @Req() request: AuthenticatedRequest,
    @Param('id') id: string,
  ) {
    return this.pokemonsService.findOneFavorite(request.user.userId, id);
  }

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

  @Delete(':id')
  remove(
    @Req() request: AuthenticatedRequest,
    @Param('id') id: string,
  ) {
    return this.pokemonsService.removeFavorite(request.user.userId, id);
  }
}
