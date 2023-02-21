import * as zcrypto from "@zilliqa-js/crypto";
import * as tyron from "tyron";
import { useStore } from "effector-react";
import React, { useState } from "react";
import { toast } from "react-toastify";
import { $user } from "../../../../../src/store/user";
import { $contract } from "../../../../../src/store/contract";
import { $arconnect } from "../../../../../src/store/arconnect";
import { operationKeyPair } from "../../../../../src/lib/dkms";
import { ZilPayBase } from "../../../../ZilPay/zilpay-base";
import styles from "./styles.module.scss";
import { Donate } from "../../../..";
import { $donation, updateDonation } from "../../../../../src/store/donation";
import { $net } from "../../../../../src/store/wallet-network";

function Component({ domain }: { domain: string }) {
  const arConnect = useStore($arconnect);
  const user = useStore($user);
  const contract = useStore($contract);
  const donation = useStore($donation);
  const net = useStore($net);

  const [input, setInput] = useState(""); // the domain address
  const [legend, setLegend] = useState("Save");
  const [button, setButton] = useState("button primary");
  const [deployed, setDeployed] = useState(false);

  const [txID, setTxID] = useState("");

  const handleSave = async () => {
    setLegend("saved");
    setButton("button");
  };

  const handleInput = (event: { target: { value: any } }) => {
    setTxID("");
    updateDonation(null);
    setInput("");
    setLegend("save");
    setButton("button primary");
    let input = event.target.value;
    try {
      input = zcrypto.fromBech32Address(input);
      setInput(input);
      handleSave();
    } catch (error) {
      try {
        input = zcrypto.toChecksumAddress(input);
        setInput(input);
        handleSave();
      } catch {
        toast.error("Wrong address.", {
          position: "top-right",
          autoClose: 6000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "dark",
        });
      }
    }
  };
  const handleOnKeyPress = ({ key }: React.KeyboardEvent<HTMLInputElement>) => {
    if (key === "Enter") {
      handleSubmit;
    }
  };

  const handleDeploy = async () => {
    if (contract !== null && net !== null) {
      const zilpay = new ZilPayBase();
      await zilpay
        .deployDomain(net, domain, contract.addr)
        .then((deploy: any) => {
          let addr = deploy[1].address;
          addr = zcrypto.toChecksumAddress(addr);
          setInput(addr);
          setDeployed(true);
        });
    } else {
      toast.error("Some data is missing.", {
        position: "top-right",
        autoClose: 6000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
    }
  };

  const handleSubmit = async () => {
    if (arConnect !== null && contract !== null && donation !== null) {
      try {
        const zilpay = new ZilPayBase();
        const txID = "Dns";
        let addr;
        if (deployed === true) {
          addr = zcrypto.toChecksumAddress(input);
        } else {
          addr = input;
        }
        const result = await operationKeyPair({
          arConnect: arConnect,
          id: domain,
          addr: contract.addr,
        });
        const did_key = result.element.key.key;
        const encrypted = result.element.key.encrypted;
        const params = Array();
        const addr_: tyron.TyronZil.TransitionParams = {
          vname: "addr",
          type: "ByStr20",
          value: addr,
        };
        params.push(addr_);
        const did_key_: tyron.TyronZil.TransitionParams = {
          vname: "didKey",
          type: "ByStr33",
          value: did_key,
        };
        params.push(did_key_);
        const encrypted_: tyron.TyronZil.TransitionParams = {
          vname: "encrypted",
          type: "String",
          value: encrypted,
        };
        params.push(encrypted_);
        const domain_: tyron.TyronZil.TransitionParams = {
          vname: "domain",
          type: "String",
          value: domain,
        };
        params.push(domain_);

        let tyron_;
        const donation_ = String(donation * 1e12);
        switch (donation) {
          case 0:
            tyron_ = await tyron.TyronZil.default.OptionParam(
              tyron.TyronZil.Option.none,
              "Uint128"
            );
            break;
          default:
            tyron_ = await tyron.TyronZil.default.OptionParam(
              tyron.TyronZil.Option.some,
              "Uint128",
              donation_
            );
            break;
        }
        const tyron__: tyron.TyronZil.TransitionParams = {
          vname: "tyron",
          type: "Option Uint128",
          value: tyron_,
        };
        params.push(tyron__);

        const _amount = String(donation);
        await zilpay
          .call({
            contractAddress: contract.addr,
            transition: txID,
            params: params as unknown as Record<string, unknown>[],
            amount: _amount,
          })
          .then((res) => {
            setTxID(res.ID);
            updateDonation(null);
            toast.info(
              `Wait a little bit, and then search for ${user?.name}.${domain} to access its features.`,
              {
                position: "top-center",
                autoClose: 6000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "dark",
              }
            );
          })
          .catch((err) => {
            toast.error(err, {
              position: "top-right",
              autoClose: 6000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
              theme: "dark",
            });
          });
      } catch (error) {
        toast.error("Identity verification unsuccessful", {
          position: "top-right",
          autoClose: 6000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "dark",
        });
      }
    } else {
      toast.error("Some data is missing.", {
        position: "top-right",
        autoClose: 6000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
    }
  };

  return (
    <div style={{ marginTop: "14%", textAlign: "center" }}>
      {txID === "" && (
        <>
          {input === "" && (
            <input
              type="button"
              className="button primary"
              value={`new ${user?.name}.${domain} domain`}
              style={{ marginTop: "3%", marginBottom: "3%" }}
              onClick={handleDeploy}
            />
          )}
          {!deployed && (
            <div style={{ marginTop: "5%" }}>
              <code>
                <ul>
                  <li>
                    Or type your .{domain} domain address to save it in your
                    account:
                  </li>
                </ul>
              </code>
              <section className={styles.container}>
                <input
                  style={{ width: "70%" }}
                  type="text"
                  placeholder="Type domain address"
                  onChange={handleInput}
                  onKeyPress={handleOnKeyPress}
                  autoFocus
                />
                <input
                  style={{ marginLeft: "2%" }}
                  type="button"
                  className={button}
                  value={legend}
                  onClick={() => {
                    handleSubmit;
                  }}
                />
              </section>
            </div>
          )}
          {input !== "" && <Donate />}
          {input !== "" && donation !== null && (
            <div style={{ marginTop: "14%", textAlign: "center" }}>
              <button className="button" onClick={handleSubmit}>
                <p>
                  Save <span className={styles.username}>.{domain} domain</span>
                </p>
              </button>
            </div>
          )}
        </>
      )}
      {txID !== "" && (
        <h5>
          Transaction ID:{" "}
          <a
            href={`https://viewblock.io/zilliqa/tx/${txID}?network=${net}`}
            rel="noreferrer"
            target="_blank"
          >
            {txID.slice(0, 11)}...
          </a>
        </h5>
      )}
    </div>
  );
}

export default Component;
