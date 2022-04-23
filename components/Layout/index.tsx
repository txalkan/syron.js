import { ReactNode } from "react";
import { useStore } from "effector-react";
import Head from "next/head";
import { Header, Footer, Menu } from "..";
import { $menuOn } from "../../src/store/menuOn";

interface LayoutProps {
  children: ReactNode;
}

function LayoutSearch(props: LayoutProps) {
  const { children } = props;
  const menuOn = useStore($menuOn);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <Head>
        <title>SSI Browser</title>
      </Head>
      <div id="bg" />
      <div id="wrapper">
        <Header />
        {!menuOn && children}
        <Menu />
        <Footer />
      </div>
    </div>
  );
}

export default LayoutSearch;
