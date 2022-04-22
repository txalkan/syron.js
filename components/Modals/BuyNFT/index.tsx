import React, { useState } from "react";
import { connect, ConnectedProps } from "react-redux";
import { showBuyNFTModal } from "../../../src/app/actions";
import { RootState } from "../../../src/app/reducers";
import CloseIcon from "../../../src/assets/icons/ic_cross.svg";
import InfoIcon from "../../../src/assets/icons/info_yellow.svg";
import styles from "./styles.module.scss";
import Image from "next/image";

const mapStateToProps = (state: RootState) => ({
  modal: state.modal.buyNFTModal,
  loading: state.modal.txStatusLoading,
  txId: state.modal.txId,
});

const mapDispatchToProps = {
  dispatchShowModal: showBuyNFTModal,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

type ModalProps = ConnectedProps<typeof connector>;

function TransactionStatus(props: ModalProps) {
  const { dispatchShowModal, modal, loading, txId } = props;

  const [recipient, setRecipient] = useState("");
  const [currency, setCurrency] = useState("");
  const [enoughBalance, setEnoughBalance] = useState(false);
  const [originator, setOriginator] = useState("");
  const [transferValue, setTransferValue] = useState(0);

  const handleOnChangeRecipient = (event: { target: { value: any } }) => {
    setRecipient(event.target.value);
  };

  const handleOnChangeCurrency = (event: { target: { value: any } }) => {
    setCurrency(event.target.value);
    setEnoughBalance(false);
  };

  const handleOnChangeOriginator = (event: { target: { value: any } }) => {
    setOriginator(event.target.value);
  };

  const handleInputFunds = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTransferValue(parseInt(event.target.value));
  };

  if (!modal) {
    return null;
  }

  return (
    <>
      <div className={styles.outerWrapper}>
        <div className={styles.container}>
          <div className={styles.innerContainer}>
            <div className={styles.closeIcon}>
              <Image
                alt="close-ico"
                src={CloseIcon}
                onClick={() => dispatchShowModal(false)}
              />
            </div>
            <div className={styles.contentWrapper}>
              <h3 className={styles.headerInfo}>buy this nft username</h3>
              <div className={styles.usernameInfoWrapper}>
                <h2 className={styles.usernameInfoYellow}>andromeda</h2>
                <h2 className={styles.usernameInfo}>&nbsp;is available</h2>
              </div>
              <p style={{ fontSize: "14px" }}>You are logged in with:</p>
              <p className={styles.loginAddress}>
                zil1cgmsj2330e7uwvwqwkn4cq08gmyegsy2uv
              </p>
              <div className={styles.selectWrapper}>
                <div style={{ width: "100%" }}>
                  <div style={{ display: "flex" }}>
                    <p style={{ fontSize: "20px" }}>Select recipient</p>
                    <div className={styles.icoInfo}>
                      <Image alt="info-ico" src={InfoIcon} />
                    </div>
                  </div>
                  <select
                    className={styles.select}
                    onChange={handleOnChangeRecipient}
                  >
                    <option value=""></option>
                    <option value="ssi">SSI</option>
                    <option value="input">Input Address</option>
                  </select>
                </div>
                <div className={styles.paymentWrapper}>
                  {recipient !== "" && (
                    <>
                      <div style={{ display: "flex" }}>
                        <p style={{ fontSize: "20px" }}>Select payment</p>
                      </div>
                      <select
                        className={styles.select}
                        onChange={handleOnChangeCurrency}
                      >
                        <option value=""></option>
                        <option value="TYRON">TYRON</option>
                        <option value="$SI">$SI</option>
                        <option value="zUSDT">zUSDT</option>
                        <option value="XSGD">XSGD</option>
                        <option value="PIL">PIL</option>
                        <option value="FREE">Free</option>
                      </select>
                    </>
                  )}
                </div>
              </div>
              {currency !== "" && (
                <>
                  <div className={styles.balanceInfoWrapepr}>
                    <p className={styles.balanceInfo}>
                      Your SSI has a current balance of
                    </p>
                    <p className={styles.balanceInfoYellow}>
                      &nbsp;0 {currency}
                    </p>
                  </div>
                  {!enoughBalance && (
                    <>
                      <p style={{ color: "red" }}>
                        Not enough balance to buy an NFT username
                      </p>
                      <div>
                        <p style={{ fontSize: "20px" }}>ADD FUNDS</p>
                        <p className={styles.addFundsToAddress}>
                          Add funds into zil1cgmsj2330e7uwvwqwkn4cq08gmyegsy2uv
                          from your SSI or ZilPay
                        </p>
                        <div style={{ width: "50%" }}>
                          <select
                            className={styles.select}
                            onChange={handleOnChangeOriginator}
                          >
                            <option value="">Select originator</option>
                            <option value="ssi">Self-sovereign identity</option>
                            <option value="zilpay">ZilPay</option>
                          </select>
                        </div>
                        {originator !== "" && (
                          <>
                            <div className={styles.originatorInfoWrapper}>
                              <p className={styles.originatorType}>
                                Zilpay wallet:&nbsp;
                              </p>
                              <p className={styles.originatorAddr}>
                                zil1uedw9nvgljtee2z9partfz8tv5yc9pgrcqn264
                              </p>
                            </div>
                            <div className={styles.fundsWrapper}>
                              <code>TYRON</code>
                              <input
                                // ref={callbackRef}
                                style={{
                                  width: "100%",
                                  marginLeft: "2%",
                                  marginRight: "2%",
                                }}
                                type="text"
                                onChange={handleInputFunds}
                                // onKeyPress={handleOnKeyPress}
                                autoFocus
                              />
                              <input
                                type="button"
                                className="button"
                                value="save"
                                // onClick={() => {
                                //   handleSave();
                                // }}
                              />
                            </div>
                            {transferValue > 0 && (
                              <>
                                <div className={styles.transferInfoWrapper}>
                                  <p className={styles.transferInfo}>
                                    TRANSFER:&nbsp;
                                  </p>
                                  <p className={styles.transferInfoYellow}>
                                    {transferValue} {currency}&nbsp;
                                  </p>
                                  <p className={styles.transferInfo}>
                                    TO&nbsp;
                                  </p>
                                  <p className={styles.transferInfoYellow}>
                                    zil1uedw9nvgljtee2z9partfz8tv5yc9pgrcqn264
                                  </p>
                                </div>
                                <p>AROUND 4 -7 ZIL</p>
                                <button
                                  style={{ width: "fit-content" }}
                                  className="button"
                                >
                                  PROCEED
                                </button>
                              </>
                            )}
                          </>
                        )}
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default connect(mapStateToProps, mapDispatchToProps)(TransactionStatus);
