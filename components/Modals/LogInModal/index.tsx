import React, { useState } from "react";
import { connect, ConnectedProps } from "react-redux";
import { useStore } from "effector-react";
import { showLoginModal, showNewSSIModal } from "../../../src/app/actions";
import { RootState } from "../../../src/app/reducers";
import CloseIcon from "../../../src/assets/icons/ic_cross.svg";
import ZilpayIco from "../../../src/assets/logos/lg_zilpay.svg";
import styles from "./styles.module.scss";
import Image from "next/image";
import { $zil_address } from "../../../src/store/zil_address";
import { updateNewSSI } from "../../../src/store/new-ssi";
import { $net } from "../../../src/store/wallet-network";
import { ZilPayBase } from "../../ZilPay/zilpay-base";
import { HTTPProvider } from "@zilliqa-js/core";
import { Transaction } from "@zilliqa-js/account";
import { BN, Long } from "@zilliqa-js/util";
import { randomBytes, toChecksumAddress } from "@zilliqa-js/crypto";
import { useDispatch } from "react-redux";
import {
  setTxStatusLoading,
  showTxStatusModal,
  setTxId,
  hideTxStatusModal,
} from "../../../src/app/actions";
import * as zcrypto from "@zilliqa-js/crypto";
import { toast } from "react-toastify";

const mapStateToProps = (state: RootState) => ({
  modal: state.modal.loginModal,
});

const mapDispatchToProps = {
  dispatchLoginModal: showLoginModal,
  dispatchShowNewSsiModal: showNewSSIModal,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

type ModalProps = ConnectedProps<typeof connector>;

function Component(props: ModalProps) {
  const { dispatchLoginModal, dispatchShowNewSsiModal, modal } = props;

  const dispatch = useDispatch();
  const address = useStore($zil_address);
  const net = useStore($net);
  const [loadingSsi, setLoadingSsi] = useState(false);

  const newSsi = async () => {
    if (address !== null && net !== null) {
      setLoadingSsi(true);
      const zilpay = new ZilPayBase();

      const generateChecksumAddress = () => toChecksumAddress(randomBytes(20));
      let endpoint = "https://api.zilliqa.com/";
      if (net === "testnet") {
        endpoint = "https://dev-api.zilliqa.com/";
      }
      let tx = new Transaction(
        {
          version: 0,
          toAddr: generateChecksumAddress(),
          amount: new BN(0),
          gasPrice: new BN(1000),
          gasLimit: Long.fromNumber(1000),
        },
        new HTTPProvider(endpoint)
      );
      dispatch(showLoginModal(false));
      dispatch(setTxStatusLoading("true"));
      dispatch(showTxStatusModal());

      await zilpay
        .deployDid(net, address.base16)
        .then(async (deploy: any) => {
          dispatch(setTxId(deploy[0].ID));
          dispatch(setTxStatusLoading("submitted"));

          tx = await tx.confirm(deploy[0].ID);
          if (tx.isConfirmed()) {
            dispatch(setTxStatusLoading("confirmed"));
            setTimeout(() => {
              window.open(
                `https://viewblock.io/zilliqa/tx/${deploy[0].ID}?network=${net}`
              );
            }, 1000);
            let new_ssi = deploy[1].address;
            new_ssi = zcrypto.toChecksumAddress(new_ssi);
            updateNewSSI(new_ssi);
            /** @todo-checked
             * wait until contract deployment gets confirmed
             * add spinner
             * */
            setLoadingSsi(false);
            /**
             * @todo-checked close New SSI modal so the user can see the search bar and the following message.
             */
            dispatch(hideTxStatusModal());
            dispatchShowNewSsiModal();
          } else if (tx.isRejected()) {
            dispatch(hideTxStatusModal());
            dispatch(setTxStatusLoading("idle"));
            toast.error("Transaction failed.", {
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
        })
        .catch((error) => {
          dispatch(setTxStatusLoading("idle"));
          setLoadingSsi(false);
          toast.error(String(error), {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "dark",
          });
        });
    } else {
      toast.warning("Connect your ZilPay wallet.", {
        position: "top-center",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
    }
  };

  if (!modal) {
    return null;
  }

  return (
    <>
      <div
        onClick={() => dispatchLoginModal(false)}
        className={styles.outerWrapper}
      />
      <div className={styles.container}>
        <div className={styles.innerContainer}>
          <div
            className={styles.closeIcon}
            onClick={() => {
              dispatchLoginModal(false);
            }}
          >
            <Image alt="close-ico" src={CloseIcon} />
          </div>
          <div className={styles.headerModal}>
            <h3>YOUR ZILLIQA WALLET IS CONNECTED</h3>
            <div className={styles.zilpayAddrWrapper}>
              <Image width={20} height={20} alt="zilpay-ico" src={ZilpayIco} />
              <p className={styles.zilpayAddr}>
                {address?.bech32.slice(0, 6)}...{address?.bech32.slice(-6)}
              </p>
            </div>
          </div>
          <div className={styles.contentWrapper}>
            <div>
              <h3>EXISTING SSI</h3>
              <div className={styles.inputWrapper}>
                <h5>NFT USERNAME</h5>
                <input className={styles.input} />
              </div>
              <h6 className={styles.txtOr}>OR</h6>
              <div>
                <h5>ADDRESS</h5>
                <input className={styles.input} />
              </div>
              <button className={styles.btnContinue}>
                <p>CONTINUE</p>
              </button>
            </div>
            <div className={styles.separator} />
            <div>
              <h3>NEW USER - CREATE AN SSI</h3>
              <p className={styles.newSsiSub}>
                Deploy a brand new Self-Sovereign Identity
              </p>
              <button onClick={newSsi} className={styles.btnContinueSsi}>
                {loadingSsi ? (
                  <i
                    className="fa fa-lg fa-spin fa-circle-notch"
                    aria-hidden="true"
                  ></i>
                ) : (
                  <>
                    <span className="label">&#9889;</span>
                    <p className={styles.btnContinueSsiTxt}>NEW SSI</p>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default connector(Component);
