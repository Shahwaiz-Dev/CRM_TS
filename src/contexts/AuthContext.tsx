import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  role: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  setUser: () => {},
  loading: true,
});

export const useAuth = () => useContext(AuthContext);

export const useRole = () => {
  const { user } = useAuth();
  return user?.role || null;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check localStorage for user data
    const authData = localStorage.getItem('auth');
    const userData = localStorage.getItem('user');
    
    if (authData === 'true' && userData) {
      try {
        const user = JSON.parse(userData);
        setUser(user);
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('auth');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const handleSetUser = (newUser: User | null) => {
    setUser(newUser);
    if (newUser) {
      localStorage.setItem('auth', 'true');
      localStorage.setItem('user', JSON.stringify(newUser));
    } else {
      localStorage.removeItem('auth');
      localStorage.removeItem('user');
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser: handleSetUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export { AuthContext }; 