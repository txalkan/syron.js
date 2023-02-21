import React, { useState, useRef, useEffect } from "react";
import * as tyron from "tyron";
import * as zcrypto from "@zilliqa-js/crypto";
import { toast } from "react-toastify";
import styles from "./styles.module.scss";
import { useStore } from "effector-react";
import { ZilPayBase } from "../../../../ZilPay/zilpay-base";
import { $user } from "../../../../../src/store/user";
import { $contract } from "../../../../../src/store/contract";
import { $net } from "../../../../../src/store/wallet-network";
import { $doc } from "../../../../../src/store/did-doc";

function Component() {
  const searchInput = useRef(null);
  function handleFocus() {
    if (searchInput !== null && searchInput.current !== null) {
      const si = searchInput.current as any;
      si.focus();
    }
  }
  useEffect(() => {
    // current property is refered to input element
    handleFocus();
  }, []);

  const user = $user.getState();
  const contract = useStore($contract);
  const doc = useStore($doc);
  const net = useStore($net);

  const [input, setInput] = useState(""); // the beneficiary address
  const [legend, setLegend] = useState("save");
  const [button, setButton] = useState("button primary");
  const [txID, setTxID] = useState("");

  const handleSave = async () => {
    setLegend("saved");
    setButton("button");
  };
  const handleInput = (event: { target: { value: any } }) => {
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
        toast.error("wrong address.", {
          position: "top-right",
          autoClose: 2000,
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
  const handleOnKeyPress = async ({
    key,
  }: React.KeyboardEvent<HTMLInputElement>) => {
    if (key === "Enter") {
      handleSave();
    }
  };

  const handleSubmit = async () => {
    if (contract !== null) {
      try {
        toast.info(`You're about to transfer the ${user?.name} NFT Username.`, {
          position: "top-center",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "dark",
        });

        const zilpay = new ZilPayBase();
        const username = user?.name as string;
        const guardianship = await tyron.TyronZil.default.OptionParam(
          tyron.TyronZil.Option.some,
          "ByStr20",
          input
        );
        const id = "tyron";
        const tyron_ = await tyron.TyronZil.default.OptionParam(
          tyron.TyronZil.Option.none,
          "Uint128"
        );

        const params = Array();
        const username_ = {
          vname: "username",
          type: "String",
          value: username,
        };
        params.push(username_);
        const addr_ = {
          vname: "newAddr",
          type: "ByStr20",
          value: input,
        };
        params.push(addr_);
        const guardianship_ = {
          vname: "guardianship",
          type: "Option ByStr20",
          value: guardianship,
        };
        params.push(guardianship_);
        const id_ = {
          vname: "id",
          type: "String",
          value: id,
        };
        params.push(id_);

        if (
          Number(doc?.version.slice(8, 9)) >= 4 ||
          doc?.version.slice(0, 3) === "dao"
        ) {
          const amount_ = {
            vname: "amount",
            type: "Uint128",
            value: "0", //0 because ID is tyron
          };
          params.push(amount_);
        }

        const tyron__ = {
          vname: "tyron",
          type: "Option Uint128",
          value: tyron_,
        };
        params.push(tyron__);
        await zilpay
          .call({
            contractAddress: contract.addr,
            transition: "TransferNFTUsername",
            params: params as unknown as Record<string, unknown>[],
            amount: String(0),
          })
          .then((res) => {
            setTxID(res.ID);
          });
      } catch (error) {
        const err = error as string;
        toast.error(err, {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "dark",
        });
      }
    } else {
      toast.error("some data is missing.", {
        position: "top-right",
        autoClose: 2000,
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
    <div style={{ marginBottom: "14%", textAlign: "center" }}>
      <h3 style={{ marginBottom: "7%" }}>
        Transfer <span className={styles.username}>{user?.name}</span> NFT
        Username
      </h3>
      {txID === "" && (
        <>
          <p className={styles.containerInput}>
            Recipient:
            <input
              ref={searchInput}
              type="text"
              style={{ width: "100%", marginLeft: "2%" }}
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
          </p>
          {input !== "" && (
            <div style={{ marginTop: "14%", textAlign: "center" }}>
              <button className={button} onClick={handleSubmit}>
                <p>
                  Transfer <span className={styles.username}>{user?.name}</span>{" "}
                  NFT Username
                </p>
              </button>
              <h5 style={{ marginTop: "3%" }}>around 13 ZIL</h5>
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
            {txID.slice(0, 22)}...
          </a>
        </h5>
      )}
    </div>
  );
}

export default Component;
