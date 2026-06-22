import { useEffect } from "react";

export const useFavicon = (iconPath: string) => {
  useEffect(() => {
    let favicon = document.querySelector("link[rel~='icon']") as HTMLLinkElement;

    if (!favicon) {
      favicon = document.createElement("link");
      favicon.rel = "icon";
      document.getElementsByTagName("head")[0].appendChild(favicon);
    }

    const previousIcon = favicon.href;

    favicon.href = iconPath;

    return () => {
      favicon.href = previousIcon;
    };
  }, [iconPath]);
};
