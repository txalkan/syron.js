import Layout from "../../components/Layout";
import {
  DIDxWallet,
  Treasury,
  VerifiableCredentials,
  Defi,
} from "../../components";
import { useEffect } from "react";
import { $loading } from "../../src/store/loading";
import { useStore } from "effector-react";
import { $user, updateUser } from "../../src/store/user";

function Header() {
  const loading = useStore($loading);
  const user = useStore($user);
  useEffect(() => {
    const path = window.location.pathname.toLowerCase();
    const first = path.split("/")[1];
    const username = first.split(".")[0];
    let domain = "did";
    if (first.split(".")[1] !== undefined) {
      domain = first.split(".")[1];
    }
    updateUser({
      name: username,
      domain: domain,
    });
  }, [updateUser]);

  return (
    <>
      <Layout>
        {!loading ? (
          <>
            {user?.name !== "" ? (
              <>
                {user?.domain === "defi" ? (
                  <Defi />
                ) : user?.domain === "vc" ? (
                  <VerifiableCredentials />
                ) : user?.domain === "treasury" ? (
                  <Treasury />
                ) : (
                  setTimeout(() => {
                    <DIDxWallet>
                      <div />
                    </DIDxWallet>;
                  }, 1000)
                )}
              </>
            ) : (
              <></>
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
