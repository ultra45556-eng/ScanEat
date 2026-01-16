
import React, { useState, useEffect } from 'react';
import { AppTab, ScanResult, AppSettings } from './types';
import ScannerView from './components/ScannerView';
import ResultSheet from './components/ResultSheet';
import { 
  Scan, 
  History, 
  Settings as SettingsIcon, 
  Trash2, 
  Clock, 
  ChevronRight,
  Heart,
  Package
} from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.SCAN);
  const [scanHistory, setScanHistory] = useState<ScanResult[]>([]);
  const [favorites, setFavorites] = useState<ScanResult[]>([]);
  const [currentResult, setCurrentResult] = useState<ScanResult | null>(null);
  const [settings, setSettings] = useState<AppSettings>({
    vibrate: true,
    beep: true,
    autoOpenUrl: false,
    aiAnalysis: true,
  });

  useEffect(() => {
    const savedHistory = localStorage.getItem('scanHistory');
    const savedSettings = localStorage.getItem('appSettings');
    const savedFavorites = localStorage.getItem('scanFavorites');
    
    if (savedHistory) setScanHistory(JSON.parse(savedHistory));
    if (savedSettings) setSettings(JSON.parse(savedSettings));
    if (savedFavorites) setFavorites(JSON.parse(savedFavorites));
  }, []);

  useEffect(() => {
    localStorage.setItem('scanHistory', JSON.stringify(scanHistory));
  }, [scanHistory]);

  useEffect(() => {
    localStorage.setItem('scanFavorites', JSON.stringify(favorites));
  }, [favorites]);

  const handleScan = (result: ScanResult) => {
    const isFav = favorites.some(f => f.data === result.data);
    const enrichedResult = { ...result, isFavorite: isFav };
    setScanHistory(prev => [enrichedResult, ...prev.filter(i => i.data !== result.data)].slice(0, 100));
    setCurrentResult(enrichedResult);
  };

  const toggleFavorite = (result: ScanResult) => {
    const isFav = favorites.some(f => f.data === result.data);
    let newFavs;
    if (isFav) {
      newFavs = favorites.filter(f => f.data !== result.data);
    } else {
      newFavs = [{ ...result, isFavorite: true }, ...favorites];
    }
    setFavorites(newFavs);
    
    // Sync current result
    if (currentResult?.data === result.data) {
      setCurrentResult(prev => prev ? { ...prev, isFavorite: !isFav } : null);
    }
    
    // Sync history
    setScanHistory(prev => prev.map(item => 
      item.data === result.data ? { ...item, isFavorite: !isFav } : item
    ));
  };

  const clearHistory = () => {
    if (confirm('Clear all scan history?')) {
      setScanHistory([]);
    }
  };

  const updateSetting = (key: keyof AppSettings) => {
    const newSettings = { ...settings, [key]: !settings[key] };
    setSettings(newSettings);
    localStorage.setItem('appSettings', JSON.stringify(newSettings));
  };

  return (
    <div className="flex flex-col h-screen max-w-screen-md mx-auto relative bg-zinc-950">
      <main className="flex-1 relative overflow-hidden">
        {activeTab === AppTab.SCAN && (
          <ScannerView onScan={handleScan} settings={settings} />
        )}

        {(activeTab === AppTab.HISTORY || activeTab === AppTab.FAVORITES) && (
          <div className="h-full bg-zinc-950 flex flex-col pt-12">
            <div className="px-6 pb-4 flex justify-between items-end border-b border-white/5">
              <div>
                <h1 className="text-2xl font-bold">{activeTab === AppTab.HISTORY ? 'History' : 'Favorites'}</h1>
                <p className="text-zinc-500 text-sm">
                  {activeTab === AppTab.HISTORY ? scanHistory.length : favorites.length} items
                </p>
              </div>
              {activeTab === AppTab.HISTORY && scanHistory.length > 0 && (
                <button 
                  onClick={clearHistory}
                  className="p-2 text-zinc-400 hover:text-red-400 transition-colors"
                >
                  <Trash2 size={20} />
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-3">
              {(activeTab === AppTab.HISTORY ? scanHistory : favorites).length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-40">
                  {activeTab === AppTab.HISTORY ? <Clock size={48} /> : <Heart size={48} />}
                  <p>Nothing here yet</p>
                </div>
              ) : (
                (activeTab === AppTab.HISTORY ? scanHistory : favorites).map((item) => (
                  <div 
                    key={item.id} 
                    onClick={() => setCurrentResult(item)}
                    className="flex items-center bg-zinc-900 border border-white/5 p-4 rounded-2xl hover:bg-zinc-800 transition-colors cursor-pointer group"
                  >
                    <div className={`p-3 rounded-xl mr-4 ${
                      item.type === 'barcode' ? 'bg-green-500/10 text-green-400' : 'bg-indigo-500/10 text-indigo-400'
                    }`}>
                      {item.type === 'barcode' ? <Package size={20} /> : <Scan size={20} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-zinc-100 font-medium truncate mb-0.5">{item.data}</p>
                      <p className="text-zinc-500 text-xs">
                        {new Date(item.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                    {item.isFavorite && <Heart size={14} className="text-red-500 mr-2" fill="currentColor" />}
                    <ChevronRight size={18} className="text-zinc-600 group-hover:translate-x-1 transition-transform" />
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === AppTab.SETTINGS && (
          <div className="h-full bg-zinc-950 flex flex-col pt-12 px-6 overflow-y-auto">
            <h1 className="text-2xl font-bold mb-8">Settings</h1>
            
            <div className="space-y-6 pb-24">
              <section>
                <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">Feedback</h2>
                <div className="space-y-1">
                  <SettingItem label="Vibrate on success" active={settings.vibrate} onToggle={() => updateSetting('vibrate')} />
                  <SettingItem label="Beep on success" active={settings.beep} onToggle={() => updateSetting('beep')} />
                </div>
              </section>

              <section>
                <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">Integrations</h2>
                <div className="space-y-1">
                  <SettingItem label="AI Analysis" active={settings.aiAnalysis} onToggle={() => updateSetting('aiAnalysis')} />
                  <div className="p-4 bg-zinc-900 rounded-2xl border border-white/5 mt-2">
                    <p className="text-sm text-zinc-400 leading-relaxed">
                      Barcodes automatically search <span className="text-green-400 font-medium">OpenFoodFacts</span> for product nutritional data.
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">About</h2>
                <div className="bg-zinc-900 border border-white/5 rounded-2xl p-4">
                  <div className="flex justify-between items-center py-2">
                    <span className="text-zinc-300">Version</span>
                    <span className="text-zinc-500">2.0.0 (Food Edition)</span>
                  </div>
                </div>
              </section>
            </div>
          </div>
        )}
      </main>

      <nav className="h-20 bg-zinc-900/95 backdrop-blur-md border-t border-white/5 flex items-center justify-between px-6 pb-4 z-40">
        <NavButton active={activeTab === AppTab.HISTORY} icon={<History size={22} />} label="History" onClick={() => setActiveTab(AppTab.HISTORY)} />
        <NavButton active={activeTab === AppTab.FAVORITES} icon={<Heart size={22} />} label="Favs" onClick={() => setActiveTab(AppTab.FAVORITES)} />
        <div className="relative -top-4">
          <button 
            onClick={() => setActiveTab(AppTab.SCAN)}
            className={`p-5 rounded-full shadow-2xl transition-all active:scale-90 ${
              activeTab === AppTab.SCAN 
              ? 'bg-indigo-600 text-white shadow-indigo-500/30' 
              : 'bg-zinc-800 text-zinc-400'
            }`}
          >
            <Scan size={28} />
          </button>
        </div>
        <NavButton active={activeTab === AppTab.SETTINGS} icon={<SettingsIcon size={22} />} label="Set" onClick={() => setActiveTab(AppTab.SETTINGS)} />
      </nav>

      <ResultSheet 
        result={currentResult} 
        onClose={() => setCurrentResult(null)} 
        showAi={settings.aiAnalysis}
        onToggleFavorite={toggleFavorite}
      />
    </div>
  );
};

const NavButton = ({ active, icon, label, onClick }: any) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center space-y-1 w-12 transition-colors ${
      active ? 'text-indigo-400' : 'text-zinc-500'
    }`}
  >
    {icon}
    <span className="text-[10px] font-medium uppercase tracking-tighter">{label}</span>
  </button>
);

const SettingItem = ({ label, active, onToggle }: any) => (
  <button 
    onClick={onToggle}
    className="w-full flex justify-between items-center bg-zinc-900 p-4 first:rounded-t-2xl last:rounded-b-2xl border-b border-white/5 last:border-0 hover:bg-zinc-800 transition-colors"
  >
    <span className="text-zinc-200">{label}</span>
    <div className={`w-11 h-6 rounded-full p-1 transition-colors ${active ? 'bg-indigo-600' : 'bg-zinc-700'}`}>
      <div className={`w-4 h-4 bg-white rounded-full shadow-md transition-transform ${active ? 'translate-x-5' : 'translate-x-0'}`} />
    </div>
  </button>
);

export default App;
