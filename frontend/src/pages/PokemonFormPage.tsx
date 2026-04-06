import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { addFavorite, getFavoriteById, updateFavorite } from '../services/pokemonApi';
import { getErrorMessage } from '../lib/errors';
import { Loader } from '../components/Loader';
import { useToast } from '../hooks/useToast';

interface PokemonFormPageProps {
  mode: 'create' | 'edit';
}

export function PokemonFormPage({ mode }: PokemonFormPageProps) {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { pushToast } = useToast();
  const [pokemon, setPokemon] = useState('');
  const [notes, setNotes] = useState('');
  const [comments, setComments] = useState('');
  const [isLoading, setIsLoading] = useState(mode === 'edit');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function loadCurrent() {
      if (mode !== 'edit' || !id) {
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
  }, [id, mode, navigate, pushToast]);

  const validationError = useMemo(() => {
    if (mode === 'create' && pokemon.trim().length === 0) {
      return 'Pokemon name or id is required';
    }

    if (notes.length > 500 || comments.length > 500) {
      return 'Notes and comments support max 500 characters';
    }

    return null;
  }, [comments.length, mode, notes.length, pokemon]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (validationError) {
      pushToast(validationError, 'error');
      return;
    }

    setIsSaving(true);

    try {
      if (mode === 'create') {
        const created = await addFavorite({
          pokemon: pokemon.trim().toLowerCase(),
          notes: notes.trim() || undefined,
          comments: comments.trim() || undefined,
        });

        pushToast('Pokemon added to favorites', 'success');
        navigate(`/pokemon/${created.id}`, { replace: true });
      } else {
        if (!id) {
          throw new Error('Favorite id is missing');
        }

        const updated = await updateFavorite(id, {
          notes: notes.trim() || undefined,
          comments: comments.trim() || undefined,
        });

        pushToast('Favorite updated successfully', 'success');
        navigate(`/pokemon/${updated.id}`, { replace: true });
      }
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
          <h2>{mode === 'create' ? 'Add Favorite Pokemon' : 'Edit Favorite Pokemon'}</h2>
          <p>Store your notes and comments for each pokemon in your collection.</p>
        </div>
      </header>

      <form className="form-grid" onSubmit={handleSubmit} noValidate>
        <label>
          Pokemon Name or PokeAPI id
          <input
            type="text"
            value={pokemon}
            onChange={(event) => setPokemon(event.target.value)}
            disabled={mode === 'edit'}
            placeholder="pikachu or 25"
            required={mode === 'create'}
          />
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
          <Link className="ghost-btn" to={mode === 'create' ? '/dashboard' : `/pokemon/${id}`}>
            Cancel
          </Link>
          <button type="submit" className="primary-btn" disabled={isSaving}>
            {isSaving ? 'Saving...' : mode === 'create' ? 'Create favorite' : 'Save changes'}
          </button>
        </div>
      </form>
    </section>
  );
}
