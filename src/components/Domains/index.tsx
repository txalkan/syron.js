import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ConnectWallet } from "../index";

function Domains() {
  const [username, setUsername] = useState("");
  const [domain, setDomain] = useState("mapu");
  const [taken, setTaken] = useState("no");

  const handleUsername = ({ target: { value } }: React.ChangeEvent<HTMLInputElement>) => {
    // @TODO: Improve this to show an error if conditions aren't met.
    const regex = /^[\w\d_]+$/;
    if (!regex.test(value) || value.length < 5 || value.length > 15) {
    } else {
      setUsername(value);
    }
  };

  const handleDomain = ({ target: { value } }: React.ChangeEvent<HTMLSelectElement>) => setDomain(value);

  const handleReset = () => {
    setTaken("no");
  };

  console.log()

  return (
    <div id="main">
      <span
        role="img"
        aria-label="back arrow"
        style={{ marginTop: "7%", marginBottom: "2%" }}
      >
        <Link to="/">🔙</Link>
      </span>
      <h2 style={{ width: "100%", textAlign: "center" }}>Domains</h2>
      <section style={{ width: "100%" }}>
        <p>
          Search for a <i>username.domain</i> to access its public profile - or
          if it's available, you can register it!
        </p>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Domain</th>
                <th>For</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>.ssi</td>
                <td>Self-sovereign digital identities</td>
              </tr>
              <tr>
                <td>.did</td>
                <td>Decentralized identifier smart contracts</td>
              </tr>
              <tr>
                <td>.mapu</td>
                <td>Self-sovereign decentralized communities</td>
              </tr>

              <tr>
                <td>.agent</td>
                <td>SSI Agents</td>
              </tr>
              <tr>
                <td>.tyron</td>
                <td>Tyron smart contracts</td>
              </tr>
            </tbody>
          </table>
        </div>
        <form onChange={handleReset} onSubmit={(e) => e.preventDefault()}>
          <div className="fields">
            <div className="field half">
              <label>Username</label>
              <input type="text" onChange={handleUsername} />
            </div>
            <div className="field half">
              <label htmlFor="domain">Domain</label>
              <select onChange={handleDomain}>
                <option value="mapu">.mapu</option>
              </select>
            </div>
          </div>
          <ul className="actions">
            <li>
              <input
                className="button primary"
                type="button"
                value="Search"
                onClick={() => {
                  // @TODO: Implement this once zilliqa contracts are done
                }}
              />
            </li>
            <li>
              <input type="reset" value="Reset" onClick={handleReset} />
            </li>
          </ul>
        </form>
      </section>
      <section style={{ width: "100%" }}>
        {username !== "" && (
          <ConnectWallet
            taken={taken}
            username={username}
            domain={domain}
          />
        )}
      </section>
    </div>
  );
}

export default Domains;
