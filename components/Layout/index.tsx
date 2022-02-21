import { ReactNode } from "react";
import Head from "next/head";
import { ToastContainer } from 'react-toastify'
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
    <>
      <Head>
        <title>SSI Browser</title>
      </Head>
      <div id="bg" />
      <div id="wrapper">
        <Header />
        <Connect />
        <SSIProtocol />
        {children}
        <FAQ />
        <Footer />
      </div>
    </>
  );
}

export default LayoutSearch;
