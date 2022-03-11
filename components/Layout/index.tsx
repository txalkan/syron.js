import { ReactNode } from "react";
import Head from "next/head";
import {
  Header,
  Connect,
  SSIProtocol,
  FAQ,
  Footer,
} from "..";

interface LayoutProps {
  children: ReactNode;
}

function LayoutSearch(props: LayoutProps) {
  const { children } = props;

  return (
    //@todo-1 define general container style, fix width so it is as wide as the search bar
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
        <SSIProtocol />
        <FAQ />
        <Footer />
      </div>
    </div>
  );
}

export default LayoutSearch;
