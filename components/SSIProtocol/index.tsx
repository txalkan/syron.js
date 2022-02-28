import React, { useEffect } from "react";
import { toast } from "react-toastify";
import styles from "./styles.module.scss";

function Component() {
  useEffect(() => {
    toast.warning(`For your security, make sure you're at ssibrowser.com!`, {
      position: "top-left",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: 'dark',
    });
  }, []);

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
