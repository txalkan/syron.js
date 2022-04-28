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
  const [zusdtBal, setzusdtBal] = useState(0);
  const [xsgdBal, setxsgdBal] = useState(0);
  const [pilBal, setpilBal] = useState(0);
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
          res = balance / 1e12;
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
    const currency = ["TYRON", "$SI", "zUSDT", "XSGD", "PIL"];
    for (let i = 0; i < currency.length; i += 1) {
      fetchBalance(currency[i]).then((res) => {
        switch (currency[i]) {
          case "TYRON":
            settyronBal(res);
          case "$SI":
            set$siBal(res);
          case "zUSDT":
            setzusdtBal(res);
          case "XSGD":
            setxsgdBal(res);
          case "PIL":
            setpilBal(res);
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
  });

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
              <td>PIL</td>
              <td>{pilBal}</td>
              <td>
                <button onClick={() => addFunds("pil")} className="button">
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
