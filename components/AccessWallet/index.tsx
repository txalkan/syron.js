import React from "react";
import { useRouter } from "next/router";
import { useStore } from "effector-react";
import { $isAdmin, updateIsAdmin } from "../../src/store/admin";
import { $user } from "../../src/store/user";
import styles from "./styles.module.scss";

function Component() {
  const Router = useRouter();
  const is_admin = useStore($isAdmin);
  const user = useStore($user);

  const handleShow = () => {
    Router.push(`/${user?.name}/xwallet`);
  };
  const handleHide = () => {
    Router.back();
    setTimeout(() => {
      updateIsAdmin({
        verified: true,
        hideWallet: true,
      });
    }, 100);
  };

  return (
    <>
      {is_admin?.verified && is_admin.hideWallet && (
        <button type="button" className={styles.button} onClick={handleShow}>
          <p className={styles.buttonShow}>deprecated</p>
        </button>
      )}
      {is_admin?.verified && !is_admin.hideWallet && (
        <button type="button" className={styles.button} onClick={handleHide}>
          <p className={styles.buttonHide}>deprecated</p>
        </button>
      )}
    </>
  );
}

export default Component;
