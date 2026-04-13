// pages/checkout/failed.js
import Link from "next/link";
import Head from "next/head";

export default function CheckoutFailed() {
  return (
    <>
      <Head>
        <title>付款失敗 | CIEMAN</title>
      </Head>

      <div className="min-h-screen bg-white flex flex-col justify-center items-center px-4">
        <div className="max-w-md w-full text-center space-y-6">
          {/* 失敗圖示 */}
          <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-red-50 border border-red-100">
            <svg
              className="h-10 w-10 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>

          <h2 className="text-3xl font-serif text-gray-900 tracking-wide">
            PAYMENT FAILED
          </h2>

          <div className="text-gray-500 space-y-2">
            <p className="text-lg">付款過程發生錯誤</p>
            <p className="text-sm">
              可能是網路連線中斷或信用卡授權失敗，請重新嘗試。
            </p>
          </div>

          <div className="pt-8 space-y-4">
            <Link
              href="/checkout"
              className="block w-full py-4 border border-black bg-black text-white text-sm tracking-widest hover:bg-gray-800 transition-colors duration-300"
            >
              TRY AGAIN
            </Link>

            <Link
              href="/contact"
              className="block w-full py-4 text-gray-400 text-xs tracking-widest hover:text-gray-600 transition-colors duration-300"
            >
              NEED HELP? CONTACT SUPPORT
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
