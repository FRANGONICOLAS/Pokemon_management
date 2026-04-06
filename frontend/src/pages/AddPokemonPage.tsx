import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader } from '../components/Loader';
import { useToast } from '../hooks/useToast';
import { getErrorMessage } from '../lib/errors';
import { getPokemonMiniDetail, listAllPokemons } from '../services/pokeApiCatalog';
import type { PokeApiCatalogItem, PokeApiPokemonMini } from '../types/api';

export function AddPokemonPage() {
  const navigate = useNavigate();
  const { pushToast } = useToast();
  const [catalog, setCatalog] = useState<PokeApiCatalogItem[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [catalogSearch, setCatalogSearch] = useState('');
  const [catalogPage, setCatalogPage] = useState(1);
  const [catalogDetails, setCatalogDetails] = useState<Record<number, PokeApiPokemonMini>>({});

  useEffect(() => {
    async function loadCatalog() {
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
  }, [pushToast]);

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
      if (visibleCatalogItems.length === 0) {
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
  }, [catalogDetails, pushToast, visibleCatalogItems]);

  return (
    <section className="page-card reveal-in">
      <header className="page-head">
        <div>
          <h2>Add Favorite Pokemon</h2>
          <p>Choose a pokemon card to open a new page with details and notes/comments.</p>
        </div>
      </header>

      <section className="catalog-section">
        <header className="catalog-head">
          <h3>Pokemon Catalog</h3>
          <p>Click a card and continue in its dedicated page.</p>
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
                  <article key={item.id} className="catalog-card">
                    <button
                      type="button"
                      className="catalog-select"
                      onClick={() => navigate(`/pokemon/new/${item.id}`)}
                      title="Open pokemon page"
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
                      <p className="catalog-meta">
                        {detail
                          ? `EXP ${detail.baseExperience} | HT ${detail.height} | WT ${detail.weight}`
                          : 'Loading stats...'}
                      </p>
                    </button>
                  </article>
                );
              })}
            </div>

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
    </section>
  );
}
