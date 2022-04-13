import { useEffect } from "react";
import { useRouter } from "next/router";

export default function Custom404() {
  const router = useRouter();

  useEffect(() => {
    const path = window.location.pathname.replace("/", "").toLowerCase();
    if (
      path.includes(".defi") ||
      path.includes(".vc") ||
      (path.includes(".treasury") && path.includes("/"))
    ) {
      router.push(`/${path.split("/")[0]}`);
    } else if (path.includes("/doc")) {
      if (path.includes(".did")) {
        router.push(`${path.split(".did")[0]}/did/doc`);
      } else {
        router.push(`${path.split("/")[0]}/did/doc`);
      }
    } else if (path.includes("/funds")) {
      if (path.includes(".did")) {
        router.push(`${path.split(".did")[0]}/did/funds`);
      } else {
        router.push(`${path.split("/")[0]}/did/doc`);
      }
    } else {
      router.replace("/");
    }
  });

  return null;
}
