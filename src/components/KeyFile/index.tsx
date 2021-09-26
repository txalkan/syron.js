import { JWKInterface } from 'arweave/node/lib/wallet';
import React, { useState } from 'react';
import arweave from '../../config/arweave';
import { useDispatch } from '../../context';
import { actionsCreator } from '../../context/user/actions';
import styles from './styles.module.scss';

function KeyFile() {
    const [keyFile, setKeyFile] = useState<JWKInterface>();
    const [saveFile, setSaveFile] = useState(false);
    const [buttonLegend, setButtonLegend] = useState('Save keyfile');

    const dispatch = useDispatch();
    const files = React.createRef<any>();

    const handleOnChange = (event: any) => {
        event.preventDefault();
        const file = files.current.files[0];
        if (file) {
            const fileReader = new FileReader();
            fileReader.onload = ({ target }) => {
                const result = target?.result as string;
                if (result) setKeyFile(JSON.parse(result));
            };
            fileReader.readAsText(file);
        }
        setSaveFile(true);

    };

    const handleSaveFile = async () => {
        try {
            const arAddress = await arweave.wallets.jwkToAddress(keyFile);
            alert(`This keyfile's address is: ${arAddress}`);
            dispatch(actionsCreator.setArAddress(arAddress));
            if(keyFile) {
                dispatch(actionsCreator.setKeyfile(keyFile))
            }
            setButtonLegend('Saved')
        } catch (e) {
            alert('Select file first.')
        }
    };

    return (
        <>
            <div className={styles.container}>
                <input type="file" ref={ files } onChange={handleOnChange} />
                    <>
                        { saveFile && buttonLegend !== "Saved" &&
                            <button
                                type="button"
                                className={styles.save}
                                onClick={handleSaveFile}
                            >
                                <p className={styles.buttonText}>{buttonLegend}</p>
                            </button>
                        }
                        { buttonLegend === "Saved" &&
                            <button
                                type="button"
                                className={styles.save}
                                onClick={() => alert('Your keyfile got saved already.')}
                            >
                                <p className={styles.buttonText}>{buttonLegend}</p>
                            </button>
                        }
                    </>
                    
            </div>
        </>
    );
}

export default KeyFile;
