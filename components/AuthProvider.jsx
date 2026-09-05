"use client";
import { createContext, useContext } from "react";

/**
 * 舊 WordPress JWT AuthProvider 已停用。
 * 實際會員登入請使用 UserContext（Medusa / 社群登入）。
 */
const AuthContext = createContext({
  user: null,
  token: null,
  login: async () => {
    throw new Error("請使用會員中心登入（Medusa）");
  },
  logout: () => {},
});

export const AuthProvider = ({ children }) => (
  <AuthContext.Provider
    value={{
      user: null,
      token: null,
      login: async () => {
        throw new Error("請使用會員中心登入（Medusa）");
      },
      logout: () => {},
    }}
  >
    {children}
  </AuthContext.Provider>
);

export const useAuth = () => useContext(AuthContext);
