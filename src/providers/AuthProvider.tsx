import { createContext, useContext, useState, useEffect } from "react";
import { getCurrentUser, isSessionValid } from "@/lib/auth/Auth.api";

const AuthContext = createContext<{
  user: ReturnType<typeof getCurrentUser>;
  isAuthenticated: boolean;
  hydrated: boolean;
}>({ user: null, isAuthenticated: false, hydrated: false });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state] = useState(() => ({
    user: getCurrentUser(),
    isAuthenticated: isSessionValid(),
    hydrated: true,
  }));

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
