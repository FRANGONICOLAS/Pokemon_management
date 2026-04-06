import { http } from '../lib/http';
import type { FavoritePokemon, MessageResponse, PaginatedFavorites } from '../types/api';

interface ListQuery {
  page: number;
  limit?: number;
}

interface AddFavoriteInput {
  pokemon: string;
  notes?: string;
  comments?: string;
}

interface UpdateFavoriteInput {
  notes?: string;
  comments?: string;
}

export async function listFavorites(query: ListQuery): Promise<PaginatedFavorites> {
  const response = await http.get<PaginatedFavorites>('/pokemon', {
    params: {
      page: query.page,
      limit: query.limit ?? 20,
    },
  });

  return response.data;
}

export async function getFavoriteById(id: string): Promise<FavoritePokemon> {
  const response = await http.get<FavoritePokemon>(`/pokemon/${id}`);
  return response.data;
}

export async function addFavorite(payload: AddFavoriteInput): Promise<FavoritePokemon> {
  const response = await http.post<FavoritePokemon>('/pokemon', payload);
  return response.data;
}

export async function updateFavorite(
  id: string,
  payload: UpdateFavoriteInput,
): Promise<FavoritePokemon> {
  const response = await http.put<FavoritePokemon>(`/pokemon/${id}`, payload);
  return response.data;
}

export async function deleteFavorite(id: string): Promise<MessageResponse> {
  const response = await http.delete<MessageResponse>(`/pokemon/${id}`);
  return response.data;
}
