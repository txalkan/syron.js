import React from "react";
import { useStore } from "effector-react";
import { toast } from "react-toastify";
import { $zil_address } from "../../src/store/zil_address";
import { ZilPayBase } from "../ZilPay/zilpay-base";
import * as zcrypto from "@zilliqa-js/crypto";
import {
  $new_ssi,
  updateNewSSI as updateNewContract,
} from "../../src/store/new-ssi";
import { $net } from "../../src/store/wallet-network";
import ArConnect from "../ArConnect";
import { $arconnect } from "../../src/store/arconnect";

function Component() {
  const zil_address = useStore($zil_address);
  const net = useStore($net);
  const new_ssi = useStore($new_ssi);
  const arconnect = useStore($arconnect);

  const handleDeploy = async () => {
    if (zil_address !== null && net !== null) {
      const zilpay = new ZilPayBase();
      await zilpay
        .deployDid(net, zil_address.base16)
        .then((deploy: any) => {
          let new_ssi = deploy[1].address;
          new_ssi = zcrypto.toChecksumAddress(new_ssi);
          updateNewContract(new_ssi);
          /** @todo
           * wait until contract deployment gets confirmed
           * add spinner
           * */
          toast.info(
            "Next, search for the NFT Username that you would like to buy for your SSI!",
            {
              position: "top-center",
              autoClose: 6000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
              theme: "dark",
            }
          );
        })
        .catch((error) => {
          toast.error(String(error), {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "dark",
          });
        });
    } else {
      toast.warning("Connect your ZilPay wallet.", {
        position: "top-center",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
    }
  };

  const handleDeployAirdrop = async () => {
    if (zil_address !== null && net !== null) {
      const zilpay = new ZilPayBase();
      await zilpay
        .deployAirdropWallet(net)
        .then((deploy: any) => {
          let new_addr = deploy[1].address;
          new_addr = zcrypto.toChecksumAddress(new_addr);
          updateNewContract(new_addr);
        })
        .catch((error) => {
          toast.error(String(error), {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "dark",
          });
        });
    } else {
      toast.warning("Connect your ZilPay wallet.", {
        position: "top-center",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
    }
  };

  const handleDeployDApp = async () => {
    if (zil_address !== null && net !== null) {
      const zilpay = new ZilPayBase();
      await zilpay
        .deployDApp(net)
        .then((deploy: any) => {
          let new_addr = deploy[1].address;
          new_addr = zcrypto.toChecksumAddress(new_addr);
          updateNewContract(new_addr);
        })
        .catch((error) => {
          toast.error(String(error), {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "dark",
          });
        });
    } else {
      toast.warning("Connect your ZilPay wallet.", {
        position: "top-center",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
    }
  };

  const handleDeployImpl = async () => {
    if (zil_address !== null && net !== null) {
      const zilpay = new ZilPayBase();
      await zilpay
        .deployImpl(net, zil_address.base16, arconnect)
        .then((deploy: any) => {
          let new_ssi = deploy[1].address;
          new_ssi = zcrypto.toChecksumAddress(new_ssi);
          updateNewContract(new_ssi);
        })
        .catch((error) => {
          toast.error(String(error), {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "dark",
          });
        });
    } else {
      toast.warning("Connect your ZilPay wallet.", {
        position: "top-center",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
    }
  };

  const handleDeployDollar = async () => {
    if (zil_address !== null && net !== null) {
      const zilpay = new ZilPayBase();
      await zilpay
        .deployDollar(net, zil_address.base16)
        .then((deploy: any) => {
          let new_ssi = deploy[1].address;
          new_ssi = zcrypto.toChecksumAddress(new_ssi);
          updateNewContract(new_ssi);
        })
        .catch((error) => {
          toast.error(String(error), {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "dark",
          });
        });
    } else {
      toast.warning("Connect your ZilPay wallet.", {
        position: "top-center",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
    }
  };
  const handleDeploySGDollar = async () => {
    if (zil_address !== null && net !== null) {
      const zilpay = new ZilPayBase();
      await zilpay
        .deploySGDollar(net, zil_address.base16)
        .then((deploy: any) => {
          let new_ssi = deploy[1].address;
          new_ssi = zcrypto.toChecksumAddress(new_ssi);
          updateNewContract(new_ssi);
        })
        .catch((error) => {
          toast.error(String(error), {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "dark",
          });
        });
    } else {
      toast.warning("Connect your ZilPay wallet.", {
        position: "top-center",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
    }
  };
  const handleDeployTyron = async () => {
    if (zil_address !== null && net !== null) {
      const zilpay = new ZilPayBase();
      await zilpay
        .deployTyron(net, zil_address.base16)
        .then((deploy: any) => {
          let new_ssi = deploy[1].address;
          new_ssi = zcrypto.toChecksumAddress(new_ssi);
          updateNewContract(new_ssi);
        })
        .catch((error) => {
          toast.error(String(error), {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "dark",
          });
        });
    } else {
      toast.warning("Connect your ZilPay wallet.", {
        position: "top-center",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
    }
  };

  const handleDeployTransmuter = async () => {
    if (zil_address !== null && net !== null) {
      const zilpay = new ZilPayBase();
      await zilpay
        .deployDollarTransmuter(net, zil_address.base16)
        .then((deploy: any) => {
          let new_ssi = deploy[1].address;
          new_ssi = zcrypto.toChecksumAddress(new_ssi);
          updateNewContract(new_ssi);
        })
        .catch((error) => {
          toast.error(String(error), {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "dark",
          });
        });
    } else {
      toast.warning("Connect your ZilPay wallet.", {
        position: "top-center",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
    }
  };

  const handleDeployCommunity = async () => {
    if (zil_address !== null && net !== null) {
      const zilpay = new ZilPayBase();
      await zilpay
        .deployTyronS$ICommunity(net, zil_address.base16)
        .then((deploy: any) => {
          let new_ssi = deploy[1].address;
          new_ssi = zcrypto.toChecksumAddress(new_ssi);
          updateNewContract(new_ssi);
        })
        .catch((error) => {
          toast.error(String(error), {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "dark",
          });
        });
    } else {
      toast.warning("Connect your ZilPay wallet.", {
        position: "top-center",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
    }
  };

  const handleDeployStablecoin = async () => {
    if (zil_address !== null && net !== null) {
      const zilpay = new ZilPayBase();
      await zilpay
        .deployStablecoin(net)
        .then((deploy: any) => {
          let new_ssi = deploy[1].address;
          new_ssi = zcrypto.toChecksumAddress(new_ssi);
          updateNewContract(new_ssi);
        })
        .catch((error) => {
          toast.error(String(error), {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "dark",
          });
        });
    } else {
      toast.warning("Connect your ZilPay wallet.", {
        position: "top-center",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
    }
  };

  const handleDeployStableImpl = async () => {
    if (zil_address !== null && net !== null) {
      const zilpay = new ZilPayBase();
      await zilpay
        .deployStableImpl(net, zil_address.base16)
        .then((deploy: any) => {
          let new_ssi = deploy[1].address;
          new_ssi = zcrypto.toChecksumAddress(new_ssi);
          updateNewContract(new_ssi);
        })
        .catch((error) => {
          toast.error(String(error), {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "dark",
          });
        });
    } else {
      toast.warning("Connect your ZilPay wallet.", {
        position: "top-center",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
    }
  };

  const handleDeploySsiDapp = async () => {
    if (zil_address !== null && net !== null) {
      const zilpay = new ZilPayBase();
      await zilpay
        .deploySsiDns(net, zil_address.base16)//.deploySsiDapp(net, zil_address.base16)
        .then((deploy: any) => {
          let new_ssi = deploy[1].address;
          new_ssi = zcrypto.toChecksumAddress(new_ssi);
          updateNewContract(new_ssi);
        })
        .catch((error) => {
          toast.error(String(error), {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "dark",
          });
        });
    } else {
      toast.warning("Connect your ZilPay wallet.", {
        position: "top-center",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
    }
  };

  return (
    <>
      {new_ssi === null ? (
        <div style={{ textAlign: "center", marginTop: "5%" }}>
          <h3>deploy a brand new</h3>
          <h2 style={{ color: "silver" }}>self-sovereign identity</h2>
          <button className="button" onClick={handleDeploy}>
            <span style={{ color: "yellow" }}>new ssi</span>
            <span className="label">&#9889;</span>
          </button>
          <h5 style={{ marginTop: "3%", color: "lightgrey" }}>around 1 ZIL</h5>
        </div>
      ) : (
        <div style={{ textAlign: "center" }}>
          <p>
            Save the new address:{" "}
            <a
              style={{ color: "#ffff32" }}
              href={`https://viewblock.io/zilliqa/address/${new_ssi}?network=${net}`}
              rel="noreferrer"
              target="_blank"
            >
              {zcrypto.toBech32Address(new_ssi)}
            </a>
          </p>
          <div style={{ marginTop: "10%" }}>
            <button className="button" onClick={handleDeploy}>
              <span style={{ color: "yellow" }}>new ssi</span>
              <span className="label">&#9889;</span>
            </button>
            <h5 style={{ marginTop: "3%", color: "lightgrey" }}>
              around 1 ZIL
            </h5>
          </div>
        </div>
      )}
      {new_ssi === null ? (
        <div style={{ textAlign: "center", marginTop: "5%" }}>
          <button className="button" onClick={handleDeployAirdrop}>
            <span style={{ color: "yellow" }}>new wallet</span>
          </button>
          <h5 style={{ marginTop: "3%", color: "lightgrey" }}>around 1 ZIL</h5>
        </div>
      ) : (
        <div style={{ textAlign: "center" }}>
          <p>
            Save the new address:{" "}
            <a
              style={{ color: "#ffff32" }}
              href={`https://viewblock.io/zilliqa/address/${new_ssi}?network=${net}`}
              rel="noreferrer"
              target="_blank"
            >
              {zcrypto.toBech32Address(new_ssi)}
            </a>
          </p>
          <div style={{ marginTop: "10%" }}>
            <button className="button" onClick={handleDeployAirdrop}>
              <span style={{ color: "yellow" }}>new wallet</span>
              <span className="label">&#9889;</span>
            </button>
            <h5 style={{ marginTop: "3%", color: "lightgrey" }}>
              around 1 ZIL
            </h5>
          </div>
        </div>
      )}
      <button className="button" onClick={handleDeployDApp}>
        <span style={{ color: "yellow" }}>deploy dapp</span>
        <span className="label">&#9889;</span>
      </button>
      <button className="button" onClick={handleDeployImpl}>
        <span style={{ color: "yellow" }}>deploy implementation</span>
        <span className="label">&#9889;</span>
      </button>
      <button className="button" onClick={handleDeployDollar}>
        <span style={{ color: "yellow" }}>deploy dollar</span>
      </button>
      <button className="button" onClick={handleDeploySGDollar}>
        <span style={{ color: "yellow" }}>deploy SGD</span>
      </button>
      <button className="button" onClick={handleDeployTyron}>
        <span style={{ color: "yellow" }}>deploy tyron</span>
      </button>
      <button className="button" onClick={handleDeployTransmuter}>
        <span style={{ color: "yellow" }}>deploy transmuter</span>
      </button>
      <button className="button" onClick={handleDeployCommunity}>
        <span style={{ color: "yellow" }}>deploy community</span>
      </button>

      {/* <button className="button" onClick={handleDeployStablecoin}>
        <span style={{ color: "yellow" }}>deploy proxy</span>
        <span className="label">&#9889;</span>
      </button>
      <button className="button" onClick={handleDeployStableImpl}>
        <span style={{ color: "yellow" }}>deploy implementation</span>
        <span className="label">&#9889;</span>
      </button> */}
      <button className="button" onClick={handleDeploySsiDapp}>
        <span style={{ color: "yellow" }}>deploy ssi dapp</span>
        <span className="label">&#9889;</span>
      </button>
    </>
  );
}

export default Component;
