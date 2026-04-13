import { useState } from "react";
import { useUser } from "../components/context/UserContext"; 
import { useRouter } from "next/router";

const RegisterForm = ({ onSuccess }) => {
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useUser();
  const router = useRouter();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage("註冊中...");
    setIsLoading(true);

    try {
      const res = await fetch(
        "https://dyx.wxv.mybluehost.me/website_a8bfc44c/wp-json/custom/v1/register",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        }
      );

      const data = await res.json();

      if (res.ok && data.user_id) {
        setMessage("註冊成功！正在自動登入...");
        const loginResult = await login(form.username, form.password);
        
        if (loginResult.success) {
           setMessage("登入成功，正在跳轉...");
           if (onSuccess) onSuccess(); 
           router.push("/");
        } else {
           setMessage("註冊成功，但自動登入失敗，請手動登入。");
           setIsLoading(false);
        }
      } else {
        setMessage(data.message || "註冊失敗");
        setIsLoading(false);
      }
    } catch (err) {
      setMessage("錯誤：" + err.message);
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleRegister} className="flex flex-col gap-4">
      {/* ...Input Fields 保持不變... */}
      <div>
        <label className="block text-sm font-medium mb-1">帳號</label>
        <input required type="text" name="username" value={form.username} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black/50" />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Email</label>
        <input required type="email" name="email" value={form.email} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black/50" />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">密碼</label>
        <input required type="password" name="password" value={form.password} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black/50" />
      </div>

      <button type="submit" disabled={isLoading} className="w-full py-2 mt-2 bg-black text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50">
        {isLoading ? "處理中..." : "註冊"}
      </button>

      {message && <p className={`text-sm text-center mt-2 ${message.includes("失敗") ? "text-red-600" : "text-green-600"}`}>{message}</p>}
    </form>
  );
};

export default RegisterForm;