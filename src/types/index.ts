export type BetStatus = 'pending' | 'won' | 'lost' | 'cancelled' | 'cashout';

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
}

export interface Game {
  id: string;
  name: string;
  categoryId: string;
  league?: string;
  homeTeam?: string;
  awayTeam?: string;
  date: string;
}

export interface Bet {
  id: string;
  gameId: string;
  categoryId: string;
  description: string;
  stake: number;
  odds: number;
  status: BetStatus;
  profit?: number;
  date: string;
  notes?: string;
  betType: 'single' | 'multiple' | 'system';
}

export interface FinancialSummary {
  totalStaked: number;
  totalWon: number;
  totalLost: number;
  netProfit: number;
  roi: number;
  winRate: number;
  totalBets: number;
  wonBets: number;
  lostBets: number;
  pendingBets: number;
  cancelledBets: number;
}
