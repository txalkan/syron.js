import React from "react";
import styles from "./styles.module.scss";

function FAQ() {
  const handleOnClick = () => {
    window.open(
      "https://ssiprotocol.notion.site/Frequently-Asked-Questions-6163a4186d874e90b2316d4cd827710c"
    );
  };

  return (
    <>
      <button className={styles.button} onClick={handleOnClick}>
        FAQ
      </button>
    </>
  );
}

export default FAQ;
