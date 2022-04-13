import React, { useState } from "react";
import Image from "next/image";
import { connect, ConnectedProps } from "react-redux";
import { useStore } from "effector-react";
import { toast } from "react-toastify";
import styles from "./styles.module.scss";
import { showGetStartedModal, showLoginModal } from "../../src/app/actions";
import menu from "../../src/assets/logos/menu.png";
import back from "../../src/assets/logos/back.png";
import { $menuOn, updateMenuOn } from "../../src/store/menuOn";
import { updateNet } from "../../src/store/wallet-network";
import { Block, Net } from "../../src/types/zil-pay";
import { ZilPayBase } from "./zilpay-base";
import {
  $zil_address,
  updateZilAddress,
  ZilAddress,
} from "../../src/store/zil_address";
import {
  $transactions,
  updateTxList,
  clearTxList,
  writeNewList,
} from "../../src/store/transactions";

const mapDispatchToProps = {
  dispatchShowGetStartedModal: showGetStartedModal,
  dispatchShowLogInModal: showLoginModal,
};
const connector = connect(undefined, mapDispatchToProps);
type Props = ConnectedProps<typeof connector>;

let observer: any = null;
let observerNet: any = null;
let observerBlock: any = null;

function Component(props: Props) {
  const { dispatchShowGetStartedModal, dispatchShowLogInModal } = props;

  const address = useStore($zil_address);

  const menuOn = useStore($menuOn);
  const [activeMenu, setActiveMenu] = useState("");

  const hanldeObserverState = React.useCallback((zp) => {
    if (zp.wallet.net) {
      updateNet(zp.wallet.net);
    }

    if (observerNet) {
      observerNet.unsubscribe();
    }
    if (observer) {
      observer.unsubscribe();
    }
    if (observerBlock) {
      observerBlock.unsubscribe();
    }

    observerNet = zp.wallet.observableNetwork().subscribe((net: Net) => {
      updateNet(net);
    });

    observer = zp.wallet
      .observableAccount()
      .subscribe(async (address: ZilAddress) => {
        if (address?.base16 !== address.base16) {
          updateZilAddress(address);
        }

        clearTxList();

        const cache = window.localStorage.getItem(
          String(zp.wallet.defaultAccount?.base16)
        );

        if (cache) {
          updateTxList(JSON.parse(cache));
        }
      });

    observerBlock = zp.wallet
      .observableBlock()
      .subscribe(async (block: Block) => {
        let list = $transactions.getState();
        for (let index = 0; index < block.TxHashes.length; index++) {
          const element = block.TxHashes[index];

          for (let i = 0; i < list.length; i++) {
            const tx = list[i];

            if (tx.confirmed) {
              continue;
            }

            if (element.includes(tx.hash)) {
              try {
                const res = await zp.blockchain.getTransaction(tx.hash);
                if (res && res.receipt && res.receipt.errors) {
                  tx.error = true;
                }
                list[i].confirmed = true;
              } catch {
                continue;
              }
            }
          }
        }
        const listOrPromises = list.map(async (tx) => {
          if (tx.confirmed) {
            return tx;
          }

          try {
            const res = await zp.blockchain.getTransaction(tx.hash);

            if (res && res.receipt && res.receipt.errors) {
              tx.error = true;
            }

            tx.confirmed = true;
            return tx;
          } catch {
            return tx;
          }
        });

        list = await Promise.all(listOrPromises);
        writeNewList(list);
      });

    const cache = window.localStorage.getItem(
      String(zp.wallet.defaultAccount?.base16)
    );

    if (cache) {
      updateTxList(JSON.parse(cache));
    }
  }, []);

  const login = React.useCallback(async () => {
    try {
      const wallet = new ZilPayBase();
      const zp = await wallet.zilpay();
      const connected = await zp.wallet.connect();

      const network = zp.wallet.net;
      updateNet(network);

      if (connected && zp.wallet.defaultAccount) {
        const address = zp.wallet.defaultAccount;
        updateZilAddress(address);
        dispatchShowGetStartedModal(false);
        dispatchShowLogInModal(false);
        dispatchShowLogInModal(true);
        updateMenuOn(false);
      }

      const cache = window.localStorage.getItem(
        String(zp.wallet.defaultAccount?.base16)
      );
      if (cache) {
        updateTxList(JSON.parse(cache));
      }
    } catch (err) {
      toast.error(`Connection error: ${err}`, {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
    }
  }, [dispatchShowGetStartedModal, dispatchShowLogInModal]);

  React.useEffect(() => {
    const wallet = new ZilPayBase();

    wallet
      .zilpay()
      .then((zp: any) => {
        hanldeObserverState(zp);
      })
      .catch(() => {
        toast.info(`Unlock the ZilPay browser extension.`, {
          position: "top-center",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "dark",
          toastId: 1,
        });
      });

    return () => {
      if (observer) {
        observer.unsubscribe();
      }
      if (observerNet) {
        observerNet.unsubscribe();
      }
      if (observerBlock) {
        observerBlock.unsubscribe();
      }
    };
  });

  const resetModal = () => {
    dispatchShowGetStartedModal(false);
    dispatchShowLogInModal(false);
  };

  return (
    <>
      {!menuOn ? (
        <div className={styles.button} onClick={() => updateMenuOn(true)}>
          <Image alt="menu-ico" width={25} height={25} src={menu} />
        </div>
      ) : (
        <>
          <div
            className={styles.outerWrapper}
            onClick={() => {
              updateMenuOn(false);
              setActiveMenu("");
            }}
          />
          <div className={styles.menu}>
            <div
              onClick={() => {
                updateMenuOn(false);
                setActiveMenu("");
              }}
              className={styles.back}
            >
              <Image alt="back-ico" width={25} height={25} src={back} />
            </div>
            <div className={styles.menuItemWrapper}>
              <h3
                onClick={() => {
                  resetModal();
                  dispatchShowGetStartedModal(true);
                  updateMenuOn(false);
                }}
                className={styles.menuItemText}
              >
                GET STARTED
              </h3>
              <h3 onClick={login} className={styles.menuItemText}>
                CONNECT
              </h3>
              {activeMenu !== "ssiprotocol" ? (
                <h3
                  onClick={() => setActiveMenu("ssiprotocol")}
                  className={styles.menuItemText}
                >
                  SSI PROTOCOl
                </h3>
              ) : (
                activeMenu === "ssiprotocol" && (
                  <>
                    <h3
                      onClick={() => setActiveMenu("")}
                      className={styles.menuItemTextActive}
                    >
                      SSI PROTOCOl
                    </h3>
                    <div className={styles.subMenuItemWrapper}>
                      <div
                        onClick={() =>
                          window.open("https://www.ssiprotocol.com/#/about")
                        }
                        className={styles.subMenuItemListWrapper}
                      >
                        <p className={styles.subMenuItemListText}>About</p>
                      </div>
                      <div
                        onClick={() =>
                          window.open("https://www.ssiprotocol.com/#/contact")
                        }
                        className={styles.subMenuItemListWrapper}
                      >
                        <p className={styles.subMenuItemListText}>Contact</p>
                      </div>
                      <div
                        onClick={() =>
                          window.open("https://www.ssiprotocol.com/#/wallets")
                        }
                        className={styles.subMenuItemListWrapper}
                      >
                        <p className={styles.subMenuItemListText}>DIDxWallet</p>
                      </div>
                      <div
                        onClick={() =>
                          window.open(
                            "https://ssiprotocol.notion.site/TYRON-Whitepaper-5ca16fc254b343fb90cfeb725cbfa2c3"
                          )
                        }
                        className={styles.subMenuItemListWrapper}
                      >
                        <p className={styles.subMenuItemListText}>Whitepaper</p>
                      </div>
                    </div>
                  </>
                )
              )}
              <h3
                onClick={() =>
                  window.open(
                    "https://ssiprotocol.notion.site/Frequently-Asked-Questions-6163a4186d874e90b2316d4cd827710c"
                  )
                }
                className={styles.menuItemText}
              >
                FAQ
              </h3>
            </div>
          </div>
        </>
      )}
    </>
  );
}

export default connector(Component);
