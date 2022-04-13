import React from "react";
import { connect, ConnectedProps } from "react-redux";
import { useStore } from "effector-react";
import Image from "next/image";
import * as zcrypto from "@zilliqa-js/crypto";
import { hideNewSSIModal } from "../../../src/app/actions";
import { RootState } from "../../../src/app/reducers";
import CloseIcon from "../../../src/assets/icons/ic_cross.svg";
import styles from "./styles.module.scss";
import InfoIco from "../../../src/assets/icons/info.svg";
import { $new_ssi } from "../../../src/store/new-ssi";
import { $net } from "../../../src/store/wallet-network";
import useArConnect from "../../../src/hooks/useArConnect";

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
  const { connect } = useArConnect();

  const new_ssi = useStore($new_ssi);
  const net = useStore($net);

  if (!modal) {
    return null;
  }

  const handleConnect = async () => {
    await connect();
    dispatchHideModal();
  };

  return (
    <>
      <div onClick={dispatchHideModal} className={styles.outerWrapper} />
      <div className={styles.container}>
        <div className={styles.innerContainer}>
          <div
            className={styles.closeIcon}
            onClick={() => {
              dispatchHideModal();
            }}
          >
            <Image alt="close-ico" src={CloseIcon} />
          </div>
          <div className={styles.contentWrapepr}>
            <div className={styles.headerWrapper}>
              <Image alt="info-ico" src={InfoIco} />
              <p className={styles.headerTitle}>SUCCESS!</p>
            </div>
            <p className={styles.headerSubTitle}>
              Save your new self-sovereign identity address:
            </p>
            <a
              className={styles.address}
              href={`https://viewblock.io/zilliqa/address/${new_ssi}?network=${net}`}
              rel="noreferrer"
              target="_blank"
            >
              {zcrypto.toBech32Address(new_ssi!)}
            </a>
            <button onClick={handleConnect} className={styles.btnContinue}>
              <p>CONTINUE</p>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default connector(Component);
