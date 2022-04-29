import { useStore } from "effector-react";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import * as tyron from "tyron";
import { RootState } from "../../../../../src/app/reducers";
import {
  updateModalAddFunds,
  updateSelectedCurrency,
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

  useEffect(() => {
    fetchAllBalance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={styles.wrapper}>
      {loading ? (
        <i className="fa fa-lg fa-spin fa-circle-notch" aria-hidden="true"></i>
      ) : (
        <table>
          <thead>
            <tr className={styles.header}>
              <td>CURRENCY</td>
              <td>BALANCE</td>
              <td></td>
            </tr>
          </thead>
          <tbody>
            <tr className={styles.row}>
              <td>TYRON</td>
              <td>{tyronBal}</td>
              <td>
                <button onClick={() => addFunds("tyron")} className="button">
                  Add Funds
                </button>
              </td>
            </tr>
            <tr className={styles.row}>
              <td>$SI</td>
              <td>{$siBal}</td>
              <td>
                <button onClick={() => addFunds("$si")} className="button">
                  Add Funds
                </button>
              </td>
            </tr>
            <tr className={styles.row}>
              <td>ZIL</td>
              <td>{zilBal}</td>
              <td>
                <button onClick={() => addFunds("zil")} className="button">
                  Add Funds
                </button>
              </td>
            </tr>
            <tr className={styles.row}>
              <td>GZIL</td>
              <td>{gzilBal}</td>
              <td>
                <button onClick={() => addFunds("gzil")} className="button">
                  Add Funds
                </button>
              </td>
            </tr>
            <tr className={styles.row}>
              <td>zUSDT</td>
              <td>{zusdtBal}</td>
              <td>
                <button onClick={() => addFunds("zusdt")} className="button">
                  Add Funds
                </button>
              </td>
            </tr>
            <tr className={styles.row}>
              <td>XSGD</td>
              <td>{xsgdBal}</td>
              <td>
                <button onClick={() => addFunds("xsgd")} className="button">
                  Add Funds
                </button>
              </td>
            </tr>
            <tr className={styles.row}>
              <td>XIDR</td>
              <td>{xidrBal}</td>
              <td>
                <button onClick={() => addFunds("xidr")} className="button">
                  Add Funds
                </button>
              </td>
            </tr>
            <tr className={styles.row}>
              <td>ZWBTC</td>
              <td>{zwbtcBal}</td>
              <td>
                <button onClick={() => addFunds("zwbtc")} className="button">
                  Add Funds
                </button>
              </td>
            </tr>
            <tr className={styles.row}>
              <td>ZETH</td>
              <td>{zethBal}</td>
              <td>
                <button onClick={() => addFunds("zeth")} className="button">
                  Add Funds
                </button>
              </td>
            </tr>
            <tr className={styles.row}>
              <td>XCAD</td>
              <td>{xcadBal}</td>
              <td>
                <button onClick={() => addFunds("xcad")} className="button">
                  Add Funds
                </button>
              </td>
            </tr>
            <tr className={styles.row}>
              <td>LUNR</td>
              <td>{lunrBal}</td>
              <td>
                <button onClick={() => addFunds("lunr")} className="button">
                  Add Funds
                </button>
              </td>
            </tr>
            <tr className={styles.row}>
              <td>ZWAP</td>
              <td>{zwapBal}</td>
              <td>
                <button onClick={() => addFunds("zwap")} className="button">
                  Add Funds
                </button>
              </td>
            </tr>
            <tr className={styles.row}>
              <td>SWTH</td>
              <td>{swthBal}</td>
              <td>
                <button onClick={() => addFunds("swth")} className="button">
                  Add Funds
                </button>
              </td>
            </tr>
            <tr className={styles.row}>
              <td>PORT</td>
              <td>{portBal}</td>
              <td>
                <button onClick={() => addFunds("port")} className="button">
                  Add Funds
                </button>
              </td>
            </tr>
            <tr className={styles.row}>
              <td>SCO</td>
              <td>{scoBal}</td>
              <td>
                <button onClick={() => addFunds("sco")} className="button">
                  Add Funds
                </button>
              </td>
            </tr>
            <tr className={styles.row}>
              <td>FEES</td>
              <td>{feesBal}</td>
              <td>
                <button onClick={() => addFunds("fees")} className="button">
                  Add Funds
                </button>
              </td>
            </tr>
            <tr className={styles.row}>
              <td>CARB</td>
              <td>{carbBal}</td>
              <td>
                <button onClick={() => addFunds("carb")} className="button">
                  Add Funds
                </button>
              </td>
            </tr>
            <tr className={styles.row}>
              <td>BLOX</td>
              <td>{bloxBal}</td>
              <td>
                <button onClick={() => addFunds("blox")} className="button">
                  Add Funds
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Component;
