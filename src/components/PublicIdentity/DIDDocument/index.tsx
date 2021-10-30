import { useStore } from 'effector-react';
import React from 'react';
import { $doc } from 'src/store/did-doc';
import styles from './styles.module.scss';

function Component() {
    const doc = useStore($doc)?.doc;

    return (
        <div style={{ marginTop: '7%' }}>
            {   
                doc !== null &&
                doc?.map((res: any) => {
                    if(res[0] === 'DID services'){
                        return (
                            <div key={res} className={styles.docInfo}>
                                <h3 className={styles.blockHead}>
                                    {res[0]}
                                </h3>
                                {res[1].map((element: any) => {
                                    return (
                                        <p
                                            key={element}
                                            className={styles.did}
                                        >
                                            <span className={styles.id}>{element[0]}</span>
                                            <a style={{ marginLeft: '2%'}} href="@todo open links depending of type of DID service">
                                                {element[1]}
                                            </a>
                                        </p>
                                    );
                                })}
                            </div>
                        );
                    } else {
                        return (
                            <div key={res} className={styles.docInfo}>
                                <h3 className={styles.blockHead}>
                                    {res[0]}
                                </h3>
                                {res[1].map((element: any) => {
                                    return (//@todo copy to clipboard
                                        <p
                                            key={element}
                                            className={styles.did}
                                        >
                                            {element}
                                        </p>
                                    );
                                })}
                            </div>
                        );
                    }
                })
            }
        </div>
    );
}

export default Component
