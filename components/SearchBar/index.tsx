import React, { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import {
  SMART_CONTRACTS_URLS,
  VALID_SMART_CONTRACTS,
} from "../../src/constants/tyron";
import { DOMAINS } from "../../src/constants/domains";
import { fetchAddr, isValidUsername, resolve } from "./utils";
import styles from "./styles.module.scss";
import { $user, updateUser } from "../../src/store/user";
import { useStore } from "effector-react";
import { updateContract } from "../../src/store/contract";
import { updateDoc } from "../../src/store/did-doc";
import { updateLoggedIn } from "../../src/store/loggedIn";
import { updateDonation } from "../../src/store/donation";
import { $wallet } from "../../src/store/wallet";
import { updateIsAdmin } from "../../src/store/admin";
import { $net } from "../../src/store/wallet-network";

function Component() {
  const callbackRef = useCallback((inputElement) => {
    if (inputElement) {
      inputElement.focus();
    }
  }, []);

  const Router = useRouter();
  const net = useStore($net);
  const zil_address = useStore($wallet);
  const user = useStore($user); //@todo learn the difference between useStore & getState to share in the sprint3 file

  const [input, setInput] = useState("");
  const [thisName, setName] = useState("");
  const [thisDomain, setDomain] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Resolve URL

  const checkPath = () => {
    const input = window.location.pathname.replace("/", "").toLowerCase();
    if (input === "") {
      return false;
    } else if (
      input.split("/")[1] === "did" ||
      input.split("/")[1] === "buy" ||
      input.split("/")[1] === "xwallet" ||
      input.split("/")[1] === "funds" ||
      input.split("/")[1] === "recovery" ||
      input.split(".")[1] === "tyron" ||
      input.split(".")[1] === "did" ||
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
    const dom = path.split('.')[1];
    if (
      dom === 'tyron' || 'did' || 'vc' || 'treasury'
    ) {
      return true
    } else {
      return false
    }
  }

  useEffect(() => {

    //@todo review
    const path = window.location.pathname.replace("/", "").toLowerCase();

    //@todo reorg the following so it is easier to read
    const name_ = checkPath() ? path : checkDomain() ? path.split('.')[0] : path.split('/')[0];
    const domain_ = checkPath() ? 'did' : checkDomain() ? path.split('.')[1] : 'did';
    setName(name_); setDomain(domain_);

    if (path !== "") {
      getResults();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Resolve input in search bar

  const spinner = (
    <i className="fa fa-lg fa-spin fa-circle-notch" aria-hidden="true"></i>
  );

  const handleOnChange = ({
    currentTarget: { value },
  }: React.ChangeEvent<HTMLInputElement>) => {
    Router.push("/");
    setError("");
    updateLoggedIn(null);
    updateDonation(null);
    updateContract(null);
    updateIsAdmin({
      verified: false,
      hideWallet: true,
    });

    const input = value.toLowerCase();
    setInput(input);
    if (value.includes(".")) {
      const [username = "", domain = ""] = input.split(".");
      setName(username);
      setDomain(domain);
    } else {
      setName(input);
      setDomain('did');
    }
  };

  const handleOnKeyPress = ({ key }: React.KeyboardEvent<HTMLInputElement>) => {
    if (key === "Enter") {
      getResults();
    }
  };

  const resolveDid = async () => {
    await fetchAddr({ net, _username: user?.name!, _domain: user?.domain! })
      .then(async (addr) => {
        if (user?.name === "xpoints") {
          Router.push("/XPoints");
        } else {
          try {
            await resolve({ net, addr })
              .then((result) => {
                Router.push(`/${user?.name}`);
                const controller = result.controller.toLowerCase();
                updateContract({
                  addr: addr,
                  controller: controller,
                  status: result.status,
                });
                if (controller === zil_address?.base16.toLowerCase()) {
                  updateIsAdmin({
                    verified: true,
                    hideWallet: true,
                  });
                } else {
                  updateIsAdmin({
                    verified: false,
                    hideWallet: true,
                  });
                }
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
            toast('Coming soon!', {
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
      })
      .catch(() => {
        Router.push(`/${user?.name}/buy`);
      });
  };

  const resolveDomain = async () => {
    await fetchAddr({ net, _username: user?.name!, _domain: "did" })
      .then(async (addr) => {
        const result = await resolve({ net, addr });
        await fetchAddr({ net, _username: user?.name!, _domain: thisDomain })
          .then(async (domain_addr) => {
            const controller = result.controller;
            if (
              controller.toLowerCase() === zil_address?.base16.toLowerCase()
            ) {
              updateIsAdmin({
                verified: true,
                hideWallet: true,
              });
            } else {
              updateIsAdmin({
                verified: false,
                hideWallet: true,
              });
            }
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
            switch (thisDomain) {
              case DOMAINS.VC:
                Router.push(`/${user?.name}.vc`);
                break;
              case DOMAINS.TREASURY:
                Router.push(`/${user?.name}.treasury`);
                break;
              default:
                Router.push(`/${user?.name}`);
                break;
            }
          })
          .catch(() => {
            setError(
              `Initialize this xWallet domain  at ${user?.name}'s NFT Username DNS.`
            );
          });
      })
      .catch(() => {
        Router.push("/BuyNFTUsername");
      });
  };

  const getResults = async () => {
    setLoading(true);
    setError("");
    updateDonation(null);
    updateIsAdmin({
      verified: false,
      hideWallet: true,
    });
    if (
      isValidUsername(thisName) ||
      //@todo move the following exceptions to isValidUsername in utils
      thisName === "init" ||
      thisName === "tyron" ||
      thisName === "donate" ||
      thisName === "wfp"
    ) {
      updateUser({
        name: thisName,
        domain: thisDomain
      })
      switch (thisDomain) {
        case DOMAINS.TYRON:
          if (VALID_SMART_CONTRACTS.includes(user?.name!))
            window.open(
              SMART_CONTRACTS_URLS[
              user?.name as unknown as keyof typeof SMART_CONTRACTS_URLS
              ]
            );
          else
            toast('Invalid smart contract.', {
              position: "top-left",
              autoClose: 2000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
              theme: 'dark',
            });
          break;
        case DOMAINS.DID:
          await resolveDid();
          break;
        case DOMAINS.VC:
          await resolveDomain();
          break;
        case DOMAINS.TREASURY:
          await resolveDomain();
          break;
        case DOMAINS.PSC:
          toast('Coming soon!', {
            position: "top-left",
            autoClose: 2000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: 'dark',
          }); //await resolveDomain();
          break;
        case DOMAINS.DEX:
          await resolveDomain();
          break;
        case DOMAINS.STAKE:
          await resolveDomain();
          break;
        default:
          toast('Invalid domain.', {
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
    } else {
      setTimeout(() => {
        toast.error("Invalid username. Names with less than seven characters are premium and will be for sale later on.", {
          position: "top-left",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: 'dark',
        });
      }, 1000);
    }
    setLoading(false);
  };

  return (
    <div className={styles.container}>
      <div className={styles.searchDiv}>
        <label htmlFor="">Type an SSI username</label>
        <input
          ref={callbackRef}
          type="text"
          className={styles.searchBar}
          onChange={handleOnChange}
          onKeyPress={handleOnKeyPress}
          value={input || user?.name}
          placeholder={user?.name} // @todo username.domain
          autoFocus
        />
        <div>
          <button onClick={getResults} className={styles.searchBtn}>
            {loading ? spinner : <i className="fa fa-search"></i>}
          </button>
        </div>
      </div>
      {error !== "" && <code>Error: {error}</code>}
    </div>
  );
}

export default Component;
