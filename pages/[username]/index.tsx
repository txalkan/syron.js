import Layout from "../../components/Layout";
import {
  DIDxWallet,
  Treasury,
  VerifiableCredentials,
  Defi,
} from "../../components";
import { useEffect, useState } from "react";
import { $loading } from "../../src/store/loading";
import { useStore } from "effector-react";

function Header() {
  const loading = useStore($loading);
  const [domain, setDomain] = useState("");
  useEffect(() => {
    const { pathname } = window.location;
    setDomain(pathname.replace("/", "").toLowerCase().split(".")[1]);
  }, [setDomain]);

  return (
    <>
      <Layout>
        {!loading ? (
          <>
            {domain === "defi" ? (
              <Defi />
            ) : domain === "vc" ? (
              <VerifiableCredentials />
            ) : domain === "treasury" ? (
              <Treasury />
            ) : (
              <DIDxWallet>
                <div />
              </DIDxWallet>
            )}
          </>
        ) : (
          <></>
        )}
      </Layout>
    </>
  );
}

export default Header;
