import { useStore } from "effector-react";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import * as tyron from "tyron";
import { RootState } from "../../../../../src/app/reducers";
import { $contract } from "../../../../../src/store/contract";
import {
  updateModalAddFunds,
  updateSelectedCurrency,
  updateModalWithdrawal,
} from "../../../../../src/store/modal";
import { $net } from "../../../../../src/store/wallet-network";
import { $loadingDoc, updateLoadingDoc } from "../../../../../src/store/loading";
import { fetchAddr } from "../../../../SearchBar/utils";
import styles from "./styles.module.scss";

function Component() {
  const net = useStore($net);
  const contract = useStore($contract);
  const loadingDoc = useStore($loadingDoc);
  const loginInfo = useSelector((state: RootState) => state.modal);
  const [tyronBal, settyronBal] = useState([0, 0]);
  const [$siBal, set$siBal] = useState([0, 0]);
  const [zilBal, setzilBal] = useState([0, 0]);
  const [gzilBal, setgzilBal] = useState([0, 0]);
  const [zusdtBal, setzusdtBal] = useState([0, 0]);
  const [xsgdBal, setxsgdBal] = useState([0, 0]);
  const [pilBal, setPilBal] = useState([0, 0]);
  const [xidrBal, setxidrBal] = useState([0, 0]);
  const [zwbtcBal, setzwbtcBal] = useState([0, 0]);
  const [zethBal, setzethBal] = useState([0, 0]);
  const [xcadBal, setxcadBal] = useState([0, 0]);
  const [lunrBal, setlunrBal] = useState([0, 0]);
  const [zwapBal, setzwapBal] = useState([0, 0]);
  const [swthBal, setswthBal] = useState([0, 0]);
  const [portBal, setportBal] = useState([0, 0]);
  const [scoBal, setscoBal] = useState([0, 0]);
  const [feesBal, setfeesBal] = useState([0, 0]);
  const [carbBal, setcarbBal] = useState([0, 0]);
  const [bloxBal, setbloxBal] = useState([0, 0]);
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
      token_addr = services.get(id);
      const balances = await init.API.blockchain.getSmartContractSubState(
        token_addr,
        "balances"
      );
      const balances_ = await tyron.SmartUtil.default.intoMap(
        balances.result.balances
      );

      let res = [0, 0]; //@todo-i-checked only two decimals per balance value
      try {
        const balance_didxwallet = balances_.get(contract!.addr.toLowerCase());
        if (balance_didxwallet !== undefined) {
          const _currency = tyron.Currency.default.tyron(id);
          const finalBalance = balance_didxwallet / _currency.decimals;
          res[0] = Number(finalBalance.toFixed(2));
        }
      } catch (error) {
        res[0] = 0;
      }
      try {
        const balance_zilpay = balances_.get(
          loginInfo.zilAddr.base16.toLowerCase()
        );
        if (balance_zilpay !== undefined) {
          const _currency = tyron.Currency.default.tyron(id);
          const finalBalance = balance_zilpay / _currency.decimals;
          res[1] = Number(finalBalance.toFixed(2));
        }
      } catch (error) {
        res[1] = 0;
      }
      return res;
    } catch (error) {
      let res = [0, 0];
      return res;
    }
  };

  const fetchAllBalance = async () => {
    updateLoadingDoc(true);
    const currency = [
      "TYRON",
      "$SI",
      //"ZIL",
      "gZIL",
      "zUSDT",
      "XSGD",
      "PIL",
      // "XIDR",
      // "zWBTC",
      // "zETH",
      // "XCAD",
      // "Lunr",
      // "ZWAP",
      // "SWTH",
      // "PORT",
      // "SCO",
      // "FEES",
      // "CARB",
      // "BLOX",
    ];
    for (let i = 0; i < currency.length; i += 1) {
      const coin = currency[i].toLowerCase();
      const bal = await fetchBalance(coin);
      switch (coin) {
        case "tyron":
          settyronBal(bal);
        case "$si":
          set$siBal(bal);
        case "zil":
          setzilBal(bal);
        case "gzil":
          setgzilBal(bal);
        case "zusdt":
          setzusdtBal(bal);
        case "xsgd":
          setxsgdBal(bal);
        case "pil":
          setPilBal(bal);
        case "xidr":
          setxidrBal(bal);
        case "zwbtc":
          setzwbtcBal(bal);
        case "zeth":
          setzethBal(bal);
        case "xcad":
          setxcadBal(bal);
        case "lunr":
          setlunrBal(bal);
        case "zwap":
          setzwapBal(bal);
        case "swth":
          setswthBal(bal);
        case "port":
          setportBal(bal);
        case "sco":
          setscoBal(bal);
        case "fees":
          setfeesBal(bal);
        case "carb":
          setcarbBal(bal);
        case "blox":
          setbloxBal(bal);
      }
    }
    updateLoadingDoc(false);
  };

  const addFunds = (currency: string) => {
    updateSelectedCurrency(currency);
    updateModalAddFunds(true);
  };

  const withdrawFunds = (currency: string) => {
    updateSelectedCurrency(currency);
    updateModalWithdrawal(true);
  };

  useEffect(() => {
    fetchAllBalance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={styles.wrapper}>
      {loadingDoc ? (
        <div style={{ marginTop: "50%" }}>
          <i className="fa fa-lg fa-spin fa-circle-notch" aria-hidden="true"></i>
        </div>
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
                <td className={styles.txtList}>{tyronBal[0]}</td>
                <td className={styles.txtList}>{tyronBal[1]}</td>
                <td className={styles.buttonWrapper}>
                  <button
                    onClick={() => addFunds("TYRON")}
                    className={styles.buttonActionFunds}
                  >
                    <h6 className={styles.txtList}>Add Funds</h6>
                  </button>
                  <button
                    onClick={() => withdrawFunds("TYRON")}
                    className={styles.buttonActionWithdraw}
                  >
                    <h6 className={styles.txtList}>Withdraw</h6>
                  </button>
                </td>
              </tr>
              <tr className={styles.row}>
                <td className={styles.txtList}>$SI</td>
                <td className={styles.txtList}>{$siBal[0]}</td>
                <td className={styles.txtList}>{$siBal[1]}</td>
                <td className={styles.buttonWrapper}>
                  <button
                    onClick={() => addFunds("$SI")}
                    className={styles.buttonActionFunds}
                  >
                    <h6 className={styles.txtList}>Add Funds</h6>
                  </button>
                  <button
                    onClick={() => withdrawFunds("$SI")}
                    className={styles.buttonActionWithdraw}
                  >
                    <h6 className={styles.txtList}>Withdraw</h6>
                  </button>
                </td>
              </tr>
              {/* <tr className={styles.row}>
                <td className={styles.txtList}>ZIL</td>
                <td className={styles.txtList}>{zilBal}</td>
                <td>-</td>
                <td className={styles.buttonWrapper}>
                  <button
                    onClick={() => addFunds("ZIL")}
                    className={styles.buttonActionFunds}
                  >
                    <h6 className={styles.txtList}>Add Funds</h6>
                  </button>
                  <button
                    onClick={() => withdrawFunds("ZIL")}
                    className={styles.buttonActionWithdraw}
                  >
                    <h6 className={styles.txtList}>Withdraw</h6>
                  </button>
                </td>
              </tr> */}
              <tr className={styles.row}>
                <td className={styles.txtList}>gZIL</td>
                <td className={styles.txtList}>{gzilBal[0]}</td>
                <td className={styles.txtList}>{gzilBal[1]}</td>
                <td className={styles.buttonWrapper}>
                  <button
                    onClick={() => addFunds("gZIL")}
                    className={styles.buttonActionFunds}
                  >
                    <h6 className={styles.txtList}>Add Funds</h6>
                  </button>
                  <button
                    onClick={() => withdrawFunds("gZIL")}
                    className={styles.buttonActionWithdraw}
                  >
                    <h6 className={styles.txtList}>Withdraw</h6>
                  </button>
                </td>
              </tr>
              <tr className={styles.row}>
                <td className={styles.txtList}>zUSDT</td>
                <td className={styles.txtList}>{zusdtBal[0]}</td>
                <td className={styles.txtList}>{zusdtBal[1]}</td>
                <td className={styles.buttonWrapper}>
                  <button
                    onClick={() => addFunds("zUSDT")}
                    className={styles.buttonActionFunds}
                  >
                    <h6 className={styles.txtList}>Add Funds</h6>
                  </button>
                  <button
                    onClick={() => withdrawFunds("zUSDT")}
                    className={styles.buttonActionWithdraw}
                  >
                    <h6 className={styles.txtList}>Withdraw</h6>
                  </button>
                </td>
              </tr>
              <tr className={styles.row}>
                <td className={styles.txtList}>XSGD</td>
                <td className={styles.txtList}>{xsgdBal[0]}</td>
                <td className={styles.txtList}>{xsgdBal[1]}</td>
                <td className={styles.buttonWrapper}>
                  <button
                    onClick={() => addFunds("XSGD")}
                    className={styles.buttonActionFunds}
                  >
                    <h6 className={styles.txtList}>Add Funds</h6>
                  </button>
                  <button
                    onClick={() => withdrawFunds("XSGD")}
                    className={styles.buttonActionWithdraw}
                  >
                    <h6 className={styles.txtList}>Withdraw</h6>
                  </button>
                </td>
              </tr>
              <tr className={styles.row}>
                <td className={styles.txtList}>PIL</td>
                <td className={styles.txtList}>{pilBal[0]}</td>
                <td className={styles.txtList}>{pilBal[1]}</td>
                <td className={styles.buttonWrapper}>
                  <button
                    onClick={() => addFunds("PIL")}
                    className={styles.buttonActionFunds}
                  >
                    <h6 className={styles.txtList}>Add Funds</h6>
                  </button>
                  <button
                    onClick={() => withdrawFunds("PIL")}
                    className={styles.buttonActionWithdraw}
                  >
                    <h6 className={styles.txtList}>Withdraw</h6>
                  </button>
                </td>
              </tr>
              {/* <tr className={styles.row}>
                <td className={styles.txtList}>XIDR</td>
                <td className={styles.txtList}>{xidrBal}</td>
                <td>-</td>
                <td className={styles.buttonWrapper}>
                  <button
                    onClick={() => addFunds("XIDR")}
                    className={styles.buttonActionFunds}
                  >
                    <h6 className={styles.txtList}>Add Funds</h6>
                  </button>
                  <button
                    onClick={() => withdrawFunds("XIDR")}
                    className={styles.buttonActionWithdraw}
                  >
                    <h6 className={styles.txtList}>Withdraw</h6>
                  </button>
                </td>
              </tr>
              <tr className={styles.row}>
                <td className={styles.txtList}>zWBTC</td>
                <td className={styles.txtList}>{zwbtcBal}</td>
                <td>-</td>
                <td className={styles.buttonWrapper}>
                  <button
                    onClick={() => addFunds("zWBTC")}
                    className={styles.buttonActionFunds}
                  >
                    <h6 className={styles.txtList}>Add Funds</h6>
                  </button>
                  <button
                    onClick={() => withdrawFunds("zWBTC")}
                    className={styles.buttonActionWithdraw}
                  >
                    <h6 className={styles.txtList}>Withdraw</h6>
                  </button>
                </td>
              </tr>
              <tr className={styles.row}>
                <td className={styles.txtList}>zETH</td>
                <td className={styles.txtList}>{zethBal}</td>
                <td>-</td>
                <td className={styles.buttonWrapper}>
                  <button
                    onClick={() => addFunds("zETH")}
                    className={styles.buttonActionFunds}
                  >
                    <h6 className={styles.txtList}>Add Funds</h6>
                  </button>
                  <button
                    onClick={() => withdrawFunds("zETH")}
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
                    onClick={() => addFunds("XCAD")}
                    className={styles.buttonActionFunds}
                  >
                    <h6 className={styles.txtList}>Add Funds</h6>
                  </button>
                  <button
                    onClick={() => withdrawFunds("XCAD")}
                    className={styles.buttonActionWithdraw}
                  >
                    <h6 className={styles.txtList}>Withdraw</h6>
                  </button>
                </td>
              </tr>
              <tr className={styles.row}>
                <td className={styles.txtList}>Lunr</td>
                <td className={styles.txtList}>{lunrBal}</td>
                <td>-</td>
                <td className={styles.buttonWrapper}>
                  <button
                    onClick={() => addFunds("Lunr")}
                    className={styles.buttonActionFunds}
                  >
                    <h6 className={styles.txtList}>Add Funds</h6>
                  </button>
                  <button
                    onClick={() => withdrawFunds("Lunr")}
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
                    onClick={() => addFunds("ZWAP")}
                    className={styles.buttonActionFunds}
                  >
                    <h6 className={styles.txtList}>Add Funds</h6>
                  </button>
                  <button
                    onClick={() => withdrawFunds("ZWAP")}
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
                    onClick={() => addFunds("SWTH")}
                    className={styles.buttonActionFunds}
                  >
                    <h6 className={styles.txtList}>Add Funds</h6>
                  </button>
                  <button
                    onClick={() => withdrawFunds("SWTH")}
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
                    onClick={() => addFunds("PORT")}
                    className={styles.buttonActionFunds}
                  >
                    <h6 className={styles.txtList}>Add Funds</h6>
                  </button>
                  <button
                    onClick={() => withdrawFunds("PORT")}
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
                    onClick={() => addFunds("SCO")}
                    className={styles.buttonActionFunds}
                  >
                    <h6 className={styles.txtList}>Add Funds</h6>
                  </button>
                  <button
                    onClick={() => withdrawFunds("SCO")}
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
                    onClick={() => addFunds("FEES")}
                    className={styles.buttonActionFunds}
                  >
                    <h6 className={styles.txtList}>Add Funds</h6>
                  </button>
                  <button
                    onClick={() => withdrawFunds("FEES")}
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
                    onClick={() => addFunds("CARB")}
                    className={styles.buttonActionFunds}
                  >
                    <h6 className={styles.txtList}>Add Funds</h6>
                  </button>
                  <button
                    onClick={() => withdrawFunds("CARB")}
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
                    onClick={() => addFunds("BLOX")}
                    className={styles.buttonActionFunds}
                  >
                    <h6 className={styles.txtList}>Add Funds</h6>
                  </button>
                  <button
                    onClick={() => withdrawFunds("BLOX")}
                    className={styles.buttonActionWithdraw}
                  >
                    <h6 className={styles.txtList}>Withdraw</h6>
                  </button>
                </td>
              </tr> */}
            </tbody>
          </table>
          {/* <div className={styles.addCurrencyWrapper}>
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
          </div> */}
        </>
      )}
    </div>
  );
}

export default Component;
