import { useSelector } from "react-redux";
import React, { useState } from "react";
import { toast } from "react-toastify";
import { CreateDomain, TransferNFTUsername } from "../../../..";
import styles from "./styles.module.scss";
import { RootState } from "../../../../../src/app/reducers";

function Component() {
  const arConnect = useSelector((state: RootState) => state.modal.arConnect);
  const [hideVC, setHideVC] = useState(true);
  const [vcLegend, setVCLegend] = useState(".vc");
  const [hideDex, setHideDex] = useState(true);
  const [dexLegend, setDexLegend] = useState(".defi");
  const [hideTransfer, setHideTransfer] = useState(true);
  const [transferLegend, setTransferLegend] = useState("transfer NFT username");

  return (
    <div style={{ textAlign: "left" }}>
      {hideTransfer && (
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
      {hideDex && hideVC && hideTransfer && (
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
      )}
      {!hideTransfer && <TransferNFTUsername />}
    </div>
  );
}

export default Component;
