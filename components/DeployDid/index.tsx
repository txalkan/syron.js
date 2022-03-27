import React from "react";
import { useStore } from "effector-react";
import { toast } from "react-toastify";
import { $zil_address } from "../../src/store/zil_address";
import { ZilPayBase } from "../ZilPay/zilpay-base";
import * as zcrypto from "@zilliqa-js/crypto";
import { $new_ssi, updateNewSSI } from "../../src/store/new-ssi";
import { $net } from "../../src/store/wallet-network";

function Component() {
  const zil_address = useStore($zil_address);
  const net = useStore($net);
  const new_ssi = useStore($new_ssi);

  const handleDeploy = async () => {
    if (zil_address !== null && net !== null) {
      const zilpay = new ZilPayBase();
      await zilpay
        .deployDid(net, zil_address.base16)
        .then((deploy: any) => {
          let new_ssi = deploy[1].address;
          new_ssi = zcrypto.toChecksumAddress(new_ssi);
          updateNewSSI(new_ssi);
          /** @todo 
           * wait until contract deployment gets confirmed 
           * add spinner
           * */
          toast.info('Next, search for the NFT Username that you would like to buy for your SSI!', {
            position: "top-center",
            autoClose: 6000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: 'dark',
          });
        })
        .catch(error => {
          toast.error(String(error), {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: 'dark',
          });
        });
    } else {
      toast.warning('Connect your ZilPay wallet.', {
        position: "top-center",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: 'dark',
      });
    }
  };

  return (
    <>
      {
        new_ssi === null
          ? <div style={{ textAlign: "center", marginTop: "5%" }}>
            <h3>deploy a brand new</h3>
            <h2 style={{ color: 'silver' }}>self-sovereign identity</h2>
            <button className='button' onClick={handleDeploy}>
              <span style={{ color: "yellow" }}>new ssi</span><span className="label">&#9889;</span>
            </button>
            <h5 style={{ color: "lightgrey" }}>
              around 1 ZIL
            </h5>
          </div>
          : <div style={{ textAlign: "center" }}>
            <p>
              Save your new self-sovereign identity address:{" "}
              <a
                style={{ color: '#ffff32' }}
                href={`https://viewblock.io/zilliqa/address/${new_ssi}?network=${net}`}
                rel="noreferrer"
                target="_blank"
              >
                {zcrypto.toBech32Address(new_ssi)}
              </a>
            </p>
            <div style={{ marginTop: '10%' }}>
              <p>
                Or create a new one:
              </p>
              <button className='button' onClick={handleDeploy}>
                <span style={{ color: "yellow" }}>new ssi</span><span className="label">&#9889;</span>
              </button>
              <h5 style={{ marginTop: '3%', color: "lightgrey" }}>
                around 1 ZIL
              </h5>
            </div>
          </div>
      }
    </>
  );
}

export default Component;
