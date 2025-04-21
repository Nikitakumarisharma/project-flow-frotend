import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

export type UserRole = "sales" | "cto" | "developer";

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  password: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  createDeveloper: (name: string, email: string, password: string) => Promise<void>;
  getAllDevelopers: () => Promise<User[]>;
  getDeveloperById: (id: string) => Promise<User | null>;
  deleteDeveloper: (id: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);
export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false); // ✅ add this

  const BASE_URL = "https://project-flow-backend.vercel.app/api";

  // Load user on mount
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      const storedToken = localStorage.getItem("token");
      
      if (storedUser && storedUser !== "undefined" && storedUser !== "null" && storedToken) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setIsAuthenticated(true);
      } else {
        // Clear any invalid data
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error("Error parsing user from localStorage:", error);
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  }, []);
  
  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await axios.post(`${BASE_URL}/auth/login`, { email, password });
      const { token, user } = response.data.data;

      // Set token in localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      // Set auth state
      setUser(user);
      setIsAuthenticated(true);

      // Set default authorization header for all future requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } catch (err) {
      throw new Error("Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    delete axios.defaults.headers.common['Authorization'];
  };

  const createDeveloper = async (name: string, email: string, password: string) => {
    try {
      const response = await axios.post(`${BASE_URL}/users/newUser`, {
        name,
        email,
        password,
        role: "developer",
      });

      const newUser = response.data.data;
      

      await new Promise((resolve) => setTimeout(resolve, 500));
    } catch (err) {
      throw new Error("Failed to create developer");
    }
  };

  const getAllDevelopers = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/users`);
      return response.data.data.filter((user: User) => user.role === "developer");
    } catch (err) {
      throw new Error("Failed to fetch developers");
    }
  };

  const getDeveloperById = async (id: string) => {
    try {
      const response = await axios.get(`${BASE_URL}/users/${id}`);
      const user = response.data.data;
      return user && user.role === "developer" ? user : null;
    } catch (err) {
      throw new Error("Developer not found");
    }
  };

  const deleteDeveloper = async (id: string) => {
    try {
      await axios.delete(`${BASE_URL}/users/deleteUser/${id}`);
    } catch (err) {
      throw new Error("Failed to delete developer");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated,
        login,
        logout,
        createDeveloper,
        getAllDevelopers,
        getDeveloperById,
        deleteDeveloper,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
