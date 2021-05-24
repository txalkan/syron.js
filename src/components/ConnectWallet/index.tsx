import React from "react";

import { useSelector } from '../../context';
import arweave from '../../config/arwave';
import { Settings, Profile, CreateAccount, KeyFile } from "../index";
import ArConnect from "../ArConnect";

export interface IConnectWallet {
  taken: any;
  username: string;
  domain: string;
}

function ConnectWallet({
  taken,
  username,
  domain
}: IConnectWallet) {
  const { address } = useSelector(state => state.user)

  return (
    <div id="main" style={{ marginTop: "4%" }}>
      <h2 style={{ width: "100%", textAlign: "center" }} className="major">
        Sign in
      </h2>
      <section style={{ width: "100%" }}>
        <p>
          Connect your SSI Permaweb Key to access your settings or to register a
          new account:
        </p>
        <ArConnect />
        <KeyFile />
      </section>
      {/* <section style={{ width: "100%", marginTop: "4%" }}>
        {address && account.ssi === address && (
          <Settings
            username={username}
            domain={domain}
            account={account}
            pscMember={pscMember}
            arweave={arweave}
            arconnect={arconnect}
            keyfile={keyfile}
          />
        )}
        {taken === "yes" && account.ssi !== address && (
          <Profile
            username={username}
            domain={domain}
            account={account}
            arweave={arweave}
            arconnect={arconnect}
            keyfile={keyfile}
          />
        )}
        {taken === "no" && (
          <CreateAccount
            username={username}
            domain={domain}
            address={addr}
            pscMember={pscMember}
            arweave={arweave}
            arconnect={arconnect}
            keyfile={keyfile}
          />
        )}
      </section> */}
    </div>
  );
}

export default ConnectWallet;
