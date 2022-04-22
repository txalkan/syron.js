import React, { useState } from "react";
import { toast } from "react-toastify";
import { CreateDomain, TransferNFTUsername } from "../../../..";
import styles from "./styles.module.scss";
import { useStore } from "effector-react";
import { $arconnect } from "../../../../../src/store/arconnect";

function Component() {
  const arConnect = useStore($arconnect);
  const [hideVC, setHideVC] = useState(true);
  const [vcLegend, setVCLegend] = useState(".vc");
  const [hideDex, setHideDex] = useState(true);
  const [dexLegend, setDexLegend] = useState(".defi");
  const [hideTransfer, setHideTransfer] = useState(true);
  const [transferLegend, setTransferLegend] = useState("transfer NFT username");
  const [showDIDDomain, setShowDIDDomain] = useState(false);
  const [showManageNFT, setShowManageNFT] = useState(false);

  const back = () => {
    if (!hideTransfer) {
      setHideTransfer(true);
    } else if (showManageNFT) {
      setShowManageNFT(false);
    } else if (showDIDDomain) {
      setShowDIDDomain(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        textAlign: "center",
        alignItems: "center",
      }}
    >
      {showDIDDomain || showManageNFT ? (
        <button
          onClick={back}
          className="button"
          style={{ marginBottom: "50%" }}
        >
          <p>BACK</p>
        </button>
      ) : (
        <></>
      )}
      {!showDIDDomain && !showManageNFT && (
        <>
          <h2>
            <div
              onClick={() => {
                setShowDIDDomain(true);
              }}
              className={styles.flipCard}
            >
              <div className={styles.flipCardInner}>
                <div className={styles.flipCardFront}>
                  <p className={styles.cardTitle3}>DID DOMAINS</p>
                </div>
                <div className={styles.flipCardBack}>
                  <p className={styles.cardTitle2}>DESC</p>
                </div>
              </div>
            </div>
          </h2>
          <h2>
            <div
              onClick={() => {
                setShowManageNFT(true);
              }}
              className={styles.flipCard}
            >
              <div className={styles.flipCardInner}>
                <div className={styles.flipCardFront}>
                  <p className={styles.cardTitle3}>MANAGE NFT USERNAME</p>
                </div>
                <div className={styles.flipCardBack}>
                  <p className={styles.cardTitle2}>DESC</p>
                </div>
              </div>
            </div>
          </h2>
        </>
      )}
      {showManageNFT && hideTransfer && (
        <>
          <h2>
            <div
              onClick={() => {
                // setShowDIDDomain(true);
              }}
              className={styles.flipCard}
            >
              <div className={styles.flipCardInner}>
                <div className={styles.flipCardFront}>
                  <p className={styles.cardTitle3}>UPDATE NFT DID</p>
                </div>
                <div className={styles.flipCardBack}>
                  <p className={styles.cardTitle2}>DESC</p>
                </div>
              </div>
            </div>
          </h2>
          <h2>
            <div
              onClick={() => {
                setHideTransfer(false);
                setTransferLegend("back");
              }}
              className={styles.flipCard}
            >
              <div className={styles.flipCardInner}>
                <div className={styles.flipCardFront}>
                  <p className={styles.cardTitle3}>TRANSFER NFT USERNAME</p>
                </div>
                <div className={styles.flipCardBack}>
                  <p className={styles.cardTitle2}>DANGER ZONE</p>
                </div>
              </div>
            </div>
          </h2>
        </>
      )}
      {showDIDDomain && (
        <>
          <div>
            {hideVC && (
              <>
                {hideDex ? (
                  <button
                    type="button"
                    className={styles.button}
                    onClick={() => {
                      setHideDex(false);
                      setDexLegend("back");
                    }}
                  >
                    <p className={styles.buttonColorText}>{dexLegend}</p>
                  </button>
                ) : (
                  <></>
                )}
              </>
            )}
            {!hideDex && (
              <CreateDomain
                {...{
                  domain: "defi",
                }}
              />
            )}
          </div>
          <div>
            {hideDex && (
              <>
                {hideVC ? (
                  <>
                    <h4 style={{ color: "silver", marginTop: "70px" }}>
                      for community management
                    </h4>
                    <button
                      type="button"
                      className={styles.button}
                      onClick={() => {
                        if (arConnect === null) {
                          toast.warning("Connect with ArConnect.", {
                            position: "top-center",
                            autoClose: 2000,
                            hideProgressBar: false,
                            closeOnClick: true,
                            pauseOnHover: true,
                            draggable: true,
                            progress: undefined,
                            theme: "dark",
                          });
                        } else {
                          toast.warning(
                            "If you want a Tyron VC, go to tyron.vc instead!",
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
                          setHideVC(false);
                          setVCLegend("back");
                        }
                      }}
                    >
                      <p className={styles.buttonBlueText}>{vcLegend}</p>
                    </button>
                  </>
                ) : (
                  <>
                    <h2>Verifiable credential DID domain</h2>
                  </>
                )}
              </>
            )}
            {!hideVC && (
              <CreateDomain
                {...{
                  domain: "vc",
                }}
              />
            )}
          </div>
        </>
      )}
      {/* {hideDex && hideVC && hideTransfer && (
        <div style={{ marginTop: "70px" }}>
          <h5 style={{ color: "red" }}>danger zone</h5>
          <button
            type="button"
            className={styles.button}
            onClick={() => {
              setHideTransfer(false);
              setTransferLegend("back");
            }}
          >
            <p className={styles.buttonColorDText}>{transferLegend}</p>
          </button>
        </div>
      )} */}
      {!hideTransfer && <TransferNFTUsername />}
    </div>
  );
}

export default Component;
