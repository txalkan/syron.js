import React, { useState, useCallback } from "react";
import { toast } from "react-toastify";
import { $donation, updateDonation } from "../../src/store/donation";

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
      // @todo tell the user their xPoints balance
      toast.info(`Thank you! You'll get ${donation} xPoints.`, {
        position: "top-center",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
    } else {
      toast.info("Donating 0, thus 0 xPoints.", {
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
    <div style={{ marginTop: "20%", marginBottom: "20%", width: "100%" }}>
      <p>
        How much would you like to send to the{" "}
        <a
          href="https://ssiprotocol.notion.site/ssiprotocol/TYRON-a-network-for-self-sovereign-identities-3e39d78b34464d178f4490048d026941#bc71f38999684cd6a523c1062385799c"
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
