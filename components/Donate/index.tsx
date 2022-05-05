import React, { useState, useCallback } from "react";
import * as tyron from "tyron";
import { toast } from "react-toastify";
import { $donation, updateDonation } from "../../src/store/donation";
import { useStore } from "effector-react";
import { $net } from "../../src/store/wallet-network";
import { fetchAddr } from "../SearchBar/utils";
import { useSelector } from "react-redux";
import { RootState } from "../../src/app/reducers";
import { $contract } from "../../src/store/contract";

function Component() {
  const callbackRef = useCallback((inputElement) => {
    if (inputElement) {
      inputElement.focus();
    }
  }, []);

  const donation = $donation.getState();
  let donation_: string | undefined;

  let legend_ = "continue";
  let button_ = "button primary";

  if (donation === null) {
    donation_ = "ZIL amount";
  } else {
    donation_ = String(donation) + " ZIL";
    legend_ = "saved";
    button_ = "button";
  }

  const [legend, setLegend] = useState(`${legend_}`);
  const [button, setButton] = useState(`${button_}`);
  const net = useStore($net);
  const contract = useStore($contract);
  const loginInfo = useSelector((state: RootState) => state.modal);

  const handleSave = async () => {
    setLegend("saved");
    setButton("button");
  };

  const [input, setInput] = useState(0); // donation amount
  const handleInput = (event: { target: { value: any } }) => {
    updateDonation(null);
    setLegend("continue");
    setButton("button primary");
    let input = event.target.value;
    const re = /,/gi;
    input = input.replace(re, ".");
    input = Number(input);
    setInput(input);
    if (isNaN(input)) {
      input = 0;
    }
    setInput(input);
  };
  const handleOnKeyPress = ({ key }: React.KeyboardEvent<HTMLInputElement>) => {
    if (key === "Enter") {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    handleSave();
    updateDonation(input);
    const donation = $donation.getState();
    if (input !== 0) {
      try {

        // Fetch token address
        let token_addr: string;
        let network = tyron.DidScheme.NetworkNamespace.Mainnet;
        if (net === "testnet") {
          network = tyron.DidScheme.NetworkNamespace.Testnet;
        }
        const init = new tyron.ZilliqaInit.default(network);
        await fetchAddr({
          net,
          _username: "init",
          _domain: "did",
        })
          .then(async (init_addr) => {
            return await init.API.blockchain.getSmartContractSubState(
              init_addr,
              "xpoints"
            );
          })
          .then(async (get_services) => {
            const res = await tyron.SmartUtil.default.intoMap(
              get_services.result.services
            );
            console.log(res) // @todo-i tell the user their xPoints balance (check notion): got null here
            return res
          })
          .then(async (services) => {
            // Get token address
            token_addr = services.get(loginInfo.zilAddr?.base16);
            const balances = await init.API.blockchain.getSmartContractSubState(
              token_addr,
              "xpoints"
            );
            return await tyron.SmartUtil.default.intoMap(
              balances.result.balances
            );
          })
          .then((balances_) => {
            // Get balance of the logged in address
            const balance = balances_.get(contract?.addr!);
            if (balance !== undefined) {
              toast.info(`Thank you! You get ${donation} xPoints. Now you have ${balance / 1e12} xPoints`, {
                position: "bottom-center",
                autoClose: 4000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "dark",
              });
            }
          })
          .catch(() => {
            throw new Error("Not able to fetch balance.");
          });
      } catch (error) {
        toast.error(String(error), {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "dark",
          toastId: 5,
        });
      }
    } else {
      toast.info("Donating 0 ZIL => 0 xPoints", {
        position: "top-center",
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
    <div style={{ marginTop: "14%", marginBottom: "20%", width: "100%" }}>
      <p>
        How much would you like to send to the{" "}
        <a
          href="https://www.notion.so/ssiprotocol/TYRON-a-Network-for-Self-Sovereign-Identities-7bddd99a648c4849bbf270ce86c48dac#29c0e576a78b455fb23e4dcdb4107032"
          rel="noreferrer"
          target="_blank"
        >
          Donate Dapp
        </a>
        ?
      </p>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <input
            ref={callbackRef}
            style={{ width: "50%" }}
            type="text"
            placeholder={donation_}
            onChange={handleInput}
            onKeyPress={handleOnKeyPress}
            autoFocus
          />
          <code style={{ marginLeft: "5%" }}>= {input} xP</code>
        </div>
        <div>
          <input
            type="button"
            className={button}
            value={legend}
            onClick={() => {
              handleSubmit();
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default Component;
