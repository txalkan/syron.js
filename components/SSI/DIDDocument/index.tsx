import { useStore } from "effector-react";
import React from "react";
import { $user } from "../../../src/store/user";
import { updateSSIInterface } from "../../../src/store/ssi_interface";
import styles from "./styles.module.scss";
import { useRouter } from 'next/router'

function Component() {
  const username = useStore($user)?.name;
  const Router = useRouter()

  return (
    <div style={{ marginTop: "14%", display: 'flex' }}>
      <div
        className={styles.card}
        onClick={() => {
          updateSSIInterface("")
          Router.push(`/${username}/did/keys`)
        }}
      >
        <p className={styles.cardTitle}>
          KEYS
        </p>
        <p className={styles.cardTitle2}>
          COMPONENT SHORT DESCRIPTION
        </p>
      </div>
      <div
        className={styles.card}
        onClick={() => {
          updateSSIInterface("")
          Router.push(`/${username}/did/services`)
        }}
      >
        <p className={styles.cardTitle}>
          SERVICES
        </p>
        <p className={styles.cardTitle2}>
          COMPONENT SHORT DESCRIPTION
        </p>
      </div>
    </div>
  );
}

export default Component;
