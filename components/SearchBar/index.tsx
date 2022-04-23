import React, { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import {
  SMART_CONTRACTS_URLS,
  VALID_SMART_CONTRACTS,
} from "../../src/constants/tyron";
import { DOMAINS } from "../../src/constants/domains";
import { fetchAddr, isValidUsername, isAdminUsername, resolve } from "./utils";
import styles from "./styles.module.scss";
import { $user, updateUser } from "../../src/store/user";
import { useStore } from "effector-react";
import { updateContract } from "../../src/store/contract";
import { updateDoc } from "../../src/store/did-doc";
import { updateLoggedIn } from "../../src/store/loggedIn";
import { updateDonation } from "../../src/store/donation";
import { $isController, updateIsController } from "../../src/store/controller";
import { $loading, updateLoading } from "../../src/store/loading";
import { $net } from "../../src/store/wallet-network";
import { $contract } from "../../src/store/contract";
import { $zil_address } from "../../src/store/zil_address";

function Component() {
  const callbackRef = useCallback((inputElement) => {
    if (inputElement) {
      inputElement.focus();
    }
  }, []);

  const Router = useRouter();
  const net = useStore($net);
  const user = useStore($user);
  const username = user?.name!;
  const domain = user?.domain!;
  const is_controller = useStore($isController);
  const loading = useStore($loading);

  const [search, setSearch] = useState("");

  const spinner = (
    <i className="fa fa-lg fa-spin fa-circle-notch" aria-hidden="true"></i>
  );

  // Resolve URL

  const checkPath = () => {
    const input = window.location.pathname.replace("/", "").toLowerCase();
    if (input === "") {
      return false;
    } else if (input === "XPoints") {
      return false;
    } else if (
      input.split("/")[1] === "did" ||
      input.split("/")[1] === "xwallet" ||
      input.split("/")[1] === "recovery" ||
      input.split("/")[1] === "funds" ||
      input.split("/")[1] === "buy" ||
      input.split(".")[1] === "did" ||
      input.split(".")[1] === "ssi" ||
      input.split(".")[1] === "vc" ||
      input.split(".")[1] === "treasury"
    ) {
      return false;
    } else {
      return true;
    }
  };

  const checkDomain = () => {
    const path = window.location.pathname.replace("/", "").toLowerCase();
    if (
      path.split(".")[1] === "did" ||
      path.split(".")[1] === "ssi" ||
      path.split(".")[1] === "vc" ||
      path.split(".")[1] === "treasury"
    ) {
      return true;
    } else {
      return false;
    }
  };

  const setUsername = () => {
    const path = window.location.pathname.replace("/", "").toLowerCase();
    if (checkPath()) {
      return path;
    } else if (checkDomain()) {
      return path.split(".")[0];
    } else if (path.includes(".did") && path.includes("/")) {
      return path.split("/")[0].split(".")[0];
    } else if (
      path.split("/")[1] === "did" ||
      path.split("/")[1] === "funds" ||
      path.split("/")[1] === "recovery" ||
      path.split("/")[1] === "buy"
    ) {
      return path.split("/")[0];
    } else {
      return username;
    }
  };

  const setDomain = () => {
    const path = window.location.pathname.replace("/", "").toLowerCase();
    if (path.includes(".ssi")) {
      return "did";
    } else if (checkPath()) {
      return "did";
    } else if (checkDomain()) {
      return path.split(".")[1];
    } else if (
      path.split("/")[1] === "did" ||
      path.split("/")[1] === "funds" ||
      path.split("/")[1] === "recovery" ||
      path.split("/")[1] === "buy"
    ) {
      return "did";
    } else {
      return domain;
    }
  };

  useEffect(() => {
    const path = window.location.pathname.replace("/", "").toLowerCase();

    if (path.includes(".vc") || path.includes(".treasury")) {
      if (path.includes("/")) {
        Router.push(`/${path.split("/")[0]}`);
      } else if (isValidUsername(path.split(".")[0])) {
        getResults();
      } else {
        Router.push("/");
      }
    } else if (path.split("/")[1] === "xwallet" && !is_controller) {
      Router.push(`/${path.split("/")[0]}`);
    } else if (path.includes(".did") && path.includes("/")) {
      Router.push(`/${path.split("/")[0].split(".")[0]}/${path.split("/")[1]}`);
      getResults();
    } else if (
      path.includes(".tyron") &&
      VALID_SMART_CONTRACTS.includes(path.split(".")[0])
    ) {
      window.open(SMART_CONTRACTS_URLS[path.split(".")[0]]);
      Router.push("/");
    } else if (path !== "") {
      getResults();
    } else {
      setTimeout(() => {
        updateLoading(false);
      }, 1000);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleOnChange = ({
    currentTarget: { value },
  }: React.ChangeEvent<HTMLInputElement>) => {
    Router.push("/");
    updateLoggedIn(null);
    updateDonation(null);
    updateContract(null);

    const input = value.toLowerCase();
    setSearch(input);
    if (value.includes(".")) {
      const [username = "", domain = ""] = input.split(".");
      updateUser({
        name: username,
        domain: domain === "ssi" ? "did" : domain,
      });
    } else {
      updateUser({
        name: input,
        domain: "did",
      });
    }
  };

  const handleOnKeyPress = ({ key }: React.KeyboardEvent<HTMLInputElement>) => {
    if (key === "Enter") {
      getResults();
    }
  };

  const resolveDid = async () => {
    const path = window.location.pathname.replace("/", "").toLowerCase();
    const _username = setUsername();
    const _domain = setDomain();
    if (isValidUsername(_username)) {
      await fetchAddr({ net, _username, _domain })
        .then(async (addr) => {
          if (_username === "xpoints") {
            Router.push("/XPoints");
          } else {
            try {
              await resolve({ net, addr })
                .then((result) => {
                  if (path === "" || path.includes("/buy")) {
                    Router.push(`/${_username}`);
                  }
                  const controller = result.controller.toLowerCase();
                  updateContract({
                    addr: addr,
                    controller: controller,
                    status: result.status,
                  });
                  updateDoc({
                    did: result.did,
                    version: result.version,
                    doc: result.doc,
                    dkms: result.dkms,
                    guardians: result.guardians,
                  });
                })
                .catch((err) => {
                  throw err;
                });
            } catch (error) {
              toast("Coming soon!", {
                position: "top-left",
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
        })
        .catch(() => {
          toast(`Coming soon`, {
            position: "top-center",
            autoClose: 2000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "dark",
          });
          //Router.push(`/${_username}/buy`);
        });
    } else {
      Router.push("/");
      setTimeout(() => {
        toast.error(
          "Invalid username. Names with less than seven characters are premium and will be for sale later on.",
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
      }, 1000);
    }
  };

  const resolveDomain = async () => {
    const path = window.location.pathname.replace("/", "").toLowerCase();
    const _username = username === undefined ? path.split(".")[0] : username;
    const _domain = domain === undefined ? path.split(".")[1] : domain;
    await fetchAddr({ net, _username, _domain: "did" })
      .then(async (addr) => {
        const result = await resolve({ net, addr });
        await fetchAddr({ net, _username, _domain })
          .then(async (domain_addr) => {
            const controller = result.controller;
            updateContract({
              addr: domain_addr,
              controller: controller,
              status: result.status,
            });
            updateDoc({
              did: result.did,
              version: result.version,
              doc: result.doc,
              dkms: result.dkms,
              guardians: result.guardians,
            });
            switch (_domain) {
              case DOMAINS.VC:
                Router.push(`/${_username}.vc`);
                break;
              case DOMAINS.TREASURY:
                Router.push(`/${_username}.treasury`);
                break;
              default:
                Router.push(`/${_username}`);
                break;
            }
          })
          .catch(() => {
            Router.push("/");
            setTimeout(() => {
              toast.error(`Uninitialized DID Domain`, {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "dark",
              });
            }, 1000);
          });
      })
      .catch(() => {
        Router.push(`/${_username}/buy`);
      });
  };

  const getResults = async () => {
    updateLoading(true);
    updateIsController(false);
    updateDonation(null);

    const path = window.location.pathname.replace("/", "").toLowerCase();
    setSearch(`${setUsername()}.${setDomain()}`);
    updateUser({
      name: setUsername(),
      domain: setDomain(),
    });
    switch (setDomain()) {
      case DOMAINS.TYRON:
        if (VALID_SMART_CONTRACTS.includes(username))
          window.open(
            SMART_CONTRACTS_URLS[
              username as unknown as keyof typeof SMART_CONTRACTS_URLS
            ]
          );
        else
          toast.error("Invalid smart contract", {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "dark",
          });
        break;
      case DOMAINS.DID:
        await resolveDid();
        break;
      case DOMAINS.SSI:
        await resolveDomain();
        break;
      case DOMAINS.VC:
        await resolveDomain();
        break;
      case DOMAINS.TREASURY:
        await resolveDomain();
        break;
      case DOMAINS.PSC:
        toast("Coming soon!", {
          position: "top-left",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "dark",
        }); //await resolveDomain();
        break;
      case DOMAINS.DEX:
        await resolveDomain();
        break;
      case DOMAINS.STAKE:
        await resolveDomain();
        break;
      default:
        toast.error("Invalid domain", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "dark",
        });
        break;
    }
    setTimeout(() => {
      updateLoading(false);
    }, 1000);
  };

  return (
    <div className={styles.container}>
      <div className={styles.searchDiv}>
        <label htmlFor="">Search for an SSI username</label>
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
          <button onClick={getResults} className={styles.searchBtn}>
            {loading ? spinner : <i className="fa fa-search"></i>}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Component;
