import React, { useState } from "react";
import Image from "next/image";
import styles from "./styles.module.scss";
import menu from "../../src/assets/logos/menu.png"
import back from "../../src/assets/logos/back.png"

function Component() {
  const [showMenu, setShowMenu] = useState(false)
  return (
    <>
      {!showMenu ? (
        <div className={styles.button} onClick={() => setShowMenu(true)}>
          <Image width={25} height={25} src={menu} />
        </div>
      ) : (
        <div className={styles.menu} onClick={() => setShowMenu(false)}>
          <div className={styles.back}>
            <Image width={25} height={25} src={back} />
          </div>
        </div>
      )}
    </>
  );
}

export default Component;