import React from "react";

import { useSelector } from '../../context';
import arweave from '../../config/airwave';
import { Settings, Profile, CreateAccount } from "../index";
import ArConnect from "../ArConnect";

export interface IConnectWallet {
  taken: any;
  username: string;
  domain: string;
  // @TODO: Change this to better types
  account: any;
  pscMember: any;
}

function ConnectWallet({
  taken,
  username,
  domain,
  account,
  pscMember,
}: IConnectWallet) {
  const { address } = useSelector(state => state.user)
  
  // const [save, setSave] = useState("Save keyfile");
  // const [keyfile, setKeyfile] = useState("");
  // const fileInputRef = useRef<HTMLInputElement>(null);
  // const handleKeyFile = (event: React.ChangeEvent<HTMLInputElement>) => {
  //   event.preventDefault();
  //   const this_keyfile = fileInput.current.files[0];
  //   if (this_keyfile !== undefined) {
  //     alert(`Selected file: ${this_keyfile.name}`);
  //   }
  //   const fr = new FileReader();
  //   fr.onload = function (e) {
  //     const file = JSON.parse(e.target.result);
  //     setKeyfile(file);
  //   };
  //   fr.readAsText(fileInput.current.files[0]);
  // };

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
        {/* <input type="file" ref={fileInputRef} onChange={handleKeyFile} />
        <input
          type="button"
          value={save}
          onClick={async () => {
            if (keyfile) {
              const address = await arweave.wallets.jwkToAddress(keyfile);
              alert(`The address of this keyfile is: ${address}`);
              setAddr(address);
              setSave("keyfile saved");
            } else {
              alert(`Address not retrieved from keyfile.`);
            }
          }}
        /> */}
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
