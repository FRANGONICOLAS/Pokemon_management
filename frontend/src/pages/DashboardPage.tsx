import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { deleteFavorite, listFavorites } from '../services/pokemonApi';
import type { FavoritePokemon } from '../types/api';
import { getErrorMessage } from '../lib/errors';
import { Loader } from '../components/Loader';
import { EmptyState } from '../components/EmptyState';
import { useToast } from '../hooks/useToast';

export function DashboardPage() {
  const { pushToast } = useToast();
  const [favorites, setFavorites] = useState<FavoritePokemon[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  const loadFavorites = useCallback(async () => {
    setIsLoading(true);

    try {
      const response = await listFavorites({ page, limit: 20 });
      setFavorites(response.data);
      setTotalPages(response.pagination.totalPages || 1);
    } catch (error) {
      pushToast(getErrorMessage(error), 'error');
    } finally {
      setIsLoading(false);
    }
  }, [page, pushToast]);

  useEffect(() => {
    void loadFavorites();
  }, [loadFavorites]);

  const availableTypes = useMemo(() => {
    const set = new Set<string>();

    for (const item of favorites) {
      for (const type of item.pokemon.types) {
        set.add(type);
      }
    }

    return ['all', ...Array.from(set.values()).sort()];
  }, [favorites]);

  const filteredFavorites = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return favorites.filter((item) => {
      const matchName = item.pokemon.name.toLowerCase().includes(normalizedSearch);
      const matchType =
        typeFilter === 'all' || item.pokemon.types.some((type) => type.toLowerCase() === typeFilter);

      return matchName && matchType;
    });
  }, [favorites, search, typeFilter]);

  async function handleDelete(id: string) {
    const confirmed = window.confirm('Delete this pokemon from your favorites?');

    if (!confirmed) {
      return;
    }

    setIsDeletingId(id);

    try {
      await deleteFavorite(id);
      pushToast('Pokemon removed from favorites', 'success');
      await loadFavorites();
    } catch (error) {
      pushToast(getErrorMessage(error), 'error');
    } finally {
      setIsDeletingId(null);
    }
  }

  if (isLoading) {
    return <Loader label="Loading your favorites..." />;
  }

  return (
    <section className="page-card reveal-in">
      <header className="page-head">
        <div>
          <h2>Dashboard</h2>
          <p>Explore, filter and maintain your favorite pokemon collection.</p>
        </div>
        <Link className="primary-btn" to="/pokemon/new">
          Add New
        </Link>
      </header>

      <div className="filter-row">
        <label>
          Search by name
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Pikachu"
          />
        </label>

        <label>
          Filter by type
          <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}>
            {availableTypes.map((type) => (
              <option key={type} value={type}>
                {type === 'all' ? 'All types' : type}
              </option>
            ))}
          </select>
        </label>
      </div>

      {filteredFavorites.length === 0 ? (
        <EmptyState
          title="No results"
          subtitle="Try another search/type filter or add a pokemon to favorites."
        />
      ) : (
        <div className="card-grid">
          {filteredFavorites.map((item) => (
            <article className="pokemon-card" key={item.id}>
              <div className="card-head">
                <img
                  src={item.pokemon.spriteUrl ?? 'https://placehold.co/96x96?text=?'}
                  alt={item.pokemon.name}
                  loading="lazy"
                />
                <div>
                  <h3>{item.pokemon.name}</h3>
                  <p>#{item.pokemon.pokeApiId}</p>
                </div>
              </div>

              <div className="tag-row">
                {item.pokemon.types.map((type) => (
                  <span key={type} className="tag">
                    {type}
                  </span>
                ))}
              </div>

              <p className="card-text">{item.notes || item.comments || 'No notes yet.'}</p>

              <div className="card-actions">
                <Link className="ghost-btn" to={`/pokemon/${item.id}`}>
                  Detail
                </Link>
                <Link className="ghost-btn" to={`/pokemon/${item.id}/edit`}>
                  Edit
                </Link>
                <button
                  type="button"
                  className="danger-btn"
                  disabled={isDeletingId === item.id}
                  onClick={() => handleDelete(item.id)}
                >
                  {isDeletingId === item.id ? 'Removing...' : 'Delete'}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      <footer className="pagination-row">
        <button
          type="button"
          className="ghost-btn"
          disabled={page <= 1}
          onClick={() => setPage((value) => Math.max(1, value - 1))}
        >
          Previous
        </button>
        <p>
          Page {page} of {totalPages}
        </p>
        <button
          type="button"
          className="ghost-btn"
          disabled={page >= totalPages}
          onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
        >
          Next
        </button>
      </footer>
    </section>
  );
}
