import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Star } from 'lucide-react'

export default function Navbar() {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
      isActive
        ? 'bg-blue-600 text-white'
        : 'text-slate-400 hover:text-white hover:bg-slate-800'
    }`

  return (
    <nav className="bg-slate-900 border-b border-slate-700 px-6 py-3 flex items-center gap-4">
      <span className="text-white font-bold text-lg mr-6">FinanceApp</span>
      <NavLink to="/" end className={linkClass}>
        <LayoutDashboard size={16} />
        Dashboard
      </NavLink>
      <NavLink to="/watchlist" className={linkClass}>
        <Star size={16} />
        Watchlist
      </NavLink>
    </nav>
  )
}
