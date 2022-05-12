import styles from "./styles.module.scss";
import React, { useState } from "react";
import { useStore } from "effector-react";
import { $user } from "../../src/store/user";
import { updateNewMotionsModal } from "../../src/store/modal";

/*
import { useStore } from 'effector-react';
import * as tyron from 'tyron';
import { ZilPayBase } from '../ZilPay/zilpay-base';
import { $net } from 'src/store/wallet-network';

*/

function Component() {
  const user = useStore($user);
  //const net = useStore($net);
  const [hideAdd, setHideAdd] = useState(true);
  const [addLegend, setAddLegend] = useState("new motion");

  return (
    <div style={{ textAlign: "center", marginTop: "7%" }}>
      <h1 style={{ marginBottom: "10%", color: "#ffff32" }}>
        <span className={styles.x}>x</span>POINTS DApp
      </h1>
      {
        //hideList &&
        <div style={{ marginTop: "14%" }}>
          <h3 style={{ marginBottom: "7%", color: "silver" }}>
            Raise Your Voice
          </h3>
          <div style={{ marginTop: "14%" }}>
            {hideAdd ? (
              <button
                type="button"
                className={styles.button}
                onClick={() => {
                  updateNewMotionsModal(true);
                  // setHideAdd(false);
                  // setAddLegend("back");
                }}
              >
                <p className={styles.buttonText}>{addLegend}</p>
              </button>
            ) : (
              <>
                <button
                  type="button"
                  className={styles.button}
                  onClick={() => {
                    setHideAdd(true);
                    setAddLegend("new motion");
                    //handleTest();
                  }}
                >
                  <p className={styles.buttonText}>{addLegend}</p>
                </button>
              </>
            )}
          </div>
          {!hideAdd && (
            <div style={{ marginTop: "10%" }}>
              <p>
                On the TYRON Network, you are not the product, and therefore
                most transactions are free (you only have to pay for Zilliqa
                gas). But we need your help to keep developing the
                Self-Sovereign Identity Protocol as an open-source project.
              </p>
              <p>
                Donations are optional on most transactions, and the Donate DApp
                collects them. Then they get distributed as follows:
              </p>
              <ol>
                <li>80% to the Tyron Coop</li>
                <li>10% to the World Food Program</li>
                <li>10% to the Insurance Fund</li>
              </ol>
            </div>
          )}
        </div>
      }
      {hideAdd && (
        <div style={{ marginTop: "10%" }}>
          {/* <p>coming soon!</p> */}
        </div>
      )}
    </div>
  );
}

export default Component;
