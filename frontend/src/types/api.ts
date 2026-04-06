export interface AuthResponse {
  message: string;
  email: string;
  token: string;
}

export interface MessageResponse {
  message: string;
}

export interface PokemonData {
  id: string;
  pokeApiId: number;
  name: string;
  spriteUrl: string | null;
  types: string[];
}

export interface FavoritePokemon {
  id: string;
  notes: string | null;
  comments: string | null;
  createdAt: string;
  pokemon: PokemonData;
}

export interface PaginatedFavorites {
  data: FavoritePokemon[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiErrorPayload {
  message?: string | string[];
  error?: string;
  statusCode?: number;
}
