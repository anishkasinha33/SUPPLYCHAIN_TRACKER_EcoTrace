import { Fragment, createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authService } from '../services/authService.js';
import { Loader } from '../components/common/States.jsx';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [ready, setReady] = useState(false);

  // The session lives in an HTTP-only cookie, so ask the server once at start-up who is signed in.
  useEffect(() => {
    let alive = true;
    authService.restore().then((s) => { if (alive) { setSession(s); setReady(true); } });
    return () => { alive = false; };
  }, []);

  const login = useCallback(async (creds) => { const s = await authService.login(creds); setSession(s); return s; }, []);
  const loginDemo = useCallback(async () => { const s = await authService.loginDemo(); setSession(s); return s; }, []);
  const signup = useCallback(async (data) => { const s = await authService.signup(data); setSession(s); return s; }, []);
  const logout = useCallback(() => { authService.logout(); setSession(null); }, []);
  const updateProfile = useCallback(async (patch) => { const s = await authService.updateProfile(patch); if (s) setSession(s); }, []);

  const value = useMemo(() => ({ user: session?.user || null, isAuthed: !!session, login, loginDemo, signup, logout, updateProfile }), [session, login, loginDemo, signup, logout, updateProfile]);

  if (!ready) return <Loader label="Loading" />;
  // Keyed by account: signing in or out starts the data layer fresh, so one account's data is never shown to another.
  return (
    <AuthContext.Provider value={value}>
      <Fragment key={session?.user?.id || 'signed-out'}>{children}</Fragment>
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
