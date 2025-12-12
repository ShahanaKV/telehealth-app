import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const StreamContext = createContext();

export const StreamProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchToken = async () => {
      try {
        // First check localStorage for saved data
        const savedUser = localStorage.getItem('user');
        const savedToken = localStorage.getItem('streamToken');
        
        if (savedUser && savedToken) {
          console.log("✅ Loading user from localStorage");
          setUser(JSON.parse(savedUser));
          setToken(savedToken);
          setLoading(false);
          return;
        }

        // If not in localStorage, fetch from API
        const res = await axios.get(`${API_URL}/stream/get-token`, {
          withCredentials: true,
        });

        if (res.data?.user && res.data?.token) {
          console.log("✅ Fetched user from API:", res.data.user);
          setUser(res.data.user);
          setToken(res.data.token);
          
          // Save to localStorage
          localStorage.setItem('user', JSON.stringify(res.data.user));
          localStorage.setItem('streamToken', res.data.token);
        }
      } catch (error) {
        console.error("Error fetching Stream token:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchToken();
  }, []);

  const logout = async () => {
    try {
      await axios.post(`${API_URL}/users/logout`, {}, {
        withCredentials: true
      });

      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      localStorage.removeItem('streamToken');

      setUser(null);
      setToken(null);
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <StreamContext.Provider value={{ user, token, loading, Logout: logout }}>
      {children}
    </StreamContext.Provider>
  );
};

export const useStream = () => useContext(StreamContext);