import React from 'react';
import styles from './styles.module.scss';

function FAQ() {
    const handleOnClick = () => {
        window.open("https://ssiprotocol.notion.site/ZILHive-Hackathon-NFT-Username-DNS-799a69b70157427b8890f463461b96d3")
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
