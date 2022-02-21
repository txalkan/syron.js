import React from "react";
import { connect, ConnectedProps } from "react-redux";
import styles from "./styles.module.scss";
import { showNewWalletModal } from "../../src/app/actions";
import { NewWalletModal } from "..";

const mapDispatchToProps = {
  dispatchShowModal: showNewWalletModal,
};

const connector = connect(undefined, mapDispatchToProps);

type Props = ConnectedProps<typeof connector>;

function Component(props: Props) {
  const { dispatchShowModal } = props;

  const handleOnClick = () => {
    dispatchShowModal();
  };

  return (
    <div className={styles.container}>
      <button className={styles.button} onClick={handleOnClick}>
        new ssi
      </button>
      <NewWalletModal />
    </div>
  );
}

export default connector(Component);
