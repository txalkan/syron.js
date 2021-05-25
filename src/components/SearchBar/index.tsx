import React, { useState } from "react";

import { SMART_CONTRACTS_URLS } from "../../constants/tyron";
import { DOMAINS } from "../../constants/domains";

import styles from "./styles.module.scss";

function SearchBar() {
  const [value, setValue] = useState("");
  const [error, setError] = useState("");

  const handleOnKeyPress = ({ key }: React.KeyboardEvent<HTMLInputElement>) => {
    if (key === "Enter") {
      console.log("Do magic stuff here");
    }
  };

  const handleSearchBar = ({
    currentTarget: { value },
  }: React.ChangeEvent<HTMLInputElement>) => {
    setValue(value);
    const [name, domain] = value.split(".");

    // @TODO: Handle other domains
    switch (domain) {
      case DOMAINS.TYRON:
        window.open(
          SMART_CONTRACTS_URLS[
            name as unknown as keyof typeof SMART_CONTRACTS_URLS
          ]
        ); break;
      case DOMAINS.SSI:
        console.log('');
        break;
      default:
        setError('Domain not valid');
    }
  };

  return (
    <>
      <input
        type="text"
        className={styles.searchBar}
        onKeyPress={handleOnKeyPress}
        onChange={handleSearchBar}
        value={value}
      />
      <p className={styles.errorMsg}>{error}</p>
    </>
  );
}

export default SearchBar;
