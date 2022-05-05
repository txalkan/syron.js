import * as zcrypto from "@zilliqa-js/crypto";
import { useStore } from "effector-react";
import React, { ReactNode, useEffect } from "react";
import { useSelector } from "react-redux";
import { $doc, updateDoc } from "../../../src/store/did-doc";
import { $user } from "../../../src/store/user";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import styles from "./styles.module.scss";
import { $contract, updateContract } from "../../../src/store/contract";
import { updateIsController } from "../../../src/store/controller";
import { RootState } from "../../../src/app/reducers";
import { $dashboardState } from "../../../src/store/modal";
import { fetchAddr, resolve } from "../../SearchBar/utils";
import { $net } from "../../../src/store/wallet-network";
import { DOMAINS } from "../../../src/constants/domains";

interface LayoutProps {
  children: ReactNode;
}

function Component(props: LayoutProps) {
  const { children } = props;
  const Router = useRouter();

  const net = useStore($net);
  const user = useStore($user);
  const doc = useStore($doc);
  const contract = useStore($contract);
  const controller = contract?.controller;
  const zilAddr = useSelector((state: RootState) => state.modal.zilAddr);
  const dashboardState = useStore($dashboardState);

  // const getContract = async () => {
  //   try {
  //     await fetchAddr({
  //       net,
  //       _username: user?.name!,
  //       _domain: user?.domain!,
  //     })
  //       .then(async (addr) => {
  //         await resolve({ net, addr })
  //           .then(async (result) => {
  //             const did_controller = result.controller.toLowerCase();
  //             updateContract({ addr: addr });
  //             updateContract({
  //               addr: addr,
  //               controller: zcrypto.toChecksumAddress(did_controller),
  //               status: result.status,
  //             });
  //             updateDoc({
  //               did: result.did,
  //               version: result.version,
  //               doc: result.doc,
  //               dkms: result.dkms,
  //               guardians: result.guardians,
  //             });
  //             return result.version;
  //           })
  //           .catch(() => {
  //             throw new Error("Wallet not able to resolve DID.");
  //           });
  //       })
  //       .catch((err) => {
  //         throw err;
  //       });
  //   } catch (error) {
  //     toast.error(String(error), {
  //       position: "top-right",
  //       autoClose: 3000,
  //       hideProgressBar: false,
  //       closeOnClick: true,
  //       pauseOnHover: true,
  //       draggable: true,
  //       progress: undefined,
  //       theme: "dark",
  //       toastId: 5,
  //     });
  //   }
  // };

  const fetchDoc = async () => {
    const _username = user?.name!;
    const _domain = user?.domain!;
    if (_username && _domain) {
      await fetchAddr({ net, _username, _domain: "did" })
        .then(async (addr) => {
          await resolve({ net, addr })
            .then(async (result) => {
              const did_controller = result.controller.toLowerCase();
              console.log(`DID Controller: ${did_controller}`);
              updateDoc({
                did: result.did,
                version: result.version,
                doc: result.doc,
                dkms: result.dkms,
                guardians: result.guardians,
              });
              if (_domain === DOMAINS.DID) {
                updateContract({
                  addr: addr!,
                  controller: zcrypto.toChecksumAddress(did_controller),
                  status: result.status,
                });
              } else {
                await fetchAddr({ net, _username, _domain })
                  .then(async (domain_addr) => {
                    updateContract({
                      addr: domain_addr!,
                      controller: zcrypto.toChecksumAddress(did_controller),
                      status: result.status,
                    });
                  })
                  .catch(() => {
                    toast.error(`Uninitialized DID Domain.`, {
                      position: "top-right",
                      autoClose: 3000,
                      hideProgressBar: false,
                      closeOnClick: true,
                      pauseOnHover: true,
                      draggable: true,
                      progress: undefined,
                      theme: "dark",
                    });
                    Router.push(`/${_username}`);
                  });
              }
            })
            .catch((err) => {
              throw err;
            });
        })
        .catch((err) => {
          toast.error(String(err), {
            position: "top-right",
            autoClose: 6000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "dark",
          });
          Router.push(`/`);
        });
    }
  };

  useEffect(() => {
    fetchDoc();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h1 style={{ marginBottom: "10%" }}>
        <span style={{ color: "silver" }}>
          Self-sovereign identity
          <p style={{ textTransform: "lowercase", marginTop: "3%" }}>of</p>
        </span>
        <p className={styles.username}>{user?.name}.did</p>
      </h1>
      <div
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "center",
          flexDirection: "row",
        }}
      >
        {children}
      </div>
      <div
        style={{
          marginTop: "7%",
          width: "100%",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <h2>
            <div
              onClick={() => {
                Router.push(`/${user?.name}/did/doc`);
              }}
              className={styles.flipCard}
            >
              <div className={styles.flipCardInner}>
                <div className={styles.flipCardFront}>
                  <p className={styles.cardTitle3}>did</p>
                </div>
                <div className={styles.flipCardBack}>
                  <p className={styles.cardTitle2}>
                    Decentralized Identifier Document
                  </p>
                </div>
              </div>
            </div>
          </h2>
          <h2>
            <div
              onClick={() => {
                Router.push(`/${user?.name}/did/recovery`);
              }}
              className={styles.flipCard}
            >
              <div className={styles.flipCardInner}>
                <div className={styles.flipCardFront2}>
                  <p className={styles.cardTitle3}>Social Recovery</p>
                </div>
                <div className={styles.flipCardBack}>
                  <p className={styles.cardTitle2}>Update DID Controller</p>
                </div>
              </div>
            </div>
          </h2>
        </div>
        <div className={styles.xText}>
          <h5 style={{ color: "#ffff32" }}>x</h5>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <h2>
            <div
              onClick={() => {
                if (dashboardState === "loggedIn") {
                  if (controller === zilAddr?.base16) {
                    updateIsController(true);
                    Router.push(`/${user?.name}/did/wallet`);
                  } else {
                    toast.error(
                      `Only ${user?.name}'s DID Controller can access this wallet.`,
                      {
                        position: "top-right",
                        autoClose: 3000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                        theme: "dark",
                      }
                    );
                  }
                } else {
                  toast.warning(`To continue, log in.`, {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "dark",
                  });
                }
              }}
              className={styles.flipCard}
            >
              <div className={styles.flipCardInner}>
                <div className={styles.flipCardFront}>
                  <p className={styles.cardTitle3}>wallet</p>
                </div>
                <div className={styles.flipCardBack}>
                  <p className={styles.cardTitle2}>smart contract wallet</p>
                </div>
              </div>
            </div>
          </h2>
          <h2>
            <div
              onClick={() => {
                console.log(doc?.version.slice(0, 4));
                if (
                  Number(doc?.version.slice(8, 9)) >= 4 ||
                  doc?.version.slice(0, 4) === "init" ||
                  doc?.version.slice(0, 3) === "dao"
                ) {
                  Router.push(`/${user?.name}/did/funds`);
                } else {
                  toast.info(
                    `Feature unavailable. Upgrade ${user?.name}'s SSI.`,
                    {
                      position: "top-center",
                      autoClose: 2000,
                      hideProgressBar: false,
                      closeOnClick: true,
                      pauseOnHover: true,
                      draggable: true,
                      progress: undefined,
                      theme: "dark",
                      toastId: 7,
                    }
                  );
                }
              }}
              className={styles.flipCard}
            >
              <div className={styles.flipCardInner}>
                <div className={styles.flipCardFront2}>
                  <p className={styles.cardTitle3}>add funds</p>
                </div>
                <div className={styles.flipCardBack}>
                  <p className={styles.cardTitle2}>top up wallet</p>
                </div>
              </div>
            </div>
          </h2>
        </div>
      </div>
    </div>
  );
}

export default Component;
