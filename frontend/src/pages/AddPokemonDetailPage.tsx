import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Loader } from '../components/Loader';
import { useToast } from '../hooks/useToast';
import { getErrorMessage } from '../lib/errors';
import { addFavorite } from '../services/pokemonApi';
import { getPokemonMiniDetail } from '../services/pokeApiCatalog';
import type { PokeApiPokemonMini } from '../types/api';

export function AddPokemonDetailPage() {
  const navigate = useNavigate();
  const { pokeApiId } = useParams<{ pokeApiId: string }>();
  const { pushToast } = useToast();
  const [notes, setNotes] = useState('');
  const [comments, setComments] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [detail, setDetail] = useState<PokeApiPokemonMini | null>(null);

  const parsedPokeApiId = useMemo(() => {
    const parsed = Number(pokeApiId);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
  }, [pokeApiId]);

  const validationError = useMemo(() => {
    if (notes.length > 500 || comments.length > 500) {
      return 'Notes and comments support max 500 characters';
    }

    return null;
  }, [comments.length, notes.length]);

  useEffect(() => {
    async function loadDetail() {
      if (!parsedPokeApiId) {
        pushToast('Invalid pokemon id', 'error');
        navigate('/pokemon/new', { replace: true });
        return;
      }

      setIsLoading(true);

      try {
        const response = await getPokemonMiniDetail(parsedPokeApiId);
        setDetail(response);
      } catch (error) {
        pushToast(getErrorMessage(error), 'error');
        navigate('/pokemon/new', { replace: true });
      } finally {
        setIsLoading(false);
      }
    }

    void loadDetail();
  }, [navigate, parsedPokeApiId, pushToast]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (validationError) {
      pushToast(validationError, 'error');
      return;
    }

    if (!detail) {
      pushToast('Pokemon detail not loaded yet', 'error');
      return;
    }

    setIsSaving(true);

    try {
      const created = await addFavorite({
        pokemon: detail.name,
        notes: notes.trim() || undefined,
        comments: comments.trim() || undefined,
      });

      pushToast('Pokemon added to favorites', 'success');
      navigate(`/pokemon/${created.id}`, { replace: true });
    } catch (error) {
      pushToast(getErrorMessage(error), 'error');
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return <Loader label="Loading pokemon detail..." />;
  }

  if (!detail) {
    return null;
  }

  return (
    <section className="page-card reveal-in">
      <header className="page-head">
        <div>
          <h2>Add Favorite Pokemon</h2>
          <p>Pokemon detail page with notes/comments before creating favorite.</p>
        </div>
      </header>

      <form className="catalog-detail-panel form-grid" onSubmit={handleSubmit} noValidate>
        <header className="detail-head">
          <img src={detail.artworkUrl ?? detail.spriteUrl ?? 'https://placehold.co/128x128?text=?'} alt={detail.name} />
          <div>
            <h2>{detail.name}</h2>
            <p>PokeAPI id: #{detail.id}</p>
            <div className="tag-row">
              {detail.types.map((type) => (
                <span key={type} className="tag">
                  {type}
                </span>
              ))}
            </div>
            <div className="meta-grid">
              <span>Height: {detail.height}</span>
              <span>Weight: {detail.weight}</span>
              <span>Base EXP: {detail.baseExperience}</span>
              <span>Abilities: {detail.abilities.slice(0, 3).join(', ')}</span>
            </div>
            <div className="stat-row">
              <span>HP {detail.stats.hp}</span>
              <span>ATK {detail.stats.attack}</span>
              <span>DEF {detail.stats.defense}</span>
              <span>SPD {detail.stats.speed}</span>
            </div>
          </div>
        </header>

        <label>
          Notes
          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            maxLength={500}
            placeholder="Battle strategy, abilities, etc."
          />
        </label>

        <label>
          Comments
          <textarea
            value={comments}
            onChange={(event) => setComments(event.target.value)}
            maxLength={500}
            placeholder="Extra observations"
          />
        </label>

        {validationError ? <p className="inline-error">{validationError}</p> : null}

        <div className="card-actions">
          <Link className="ghost-btn" to="/pokemon/new">
            Back to catalog
          </Link>
          <Link className="ghost-btn" to="/dashboard">
            Cancel
          </Link>
          <button type="submit" className="primary-btn" disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Create favorite'}
          </button>
        </div>
      </form>
    </section>
  );
}
