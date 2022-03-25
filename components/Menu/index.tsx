import React, { useState } from "react";
import Image from "next/image";
import { connect, ConnectedProps } from "react-redux";
import { useStore } from "effector-react";
import { toast } from "react-toastify";
import styles from "./styles.module.scss";
import { showNewSSIModal, showConnectModal } from "../../src/app/actions";
import { $zil_address } from "../../src/store/zil_address";
import menu from "../../src/assets/logos/menu.png"
import back from "../../src/assets/logos/back.png"
import { ConnectModal, NewSSIModal } from "../";
import TransactionStatus from "../Modals/TransactionStatus";

const mapDispatchToProps = {
  dispatchShowSSIModal: showNewSSIModal,
  dispatchShowConnectModal: showConnectModal,
};
const connector = connect(undefined, mapDispatchToProps);
type Props = ConnectedProps<typeof connector>;

function Component(props: Props) {
  const { dispatchShowSSIModal, dispatchShowConnectModal } = props;

  const address = useStore($zil_address);
  const [showMenu, setShowMenu] = useState(false);
  const [activeMenu, setActiveMenu] = useState("");

  const showConnectModal = () => {
    dispatchShowConnectModal();
    setShowMenu(false);
    if (address === null) {
      toast.warning('Connect your ZilPay wallet.', {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: 'dark',
      });
    } else {
      toast.info(`ZilPay wallet connected to ${address?.bech32.slice(0, 6)}...${address?.bech32.slice(-6)}`, {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: 'dark',
        toastId: 2,
      });
    }
  }

  return (
    <>
      <ConnectModal />
      <NewSSIModal />
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
            <h3 onClick={showConnectModal} className={styles.menuItemText}>CONNECT</h3>
            <h3 onClick={() => window.open("https://ssiprotocol.notion.site/Frequently-Asked-Questions-6163a4186d874e90b2316d4cd827710c")} className={styles.menuItemText}>FAQ</h3>
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
          </div>
        </div>
      )}
    </>
  );
}

export default connector(Component);