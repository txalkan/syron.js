import React from "react";
import { connect, ConnectedProps } from "react-redux";
import { hideConnectModal, hideArweaveModal } from "../../../src/app/actions";
import { RootState } from "../../../src/app/reducers";
import CloseIcon from "../../../src/assets/icons/ic_cross.svg";
import BackIco from "../../../src/assets/logos/left-arrow.png";
import styles from "./styles.module.scss";
import { ArConnect, KeyFile } from "../../index";
import Image from "next/image";

const mapStateToProps = (state: RootState) => ({
  modal: state.modal.arweaveModal,
});

const mapDispatchToProps = {
  dispatchHideSignInModal: hideConnectModal,
  dispatchHideSsiKeyModal: hideArweaveModal,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

type ModalProps = ConnectedProps<typeof connector>;

function SsiKeyModal(props: ModalProps) {
  const { dispatchHideSignInModal, dispatchHideSsiKeyModal, modal } = props;

  if (!modal) {
    return null;
  }

  return (
    <>
      <div className={styles.container}>
        <div className={styles.innerContainer}>
          <div
            style={{
              width: "100%",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <div className={styles.closeIcon}>
              <Image
                alt="back-ico"
                src={BackIco}
                onClick={() => dispatchHideSsiKeyModal()}
              />
            </div>
            <div className={styles.closeIcon}>
              <Image
                alt="close-ico"
                src={CloseIcon}
                onClick={() => {
                  dispatchHideSignInModal();
                  dispatchHideSsiKeyModal();
                }}
              />
            </div>
          </div>
          <ArConnect />
          <KeyFile />
        </div>
      </div>
    </>
  );
}

export default connector(SsiKeyModal);
