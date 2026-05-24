import { useState, useMemo } from 'react';
import { Download, Copy, Check, FileJson, FileSpreadsheet, FileText } from 'lucide-react';
import { getTmdbImageUrl } from '@/utils/image';
import Modal from '@/components/patterns/Modal';
import Button from '@/components/ui/Button';
import { useToast } from '@/hooks/useToast';
import type { Collection, CollectionMedia } from '@/types/collections.types';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  collection: Collection;
  mediaItems: CollectionMedia[];
}

type ExportFormat = 'json' | 'csv' | 'text';

interface ExportFields {
  title: boolean;
  year: boolean;
  tmdbId: boolean;
  mediaType: boolean;
  rating: boolean;
  status: boolean;
  addedAt: boolean;
  posterUrl: boolean;
}

const ExportModal = ({ isOpen, onClose, collection, mediaItems }: ExportModalProps) => {
  const { success, error } = useToast();
  const [format, setFormat] = useState<ExportFormat>('json');
  const [separator, setSeparator] = useState(' - ');
  const [isCopied, setIsCopied] = useState(false);
  
  const [fields, setFields] = useState<ExportFields>({
    title: true,
    year: true,
    tmdbId: false,
    mediaType: true,
    rating: false,
    status: false,
    addedAt: false,
    posterUrl: false,
  });

  const handleFieldToggle = (key: keyof ExportFields) => {
    // If it's title, we can prevent disabling it to ensure the list remains readable
    if (key === 'title') return;
    setFields(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Generate the formatted output
  const formattedOutput = useMemo(() => {
    if (mediaItems.length === 0) return 'No items in this collection to export.';

    if (format === 'json') {
      const data = mediaItems.map(item => {
        const obj: Record<string, any> = {};
        if (fields.title) obj.title = item.title;
        if (fields.year) obj.year = item.release_date?.split('-')[0] || '';
        if (fields.tmdbId) obj.tmdb_id = item.tmdb_id;
        if (fields.mediaType) obj.media_type = item.media_type;
        if (fields.rating) obj.vote_average = item.vote_average;
        if (fields.status) obj.status = item.status || 'planned';
        if (fields.addedAt) obj.added_at = new Date(item.added_at).toISOString();
        if (fields.posterUrl) {
          obj.poster_url = getTmdbImageUrl(item.poster_path, 'w500') || '';
        }
        return obj;
      });
      return JSON.stringify(data, null, 2);
    }

    if (format === 'csv') {
      const headers: string[] = [];
      if (fields.title) headers.push('Title');
      if (fields.year) headers.push('Year');
      if (fields.tmdbId) headers.push('TMDb ID');
      if (fields.mediaType) headers.push('Media Type');
      if (fields.rating) headers.push('Rating');
      if (fields.status) headers.push('Status');
      if (fields.addedAt) headers.push('Added At');
      if (fields.posterUrl) headers.push('Poster URL');

      const csvRows = [headers.join(',')];

      mediaItems.forEach(item => {
        const rowValues: string[] = [];
        
        const escapeCsv = (str: string) => {
          const escaped = str.replace(/"/g, '""');
          return `"${escaped}"`;
        };

        if (fields.title) rowValues.push(escapeCsv(item.title));
        if (fields.year) rowValues.push(escapeCsv(item.release_date?.split('-')[0] || ''));
        if (fields.tmdbId) rowValues.push(String(item.tmdb_id));
        if (fields.mediaType) rowValues.push(escapeCsv(item.media_type));
        if (fields.rating) rowValues.push(String(item.vote_average));
        if (fields.status) rowValues.push(escapeCsv(item.status || 'planned'));
        if (fields.addedAt) rowValues.push(escapeCsv(new Date(item.added_at).toISOString()));
        if (fields.posterUrl) {
          rowValues.push(escapeCsv(getTmdbImageUrl(item.poster_path, 'w500') || ''));
        }

        csvRows.push(rowValues.join(','));
      });

      return csvRows.join('\n');
    }

    if (format === 'text') {
      return mediaItems.map(item => {
        const rowParts: string[] = [];
        if (fields.title) rowParts.push(item.title);
        if (fields.year) {
          const year = item.release_date?.split('-')[0];
          if (year) rowParts.push(`(${year})`);
        }
        if (fields.mediaType) rowParts.push(`[${item.media_type.toUpperCase()}]`);
        if (fields.rating) rowParts.push(`★ ${item.vote_average.toFixed(1)}`);
        if (fields.status) rowParts.push(`Status: ${item.status || 'planned'}`);
        if (fields.addedAt) rowParts.push(`Added: ${new Date(item.added_at).toLocaleDateString()}`);
        if (fields.tmdbId) rowParts.push(`ID: ${item.tmdb_id}`);
        if (fields.posterUrl) {
          const url = getTmdbImageUrl(item.poster_path, 'w185');
          if (url) rowParts.push(url);
        }
        return rowParts.join(separator);
      }).join('\n');
    }

    return '';
  }, [mediaItems, format, fields, separator]);

  // Copy to clipboard action
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(formattedOutput);
      setIsCopied(true);
      success('Copied to clipboard!');
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      error('Failed to copy to clipboard');
    }
  };

  // Download file action
  const handleDownload = () => {
    try {
      const sanitizedName = collection.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      let extension = 'txt';
      let mimeType = 'text/plain';

      if (format === 'json') {
        extension = 'json';
        mimeType = 'application/json';
      } else if (format === 'csv') {
        extension = 'csv';
        mimeType = 'text/csv';
      }

      const blob = new Blob([formattedOutput], { type: `${mimeType};charset=utf-8;` });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${sanitizedName}-export.${extension}`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      success('Download started');
    } catch (err) {
      error('Failed to download file');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Export List: ${collection.name}`}
      maxWidth="max-w-4xl"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[400px]">
        {/* Settings Column */}
        <div className="lg:col-span-5 space-y-6 flex flex-col justify-between">
          <div className="space-y-6">
            {/* Format Selection */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-text-secondary">Export Format</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setFormat('json')}
                  className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border transition-all duration-300 ${
                    format === 'json'
                      ? 'bg-brand-primary/10 border-brand-primary/40 text-brand-primary shadow-lg shadow-brand-primary/5'
                      : 'bg-white/5 border-white/5 text-text-secondary hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <FileJson className="w-5 h-5" />
                  <span className="text-xs font-semibold">JSON</span>
                </button>
                <button
                  onClick={() => setFormat('csv')}
                  className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border transition-all duration-300 ${
                    format === 'csv'
                      ? 'bg-brand-primary/10 border-brand-primary/40 text-brand-primary shadow-lg shadow-brand-primary/5'
                      : 'bg-white/5 border-white/5 text-text-secondary hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <FileSpreadsheet className="w-5 h-5" />
                  <span className="text-xs font-semibold">CSV</span>
                </button>
                <button
                  onClick={() => setFormat('text')}
                  className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border transition-all duration-300 ${
                    format === 'text'
                      ? 'bg-brand-primary/10 border-brand-primary/40 text-brand-primary shadow-lg shadow-brand-primary/5'
                      : 'bg-white/5 border-white/5 text-text-secondary hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <FileText className="w-5 h-5" />
                  <span className="text-xs font-semibold">Plain Text</span>
                </button>
              </div>
            </div>

            {/* Field Checkboxes */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-text-secondary">Include Fields</label>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 p-4 rounded-2xl bg-white/5 border border-white/5">
                {/* Title (Always included/disabled) */}
                <label className="flex items-center gap-2.5 cursor-not-allowed opacity-60">
                  <input
                    type="checkbox"
                    checked={fields.title}
                    disabled
                    className="w-4 h-4 rounded border-white/10 bg-white/5 text-brand-primary focus:ring-brand-primary"
                  />
                  <span className="text-sm font-medium text-white select-none">Title</span>
                </label>

                {/* Year */}
                <label className="flex items-center gap-2.5 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={fields.year}
                    onChange={() => handleFieldToggle('year')}
                    className="w-4 h-4 rounded border-white/10 bg-white/5 text-brand-primary focus:ring-brand-primary cursor-pointer transition-all group-hover:border-brand-primary"
                  />
                  <span className="text-sm font-medium text-text-secondary group-hover:text-white select-none transition-colors">Release Year</span>
                </label>

                {/* Media Type */}
                <label className="flex items-center gap-2.5 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={fields.mediaType}
                    onChange={() => handleFieldToggle('mediaType')}
                    className="w-4 h-4 rounded border-white/10 bg-white/5 text-brand-primary focus:ring-brand-primary cursor-pointer transition-all group-hover:border-brand-primary"
                  />
                  <span className="text-sm font-medium text-text-secondary group-hover:text-white select-none transition-colors">Media Type</span>
                </label>

                {/* Rating */}
                <label className="flex items-center gap-2.5 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={fields.rating}
                    onChange={() => handleFieldToggle('rating')}
                    className="w-4 h-4 rounded border-white/10 bg-white/5 text-brand-primary focus:ring-brand-primary cursor-pointer transition-all group-hover:border-brand-primary"
                  />
                  <span className="text-sm font-medium text-text-secondary group-hover:text-white select-none transition-colors">TMDb Rating</span>
                </label>

                {/* TMDb ID */}
                <label className="flex items-center gap-2.5 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={fields.tmdbId}
                    onChange={() => handleFieldToggle('tmdbId')}
                    className="w-4 h-4 rounded border-white/10 bg-white/5 text-brand-primary focus:ring-brand-primary cursor-pointer transition-all group-hover:border-brand-primary"
                  />
                  <span className="text-sm font-medium text-text-secondary group-hover:text-white select-none transition-colors">TMDb ID</span>
                </label>

                {/* Status */}
                <label className="flex items-center gap-2.5 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={fields.status}
                    onChange={() => handleFieldToggle('status')}
                    className="w-4 h-4 rounded border-white/10 bg-white/5 text-brand-primary focus:ring-brand-primary cursor-pointer transition-all group-hover:border-brand-primary"
                  />
                  <span className="text-sm font-medium text-text-secondary group-hover:text-white select-none transition-colors">Watch Status</span>
                </label>

                {/* Added Date */}
                <label className="flex items-center gap-2.5 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={fields.addedAt}
                    onChange={() => handleFieldToggle('addedAt')}
                    className="w-4 h-4 rounded border-white/10 bg-white/5 text-brand-primary focus:ring-brand-primary cursor-pointer transition-all group-hover:border-brand-primary"
                  />
                  <span className="text-sm font-medium text-text-secondary group-hover:text-white select-none transition-colors">Added Date</span>
                </label>

                {/* Poster URL */}
                <label className="flex items-center gap-2.5 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={fields.posterUrl}
                    onChange={() => handleFieldToggle('posterUrl')}
                    className="w-4 h-4 rounded border-white/10 bg-white/5 text-brand-primary focus:ring-brand-primary cursor-pointer transition-all group-hover:border-brand-primary"
                  />
                  <span className="text-sm font-medium text-text-secondary group-hover:text-white select-none transition-colors">Poster URL</span>
                </label>
              </div>
            </div>

            {/* Plain Text Separator Setting */}
            {format === 'text' && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-text-secondary">Separator (Plain Text)</label>
                <input
                  type="text"
                  value={separator}
                  onChange={(e) => setSeparator(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-brand-primary transition-colors"
                  placeholder="e.g.  -  or , "
                />
                <p className="text-[10px] text-text-secondary">Separates the chosen fields on each line.</p>
              </div>
            )}
          </div>

          {/* Footer Info */}
          <div className="pt-4 border-t border-white/5 hidden lg:block">
            <p className="text-xs text-text-secondary leading-relaxed">
              Exporting <strong className="text-primary">{mediaItems.length}</strong> items in 
              <strong className="text-primary font-mono uppercase"> {format}</strong> format.
            </p>
          </div>
        </div>

        {/* Live Preview Column */}
        <div className="lg:col-span-7 flex flex-col space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-text-secondary flex items-center justify-between">
            <span>Live Preview</span>
            <span className="text-[10px] text-brand-secondary font-mono">Sample</span>
          </label>
          
          <div className="flex-1 min-h-[250px] lg:min-h-[350px] max-h-[380px] bg-black/40 border border-white/10 rounded-2xl p-4 font-mono text-xs text-brand-light overflow-auto custom-scrollbar whitespace-pre shadow-inner">
            {formattedOutput}
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              onClick={handleCopy}
              variant="outline"
              size="sm"
              className="rounded-xl flex items-center gap-1.5 h-10 px-4"
              disabled={mediaItems.length === 0}
            >
              {isCopied ? (
                <>
                  <Check className="w-4 h-4 text-success" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy</span>
                </>
              )}
            </Button>
            <Button
              onClick={handleDownload}
              variant="primary"
              size="sm"
              className="rounded-xl flex items-center gap-1.5 h-10 px-4"
              disabled={mediaItems.length === 0}
            >
              <Download className="w-4 h-4" />
              <span>Download File</span>
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ExportModal;
