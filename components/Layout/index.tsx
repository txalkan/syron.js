import { ReactNode } from "react";
import { useStore } from "effector-react";
import { useSelector } from "react-redux";
import { RootState } from "../../src/app/reducers";
import Head from "next/head";
import { Header, Footer, Menu, Dashboard } from "..";
import { $menuOn } from "../../src/store/menuOn";
import {
  $modalDashboard,
  $modalNewSsi,
  $modalTx,
  $modalLogin,
  $modalGetStarted,
  $modalBuyNft,
} from "../../src/store/modal";

interface LayoutProps {
  children: ReactNode;
}

function LayoutSearch(props: LayoutProps) {
  const { children } = props;
  const menuOn = useStore($menuOn);
  const modalDashboard = useStore($modalDashboard);
  const modalNewSsi = useStore($modalNewSsi);
  const modalTx = useStore($modalTx);
  const modalLogin = useStore($modalLogin);
  const modalGetStarted = useStore($modalGetStarted);
  const modalBuyNft = useStore($modalBuyNft);

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
        {!menuOn &&
          !modalNewSsi &&
          !modalTx &&
          !modalGetStarted &&
          !modalBuyNft &&
          !modalDashboard &&
          !modalLogin &&
          children}
        <Menu />
        <Dashboard />
        <Footer />
      </div>
    </div>
  );
}

export default LayoutSearch;
