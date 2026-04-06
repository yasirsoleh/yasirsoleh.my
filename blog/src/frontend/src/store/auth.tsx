import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";

const AUTH_STORAGE_KEY = "auth_token";

// extract account_id from token
const extractAccountId = (token: string): string | null => {
  const decoded = JSON.parse(atob(token.split(".")[1]));
  return decoded?.account_id ?? null;
};

export interface AuthState {
  token: string | null;
  accountId: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface AuthContextType extends AuthState {
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const getStoredToken = (): string | null => {
  try {
    return localStorage.getItem(AUTH_STORAGE_KEY);
  } catch (error) {
    console.error("Error reading token from localStorage:", error);
    return null;
  }
};

const setStoredToken = (token: string): void => {
  try {
    localStorage.setItem(AUTH_STORAGE_KEY, token);
  } catch (error) {
    console.error("Error saving token to localStorage:", error);
  }
};

const clearStoredAuth = (): void => {
  try {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  } catch (error) {
    console.error("Error clearing auth from localStorage:", error);
  }
};

// Provider props
interface AuthProviderProps {
  children: ReactNode;
}

// Provider component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [token, setTokenState] = useState<string | null>(null);
  const [accountId, setAccountIdState] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  // Load auth state from localStorage on mount
  useEffect(() => {
    const storedToken = getStoredToken();

    if (storedToken) {
      setTokenState(storedToken);
      setAccountIdState(extractAccountId(storedToken));
    }

    setIsLoading(false);
  }, []);

  const login = (newToken: string) => {
    setTokenState(newToken);
    setStoredToken(newToken);
    setAccountIdState(extractAccountId(newToken));
  };

  const logout = () => {
    setTokenState(null);
    setAccountIdState(null);
    clearStoredAuth();
  };

  const value: AuthContextType = {
    token,
    isAuthenticated: !!token,
    isLoading,
    login,
    logout,
    accountId,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
