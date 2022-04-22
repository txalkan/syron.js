import React, { useState, useCallback } from "react";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import { fetchAddr, isValidUsername } from "../utils";
import styles from "./styles.module.scss";
import { updateUser } from "../../../src/store/user";
import { useStore } from "effector-react";
import { updateContract } from "../../../src/store/contract";
import { updateDonation } from "../../../src/store/donation";
import { $loading, updateLoading } from "../../../src/store/loading";
import { $net } from "../../../src/store/wallet-network";
import { showBuyNFTModal, setSsiModal } from "../../../src/app/actions";
import { useDispatch } from "react-redux";

function Component() {
  const Router = useRouter();
  const dispatch = useDispatch();
  const net = useStore($net);
  const loading = useStore($loading);

  const callbackRef = useCallback((inputElement) => {
    if (inputElement) {
      inputElement.focus();
    }
  }, []);

  const [search, setSearch] = useState("");
  const [name, setName] = useState("");
  const [avail, setAvail] = useState(true);

  const spinner = (
    <i className="fa fa-lg fa-spin fa-circle-notch" aria-hidden="true"></i>
  );

  const handleOnChange = ({
    currentTarget: { value },
  }: React.ChangeEvent<HTMLInputElement>) => {
    Router.push("/");
    updateDonation(null);
    updateContract(null);

    const input = value.toLowerCase();
    setSearch(input);
    setName(input);
    if (input.includes(".")) {
      const [username = "", domain = ""] = input.split(".");
      if (domain !== "did") {
        toast.warning("Only .did domain is available", {
          position: "top-left",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "dark",
          toastId: 3,
        });
      }
      setName(username);
    }
  };

  const handleOnKeyPress = ({ key }: React.KeyboardEvent<HTMLInputElement>) => {
    if (key === "Enter") {
      resolveDid(name);
    }
  };

  const resolveDid = async (_username: string) => {
    setAvail(true);
    if (isValidUsername(_username)) {
      setSearch(`${_username}.did`);
      updateLoading(true);
      await fetchAddr({ net, _username, _domain: "did" })
        .then(async () => {
          setAvail(false);
          updateLoading(false);
        })
        .catch(() => {
          updateLoading(false);
          updateUser({
            name: _username,
            domain: "did",
          });
          dispatch(setSsiModal(false));
          dispatch(showBuyNFTModal(true));
        });
    } else {
      toast.error(
        "Invalid username. Names with less than six characters are premium and will be for sale later on.",
        {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "dark",
        }
      );
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.searchDiv}>
        <label htmlFor="">Search for an SSI username</label>
        <div className={styles.searchWrapper}>
          <input
            ref={callbackRef}
            type="text"
            className={styles.searchBar}
            onChange={handleOnChange}
            onKeyPress={handleOnKeyPress}
            value={search}
            placeholder={search}
            autoFocus
          />
          <div>
            <button
              onClick={() => resolveDid(name)}
              className={styles.searchBtn}
            >
              {loading ? spinner : <i className="fa fa-search"></i>}
            </button>
          </div>
        </div>
        {!avail && (
          <div style={{ marginTop: "2%" }}>
            <code>Username not available</code>
          </div>
        )}
      </div>
    </div>
  );
}

export default Component;
