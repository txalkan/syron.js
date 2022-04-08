import React from "react";
import styles from "./styles.module.scss";

function Component() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        textAlign: "center",
      }}
    >
      <h2 className={styles.title}>Peer to Peer Page</h2>
    </div>
  );
}

export default Component;
