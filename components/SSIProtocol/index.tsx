import React from "react";
import styles from "./styles.module.scss";

function Component() {
  const handleOnClick = () => {
    window.open("https://ssiprotocol.com");
  };

  return (
    <>
      <button className={styles.button} onClick={handleOnClick}>
        SSI Protocol
      </button>
    </>
  );
}

export default Component;
