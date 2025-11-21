import { CryptoAsset, ChartDataPoint, Timeframe } from '../types';

const BASE_URL = 'https://api.coincap.io/v2';

// Fallback data in case API is unreachable. 
// Note: We cannot statically list 10,000 coins here for performance reasons, 
// but the Search API allows access to all of them.
const MOCK_ASSETS: CryptoAsset[] = [
  {
    id: 'bitcoin',
    rank: '1',
    symbol: 'BTC',
    name: 'Bitcoin',
    supply: '19650000',
    maxSupply: '21000000',
    marketCapUsd: '1350000000000',
    volumeUsd24Hr: '35000000000',
    priceUsd: '67500.42',
    changePercent24Hr: '2.34',
    vwap24Hr: '67000.00'
  },
  {
    id: 'ethereum',
    rank: '2',
    symbol: 'ETH',
    name: 'Ethereum',
    supply: '120000000',
    maxSupply: null,
    marketCapUsd: '450000000000',
    volumeUsd24Hr: '15000000000',
    priceUsd: '3800.15',
    changePercent24Hr: '-1.12',
    vwap24Hr: '3850.00'
  },
  {
    id: 'tether',
    rank: '3',
    symbol: 'USDT',
    name: 'Tether',
    supply: '103000000000',
    maxSupply: null,
    marketCapUsd: '103000000000',
    volumeUsd24Hr: '45000000000',
    priceUsd: '1.00',
    changePercent24Hr: '0.01',
    vwap24Hr: '1.00'
  },
  {
    id: 'bnb',
    rank: '4',
    symbol: 'BNB',
    name: 'BNB',
    supply: '153000000',
    maxSupply: '200000000',
    marketCapUsd: '87000000000',
    volumeUsd24Hr: '1200000000',
    priceUsd: '580.20',
    changePercent24Hr: '0.85',
    vwap24Hr: '578.00'
  },
  {
    id: 'solana',
    rank: '5',
    symbol: 'SOL',
    name: 'Solana',
    supply: '443000000',
    maxSupply: null,
    marketCapUsd: '65000000000',
    volumeUsd24Hr: '2500000000',
    priceUsd: '145.60',
    changePercent24Hr: '5.67',
    vwap24Hr: '142.00'
  },
  {
    id: 'xrp',
    rank: '6',
    symbol: 'XRP',
    name: 'XRP',
    supply: '54800000000',
    maxSupply: '100000000000',
    marketCapUsd: '34000000000',
    volumeUsd24Hr: '1100000000',
    priceUsd: '0.62',
    changePercent24Hr: '1.20',
    vwap24Hr: '0.61'
  },
  {
    id: 'usdc',
    rank: '7',
    symbol: 'USDC',
    name: 'USDC',
    supply: '32000000000',
    maxSupply: null,
    marketCapUsd: '32000000000',
    volumeUsd24Hr: '3000000000',
    priceUsd: '1.00',
    changePercent24Hr: '0.00',
    vwap24Hr: '1.00'
  },
  {
    id: 'cardano',
    rank: '8',
    symbol: 'ADA',
    name: 'Cardano',
    supply: '35000000000',
    maxSupply: '45000000000',
    marketCapUsd: '20000000000',
    volumeUsd24Hr: '400000000',
    priceUsd: '0.55',
    changePercent24Hr: '-2.50',
    vwap24Hr: '0.56'
  },
  {
    id: 'avalanche',
    rank: '9',
    symbol: 'AVAX',
    name: 'Avalanche',
    supply: '377000000',
    maxSupply: null,
    marketCapUsd: '18000000000',
    volumeUsd24Hr: '600000000',
    priceUsd: '48.20',
    changePercent24Hr: '3.40',
    vwap24Hr: '47.50'
  },
  {
    id: 'dogecoin',
    rank: '10',
    symbol: 'DOGE',
    name: 'Dogecoin',
    supply: '143000000000',
    maxSupply: null,
    marketCapUsd: '22000000000',
    volumeUsd24Hr: '1800000000',
    priceUsd: '0.15',
    changePercent24Hr: '8.20',
    vwap24Hr: '0.14'
  },
  {
    id: 'shiba-inu',
    rank: '11',
    symbol: 'SHIB',
    name: 'Shiba Inu',
    supply: '589000000000000',
    maxSupply: null,
    marketCapUsd: '15000000000',
    volumeUsd24Hr: '300000000',
    priceUsd: '0.000025',
    changePercent24Hr: '4.50',
    vwap24Hr: '0.000024'
  },
  {
    id: 'polkadot',
    rank: '12',
    symbol: 'DOT',
    name: 'Polkadot',
    supply: '1430000000',
    maxSupply: null,
    marketCapUsd: '10000000000',
    volumeUsd24Hr: '200000000',
    priceUsd: '7.20',
    changePercent24Hr: '-1.50',
    vwap24Hr: '7.25'
  },
  {
    id: 'chainlink',
    rank: '13',
    symbol: 'LINK',
    name: 'Chainlink',
    supply: '587000000',
    maxSupply: '1000000000',
    marketCapUsd: '8500000000',
    volumeUsd24Hr: '350000000',
    priceUsd: '14.50',
    changePercent24Hr: '2.10',
    vwap24Hr: '14.40'
  },
  {
    id: 'tron',
    rank: '14',
    symbol: 'TRX',
    name: 'TRON',
    supply: '87000000000',
    maxSupply: null,
    marketCapUsd: '10500000000',
    volumeUsd24Hr: '400000000',
    priceUsd: '0.12',
    changePercent24Hr: '0.50',
    vwap24Hr: '0.12'
  },
  {
    id: 'polygon',
    rank: '15',
    symbol: 'MATIC',
    name: 'Polygon',
    supply: '9900000000',
    maxSupply: '10000000000',
    marketCapUsd: '7000000000',
    volumeUsd24Hr: '300000000',
    priceUsd: '0.70',
    changePercent24Hr: '-0.80',
    vwap24Hr: '0.71'
  },
  {
    id: 'litecoin',
    rank: '16',
    symbol: 'LTC',
    name: 'Litecoin',
    supply: '74000000',
    maxSupply: '84000000',
    marketCapUsd: '6000000000',
    volumeUsd24Hr: '450000000',
    priceUsd: '82.50',
    changePercent24Hr: '1.10',
    vwap24Hr: '82.00'
  },
  {
    id: 'uniswap',
    rank: '17',
    symbol: 'UNI',
    name: 'Uniswap',
    supply: '600000000',
    maxSupply: '1000000000',
    marketCapUsd: '4500000000',
    volumeUsd24Hr: '150000000',
    priceUsd: '7.50',
    changePercent24Hr: '3.20',
    vwap24Hr: '7.40'
  },
  {
    id: 'bitcoin-cash',
    rank: '18',
    symbol: 'BCH',
    name: 'Bitcoin Cash',
    supply: '19700000',
    maxSupply: '21000000',
    marketCapUsd: '9000000000',
    volumeUsd24Hr: '350000000',
    priceUsd: '450.00',
    changePercent24Hr: '0.90',
    vwap24Hr: '448.00'
  },
  {
    id: 'internet-computer',
    rank: '19',
    symbol: 'ICP',
    name: 'Internet Computer',
    supply: '462000000',
    maxSupply: null,
    marketCapUsd: '6000000000',
    volumeUsd24Hr: '100000000',
    priceUsd: '13.20',
    changePercent24Hr: '4.50',
    vwap24Hr: '12.90'
  },
  {
    id: 'near-protocol',
    rank: '20',
    symbol: 'NEAR',
    name: 'NEAR Protocol',
    supply: '1000000000',
    maxSupply: null,
    marketCapUsd: '7500000000',
    volumeUsd24Hr: '400000000',
    priceUsd: '7.15',
    changePercent24Hr: '5.20',
    vwap24Hr: '7.00'
  },
  {
    id: 'aptos',
    rank: '21',
    symbol: 'APT',
    name: 'Aptos',
    supply: '396000000',
    maxSupply: null,
    marketCapUsd: '5000000000',
    volumeUsd24Hr: '200000000',
    priceUsd: '12.50',
    changePercent24Hr: '-1.20',
    vwap24Hr: '12.60'
  },
  {
    id: 'stacks',
    rank: '22',
    symbol: 'STX',
    name: 'Stacks',
    supply: '1450000000',
    maxSupply: '1818000000',
    marketCapUsd: '4500000000',
    volumeUsd24Hr: '150000000',
    priceUsd: '3.10',
    changePercent24Hr: '2.50',
    vwap24Hr: '3.05'
  },
  {
    id: 'filecoin',
    rank: '23',
    symbol: 'FIL',
    name: 'Filecoin',
    supply: '530000000',
    maxSupply: null,
    marketCapUsd: '4800000000',
    volumeUsd24Hr: '250000000',
    priceUsd: '9.20',
    changePercent24Hr: '1.80',
    vwap24Hr: '9.10'
  },
  {
    id: 'ethereum-classic',
    rank: '24',
    symbol: 'ETC',
    name: 'Ethereum Classic',
    supply: '146000000',
    maxSupply: '210700000',
    marketCapUsd: '4200000000',
    volumeUsd24Hr: '200000000',
    priceUsd: '29.50',
    changePercent24Hr: '0.50',
    vwap24Hr: '29.40'
  },
  {
    id: 'stellar',
    rank: '25',
    symbol: 'XLM',
    name: 'Stellar',
    supply: '28000000000',
    maxSupply: '50000000000',
    marketCapUsd: '3800000000',
    volumeUsd24Hr: '100000000',
    priceUsd: '0.13',
    changePercent24Hr: '-0.50',
    vwap24Hr: '0.13'
  },
  {
    id: 'hedera-hashgraph',
    rank: '26',
    symbol: 'HBAR',
    name: 'Hedera',
    supply: '33000000000',
    maxSupply: '50000000000',
    marketCapUsd: '3500000000',
    volumeUsd24Hr: '60000000',
    priceUsd: '0.11',
    changePercent24Hr: '1.50',
    vwap24Hr: '0.11'
  },
  {
    id: 'vechain',
    rank: '27',
    symbol: 'VET',
    name: 'VeChain',
    supply: '72000000000',
    maxSupply: '86000000000',
    marketCapUsd: '3200000000',
    volumeUsd24Hr: '50000000',
    priceUsd: '0.045',
    changePercent24Hr: '2.20',
    vwap24Hr: '0.044'
  },
  {
    id: 'immutable-x',
    rank: '28',
    symbol: 'IMX',
    name: 'Immutable',
    supply: '1400000000',
    maxSupply: '2000000000',
    marketCapUsd: '3100000000',
    volumeUsd24Hr: '80000000',
    priceUsd: '2.20',
    changePercent24Hr: '-1.50',
    vwap24Hr: '2.25'
  },
  {
    id: 'arbitrum',
    rank: '29',
    symbol: 'ARB',
    name: 'Arbitrum',
    supply: '2600000000',
    maxSupply: '10000000000',
    marketCapUsd: '3000000000',
    volumeUsd24Hr: '350000000',
    priceUsd: '1.15',
    changePercent24Hr: '3.40',
    vwap24Hr: '1.12'
  },
  {
    id: 'optimism',
    rank: '30',
    symbol: 'OP',
    name: 'Optimism',
    supply: '1000000000',
    maxSupply: '4300000000',
    marketCapUsd: '2800000000',
    volumeUsd24Hr: '250000000',
    priceUsd: '2.50',
    changePercent24Hr: '4.10',
    vwap24Hr: '2.45'
  },
  {
    id: 'injective-protocol',
    rank: '31',
    symbol: 'INJ',
    name: 'Injective',
    supply: '93000000',
    maxSupply: null,
    marketCapUsd: '2700000000',
    volumeUsd24Hr: '150000000',
    priceUsd: '28.50',
    changePercent24Hr: '6.50',
    vwap24Hr: '27.00'
  },
  {
    id: 'the-graph',
    rank: '32',
    symbol: 'GRT',
    name: 'The Graph',
    supply: '9400000000',
    maxSupply: null,
    marketCapUsd: '2600000000',
    volumeUsd24Hr: '120000000',
    priceUsd: '0.28',
    changePercent24Hr: '-2.30',
    vwap24Hr: '0.29'
  },
  {
    id: 'render-token',
    rank: '33',
    symbol: 'RNDR',
    name: 'Render',
    supply: '380000000',
    maxSupply: '530000000',
    marketCapUsd: '2500000000',
    volumeUsd24Hr: '180000000',
    priceUsd: '6.50',
    changePercent24Hr: '8.50',
    vwap24Hr: '6.20'
  },
  {
    id: 'bittensor',
    rank: '34',
    symbol: 'TAO',
    name: 'Bittensor',
    supply: '6500000',
    maxSupply: '21000000',
    marketCapUsd: '2400000000',
    volumeUsd24Hr: '40000000',
    priceUsd: '380.00',
    changePercent24Hr: '-3.50',
    vwap24Hr: '390.00'
  },
  {
    id: 'kaspa',
    rank: '35',
    symbol: 'KAS',
    name: 'Kaspa',
    supply: '23000000000',
    maxSupply: '28700000000',
    marketCapUsd: '2300000000',
    volumeUsd24Hr: '60000000',
    priceUsd: '0.10',
    changePercent24Hr: '1.20',
    vwap24Hr: '0.10'
  },
  {
    id: 'pepe',
    rank: '36',
    symbol: 'PEPE',
    name: 'Pepe',
    supply: '420690000000000',
    maxSupply: '420690000000000',
    marketCapUsd: '2200000000',
    volumeUsd24Hr: '500000000',
    priceUsd: '0.0000052',
    changePercent24Hr: '12.50',
    vwap24Hr: '0.0000048'
  },
  {
    id: 'dogwifhat',
    rank: '37',
    symbol: 'WIF',
    name: 'dogwifhat',
    supply: '998000000',
    maxSupply: '998000000',
    marketCapUsd: '2100000000',
    volumeUsd24Hr: '350000000',
    priceUsd: '2.10',
    changePercent24Hr: '15.20',
    vwap24Hr: '1.90'
  },
  {
    id: 'bonk',
    rank: '38',
    symbol: 'BONK',
    name: 'Bonk',
    supply: '65000000000000',
    maxSupply: '93000000000000',
    marketCapUsd: '1500000000',
    volumeUsd24Hr: '150000000',
    priceUsd: '0.000023',
    changePercent24Hr: '5.50',
    vwap24Hr: '0.000022'
  },
  {
    id: 'floki',
    rank: '39',
    symbol: 'FLOKI',
    name: 'Floki',
    supply: '9500000000000',
    maxSupply: '10000000000000',
    marketCapUsd: '1400000000',
    volumeUsd24Hr: '120000000',
    priceUsd: '0.00015',
    changePercent24Hr: '3.20',
    vwap24Hr: '0.00014'
  },
  {
    id: 'fetch-ai',
    rank: '40',
    symbol: 'FET',
    name: 'Fetch.ai',
    supply: '1000000000',
    maxSupply: null,
    marketCapUsd: '2000000000',
    volumeUsd24Hr: '200000000',
    priceUsd: '1.85',
    changePercent24Hr: '4.50',
    vwap24Hr: '1.80'
  },
  {
    id: 'thorchain',
    rank: '41',
    symbol: 'RUNE',
    name: 'THORChain',
    supply: '330000000',
    maxSupply: '500000000',
    marketCapUsd: '1900000000',
    volumeUsd24Hr: '250000000',
    priceUsd: '5.60',
    changePercent24Hr: '-2.50',
    vwap24Hr: '5.70'
  },
  {
    id: 'cosmos',
    rank: '42',
    symbol: 'ATOM',
    name: 'Cosmos',
    supply: '390000000',
    maxSupply: null,
    marketCapUsd: '3200000000',
    volumeUsd24Hr: '150000000',
    priceUsd: '8.20',
    changePercent24Hr: '-1.10',
    vwap24Hr: '8.30'
  },
  {
    id: 'algorand',
    rank: '43',
    symbol: 'ALGO',
    name: 'Algorand',
    supply: '8000000000',
    maxSupply: '10000000000',
    marketCapUsd: '1500000000',
    volumeUsd24Hr: '50000000',
    priceUsd: '0.18',
    changePercent24Hr: '0.50',
    vwap24Hr: '0.18'
  },
  {
    id: 'aave',
    rank: '44',
    symbol: 'AAVE',
    name: 'Aave',
    supply: '14700000',
    maxSupply: '16000000',
    marketCapUsd: '1300000000',
    volumeUsd24Hr: '80000000',
    priceUsd: '88.50',
    changePercent24Hr: '2.20',
    vwap24Hr: '87.00'
  },
  {
    id: 'maker',
    rank: '45',
    symbol: 'MKR',
    name: 'Maker',
    supply: '920000',
    maxSupply: '1005577',
    marketCapUsd: '2500000000',
    volumeUsd24Hr: '70000000',
    priceUsd: '2700.00',
    changePercent24Hr: '1.50',
    vwap24Hr: '2680.00'
  },
  {
    id: 'sui',
    rank: '46',
    symbol: 'SUI',
    name: 'Sui',
    supply: '1200000000',
    maxSupply: '10000000000',
    marketCapUsd: '1600000000',
    volumeUsd24Hr: '180000000',
    priceUsd: '1.35',
    changePercent24Hr: '6.20',
    vwap24Hr: '1.30'
  },
  {
    id: 'sei-network',
    rank: '47',
    symbol: 'SEI',
    name: 'Sei',
    supply: '2600000000',
    maxSupply: '10000000000',
    marketCapUsd: '1400000000',
    volumeUsd24Hr: '100000000',
    priceUsd: '0.55',
    changePercent24Hr: '3.40',
    vwap24Hr: '0.54'
  },
  {
    id: 'celestia',
    rank: '48',
    symbol: 'TIA',
    name: 'Celestia',
    supply: '170000000',
    maxSupply: null,
    marketCapUsd: '1500000000',
    volumeUsd24Hr: '90000000',
    priceUsd: '8.80',
    changePercent24Hr: '-2.50',
    vwap24Hr: '9.00'
  },
  {
    id: 'lido-dao',
    rank: '49',
    symbol: 'LDO',
    name: 'Lido DAO',
    supply: '890000000',
    maxSupply: '1000000000',
    marketCapUsd: '1700000000',
    volumeUsd24Hr: '40000000',
    priceUsd: '1.90',
    changePercent24Hr: '-0.80',
    vwap24Hr: '1.91'
  },
  {
    id: 'quant',
    rank: '50',
    symbol: 'QNT',
    name: 'Quant',
    supply: '12000000',
    maxSupply: '14612493',
    marketCapUsd: '1100000000',
    volumeUsd24Hr: '20000000',
    priceUsd: '92.50',
    changePercent24Hr: '1.10',
    vwap24Hr: '91.80'
  },
  {
    id: 'monero',
    rank: '51',
    symbol: 'XMR',
    name: 'Monero',
    supply: '18400000',
    maxSupply: null,
    marketCapUsd: '2200000000',
    volumeUsd24Hr: '50000000',
    priceUsd: '120.50',
    changePercent24Hr: '0.20',
    vwap24Hr: '120.00'
  },
  {
    id: 'fantom',
    rank: '52',
    symbol: 'FTM',
    name: 'Fantom',
    supply: '2800000000',
    maxSupply: '3175000000',
    marketCapUsd: '1800000000',
    volumeUsd24Hr: '100000000',
    priceUsd: '0.65',
    changePercent24Hr: '4.10',
    vwap24Hr: '0.63'
  },
  {
    id: 'eos',
    rank: '53',
    symbol: 'EOS',
    name: 'EOS',
    supply: '1100000000',
    maxSupply: null,
    marketCapUsd: '800000000',
    volumeUsd24Hr: '80000000',
    priceUsd: '0.75',
    changePercent24Hr: '0.50',
    vwap24Hr: '0.74'
  },
  {
    id: 'the-sandbox',
    rank: '54',
    symbol: 'SAND',
    name: 'The Sandbox',
    supply: '2200000000',
    maxSupply: '3000000000',
    marketCapUsd: '950000000',
    volumeUsd24Hr: '60000000',
    priceUsd: '0.42',
    changePercent24Hr: '-1.20',
    vwap24Hr: '0.43'
  },
  {
    id: 'decentraland',
    rank: '55',
    symbol: 'MANA',
    name: 'Decentraland',
    supply: '1900000000',
    maxSupply: null,
    marketCapUsd: '780000000',
    volumeUsd24Hr: '40000000',
    priceUsd: '0.40',
    changePercent24Hr: '-0.50',
    vwap24Hr: '0.40'
  },
  {
    id: 'tezos',
    rank: '56',
    symbol: 'XTZ',
    name: 'Tezos',
    supply: '980000000',
    maxSupply: null,
    marketCapUsd: '850000000',
    volumeUsd24Hr: '30000000',
    priceUsd: '0.88',
    changePercent24Hr: '1.10',
    vwap24Hr: '0.87'
  },
  {
    id: 'axie-infinity',
    rank: '57',
    symbol: 'AXS',
    name: 'Axie Infinity',
    supply: '140000000',
    maxSupply: '270000000',
    marketCapUsd: '900000000',
    volumeUsd24Hr: '35000000',
    priceUsd: '6.50',
    changePercent24Hr: '2.20',
    vwap24Hr: '6.40'
  },
  {
    id: 'chiliz',
    rank: '58',
    symbol: 'CHZ',
    name: 'Chiliz',
    supply: '8800000000',
    maxSupply: '8888888888',
    marketCapUsd: '950000000',
    volumeUsd24Hr: '50000000',
    priceUsd: '0.11',
    changePercent24Hr: '3.50',
    vwap24Hr: '0.10'
  },
  {
    id: 'gala',
    rank: '59',
    symbol: 'GALA',
    name: 'Gala',
    supply: '35000000000',
    maxSupply: '50000000000',
    marketCapUsd: '1000000000',
    volumeUsd24Hr: '70000000',
    priceUsd: '0.028',
    changePercent24Hr: '4.20',
    vwap24Hr: '0.027'
  },
  {
    id: 'elrond-egld',
    rank: '60',
    symbol: 'EGLD',
    name: 'MultiversX',
    supply: '27000000',
    maxSupply: '31415926',
    marketCapUsd: '1100000000',
    volumeUsd24Hr: '30000000',
    priceUsd: '40.50',
    changePercent24Hr: '1.80',
    vwap24Hr: '40.00'
  }
];

