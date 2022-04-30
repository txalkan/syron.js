import styles from "./styles.module.scss";
import Image from "next/image";
import { useStore } from "effector-react";
import {
  $modalWithdrawal,
  updateModalWithdrawal,
} from "../../../src/store/modal";
import { Withdrawals } from "../../";
import Close from "../../../src/assets/icons/ic_cross.svg";

function Modal() {
  const modalWithdrawal = useStore($modalWithdrawal);

  if (!modalWithdrawal) {
    return null;
  }

  return (
    <>
      <div className={styles.outerWrapper}>
        <div
          className={styles.containerClose}
          onClick={() => updateModalWithdrawal(false)}
        />
        <div className={styles.container}>
          <div className={styles.innerContainer}>
            <div className={styles.closeIcon}>
              <Image
                alt="close-ico"
                src={Close}
                onClick={() => updateModalWithdrawal(false)}
              />
            </div>
            <h2>
              Withdraw funds from your DID
              <span style={{ textTransform: "lowercase" }}>x</span>Wallet
            </h2>
            <div className={styles.contentWrapper}>
              <Withdrawals />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Modal;
