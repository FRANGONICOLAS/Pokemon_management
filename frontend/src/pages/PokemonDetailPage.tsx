import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { deleteFavorite, getFavoriteById } from '../services/pokemonApi';
import type { FavoritePokemon } from '../types/api';
import { getErrorMessage } from '../lib/errors';
import { Loader } from '../components/Loader';
import { useToast } from '../hooks/useToast';

export function PokemonDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { pushToast } = useToast();
  const [favorite, setFavorite] = useState<FavoritePokemon | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    async function loadOne() {
      if (!id) {
        return;
      }

      setIsLoading(true);

      try {
        const response = await getFavoriteById(id);
        setFavorite(response);
      } catch (error) {
        pushToast(getErrorMessage(error), 'error');
        navigate('/dashboard', { replace: true });
      } finally {
        setIsLoading(false);
      }
    }

    void loadOne();
  }, [id, navigate, pushToast]);

  async function handleDelete() {
    if (!favorite) {
      return;
    }

    const confirmed = window.confirm('Delete this pokemon from your favorites?');

    if (!confirmed) {
      return;
    }

    setIsDeleting(true);

    try {
      await deleteFavorite(favorite.id);
      pushToast('Pokemon removed from favorites', 'success');
      navigate('/dashboard', { replace: true });
    } catch (error) {
      pushToast(getErrorMessage(error), 'error');
    } finally {
      setIsDeleting(false);
    }
  }

  if (isLoading) {
    return <Loader label="Loading pokemon detail..." />;
  }

  if (!favorite) {
    return null;
  }

  return (
    <article className="page-card reveal-in detail-layout">
      <header className="detail-head">
        <img
          src={favorite.pokemon.spriteUrl ?? 'https://placehold.co/128x128?text=?'}
          alt={favorite.pokemon.name}
        />
        <div>
          <h2>{favorite.pokemon.name}</h2>
          <p>PokeAPI id: #{favorite.pokemon.pokeApiId}</p>
          <div className="tag-row">
            {favorite.pokemon.types.map((type) => (
              <span key={type} className="tag">
                {type}
              </span>
            ))}
          </div>
        </div>
      </header>

      <section className="detail-notes">
        <h3>Notes</h3>
        <p>{favorite.notes || 'No notes provided.'}</p>

        <h3>Comments</h3>
        <p>{favorite.comments || 'No comments provided.'}</p>
      </section>

      <footer className="card-actions">
        <Link className="ghost-btn" to="/dashboard">
          Back
        </Link>
        <Link className="ghost-btn" to={`/pokemon/${favorite.id}/edit`}>
          Edit
        </Link>
        <button type="button" className="danger-btn" disabled={isDeleting} onClick={handleDelete}>
          {isDeleting ? 'Removing...' : 'Delete'}
        </button>
      </footer>
    </article>
  );
}
