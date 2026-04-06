import type { PokeApiCatalogItem, PokeApiPokemonMini } from '../types/api';

interface PokeApiListResponse {
  results: Array<{
    name: string;
    url: string;
  }>;
}

interface PokeApiDetailResponse {
  id: number;
  name: string;
  height: number;
  weight: number;
  base_experience: number;
  sprites: {
    front_default: string | null;
    other?: {
      'official-artwork'?: {
        front_default: string | null;
      };
    };
  };
  abilities: Array<{
    ability: {
      name: string;
    };
  }>;
  stats: Array<{
    base_stat: number;
    stat: {
      name: string;
    };
  }>;
  types: Array<{
    type: {
      name: string;
    };
  }>;
}

function getStatValue(stats: PokeApiDetailResponse['stats'], name: string): number {
  return stats.find((entry) => entry.stat.name === name)?.base_stat ?? 0;
}

function getIdFromUrl(url: string): number | null {
  const match = /\/pokemon\/(\d+)\/?$/.exec(url);
  return match ? Number(match[1]) : null;
}

export async function listAllPokemons(): Promise<PokeApiCatalogItem[]> {
  const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=2000&offset=0');

  if (!response.ok) {
    throw new Error('Failed to load pokemon catalog');
  }

  const payload = (await response.json()) as PokeApiListResponse;

  return payload.results
    .map((item) => {
      const id = getIdFromUrl(item.url);

      if (!id) {
        return null;
      }

      return {
        id,
        name: item.name,
      };
    })
    .filter((item): item is PokeApiCatalogItem => item !== null);
}

export async function getPokemonMiniDetail(id: number): Promise<PokeApiPokemonMini> {
  const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);

  if (!response.ok) {
    throw new Error('Failed to load pokemon detail');
  }

  const payload = (await response.json()) as PokeApiDetailResponse;

  return {
    id: payload.id,
    name: payload.name,
    spriteUrl: payload.sprites.front_default,
    artworkUrl: payload.sprites.other?.['official-artwork']?.front_default ?? null,
    types: payload.types.map((type) => type.type.name),
    height: payload.height,
    weight: payload.weight,
    baseExperience: payload.base_experience,
    abilities: payload.abilities.map((ability) => ability.ability.name),
    stats: {
      hp: getStatValue(payload.stats, 'hp'),
      attack: getStatValue(payload.stats, 'attack'),
      defense: getStatValue(payload.stats, 'defense'),
      speed: getStatValue(payload.stats, 'speed'),
    },
  };
}
