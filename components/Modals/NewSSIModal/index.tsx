import { connect, ConnectedProps, useSelector } from "react-redux";
import { useStore } from "effector-react";
import Image from "next/image";
import * as zcrypto from "@zilliqa-js/crypto";
import { setSsiModal } from "../../../src/app/actions";
import { RootState } from "../../../src/app/reducers";
import CloseIcon from "../../../src/assets/icons/ic_cross.svg";
import styles from "./styles.module.scss";
import InfoIco from "../../../src/assets/icons/info.svg";
import { $net } from "../../../src/store/wallet-network";
import { BuyNFTSearchBar } from "../..";

const mapStateToProps = (state: RootState) => ({
  modal: state.modal.newSSIModal,
});

const mapDispatchToProps = {
  dispatchShowModal: setSsiModal,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

type ModalProps = ConnectedProps<typeof connector>;

function Component(props: ModalProps) {
  const { dispatchShowModal, modal } = props;
  const loginInfo = useSelector((state: RootState) => state.modal);
  const net = useStore($net);

  if (!modal) {
    return null;
  }

  return (
    <>
      <div
        onClick={() => dispatchShowModal(false)}
        className={styles.outerWrapper}
      />
      <div className={styles.container}>
        <div className={styles.innerContainer}>
          <div
            className={styles.closeIcon}
            onClick={() => {
              dispatchShowModal(false);
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
              You have a new self-sovereign identity! The address of your
              DIDxWallet is:
            </p>
            <a
              className={styles.address}
              href={`https://devex.zilliqa.com/address/${
                loginInfo.address
              }?network=https%3A%2F%2F${
                net === "mainnet" ? "" : "dev-"
              }api.zilliqa.com`}
              rel="noreferrer"
              target="_blank"
            >
              {zcrypto.toBech32Address(loginInfo.address)}
            </a>
            <BuyNFTSearchBar />
          </div>
        </div>
      </div>
    </>
  );
}

export default connector(Component);
