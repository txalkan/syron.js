import React from "react";
import { connect, ConnectedProps } from "react-redux";
import styles from "./styles.module.scss";
import { showArweaveModal } from "../../src/app/actions";
import { RootState } from "../../src/app/reducers";
import { ArweaveModal } from "..";
import thunder from "../../src/assets/logos/thunder.png";
import Image from "next/image";

const mapStateToProps = (state: RootState) => ({
  modal: state.modal.arweaveModal,
});
const mapDispatchToProps = {
  dispatchShowModal: showArweaveModal,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

type Props = ConnectedProps<typeof connector>;

function SignIn(props: Props) {
  const { dispatchShowModal, modal } = props;

  const handleOnClick = () => {
    dispatchShowModal();
  };

  return (
    <>
      <ArweaveModal />
      {!modal ? (
        <button type="button" className={styles.button} onClick={handleOnClick}>
          <div className={styles.logo}>
            <Image alt="thunder-logo" src={thunder} />
          </div>
          <p className={styles.buttonText}>SSI private key</p>
        </button>
      ) : (
        <></>
      )}
    </>
  );
}

export default connector(SignIn);
