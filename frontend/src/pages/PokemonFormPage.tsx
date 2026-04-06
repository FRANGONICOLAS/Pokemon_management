import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { addFavorite, getFavoriteById, updateFavorite } from '../services/pokemonApi';
import { getPokemonMiniDetail, listAllPokemons } from '../services/pokeApiCatalog';
import { getErrorMessage } from '../lib/errors';
import { Loader } from '../components/Loader';
import { useToast } from '../hooks/useToast';
import type { PokeApiCatalogItem, PokeApiPokemonMini } from '../types/api';
import { PokemonNotesModal } from './modals/PokemonNotesModal';

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
  const [catalog, setCatalog] = useState<PokeApiCatalogItem[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(mode === 'create');
  const [catalogSearch, setCatalogSearch] = useState('');
  const [catalogPage, setCatalogPage] = useState(1);
  const [catalogDetails, setCatalogDetails] = useState<Record<number, PokeApiPokemonMini>>({});
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);

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

  useEffect(() => {
    async function loadCatalog() {
      if (mode !== 'create') {
        return;
      }

      setCatalogLoading(true);

      try {
        const allPokemons = await listAllPokemons();
        setCatalog(allPokemons);
      } catch (error) {
        pushToast(getErrorMessage(error), 'error');
      } finally {
        setCatalogLoading(false);
      }
    }

    void loadCatalog();
  }, [mode, pushToast]);

  const validationError = useMemo(() => {
    if (mode === 'create' && pokemon.trim().length === 0) {
      return 'Pokemon name or id is required';
    }

    if (notes.length > 500 || comments.length > 500) {
      return 'Notes and comments support max 500 characters';
    }

    return null;
  }, [comments.length, mode, notes.length, pokemon]);

  const filteredCatalog = useMemo(() => {
    const query = catalogSearch.trim().toLowerCase();

    if (!query) {
      return catalog;
    }

    return catalog.filter((item) => {
      return item.name.toLowerCase().includes(query) || String(item.id).includes(query);
    });
  }, [catalog, catalogSearch]);

  const pageSize = 24;
  const catalogTotalPages = Math.max(1, Math.ceil(filteredCatalog.length / pageSize));
  const safeCatalogPage = Math.min(catalogPage, catalogTotalPages);
  const visibleCatalogItems = useMemo(() => {
    const offset = (safeCatalogPage - 1) * pageSize;
    return filteredCatalog.slice(offset, offset + pageSize);
  }, [filteredCatalog, safeCatalogPage]);

  useEffect(() => {
    if (catalogPage > catalogTotalPages) {
      setCatalogPage(catalogTotalPages);
    }
  }, [catalogPage, catalogTotalPages]);

  useEffect(() => {
    async function loadVisibleDetails() {
      if (mode !== 'create' || visibleCatalogItems.length === 0) {
        return;
      }

      const pending = visibleCatalogItems.filter((item) => !catalogDetails[item.id]);

      if (pending.length === 0) {
        return;
      }

      try {
        const details = await Promise.all(pending.map((item) => getPokemonMiniDetail(item.id)));

        setCatalogDetails((current) => {
          const next = { ...current };

          for (const detail of details) {
            next[detail.id] = detail;
          }

          return next;
        });
      } catch (error) {
        pushToast(getErrorMessage(error), 'error');
      }
    }

    void loadVisibleDetails();
  }, [catalogDetails, mode, pushToast, visibleCatalogItems]);

  const selectedCatalogDetail = useMemo(() => {
    if (!pokemon) {
      return null;
    }

    const found = Object.values(catalogDetails).find(
      (detail) => detail.name.toLowerCase() === pokemon.toLowerCase(),
    );

    return found ?? null;
  }, [catalogDetails, pokemon]);

  async function handleSelectCatalogCard(item: PokeApiCatalogItem) {
    setPokemon(item.name);
    setNotes('');
    setComments('');

    if (!catalogDetails[item.id]) {
      try {
        const detail = await getPokemonMiniDetail(item.id);

        setCatalogDetails((current) => ({
          ...current,
          [detail.id]: detail,
        }));
      } catch (error) {
        pushToast(getErrorMessage(error), 'error');
      }
    }

    setIsNotesModalOpen(true);
  }

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

      {mode === 'edit' ? (
        <form className="form-grid" onSubmit={handleSubmit} noValidate>
          <label>
            Pokemon Name or PokeAPI id
            <input
              type="text"
              value={pokemon}
              onChange={(event) => setPokemon(event.target.value)}
              disabled
              placeholder="pikachu or 25"
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
            <Link className="ghost-btn" to={`/pokemon/${id}`}>
              Cancel
            </Link>
            <button type="submit" className="primary-btn" disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save changes'}
            </button>
          </div>
        </form>
      ) : null}

      {mode === 'create' ? (
        <section className="catalog-section">
          <header className="catalog-head">
            <h3>Pokemon Catalog</h3>
            <p>Select a card to open details and add notes/comments.</p>
          </header>

          <div className="catalog-toolbar">
            <label>
              Search by name or id
              <input
                type="search"
                value={catalogSearch}
                onChange={(event) => {
                  setCatalogSearch(event.target.value);
                  setCatalogPage(1);
                }}
                placeholder="pikachu or 25"
              />
            </label>
          </div>

          {catalogLoading ? (
            <Loader label="Loading pokemon catalog..." />
          ) : (
            <>
              <div className="catalog-grid">
                {visibleCatalogItems.map((item) => {
                  const detail = catalogDetails[item.id];

                  return (
                    <article
                      key={item.id}
                      className={`catalog-card ${pokemon.toLowerCase() === item.name.toLowerCase() ? 'selected' : ''}`}
                    >
                      <button
                        type="button"
                        className="catalog-select"
                        onClick={() => {
                          void handleSelectCatalogCard(item);
                        }}
                        title="Open pokemon detail"
                      >
                        <img
                          src={detail?.spriteUrl ?? 'https://placehold.co/96x96?text=?'}
                          alt={item.name}
                          loading="lazy"
                        />
                        <h4>{item.name}</h4>
                        <p>#{item.id}</p>
                        <div className="tag-row">
                          {detail?.types?.map((type) => (
                            <span key={type} className="tag">
                              {type}
                            </span>
                          ))}
                        </div>
                      </button>
                    </article>
                  );
                })}
              </div>

              <section className="empty-state">
                <h3>Select a pokemon card</h3>
                <p>Click any card to open a modal with detail, notes and comments.</p>
              </section>

              <footer className="pagination-row">
                <button
                  type="button"
                  className="ghost-btn"
                  disabled={safeCatalogPage <= 1}
                  onClick={() => setCatalogPage((value) => Math.max(1, value - 1))}
                >
                  Previous
                </button>
                <p>
                  Page {safeCatalogPage} of {catalogTotalPages} ({filteredCatalog.length} results)
                </p>
                <button
                  type="button"
                  className="ghost-btn"
                  disabled={safeCatalogPage >= catalogTotalPages}
                  onClick={() => setCatalogPage((value) => Math.min(catalogTotalPages, value + 1))}
                >
                  Next
                </button>
              </footer>
            </>
          )}
        </section>
      ) : null}

      {mode === 'create' ? (
        <PokemonNotesModal
          isOpen={isNotesModalOpen}
          detail={selectedCatalogDetail}
          pokemonName={pokemon}
          notes={notes}
          comments={comments}
          isSaving={isSaving}
          validationError={validationError}
          onClose={() => setIsNotesModalOpen(false)}
          onSubmit={handleSubmit}
          onNotesChange={setNotes}
          onCommentsChange={setComments}
        />
      ) : null}
    </section>
  );
}
