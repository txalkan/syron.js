import React, { useState } from "react";
import Image from "next/image";
import { connect, ConnectedProps } from "react-redux";
import { useStore } from "effector-react";
import { toast } from "react-toastify";
import styles from "./styles.module.scss";
import { showNewWalletModal, showSignInModal } from "../../src/app/actions";
import { $zil_address } from "../../src/store/zil_address";
import menu from "../../src/assets/logos/menu.png"
import back from "../../src/assets/logos/back.png"
import zilpay from "../../src/assets/logos/lg_zilpay.svg"
import thunder from "../../src/assets/logos/thunder.png"
import ConnectModal from "../Modals/ConnectModal";
import NewWalletModal from "../Modals/NewWalletModal";
import TransactionStatus from "../Modals/TransactionStatus";

const mapDispatchToProps = {
  dispatchShowSSIModal: showNewWalletModal,
  dispatchShowSignInModal: showSignInModal,
};

const connector = connect(undefined, mapDispatchToProps);

type Props = ConnectedProps<typeof connector>;

function Component(props: Props) {
  const { dispatchShowSSIModal, dispatchShowSignInModal } = props;
  const address = useStore($zil_address);

  const [showMenu, setShowMenu] = useState(false);
  const [activeMenu, setActiveMenu] = useState("");

  const showSignInModal = () => {
    dispatchShowSignInModal();
    setShowMenu(false);
    if (address === null) {
      toast.info(`Connect your ZilPay wallet`, {
        position: "top-center",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: 'dark',
      });
    }
  }

  return (
    <>
      <ConnectModal />
      <NewWalletModal />
      <TransactionStatus />
      {!showMenu ? (
        <div className={styles.button} onClick={() => setShowMenu(true)}>
          <Image alt="menu-ico" width={25} height={25} src={menu} />
        </div>
      ) : (
        <div className={styles.menu}>
          <div onClick={() => { setShowMenu(false); setActiveMenu("") }} className={styles.back}>
            <Image alt="back-ico" width={25} height={25} src={back} />
          </div>
          <div className={styles.menuItemWrapper}>
            {activeMenu !== "connect" ? (
              <h3 onClick={showSignInModal} className={styles.menuItemText}>CONNECT</h3>
            ) : activeMenu === "connect" && (
              <>
                <h3 onClick={() => setActiveMenu("")} className={styles.menuItemTextActive}>CONNECT</h3>
                <div className={styles.subMenuItemWrapper}>
                  <div className={styles.subMenuItemListWrapper}>
                    <Image alt="zilpay-ico" width={25} height={25} src={zilpay} />
                    <text className={styles.subMenuItemListText}>Zilpay</text>
                  </div>
                  <div className={styles.subMenuItemListWrapper}>
                    <Image alt="thunder-ico" width={25} height={25} src={thunder} />
                    <text className={styles.subMenuItemListText}>SSI Private Key</text>
                  </div>
                </div>
              </>
            )}
            <h3 onClick={() => { dispatchShowSSIModal(); setShowMenu(false) }} className={styles.menuItemText}>NEW SSI</h3>
            {activeMenu !== "ssiprotocol" ? (
              <h3 onClick={() => setActiveMenu("ssiprotocol")} className={styles.menuItemText}>SSI PROTOCOl</h3>
            ) : activeMenu === "ssiprotocol" && (
              <>
                <h3 onClick={() => setActiveMenu("")} className={styles.menuItemTextActive}>SSI PROTOCOl</h3>
                <div className={styles.subMenuItemWrapper}>
                  <div onClick={() => window.open("https://www.ssiprotocol.com/#/about")} className={styles.subMenuItemListWrapper}>
                    <text className={styles.subMenuItemListText}>About</text>
                  </div>
                  <div onClick={() => window.open("https://www.ssiprotocol.com/#/contact")} className={styles.subMenuItemListWrapper}>
                    <text className={styles.subMenuItemListText}>Contact</text>
                  </div>
                  <div onClick={() => window.open("https://www.ssiprotocol.com/#/wallets")} className={styles.subMenuItemListWrapper}>
                    <text className={styles.subMenuItemListText}>DIDxWallet</text>
                  </div>
                  <div onClick={() => window.open("https://ssiprotocol.notion.site/TYRON-Whitepaper-5ca16fc254b343fb90cfeb725cbfa2c3")} className={styles.subMenuItemListWrapper}>
                    <text className={styles.subMenuItemListText}>Whitepaper</text>
                  </div>
                </div>
              </>
            )}
            <h3 onClick={() => window.open("https://ssiprotocol.notion.site/Frequently-Asked-Questions-6163a4186d874e90b2316d4cd827710c")} className={styles.menuItemText}>FAQ</h3>
          </div>
        </div>
      )}
    </>
  );
}

export default connector(Component);