import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { base44, DEMO } from '@/lib/base44';

export interface AuthUser { id: string; email: string; full_name?: string; role: 'admin' | 'user' | string }

interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const Ctx = createContext<AuthState | null>(null);

/* eslint-disable @typescript-eslint/no-explicit-any */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(!DEMO);

  const refresh = useCallback(async () => {
    try { setUser(((await base44.auth.me()) as any) ?? null); } catch { setUser(null); }
    setLoading(false);
  }, []);

  useEffect(() => { if (!DEMO) void refresh(); }, [refresh]);

  const login = useCallback(async (email: string, password: string) => {
    await (base44.auth as any).loginViaEmailPassword(email, password);
    await refresh();
  }, [refresh]);

  const logout = useCallback(async () => {
    try { await (base44.auth as any).logout(); } catch { /* la sesión local se limpia igual */ }
    setUser(null);
  }, []);

  return <Ctx.Provider value={{ user, loading, login, logout }}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useAuth fuera de AuthProvider');
  return v;
}
