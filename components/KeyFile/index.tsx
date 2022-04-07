import { JWKInterface } from "arweave/node/lib/wallet";
import React, { useState } from "react";
import { toast } from "react-toastify";
import arweave from "../../src/config/arweave";
import { useDispatch } from "../../src/context";
import { actionsCreator } from "../../src/context/user/actions";
import styles from "./styles.module.scss";

function KeyFile() {
  const [keyFile, setKeyFile] = useState<JWKInterface>();
  const [saveFile, setSaveFile] = useState(false);
  const [buttonLegend, setButtonLegend] = useState("Save keyfile");

  const dispatch = useDispatch();
  const files = React.createRef<any>();

  const handleOnChange = (event: any) => {
    event.preventDefault();
    const file = files.current.files[0];
    if (file) {
      const fileReader = new FileReader();
      fileReader.onload = ({ target }) => {
        const result = target?.result as string;
        if (result) setKeyFile(JSON.parse(result));
      };
      fileReader.readAsText(file);
    }
    setSaveFile(true);
  };

  const handleSaveFile = async () => {
    try {
      const arAddress = await arweave.wallets.jwkToAddress(keyFile);
      toast.info(`This keyfile's address is: ${arAddress}`, {
        position: "top-center",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
      dispatch(actionsCreator.setArAddress(arAddress));
      if (keyFile) {
        dispatch(actionsCreator.setKeyfile(keyFile));
      }
      setButtonLegend("Saved");
    } catch (e) {
      toast.info("Select file first.", {
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
    <>
      <div className={styles.container}>
        <input type="file" ref={files} onChange={handleOnChange} />
        <>
          {saveFile && buttonLegend !== "Saved" && (
            <button
              type="button"
              className={styles.save}
              onClick={handleSaveFile}
            >
              <p className={styles.buttonText}>{buttonLegend}</p>
            </button>
          )}
          {buttonLegend === "Saved" && (
            <button
              type="button"
              className={styles.save}
              onClick={() =>
                toast.info("Your keyfile got saved already.", {
                  position: "top-center",
                  autoClose: 2000,
                  hideProgressBar: false,
                  closeOnClick: true,
                  pauseOnHover: true,
                  draggable: true,
                  progress: undefined,
                  theme: "dark",
                })
              }
            >
              <p className={styles.buttonText}>{buttonLegend}</p>
            </button>
          )}
        </>
      </div>
    </>
  );
}

export default KeyFile;
