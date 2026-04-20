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
    
    // 🌍 讀取三大社群登入的標記
    const isGoogle = localStorage.getItem("is_google_login") === "true";
    const isFacebook = localStorage.getItem("is_facebook_login") === "true";
    const isLine = localStorage.getItem("is_line_login") === "true";
    
    const socialName = localStorage.getItem("google_name") || localStorage.getItem("facebook_name") || localStorage.getItem("line_name");
    const socialAvatar = localStorage.getItem("google_avatar") || localStorage.getItem("facebook_avatar") || localStorage.getItem("line_avatar");

    if (!token) {
      setUserInfo(null);
      setLoading(false);
      return;
    }

    const BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000";
    const API_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "";

    try {
      const res = await fetch(`${BACKEND_URL}/store/customers/me`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "x-publishable-api-key": API_KEY,
        },
      });

      if (res.ok) {
        const data = await res.json();
        const customer = data.customer || data; // 容錯處理：適應 Medusa 不同版本的物件結構
        
        // 🔥 精準判斷名字：社群優先 -> 註冊填的 -> Email前綴
        let displayName = "";
        if ((isGoogle || isFacebook || isLine) && socialName) {
            displayName = socialName;
        } else if (customer.first_name && customer.first_name !== "Member") {
            displayName = customer.first_name;
        } else if (customer.email) {
            displayName = customer.email.split('@')[0];
        } else {
            displayName = "KÉSH VIP";
        }

        setUserInfo({
          id: customer.id,
          name: displayName,
          email: customer.email,
          phone: customer.phone,
          avatar: ((isGoogle || isFacebook || isLine) && socialAvatar) ? socialAvatar : null,
        });
      } else {
        console.warn(`[UserContext] 驗證警告：API 回傳狀態碼 ${res.status}`);
        
        // 🛡️ 防護升級：只有明確是 401 (未授權/Token過期) 才強制登出清空
        if (res.status === 401) {
            logout(false); // 傳遞 false 避免不斷跳轉造成死循環
        } else {
            // 其他狀況 (如 404 同步延遲) 先保留 Token，但畫面顯示為尚未登入，避免誤刪
            setUserInfo(null);
        }
      }
    } catch (error) {
      console.error("❌ [UserContext] 驗證發生連線錯誤:", error);
      setUserInfo(null); // 網路斷線時不刪 Token
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    verifyMedusaSession();

    // 💡 黑魔法：跨分頁同步登入狀態
    const handleStorageChange = (e) => {
        if (e.key === "medusa_auth_token") {
            verifyMedusaSession();
        }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [router.pathname]);

  const logout = (redirect = true) => {
    // 徹底清除所有狀態
    localStorage.removeItem("medusa_auth_token");
    localStorage.removeItem("is_google_login");
    localStorage.removeItem("is_facebook_login");
    localStorage.removeItem("is_line_login");
    localStorage.removeItem("google_name");
    localStorage.removeItem("google_avatar");
    localStorage.removeItem("facebook_name");
    localStorage.removeItem("facebook_avatar");
    localStorage.removeItem("line_name");
    localStorage.removeItem("line_avatar");
    
    setUserInfo(null);
    if (redirect) {
        window.location.href = "/login";
    }
  };

  return (
    <UserContext.Provider value={{ userInfo, loading, verifyMedusaSession, logout }}>
      {children}
    </UserContext.Provider>
  );
};