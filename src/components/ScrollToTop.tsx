import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant", // Usamos instantâneo para não parecer que o site está "rolando" sozinho
    });
  }, [pathname]);

  return null;
};

export default ScrollToTop;
