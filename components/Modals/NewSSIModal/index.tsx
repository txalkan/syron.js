import React from "react";
import { connect, ConnectedProps } from "react-redux";
import { hideNewSSIModal } from "../../../src/app/actions";
import { RootState } from "../../../src/app/reducers";
import CloseIcon from "../../../src/assets/icons/ic_cross.svg";
import styles from "./styles.module.scss";
import { DeployDid } from "../../index";
import Image from "next/image";

const mapStateToProps = (state: RootState) => ({
  modal: state.modal.newSSIModal,
});

const mapDispatchToProps = {
  dispatchHideModal: hideNewSSIModal,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

type ModalProps = ConnectedProps<typeof connector>;

function Component(props: ModalProps) {
  const { dispatchHideModal, modal } = props;

  if (!modal) {
    return null;
  }

  return (
    <>
      <div className={styles.container}>
        <div className={styles.innerContainer}>
          <div
            className={styles.closeIcon}
            /** @todo change X in close icon for silver color */
            onClick={() => {
              dispatchHideModal();
            }}
          >
            <Image alt="close-ico" src={CloseIcon} />
          </div>
          <DeployDid />
        </div>
      </div>
    </>
  );
}

export default connector(Component);
