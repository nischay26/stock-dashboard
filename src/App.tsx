import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Dashboard from './pages/Dashboard'
import Watchlist from './pages/Watchlist'

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen" style={{ backgroundColor: '#0f172a' }}>
        <Navbar />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/watchlist" element={<Watchlist />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}
