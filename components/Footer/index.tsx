import React from "react";
import styles from "../../styles/css/Footer.module.css";

function Footer() {
  return (
    <footer
      className={styles.footer}
      style={{ marginLeft: "4%", marginTop: "2%" }}
    >
      <p>
        <a
          className="icon brands fa-discord"
          href="https://discord.gg/NPbd92HJ7e"
          rel="noreferrer"
          target="_blank"
        >
          <span className="label">Discord</span>
        </a>
      </p>
      <p>
        <a
          className="icon brands fa-twitter"
          href="https://twitter.com/ssiprotocol"
          rel="noreferrer"
          target="_blank"
        >
          <span className="label">Twitter</span>
        </a>
      </p>
      <p>
        <a
          className="icon brands fa-github"
          href="https://github.com/tyroncoop/ssibrowser"
          rel="noreferrer"
          target="_blank"
        >
          <span className="label">GitHub</span>
        </a>
      </p>
      <p>
        <a
          className="icon brands fa-instagram"
          href="https://www.instagram.com/ssiprotocol/"
          rel="noreferrer"
          target="_blank"
        >
          <span className="label">Instagram</span>
        </a>
      </p>
    </footer>
  );
}

export default Footer;
