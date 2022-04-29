import CloseIcon from "../../../src/assets/icons/ic_cross.svg";
import styles from "./styles.module.scss";
import Image from "next/image";
import { useStore } from "effector-react";
import {
  $modalWithdrawal,
  updateModalWithdrawal,
} from "../../../src/store/modal";
import { Withdrawals } from "../../";

function ModalAddFunds() {
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
                src={CloseIcon}
                onClick={() => updateModalWithdrawal(false)}
              />
            </div>
            <div className={styles.contentWrapper}>
              <Withdrawals />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default ModalAddFunds;
