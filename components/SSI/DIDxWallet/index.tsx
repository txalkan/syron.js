import styles from "./styles.module.scss";
import React, { useState, ReactNode, useEffect } from "react";
import { useStore } from "effector-react";
import { toast } from "react-toastify";
import { $user } from "../../../src/store/user";
import { Liquidity, StakeRewards } from "../..";
import { $arconnect } from "../../../src/store/arconnect";
import { updateIsController } from "../../../src/store/controller";
import { useRouter } from "next/router";
import Image from 'next/image';
import backLogo from "../../../src/assets/logos/left-arrow.png";

/*
import * as tyron from 'tyron';
import { ZilPayBase } from '../ZilPay/zilpay-base';
import { $net } from 'src/store/wallet-network';
import { $contract } from 'src/store/contract';
*/

interface LayoutProps {
  children: ReactNode;
}

function Component(props: LayoutProps) {
  const { children } = props;
  const user = useStore($user);
  const username = user?.name;
  const domain = user?.domain;
  const arConnect = useStore($arconnect);
  const Router = useRouter();

  const [hideLiquidity, setHideLiquidity] = useState(true);
  const [liquidityLegend, setLiquidityLegend] = useState("add / remove");
  const [hideDex, setHideDex] = useState(true);
  const [dexLegend, setDexLegend] = useState("exchange");
  const [hideStake, setHideStake] = useState(true);
  const [stakeLegend, setStakeLegend] = useState("+ rewards");
  const [hideStake2, setHideStake2] = useState(true);
  const [stakeLegend2, setStakeLegend2] = useState("swap");
  const [index, setIndex] = useState(true);

  useEffect(() => {
    const path = window.location.pathname;
    if (path.replace(`/${user?.name}/xwallet`, '') === '') {
      setIndex(true)
    } else {
      setIndex(false)
    }
  }, [setIndex])

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
      <div style={{width: '100%'}}>
        <div
          onClick={() => {
            Router.push(`/${username}`);
          }}
          className={styles.backIco}
        >
          <Image width={25} height={25} alt="back-ico" src={backLogo} />
        </div>
        <h1 className={styles.headline}>
          <span style={{ textTransform: "lowercase" }}>{username}&apos;s</span> SSI
        </h1>
      </div>
      <div>
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
          {domain !== "did" && (
            <h1>
              <span className={styles.username}>
                <span style={{ color: "white" }}>{username}</span>.{domain}
              </span>{" "}
              <span style={{ textTransform: "lowercase" }}>x</span>Wallet{" "}
              <span style={{ textTransform: "lowercase" }}>domain</span>
            </h1>
          )}
          {domain === "did" && (
            <>
              <h2>
                {index ? (
                  <div
                    className={styles.card}
                    onClick={() => {
                      if (arConnect === null) {
                        toast.warning('Connect your SSI Private Key', {
                          position: "top-right",
                          autoClose: 2000,
                          hideProgressBar: false,
                          closeOnClick: true,
                          pauseOnHover: true,
                          draggable: true,
                          progress: undefined,
                          theme: 'dark',
                        });
                      } else {
                        updateIsController(true);
                        Router.push(`/${username}/xwallet/did`)
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
                ) : <></>}
              </h2>

              <h2>
                {index ? (
                  <div
                    className={styles.card}
                    onClick={() => {
                      updateIsController(true);
                      Router.push(`/${username}/xwallet/nft`)
                    }}
                  >
                    <p className={styles.cardTitle3}>
                      NFT USERNAME
                    </p>
                    <p className={styles.cardTitle2}>
                      CREATE DID DOMAINS or TRANSFER USERNAME
                    </p>
                  </div>
                ) : <></>}
              </h2>

              <h2>
                {index ? (
                  <div
                    className={styles.card}
                    onClick={() => {
                      updateIsController(true);
                      Router.push(`/${username}/xwallet/upgrade`)
                    }}
                  >
                    <p className={styles.cardTitle3}>
                      UPGRADE
                    </p>
                    <p className={styles.cardTitle2}>
                      coming soon!
                    </p>
                  </div>
                ) : <></>}
              </h2>
              
              <h2>
                {index ? (
                  <div
                    className={styles.card}
                    onClick={() => {
                      updateIsController(true);
                      Router.push(`/${username}/xwallet/withdraw`)
                    }}
                  >
                    <p className={styles.cardTitle3}>
                      WITHDRAW
                    </p>
                    <p className={styles.cardTitle2}>
                      SEND FUNDS OUT OF YOUR WALLET
                    </p>
                  </div>
                ) :<></>}
              </h2>

              {children}
            </>
          )}
          {domain === "dex" && (
            <>
              <div style={{ marginTop: "7%" }}>
                {hideDex && (
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
                {hideLiquidity && (
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
          {domain === "stake" && (
            <>
              <div style={{ marginTop: "7%" }}>
                {hideStake2 && (
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
                {hideStake && (
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
    </div>
  );
}

export default Component;
