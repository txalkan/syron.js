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
import { updateUser } from "../../src/store/user";

function Header() {
  const loading = useStore($loading);
  const [user, setUser] = useState({ name: "", domain: "" });
  useEffect(() => {
    const { pathname } = window.location;
    const path = pathname.replace("/", "").toLowerCase();
    let domain = path.split(".")[1];
    if (domain === undefined) {
      domain = "did";
    }
    updateUser({
      name: path.split(".")[0],
      domain: domain,
    });
    setUser({
      name: path.split(".")[0],
      domain: domain,
    });
  }, [setUser]);

  return (
    <>
      <Layout>
        {!loading ? (
          <>
            {user.domain === "defi" ? (
              <Defi />
            ) : user.domain === "vc" ? (
              <VerifiableCredentials />
            ) : user.domain === "treasury" ? (
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
