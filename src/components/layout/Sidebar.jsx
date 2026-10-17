import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Package, Factory, Leaf, QrCode, Settings } from 'lucide-react';
import { Logo } from './Logo.jsx';

export const NAV = [
  { group: null, items: [
    { to: '/dashboard', label: 'Home', icon: LayoutDashboard },
    { to: '/products', label: 'Products', icon: Package },
    { to: '/suppliers', label: 'Suppliers', icon: Factory },
    { to: '/about', label: 'About', icon: Leaf },
    { to: '/consumer-view', label: 'Passport', icon: QrCode },
  ] },
];

export function Sidebar({ onNavigate }) {
  return (
    <nav className="sidebar" aria-label="Main">
      <div className="sidebar__brand"><Logo to="/dashboard" inverse /></div>
      <div className="sidebar__scroll">
        {NAV.map((g) => (
          <div key={g.group} className="sidebar__group">
            {g.group && <p className="sidebar__heading">{g.group}</p>}
            <ul>
              {g.items.map(({ to, label, icon: Icon }) => (
                <li key={to}>
                  <NavLink to={to} onClick={onNavigate} className={({ isActive }) => `sidebar__link ${isActive ? 'is-active' : ''}`}>
                    <Icon size={18} aria-hidden="true" strokeWidth={1.75} />
                    <span>{label}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="sidebar__foot">
        <NavLink to="/settings" onClick={onNavigate} className={({ isActive }) => `sidebar__link ${isActive ? 'is-active' : ''}`}>
          <Settings size={18} aria-hidden="true" strokeWidth={1.75} /><span>Settings</span>
        </NavLink>
        <p className="meta m-0 px-2 pt-2">Demo data. Emissions are estimates.</p>
      </div>
    </nav>
  );
}
