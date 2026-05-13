import { useState, useEffect, useRef, type ChangeEvent, type DragEvent } from 'react';
import { 
  Search, 
  Settings, 
  Copy, 
  ExternalLink, 
  MoreVertical, 
  Pin, 
  Trash2, 
  Flame,
  FileText,
  Link as LinkIcon,
  Image as ImageIcon,
  Clock,
  Upload,
  Plus
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '../hooks/useAuth';

const CONTENT_PREVIEW_LIMIT = 140;

const truncateText = (value: string, maxLength: number) => {
  if (!value) return '';
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength).trimEnd()}...`;
};

const ItemCard = ({ item, onDelete, onTogglePin }: { item: any, onDelete: (id: number) => void, onTogglePin: (id: number) => void }) => {
  const [showMenu, setShowMenu] = useState(false);

  const getIcon = () => {
    switch (item.type) {
      case 'link': return <LinkIcon className="w-5 h-5 text-teal-500" />;
      case 'file': return <FileText className="w-5 h-5 text-indigo-500" />;
      case 'image': return <ImageIcon className="w-5 h-5 text-purple-500" />;
      default: return <FileText className="w-5 h-5 text-slate-500" />;
    }
  };

  const isLink = (text: string) => {
    try {
      new URL(text);
      return true;
    } catch {
      return false;
    }
  };

  const displayTitle = item.title || truncateText(item.content || '', 48) || 'Untitled';
  const previewText = truncateText(item.content || '', CONTENT_PREVIEW_LIMIT);
  const typeLabel = item.type ? `${item.type.charAt(0).toUpperCase()}${item.type.slice(1)}` : 'Text';
  const typeStyles: Record<string, string> = {
    text: 'bg-slate-100 text-slate-600',
    link: 'bg-teal-50 text-teal-700',
    file: 'bg-indigo-50 text-indigo-700',
    image: 'bg-purple-50 text-purple-700',
  };
  const typeClass = typeStyles[item.type] || typeStyles.text;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: item.title,
          text: item.type === 'text' ? item.content : `Check out this ${item.type}`,
          url: isLink(item.content) || item.type === 'file' || item.type === 'image' ? item.content : window.location.href,
        });
      } catch (error) {
        console.log('Error sharing', error);
      }
    } else {
      navigator.clipboard.writeText(item.content);
      alert('Content copied to clipboard');
    }
    setShowMenu(false);
  };

  const isFileOrImage = item.type === 'file' || item.type === 'image';

  return (
    <div className={`bg-white border ${item.is_pinned ? 'border-amber-100 bg-amber-50/10' : 'border-slate-100'} rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow group relative min-h-[140px] flex flex-col justify-between`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="mt-1 bg-slate-50 p-2 rounded-lg">
            {getIcon()}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-medium text-slate-900 truncate">
              {displayTitle}
            </h3>
            {previewText && !isFileOrImage && (
              <p className="mt-1 text-sm text-slate-500 line-clamp-2 break-all">
                {previewText}
              </p>
            )}
            {item.type === 'image' && (
              <div className="mt-2 relative rounded-md overflow-hidden bg-slate-100 h-24">
                <img src={item.content} alt={item.title} className="object-cover w-full h-full" />
              </div>
            )}
            <div className="flex flex-wrap items-center gap-3 mt-2">
              <span className={`text-xs font-medium px-2 py-0.5 rounded ${typeClass}`}>
                {typeLabel}
              </span>
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatDistanceToNow(new Date(item.created_at))} ago
              </span>
              {item.is_pinned && (
                <span className="text-xs font-medium text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                  <Pin className="w-3 h-3" />
                  Pinned
                </span>
              )}
              {item.burn_after_read && (
                <span className="text-xs font-medium text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                  <Flame className="w-3 h-3" />
                  Burn
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-1 items-end">
          <div className="flex items-center gap-1">
            {isLink(item.content) && (
              <a href={item.content} target="_blank" rel="noopener noreferrer" className="p-2 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors" title="Open Link">
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
            {!isFileOrImage && (
              <button 
                onClick={() => navigator.clipboard.writeText(item.content)}
                className="p-2 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors" title="Copy Text"
              >
                <Copy className="w-4 h-4" />
              </button>
            )}
            <div className="relative">
              <button 
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
              {showMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-100 rounded-xl shadow-lg z-20 py-1 overflow-hidden">
                  <button 
                    onClick={() => { onTogglePin(item.id); setShowMenu(false); }}
                    className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <Pin className="w-4 h-4" />
                    {item.is_pinned ? 'Unpin' : 'Pin'}
                  </button>
                  <button 
                    onClick={handleShare}
                    className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Share
                  </button>
                  {isFileOrImage && (
                    <a 
                      href={item.content} 
                      download={item.title}
                      target="_blank" rel="noopener noreferrer"
                      className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                      onClick={() => setShowMenu(false)}
                    >
                      <Copy className="w-4 h-4" />
                      Download
                    </a>
                  )}
                  <button 
                    onClick={() => { onDelete(item.id); setShowMenu(false); }}
                    className="w-full text-left px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const InboxPage = () => {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [burnAfterRead, setBurnAfterRead] = useState(false);
  const [retentionDays, setRetentionDays] = useState('7');
  const [askEachTime, setAskEachTime] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'text' | 'link' | 'file' | 'image'>('all');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    fetchItems();
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const settings = await api.user.getSettings();
      if (settings) {
        setRetentionDays(String(settings.retention_days));
        setAskEachTime(settings.ask_each_time);
      }
    } catch (e) {
      console.error('Failed to fetch settings', e);
    }
  };

  const fetchItems = async () => {
    try {
      const data = await api.items.getAll();
      setItems(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch items');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!content.trim() && !selectedFile) return;
    setIsUploading(true);
    try {
      const parsedRetention = parseInt(retentionDays) || 7;
      if (selectedFile && !content.trim()) {
        await api.items.upload(selectedFile, { burn_after_read: burnAfterRead, retention_days: parsedRetention });
        setSelectedFile(null);
      } else {
        const type = content.startsWith('http') ? 'link' : 'text';
        await api.items.create({
          type,
          content,
          burn_after_read: burnAfterRead,
          retention_days: parsedRetention,
        });
        setContent('');
      }

      setBurnAfterRead(false);
      fetchItems();
    } catch (error) {
      console.error('Failed to save item');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: number) => {
    await api.items.delete(id);
    fetchItems();
  };

  const handleTogglePin = async (id: number) => {
    await api.items.togglePin(id);
    fetchItems();
  };

  const handlePickFile = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setSelectedFile(file);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0] || null;
    setSelectedFile(file);
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const filteredItems = items.filter(item => {
    const contentValue = (item.content || '').toLowerCase();
    const titleValue = (item.title || '').toLowerCase();
    const searchValue = search.toLowerCase();
    const matchesSearch = contentValue.includes(searchValue) || titleValue.includes(searchValue);
    const matchesType = filterType === 'all' || item.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-8">
      {/* Top Bar */}
      <header className="flex items-center justify-between gap-4 sticky top-0 bg-background/80 backdrop-blur-md z-10 py-2">
        <div className="flex items-center gap-2">
          <img src="/app_logo.png" alt="Klyp Logo" className="h-16 w-auto mix-blend-multiply" />
        </div>
        
        <div className="flex-1 max-w-md relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-teal-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Search items..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-teal-500/10 focus:border-teal-500 transition-all text-sm"
          />
        </div>

        <div className="flex items-center gap-2">
          <Link to="/settings" className="p-2 text-slate-500 hover:bg-white hover:shadow-sm rounded-full transition-all">
            <Settings className="w-5 h-5" />
          </Link>
          <button className="p-1 border border-slate-200 rounded-full">
            <div className="w-7 h-7 bg-teal-100 rounded-full flex items-center justify-center text-teal-700 text-xs font-bold uppercase">
              {user?.email?.substring(0, 2) || 'U'}
            </div>
          </button>
        </div>
      </header>

      {/* Composer Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-4">
        <div className="space-y-2">
          <textarea
            className="w-full min-h-[120px] p-4 text-lg border-none focus:ring-0 resize-none placeholder:text-slate-300"
            placeholder="Paste text or a link..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          
          <div className="flex flex-col gap-4 border-t border-slate-50 pt-4">
            <div className="flex items-center justify-between">
              <div className="flex flex-wrap items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <div className={`w-10 h-5 rounded-full p-1 transition-colors ${burnAfterRead ? 'bg-rose-500' : 'bg-slate-200'}`}>
                    <div className={`w-3 h-3 bg-white rounded-full transition-transform ${burnAfterRead ? 'translate-x-5' : 'translate-x-0'}`} />
                  </div>
                  <input 
                    type="checkbox" 
                    className="hidden" 
                    checked={burnAfterRead}
                    onChange={(e) => setBurnAfterRead(e.target.checked)}
                  />
                  <span className="text-sm font-medium text-slate-600 group-hover:text-slate-900 transition-colors">Burn after read</span>
                </label>

                {askEachTime && (
                  <>
                    <div className="h-4 w-px bg-slate-100 hidden sm:block" />
                    <select
                      value={retentionDays}
                      onChange={(e) => setRetentionDays(e.target.value)}
                      className="text-sm border-none bg-slate-50 rounded-md px-2 py-1 text-slate-600 outline-none focus:ring-2 focus:ring-teal-500/20"
                    >
                      <option value="1">Expire in 1 Day</option>
                      <option value="7">Expire in 7 Days</option>
                      <option value="30">Expire in 30 Days</option>
                    </select>
                  </>
                )}

                <div className="h-4 w-px bg-slate-100 hidden sm:block" />

                <button
                  type="button"
                  onClick={handlePickFile}
                  className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-teal-600 transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  Upload file (max 50MB)
                </button>
              </div>

              <button 
                onClick={handleSave}
                disabled={(!content.trim() && !selectedFile) || isUploading}
                className="bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-medium px-6 py-2 rounded-lg transition-all shadow-sm hover:shadow-md flex items-center gap-2 mt-4 sm:mt-0"
              >
                {isUploading ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                {isUploading ? 'Saving...' : 'Save'}
              </button>
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={handleFileChange}
            />
            <div
              onClick={handlePickFile}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              className="border-2 border-dashed border-slate-100 rounded-xl p-8 flex flex-col items-center justify-center gap-2 text-slate-400 hover:border-teal-100 hover:bg-teal-50/30 transition-all group cursor-pointer"
            >
              <Upload className="w-8 h-8 group-hover:text-teal-500 transition-colors" />
              <p className="text-sm font-medium group-hover:text-teal-600 transition-colors">Drag & drop files here</p>
              {selectedFile && (
                <p className="text-xs text-slate-500">Selected: {selectedFile.name}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Items List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-10 text-slate-400">Loading your inbox...</div>
        ) : filteredItems.length > 0 ? (
          <>
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Recent Items</h2>
              <button className="text-xs font-medium text-teal-600 hover:underline">Clear All</button>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {([
                { key: 'all', label: 'All' },
                { key: 'text', label: 'Text' },
                { key: 'link', label: 'Links' },
                { key: 'file', label: 'Files' },
                { key: 'image', label: 'Images' },
              ] as const).map(filter => (
                <button
                  key={filter.key}
                  type="button"
                  onClick={() => setFilterType(filter.key)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                    filterType === filter.key
                      ? 'bg-teal-600 border-teal-600 text-white'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-teal-200 hover:text-teal-700'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredItems.map(item => (
                <ItemCard key={item.id} item={item} onDelete={handleDelete} onTogglePin={handleTogglePin} />
              ))}
            </div>
          </>
        ) : (
          <div className="py-20 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center">
              <Copy className="w-10 h-10 text-slate-200" />
            </div>
            <div className="space-y-1">
              <p className="text-lg font-medium text-slate-900">
                {search ? 'No items match your search' : 'Your inbox is empty'}
              </p>
              <p className="text-slate-500 max-w-xs">
                {search ? 'Try a different search term.' : 'Paste something above to access it everywhere.'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InboxPage;
