import React from "react";
import { useStore } from "effector-react";
import { useRouter } from "next/router";
import { $user } from "../../src/store/user";
import styles from "./styles.module.scss";
import Image from 'next/image';
import backLogo from "../../src/assets/logos/left-arrow.png";

function Component() {
  const Router = useRouter();

  const username = useStore($user)?.name;

  return (
    <div>
      <div
        onClick={() => {
          Router.push(`/${username}`);
        }}
        className={styles.backIco}
      >
        <Image width={25} height={25} alt="back-ico" src={backLogo} />
      </div>
      <h1 className={styles.headline}>
        <span style={{ textTransform: "lowercase" }}>{username}&apos;s</span> SSI
      </h1>
    </div>
  );
}

export default Component;
