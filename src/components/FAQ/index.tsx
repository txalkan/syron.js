import React from 'react';
import styles from './styles.module.scss';

function FAQ() {
    const handleOnClick = () => {
        alert('Coming soon.')
    };

    return (
        <>
            <button className={styles.button} onClick={handleOnClick}>
                FAQ
            </button>
        </>
    );
}

//@todo-ui reposition button so that when the public identity is ON, it all fits in one page (no scroll down)
export default FAQ;
