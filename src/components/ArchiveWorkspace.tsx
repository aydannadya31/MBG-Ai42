import React, { useState } from 'react';
import { 
  Trash2, 
  Download, 
  ExternalLink, 
  Calendar, 
  Cpu, 
  Heart,
  Grid,
  List,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { GenerationRecord, ThemeConfig } from '../types';

interface ArchiveWorkspaceProps {
  generations: GenerationRecord[];
  onDeleteGeneration: (id: string) => void;
  lang: ThemeConfig['lang'];
  themeConfig: ThemeConfig;
  onToggleFavorite: (id: string) => void;
}

export default function ArchiveWorkspace({
  generations,
  onDeleteGeneration,
  lang,
  themeConfig,
  onToggleFavorite
}: ArchiveWorkspaceProps) {
  const isTr = lang === 'tr';
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [expandedPrompts, setExpandedPrompts] = useState<Record<string, boolean>>({});

  const t = {
    empty: isTr ? 'Arşivinizde henüz görsel bulunmuyor. Sol panelden üretmeye başlayın!' : 'No visuals in your archive yet. Start generating on the main workspace!',
    title: isTr ? 'Görsel Arşivim' : 'My Visual Archive',
    model: isTr ? 'Yapay Zeka' : 'Model',
    created: isTr ? 'Üretim Tarihi' : 'Generated At',
    deleteTip: isTr ? 'Görseli Sil' : 'Delete Visual',
    downloadTip: isTr ? 'Görseli İndir' : 'Download Image',
    promptHead: isTr ? 'Uygulanan Prompt' : 'Applied Prompt',
    favTip: isTr ? 'Favorilere Ekle/Çıkar' : 'Toggle Favorite',
    engineUsed: isTr ? 'Kullanılan Robot' : 'Engine Code'
  };

  const togglePromptExpand = (id: string) => {
    setExpandedPrompts(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleDownload = (record: GenerationRecord) => {
    const link = document.createElement('a');
    link.href = record.imageUrl;
    link.download = `mbg-ai42-${record.id}-8k.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (generations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center min-h-[400px]">
        <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-full flex items-center justify-center mb-4 text-zinc-400">
          <Trash2 size={24} />
        </div>
        <p className="max-w-md text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
          {t.empty}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* View modes toggle header */}
      <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4">
        <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
          <span>{t.title}</span>
          <span className="text-xs bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 font-semibold px-2 py-0.5 rounded-full">
            {generations.length}
          </span>
        </h3>
        
        <div className="flex bg-zinc-100 dark:bg-zinc-900 p-1 rounded-lg border border-zinc-200 dark:border-zinc-800">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-md cursor-pointer transition-colors ${viewMode === 'grid' ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-600'}`}
          >
            <Grid size={15} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded-md cursor-pointer transition-colors ${viewMode === 'list' ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-600'}`}
          >
            <List size={15} />
          </button>
        </div>
      </div>

      {/* Main Container */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {generations.map(record => {
            const isExpanded = expandedPrompts[record.id];
            
            return (
              <div 
                key={record.id} 
                className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col group relative"
              >
                {/* Image Wrap */}
                <div className="relative aspect-[4/3] bg-zinc-900 overflow-hidden cursor-zoom-in group" onClick={() => setSelectedImage(record.imageUrl)}>
                  <img 
                    src={record.imageUrl} 
                    alt={record.originalPrompt} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  {/* Floating Actions on Hover */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2.5">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDownload(record); }}
                      className="p-2.5 bg-white/90 hover:bg-white text-zinc-900 rounded-full shadow-lg transition-transform hover:scale-110 cursor-pointer"
                      title={t.downloadTip}
                    >
                      <Download size={15} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); onToggleFavorite(record.id); }}
                      className={`p-2.5 rounded-full shadow-lg transition-transform hover:scale-110 cursor-pointer ${record.isFavorite ? 'bg-rose-500 text-white' : 'bg-white/90 hover:bg-white text-zinc-900'}`}
                      title={t.favTip}
                    >
                      <Heart size={15} fill={record.isFavorite ? 'currentColor' : 'none'} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); onDeleteGeneration(record.id); }}
                      className="p-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-full shadow-lg transition-transform hover:scale-110 cursor-pointer"
                      title={t.deleteTip}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>

                  {/* AI engine tag */}
                  <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-md px-2 py-1 rounded-md text-[10px] font-mono font-bold text-white flex items-center gap-1.5 uppercase border border-white/10">
                    <Cpu size={10} className="text-amber-400" />
                    <span>{record.modelUsed}</span>
                  </div>
                </div>

                {/* Content Panel */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[10px] text-zinc-400">
                      <span className="flex items-center gap-1">
                        <Calendar size={11} />
                        {new Date(record.createdAt).toLocaleDateString()}
                      </span>
                      <span className="font-bold tracking-wider">{record.resolutionSelected || '8K UHD'}</span>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">{t.promptHead}</span>
                      <p className={`text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed ${isExpanded ? '' : 'line-clamp-2'}`}>
                        {record.originalPrompt}
                      </p>
                      {record.originalPrompt.length > 80 && (
                        <button
                          onClick={() => togglePromptExpand(record.id)}
                          className="text-[10px] text-primary-500 hover:underline flex items-center gap-0.5 font-bold cursor-pointer"
                        >
                          {isExpanded ? (
                            <><span>Gizle</span><ChevronUp size={12} /></>
                          ) : (
                            <><span>Tümünü Gör</span><ChevronDown size={12} /></>
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Mobile details delete button row */}
                  <div className="flex sm:hidden mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800 justify-end gap-2 text-xs">
                    <button
                      onClick={() => onToggleFavorite(record.id)}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1 ${record.isFavorite ? 'bg-rose-50 border-rose-200 text-rose-600' : 'bg-zinc-50 border-zinc-200 text-zinc-700'}`}
                    >
                      <Heart size={12} fill={record.isFavorite ? 'currentColor' : 'none'} />
                    </button>
                    <button
                      onClick={() => handleDownload(record)}
                      className="px-3 py-1.5 rounded-lg border border-zinc-200 bg-white text-zinc-700 text-xs font-bold"
                    >
                      {t.downloadTip}
                    </button>
                    <button
                      onClick={() => onDeleteGeneration(record.id)}
                      className="px-3 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-bold"
                    >
                      {t.deleteTip}
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      ) : (
        /* List Mode View Table */
        <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs text-zinc-600 dark:text-zinc-400">
            <thead className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="p-4">{t.promptHead}</th>
                <th className="p-4 hidden md:table-cell">{t.engineUsed}</th>
                <th className="p-4 hidden sm:table-cell">{t.created}</th>
                <th className="p-4 text-right">Eylemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {generations.map(record => (
                <tr key={record.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/10 group">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img 
                        src={record.imageUrl} 
                        alt="thumb" 
                        className="w-10 h-10 rounded-lg object-cover bg-zinc-100 border border-zinc-200 dark:border-zinc-800 cursor-zoom-in"
                        onClick={() => setSelectedImage(record.imageUrl)}
                        referrerPolicy="no-referrer"
                      />
                      <span className="font-semibold text-zinc-950 dark:text-zinc-200 line-clamp-1 max-w-sm lg:max-w-xl">
                        {record.originalPrompt}
                      </span>
                    </div>
                  </td>
                  <td className="p-4 font-mono font-bold hidden md:table-cell">{record.modelUsed}</td>
                  <td className="p-4 hidden sm:table-cell text-zinc-500">
                    {new Date(record.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button
                      onClick={() => onToggleFavorite(record.id)}
                      className={`p-1.5 rounded-lg border cursor-pointer ${record.isFavorite ? 'bg-rose-50 border-rose-200 text-rose-600' : 'bg-transparent border-zinc-200 hover:bg-zinc-50'}`}
                      title={t.favTip}
                    >
                      <Heart size={13} fill={record.isFavorite ? 'currentColor' : 'none'} />
                    </button>
                    <button
                      onClick={() => handleDownload(record)}
                      className="p-1.5 rounded-lg border border-zinc-200 hover:bg-zinc-50 cursor-pointer"
                      title={t.downloadTip}
                    >
                      <Download size={13} />
                    </button>
                    <button
                      onClick={() => onDeleteGeneration(record.id)}
                      className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg cursor-pointer"
                      title={t.deleteTip}
                    >
                      <Trash2 size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Lightbox Overlay zoom modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50 cursor-zoom-out animate-in fade-in duration-200"
          onClick={() => setSelectedImage(null)}
        >
          <img 
            src={selectedImage} 
            alt="zoom" 
            className="max-w-full max-h-full rounded-lg shadow-2xl object-contain animate-in zoom-in-95 duration-150"
            referrerPolicy="no-referrer"
          />
        </div>
      )}

    </div>
  );
}
