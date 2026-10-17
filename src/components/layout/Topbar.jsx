import { useEffect, useRef, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { ChevronDown, LogOut, Settings as SettingsIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { ThemeToggle } from './ThemeToggle.jsx';
import { Logo } from './Logo.jsx';
import { NAV } from './Sidebar.jsx';

export function Topbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const esc = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('mousedown', close); document.removeEventListener('keydown', esc); };
  }, []);

  const initials = (user?.name || 'U').split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();

  return (
    <header className="topbar">
      <div className="topbar__brand"><Logo to="/dashboard" /></div>
      <nav className="pillnav" aria-label="Main">
        {NAV[0].items.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} className={({ isActive }) => `pillnav__link ${isActive ? 'is-active' : ''}`}>
            <Icon size={16} aria-hidden="true" strokeWidth={1.9} /><span>{label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="topbar__right">
        <ThemeToggle />
        <div className="menu" ref={ref}>
          <button className="menu__btn" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
            <span className="avatar" aria-hidden="true">{initials}</span>
            <span className="menu__name">{user?.name}</span>
            <ChevronDown size={16} aria-hidden="true" />
          </button>
          {open && (
            <div className="menu__panel" role="menu">
              <div className="menu__who"><strong>{user?.name}</strong><span className="meta">{user?.email}</span></div>
              <button role="menuitem" className="menu__item" onClick={() => { setOpen(false); navigate('/settings'); }}><SettingsIcon size={16} aria-hidden="true" />Settings</button>
              <button role="menuitem" className="menu__item" onClick={() => { logout(); navigate('/'); }}><LogOut size={16} aria-hidden="true" />Log out</button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
