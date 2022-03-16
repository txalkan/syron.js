import { useStore } from "effector-react";
import React, { useState } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/router"
import { $arconnect } from "../../../../src/store/arconnect";
import { $user } from "../../../../src/store/user";
import { updateIsController } from "../../../../src/store/controller";
import { Headline, NFTUsernameDomain, TransferNFTUsername } from "../../..";
import styles from "./styles.module.scss";

function Component() {
  const Router = useRouter();
  const username = useStore($user)?.name;
  const arConnect = useStore($arconnect);

  const [hideVC, setHideVC] = useState(true);
  const [vcLegend, setVCLegend] = useState(".vc");
  const [hideDex, setHideDex] = useState(true);
  const [dexLegend, setDexLegend] = useState(".dex");
  const [hideStake, setHideStake] = useState(true);
  const [stakeLegend, setStakeLegend] = useState(".stake");
  const [hideTransfer, setHideTransfer] = useState(true);
  const [transferLegend, setTransferLegend] = useState("transfer NFT username");

  return (
    <div className={styles.wrapper}>
      <Headline />
      <div>
        <button
          type="button"
          className={styles.buttonBack}
          onClick={() => {
            updateIsController(true);
            Router.push(`/${username}/xwallet`);
          }}
        >
          <p className={styles.buttonText}>wallet menu</p>
        </button>
      </div>
      <h2 style={{ color: '#ffff32', marginTop: "14%" }}>
        DID domains
      </h2>
      <div style={{ marginTop: "14%", textAlign: 'left' }}>
        {hideTransfer && (
          <>
            <div>
              {hideStake && hideVC && (
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
                    <>
                      <h2>
                        Decentralized exchange DID domain
                      </h2>
                    </>
                  )}
                </>
              )}
              {!hideDex && <p>Coming soon!</p>}
            </div>
            <div>
              {hideDex && hideVC && (
                <>
                  {hideStake ? (
                    <button
                      type="button"
                      className={styles.button}
                      onClick={() => {
                        setHideStake(false);
                        setStakeLegend("back");
                      }}
                    >
                      <p className={styles.buttonColorText}>{stakeLegend}</p>
                    </button>
                  ) : (
                    <>
                      <h2>
                        Staking DID domain
                      </h2>
                    </>
                  )}
                </>
              )}
              {!hideStake && <p>Coming soon!</p>}
            </div>
            <div>
              {hideDex && hideStake && (
                <>
                  {hideVC ? (
                    <>
                      <h4 style={{ color: 'silver', marginTop: "70px" }}>
                        for community management
                      </h4>
                      <button
                        type="button"
                        className={styles.button}
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
                            toast.info('If you want a Tyron VC, go to tyron.vc instead!', {
                              position: "top-left",
                              autoClose: 2000,
                              hideProgressBar: false,
                              closeOnClick: true,
                              pauseOnHover: true,
                              draggable: true,
                              progress: undefined,
                              theme: 'dark',
                            });
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
                      <h2>
                        Verifiable credential DID domain
                      </h2>
                    </>
                  )}
                </>
              )}
              {!hideVC && (
                <NFTUsernameDomain
                  {...{
                    domain: "vc",
                  }}
                />
              )}
            </div>
          </>
        )}
        {hideDex && hideStake && hideVC && hideTransfer && (
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
    </div>
  );
}

export default Component;
