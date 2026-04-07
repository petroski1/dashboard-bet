import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { BettingProvider } from './context/BettingContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Apostas from './pages/Apostas';
import Categorias from './pages/Categorias';
import Jogos from './pages/Jogos';
import Financeiro from './pages/Financeiro';
import PublicReviews from './pages/loja/PublicReviews';
import AdminReviews from './pages/loja/AdminReviews';

export default function App() {
  return (
    <BettingProvider>
      <BrowserRouter>
        <Routes>
          {/* Loja Militar - páginas independentes */}
          <Route path="/avaliacoes" element={<PublicReviews />} />
          <Route path="/admin/avaliacoes" element={<AdminReviews />} />

          {/* Dashboard de apostas */}
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
