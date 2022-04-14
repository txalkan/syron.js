import React, { useState } from "react";
import { useStore } from "effector-react";
import { toast } from "react-toastify";
import { $zil_address } from "../../src/store/zil_address";
import { ZilPayBase } from "../ZilPay/zilpay-base";
import * as zcrypto from "@zilliqa-js/crypto";
import { $net } from "../../src/store/wallet-network";

function Component() {
  const zil_address = useStore($zil_address);
  const net = useStore($net);
  const [newAddr, setNewAddr] = useState('');

  const handleDeployToken = async () => {
    if (zil_address !== null && net !== null) {
      const zilpay = new ZilPayBase();
      await zilpay
        .deployToken(net)
        .then((deploy: any) => {
          let new_addr = deploy[1].address;
          new_addr = zcrypto.toChecksumAddress(new_addr);
          setNewAddr(new_addr);
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

  const handleDeployImpl = async () => {
    if (zil_address !== null && net !== null) {
      const zilpay = new ZilPayBase();
      await zilpay
        .deployImpl(net, zil_address.base16)
        .then((deploy: any) => {
          let new_addr = deploy[1].address;
          new_addr = zcrypto.toChecksumAddress(new_addr);
          setNewAddr(new_addr);
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

  const handleDeployStablecoin = async () => {
    if (zil_address !== null && net !== null) {
      const zilpay = new ZilPayBase();
      await zilpay
        .deployStablecoin(net)
        .then((deploy: any) => {
          let new_addr = deploy[1].address;
          new_addr = zcrypto.toChecksumAddress(new_addr);
          setNewAddr(new_addr);
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

  const handleDeployStableImpl = async () => {
    if (zil_address !== null && net !== null) {
      const zilpay = new ZilPayBase();
      await zilpay
        .deployStableImpl(net, zil_address.base16)
        .then((deploy: any) => {
          let new_addr = deploy[1].address;
          new_addr = zcrypto.toChecksumAddress(new_addr);
          setNewAddr(new_addr);
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
      <div>
        <p>
          Save your new self-sovereign identity address:{" "}
          <a
            style={{ color: '#ffff32' }}
            href={`https://viewblock.io/zilliqa/address/${newAddr}?network=${net}`}
            rel="noreferrer"
            target="_blank"
          >
            {newAddr}
          </a>
        </p>
      </div>
      <p style={{ margin: '7%' }}>
        Only on the deploy token branch:
      </p>
      <button className='button' onClick={handleDeployToken}>
        <span style={{ color: "yellow" }}>deploy token</span><span className="label">&#9889;</span>
      </button>
      <button className='button' onClick={handleDeployImpl}>
        <span style={{ color: "yellow" }}>deploy implementation</span><span className="label">&#9889;</span>
      </button>
      <p style={{ margin: '7%' }}>
        SSI Dollar
      </p>
      <button className='button' onClick={handleDeployStablecoin}>
        <span style={{ color: "yellow" }}>deploy proxy</span><span className="label">&#9889;</span>
      </button>
      <button className='button' onClick={handleDeployStableImpl}>
        <span style={{ color: "yellow" }}>deploy implementation</span><span className="label">&#9889;</span>
      </button>
    </>
  );
}

export default Component;
