import React from "react";
import { useStore } from "effector-react";
import {
  $modalTxMinimized,
  updateModalTx,
  updateModalTxMinimized,
} from "../../../../src/store/modal";
import Arrow from "../../../../src/assets/logos/left-up.png";
import styles from "./styles.module.scss";
import Image from "next/image";

function Component() {
  const modalTxMinimized = useStore($modalTxMinimized);

  const restore = () => {
    updateModalTxMinimized(false);
    updateModalTx(true);
  };

  if (!modalTxMinimized) {
    return null;
  }

  return (
    <>
      <div className={styles.container}>
        <div className={styles.innerContainer}>
          <div className={styles.headerWrapper}>
            <div onClick={restore} className={styles.closeIco}>
              <Image alt="ico-restore" src={Arrow} width={20} height={20} />
            </div>
            <h5 className={styles.headerTxt}>Transaction Status</h5>
          </div>
        </div>
      </div>
    </>
  );
}

export default Component;
