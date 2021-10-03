import { useStore } from 'effector-react';
import React from 'react';
import { $did } from 'src/store/did-doc';
import styles from './styles.module.scss';

function Component() {
    const did = useStore($did);

    return (
        <div style={{ marginTop: '7%' }}>
            {   
                did !== null &&
                did?.map((res: any) => {
                    if(res[0] === 'DID services'){
                        return (
                            <div key={res} className={styles.docInfo}>
                                <h4 className={styles.blockHead}>
                                    {res[0]}
                                </h4>
                                {res[1].map((element: any) => {
                                    return (
                                        <p
                                            key={element}
                                            className={styles.did}
                                        >
                                            <span className={styles.id}>{element[0]}</span>
                                            <a href="@todo open links depending of type of DID service">
                                                <span className="label">{element[1]}</span>
                                            </a>
                                        </p>
                                    );
                                })}
                            </div>
                        );
                    } else {
                        return (
                            <div key={res} className={styles.docInfo}>
                                <h4 className={styles.blockHead}>
                                    {res[0]}
                                </h4>
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
