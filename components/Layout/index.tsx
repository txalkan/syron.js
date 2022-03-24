import { ReactNode } from "react";
import Head from "next/head";
import {
  Header,
  Connect,
  FAQ,
  Footer,
  Menu,
} from "..";

interface LayoutProps {
  children: ReactNode;
}

function LayoutSearch(props: LayoutProps) {
  const { children } = props;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}
    >
      <Head>
        <title>SSI Browser</title>
      </Head>
      <div id="bg" />
      <div id="wrapper">
        <Header />
        {children}
        <Connect />
        <Menu />
        <Footer />
      </div>
    </div>
  );
}

export default LayoutSearch;
