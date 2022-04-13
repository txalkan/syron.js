import { useStore } from "effector-react";
import { $doc } from "../../src/store/did-doc";
import { $user } from "../../src/store/user";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import styles from "./styles.module.scss";
import { $contract } from "../../src/store/contract";
import { $zil_address } from "../../src/store/zil_address";
import { updateIsController } from "../../src/store/controller";

function Component() {
  const Router = useRouter();

  const username = useStore($user)?.name as string;
  const doc = useStore($doc);
  const contract = useStore($contract);
  const controller = contract?.controller;
  const zil_address = useStore($zil_address);
  const address = zil_address?.base16.toLowerCase();

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h1 style={{ marginBottom: "10%" }}>
        <span style={{ color: "silver" }}>
          Self-sovereign identity
          <p style={{ textTransform: "lowercase", marginTop: "3%" }}>of</p>
        </span>
        <p className={styles.username}>{username}.did</p>
      </h1>
      <div
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "center",
          flexDirection: "row",
        }}
      ></div>
      <div
        style={{
          marginTop: "7%",
          width: "100%",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <h2>
            <div
              className={styles.card1}
              onClick={() => {
                Router.push(`/${username}/did`);
              }}
            >
              <p className={styles.cardTitle3}>did</p>
              <p className={styles.cardTitle2}>
                Decentralized Identifier document
              </p>
            </div>
          </h2>
          <h2>
            <div
              className={styles.card}
              onClick={() => {
                Router.push(`/${username}/recovery`);
              }}
            >
              <p className={styles.cardTitle3}>social recovery</p>
              <p className={styles.cardTitle2}>Update DID Controller</p>
            </div>
          </h2>
        </div>
        <div className={styles.xText}>
          <h5 style={{ color: "#ffff32" }}>x</h5>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <h2>
            <div
              className={styles.card1}
              onClick={() => {
                updateIsController(true);
                Router.push(`/${username}/xwallet`);

                //@todo-3
                // if (controller === address) {
                //   updateIsController(true);
                //   Router.push(`/${username}/xwallet`);
                // } else {
                //   toast.error(
                //     `Only ${username}'s DID Controller can access this wallet.`,
                //     {
                //       position: "top-right",
                //       autoClose: 3000,
                //       hideProgressBar: false,
                //       closeOnClick: true,
                //       pauseOnHover: true,
                //       draggable: true,
                //       progress: undefined,
                //       theme: "dark",
                //     }
                //   );
                // }
              }}
            >
              <p className={styles.cardTitle3}>wallet</p>
              <p className={styles.cardTitle2}>smart contract wallet</p>
            </div>
          </h2>
          <h2>
            <div
              className={styles.card}
              onClick={() => {
                if (
                  Number(doc?.version.slice(8, 9)) >= 4 ||
                  doc?.version.slice(0, 4) === "init" ||
                  doc?.version.slice(0, 3) === "dao"
                ) {
                  Router.push(`/${username}/funds`);
                } else {
                  toast.info(
                    `This feature is available from version 4. Upgrade ${username}'s SSI.`,
                    {
                      position: "top-center",
                      autoClose: 2000,
                      hideProgressBar: false,
                      closeOnClick: true,
                      pauseOnHover: true,
                      draggable: true,
                      progress: undefined,
                      theme: "dark",
                    }
                  );
                }
              }}
            >
              <p className={styles.cardTitle3}>add funds</p>
              <p className={styles.cardTitle2}>top up wallet</p>
            </div>
          </h2>
        </div>
      </div>
    </div>
  );
}

export default Component;
