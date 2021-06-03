import React from 'react';
import { Link } from 'react-router-dom';

import { ArConnect } from '../index';
import styles from './styles.module.scss';

function Home() {
  return (
    <>
      <ArConnect className={styles.signin} />
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
    </>
  );
}

export default Home;
