import { useEffect } from "react";

export const useBeforeUnloadGuard = (shouldBlock: boolean) => {
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (!shouldBlock) return;

      e.preventDefault();
      e.returnValue = "";
    };

    window.addEventListener("beforeunload", handler);

    return () => {
      window.removeEventListener("beforeunload", handler);
    };
  }, [shouldBlock]);
};
