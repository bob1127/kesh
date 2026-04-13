"use client";
import React, { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  // 用來標記「是否已經從 LocalStorage 讀取過資料」
  const [isInitialized, setIsInitialized] = useState(false);

  // ✅ 1. 初始讀取：從 LocalStorage 撈資料
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

  // ✅ 2. 自動存檔：當 cartItems 變動時，寫入 LocalStorage
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem("shopping-cart", JSON.stringify(cartItems));
    }
  }, [cartItems, isInitialized]);

  // 加入購物車邏輯
  const addToCart = (product, quantity) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === product.id);
      if (existingItem) {
        return prevItems.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prevItems, { ...product, quantity }];
    });
    setIsCartOpen(true);
  };

  // ✅ 新增：直接更新數量 (用於 + - 按鈕)
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
        updateQuantity, // ✅ 記得匯出這個 function
        isCartOpen,
        setIsCartOpen,
        totalQty,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};