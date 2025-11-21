import React, { useState, useEffect } from 'react';
import { fetchAssets, fetchAssetHistory, subscribeToTicker, searchAssets } from './services/cryptoService';
import { CryptoAsset, ChartDataPoint, Timeframe } from './types';
import Chart from './components/Chart';
import GeminiPanel from './components/GeminiPanel';
import AssetStats from './components/AssetStats';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Search, 
  Menu,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  Loader2
} from 'lucide-react';

const App: React.FC = () => {
  const [assets, setAssets] = useState<CryptoAsset[]>([]); // The currently displayed list
  const [defaultAssets, setDefaultAssets] = useState<CryptoAsset[]>([]); // Cached top 100
  const [selectedAsset, setSelectedAsset] = useState<CryptoAsset | null>(null);
  const [historyData, setHistoryData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [timeframe, setTimeframe] = useState<Timeframe>('1H');

  // 1. Initial Data Fetch (Top 100)
  useEffect(() => {
    const loadData = async () => {
      if (assets.length === 0) setLoading(true);
      
      const data = await fetchAssets(100); // Fetch top 100 "tons" of coins
      
      setAssets(data);
      setDefaultAssets(data);

      if (data.length > 0 && !selectedAsset) {
        setSelectedAsset(data[0]);
      }
      setLoading(false);
    };

    loadData();
    // Poll for ranking/market cap updates occasionally
    const interval = setInterval(async () => {
      // Only refresh default list in background if not searching
      if (!searchTerm) {
        const data = await fetchAssets(100);
        setDefaultAssets(data);
        // Update current view if showing default
        setAssets(prev => {
            // Basic merge to avoid UI jumpiness, mostly for price continuity if WS fails
            return data.map(newItem => {
                const existing = prev.find(p => p.id === newItem.id);
                return existing ? { ...newItem, priceUsd: existing.priceUsd } : newItem;
            });
        });
      }
    }, 60000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 2. Search Logic with Hybrid (Local + API) Strategy
  useEffect(() => {
    if (searchTerm.trim()) {
      // A. Instant Local Search (Fast feedback)
      const lowerTerm = searchTerm.toLowerCase();
      const localMatches = defaultAssets.filter(asset => 
        asset.name.toLowerCase().includes(lowerTerm) || 
        asset.symbol.toLowerCase().includes(lowerTerm)
      );
      
      // Optimistically show local results first
      setAssets(localMatches); 

      // B. Debounced API Search (Global discovery)
      const delayDebounceFn = setTimeout(async () => {
        setSearchLoading(true);
        try {
          const apiResults = await searchAssets(searchTerm);
          
          // Merge local matches and API results, removing duplicates by ID
          const combined = [...localMatches];
          const existingIds = new Set(localMatches.map(a => a.id));
          
          apiResults.forEach(asset => {
            if (!existingIds.has(asset.id)) {
              combined.push(asset);
            }
          });
          
          setAssets(combined);
        } catch (error) {
          console.error("Search API failed, sticking to local results", error);
        } finally {
          setSearchLoading(false);
        }
      }, 500);

      return () => clearTimeout(delayDebounceFn);
    } else {
      // Reset to top 100
      setAssets(defaultAssets);
      setSearchLoading(false);
    }
  }, [searchTerm, defaultAssets]);

  // 3. WebSocket Subscription for Realtime Prices
  useEffect(() => {
    if (assets.length === 0) return;

    // Only subscribe to the currently displayed assets to keep WS light
    const assetIds = assets.map(a => a.id);
    const idsKey = assetIds.join(',');

    const unsubscribe = subscribeToTicker(assetIds, (priceUpdates) => {
      // Update List
      setAssets(prev => prev.map(asset => {
        if (priceUpdates[asset.id]) {
          return { ...asset, priceUsd: priceUpdates[asset.id] };
        }
        return asset;
      }));

      // Update Selected Asset Detail (even if not in list)
      setSelectedAsset(prev => {
        if (prev && priceUpdates[prev.id]) {
          return { ...prev, priceUsd: priceUpdates[prev.id] };
        }
        return prev;
      });
    });

    return () => {
      unsubscribe();
    };
  }, [JSON.stringify(assets.map(a => a.id))]);

  // 4. Fetch History when asset OR timeframe is selected
  useEffect(() => {
    if (selectedAsset) {
      const currentPrice = parseFloat(selectedAsset.priceUsd);
      
      fetchAssetHistory(selectedAsset.id, timeframe, currentPrice).then(data => {
         const now = new Date();
         let timeLabel = '';
         if (timeframe === '1H') {
             timeLabel = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
         } else if (timeframe === '1D') {
             timeLabel = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
         } else {
             timeLabel = now.toLocaleDateString([], { month: 'short', day: 'numeric' });
         }
         
         const newData = [...data];
         const lastPoint = newData[newData.length - 1];
         
         if (!lastPoint || lastPoint.time !== timeLabel) {
             newData.push({ time: timeLabel, price: currentPrice });
         } else {
             newData[newData.length - 1] = { time: timeLabel, price: currentPrice };
         }
         
         setHistoryData(newData);
      });
    }
  }, [selectedAsset?.id, timeframe]); 

  // 5. Live Chart Sync
  useEffect(() => {
    if (!selectedAsset || historyData.length === 0) return;

    const currentPrice = parseFloat(selectedAsset.priceUsd);
    
    setHistoryData(prev => {
      if (prev.length === 0) return prev;
      
      const newData = [...prev];
      const lastIndex = newData.length - 1;
      
      const now = new Date();
      let timeLabel = '';
       if (timeframe === '1H') {
           timeLabel = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
       } else if (timeframe === '1D') {
           timeLabel = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
       } else {
           timeLabel = prev[lastIndex].time;
       }
      
      newData[lastIndex] = {
        time: timeLabel,
        price: currentPrice
      };
      
      return newData;
    });
  }, [selectedAsset?.priceUsd, timeframe]);

  const formatCurrency = (val: string) => {
    const num = parseFloat(val);
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(num);
  };

  const formatPercent = (val: string) => {
    const num = parseFloat(val);
    return `${num > 0 ? '+' : ''}${num.toFixed(2)}%`;
  };

  return (
    <div className="min-h-screen bg-dark-900 text-gray-100 font-sans selection:bg-primary-500 selection:text-white">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-dark-900/80 backdrop-blur-md border-b border-dark-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="bg-gradient-to-tr from-primary-600 to-primary-400 p-2 rounded-lg shadow-lg shadow-primary-500/20">
              <Zap className="w-5 h-5 text-white" />
            </div>
            {/* Hide text on small screens to make room for search */}
            <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 hidden sm:block">
              CoinSight AI
            </span>
          </div>
          
          {/* Search Bar - Flexible width */}
          <div className="flex-1 max-w-md relative">
              {searchLoading ? (
                  <Loader2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-500 animate-spin" />
              ) : (
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              )}
              <input 
                type="text" 
                placeholder="Search name or ticker (e.g. BTC)" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-dark-800 border border-dark-700 text-sm rounded-full pl-10 pr-4 py-2 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all placeholder-gray-600"
              />
          </div>

          <div className="flex items-center gap-4 flex-shrink-0">
            {/* Live Indicator - Hidden on mobile */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-dark-800 rounded-full border border-dark-700">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-green opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-green"></span>
              </span>
              <span className="text-xs font-medium text-gray-400">Live</span>
            </div>

            <button className="md:hidden p-2 text-gray-400 hover:text-white">
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading && assets.length === 0 ? (
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Column: Asset List (Ticker) */}
            <div className="lg:col-span-3 lg:h-[calc(100vh-8rem)] flex flex-col gap-4">
              <div className="bg-dark-800 rounded-xl border border-dark-700 overflow-hidden flex flex-col h-full shadow-lg">
                <div className="p-4 border-b border-dark-700 bg-dark-800 flex items-center justify-between">
                   <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                     <Activity className="w-4 h-4" /> 
                     {searchTerm ? 'Search Results' : 'Top 100'}
                   </h2>
                   {searchLoading && <Loader2 className="w-3 h-3 animate-spin text-primary-500" />}
                </div>
                <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-dark-600">
                  {assets.length === 0 ? (
                    <div className="p-8 text-center text-gray-500 text-sm">
                       No coins found matching "{searchTerm}"
                    </div>
                  ) : (
                    assets.map(asset => {
                      const isUp = parseFloat(asset.changePercent24Hr) >= 0;
                      return (
                        <button
                          key={asset.id}
                          onClick={() => setSelectedAsset(asset)}
                          className={`w-full text-left p-4 border-b border-dark-700/50 hover:bg-dark-700/50 transition-colors flex items-center justify-between group ${
                            selectedAsset?.id === asset.id ? 'bg-dark-700/80 border-l-2 border-l-primary-500' : 'border-l-2 border-l-transparent'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <img 
                              src={`https://assets.coincap.io/assets/icons/${asset.symbol.toLowerCase()}@2x.png`} 
                              className="w-8 h-8 rounded-full shadow-sm"
                              alt={asset.symbol}
                              onError={(e) => (e.currentTarget.style.display = 'none')}
                            />
                            <div>
                              <div className="font-bold text-gray-200 group-hover:text-white transition-colors">{asset.symbol}</div>
                              <div className="text-xs text-gray-500 truncate max-w-[80px]">{asset.name}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-mono font-medium text-sm text-gray-200 tabular-nums">
                               {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(parseFloat(asset.priceUsd))}
                            </div>
                            <div className={`text-xs font-medium flex items-center justify-end gap-0.5 ${isUp ? 'text-accent-green' : 'text-accent-red'}`}>
                               {isUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                               {Math.abs(parseFloat(asset.changePercent24Hr)).toFixed(2)}%
                            </div>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* Middle Column: Chart & Stats */}
            <div className="lg:col-span-6 flex flex-col gap-6">
              {selectedAsset && (
                <>
                  <div className="bg-dark-800 rounded-xl border border-dark-700 shadow-xl overflow-hidden min-h-[400px] flex flex-col">
                    <div className="p-6 border-b border-dark-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <img 
                          src={`https://assets.coincap.io/assets/icons/${selectedAsset.symbol.toLowerCase()}@2x.png`} 
                          className="w-10 h-10 rounded-full"
                          alt={selectedAsset.symbol}
                          onError={(e) => (e.currentTarget.style.display = 'none')}
                        />
                        <div>
                          <h1 className="text-2xl font-bold text-white flex items-baseline gap-2">
                            {selectedAsset.name} 
                            <span className="text-gray-500 text-sm font-normal">/ USD</span>
                          </h1>
                          <div className="flex items-center gap-3">
                             <p className="text-2xl font-mono text-primary-400 font-semibold tracking-tight tabular-nums">
                               {formatCurrency(selectedAsset.priceUsd)}
                             </p>
                             <span className={`text-sm font-bold flex items-center gap-0.5 ${parseFloat(selectedAsset.changePercent24Hr) >= 0 ? 'text-accent-green' : 'text-accent-red'}`}>
                               {parseFloat(selectedAsset.changePercent24Hr) >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                               {formatPercent(selectedAsset.changePercent24Hr)}
                             </span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Timeframe Selector */}
                      <div className="flex bg-dark-900 rounded-lg p-1 border border-dark-700">
                        {(['1H', '1D', '1W', '1M', '1Y'] as Timeframe[]).map((tf) => (
                          <button
                            key={tf}
                            onClick={() => setTimeframe(tf)}
                            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                              timeframe === tf
                                ? 'bg-dark-700 text-white shadow-sm'
                                : 'text-gray-400 hover:text-gray-200 hover:bg-dark-800'
                            }`}
                          >
                            {tf}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex-1 p-6 relative">
                       <Chart 
                         data={historyData} 
                         color={parseFloat(selectedAsset.changePercent24Hr) >= 0 ? '#10b981' : '#ef4444'} 
                       />
                    </div>
                  </div>

                  <AssetStats asset={selectedAsset} history={historyData} />
                </>
              )}
            </div>

            {/* Right Column: Gemini Panel */}
            <div className="lg:col-span-3 lg:h-[calc(100vh-8rem)]">
              <GeminiPanel selectedAsset={selectedAsset} />
            </div>

          </div>
        )}
      </main>
    </div>
  );
};

export default App;