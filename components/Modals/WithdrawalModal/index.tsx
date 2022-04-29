import CloseIcon from "../../../src/assets/icons/ic_cross.svg";
import styles from "./styles.module.scss";
import Image from "next/image";
import { useStore } from "effector-react";
import {
  $modalAddFunds,
  updateModalAddFunds,
  $selectedCurrency,
} from "../../../src/store/modal";
import { AddFunds } from "../../";

function ModalAddFunds() {
  const modalAddFunds = useStore($modalAddFunds);
  const selectedCurrency = useStore($selectedCurrency);

  if (!modalAddFunds) {
    return null;
  }

  return (
    <>
      <div className={styles.outerWrapper}>
        <div
          className={styles.containerClose}
          onClick={() => updateModalAddFunds(false)}
        />
        <div className={styles.container}>
          <div className={styles.innerContainer}>
            <div className={styles.closeIcon}>
              <Image
                alt="close-ico"
                src={CloseIcon}
                onClick={() => updateModalAddFunds(false)}
              />
            </div>
            <div className={styles.contentWrapper}>
              <AddFunds type="modal" coin={selectedCurrency!} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default ModalAddFunds;
