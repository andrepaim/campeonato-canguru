import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import HomePage from './pages/HomePage';
import MatchPage from './pages/MatchPage';
import ResultPage from './pages/ResultPage';
import StandingsPage from './pages/StandingsPage';
import HistoryPage from './pages/HistoryPage';

function App() {
  return (
    <BrowserRouter basename="/campeonato">
      <div className="min-h-screen bg-galo-black flex flex-col">
        <main className="flex-1 pb-20">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/match" element={<MatchPage />} />
            <Route path="/result" element={<ResultPage />} />
            <Route path="/standings" element={<StandingsPage />} />
            <Route path="/history" element={<HistoryPage />} />
          </Routes>
        </main>

        <nav className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800">
          <div className="flex justify-around items-center h-16 max-w-md mx-auto">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `flex flex-col items-center p-2 ${isActive ? 'text-galo-gold' : 'text-gray-400'}`
              }
            >
              <span className="text-2xl">🏠</span>
              <span className="text-xs mt-1">Início</span>
            </NavLink>
            <NavLink
              to="/standings"
              className={({ isActive }) =>
                `flex flex-col items-center p-2 ${isActive ? 'text-galo-gold' : 'text-gray-400'}`
              }
            >
              <span className="text-2xl">📊</span>
              <span className="text-xs mt-1">Tabela</span>
            </NavLink>
            <NavLink
              to="/history"
              className={({ isActive }) =>
                `flex flex-col items-center p-2 ${isActive ? 'text-galo-gold' : 'text-gray-400'}`
              }
            >
              <span className="text-2xl">📜</span>
              <span className="text-xs mt-1">Histórico</span>
            </NavLink>
          </div>
        </nav>
      </div>
    </BrowserRouter>
  );
}

export default App;
