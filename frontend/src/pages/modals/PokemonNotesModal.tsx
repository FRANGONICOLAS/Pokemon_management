import type { FormEvent } from 'react';
import type { PokeApiPokemonMini } from '../../types/api';

interface PokemonNotesModalProps {
  isOpen: boolean;
  detail: PokeApiPokemonMini | null;
  pokemonName: string;
  notes: string;
  comments: string;
  isSaving: boolean;
  validationError: string | null;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onNotesChange: (value: string) => void;
  onCommentsChange: (value: string) => void;
}

export function PokemonNotesModal({
  isOpen,
  detail,
  pokemonName,
  notes,
  comments,
  isSaving,
  validationError,
  onClose,
  onSubmit,
  onNotesChange,
  onCommentsChange,
}: PokemonNotesModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-overlay" role="presentation" onClick={onClose}>
      <section
        className="modal-card"
        role="dialog"
        aria-modal="true"
        aria-label="Pokemon notes and comments"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="modal-head">
          <h3>{pokemonName}</h3>
          <button type="button" className="ghost-btn" onClick={onClose}>
            Close
          </button>
        </header>

        <div className="detail-head modal-detail-head">
          <img src={detail?.spriteUrl ?? 'https://placehold.co/128x128?text=?'} alt={pokemonName} />
          <div>
            <p>{detail ? `PokeAPI id: #${detail.id}` : 'Loading detail...'}</p>
            <div className="tag-row">
              {detail?.types.map((type) => (
                <span key={type} className="tag">
                  {type}
                </span>
              ))}
            </div>
          </div>
        </div>

        <form className="form-grid" onSubmit={onSubmit} noValidate>
          <label>
            Notes
            <textarea
              value={notes}
              onChange={(event) => onNotesChange(event.target.value)}
              maxLength={500}
              placeholder="Battle strategy, abilities, etc."
            />
          </label>

          <label>
            Comments
            <textarea
              value={comments}
              onChange={(event) => onCommentsChange(event.target.value)}
              maxLength={500}
              placeholder="Extra observations"
            />
          </label>

          {validationError ? <p className="inline-error">{validationError}</p> : null}

          <div className="card-actions">
            <button type="button" className="ghost-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="primary-btn" disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Create favorite'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