export const fetchAssets = async (limit = 100): Promise<CryptoAsset[]> => {
  try {
    const response = await fetch(`${BASE_URL}/assets?limit=${limit}`);
    if (!response.ok) throw new Error('Failed to fetch assets');
    const json = await response.json();
    return json.data;
  } catch (error) {
    console.warn("API unreachable. Using fallback mock data for assets.");
    // If requested limit is small, return slice, else return all mock data
    return MOCK_ASSETS.slice(0, limit > MOCK_ASSETS.length ? MOCK_ASSETS.length : limit);
  }
};

export const searchAssets = async (query: string): Promise<CryptoAsset[]> => {
  try {
    const response = await fetch(`${BASE_URL}/assets?search=${query}&limit=20`);
    if (!response.ok) throw new Error('Failed to search assets');
    const json = await response.json();
    return json.data;
  } catch (error) {
    console.warn("API unreachable for search.");
    return [];
  }
};

export const fetchAssetHistory = async (id: string, timeframe: Timeframe, currentPrice?: number): Promise<ChartDataPoint[]> => {
  try {
    // Determine config based on timeframe
    let interval: string;
    let start: number;
    const end = Date.now();

    switch (timeframe) {
      case '1H':
        interval = 'm1';
        start = end - (60 * 60 * 1000); // 1 hour ago
        break;
      case '1D':
        interval = 'm5'; // 5 mins * 288 pts = 24 hours
        start = end - (24 * 60 * 60 * 1000);
        break;
      case '1W':
        interval = 'h1';
        start = end - (7 * 24 * 60 * 60 * 1000);
        break;
      case '1M':
        interval = 'h6';
        start = end - (30 * 24 * 60 * 60 * 1000);
        break;
      case '1Y':
        interval = 'd1';
        start = end - (365 * 24 * 60 * 60 * 1000);
        break;
      default:
        interval = 'm1';
        start = end - (60 * 60 * 1000);
    }

    const response = await fetch(`${BASE_URL}/assets/${id}/history?interval=${interval}&start=${start}&end=${end}`);
    if (!response.ok) throw new Error('Failed to fetch history');
    const json = await response.json();
    
    const history = json.data.map((item: any) => {
      const date = new Date(item.time);
      let timeLabel = '';
      
      // Format logic
      if (timeframe === '1H' || timeframe === '1D') {
        timeLabel = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        if (timeframe === '1H') {
             // Add seconds for 1H to show granularity
             timeLabel = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        }
      } else if (timeframe === '1W' || timeframe === '1M') {
        timeLabel = date.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit' });
      } else {
        timeLabel = date.toLocaleDateString([], { month: 'short', day: 'numeric' });
      }

      return {
        time: timeLabel,
        price: parseFloat(item.priceUsd)
      };
    });

    return history;

  } catch (error) {
    console.warn(`API unreachable for history of ${id}. Using fallback mock data.`);
    
    // Mock Data Generator
    let finalPrice = currentPrice;
    if (!finalPrice) {
      const mockAsset = MOCK_ASSETS.find(a => a.id === id);
      finalPrice = mockAsset ? parseFloat(mockAsset.priceUsd) : 100;
    }

    let points = 60;
    let durationMs = 60 * 60 * 1000;

    switch (timeframe) {
      case '1H': points = 60; durationMs = 60 * 60 * 1000; break;
      case '1D': points = 96; durationMs = 24 * 60 * 60 * 1000; break;
      case '1W': points = 84; durationMs = 7 * 24 * 60 * 60 * 1000; break;
      case '1M': points = 120; durationMs = 30 * 24 * 60 * 60 * 1000; break;
      case '1Y': points = 100; durationMs = 365 * 24 * 60 * 60 * 1000; break;
    }

    const volatility = finalPrice * (timeframe === '1H' ? 0.005 : 0.1); 
    const now = new Date();
    const stepMs = durationMs / points;

    const data: ChartDataPoint[] = new Array(points);
    let walkerPrice = finalPrice;

    // Set last point
    data[points - 1] = {
      time: formatMockTime(now, timeframe),
      price: walkerPrice
    };

    for (let i = points - 2; i >= 0; i--) {
      const change = (Math.random() - 0.5) * volatility;
      walkerPrice = walkerPrice - change;
      
      const time = new Date(now.getTime() - (points - 1 - i) * stepMs);
      data[i] = {
        time: formatMockTime(time, timeframe),
        price: walkerPrice
      };
    }
    
    return data;
  }
};

const formatMockTime = (date: Date, timeframe: Timeframe): string => {
  if (timeframe === '1H' || timeframe === '1D') {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: timeframe === '1H' ? '2-digit' : undefined });
  } else if (timeframe === '1W' || timeframe === '1M') {
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  } else {
    return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: '2-digit' });
  }
};

export const subscribeToTicker = (assetIds: string[], callback: (prices: Record<string, string>) => void) => {
  if (assetIds.length === 0) return () => {};
  
  const ws = new WebSocket(`wss://ws.coincap.io/prices?assets=${assetIds.join(',')}`);
  
  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      callback(data);
    } catch (e) {
      console.error("WS Parse error", e);
    }
  };

  ws.onerror = (error) => {
    console.warn("WebSocket connection failed or interrupted", error);
  };

  return () => {
    if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
      ws.close();
    }
  };
};