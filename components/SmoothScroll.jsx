import { useEffect, useState } from "react";
import { ReactLenis } from "@studio-freight/react-lenis";

/** 僅桌機（≥ xl / 1280px）啟用 Lenis；手機／平板原生滾動，避免卡頓與側選單無法滾動 */
export default function SmoothScroll({ children }) {
  const [enableLenis, setEnableLenis] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1280px)");
    const sync = () => setEnableLenis(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  if (!enableLenis) return children;
  return <ReactLenis root>{children}</ReactLenis>;
}
