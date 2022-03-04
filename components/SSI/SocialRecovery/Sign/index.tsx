import React, { useState } from "react";
import { toast } from "react-toastify";
import { useStore } from "effector-react";
import * as zcrypto from "@zilliqa-js/crypto";
import styles from "./styles.module.scss";
import { $doc } from "../../../../src/store/did-doc";
import { $arconnect } from "../../../../src/store/arconnect";
import { decryptKey } from "../../../../src/lib/dkms";
import { $user } from "../../../../src/store/user";

function Component() {
  const user = useStore($user);
  const doc = useStore($doc);
  const arConnect = useStore($arconnect);

  const [input, setInput] = useState(""); //the address to sign
  const [legend, setLegend] = useState("continue");
  const [button, setButton] = useState("button primary");

  const [error, setError] = useState("");
  const [hideSubmit, setHideSubmit] = useState(true);

  const [signature, setSignature] = useState("");

  const handleInput = (event: { target: { value: any } }) => {
    setError("");
    setInput("");
    setHideSubmit(true);
    setLegend("continue");
    setButton("button primary");
    let value = event.target.value;
    try {
      value = zcrypto.fromBech32Address(value);
      setInput(value);
    } catch (error) {
      try {
        value = zcrypto.toChecksumAddress(value);
        setInput(value);
      } catch {
        toast.error("wrong address.", {
          position: "top-left",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: 'dark',
        });
      }
    }
  };
  const handleOnKeyPress = ({ key }: React.KeyboardEvent<HTMLInputElement>) => {
    if (key === "Enter") {
      handleSave();
    }
  };
  const handleSave = async () => {
    if (input !== "") {
      setLegend("saved");
      setButton("button");
      setHideSubmit(false);
    }
  };

  const handleSubmit = async () => {
    if (arConnect !== null) {
      try {
        const encrypted_key = doc?.dkms.get("socialrecovery"); //@todo-hand if not, throw err
        const sr_private_key = await decryptKey(arConnect, encrypted_key);
        const sr_public_key = zcrypto.getPubKeyFromPrivateKey(sr_private_key);

        const addr = input.substring(2);

        const signature =
          "0x" +
          zcrypto.sign(Buffer.from(addr, "hex"), sr_private_key, sr_public_key);
        setSignature(signature);
      } catch (error) {
        toast.error("identity verification unsuccessful", {
          position: "top-left",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: 'dark',
        });
      }
    }
  };

  return (
    <div className={styles.container}>
      <h3 style={{ color: "lightblue", marginBottom: "7%" }}>
        Sign an address
      </h3>
      {signature === "" && (
        <div>
          <p>Hola {user?.name}!</p>
          <code>
            <ul>
              <li>
                You can sign any address with your DID Social Recovery Key:
              </li>
            </ul>
          </code>
          <div className={styles.containerInput}>
            <input
              type="text"
              style={{ width: "70%" }}
              placeholder="Type address"
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
                handleSave();
              }}
            />
          </div>
        </div>
      )}
      {!hideSubmit && error === "" && signature === "" && (
        <div style={{ marginTop: "10%" }}>
          <button className={styles.button} onClick={handleSubmit}>
            make <span className={styles.x}>signature</span>
          </button>
        </div>
      )}
      {signature !== "" && (
        <code>
          <ul>
            <li>Your DID Social Recovery signature: {signature}</li>
          </ul>
        </code>
      )}
      {error !== "" && <p className={styles.error}>Error: {error}</p>}
    </div>
  );
}

export default Component;
