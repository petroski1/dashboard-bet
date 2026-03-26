import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import ApiKeySetup from './ApiKeySetup';
import LoadingScreen from './LoadingScreen';
import { useYouTube } from '../context/YouTubeContext';

export default function Layout() {
  const { apiKey, isLoading, error, refresh } = useYouTube();

  if (!apiKey) return <ApiKeySetup />;
  if (isLoading) return <LoadingScreen />;
  if (error) return <LoadingScreen error={error} onRetry={refresh} />;

  return (
    <div className="flex min-h-screen bg-gray-950 text-white">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
