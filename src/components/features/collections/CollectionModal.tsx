import { useState, useEffect } from 'react';
import Modal from '@/components/patterns/Modal';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import type { Collection } from '@/types/collections.types';

interface CollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; description: string; color: string; visibility: 'private' | 'public' }) => void;
  collection?: Collection | null;
  isLoading?: boolean;
}

// Semantic color palette for collections
const COLORS = [
  'var(--color-palette-indigo)',
  'var(--color-palette-cyan)',
  'var(--color-palette-violet)',
  'var(--color-palette-emerald)',
  'var(--color-palette-amber)',
  'var(--color-palette-rose)',
  'var(--color-palette-pink)',
  'var(--color-palette-lime)',
];

export const CollectionModal = ({ isOpen, onClose, onSubmit, collection, isLoading }: CollectionModalProps) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState(COLORS[0]!);
  const [visibility, setVisibility] = useState<'private' | 'public'>('private');

  useEffect(() => {
    if (collection) {
      setName(collection.name);
      setDescription(collection.description || '');
      setColor(collection.color || COLORS[0]!);
      setVisibility(collection.visibility);
    } else {
      setName('');
      setDescription('');
      setColor(COLORS[0]!);
      setVisibility('private');
    }
  }, [collection, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit({ name: name.trim(), description: description.trim(), color, visibility });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={collection ? 'Edit Collection' : 'Create Collection'}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label="Name"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Sci-Fi Masterpieces"
          required
          autoComplete="off"
          spellCheck={false}
        />

        <div className="space-y-2">
          <label htmlFor="description" className="text-sm font-medium text-foreground/80 ml-1">
            Description <span className="text-muted-foreground">(Optional)</span>
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="flex min-h-[100px] w-full rounded-xl border border-border bg-input px-4 py-2 text-base ring-offset-background transition-standard placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/50 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
            placeholder="What's this collection about?"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground/80 ml-1">Theme Color</label>
          <div className="flex gap-3 flex-wrap p-1">
            {COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`w-9 h-9 rounded-full transition-all duration-300 ring-offset-2 ring-offset-card ${color === c ? 'scale-110 ring-2 ring-white shadow-lg' : 'hover:scale-105 ring-1 ring-white/10 opacity-70 hover:opacity-100'}`}
                style={{ backgroundColor: c }}
                aria-label={`Select color ${c}`}
              />
            ))}
          </div>
        </div>

        <div className="pt-4 flex justify-end gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={!name.trim() || isLoading}
          >
            {isLoading ? 'Saving…' : collection ? 'Save Changes' : 'Create Collection'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CollectionModal;
