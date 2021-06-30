import { JWKInterface } from "arweave/node/lib/wallet";
import React, { useState } from "react";
import arweave from "../../config/arweave";
import { useDispatch } from "../../context";
import { actionsCreator } from "../../context/user/actions";

export interface IKeyFile {
  className?: string;
}

function KeyFile({ className }: IKeyFile) {
  const [keyFile, setKeyFile] = useState<JWKInterface>();
  const dispatch = useDispatch();

  const handleOnChange = ({
    currentTarget: { files },
  }: React.ChangeEvent<HTMLInputElement>) => {
    const file = files?.[0];
    if (file) {
      const fileReader = new FileReader();
      fileReader.onload = ({ target }) => {
        const result = target?.result as string;
        if (result) setKeyFile(JSON.parse(result));
      };
      fileReader.readAsText(file);
    }
  };

  const handleSaveFile = async () => {
    try {
      const address = await arweave.wallets.jwkToAddress(keyFile);
      dispatch(actionsCreator.setArAddress(address));
      dispatch(actionsCreator.setKeyfile(keyFile));
    } catch (e) {
      // @TODO: dispatch modal or toast with error
    }
  };

  return (
    <div className={className}>
      <input type="file" onChange={handleOnChange} />
      <button
        type="button"
        onClick={handleSaveFile}
      >
        Save
      </button>
    </div>
  );
}

export default KeyFile;
