import styles from "./styles.module.scss";
import React, { useState, useEffect } from "react";
import { useStore } from "effector-react";
import { toast } from "react-toastify";
import { $user } from "../../../src/store/user";
import {
  DIDOperations,
  Liquidity,
  NFTUsername,
  StakeRewards,
  Withdrawals,
} from "../..";
import { $arconnect } from "../../../src/store/arconnect";
import { updateIsAdmin } from "../../../src/store/admin";
import { useRouter } from "next/router";
/*
import * as tyron from 'tyron';
import { ZilPayBase } from '../ZilPay/zilpay-base';
import { $net } from 'src/store/wallet-network';
import { $contract } from 'src/store/contract';
*/

function Component() {
  const user = useStore($user);
  const arConnect = useStore($arconnect);
  const Router = useRouter();

  const [hideOperations, setHideOperations] = useState(true);
  const [hideNFT, setHideNFT] = useState(true);
  const [hideUpgrade, setHideUpgrade] = useState(true);
  const [hideWithdrawals, setHideWithdrawals] = useState(true);

  const [hideLiquidity, setHideLiquidity] = useState(true);
  const [liquidityLegend, setLiquidityLegend] = useState("add / remove");
  const [hideDex, setHideDex] = useState(true);
  const [dexLegend, setDexLegend] = useState("exchange");
  const [hideStake, setHideStake] = useState(true);
  const [stakeLegend, setStakeLegend] = useState("+ rewards");
  const [hideStake2, setHideStake2] = useState(true);
  const [stakeLegend2, setStakeLegend2] = useState("swap");

  useEffect(() => {
    updateIsAdmin({
      verified: true,
      hideWallet: false,
    });
  });

  //const contract = useStore($contract);
  //const net = useStore($net);
  //const [error, setError] = useState('');

  /*
    const handleTest = async () => {
        if (contract !== null) {
            try {
                const zilpay = new ZilPayBase();
                const tyron_ = await tyron.TyronZil.default.OptionParam(tyron.TyronZil.Option.none, 'Uint128');

                const username = await tyron.TyronZil.default.OptionParam(tyron.TyronZil.Option.some, 'String', user?.nft);
                const input = "0xf17c14ca06322e8fe4f460965a94184eb008b2c4"   //@todo-test beneficiary
                const guardianship = await tyron.TyronZil.default.OptionParam(tyron.TyronZil.Option.some, 'ByStr20', input);
                const id = "tyron";

                const tx_value = [
                    {
                        "argtypes": [
                            "String",
                            "Uint128"
                        ],
                        "arguments": [
                            `${"tyron"}`,
                            `${9}`
                        ],
                        "constructor": "Pair"
                    },
                    {
                        "argtypes": [
                            "String",
                            "Uint128"
                        ],
                        "arguments": [
                            `${"xsgd"}`,
                            `${1000000}`
                        ],
                        "constructor": "Pair"
                    }
                ];
                const params = [];
                const username_ = {
                    vname: 'username',
                    type: 'Option String',
                    value: username,
                };
                params.push(username_);
                const addr_ = {
                    vname: 'recipient',
                    type: 'ByStr20',
                    value: input,
                };
                params.push(addr_);
                const guardianship_ = {
                    vname: 'guardianship',
                    type: 'Option ByStr20',
                    value: guardianship,
                };
                params.push(guardianship_);
                const id_ = {
                    vname: 'id',
                    type: 'String',
                    value: id,
                };
                params.push(id_);
                const amount_ = {
                    vname: 'amount',
                    type: 'Uint128',
                    value: '0',   //@todo 0 because ID is tyron
                };
                params.push(amount_);
                const tokens_ = {
                    vname: 'tokens',
                    type: 'List( Pair String Uint128 )',
                    value: tx_value,
                };
                params.push(tokens_);
                const tyron__ = {
                    vname: 'tyron',
                    type: 'Option Uint128',
                    value: tyron_,
                };
                params.push(tyron__);
                await zilpay.call(
                    {
                        contractAddress: contract.addr,
                        transition: 'Upgrade',
                        params: params as unknown as Record<string, unknown>[],
                        amount: String(0)
                    },
                    {
                        gasPrice: '2000',
                        gaslimit: '20000'
                    }
                )
                    .then(res => {
                        window.open(
                            `https://viewblock.io/zilliqa/tx/${res.ID}?network=${net}`
                        );
                    })
            } catch (error) {
                const err = error as string;
                setError(err)
            }
        } else {
            setError('some data is missing.')
        }
    };
    */

  return (
    <div style={{ display: 'flex', flexDirection: 'column', marginTop: '100px', textAlign: 'center' }}>
      <h1 className={styles.headline}>
        <span style={{ textTransform: "lowercase" }}>{user?.name}'s</span> SSI
      </h1>
      <button
        type="button"
        className={styles.buttonBack}
        onClick={() => {
          Router.push(`/${user?.name}`);
        }}
      >
        <p className={styles.buttonBackText}>back</p>
      </button>
      <div style={{ marginTop: "70px" }}>
        <h1 className={styles.title}>
          DID<span style={{ textTransform: "lowercase" }}>x</span>Wallet
        </h1>
        <h3 style={{ color: 'silver' }}>
          Decentralized Identifier smart contract wallet
        </h3>
        <div
          style={{
            marginTop: "7%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center"
          }}
        >
          {user?.domain !== "did" && (
            <h1>
              <span className={styles.username}>
                <span style={{ color: "white" }}>{user?.name}</span>.{user?.domain}
              </span>{" "}
              <span style={{ textTransform: "lowercase" }}>x</span>Wallet{" "}
              <span style={{ textTransform: "lowercase" }}>domain</span>
            </h1>
          )}
          {user?.domain === "did" && (
            <>
              {hideNFT && hideUpgrade && hideWithdrawals && (
                <h2>
                  {hideOperations ? (
                    <div
                      className={styles.card}
                      onClick={() => {
                        if (arConnect === null) {
                          toast.info('To continue, connect your SSI Private Key: Click on Connect -> SSI Private Key', {
                            position: "top-left",
                            autoClose: 2000,
                            hideProgressBar: false,
                            closeOnClick: true,
                            pauseOnHover: true,
                            draggable: true,
                            progress: undefined,
                            theme: 'dark',
                          });
                        } else {
                          setHideOperations(false);
                        }
                      }}
                    >
                      <p className={styles.cardTitle3}>
                        DID OPERATIONS
                      </p>
                      <p className={styles.cardTitle2}>
                        Create, update, recover or deactivate
                      </p>
                    </div>
                  ) : (
                    <>
                      <button
                        type="button"
                        className={styles.button}
                        onClick={() => {
                          setHideOperations(true);
                        }}
                      >
                        <p className={styles.buttonText}>back</p>
                      </button>
                    </>
                  )}
                </h2>
              )}
              {!hideOperations && <DIDOperations />}

              {hideOperations && hideUpgrade && hideWithdrawals && (
                <h2>
                  {hideNFT ? (
                    <div
                      className={styles.card}
                      onClick={() => {
                        setHideNFT(false);
                      }}
                    >
                      <p className={styles.cardTitle3}>
                        NFT USERNAME
                      </p>
                      <p className={styles.cardTitle2}>
                        CREATE DID DOMAINS or TRANSFER USERNAME
                      </p>
                    </div>
                  ) : (
                    <>
                      <button
                        type="button"
                        className={styles.button}
                        onClick={() => {
                          setHideNFT(true);
                        }}
                      >
                        <p className={styles.buttonText}>back</p>
                      </button>
                    </>
                  )}
                </h2>
              )}
              {!hideNFT && <NFTUsername />}
              {hideOperations && hideNFT && hideWithdrawals && (
                <h2>
                  {hideUpgrade ? (
                    <div
                      className={styles.card}
                      onClick={() => {
                        setHideUpgrade(false);
                      }}
                    >
                      <p className={styles.cardTitle3}>
                        UPGRADE
                      </p>
                      <p className={styles.cardTitle2}>
                        coming soon!
                      </p>
                    </div>
                  ) : (
                    <>
                      <button
                        type="button"
                        className={styles.button}
                        onClick={() => {
                          setHideUpgrade(true);
                          //handleTest()
                        }}
                      >
                        <p className={styles.buttonText}>back</p>
                      </button>
                    </>
                  )}
                </h2>
              )}
              {!hideUpgrade && (
                <div style={{ marginTop: "70px" }}>
                  <h4>
                    On TYRON, you can transfer your NFT Username, tokens and
                    ZIL, all in one transaction.
                  </h4>
                  <h5 style={{ color: "lightgrey" }}>
                    Available from version 4.
                  </h5>
                </div>
              )}
              {hideOperations && hideNFT && hideUpgrade && (
                <h2>
                  {hideWithdrawals ? (
                    <div
                      className={styles.card}
                      onClick={() => {
                        setHideWithdrawals(false);
                      }}
                    >
                      <p className={styles.cardTitle3}>
                        WITHDRAW
                      </p>
                      <p className={styles.cardTitle2}>
                        SEND FUNDS OUT OF YOUR WALLET
                      </p>
                    </div>
                  ) : (
                    <>
                      <button
                        type="button"
                        className={styles.button}
                        onClick={() => {
                          setHideWithdrawals(true);
                        }}
                      >
                        <p className={styles.buttonText}>
                          back
                        </p>
                      </button>
                    </>
                  )}
                </h2>
              )}
              {!hideWithdrawals && <Withdrawals />}
            </>
          )}
          {user?.domain === "dex" && (
            <>
              <div style={{ marginTop: "7%" }}>
                {hideOperations && hideDex && (
                  <h2>
                    liquidity{" "}
                    {hideLiquidity ? (
                      <button
                        type="button"
                        className={styles.button}
                        onClick={() => {
                          setHideLiquidity(false);
                          setLiquidityLegend("back");
                        }}
                      >
                        <p className={styles.buttonWhiteText}>{liquidityLegend}</p>
                      </button>
                    ) : (
                      <>
                        on zilswap
                        <button
                          type="button"
                          className={styles.button}
                          onClick={() => {
                            setHideLiquidity(true);
                            setLiquidityLegend("add / remove");
                          }}
                        >
                          <p className={styles.buttonText}>{liquidityLegend}</p>
                        </button>
                      </>
                    )}
                  </h2>
                )}
                {!hideLiquidity && <Liquidity />}
              </div>
              <div style={{ marginTop: "7%" }}>
                {hideOperations && hideLiquidity && (
                  <h2 style={{ width: "110%" }}>
                    decentralized{" "}
                    {hideDex ? (
                      <button
                        type="button"
                        className={styles.button}
                        onClick={() => {
                          setHideDex(false);
                          setDexLegend("back");
                        }}
                      >
                        <p className={styles.buttonWhiteText}>{dexLegend}</p>
                      </button>
                    ) : (
                      <>
                        exchange
                        <button
                          type="button"
                          className={styles.button}
                          onClick={() => {
                            setHideDex(true);
                            setDexLegend("exchange");
                          }}
                        >
                          <p className={styles.buttonText}>{dexLegend}</p>
                        </button>
                      </>
                    )}
                  </h2>
                )}
                {!hideDex && <p>Coming soon!</p>}
              </div>
            </>
          )}
          {user?.domain === "stake" && (
            <>
              <div style={{ marginTop: "7%" }}>
                {hideOperations && hideStake2 && (
                  <h2>
                    stake{" "}
                    {hideStake ? (
                      <button
                        type="button"
                        className={styles.button}
                        onClick={() => {
                          setHideStake(false);
                          setStakeLegend("back");
                        }}
                      >
                        <p className={styles.buttonYellowText}>{stakeLegend}</p>
                      </button>
                    ) : (
                      <>
                        + rewards
                        <button
                          type="button"
                          className={styles.button}
                          onClick={() => {
                            setHideStake(true);
                            setStakeLegend("+ rewards");
                          }}
                        >
                          <p className={styles.buttonText}>{stakeLegend}</p>
                        </button>
                      </>
                    )}
                  </h2>
                )}
                {!hideStake && <StakeRewards />}
              </div>
              <div style={{ marginTop: "7%" }}>
                {hideOperations && hideStake && (
                  <h2>
                    delegator{" "}
                    {hideStake2 ? (
                      <button
                        type="button"
                        className={styles.button}
                        onClick={() => {
                          setHideStake2(false);
                          setStakeLegend2("back");
                        }}
                      >
                        <p className={styles.buttonWhiteText}>{stakeLegend2}</p>
                      </button>
                    ) : (
                      <>
                        swap
                        <button
                          type="button"
                          className={styles.button}
                          onClick={() => {
                            setHideStake2(true);
                            setStakeLegend2("swap");
                          }}
                        >
                          <p className={styles.buttonText}>{stakeLegend2}</p>
                        </button>
                      </>
                    )}
                  </h2>
                )}
                {!hideStake2 && <p>Coming soon.</p>}
              </div>
            </>
          )}
        </div>
      </div>
      {/*
                error !== '' &&
                <p className={styles.error}>
                    Error: {error}
                </p>
            */}
    </div>
  );
}

export default Component;
