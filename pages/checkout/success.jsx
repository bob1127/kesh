// pages/checkout/success.js
import Link from "next/link";
import Head from "next/head";

export default function CheckoutSuccess() {
  return (
    <>
      <Head>
        <title>訂單成立 | CIEMAN</title>
      </Head>

      <div className="min-h-screen bg-white flex flex-col justify-center items-center px-4">
        <div className="max-w-md w-full text-center space-y-6">
          {/* 成功圖示 (簡約細線風格) */}
          <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-gray-50 border border-gray-200">
            <svg
              className="h-10 w-10 text-black"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          <h2 className="text-3xl font-serif text-gray-900 tracking-wide">
            THANK YOU
          </h2>

          <div className="text-gray-500 space-y-2">
            <p className="text-lg">您的訂單已成功建立</p>
            <p className="text-sm">
              確認信件已發送至您的電子信箱，我們會盡快為您安排出貨。
            </p>
          </div>

          <div className="pt-8 space-y-4">
            <Link
              href="/"
              className="block w-full py-4 border border-black bg-black text-white text-sm tracking-widest hover:bg-gray-800 transition-colors duration-300"
            >
              回首頁
            </Link>

            <Link
              href="/member/profile"
              className="block w-full py-4 border border-gray-200 text-gray-600 text-sm tracking-widest hover:border-black hover:text-black transition-colors duration-300"
            >
              查看訂單
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
