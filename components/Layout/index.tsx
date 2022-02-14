import { ReactNode } from "react";
import Head from 'next/head'
import { SearchBar, Connect, SSIProtocol, FAQ, AccessWallet, Footer } from '..';

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
            <div id="header">
              <div className="content">
                <div className="inner">
                    <SearchBar>
                      {children}
                    </SearchBar>
                    <AccessWallet />
                </div>
              </div>
            </div>
            <Connect />
            <SSIProtocol />
            <FAQ />
            <Footer />
          </div>
        </>
    );
}

export default LayoutSearch;
