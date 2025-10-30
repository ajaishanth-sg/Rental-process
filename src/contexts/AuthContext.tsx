import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface User {
  id: string;
  email: string;
  name: string;
}

interface Session {
  user: User;
  access_token: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  role: string | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  role: null,
  loading: true,
  signIn: async () => {},
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const signIn = async (email: string, password: string) => {
    try {
      // Backend authentication only - admin-created users required
      const response = await fetch('http://localhost:8000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: email, password }),
      });

      if (!response.ok) {
        throw new Error('Invalid credentials');
      }

      const data = await response.json();
      const token = data.access_token;

      // Decode token to get user info
      const payload = JSON.parse(atob(token.split('.')[1]));
      const role = payload.role;
      const userInfo = {
        id: `demo-${role}`, // Match backend demo user ID format
        email: payload.sub,
        name: `Demo ${role.charAt(0).toUpperCase() + role.slice(1)}`, // Proper name format
      };

      setUser(userInfo);
      setRole(payload.role);
      setSession({ user: userInfo, access_token: token });

      // Store in localStorage
      localStorage.setItem('auth_token', token);
      localStorage.setItem('user', JSON.stringify(userInfo));
      localStorage.setItem('role', payload.role);

      navigate(`/${payload.role}`);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  useEffect(() => {
    // Restore authentication data from localStorage
    const token = localStorage.getItem('auth_token');
    const userStr = localStorage.getItem('user');
    const roleStr = localStorage.getItem('role');

    if (token && userStr && roleStr) {
      try {
        const userInfo = JSON.parse(userStr);
        setUser(userInfo);
        setRole(roleStr);
        setSession({ user: userInfo, access_token: token });
      } catch (error) {
        console.error('Error parsing stored auth data:', error);
        // Clear invalid data
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        localStorage.removeItem('role');
        setUser(null);
        setSession(null);
        setRole(null);
      }
    }

    setLoading(false);
  }, [navigate]);

  const signOut = async () => {
    // Clear localStorage
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    setUser(null);
    setSession(null);
    setRole(null);
    navigate('/auth');
  };

  return (
    <AuthContext.Provider value={{ user, session, role, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
