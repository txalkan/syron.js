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
import c6 from "../../../src/assets/icons/checkpoint_6.svg";
import c7 from "../../../src/assets/icons/checkpoint_7.svg";
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
        <div className={styles.innerContainer}>
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
                  <div className={styles.rowHeaderTitle}>
                    Zilliqa blockchain
                  </div>
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
                    <div className={styles.rowContentTxt}>
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
                          and click on <strong>GET CHROME EXTENSION</strong>.
                          Once you have installed the extension, get into it and
                          click <strong>Create</strong> to generate a new
                          account.
                        </li>
                      </ul>
                      <ul className={styles.ul}>
                        <li className={styles.li}>
                          You will see a list of words that make up your secret
                          phrase. You must write these words down in a safe
                          place. Remember that the words must be ordered and
                          spelt correctly. You can choose between 12 and 24
                          words{" "}
                          <span className={styles.tooltip}>
                            <Image
                              alt="warning-ico"
                              src={Warning}
                              width={20}
                              height={20}
                            />
                            <span className={styles.tooltiptext}>
                              <h5 className={styles.modalInfoTitle}>INFO</h5>
                              Although the words shown at the beginning are 8,
                              your secret phrase is made up of 12 or 24 words.
                              To see the complete list, click between the words
                              in the list and press the down-arrow button
                              repeatedly on your keyboard until you see the
                              total number of words.
                            </span>
                          </span>
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
                          password. Then Accept Privacy Policy and Continue to
                          finish.
                        </li>
                      </ul>
                    </div>
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
                  <div className={styles.rowHeaderTitle}>
                    Arweave blockchain
                  </div>
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
                    <div className={styles.rowContentTxt}>
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
                          and click on <strong>Download ArConnect</strong>. Once
                          you have installed the chrome extension, a new tab
                          will appear where you will be asked to create a
                          password for your new Arweave wallet, called
                          ArConnect.
                        </li>
                      </ul>
                      <ul className={styles.ul}>
                        <li className={styles.li}>
                          Generate your password, and click on Create.
                        </li>
                      </ul>
                      <ul className={styles.ul}>
                        <li className={styles.li}>
                          Next, select New Wallet{" "}
                          <span className={styles.tooltip}>
                            <Image
                              alt="warning-ico"
                              src={Warning}
                              width={20}
                              height={20}
                            />
                            <span className={styles.tooltiptext}>
                              <h5 className={styles.modalInfoTitle}>INFO</h5>
                              <p>
                                Your SSI uses this wallet for encryption and
                                decryption of data, and soon to make
                                transactions on the permaweb as well!
                              </p>
                            </span>
                          </span>
                        </li>
                      </ul>
                    </div>
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
                  <div className={styles.rowHeaderTitle}>TYRON Network</div>
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
                    <div className={styles.rowContentTxt}>
                      <br />
                      <ul className={styles.ul}>
                        <li className={styles.li}>
                          Click on <strong>CONNECT</strong> in the top right
                          corner, and approve the connection between your
                          Zilliqa wallet and the SSI Browser open-source web
                          application.
                        </li>
                      </ul>
                      <ul className={styles.ul}>
                        <li className={styles.li}>
                          Click on <strong>LOG IN</strong> and then{" "}
                          <strong>New User</strong>. This step will connect your
                          Arweave wallet as well.
                        </li>
                      </ul>
                      <ul className={styles.ul}>
                        <li className={styles.li}>
                          <strong>Confirm</strong> with ZilPay. The cost to
                          create your SSI is around 1 ZIL{" "}
                          <span className={styles.tooltip}>
                            <Image
                              alt="warning-ico"
                              src={Warning}
                              width={20}
                              height={20}
                            />
                            <span className={styles.tooltiptext}>
                              <h5 className={styles.modalInfoTitle}>INFO</h5>
                              <p>
                                Your Zilliqa wallet needs to have at least 70
                                ZIL since the gas limit to deploy a new contract
                                (contract creation) is 35,000 units of gas at
                                0.002 ZIL per unit (which is the minimum
                                possible blockchain gas price). However, the
                                actual cost is around 1 ZIL.
                              </p>
                            </span>
                          </span>
                        </li>
                      </ul>
                      <ul className={styles.ul}>
                        <li className={styles.li}>
                          Click on your new self-sovereign identity address and
                          explore its data on Devex.
                        </li>
                      </ul>
                    </div>
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
                  <div className={styles.rowHeaderTitle}>NFT Username</div>
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
                      Search for a username and buy it with your self-sovereign
                      identity
                    </p>
                    <div className={styles.rowContentTxt}>
                      <br />
                      <ul className={styles.ul}>
                        <li className={styles.li}>
                          You can buy an available username with your SSI
                          (either a new SSI smart contract or an existing SSI).
                        </li>
                      </ul>
                      <ul className={styles.ul}>
                        <li className={styles.li}>
                          Click on <strong>Select recipient</strong> and choose{" "}
                          <strong>This SSI</strong> to buy the NFT Username for
                          your SSI. Alternatively, you can buy this username and
                          assign it to any other address by selecting{" "}
                          <strong>Another address</strong>. If you choose to use
                          the username for another address, type this address
                          and Continue{" "}
                          <span className={styles.tooltip}>
                            <Image
                              alt="warning-ico"
                              src={Warning}
                              width={20}
                              height={20}
                            />
                            <span className={styles.tooltiptext}>
                              <h5 className={styles.modalInfoTitle}>INFO</h5>
                              <p>
                                The recipient of a username can be your SSI or
                                another address of your choice. Either way, your
                                SSI is the owner of the NFT, which means that
                                your Decentralized Identifier (DID) is the
                                controller of the username.
                              </p>
                            </span>
                          </span>
                        </li>
                      </ul>
                      <ul className={styles.ul}>
                        <li className={styles.li}>
                          Choose a payment option in{" "}
                          <strong>Select payment</strong>. Options are TYRON,
                          $SI and other stablecoins such as zUSDT, XSGD and PIL.
                        </li>
                      </ul>
                      <p>
                        If you are using a new SSI, new smart contracts do not
                        have funds yet to purchase a Username. Or, if your
                        existing SSI does not have enough coins, you can add
                        funds to proceed.
                      </p>
                      <h6>ADD FUNDS</h6>
                      <ul className={styles.ul}>
                        <li className={styles.li}>
                          Click on <strong>Select originator</strong>, and
                          select <strong>ZilPay</strong> to add funds from your
                          ZilPay wallet. You can also add funds from any other{" "}
                          <strong>self-sovereign identity</strong> that you
                          control.
                        </li>
                      </ul>
                      <ul className={styles.ul}>
                        <li className={styles.li}>
                          Enter the amount you want to transfer to your SSI and{" "}
                          <strong>PROCEED</strong> with the transfer.
                        </li>
                      </ul>
                      <ul className={styles.ul}>
                        <li className={styles.li}>
                          When your SSI has enough funds, click on{" "}
                          <strong>BUY NFT USERNAME</strong> and confirm with
                          ZilPay.
                        </li>
                      </ul>
                    </div>
                  </>
                ) : (
                  <p className={styles.rowContentTxt}>
                    Search for a Username and buy it with your self-sovereign
                    identity
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
                    <p className={styles.rowContentTxt}>
                      Update your Decentralized Identifier Document
                    </p>
                    <div className={styles.rowContentTxt}>
                      <br />
                      <ul className={styles.ul}>
                        <li className={styles.li}>Log in with your SSI.</li>
                      </ul>
                      <ul className={styles.ul}>
                        <li className={styles.li}>
                          Search for its NFT Username or click on it in the
                          LOGGED IN dashboard to access your SSI.
                        </li>
                      </ul>
                      <ul className={styles.ul}>
                        <li className={styles.li}>
                          Click on WALLET, next on DID OPERATIONS and then on
                          UPDATE.
                        </li>
                      </ul>
                      <ul className={styles.ul}>
                        <li className={styles.li}>
                          Replace a DID Key (Verification Method) if you wish
                          so.
                        </li>
                      </ul>
                      <ul className={styles.ul}>
                        <li className={styles.li}>
                          Add SERVICES to publicly share web addresses that are
                          relevant to you, such as your personal or work sites,
                          blockchain addresses like Bitcoin, and more{" "}
                          <span className={styles.tooltip}>
                            <Image
                              onClick={() => setModalInfo(!modalInfo)}
                              alt="warning-ico"
                              src={Warning}
                              width={20}
                              height={20}
                            />
                            <span className={styles.tooltiptext}>
                              <h5 className={styles.modalInfoTitle}>INFO</h5>
                              <p>
                                You can have as many DID Services as you wish.
                                If you want to add more services, write down how
                                many you want in the Type amount input box.
                              </p>
                            </span>
                          </span>
                        </li>
                      </ul>
                      <ul className={styles.ul}>
                        <li className={styles.li}>
                          Continue, and you can donate ZIL to the Donate DApp.
                        </li>
                      </ul>
                      <ul className={styles.ul}>
                        <li className={styles.li}>
                          To finish, click on UPDATE DID and confirm with
                          ZilPay.
                        </li>
                      </ul>
                    </div>
                  </>
                ) : (
                  <p className={styles.rowContentTxt}>
                    Update your Decentralized Identifier Document
                  </p>
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
                      <Image alt="point-6" src={c6} width={25} height={25} />
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
                      Configure DID Social Recovery
                    </p>
                    <div className={styles.rowContentTxt}>
                      <br />
                      <p>
                        With Social Recovery, you can update the DID Controller
                        address of your self-sovereign identity with the help of
                        your guardians. This security feature is super helpful
                        if you lose control of your Zilliqa wallet.
                      </p>
                      <ul className={styles.ul}>
                        <li className={styles.li}>
                          Log in with your SSI, and access its dashboard by
                          searching for its Username.
                        </li>
                      </ul>
                      <ul className={styles.ul}>
                        <li className={styles.li}>
                          Click on <strong>WALLET</strong>, next on{" "}
                          <strong>DID OPERATIONS</strong> and then select{" "}
                          <strong>SOCIAL RECOVERY</strong>.
                        </li>
                      </ul>
                      <ul className={styles.ul}>
                        <li className={styles.li}>
                          Choose how many guardians you would like for your SSI{" "}
                          <span className={styles.tooltip}>
                            <Image
                              alt="warning-ico"
                              src={Warning}
                              width={20}
                              height={20}
                            />
                            <span className={styles.tooltiptext}>
                              <h5 className={styles.modalInfoTitle}>INFO</h5>
                              <p>
                                You can have an unlimited amount of guardians.
                                To social recover your account, you need the
                                signatures that correspond to{" "}
                                <i>
                                  half the amount of guardians + 1 extra
                                  signature
                                </i>
                                . As a minimum, you need at least three
                                signatures to execute social recovery.
                              </p>
                            </span>
                          </span>
                        </li>
                      </ul>
                      <ul className={styles.ul}>
                        <li className={styles.li}>
                          Type the NFT Usernames of your guardians, click on{" "}
                          <strong>CONTINUE</strong> and then on{" "}
                          <strong>CONFIGURE DID SOCIAL RECOVERY</strong>.
                          Confirm with <strong>ZilPay</strong>.
                        </li>
                      </ul>
                    </div>
                  </>
                ) : (
                  <p className={styles.rowContentTxt}>
                    Configure DID Social Recovery
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
                      <Image alt="point-7" src={c7} width={25} height={25} />
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
                    <p className={styles.rowContentTxt}>Top up a DIDxWallet</p>
                    <div className={styles.rowContentTxt}>
                      <br />
                      <p>
                        You can add funds to any SSI by searching for its
                        Username and selecting the ADD FUNDS card.
                      </p>
                      <ul className={styles.ul}>
                        <li className={styles.li}>
                          Click on <strong>Select originator</strong> and select{" "}
                          <strong>ZilPay</strong> to send funds from your
                          Zilliqa wallet or{" "}
                          <strong>Self-sovereign identity</strong> to add funds
                          from another SSI that you control{" "}
                          <span className={styles.tooltip}>
                            <Image
                              alt="warning-ico"
                              src={Warning}
                              width={20}
                              height={20}
                            />
                            <span className={styles.tooltiptext}>
                              <h5 className={styles.modalInfoTitle}>INFO</h5>
                              <p>
                                If you have chosen to send funds from a
                                self-sovereign identity, log in either with its
                                NFT Username or SSI address.
                              </p>
                            </span>
                          </span>
                        </li>
                      </ul>
                      <ul className={styles.ul}>
                        <li className={styles.li}>
                          On <strong>Select coin</strong>, select the currency
                          and enter the amount you wish to transfer in{" "}
                          <strong>Type amount</strong>. When the originator of
                          the transfer is your SSI, you can donate to the Donate
                          DApp and earn xPoints!
                        </li>
                      </ul>
                      <ul className={styles.ul}>
                        <li className={styles.li}>
                          Continue to <strong>TRANSFER</strong>
                          &nbsp;and confirm this transaction with ZilPay.
                        </li>
                      </ul>
                    </div>
                  </>
                ) : (
                  <p className={styles.rowContentTxt}>Top up a DIDxWallet</p>
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
