import { ReactNode } from "react";
import { useStore } from "effector-react";
import { useSelector } from "react-redux";
import { RootState } from "../../src/app/reducers";
import Head from "next/head";
import { Header, Footer, Menu } from "..";
import { $menuOn } from "../../src/store/menuOn";

interface LayoutProps {
  children: ReactNode;
}

function LayoutSearch(props: LayoutProps) {
  const { children } = props;
  const newSSIModal = useSelector(
    (state: RootState) => state.modal.newSSIModal
  );
  const txStatusModal = useSelector(
    (state: RootState) => state.modal.txStatusModal
  );
  const getStartedModal = useSelector(
    (state: RootState) => state.modal.getStartedModal
  );
  const loginModal = useSelector((state: RootState) => state.modal.loginModal);
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
        {!menuOn &&
          !newSSIModal &&
          !txStatusModal &&
          !getStartedModal &&
          !loginModal &&
          children}
        <Menu />
        <Footer />
      </div>
    </div>
  );
}

export default LayoutSearch;
