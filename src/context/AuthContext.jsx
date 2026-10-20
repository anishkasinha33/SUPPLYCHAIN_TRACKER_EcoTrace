import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { authService } from '../services/authService.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => authService.getSession());

  const login = useCallback(async (creds) => { const s = await authService.login(creds); setSession(s); return s; }, []);
  const loginDemo = useCallback(async () => { const s = await authService.loginDemo(); setSession(s); return s; }, []);
  const signup = useCallback(async (data) => { const s = await authService.signup(data); setSession(s); return s; }, []);
  const logout = useCallback(() => { authService.logout(); setSession(null); }, []);
  const updateProfile = useCallback((patch) => { const s = authService.updateProfile(patch); if (s) setSession(s); }, []);

  const value = useMemo(() => ({ user: session?.user || null, isAuthed: !!session, login, loginDemo, signup, logout, updateProfile }), [session, login, loginDemo, signup, logout, updateProfile]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
