"use client";
import React, { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  // 用來標記「是否已經從 LocalStorage 讀取過資料」
  const [isInitialized, setIsInitialized] = useState(false);

  // 1. 初始讀取：從 LocalStorage 撈資料
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedCart = localStorage.getItem("shopping-cart");
      if (storedCart) {
        try {
          setCartItems(JSON.parse(storedCart));
        } catch (error) {
          console.error("Failed to parse cart data", error);
        }
      }
      setIsInitialized(true); 
    }
  }, []);

  // 2. 自動存檔：當 cartItems 變動時，寫入 LocalStorage
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem("shopping-cart", JSON.stringify(cartItems));
    }
  }, [cartItems, isInitialized]);

  // 🔥 關鍵修復：加入購物車邏輯
  const addToCart = (newItem, quantity) => {
    setCartItems((prevItems) => {
      // 🔍 嚴格比對商品 ID！
      const existingItemIndex = prevItems.findIndex((item) => item.id === newItem.id);

      if (existingItemIndex !== -1) {
        // ⚠️ 如果已經存在，只「增加數量」，絕對不新增一筆！
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex].quantity += quantity;
        
        // 順便把最新的價格格式和 metadata 補上去，確保跨語系時不會落後
        updatedItems[existingItemIndex].rawPrice = newItem.rawPrice; 
        updatedItems[existingItemIndex].price = newItem.price; 
        updatedItems[existingItemIndex].metadata = newItem.metadata; 
        
        return updatedItems;
      } else {
        // 只有找不到這個 ID 的時候，才新增為獨立的一筆
        return [...prevItems, { ...newItem, quantity }];
      }
    });
    setIsCartOpen(true); // 打開側邊欄
  };

  // 直接更新數量 (用於側邊欄的 + - 按鈕)
  const updateQuantity = (id, newQuantity) => {
    if (newQuantity < 1) return; // 防止數量小於 1
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  // 移除商品
  const removeFromCart = (id) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  // 計算總數量
  const totalQty = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity, 
        isCartOpen,
        setIsCartOpen,
        totalQty,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};