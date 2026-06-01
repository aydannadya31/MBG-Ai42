import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { 
  BarChart4, 
  Sparkles, 
  Cpu, 
  Download, 
  Heart,
  TrendingUp,
  Award
} from 'lucide-react';
import { GenerationRecord, ThemeConfig } from '../types';

interface ReportsWorkspaceProps {
  generations: GenerationRecord[];
  lang: ThemeConfig['lang'];
  themeConfig: ThemeConfig;
}

export default function ReportsWorkspace({
  generations,
  lang,
  themeConfig
}: ReportsWorkspaceProps) {
  const isTr = lang === 'tr';
  const isDark = themeConfig.mode === 'dark';

  const t = {
    empty: isTr ? 'Analiz için yeterli görsel bulunmuyor. Birkaç üretimin ardından analizler burada gösterilecektir!' : 'Not enough data for analytics. Generate a few images first!',
    title: isTr ? 'Etkinlik Raporlama ve Performans Analizi' : 'Activity & Performance Analytics',
    subtitle: isTr ? 'Yapay zeka robotlarının verimlilik ve kullanım oranları' : 'Efficiency and usage of AI models',
    statTotal: isTr ? 'Toplam Görsel' : 'Total Images',
    statFavs: isTr ? 'Toplam Favori' : 'Total Favorites',
    statProAttempts: isTr ? 'Pro Verimliliği' : 'Pro Efficiency',
    statB2Attempts: isTr ? 'B2 Tercihi' : 'B2 Preference',
    chartUsageTitle: isTr ? 'Model Dağılım Payı' : 'Model Allocation Share',
    chartTimelineTitle: isTr ? 'Son Dönem Üretim Hızı' : 'Recent Generation Frequency',
    chartResTitle: isTr ? 'Tercih Edilen Çözünürlük Dağılımı' : 'Preferred Resolution Breakdown'
  };

  if (generations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center min-h-[400px]">
        <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-full flex items-center justify-center mb-4 text-zinc-400">
          <BarChart4 size={24} />
        </div>
        <p className="max-w-m text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
          {t.empty}
        </p>
      </div>
    );
  }

  // 1. Calculate count of models
  const modelStats = {
    Pro: generations.filter(g => g.modelUsed === 'Nano Banana Pro').length,
    Banana2: generations.filter(g => g.modelUsed === 'Nano Banana 2').length,
    Fallback: generations.filter(g => g.modelUsed === 'Fallback AI').length
  };

  const modelChartData = [
    { name: 'Nano Banana Pro', value: modelStats.Pro, color: '#4f46e5' },
    { name: 'Nano Banana 2', value: modelStats.Banana2, color: '#10b981' },
    { name: 'Fallback AI', value: modelStats.Fallback, color: '#f59e0b' }
  ].filter(item => item.value > 0);

  // 2. Timeline calculations (e.g. over past 7 days)
  const timelineMap: Record<string, number> = {};
  generations.forEach(g => {
    // group by day
    const dateStr = new Date(g.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' });
    timelineMap[dateStr] = (timelineMap[dateStr] || 0) + 1;
  });

  const timelineChartData = Object.keys(timelineMap).map(date => ({
    date,
    count: timelineMap[date]
  })).reverse().slice(-7); // take last 7 distinct days

  // 3. Resolutions calculations
  const resStats = {
    '1k': generations.filter(g => g.resolutionSelected === '1k').length,
    '2k': generations.filter(g => g.resolutionSelected === '2k').length,
    '4k': generations.filter(g => g.resolutionSelected === '4k').length
  };

  // if no resolution selected, guess standard 8k UHD fallback
  const resChartData = [
    { name: '1K Standard', count: resStats['1k'] || 0 },
    { name: '2K High', count: resStats['2k'] || 0 },
    { name: '4K Ultra HD', count: resStats['4k'] || generations.filter(g => !g.resolutionSelected).length }
  ];

  const totalFavs = generations.filter(g => g.isFavorite).length;

  return (
    <div className="space-y-6">
      
      {/* Overview stats layout cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white dark:bg-zinc-950 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 rounded-xl flex items-center justify-center">
            <Sparkles size={18} />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 block">{t.statTotal}</span>
            <span className="text-xl font-bold text-zinc-900 dark:text-white">{generations.length}</span>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-950 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-xl flex items-center justify-center">
            <Heart size={18} fill="currentColor" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 block">{t.statFavs}</span>
            <span className="text-xl font-bold text-zinc-900 dark:text-white">{totalFavs}</span>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-950 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center">
            <Cpu size={18} />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 block">{t.statProAttempts}</span>
            <span className="text-xl font-bold text-zinc-900 dark:text-white">
              {Math.round((modelStats.Pro / generations.length) * 100) || 0}%
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-950 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-xl flex items-center justify-center">
            <Download size={18} />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 block">8K Render</span>
            <span className="text-xl font-bold text-zinc-900 dark:text-white">Active</span>
          </div>
        </div>

      </div>

      {/* Grid: Charts layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Timeline Line/Area chart */}
        <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-5 rounded-2xl shadow-sm">
          <span className="text-xs font-bold uppercase tracking-widest text-zinc-400 block mb-4 flex items-center gap-1.5">
            <TrendingUp size={14} className="text-primary-500" />
            {t.chartTimelineTitle}
          </span>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timelineChartData}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary-600)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--primary-600)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#27272a' : '#f1f5f9'} />
                <XAxis dataKey="date" stroke={isDark ? '#71717a' : '#94a3b8'} fontSize={10} />
                <YAxis stroke={isDark ? '#71717a' : '#94a3b8'} fontSize={10} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: isDark ? '#18181b' : '#ffffff', 
                    borderColor: isDark ? '#27272a' : '#e2e8f0',
                    color: isDark ? '#ffffff' : '#000000' 
                  }} 
                />
                <Area type="monotone" dataKey="count" stroke="var(--primary-600)" fillOpacity={1} fill="url(#colorCount)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Allocations Pie Chart */}
        <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-5 rounded-2xl shadow-sm">
          <span className="text-xs font-bold uppercase tracking-widest text-zinc-400 block mb-4 flex items-center gap-1.5">
            <Award size={14} className="text-primary-500" />
            {t.chartUsageTitle}
          </span>
          <div className="h-64 flex flex-col md:flex-row items-center justify-center gap-4">
            <div className="w-40 h-40">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={modelChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {modelChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {/* Visual Legends */}
            <div className="space-y-2 text-xs">
              {modelChartData.map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></span>
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200">{item.name}:</span>
                  <span className="font-bold text-zinc-500">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Resolutions preferences bar chart */}
        <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-5 rounded-2xl shadow-sm lg:col-span-2">
          <span className="text-xs font-bold uppercase tracking-widest text-zinc-400 block mb-4 flex items-center gap-1.5">
            <Download size={14} className="text-primary-500" />
            {t.chartResTitle}
          </span>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={resChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#27272a' : '#f1f5f9'} />
                <XAxis dataKey="name" stroke={isDark ? '#71717a' : '#94a3b8'} fontSize={10} />
                <YAxis stroke={isDark ? '#71717a' : '#94a3b8'} fontSize={10} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: isDark ? '#18181b' : '#ffffff', 
                    borderColor: isDark ? '#27272a' : '#e2e8f0' 
                  }} 
                />
                <Bar dataKey="count" fill="#10b981" radius={[8, 8, 0, 0]} maxBarSize={45} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
}
