import React from "react";
import { connect, ConnectedProps } from "react-redux";
import { useStore } from "effector-react";
import { toast } from "react-toastify";
import { hideTxStatusModal } from "../../../src/app/actions";
import { RootState } from "../../../src/app/reducers";
import { $net } from "../../../src/store/wallet-network";
import CloseIcon from "../../../src/assets/icons/ic_cross.svg";
import styles from "./styles.module.scss";
import Image from "next/image";

const mapStateToProps = (state: RootState) => ({
  modal: state.modal.txStatusModal,
  loading: state.modal.txStatusLoading,
  txId: state.modal.txId,
});

const mapDispatchToProps = {
  dispatchHideModal: hideTxStatusModal,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

type ModalProps = ConnectedProps<typeof connector>;

function TransactionStatus(props: ModalProps) {
  const { dispatchHideModal, modal, loading, txId } = props;
  const net = useStore($net);

  const hideModal = () => {
    if (loading !== "confirmed") {
      toast.error("Please wait the transaction first.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: 'dark',
      });
    } else {
      dispatchHideModal();
    }
  }

  const spinner = (
    <i className="fa fa-lg fa-spin fa-circle-notch" aria-hidden="true"></i>
  );

  const tx = (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      {loading !== "true" &&
        <h5>
          Transaction ID:{" "}
          <a
            href={`https://viewblock.io/zilliqa/tx/${txId}?network=${net}`}
            rel="noreferrer"
            target="_blank"
          >
            {txId.slice(0, 22)}...
          </a>
        </h5>
      }
      <h5>{loading === "true" ? "Signing..." : loading === "submitted" ? "Submitted, confirming your transaction" : loading === "confirmed" ? "Transaction successfully confirmed!" : ""}</h5>
      {loading !== "idle" && loading !== "confirmed" && spinner}
    </div>
  );

  if (!modal) {
    return null;
  }

  return (
    <>
      <div onClick={hideModal} className={styles.outerWrapper} />
      <div className={styles.container}>
        <div className={styles.innerContainer}>
          <div className={styles.closeIcon}>
            <Image
              alt="close-ico"
              src={CloseIcon}
              onClick={hideModal}
            />
          </div>
          <div style={{ marginTop: '2%', marginBottom: '5%' }}>
            {tx}
          </div>
        </div>
      </div>
    </>
  );
}

export default connect(mapStateToProps, mapDispatchToProps)(TransactionStatus);

// @todo-2 disconnect