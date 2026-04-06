import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AddFavoritePokemonDto } from './dto/add-favorite-pokemon.dto';
import { UpdateFavoritePokemonDto } from './dto/update-favorite-pokemon.dto';
import { Pokemon } from './entities/pokemon.entity';
import { UserFavoritePokemon } from './entities/user-favorite-pokemon.entity';
import { User } from '../users/entities/user.entity';

interface PokeApiType {
  type: {
    name: string;
  };
}

interface PokeApiResponse {
  id: number;
  name: string;
  sprites: {
    front_default: string | null;
  };
  types: PokeApiType[];
}

@Injectable()
export class PokemonsService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Pokemon)
    private readonly pokemonRepository: Repository<Pokemon>,
    @InjectRepository(UserFavoritePokemon)
    private readonly favoritesRepository: Repository<UserFavoritePokemon>,
  ) {}

  async createFavorite(
    userId: string,
    addFavoritePokemonDto: AddFavoritePokemonDto,
  ) {
    const user = await this.usersRepository.findOneBy({ id: userId });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const pokemon = await this.getOrCreatePokemon(addFavoritePokemonDto.pokemon);

    const exists = await this.favoritesRepository.findOne({
      where: { user: { id: user.id }, pokemon: { id: pokemon.id } },
    });

    if (exists) {
      throw new ConflictException('Pokemon is already in favorites');
    }

    const favorite = this.favoritesRepository.create({ user, pokemon });
    const savedFavorite = await this.favoritesRepository.save(favorite);

    return this.findOneFavorite(userId, savedFavorite.id);
  }

  async findAllFavorites(userId: string) {
    await this.ensureUserExists(userId);

    return await this.favoritesRepository.find({
      where: { user: { id: userId } },
      relations: {
        pokemon: true,
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findOneFavorite(userId: string, favoriteId: string) {
    await this.ensureUserExists(userId);

    const favorite = await this.favoritesRepository.findOne({
      where: { id: favoriteId, user: { id: userId } },
      relations: {
        pokemon: true,
      },
    });

    if (!favorite) {
      throw new NotFoundException('Favorite pokemon not found');
    }

    return favorite;
  }

  async updateFavorite(
    userId: string,
    favoriteId: string,
    updateFavoritePokemonDto: UpdateFavoritePokemonDto,
  ) {
    const favorite = await this.favoritesRepository.findOne({
      where: { id: favoriteId, user: { id: userId } },
      relations: {
        user: true,
        pokemon: true,
      },
    });

    if (!favorite) {
      throw new NotFoundException('Favorite pokemon not found');
    }

    const newPokemon = await this.getOrCreatePokemon(updateFavoritePokemonDto.pokemon);

    if (favorite.pokemon.id === newPokemon.id) {
      return favorite;
    }

    const duplicate = await this.favoritesRepository.findOne({
      where: {
        user: { id: userId },
        pokemon: { id: newPokemon.id },
      },
    });

    if (duplicate) {
      throw new ConflictException('Pokemon is already in favorites');
    }

    favorite.pokemon = newPokemon;
    await this.favoritesRepository.save(favorite);

    return await this.findOneFavorite(userId, favoriteId);
  }

  async removeFavorite(userId: string, favoriteId: string) {
    const favorite = await this.findOneFavorite(userId, favoriteId);
    await this.favoritesRepository.delete(favorite.id);

    return {
      message: 'Favorite pokemon removed successfully',
      removed: favorite,
    };
  }

  private async ensureUserExists(userId: string): Promise<void> {
    const user = await this.usersRepository.findOneBy({ id: userId });
    if (!user) {
      throw new NotFoundException('User not found');
    }
  }

  private async getOrCreatePokemon(identifier: string): Promise<Pokemon> {
    const normalized = identifier.trim().toLowerCase();

    const existingByName = await this.pokemonRepository.findOneBy({ name: normalized });
    if (existingByName) {
      return existingByName;
    }

    if (/^\d+$/.test(normalized)) {
      const existingByApiId = await this.pokemonRepository.findOneBy({
        pokeApiId: Number(normalized),
      });
      if (existingByApiId) {
        return existingByApiId;
      }
    }

    const remotePokemon = await this.fetchPokemonFromApi(normalized);

    const pokemonToSave = this.pokemonRepository.create({
      pokeApiId: remotePokemon.id,
      name: remotePokemon.name.toLowerCase(),
      spriteUrl: remotePokemon.sprites.front_default,
      types: remotePokemon.types.map((item) => item.type.name),
    });

    try {
      return await this.pokemonRepository.save(pokemonToSave);
    } catch {
      // Handles race condition when two requests save the same pokemon concurrently.
      const existing = await this.pokemonRepository.findOneBy({
        pokeApiId: remotePokemon.id,
      });

      if (existing) {
        return existing;
      }

      throw new InternalServerErrorException('Failed to save pokemon');
    }
  }

  private async fetchPokemonFromApi(identifier: string): Promise<PokeApiResponse> {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${identifier}`);

    if (response.status === 404) {
      throw new NotFoundException('Pokemon not found in PokeAPI');
    }

    if (!response.ok) {
      throw new InternalServerErrorException('Failed to fetch pokemon from PokeAPI');
    }

    return (await response.json()) as PokeApiResponse;
  }
}
