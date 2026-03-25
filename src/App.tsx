import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { YouTubeProvider } from './context/YouTubeContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Trending from './pages/Trending';
import NicheAnalysis from './pages/NicheAnalysis';
import Favorites from './pages/Favorites';
import Reports from './pages/Reports';

export default function App() {
  return (
    <YouTubeProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/trending" element={<Trending />} />
            <Route path="/niches" element={<NicheAnalysis />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/reports" element={<Reports />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </YouTubeProvider>
  );
}
