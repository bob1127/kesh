import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/router";

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const verifyMedusaSession = async () => {
    setLoading(true);
    const token = localStorage.getItem("medusa_auth_token");
    const isGoogleLogin = localStorage.getItem("is_google_login") === "true"; 
    
    const savedGoogleName = localStorage.getItem("google_name");
    const savedGoogleAvatar = localStorage.getItem("google_avatar");

    if (!token) {
      setUserInfo(null);
      setLoading(false);
      return;
    }

    const BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000";
    const API_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY;

    try {
      const res = await fetch(`${BACKEND_URL}/store/customers/me`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "x-publishable-api-key": API_KEY,
        },
      });

      if (res.ok) {
        const data = await res.json();
        
        // 🔥 精準判斷名字：Google 登入優先 -> 註冊填的 first_name -> Email 前綴
        let displayName = "";
        if (isGoogleLogin && savedGoogleName) {
            displayName = savedGoogleName;
        } else if (data.customer.first_name && data.customer.first_name !== "Member") {
            displayName = data.customer.first_name;
        } else if (data.customer.email) {
            displayName = data.customer.email.split('@')[0];
        } else {
            displayName = "KÉSH VIP";
        }

        setUserInfo({
          id: data.customer.id,
          name: displayName,
          email: data.customer.email,
          avatar: (isGoogleLogin && savedGoogleAvatar) ? savedGoogleAvatar : null,
        });
      } else {
        // 🔥 修正：如果 Token 無效 (例如過期)，必須立刻清空並登出！絕對不能放行！
        localStorage.removeItem("medusa_auth_token");
        setUserInfo(null);
      }
    } catch (error) {
      console.error("❌ [UserContext] 驗證發生錯誤:", error);
      setUserInfo(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    verifyMedusaSession();
  }, [router.pathname]);

  const logout = () => {
    localStorage.removeItem("medusa_auth_token");
    localStorage.removeItem("is_google_login");
    localStorage.removeItem("google_name");
    localStorage.removeItem("google_avatar");
    setUserInfo(null);
    router.push("/login");
  };

  return (
    <UserContext.Provider value={{ userInfo, loading, verifyMedusaSession, logout }}>
      {children}
    </UserContext.Provider>
  );
};