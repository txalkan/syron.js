import { useStore } from "effector-react";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import * as tyron from "tyron";
import Image from "next/image";
import { RootState } from "../../../../../src/app/reducers";
import { $contract } from "../../../../../src/store/contract";
import {
  updateModalAddFunds,
  updateSelectedCurrency,
  updateModalWithdrawal,
  updateZilpayBalance,
} from "../../../../../src/store/modal";
import { $net } from "../../../../../src/store/wallet-network";
import {
  $loadingDoc,
  updateLoadingDoc,
} from "../../../../../src/store/loading";
import { fetchAddr } from "../../../../SearchBar/utils";
import styles from "./styles.module.scss";
import arrowDown from "../../../../../src/assets/icons/arrow_down_white.svg";
import arrowUp from "../../../../../src/assets/icons/arrow_up_white.svg";
import defaultCheckmark from "../../../../../src/assets/icons/default_checkmark.svg";
import selectedCheckmark from "../../../../../src/assets/icons/selected_checkmark.svg";

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
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);
  const [selectedCurrencyDropdown, setSelectedCurrencyDropdown] = useState(
    Array()
  );

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

      let res = [0, 0];
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
    const currency = ["TYRON", "$SI", "gZIL", "zUSDT", "XSGD", "PIL"];
    const allCurrency = [...currency, selectedCurrencyDropdown];
    for (let i = 0; i < allCurrency.length; i += 1) {
      const coin = String(allCurrency[i]).toLowerCase();
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

  const addFunds = (currency: string, zilpayBalance: number) => {
    updateSelectedCurrency(currency);
    updateModalAddFunds(true);
    updateZilpayBalance(zilpayBalance);
  };

  const withdrawFunds = (currency: string) => {
    updateSelectedCurrency(currency);
    updateModalWithdrawal(true);
  };

  useEffect(() => {
    fetchAllBalance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const currencyDropdown = [
    "gZIL",
    "zUSDT",
    "XSGD",
    "XIDR",
    "PIL",
    "zWBTC",
    "zETH",
    "XCAD",
    "Lunr",
    "ZWAP",
    "SWTH",
    "PORT",
    "SCO",
    "FEES",
    "CARB",
    "BLOX",
  ];

  const selectCurrency = (val) => {
    setShowCurrencyDropdown(false);
    if (!checkIsExist(val)) {
      let arr = selectedCurrencyDropdown;
      arr.push(val);
      setSelectedCurrencyDropdown(arr);
    } else {
      let arr = selectedCurrencyDropdown.filter((arr) => arr !== val);
      setSelectedCurrencyDropdown(arr);
    }
    fetchAllBalance();
  };

  const checkIsExist = (val) => {
    if (selectedCurrencyDropdown.some((arr) => arr === val)) {
      return true;
    } else {
      return false;
    }
  };

  return (
    <div className={styles.wrapper}>
      {loadingDoc ? (
        <div style={{ marginTop: "50%" }}>
          <i
            className="fa fa-lg fa-spin fa-circle-notch"
            aria-hidden="true"
          ></i>
        </div>
      ) : (
        <>
          <div className={styles.headerWrapper}>
            <div className={styles.dropdownCheckListWrapper}>
              <div
                onClick={() => setShowCurrencyDropdown(!showCurrencyDropdown)}
                className={styles.dropdownCheckList}
              >
                Add new currencies&nbsp;&nbsp;
                <Image
                  src={showCurrencyDropdown ? arrowUp : arrowDown}
                  alt="arrow"
                />
              </div>
              {showCurrencyDropdown && (
                <div className={styles.wrapperOption}>
                  {currencyDropdown.map((val, i) => (
                    <div key={i} className={styles.option}>
                      {checkIsExist(val) ? (
                        <div
                          onClick={() => selectCurrency(val)}
                          className={styles.optionIco}
                        >
                          <Image src={selectedCheckmark} alt="arrow" />
                        </div>
                      ) : (
                        <div
                          onClick={() => selectCurrency(val)}
                          className={styles.optionIco}
                        >
                          <Image src={defaultCheckmark} alt="arrow" />
                        </div>
                      )}
                      <div>{val}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <table>
            <thead>
              <tr className={styles.header}>
                <td className={styles.txtList}>CURRENCY</td>
                <td className={styles.txtList}>DIDxWallet</td>
                <td className={styles.txtList}>ZilPay</td>
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
                    onClick={() => addFunds("TYRON", tyronBal[1])}
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
                    onClick={() => addFunds("$SI", $siBal[1])}
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
              <tr className={styles.row}>
                <td className={styles.txtList}>ZIL</td>
                <td className={styles.txtList}>{zilBal[0]}</td>
                <td className={styles.txtList}>{zilBal[1]}</td>
                <td className={styles.buttonWrapper}>
                  <button
                    onClick={() => addFunds("ZIL", zilBal[1])}
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
              </tr>
              {selectedCurrencyDropdown.map((val, i) => {
                let balanceDropdown: number[] = [];
                switch (val) {
                  case "gZIL":
                    balanceDropdown = gzilBal;
                    break;
                  case "zUSDT":
                    balanceDropdown = zusdtBal;
                    break;
                  case "XSGD":
                    balanceDropdown = xsgdBal;
                    break;
                  case "XIDR":
                    balanceDropdown = xidrBal;
                    break;
                  case "PIL":
                    balanceDropdown = pilBal;
                    break;
                  case "zWBTC":
                    balanceDropdown = zwbtcBal;
                    break;
                  case "zETH":
                    balanceDropdown = zethBal;
                    break;
                  case "XCAD":
                    balanceDropdown = xcadBal;
                    break;
                  case "Lunr":
                    balanceDropdown = lunrBal;
                    break;
                  case "ZWAP":
                    balanceDropdown = zwapBal;
                    break;
                  case "SWTH":
                    balanceDropdown = swthBal;
                  case "PORT":
                    balanceDropdown = portBal;
                    break;
                  case "SCO":
                    balanceDropdown = scoBal;
                    break;
                  case "FEES":
                    balanceDropdown = feesBal;
                    break;
                  case "CARB":
                    balanceDropdown = carbBal;
                    break;
                  case "BLOX":
                    balanceDropdown = bloxBal;
                    break;
                  default:
                    break;
                }
                return (
                  <tr key={i} className={styles.row}>
                    <td className={styles.txtList}>{val}</td>
                    <td className={styles.txtList}>{balanceDropdown[0]}</td>
                    <td className={styles.txtList}>{balanceDropdown[1]}</td>
                    <td className={styles.buttonWrapper}>
                      <button
                        onClick={() => addFunds(val, balanceDropdown[1])}
                        className={styles.buttonActionFunds}
                      >
                        <h6 className={styles.txtList}>Add Funds</h6>
                      </button>
                      <button
                        onClick={() => withdrawFunds(val)}
                        className={styles.buttonActionWithdraw}
                      >
                        <h6 className={styles.txtList}>Withdraw</h6>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}

export default Component;

//@todo-i persist selected currencies after AddFunds or Withdraw components getting opened
