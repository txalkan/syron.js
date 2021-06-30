import React from 'react';
import { KeyFile, PrivateKey } from '../index';
import ArConnect from '../ArConnect';

export interface IConnectWallet {
  username: string;
  domain: string;
  taken: any;
}

function ConnectPermaWallet() {
  //const { address } = useSelector((state) => state.user);

  return (
    <div id="main" style={{ marginTop: '4%' }}>
      <section style={{ width: '100%' }}>
        <ArConnect />
        {/* TODO: SecModal 
        <PrivateKey /> */}
        <KeyFile />
      </section>
      {/* <section style={{ width: "100%", marginTop: "4%" }}>
        {address && account.ssi === address && (
          <PrivateProfile
            username={username}
            domain={domain}
            account={account}
            arweave={arweave}
            arconnect={arconnect}
            keyfile={keyfile}
          />
        )}
        {taken === "yes" && account.ssi !== address && (
          <PublicProfile
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
            arweave={arweave}
            arconnect={arconnect}
            keyfile={keyfile}
          />
        )}
      </section> */}
    </div>
  );
}

export default ConnectPermaWallet;
