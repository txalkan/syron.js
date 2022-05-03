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
      <div className={styles.container}>
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
                  <div className={styles.rowHeaderTitle}>Zilliqa</div>
                </div>
                <div className={styles.wrapperDropdownIco}>
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
                      Once you have installed the extension, get into it and
                      click <strong>Create</strong> to generate a new account.
                      First, you will see a list of words that make up your
                      secret phrase. You have to write down these words in a
                      safe place. Remember that these words must be in order and
                      spelt correctly. You can choose 12 or 24 words.
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
                              Although the words shown at the beginning are 8,
                              your secret phrase is made up of 12 or 24 words.
                              To see the complete list, click between the words
                              in the list and press the down-arrow button
                              repeatedly on your keyboard until you see the
                              total number of words.
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
                          You will be asked to verify your secret phrase by
                          clicking on the words in the right order. After doing
                          so, click on Continue.
                        </li>
                      </ul>
                      <ul className={styles.ul}>
                        <li className={styles.li}>
                          Now it&apos;s time to create your ZilPay username and
                          password. Then Accept PrivacyPolicy and Continue to
                          finish.
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
                  <div className={styles.rowHeaderTitle}>Arweave</div>
                </div>
                <div className={styles.wrapperDropdownIco}>
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
                      Once you have installed the chrome extension, a new tab
                      will appear where you will be asked to create a password
                      for your new Arweave wallet, called ArConnect.
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
                              Your SSI uses this wallet for encryption and
                              decryption of data, and soon to make transactions
                              on the permaweb as well!
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
            <div className={styles.rowWrapper}>
              <div onClick={() => menuActive(3)} className={styles.rowHeader}>
                <div className={styles.rowHeaderContent}>
                  <div>
                    {isChecked(3) ? (
                      <Image alt="point-3" src={cs} width={25} height={25} />
                    ) : (
                      <Image alt="point-3" src={c3} width={25} height={25} />
                    )}
                  </div>
                  <div className={styles.rowHeaderTitle}>Tyron</div>
                </div>
                <div className={styles.wrapperDropdownIco}>
                  {active === 3 ? (
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
                {active === 3 ? (
                  <>
                    <p className={styles.rowContentTxt}>
                      Create your self-sovereign identity
                    </p>
                    <p className={styles.rowContentTxt}>
                      <br />
                      <br />
                      {modalInfo && (
                        <>
                          <div
                            onClick={() => setModalInfo(false)}
                            className={styles.outerWrapper}
                          />
                          <div className={styles.modalInfo}>
                            <h5 className={styles.modalInfoTitle}>INFO</h5>
                            <p>
                              Your Zilliqa wallet needs to have at least 70 ZIL
                              since the gas limit to deploy a new contract
                              (contract creation) is 35,000 units of gas at
                              0.002 ZIL per unit (which is the minimum possible
                              blockchain gas price). However, the actual
                            </p>
                          </div>
                        </>
                      )}
                      <ul className={styles.ul}>
                        <li className={styles.li}>
                          On the SSI Browser, click on <strong>CONNECT</strong>{" "}
                          and approve the connection between your Zilliqa wallet
                          and the SSI Browser open-source web application.
                        </li>
                      </ul>
                      <ul className={styles.ul}>
                        <li className={styles.li}>
                          Click on <strong>LOG IN</strong> and then{" "}
                          <strong>NEW SSI</strong>. This step will connect your
                          Arweave wallet as well.
                        </li>
                      </ul>
                      The cost to create your SSI is around 1 ZIL
                      <Image
                        onClick={() => setModalInfo(!modalInfo)}
                        alt="warning-ico"
                        src={Warning}
                        width={20}
                        height={20}
                      />
                      <br />
                      <br />
                      <ul className={styles.ul}>
                        <li className={styles.li}>
                          <strong>Confirm</strong> with the ZilPay.
                        </li>
                      </ul>
                      Once the transaction is confirmed, a window will appear
                      indicating that the transaction was successful.
                      <br />
                      <br />
                      <ul className={styles.ul}>
                        <li className={styles.li}>
                          Click on your new self-sovereign identity address and
                          explore its data on Devex.
                        </li>
                      </ul>
                    </p>
                  </>
                ) : (
                  <p className={styles.rowContentTxt}>
                    Create your self-sovereign identity
                  </p>
                )}
              </div>
            </div>
            <div className={styles.rowWrapper}>
              <div onClick={() => menuActive(4)} className={styles.rowHeader}>
                <div className={styles.rowHeaderContent}>
                  <div>
                    {isChecked(4) ? (
                      <Image alt="point-4" src={cs} width={25} height={25} />
                    ) : (
                      <Image alt="point-4" src={c4} width={25} height={25} />
                    )}
                  </div>
                  <div className={styles.rowHeaderTitle}>Buy NFT Username</div>
                </div>
                <div className={styles.wrapperDropdownIco}>
                  {active === 4 ? (
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
                {active === 4 ? (
                  <>
                    <p className={styles.rowContentTxt}>
                      Search for any username that you wish to buy with your
                      self-sovereign identity.
                    </p>
                    <p className={styles.rowContentTxt}>
                      <br />
                      <br />
                      If the name is available, you can buy it with your SSI
                      (either a new contract or an existing SSI).
                      <br />
                      <br />
                      <ul className={styles.ul}>
                        <li className={styles.li}>
                          Click on <strong>Select recipient</strong> and choose{" "}
                          <strong>This SSI</strong> to buy the NFT Username with
                          your SSI. Alternatively, you can buy this username and
                          assign it to any other address by selecting{" "}
                          <strong>Another address</strong>.
                        </li>
                      </ul>
                      - Buying the username to assign it to your SSI
                      <br />
                      <br />
                      <ul className={styles.ul}>
                        <li className={styles.li}>
                          Choose a payment option in{" "}
                          <strong>Select payment</strong>.
                        </li>
                      </ul>
                      If you are using a new SSI, new contracts do not yet have
                      the funds to purchase a Username. Therefore you must add
                      funds to the new SSI before proceeding. Read “Add funds”
                      to learn how.
                      <br />
                      <br />
                      - Assigning the username to another address
                      <br />
                      <br />
                      <ul className={styles.ul}>
                        <li className={styles.li}>
                          Type the address and <strong>SAVE</strong>.
                        </li>
                      </ul>
                      <ul className={styles.ul}>
                        <li className={styles.li}>
                          Then, choose a payment option in{" "}
                          <strong>Select payment</strong>.
                        </li>
                      </ul>
                      <ul className={styles.ul}>
                        <li className={styles.li}>
                          Next, follow the steps in “Add funds”.
                        </li>
                      </ul>
                      ADD FUNDS
                      <br />
                      <br />
                      <ul className={styles.ul}>
                        <li className={styles.li}>
                          In the ADD FUNDS section, click on{" "}
                          <strong>Select originator</strong> and select{" "}
                          <strong>ZilPay</strong> to add funds into your SSI
                          from your ZilPay wallet. You can also add funds from
                          any other <strong>self-sovereign identity</strong>{" "}
                          that you control.
                        </li>
                      </ul>
                      <ul className={styles.ul}>
                        <li className={styles.li}>
                          Enter the amount you want to transfer to your SSI and{" "}
                          <strong>TRANSFER</strong>.
                        </li>
                      </ul>
                      <ul className={styles.ul}>
                        <li className={styles.li}>
                          Once you have added funds to your SSI, click on{" "}
                          <strong>BUY NFT USERNAME</strong> and confirm with
                          ZilPay.
                        </li>
                      </ul>
                    </p>
                  </>
                ) : (
                  <p className={styles.rowContentTxt}>
                    Search for any username that you wish to buy with your
                    self-sovereign identity.
                  </p>
                )}
              </div>
            </div>
            <div className={styles.rowWrapper}>
              <div onClick={() => menuActive(5)} className={styles.rowHeader}>
                <div className={styles.rowHeaderContent}>
                  <div>
                    {isChecked(5) ? (
                      <Image alt="point-5" src={cs} width={25} height={25} />
                    ) : (
                      <Image alt="point-5" src={c5} width={25} height={25} />
                    )}
                  </div>
                  <div className={styles.rowHeaderTitle}>DID Update</div>
                </div>
                <div className={styles.wrapperDropdownIco}>
                  {active === 5 ? (
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
                {active === 5 ? (
                  <>
                    <p className={styles.rowContentTxt}>Update DID Document.</p>
                    <p className={styles.rowContentTxt}>
                      <br />
                      <br />
                      <ul className={styles.ul}>
                        <li className={styles.li}>Log in with your SSI.</li>
                      </ul>
                      <ul className={styles.ul}>
                        <li className={styles.li}>
                          Click on WALLET, next on DID OPERATIONS and then on
                          UPDATE.
                        </li>
                      </ul>
                      Add SERVICES to publicly share web addresses that is
                      relevant to you, such as your personal or work sites,
                      blockchain addresses like Bitcoin, and more. DID
                      Verification Methods are also added.
                      <br />
                      <br />
                      You can fill in as many DID Services as you wish. If you
                      want to add more services, write down how many you want in
                      the Type amount input box.
                      <br />
                      <br />
                      <ul className={styles.ul}>
                        <li className={styles.li}>
                          Once you have done this, click Continue, and you can
                          donate ZIL to the Donate DApp.
                        </li>
                      </ul>
                      <ul className={styles.ul}>
                        <li className={styles.li}>
                          To finish, click on UPDATE DID and confirm with
                          ZilPay.
                        </li>
                      </ul>
                    </p>
                  </>
                ) : (
                  <p className={styles.rowContentTxt}>Update DID Document.</p>
                )}
              </div>
            </div>
            <div className={styles.rowWrapper}>
              <div onClick={() => menuActive(6)} className={styles.rowHeader}>
                <div className={styles.rowHeaderContent}>
                  <div>
                    {isChecked(6) ? (
                      <Image alt="point-6" src={cs} width={25} height={25} />
                    ) : (
                      <Image alt="point-6" src={c5} width={25} height={25} />
                    )}
                  </div>
                  <div className={styles.rowHeaderTitle}>Social Recovery</div>
                </div>
                <div className={styles.wrapperDropdownIco}>
                  {active === 6 ? (
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
                {active === 6 ? (
                  <>
                    <p className={styles.rowContentTxt}>
                      <strong>Configure Social Recovery</strong>
                    </p>
                    <p className={styles.rowContentTxt}>
                      <br />
                      <br />
                      With Social Recovery, you can update the DID Controller
                      address of your self-sovereign identity with the help of
                      your guardians. This security feature is super helpful if
                      you lose control of your Zilliqa wallet. To configure your
                      guardians, first, you must log in with your SSI.
                      <br />
                      <br />
                      <ul className={styles.ul}>
                        <li className={styles.li}>
                          Click on <strong>WALLET</strong>, next on{" "}
                          <strong>DID OPERATIONS</strong> and then{" "}
                          <strong>SOCIAL RECOVERY</strong>.
                        </li>
                      </ul>
                      You can have an unlimited amount of guardians. To social
                      recover your account, you need the signatures that
                      correspond to 'half the amount of guardians + 1 extra
                      signature'. As a minimum, you need at least three
                      signatures to execute social recovery.
                      <br />
                      <br />
                      <ul className={styles.ul}>
                        <li className={styles.li}>
                          Type the NFT Usernames of your guardians and click on{" "}
                          <strong>CONTINUE</strong> and then on{" "}
                          <strong>CONFIGURE DID SOCIAL RECOVERY</strong>.
                          Confirm with <strong>ZilPay</strong>.
                        </li>
                      </ul>
                      Add SERVICES to publicly share web addresses that is
                      relevant to you, such as your personal or work sites,
                      blockchain addresses like Bitcoin, and more. DID
                      Verification Methods are also added.
                      <br />
                      <br />
                      You can fill in as many DID Services as you wish. If you
                      want to add more services, write down how many you want in
                      the Type amount input box.
                      <br />
                      <br />
                      <ul className={styles.ul}>
                        <li className={styles.li}>
                          Once you have done this, click Continue, and you can
                          donate ZIL to the Donate DApp.
                        </li>
                      </ul>
                      <ul className={styles.ul}>
                        <li className={styles.li}>
                          To finish, click on UPDATE DID and confirm with
                          ZilPay.
                        </li>
                      </ul>
                    </p>
                  </>
                ) : (
                  <p className={styles.rowContentTxt}>
                    <strong>Configure Social Recovery</strong>
                  </p>
                )}
              </div>
            </div>
            <div className={styles.rowWrapper}>
              <div onClick={() => menuActive(7)} className={styles.rowHeader}>
                <div className={styles.rowHeaderContent}>
                  <div>
                    {isChecked(7) ? (
                      <Image alt="point-7" src={cs} width={25} height={25} />
                    ) : (
                      <Image alt="point-7" src={c5} width={25} height={25} />
                    )}
                  </div>
                  <div className={styles.rowHeaderTitle}>Add Funds</div>
                </div>
                <div className={styles.wrapperDropdownIco}>
                  {active === 7 ? (
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
                {active === 7 ? (
                  <>
                    <p className={styles.rowContentTxt}>
                      Search for your SSI username in the bar. On the dashboard
                      of your DIDxWallet, go to <strong>ADD FUNDS.</strong>
                    </p>
                    <p className={styles.rowContentTxt}>
                      <br />
                      <br />
                      <ul className={styles.ul}>
                        <li className={styles.li}>
                          Click on <strong>Select originator</strong> and select{" "}
                          <strong>ZilPay</strong> to fund your SSI from your
                          Zilliqa wallet or{" "}
                          <strong>Self-sovereign identity</strong> to add funds
                          from another SSI.
                        </li>
                      </ul>
                      If you have chosen another SSI, log in either with its NFT
                      Username or address.
                      <br />
                      <br />
                      With either originator of the transfer, then follow the
                      steps below.
                      <br />
                      <br />
                      <ul className={styles.ul}>
                        <li className={styles.li}>
                          On <strong>Select coin</strong>, select the currency
                          and enter the amount you wish to transfer to your SSI
                          in <strong>Type amount</strong>.
                        </li>
                      </ul>
                      When the originator of a transfer is an SSI, you can
                      donate to the Donate DApp and earn xPoints!
                      <br />
                      <br />
                      <ul className={styles.ul}>
                        <li className={styles.li}>
                          Click on <strong>CONTINUE</strong> and then on{" "}
                          <strong>TRANSFER</strong>.
                        </li>
                      </ul>
                      <ul className={styles.ul}>
                        <li className={styles.li}>
                          Confirm this transaction with ZilPay.
                        </li>
                      </ul>
                    </p>
                  </>
                ) : (
                  <p className={styles.rowContentTxt}>
                    Search for your SSI username in the bar. On the dashboard of
                    your DIDxWallet, go to <strong>ADD FUNDS.</strong>
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
