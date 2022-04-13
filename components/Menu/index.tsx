import React, { useState } from "react";
import Image from "next/image";
import { connect, ConnectedProps } from "react-redux";
import { useStore } from "effector-react";
import styles from "./styles.module.scss";
import { showGetStartedModal, showLoginModal } from "../../src/app/actions";
import menu from "../../src/assets/logos/menu.png";
import back from "../../src/assets/logos/back.png";
import { $menuOn, updateMenuOn } from "../../src/store/menuOn";

const mapDispatchToProps = {
  dispatchShowGetStartedModal: showGetStartedModal,
  dispatchShowLogInModal: showLoginModal,
};
const connector = connect(undefined, mapDispatchToProps);
type Props = ConnectedProps<typeof connector>;

function Component(props: Props) {
  const { dispatchShowGetStartedModal, dispatchShowLogInModal } = props;

  const menuOn = useStore($menuOn);
  const [activeMenu, setActiveMenu] = useState("");

  const login = () => {
    dispatchShowLogInModal(true);
    updateMenuOn(false);
  };

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
