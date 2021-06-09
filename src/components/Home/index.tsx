import React from 'react';
import { Link } from 'react-router-dom';

import { MODALS } from '../../context/modal/types';
import { actionsCreator } from '../../context/modal/actions';
import { useDispatch } from '../../context/index';

import styles from './styles.module.scss';

function Home() {
  const dispatch = useDispatch();

  const handleOnClick = () => dispatch(actionsCreator.openModal(MODALS.LOG_IN));

  return (
    <>
      <button className={styles.signin} onClick={handleOnClick}>
        Connect
      </button>
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
