import React from "react";
import { Link } from "react-router-dom";

import styles from './styles.module.scss';

function Home() {
  return (
    <div id="header" className={styles.container}>
      <nav className={styles.nav}>
        <ul>
          <li>
            <Link to="/domains">Domains</Link>
          </li>
          <li>
            <Link to="/contact">Join us</Link>
          </li>
        </ul>
      </nav>
    </div>
  );
}

export default Home;
