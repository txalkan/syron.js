import React, { useState } from "react";
import { useStore } from "effector-react";
import {
  $modalGetStarted,
  updateModalGetStarted,
} from "../../../src/store/modal";
import PowerIcon from "../../../src/assets/icons/power_icon.svg";
import ArrowDown from "../../../src/assets/icons/arrow_down_icon.svg";
import ArrowUp from "../../../src/assets/icons/arrow_up_icon.svg";
import Warning from "../../../src/assets/icons/warning.svg";
import c1 from "../../../src/assets/icons/checkpoint_1.svg";
import c2 from "../../../src/assets/icons/checkpoint_2.svg";
import c3 from "../../../src/assets/icons/checkpoint_3.svg";
import c4 from "../../../src/assets/icons/checkpoint_4.svg";
import c5 from "../../../src/assets/icons/checkpoint_5.svg";
import cs from "../../../src/assets/icons/checkpoint_selected.svg";
import Close from "../../../src/assets/icons/ic_cross.svg";
import styles from "./styles.module.scss";
import Image from "next/image";

function Component() {
  const [active, setActive] = useState(0);
  const [modalInfo, setModalInfo] = useState(false);
  const [checkedStep, setCheckedStep] = useState(Array());
  const modalGetStarted = useStore($modalGetStarted);

  const menuActive = (id) => {
    setCheckedStep([...checkedStep, active]);
    if (active === id) {
      setActive(0);
    } else {
      setActive(id);
    }
  };

  const isChecked = (id) => {
    if (checkedStep.some((val) => val === id)) {
      return true;
    } else {
      return false;
    }
  };

  if (!modalGetStarted) {
    return null;
  }

  return (
    <>
      <div
        onClick={() => updateModalGetStarted(false)}
        className={styles.outerWrapper}
      />
      <div className={active !== 0 ? styles.container2 : styles.container}>
        <div
          className={modalInfo ? styles.innerContainer2 : styles.innerContainer}
        >
          <div className={styles.headerWrapper}>
            <div
              onClick={() => updateModalGetStarted(false)}
              className={styles.closeIco}
            >
              <Image alt="ico-close" src={Close} width={15} height={15} />
            </div>
            <div>
              <Image alt="power-ico" src={PowerIcon} width={30} height={30} />
            </div>
            <h5 className={styles.headerTxt}>YOUR QUICKSTART GUIDE</h5>
          </div>
          <div className={styles.contentWrapper}>
            <div className={styles.rowWrapper}>
              <div onClick={() => menuActive(1)} className={styles.rowHeader}>
                <div className={styles.rowHeaderContent}>
                  <div>
                    {isChecked(1) ? (
                      <Image alt="point-1" src={cs} width={25} height={25} />
                    ) : (
                      <Image alt="point-1" src={c1} width={25} height={25} />
                    )}
                  </div>
                  <p className={styles.rowHeaderTitle}>Zilliqa</p>
                </div>
                <div>
                  {active === 1 ? (
                    <Image
                      alt="arrow-up"
                      src={ArrowUp}
                      width={20}
                      height={20}
                    />
                  ) : (
                    <Image
                      alt="arrow-down"
                      src={ArrowDown}
                      width={20}
                      height={20}
                    />
                  )}
                </div>
              </div>
              <div className={styles.rowContent}>
                {active === 1 ? (
                  <>
                    <p className={styles.rowContentTxt}>
                      Connect your Externally Owned Account for Zilliqa
                    </p>
                    <p className={styles.rowContentTxt}>
                      <br />
                      <br />
                      <ul className={styles.ul}>
                        <li className={styles.li}>
                          Go to{" "}
                          <a
                            className={styles.linkColor}
                            href="https://zilpay.io/"
                            target="_blank"
                            rel="noreferrer"
                          >
                            zilpay.io
                          </a>{" "}
                          and click on <strong>GET CHROME EXTENSION</strong>
                        </li>
                      </ul>
                      Once you have installed the extension, get into it
                      and click <strong>Create</strong> to generate a new account.
                      First, you will see a list of words that make up
                      your secret phrase. You have to write down these
                      words in a safe place. Remember that these words
                      must be in order and spelt correctly. You
                      can choose 12 or 24 words.
                      <br />
                      <br />
                      <ul className={styles.ul}>
                        <li className={styles.li}>
                          Click on the ZilPay icon in the list of extensions,
                          and click on Create.
                        </li>
                      </ul>
                      {modalInfo && (
                        <>
                          <div
                            onClick={() => setModalInfo(false)}
                            className={styles.outerWrapper}
                          />
                          <div className={styles.modalInfo}>
                            <h5 className={styles.modalInfoTitle}>INFO</h5>
                            <p>
                              Although the words shown at the beginning are 8, your secret phrase is made up of 12 or 24 words. To see the complete list, click between the words in the list and press the down-arrow button repeatedly on your keyboard until you see the total number of words.
                            </p>
                          </div>
                        </>
                      )}
                      <ul className={styles.ul}>
                        <li className={styles.li}>
                          You will see a list of words that make up your secret
                          phrase. You must write these words down in a safe
                          place. Remember that the words must be ordered and
                          spelt correctly. You can choose between 12 and 24
                          words
                          <Image
                            onClick={() => setModalInfo(!modalInfo)}
                            alt="warning-ico"
                            src={Warning}
                            width={20}
                            height={20}
                          />
                        </li>
                      </ul>
                      <ul className={styles.ul}>
                        <li className={styles.li}>
                          You will be asked to verify your secret phrase by clicking on the words in the right order. After doing so, click on Continue.
                        </li>
                      </ul>
                      <ul className={styles.ul}>
                        <li className={styles.li}>
                          Now it&apos;s time to create your ZilPay username and password. Then Accept PrivacyPolicy and Continue to finish.
                        </li>
                      </ul>
                    </p>
                  </>
                ) : (
                  <p className={styles.rowContentTxt}>
                    Connect your Externally Owned Account for Zilliqa
                  </p>
                )}
              </div>
            </div>
            <div className={styles.rowWrapper}>
              <div onClick={() => menuActive(2)} className={styles.rowHeader}>
                <div className={styles.rowHeaderContent}>
                  <div>
                    {isChecked(2) ? (
                      <Image alt="point-1" src={cs} width={25} height={25} />
                    ) : (
                      <Image alt="point-1" src={c2} width={25} height={25} />
                    )}
                  </div>
                  <p className={styles.rowHeaderTitle}>Arweave</p>
                </div>
                <div>
                  {active === 2 ? (
                    <Image
                      alt="arrow-up"
                      src={ArrowUp}
                      width={20}
                      height={20}
                    />
                  ) : (
                    <Image
                      alt="arrow-down"
                      src={ArrowDown}
                      width={20}
                      height={20}
                    />
                  )}
                </div>
              </div>
              <div className={styles.rowContent}>
                {active === 2 ? (
                  <>
                    <p className={styles.rowContentTxt}>
                      Connect your Externally Owned Account for Arweave
                    </p>
                    <p className={styles.rowContentTxt}>
                      <br />
                      <br />
                      <ul className={styles.ul}>
                        <li className={styles.li}>
                          Go to{" "}
                          <a
                            className={styles.linkColor}
                            href="https://www.arconnect.io/ "
                            target="_blank"
                            rel="noreferrer"
                          >
                            arconnect.io
                          </a>{" "}
                          and click on <strong>Download ArConnect</strong>
                        </li>
                      </ul>
                      Once you have installed the chrome extension, a new tab will appear where you will be asked to create a password for your new Arweave wallet, called ArConnect.
                      <br />
                      <br />
                      <ul className={styles.ul}>
                        <li className={styles.li}>
                          Generate your password, and click on Create.
                        </li>
                      </ul>
                      {modalInfo && (
                        <>
                          <div
                            onClick={() => setModalInfo(false)}
                            className={styles.outerWrapper}
                          />
                          <div className={styles.modalInfo}>
                            <h5 className={styles.modalInfoTitle}>INFO</h5>
                            <p>
                              Your SSI uses this wallet for encryption and decryption of data, and soon to make transactions on the permaweb as well!
                            </p>
                          </div>
                        </>
                      )}
                      <ul className={styles.ul}>
                        <li className={styles.li}>
                          Next, select New Wallet
                          <Image
                            onClick={() => setModalInfo(!modalInfo)}
                            alt="warning-ico"
                            src={Warning}
                            width={20}
                            height={20}
                          />
                        </li>
                      </ul>
                    </p>
                  </>
                ) : (
                  <p className={styles.rowContentTxt}>
                    Connect your Externally Owned Account for Arweave
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Component;
