import React from 'react';
import { useSelector } from '../../context';
import { KeyFile } from '../index';
import ArConnect from '../ArConnect';

export interface IConnectWallet {
  username: string;
  domain: string;
  taken: any;
}

function ConnectWallet({ username, domain, taken }: IConnectWallet) {
  const { address } = useSelector((state) => state.user);

  return (
    <div id="main" style={{ marginTop: '4%' }}>
      <h2 style={{ width: '100%', textAlign: 'center' }} className="major">
        Sign in
      </h2>
      <section style={{ width: '100%' }}>
        <p>
          Connect your SSI Permawallet Key to access your settings or to
          register a new account:
        </p>
        <ArConnect />
        <KeyFile />
      </section>
      {/* <section style={{ width: "100%", marginTop: "4%" }}>
        {address && account.ssi === address && (
          <PrivateProfile
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
