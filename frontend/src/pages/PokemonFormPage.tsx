import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getFavoriteById, updateFavorite } from '../services/pokemonApi';
import { getErrorMessage } from '../lib/errors';
import { Loader } from '../components/Loader';
import { useToast } from '../hooks/useToast';

export function PokemonFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { pushToast } = useToast();
  const [pokemon, setPokemon] = useState('');
  const [notes, setNotes] = useState('');
  const [comments, setComments] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function loadCurrent() {
      if (!id) {
        return;
      }

      setIsLoading(true);

      try {
        const item = await getFavoriteById(id);
        setPokemon(item.pokemon.name);
        setNotes(item.notes ?? '');
        setComments(item.comments ?? '');
      } catch (error) {
        pushToast(getErrorMessage(error), 'error');
        navigate('/dashboard', { replace: true });
      } finally {
        setIsLoading(false);
      }
    }

    void loadCurrent();
  }, [id, navigate, pushToast]);

  const validationError = useMemo(() => {
    if (notes.length > 500 || comments.length > 500) {
      return 'Notes and comments support max 500 characters';
    }

    return null;
  }, [comments.length, notes.length]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (validationError) {
      pushToast(validationError, 'error');
      return;
    }

    if (!id) {
      pushToast('Favorite id is missing', 'error');
      return;
    }

    setIsSaving(true);

    try {
      const updated = await updateFavorite(id, {
        notes: notes.trim() || undefined,
        comments: comments.trim() || undefined,
      });

      pushToast('Favorite updated successfully', 'success');
      navigate(`/pokemon/${updated.id}`, { replace: true });
    } catch (error) {
      pushToast(getErrorMessage(error), 'error');
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return <Loader label="Loading form..." />;
  }

  return (
    <section className="page-card reveal-in">
      <header className="page-head">
        <div>
          <h2>Edit Favorite Pokemon</h2>
          <p>Update your notes and comments.</p>
        </div>
      </header>

      <form className="form-grid" onSubmit={handleSubmit} noValidate>
        <label>
          Pokemon Name
          <input type="text" value={pokemon} onChange={(event) => setPokemon(event.target.value)} disabled />
        </label>

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
          <Link className="ghost-btn" to={`/pokemon/${id}`}>
            Cancel
          </Link>
          <button type="submit" className="primary-btn" disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save changes'}
          </button>
        </div>
      </form>
    </section>
  );
}
