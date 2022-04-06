import { useStore } from "effector-react";
import React, { useState, useCallback } from "react";
import { toast } from "react-toastify";
import { $donation } from "../../../../../src/store/donation";
import { $user } from "../../../../../src/store/user";
import * as tyron from "tyron";
import { SubmitCreate, Donate, SubmitRecover } from "../../../..";
import styles from "./styles.module.scss";

interface InputType {
  typeInput: string;
}

function Component(props: InputType) {
  const { typeInput } = props
  const callbackRef = useCallback((inputElement) => {
    if (inputElement) {
      inputElement.focus();
    }
  }, []);

  const user = useStore($user);
  const donation = useStore($donation);

  const [input, setInput] = useState(0);

  const input_ = Array(input);
  const select_input = Array();
  for (let i = 0; i < input_.length; i += 1) {
    select_input[i] = i;
  }
  const [input2, setInput2] = useState([]);
  const services: string[][] = input2;

  const [hideDoc, setHideDoc] = useState(false);

  const [twitter, setTwitterUsername] = useState("");
  const [btc, setBtc] = useState("");
  const [github, setGithub] = useState("");
  const [phoneNumber, setPhoneNumber] = useState(0);

  const [legend2, setLegend2] = useState("continue");
  const [button2, setButton2] = useState("button primary");

  const [hideDonation, setHideDonation] = useState(true);
  const [hideSubmit, setHideSubmit] = useState(true);

  const services_: tyron.DocumentModel.ServiceModel[] = [];
  const [services2, setServices2] = useState(services_);

  const handleReset = async () => {
    setButton2("button primary");
    setLegend2("continue");
    setHideDonation(true);
    setHideSubmit(true);
  };
  const handleResetB = async () => {
    setButton2B("button primary");
    setLegend2B("continue");
    setHideDonation(true);
    setHideSubmit(true);
  };

  const handleDoc = async () => {
    setBtc("");
    setTwitterUsername("");
    setGithub("");
    setPhoneNumber(0);
    setInput(0);
    setInputB(0);
    handleReset();
    handleResetB();
    if (hideDoc) {
      setHideDoc(false);
    } else {
      setHideDoc(true);
    }
  };

  const handleBtc = (event: { target: { value: any } }) => {
    handleReset();
    const input = event.target.value;
    setBtc(String(input).toLowerCase());
  };
  const handleTwitterUsername = (event: { target: { value: any } }) => {
    handleReset();
    const input = event.target.value;
    setTwitterUsername(String(input).toLowerCase());
  };
  const handleGithub = (event: { target: { value: any } }) => {
    handleReset();
    const input = event.target.value;
    setGithub(String(input));
  };
  const handlePhoneNumber = (event: { target: { value: any } }) => {
    handleReset();
    const input = Number(event.target.value);
    if (!isNaN(input) && Number.isInteger(input)) {
      setPhoneNumber(input);
    } else {
      toast.error('The phone number is not valid.', {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: 'dark',
      });
    }
  };

  const handleInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInput(0);
    setInput2([]);
    setHideSubmit(true);
    setHideDonation(true);
    setButton2("button primary");
    setLegend2("continue");
    setServices2(services_);
    let _input = event.target.value;
    const re = /,/gi;
    _input = _input.replace(re, ".");
    const input = Number(_input);

    if (!isNaN(input) && Number.isInteger(input)) {
      setInput(input);
    } else if (isNaN(input)) {
      toast.error('The input is not a number.', {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: 'dark',
      });
    } else if (!Number.isInteger(input)) {
      toast.error('The number of services must be an integer.', {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: 'dark',
      });
    }
  };

  const services__: tyron.DocumentModel.ServiceModel[] = [];

  if (btc !== "") {
    services__.push({
      id: "bitcoin",
      endpoint: tyron.DocumentModel.ServiceEndpoint.Web2Endpoint,
      type: "blockchain",
      transferProtocol: tyron.DocumentModel.TransferProtocol.Https,
      uri: btc,
    });
  }
  if (twitter !== "") {
    let username = twitter;
    if (twitter.slice(0, 1) === "@") {
      username = twitter.slice(1);
    }
    services__.push({
      id: "twitter",
      endpoint: tyron.DocumentModel.ServiceEndpoint.Web2Endpoint,
      type: "website",
      transferProtocol: tyron.DocumentModel.TransferProtocol.Https,
      uri: username,
    });
  }
  if (github !== "") {
    services__.push({
      id: "github",
      endpoint: tyron.DocumentModel.ServiceEndpoint.Web2Endpoint,
      type: "website",
      transferProtocol: tyron.DocumentModel.TransferProtocol.Https,
      uri: github,
    });
  }
  if (phoneNumber !== 0) {
    services__.push({
      id: "phonenumber",
      endpoint: tyron.DocumentModel.ServiceEndpoint.Web2Endpoint,
      type: "phonenumber",
      transferProtocol: tyron.DocumentModel.TransferProtocol.Https,
      uri: String(phoneNumber),
    });
  }

  const handleContinue = async () => {
    const _services: tyron.DocumentModel.ServiceModel[] = [];
    if (services.length !== 0) {
      for (let i = 0; i < services.length; i += 1) {
        const this_service = services[i];
        if (this_service[0] !== "" && this_service[1] !== "") {
          _services.push({
            id: this_service[0],
            endpoint: tyron.DocumentModel.ServiceEndpoint.Web2Endpoint,
            type: "website",
            transferProtocol: tyron.DocumentModel.TransferProtocol.Https,
            uri: this_service[1],
          });
        }
      }
    }
    if (_services.length !== input) {
      toast.error('The input is incomplete.', {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: 'dark',
      });
    } else {
      setServices2(_services);
      setButton2("button");
      setHideDoc(true);
      setHideDonation(false);
      setHideSubmit(false);
    }
  };

  // only init.did for now

  const [inputB, setInputB] = useState(0);
  const input_B = Array(inputB);
  const select_inputB = Array();
  for (let i = 0; i < input_B.length; i += 1) {
    select_inputB[i] = i;
  }
  const [input2B, setInput2B] = useState([]);
  const servicesB: string[][] = input2B;

  const [legend2B, setLegend2B] = useState("continue");
  const [button2B, setButton2B] = useState("button primary");

  const [services2B, setServices2B] = useState(services_);

  const handleInputB = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputB(0);
    setInput2B([]);
    setHideSubmit(true);
    setHideDonation(true);
    setButton2B("button primary");
    setLegend2B("continue");
    setServices2B(services_);
    let _input = event.target.value;
    const re = /,/gi;
    _input = _input.replace(re, ".");
    const input = Number(_input);

    if (!isNaN(input) && Number.isInteger(input)) {
      setInputB(input);
    } else if (isNaN(input)) {
      toast.error('The input is not a number.', {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: 'dark',
      });
    } else if (!Number.isInteger(input)) {
      toast.error('The number of services must be an integer.', {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: 'dark',
      });
    }
  };

  const handleContinueB = async () => {
    const _services: tyron.DocumentModel.ServiceModel[] = [];
    if (servicesB.length !== 0) {
      for (let i = 0; i < servicesB.length; i += 1) {
        const this_service = servicesB[i];
        if (this_service[0] !== "" && this_service[1] !== "") {
          _services.push({
            id: this_service[0],
            endpoint: tyron.DocumentModel.ServiceEndpoint.Web3Endpoint,
            address: this_service[1],
          });
        }
      }
    }
    if (_services.length !== inputB) {
      toast.error('The input is incomplete.', {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: 'dark',
      });

    } else {
      setServices2B(_services);
      setButton2B("button");
      setLegend2B("saved");
      setHideDonation(false);
      setHideSubmit(false);
    }
  };

  const did_services = services__.concat(services2);
  return (
    <>
      <div>
        {hideDoc &&
          <div style={{ margin: '7%', textAlign: 'center' }}>
            <input
              type="button"
              className="button"
              value="undo changes"
              onClick={() => {
                handleDoc();
              }}
            />
          </div>
        }
        {!hideDoc && (
          <>
            <section style={{ marginTop: "7%", marginBottom: "7%" }}>
              <h3 style={{ color: "silver" }}>Verification methods</h3>
              <p>
                You will be creating one DID key pair for each{" "}
                <a
                  href="https://www.ssiprotocol.com/#/did"
                  rel="noreferrer"
                  target="_blank"
                >
                  verification relationship
                </a>
                .
              </p>
            </section>
            <h3 style={{ color: "silver" }}>Services</h3>
            <p>
              Showcase your websites and other addresses <span style={{ color: 'red' }}>publicly</span>:
            </p>
            <div className={styles.container}>
              <table className={styles.table}>
                <tbody>
                  <tr className={styles.row}>
                    <td style={{ display: 'flex' }}>
                      <label>ID</label>
                      bitcoin
                    </td>
                    <td>
                      <input
                        ref={callbackRef}
                        style={{ marginLeft: "1%", width: "100%" }}
                        type="text"
                        placeholder="Type BTC address"
                        onChange={handleBtc}
                        autoFocus
                      />
                    </td>
                  </tr>
                  <tr className={styles.row}>
                    <td style={{ display: 'flex' }}>
                      <label>ID</label>
                      twitter
                    </td>
                    <td>
                      <input
                        ref={callbackRef}
                        style={{ marginLeft: "1%", width: "100%" }}
                        type="text"
                        placeholder="Type twitter username"
                        onChange={handleTwitterUsername}
                        autoFocus
                      />
                    </td>
                  </tr>
                  <tr className={styles.row}>
                    <td style={{ display: 'flex' }}>
                      <label>ID</label>
                      github
                    </td>
                    <td>
                      <input
                        ref={callbackRef}
                        style={{ marginLeft: "1%", width: "100%" }}
                        type="text"
                        placeholder="Type GitHub username"
                        onChange={handleGithub}
                        autoFocus
                      />
                    </td>
                  </tr>
                  <tr className={styles.row}>
                    <td style={{ display: 'flex' }}>
                      <label>ID</label>
                      phone
                    </td>
                    <td>
                      <input
                        ref={callbackRef}
                        style={{ marginLeft: "1%", width: "100%" }}
                        type="text"
                        placeholder="Type phone number"
                        onChange={handlePhoneNumber}
                        autoFocus
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className={styles.container}>
              How many other services would you like to add?
              <input
                ref={callbackRef}
                style={{ width: "30%", marginLeft: "2%" }}
                type="text"
                placeholder="Type amount"
                onChange={handleInput}
                autoFocus
              />
            </p>
            {input != 0 &&
              select_input.map((res: number) => {
                return (
                  <section key={res} className={styles.container}>
                    <input
                      ref={callbackRef}
                      style={{ width: "20%" }}
                      type="text"
                      placeholder="Type ID"
                      onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                        const value = event.target.value;
                        const checkDuplicate = services.filter(val => val[0].toLowerCase() === value)
                        if (checkDuplicate.length > 0) {
                          toast.error('Service ID repeated so it will not get added to your DID Document.', {
                            position: "top-right",
                            autoClose: 6000,
                            hideProgressBar: false,
                            closeOnClick: true,
                            pauseOnHover: true,
                            draggable: true,
                            progress: undefined,
                            theme: 'dark',
                          });
                        } else {
                          handleReset();
                          if (services[res] === undefined) {
                            services[res] = ["", ""];
                          }
                          services[res][0] = value.toLowerCase();
                        }
                      }}
                    />
                    <code>https://www.</code>
                    <input
                      ref={callbackRef}
                      style={{ width: "60%" }}
                      type="text"
                      placeholder="Type service URL"
                      onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                        handleReset();
                        const value = event.target.value;
                        if (services[res] === undefined) {
                          services[res] = ["", ""];
                        }
                        services[res][1] = value.toLowerCase();
                      }}
                    />
                  </section>
                );
              })
            }
            <div style={{ textAlign: 'center', margin: '14%' }}>
              <input
                type="button"
                className={button2}
                value={legend2}
                onClick={() => {
                  handleContinue();
                }}
              />
            </div>
            {user?.name === "init" && (
              <>
                <section className={styles.container}>
                  <p style={{ width: "70%" }}>
                    How many other DID Services (addresses) would you like to add?
                  </p>
                  <input
                    ref={callbackRef}
                    style={{ width: "15%" }}
                    type="text"
                    placeholder="Type amount"
                    onChange={handleInputB}
                    autoFocus
                  />
                </section>
                {inputB != 0 &&
                  select_inputB.map((res: number) => {
                    return (
                      <section key={res} className={styles.container}>
                        <input
                          ref={callbackRef}
                          style={{ width: "20%" }}
                          type="text"
                          placeholder="Type ID"
                          onChange={(
                            event: React.ChangeEvent<HTMLInputElement>
                          ) => {
                            const value = event.target.value;
                            const checkDuplicate = servicesB.filter(val => val[0].toLowerCase() === value)
                            if (checkDuplicate.length > 0) {
                              toast.error('Service ID repeated so it will not get added to your DID Document.', {
                                position: "top-right",
                                autoClose: 6000,
                                hideProgressBar: false,
                                closeOnClick: true,
                                pauseOnHover: true,
                                draggable: true,
                                progress: undefined,
                                theme: 'dark',
                              });
                            } else {
                              handleResetB();
                              if (servicesB[res] === undefined) {
                                servicesB[res] = ["", ""];
                              }
                              servicesB[res][0] = value.toLowerCase();
                            }
                          }}
                        />
                        <input
                          ref={callbackRef}
                          style={{ width: "60%" }}
                          type="text"
                          placeholder="Type service URL"
                          onChange={(
                            event: React.ChangeEvent<HTMLInputElement>
                          ) => {
                            handleResetB();
                            const value = event.target.value;
                            if (servicesB[res] === undefined) {
                              servicesB[res] = ["", ""];
                            }
                            servicesB[res][1] = value.toLowerCase();
                          }}
                        />
                      </section>
                    );
                  })}
                <div style={{ textAlign: 'center', margin: '14%' }}>
                  <input
                    type="button"
                    className={button2B}
                    value={legend2B}
                    onClick={() => {
                      handleContinueB();
                    }}
                  />
                </div>
              </>
            )}
          </>
        )}
        {hideDoc && (
          <Donate />
        )}
        {!hideSubmit && donation !== null && (
          <div>
            {typeInput === 'create' ? (
              <SubmitCreate
                {...{
                  services: did_services.concat(services2B),
                }}
              />
            ) : (
              <SubmitRecover
                {...{
                  services: did_services.concat(services2B),
                }}
              />
            )}
          </div>
        )}
      </div>
    </>
  );
}

export default Component;
