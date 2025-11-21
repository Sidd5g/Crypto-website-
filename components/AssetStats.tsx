import React, { useMemo } from 'react';
import { CryptoAsset, ChartDataPoint } from '../types';
import { 
  Coins, 
  Trophy, 
  Activity, 
  BarChart3, 
  ArrowUpToLine, 
  ArrowDownToLine,
  Scale,
  Globe
} from 'lucide-react';

interface AssetStatsProps {
  asset: CryptoAsset;
  history: ChartDataPoint[];
}

const AssetStats: React.FC<AssetStatsProps> = ({ asset, history }) => {
  const high24h = useMemo(() => {
    if (history.length === 0) return null;
    return Math.max(...history.map(p => p.price));
  }, [history]);

  const low24h = useMemo(() => {
    if (history.length === 0) return null;
    return Math.min(...history.map(p => p.price));
  }, [history]);

  const formatCurrency = (val: string | number | null) => {
    if (val === null) return 'N/A';
    const num = typeof val === 'string' ? parseFloat(val) : val;
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      maximumFractionDigits: num < 1 ? 6 : 2 
    }).format(num);
  };

  const formatNumber = (val: string | null) => {
    if (!val) return '∞';
    const num = parseFloat(val);
    if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
    return num.toLocaleString();
  };

  const stats = [
    {
      label: 'Market Cap',
      value: formatNumber(asset.marketCapUsd),
      subValue: 'USD',
      icon: Globe,
      color: 'text-primary-500'
    },
    {
      label: 'Volume (24h)',
      value: formatNumber(asset.volumeUsd24Hr),
      subValue: 'USD',
      icon: BarChart3,
      color: 'text-accent-green'
    },
    {
      label: 'Circulating Supply',
      value: formatNumber(asset.supply),
      subValue: asset.symbol,
      icon: Coins,
      color: 'text-orange-400'
    },
    {
      label: 'Max Supply',
      value: formatNumber(asset.maxSupply),
      subValue: asset.maxSupply ? asset.symbol : 'Unlimited',
      icon: Trophy,
      color: 'text-yellow-500'
    },
    {
      label: '24h High',
      value: formatCurrency(high24h),
      subValue: 'Calculated',
      icon: ArrowUpToLine,
      color: 'text-green-400'
    },
    {
      label: '24h Low',
      value: formatCurrency(low24h),
      subValue: 'Calculated',
      icon: ArrowDownToLine,
      color: 'text-red-400'
    },
    {
      label: 'VWAP (24h)',
      value: formatCurrency(asset.vwap24Hr),
      subValue: 'Weighted Avg',
      icon: Scale,
      color: 'text-purple-400'
    },
    {
      label: 'Market Rank',
      value: `#${asset.rank}`,
      subValue: 'Global',
      icon: Activity,
      color: 'text-blue-400'
    }
  ];

  return (
    <div className="bg-dark-800 rounded-xl border border-dark-700 shadow-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-dark-700 bg-dark-800/50 backdrop-blur-sm">
        <h3 className="font-semibold text-gray-200 flex items-center gap-2">
          <Activity className="w-4 h-4 text-primary-500" />
          Market Statistics
        </h3>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-dark-700">
        {stats.map((stat, index) => (
          <div key={index} className="bg-dark-800 p-4 hover:bg-dark-700/50 transition-colors group">
            <div className="flex items-start justify-between mb-2">
              <span className="text-xs text-gray-500 font-medium">{stat.label}</span>
              <stat.icon className={`w-4 h-4 ${stat.color} opacity-70 group-hover:opacity-100 transition-opacity`} />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold text-gray-100 tracking-tight">{stat.value}</span>
              <span className="text-[10px] text-gray-600 uppercase font-medium">{stat.subValue}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AssetStats;