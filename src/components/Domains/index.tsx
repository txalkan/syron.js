import React from 'react';
import { Link } from 'react-router-dom';

function Domains() {
  return (
    <div id="main">
      <span
        role="img"
        aria-label="back arrow"
        style={{ marginTop: '7%', marginBottom: '2%' }}
      >
        <Link to="/">🔙</Link>
      </span>
      <h2 style={{ width: '100%', textAlign: 'center' }}>Domains</h2>
      <section style={{ width: '100%' }}>
        <p>
          Search for a <i>username.domain</i> to access its public profile - or
          if it&apos;s available, you can register it!
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
                <td>.did</td>
                <td>Decentralized identifier smart contracts</td>
              </tr>
              <tr>
                <td>.mapu</td>
                <td>Self-sovereign decentralized communities</td>
              </tr>
              <tr>
                <td>.tyron</td>
                <td>Tyron smart contracts</td>
              </tr>
              <tr>
                <td>.ssi</td>
                <td>Self-sovereign digital identities</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default Domains;
