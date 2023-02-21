import React from "react";
import { connect, ConnectedProps } from "react-redux";
import { hideConnectModal } from "../../../src/app/actions";
import { RootState } from "../../../src/app/reducers";
import CloseIcon from "../../../src/assets/icons/ic_cross.svg";
import styles from "./styles.module.scss";
import { ZilPay, Arweave } from "../..";
import Image from "next/image";

const mapStateToProps = (state: RootState) => ({
  modal: state.modal.connectModal,
});

const mapDispatchToProps = {
  dispatchHideModal: hideConnectModal,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

type ModalProps = ConnectedProps<typeof connector>;

function ConnectModal(props: ModalProps) {
  const { dispatchHideModal, modal } = props;

  if (!modal) {
    return null;
  }

  return (
    <div className={styles.container}>
      <div className={styles.innerContainer}>
        <div className={styles.closeIcon}>
          <Image
            alt="close-ico"
            src={CloseIcon}
            onClick={() => {
              dispatchHideModal();
            }}
          />
        </div>
        <ZilPay />
        <Arweave />
      </div>
    </div>
  );
}

export default connect(mapStateToProps, mapDispatchToProps)(ConnectModal);

// @todo-2 disconnect
