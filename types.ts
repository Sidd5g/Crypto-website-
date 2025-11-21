export interface CryptoAsset {
  id: string;
  rank: string;
  symbol: string;
  name: string;
  supply: string;
  maxSupply: string | null;
  marketCapUsd: string;
  volumeUsd24Hr: string;
  priceUsd: string;
  changePercent24Hr: string;
  vwap24Hr: string;
}

export interface ChartDataPoint {
  time: string;
  price: number;
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface GeminiAnalysisResult {
  markdown: string;
  sources: GroundingSource[];
}

export enum ViewState {
  DASHBOARD = 'DASHBOARD',
  CHAT = 'CHAT'
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  sources?: GroundingSource[];
  isThinking?: boolean;
}

export type Timeframe = '1H' | '1D' | '1W' | '1M' | '1Y';