import React, { createContext, useContext, useEffect, useReducer } from 'react';
import type { Bet, Category, Game, FinancialSummary } from '../types';

interface State {
  bets: Bet[];
  categories: Category[];
  games: Game[];
}

type Action =
  | { type: 'ADD_BET'; payload: Bet }
  | { type: 'UPDATE_BET'; payload: Bet }
  | { type: 'DELETE_BET'; payload: string }
  | { type: 'ADD_CATEGORY'; payload: Category }
  | { type: 'UPDATE_CATEGORY'; payload: Category }
  | { type: 'DELETE_CATEGORY'; payload: string }
  | { type: 'ADD_GAME'; payload: Game }
  | { type: 'UPDATE_GAME'; payload: Game }
  | { type: 'DELETE_GAME'; payload: string }
  | { type: 'LOAD_STATE'; payload: State };

const defaultCategories: Category[] = [
  { id: '1', name: 'Futebol', color: '#22c55e', icon: '⚽' },
  { id: '2', name: 'Basquete', color: '#f97316', icon: '🏀' },
  { id: '3', name: 'Tênis', color: '#eab308', icon: '🎾' },
  { id: '4', name: 'Esports', color: '#8b5cf6', icon: '🎮' },
  { id: '5', name: 'MMA/UFC', color: '#ef4444', icon: '🥊' },
];

const initialState: State = {
  bets: [],
  categories: defaultCategories,
  games: [],
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'LOAD_STATE':
      return action.payload;
    case 'ADD_BET':
      return { ...state, bets: [...state.bets, action.payload] };
    case 'UPDATE_BET':
      return { ...state, bets: state.bets.map(b => b.id === action.payload.id ? action.payload : b) };
    case 'DELETE_BET':
      return { ...state, bets: state.bets.filter(b => b.id !== action.payload) };
    case 'ADD_CATEGORY':
      return { ...state, categories: [...state.categories, action.payload] };
    case 'UPDATE_CATEGORY':
      return { ...state, categories: state.categories.map(c => c.id === action.payload.id ? action.payload : c) };
    case 'DELETE_CATEGORY':
      return { ...state, categories: state.categories.filter(c => c.id !== action.payload) };
    case 'ADD_GAME':
      return { ...state, games: [...state.games, action.payload] };
    case 'UPDATE_GAME':
      return { ...state, games: state.games.map(g => g.id === action.payload.id ? action.payload : g) };
    case 'DELETE_GAME':
      return { ...state, games: state.games.filter(g => g.id !== action.payload) };
    default:
      return state;
  }
}

interface BettingContextType {
  state: State;
  dispatch: React.Dispatch<Action>;
  getFinancialSummary: () => FinancialSummary;
  getCategoryById: (id: string) => Category | undefined;
  getGameById: (id: string) => Game | undefined;
}

const BettingContext = createContext<BettingContextType | undefined>(undefined);

export function BettingProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    const stored = localStorage.getItem('betting-dashboard');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        dispatch({ type: 'LOAD_STATE', payload: { ...initialState, ...parsed } });
      } catch {
        // ignore
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('betting-dashboard', JSON.stringify(state));
  }, [state]);

  const getFinancialSummary = (): FinancialSummary => {
    const wonBets = state.bets.filter(b => b.status === 'won');
    const lostBets = state.bets.filter(b => b.status === 'lost');
    const pendingBets = state.bets.filter(b => b.status === 'pending');
    const cancelledBets = state.bets.filter(b => b.status === 'cancelled');

    const totalStaked = state.bets
      .filter(b => b.status !== 'cancelled')
      .reduce((acc, b) => acc + b.stake, 0);

    const totalWon = wonBets.reduce((acc, b) => acc + (b.profit ?? b.stake * b.odds - b.stake), 0);
    const totalLost = lostBets.reduce((acc, b) => acc + b.stake, 0);
    const netProfit = totalWon - totalLost;
    const roi = totalStaked > 0 ? (netProfit / totalStaked) * 100 : 0;
    const settledBets = wonBets.length + lostBets.length;
    const winRate = settledBets > 0 ? (wonBets.length / settledBets) * 100 : 0;

    return {
      totalStaked,
      totalWon,
      totalLost,
      netProfit,
      roi,
      winRate,
      totalBets: state.bets.length,
      wonBets: wonBets.length,
      lostBets: lostBets.length,
      pendingBets: pendingBets.length,
      cancelledBets: cancelledBets.length,
    };
  };

  const getCategoryById = (id: string) => state.categories.find(c => c.id === id);
  const getGameById = (id: string) => state.games.find(g => g.id === id);

  return (
    <BettingContext.Provider value={{ state, dispatch, getFinancialSummary, getCategoryById, getGameById }}>
      {children}
    </BettingContext.Provider>
  );
}

export function useBetting() {
  const context = useContext(BettingContext);
  if (!context) throw new Error('useBetting must be used within BettingProvider');
  return context;
}
