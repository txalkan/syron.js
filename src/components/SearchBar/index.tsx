import React, { useState } from "react";

import {
  SMART_CONTRACTS_URLS,
  VALID_SMART_CONTRACTS,
} from "../../constants/tyron";
import { DOMAINS } from "../../constants/domains";

import styles from "./styles.module.scss";

function SearchBar() {
  const [value, setValue] = useState("");
  const [name, setName] = useState("");
  const [domain, setDomain] = useState("");
  const [error, setError] = useState("");

  const handleOnKeyPress = ({ key }: React.KeyboardEvent<HTMLInputElement>) => {
    if (key === "Enter") {
      // @TODO: Handle other domains
      switch (domain) {
        case DOMAINS.TYRON:
          if (VALID_SMART_CONTRACTS.includes(name))
            window.open(
              SMART_CONTRACTS_URLS[
                name as unknown as keyof typeof SMART_CONTRACTS_URLS
              ]
            );
          else setError("Invalid smart contract");
          break;
        case DOMAINS.SSI:
          console.log("");
          break;
        default:
          setError("Domain not valid");
      }
    }
  };

  const handleSearchBar = ({
    currentTarget: { value },
  }: React.ChangeEvent<HTMLInputElement>) => {
    setValue(value);
    if (value) {
      const [name = "", domain = ""] = value.split(".");
      setName(name);
      setDomain(domain);
    } else {
      setError("");
    }
  };

  return (
    <div className={styles.container}>
      <input
        type="text"
        className={styles.searchBar}
        onKeyPress={handleOnKeyPress}
        onChange={handleSearchBar}
        value={value}
      />
      <p className={styles.errorMsg}>{error}</p>
    </div>
  );
}

export default SearchBar;
