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
import { updateIsController } from "../../src/store/controller";
import { $loading, updateLoading } from "../../src/store/loading";
import { $net } from "../../src/store/wallet-network";

function Component() {
  const callbackRef = useCallback((inputElement) => {
    if (inputElement) {
      inputElement.focus();
    }
  }, []);
  useEffect(() => {
    if (user?.name === undefined) {
      const path = window.location.pathname.toLowerCase();
      const first = path.split("/")[1];
      let username = first;
      let domain = "did";
      if (first.includes(".")) {
        username = first.split(".")[0];
        domain = first.split(".")[1];
      }
      if (username !== "") {
        getResults(username, domain);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const Router = useRouter();
  const net = useStore($net);
  const user = useStore($user);
  const loading = useStore($loading);

  const [search, setSearch] = useState("");
  const [name, setName] = useState("");
  const [dom, setDomain] = useState("");

  const spinner = (
    <i className="fa fa-lg fa-spin fa-circle-notch" aria-hidden="true"></i>
  );

  const handleOnChange = ({
    currentTarget: { value },
  }: React.ChangeEvent<HTMLInputElement>) => {
    Router.push("/");
    updateLoggedIn(null); //@todo add LogIn in the menu (S6)
    updateDonation(null);
    updateContract(null);

    const input = value.toLowerCase();
    setSearch(input);
    setName(input);
    setDomain("did");
    if (input.includes(".")) {
      const [username = "", domain = ""] = input.split(".");
      setName(username);
      setDomain(domain);
    }
  };

  const handleOnKeyPress = ({ key }: React.KeyboardEvent<HTMLInputElement>) => {
    if (key === "Enter") {
      getResults(name, dom);
    }
  };

  const resolveDid = async (_username: string, _domain: DOMAINS) => {
    await fetchAddr({ net, _username, _domain: "did" })
      .then(async (addr) => {
        await resolve({ net, addr })
          .then(async (result) => {
            const did_controller = result.controller.toLowerCase();

            updateDoc({
              did: result.did,
              version: result.version,
              doc: result.doc,
              dkms: result.dkms,
              guardians: result.guardians,
            });

            const path = window.location.pathname.toLowerCase();
            const second = path.split("/")[2];

            if (_domain === DOMAINS.DID) {
              updateContract({
                addr: addr,
                controller: did_controller,
                status: result.status,
              });
              const third = path.split("/")[3];

              Router.push(`/${_username}`);

              if (second === "funds") {
                Router.push(`/${_username}.${_domain}/funds`);
              } else if (second === "did") {
                if (third === "doc") {
                  Router.push(`/${_username}/did/doc`);
                } else if (third === "recovery") {
                  Router.push(`/${_username}/did/recovery`);
                }
              } else {
                Router.push(`/${_username}`);
              }
            } else {
              await fetchAddr({ net, _username, _domain })
                .then(async (domain_addr) => {
                  updateContract({
                    addr: domain_addr,
                    controller: did_controller,
                    status: result.status,
                  });
                  switch (_domain) {
                    case DOMAINS.DEFI:
                      if (second === "funds") {
                        Router.push(`/${_username}.${_domain}/funds`);
                      } else {
                        Router.push(`/${_username}.${_domain}/defi`);
                      }
                      break;
                    case DOMAINS.VC:
                      Router.push(`/${_username}.vc`);
                      break;
                    case DOMAINS.TREASURY:
                      Router.push(`/${_username}.treasury`);
                      break;
                    default:
                      //Router.push(`/${_username}`);
                      break;
                  }
                })
                .catch(() => {
                  toast.error(`Uninitialized DID Domain.`, {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "dark",
                  });
                  Router.push(`/${_username}`);
                });
            }
          })
          .catch(() => {
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
          });
      })
      .catch(() => {
        Router.push(`/${_username}/buy`);
      });
  };

  const getResults = async (_username: string, _domain: string) => {
    updateLoading(true);
    updateIsController(false);
    updateDonation(null);

    //@todo remove: const path = window.location.pathname.replace("/", "").toLowerCase();

    updateUser({
      name: _username,
      domain: _domain,
    });
    setSearch(`${_username}.${_domain}`);

    if (_username === "xpoints") {
      Router.push("/xPoints");
    } else if (isValidUsername(_username)) {
      switch (_domain) {
        case DOMAINS.TYRON:
          if (VALID_SMART_CONTRACTS.includes(_username))
            window.open(
              SMART_CONTRACTS_URLS[
                _username as unknown as keyof typeof SMART_CONTRACTS_URLS
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
          await resolveDid(_username, _domain);
          break;
        case DOMAINS.VC:
          await resolveDid(_username, _domain);
          break;
        case DOMAINS.TREASURY:
          await resolveDid(_username, _domain);
          break;
        case DOMAINS.DEFI:
          await resolveDid(_username, _domain);
          break;
        default:
          toast.error("Invalid domain.", {
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
    } else {
      if (_username !== "") {
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
      setTimeout(() => {
        Router.push("/");
      }, 3000);
      setTimeout(() => {
        updateLoading(false);
      }, 4000);
    }
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
          <button
            onClick={() => getResults(name, dom)}
            className={styles.searchBtn}
          >
            {loading ? spinner : <i className="fa fa-search"></i>}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Component;
