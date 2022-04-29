import { useStore } from "effector-react";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import * as tyron from "tyron";
import { RootState } from "../../../../../src/app/reducers";
import {
  updateModalAddFunds,
  updateSelectedCurrency,
  updateModalWithdrawal,
} from "../../../../../src/store/modal";
import { $net } from "../../../../../src/store/wallet-network";
import { fetchAddr } from "../../../../SearchBar/utils";
import styles from "./styles.module.scss";

function Component() {
  const net = useStore($net);
  const loginInfo = useSelector((state: RootState) => state.modal);
  const [tyronBal, settyronBal] = useState(0);
  const [$siBal, set$siBal] = useState(0);
  const [zilBal, setzilBal] = useState(0);
  const [gzilBal, setgzilBal] = useState(0);
  const [zusdtBal, setzusdtBal] = useState(0);
  const [xsgdBal, setxsgdBal] = useState(0);
  const [xidrBal, setxidrBal] = useState(0);
  const [zwbtcBal, setzwbtcBal] = useState(0);
  const [zethBal, setzethBal] = useState(0);
  const [xcadBal, setxcadBal] = useState(0);
  const [lunrBal, setlunrBal] = useState(0);
  const [zwapBal, setzwapBal] = useState(0);
  const [swthBal, setswthBal] = useState(0);
  const [portBal, setportBal] = useState(0);
  const [scoBal, setscoBal] = useState(0);
  const [feesBal, setfeesBal] = useState(0);
  const [carbBal, setcarbBal] = useState(0);
  const [bloxBal, setbloxBal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [addCurrency, setAddCurrency] = useState(false);

  const fetchBalance = async (id: string) => {
    let token_addr: string;
    let network = tyron.DidScheme.NetworkNamespace.Mainnet;
    if (net === "testnet") {
      network = tyron.DidScheme.NetworkNamespace.Testnet;
    }
    const init = new tyron.ZilliqaInit.default(network);
    const init_addr = await fetchAddr({
      net,
      _username: "init",
      _domain: "did",
    });
    const get_services = await init.API.blockchain.getSmartContractSubState(
      init_addr,
      "services"
    );
    const services = await tyron.SmartUtil.default.intoMap(
      get_services.result.services
    );
    try {
      token_addr = services.get(id.toLowerCase());
      const balances = await init.API.blockchain.getSmartContractSubState(
        token_addr,
        "balances"
      );
      const balances_ = await tyron.SmartUtil.default.intoMap(
        balances.result.balances
      );

      let res: any;
      try {
        const balance = balances_.get(loginInfo.address.toLowerCase());
        if (balance !== undefined) {
          const _currency = tyron.Currency.default.tyron(id.toLowerCase());
          res = balance / _currency.decimals;
        }
      } catch (error) {
        res = 0;
      }
      return res;
    } catch (error) {
      let res = 0;
      return res;
    }
  };

  const fetchAllBalance = async () => {
    setLoading(true);
    const currency = [
      "TYRON",
      "$SI",
      "ZIL",
      "GZIL",
      "zUSDT",
      "XSGD",
      "XIDR",
      "ZWBTC",
      "ZETH",
      "XCAD",
      "LUNR",
      "ZWAP",
      "SWTH",
      "PORT",
      "SCO",
      "FEES",
      "CARB",
      "BLOX",
    ];
    for (let i = 0; i < currency.length; i += 1) {
      fetchBalance(currency[i]).then((res) => {
        switch (currency[i]) {
          case "TYRON":
            settyronBal(res);
          case "$SI":
            set$siBal(res);
          case "ZIL":
            setzilBal(res);
          case "GZIL":
            setgzilBal(res);
          case "zUSDT":
            setzusdtBal(res);
          case "XSGD":
            setxsgdBal(res);
          case "XIDR":
            setxidrBal(res);
          case "ZWBTC":
            setzwbtcBal(res);
          case "ZETH":
            setzethBal(res);
          case "XCAD":
            setxcadBal(res);
          case "LUNR":
            setlunrBal(res);
          case "ZWAP":
            setzwapBal(res);
          case "SWTH":
            setswthBal(res);
          case "PORT":
            setportBal(res);
          case "SCO":
            setscoBal(res);
          case "FEES":
            setfeesBal(res);
          case "CARB":
            setcarbBal(res);
          case "BLOX":
            setbloxBal(res);
        }
        if (i === currency.length) {
          setLoading(false);
        }
      });
    }
  };

  const addFunds = (currency) => {
    updateSelectedCurrency(currency);
    updateModalAddFunds(true);
  };

  const withdrawFunds = (currency) => {
    updateSelectedCurrency(currency);
    updateModalWithdrawal(true);
  };

  useEffect(() => {
    fetchAllBalance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={styles.wrapper}>
      {loading ? (
        <i className="fa fa-lg fa-spin fa-circle-notch" aria-hidden="true"></i>
      ) : (
        <>
          <table>
            <thead>
              <tr className={styles.header}>
                <td className={styles.txtList}>CURRENCY</td>
                <td className={styles.txtList}>DIDxWallet BALANCE</td>
                <td className={styles.txtList}>ZilPay BALANCE</td>
                <td></td>
              </tr>
            </thead>
            <tbody>
              <tr className={styles.row}>
                <td className={styles.txtList}>TYRON</td>
                <td className={styles.txtList}>{tyronBal}</td>
                <td>-</td>
                <td className={styles.buttonWrapper}>
                  <button
                    onClick={() => addFunds("tyron")}
                    className={styles.buttonActionFunds}
                  >
                    <h6 className={styles.txtList}>Add Funds</h6>
                  </button>
                  <button
                    onClick={() => withdrawFunds("tyron")}
                    className={styles.buttonActionWithdraw}
                  >
                    <h6 className={styles.txtList}>Withdraw</h6>
                  </button>
                </td>
              </tr>
              <tr className={styles.row}>
                <td className={styles.txtList}>$SI</td>
                <td className={styles.txtList}>{$siBal}</td>
                <td>-</td>
                <td className={styles.buttonWrapper}>
                  <button
                    onClick={() => addFunds("$si")}
                    className={styles.buttonActionFunds}
                  >
                    <h6 className={styles.txtList}>Add Funds</h6>
                  </button>
                  <button
                    onClick={() => withdrawFunds("$si")}
                    className={styles.buttonActionWithdraw}
                  >
                    <h6 className={styles.txtList}>Withdraw</h6>
                  </button>
                </td>
              </tr>
              <tr className={styles.row}>
                <td className={styles.txtList}>ZIL</td>
                <td className={styles.txtList}>{zilBal}</td>
                <td>-</td>
                <td className={styles.buttonWrapper}>
                  <button
                    onClick={() => addFunds("zil")}
                    className={styles.buttonActionFunds}
                  >
                    <h6 className={styles.txtList}>Add Funds</h6>
                  </button>
                  <button
                    onClick={() => withdrawFunds("zil")}
                    className={styles.buttonActionWithdraw}
                  >
                    <h6 className={styles.txtList}>Withdraw</h6>
                  </button>
                </td>
              </tr>
              <tr className={styles.row}>
                <td className={styles.txtList}>GZIL</td>
                <td className={styles.txtList}>{gzilBal}</td>
                <td>-</td>
                <td className={styles.buttonWrapper}>
                  <button
                    onClick={() => addFunds("gzil")}
                    className={styles.buttonActionFunds}
                  >
                    <h6 className={styles.txtList}>Add Funds</h6>
                  </button>
                  <button
                    onClick={() => withdrawFunds("gzil")}
                    className={styles.buttonActionWithdraw}
                  >
                    <h6 className={styles.txtList}>Withdraw</h6>
                  </button>
                </td>
              </tr>
              <tr className={styles.row}>
                <td className={styles.txtList}>zUSDT</td>
                <td className={styles.txtList}>{zusdtBal}</td>
                <td>-</td>
                <td className={styles.buttonWrapper}>
                  <button
                    onClick={() => addFunds("zusdt")}
                    className={styles.buttonActionFunds}
                  >
                    <h6 className={styles.txtList}>Add Funds</h6>
                  </button>
                  <button
                    onClick={() => withdrawFunds("zusdt")}
                    className={styles.buttonActionWithdraw}
                  >
                    <h6 className={styles.txtList}>Withdraw</h6>
                  </button>
                </td>
              </tr>
              <tr className={styles.row}>
                <td className={styles.txtList}>XSGD</td>
                <td className={styles.txtList}>{xsgdBal}</td>
                <td>-</td>
                <td className={styles.buttonWrapper}>
                  <button
                    onClick={() => addFunds("xsgd")}
                    className={styles.buttonActionFunds}
                  >
                    <h6 className={styles.txtList}>Add Funds</h6>
                  </button>
                  <button
                    onClick={() => withdrawFunds("xsgd")}
                    className={styles.buttonActionWithdraw}
                  >
                    <h6 className={styles.txtList}>Withdraw</h6>
                  </button>
                </td>
              </tr>
              <tr className={styles.row}>
                <td className={styles.txtList}>XIDR</td>
                <td className={styles.txtList}>{xidrBal}</td>
                <td>-</td>
                <td className={styles.buttonWrapper}>
                  <button
                    onClick={() => addFunds("xidr")}
                    className={styles.buttonActionFunds}
                  >
                    <h6 className={styles.txtList}>Add Funds</h6>
                  </button>
                  <button
                    onClick={() => withdrawFunds("xidr")}
                    className={styles.buttonActionWithdraw}
                  >
                    <h6 className={styles.txtList}>Withdraw</h6>
                  </button>
                </td>
              </tr>
              <tr className={styles.row}>
                <td className={styles.txtList}>ZWBTC</td>
                <td className={styles.txtList}>{zwbtcBal}</td>
                <td>-</td>
                <td className={styles.buttonWrapper}>
                  <button
                    onClick={() => addFunds("zwbtc")}
                    className={styles.buttonActionFunds}
                  >
                    <h6 className={styles.txtList}>Add Funds</h6>
                  </button>
                  <button
                    onClick={() => withdrawFunds("zwbtc")}
                    className={styles.buttonActionWithdraw}
                  >
                    <h6 className={styles.txtList}>Withdraw</h6>
                  </button>
                </td>
              </tr>
              <tr className={styles.row}>
                <td className={styles.txtList}>ZETH</td>
                <td className={styles.txtList}>{zethBal}</td>
                <td>-</td>
                <td className={styles.buttonWrapper}>
                  <button
                    onClick={() => addFunds("zeth")}
                    className={styles.buttonActionFunds}
                  >
                    <h6 className={styles.txtList}>Add Funds</h6>
                  </button>
                  <button
                    onClick={() => withdrawFunds("zeth")}
                    className={styles.buttonActionWithdraw}
                  >
                    <h6 className={styles.txtList}>Withdraw</h6>
                  </button>
                </td>
              </tr>
              <tr className={styles.row}>
                <td className={styles.txtList}>XCAD</td>
                <td className={styles.txtList}>{xcadBal}</td>
                <td>-</td>
                <td className={styles.buttonWrapper}>
                  <button
                    onClick={() => addFunds("xcad")}
                    className={styles.buttonActionFunds}
                  >
                    <h6 className={styles.txtList}>Add Funds</h6>
                  </button>
                  <button
                    onClick={() => withdrawFunds("xcad")}
                    className={styles.buttonActionWithdraw}
                  >
                    <h6 className={styles.txtList}>Withdraw</h6>
                  </button>
                </td>
              </tr>
              <tr className={styles.row}>
                <td className={styles.txtList}>LUNR</td>
                <td className={styles.txtList}>{lunrBal}</td>
                <td>-</td>
                <td className={styles.buttonWrapper}>
                  <button
                    onClick={() => addFunds("lunr")}
                    className={styles.buttonActionFunds}
                  >
                    <h6 className={styles.txtList}>Add Funds</h6>
                  </button>
                  <button
                    onClick={() => withdrawFunds("lunr")}
                    className={styles.buttonActionWithdraw}
                  >
                    <h6 className={styles.txtList}>Withdraw</h6>
                  </button>
                </td>
              </tr>
              <tr className={styles.row}>
                <td className={styles.txtList}>ZWAP</td>
                <td className={styles.txtList}>{zwapBal}</td>
                <td>-</td>
                <td className={styles.buttonWrapper}>
                  <button
                    onClick={() => addFunds("zwap")}
                    className={styles.buttonActionFunds}
                  >
                    <h6 className={styles.txtList}>Add Funds</h6>
                  </button>
                  <button
                    onClick={() => withdrawFunds("zwap")}
                    className={styles.buttonActionWithdraw}
                  >
                    <h6 className={styles.txtList}>Withdraw</h6>
                  </button>
                </td>
              </tr>
              <tr className={styles.row}>
                <td className={styles.txtList}>SWTH</td>
                <td className={styles.txtList}>{swthBal}</td>
                <td>-</td>
                <td className={styles.buttonWrapper}>
                  <button
                    onClick={() => addFunds("swth")}
                    className={styles.buttonActionFunds}
                  >
                    <h6 className={styles.txtList}>Add Funds</h6>
                  </button>
                  <button
                    onClick={() => withdrawFunds("swth")}
                    className={styles.buttonActionWithdraw}
                  >
                    <h6 className={styles.txtList}>Withdraw</h6>
                  </button>
                </td>
              </tr>
              <tr className={styles.row}>
                <td className={styles.txtList}>PORT</td>
                <td className={styles.txtList}>{portBal}</td>
                <td>-</td>
                <td className={styles.buttonWrapper}>
                  <button
                    onClick={() => addFunds("port")}
                    className={styles.buttonActionFunds}
                  >
                    <h6 className={styles.txtList}>Add Funds</h6>
                  </button>
                  <button
                    onClick={() => withdrawFunds("port")}
                    className={styles.buttonActionWithdraw}
                  >
                    <h6 className={styles.txtList}>Withdraw</h6>
                  </button>
                </td>
              </tr>
              <tr className={styles.row}>
                <td className={styles.txtList}>SCO</td>
                <td className={styles.txtList}>{scoBal}</td>
                <td>-</td>
                <td className={styles.buttonWrapper}>
                  <button
                    onClick={() => addFunds("sco")}
                    className={styles.buttonActionFunds}
                  >
                    <h6 className={styles.txtList}>Add Funds</h6>
                  </button>
                  <button
                    onClick={() => withdrawFunds("sco")}
                    className={styles.buttonActionWithdraw}
                  >
                    <h6 className={styles.txtList}>Withdraw</h6>
                  </button>
                </td>
              </tr>
              <tr className={styles.row}>
                <td className={styles.txtList}>FEES</td>
                <td className={styles.txtList}>{feesBal}</td>
                <td>-</td>
                <td className={styles.buttonWrapper}>
                  <button
                    onClick={() => addFunds("fees")}
                    className={styles.buttonActionFunds}
                  >
                    <h6 className={styles.txtList}>Add Funds</h6>
                  </button>
                  <button
                    onClick={() => withdrawFunds("fees")}
                    className={styles.buttonActionWithdraw}
                  >
                    <h6 className={styles.txtList}>Withdraw</h6>
                  </button>
                </td>
              </tr>
              <tr className={styles.row}>
                <td className={styles.txtList}>CARB</td>
                <td className={styles.txtList}>{carbBal}</td>
                <td>-</td>
                <td className={styles.buttonWrapper}>
                  <button
                    onClick={() => addFunds("carb")}
                    className={styles.buttonActionFunds}
                  >
                    <h6 className={styles.txtList}>Add Funds</h6>
                  </button>
                  <button
                    onClick={() => withdrawFunds("carb")}
                    className={styles.buttonActionWithdraw}
                  >
                    <h6 className={styles.txtList}>Withdraw</h6>
                  </button>
                </td>
              </tr>
              <tr className={styles.row}>
                <td className={styles.txtList}>BLOX</td>
                <td className={styles.txtList}>{bloxBal}</td>
                <td>-</td>
                <td className={styles.buttonWrapper}>
                  <button
                    onClick={() => addFunds("blox")}
                    className={styles.buttonActionFunds}
                  >
                    <h6 className={styles.txtList}>Add Funds</h6>
                  </button>
                  <button
                    onClick={() => withdrawFunds("blox")}
                    className={styles.buttonActionWithdraw}
                  >
                    <h6 className={styles.txtList}>Withdraw</h6>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
          <div className={styles.addCurrencyWrapper}>
            <div>
              <button
                onClick={() => setAddCurrency(!addCurrency)}
                className="button"
              >
                {addCurrency ? "Cancel" : "+ Add Currency"}
              </button>
            </div>
            {addCurrency && (
              <div className={styles.addCurrencyWrapper}>
                <input
                  placeholder="Token Contract Address"
                  name="address"
                  className={styles.inputCurrency}
                  type="text"
                  // onChange={handleInput}
                  // onKeyPress={handleOnKeyPress}
                  autoFocus
                />
                <input
                  placeholder="Token Symbol"
                  name="symbol"
                  className={styles.inputCurrency}
                  type="text"
                  // onChange={handleInput}
                  // onKeyPress={handleOnKeyPress}
                  autoFocus
                />
                <input
                  placeholder="Token Decimals"
                  name="decimals"
                  className={styles.inputCurrency}
                  type="text"
                  // onChange={handleInput}
                  // onKeyPress={handleOnKeyPress}
                  autoFocus
                />
                <button
                  onClick={() => {
                    toast.info("Coming soon!", {
                      position: "top-center",
                      autoClose: 2000,
                      hideProgressBar: false,
                      closeOnClick: true,
                      pauseOnHover: true,
                      draggable: true,
                      progress: undefined,
                      theme: "dark",
                      toastId: 4,
                    });
                    setAddCurrency(false);
                  }}
                  className="button primary"
                >
                  Add
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default Component;
