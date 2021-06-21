import React from "react";
import { Domains, Contact } from '../index';
import styles from './styles.module.scss';

function Footer() {
  return (
    <footer id="footer">
      {/* <div id="header" className={styles.container}>
        <nav className={styles.nav}>
          <ul>
            <li>
              <Domains />
            </li>
            <li>
              <Contact />
            </li>
          </ul>
        </nav>
      </div> */}
      <ul className="icons" style={{ marginTop: "0.5%" }}>
        <li>
          <a
            href="https://github.com/Zillacracy-org/ssibrowser.com"
            className="icon brands fa-github"
          >
            <span className="label">GitHub</span>
          </a>
        </li>
      </ul>
    </footer>
  );
}

export default Footer;
