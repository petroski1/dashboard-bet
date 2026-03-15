import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { BettingProvider } from './context/BettingContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Apostas from './pages/Apostas';
import Categorias from './pages/Categorias';
import Jogos from './pages/Jogos';
import Financeiro from './pages/Financeiro';

export default function App() {
  return (
    <BettingProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/apostas" element={<Apostas />} />
            <Route path="/categorias" element={<Categorias />} />
            <Route path="/jogos" element={<Jogos />} />
            <Route path="/financeiro" element={<Financeiro />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </BettingProvider>
  );
}
