import * as tyron from 'tyron';
import { useStore } from 'effector-react';
import React, { useState } from 'react';
import { $contract } from 'src/store/contract';
import { NewDoc, UpdateDoc } from '..';
import styles from './styles.module.scss';
import { $user } from 'src/store/user';

function Component() {
    const contract = useStore($contract);
    const user = useStore($user);
    const [hideCreate, setHideCreate] = useState(true);
    const [createLegend, setCreateLegend] = useState('create');

    const [hideUpdate, setHideUpdate] = useState(true);
    const [updateLegend, setUpdateLegend] = useState('update');

    const [hideRecover, setHideRecover] = useState(true);
    const [recoverLegend, setRecoverLegend] = useState('recover');

    const [hideRecovery, setHideRecovery] = useState(true);
    const [recoveryLegend, setRecoveryLegend] = useState('social recovery');
    
    const [hideDeactivate, setHideDeactivate] = useState(true);
    const [deactivateLegend, setDeactivateLegend] = useState('deactivate');

    return (
        <div>
            <ul>
                <li>
                    {
                        user?.domain === 'did' &&
                        contract?.status === tyron.Sidetree.DIDStatus.Deployed && 
                        hideUpdate && hideRecover && hideRecovery && hideDeactivate && <>{
                            hideCreate
                            ?   <button
                                    type="button"
                                    className={styles.button}
                                    onClick={() => {
                                        setHideCreate(false);
                                        setCreateLegend('back');
                                    }}
                                >
                                    <p className={styles.buttonColorText}>
                                        {createLegend}
                                    </p>
                                </button>
                            :   <>
                                    <h3><span style={{ color: 'lightblue', marginRight: '3%'}}>create</span>
                                        <button
                                            type="button"
                                            className={styles.button}
                                            onClick={() => {
                                                setHideCreate(true);
                                                setCreateLegend('create');
                                            }}
                                        >
                                            <p className={styles.buttonText}>
                                                {createLegend}
                                            </p>
                                        </button>
                                    </h3>
                                </>
                        }</>
                    }
                    {
                        !hideCreate &&
                            <>
                                <p>
                                    With this transaction, you can create a globally unique decentralized identifier,
                                    and its DID document.
                                </p>
                                <NewDoc />
                            </>
                    }
                </li>
                <li>
                    {
                        (contract?.status === tyron.Sidetree.DIDStatus.Created ||
                        contract?.status === tyron.Sidetree.DIDStatus.Recovered ||
                        contract?.status === tyron.Sidetree.DIDStatus.Updated) &&
                        hideCreate && hideRecover && hideRecovery && hideDeactivate && <>{
                            hideUpdate
                            ?   <button
                                    type="button"
                                    className={styles.button}
                                    onClick={() => {
                                        setHideUpdate(false);
                                        setUpdateLegend('back');
                                    }}
                                >
                                    <p className={styles.buttonColorText}>
                                        {updateLegend}
                                    </p>
                                </button>
                            :   <>
                                    <h3><span style={{ color: 'lightblue', marginRight: '3%'}}>update</span>
                                        <button
                                            type="button"
                                            className={styles.button}
                                            onClick={() => {
                                                setHideUpdate(true);
                                                setUpdateLegend('update');
                                            }}
                                        >
                                            <p className={styles.buttonText}>
                                                {updateLegend}
                                            </p>
                                        </button>
                                    </h3>
                                </>
                        }</>
                    }
                    {
                        !hideUpdate &&
                            <>
                                <p>
                                    With this transaction, you can update your DID document.
                                </p>
                                <UpdateDoc />
                            </>
                    }
                </li>
                <li>
                    {
                        (contract?.status === tyron.Sidetree.DIDStatus.Created ||
                        contract?.status === tyron.Sidetree.DIDStatus.Recovered ||
                        contract?.status === tyron.Sidetree.DIDStatus.Updated) && 
                        hideCreate && hideUpdate && hideRecovery && hideDeactivate && <>{
                            hideRecover
                            ?   <button
                                    type="button"
                                    className={styles.button}
                                    onClick={() => {
                                        setHideRecover(false);
                                        setRecoverLegend('back');
                                    }}
                                >
                                    <p className={styles.buttonColorText}>
                                        {recoverLegend}
                                    </p>
                                </button>
                            :   <>
                                    <h3><span style={{ color: 'lightblue', marginRight: '3%'}}>recover</span>
                                        <button
                                            type="button"
                                            className={styles.button}
                                            onClick={() => {
                                                setHideRecover(true);
                                                setRecoverLegend('recover');
                                            }}
                                        >
                                            <p className={styles.buttonText}>
                                                {recoverLegend}
                                            </p>
                                        </button>
                                    </h3>
                                </>
                        }</>
                    }
                    {
                        !hideRecover &&
                            <>
                                <p>
                                    Coming soon.
                                </p>
                            </>
                    }
                </li>
                <li>
                    {
                        user?.domain === 'did' &&
                        hideCreate && hideUpdate && hideRecover && hideDeactivate && <>{
                            hideRecovery
                            ?   <button
                                    type="button"
                                    className={styles.button}
                                    onClick={() => {
                                        setHideRecovery(false);
                                        setRecoveryLegend('back');
                                    }}
                                >
                                    <p className={styles.buttonColorText}>
                                        {recoveryLegend}
                                    </p>
                                </button>
                            :   <>
                                    <h3><span style={{ color: 'lightblue', marginRight: '3%'}}>Social Recovery</span>
                                        <button
                                        type="button"
                                        className={styles.button}
                                        onClick={() => {
                                            setHideRecovery(true);
                                            setRecoveryLegend('social recovery');
                                        }}
                                        >
                                            <p className={styles.buttonText}>
                                                {recoveryLegend}
                                            </p>
                                        </button>
                                    </h3>
                                </>
                        }</>
                    }
                    {
                        !hideRecovery &&
                            <>
                                <p>
                                    Coming soon.
                                </p>
                            </>
                    }
                </li>
                <li>
                    {
                        (contract?.status === tyron.Sidetree.DIDStatus.Created ||
                        contract?.status === tyron.Sidetree.DIDStatus.Recovered ||
                        contract?.status === tyron.Sidetree.DIDStatus.Updated) &&
                        hideCreate && hideUpdate && hideRecover && hideRecovery && <>{
                            hideDeactivate
                            ?   <p><span style={{ marginLeft: '2%',marginRight: '3%'}}>Danger zone</span>
                                    <button
                                        type="button"
                                        className={styles.button}
                                        onClick={() => {
                                            setHideDeactivate(false);
                                            setDeactivateLegend('back');
                                        }}
                                    >
                                        <p className={styles.buttonColorDText}>
                                            {deactivateLegend}
                                        </p>
                                    </button>
                                </p>
                            :   <>
                                    <h3><span style={{ color: 'red', marginRight: '3%'}}>deactivate</span>
                                        <button
                                            type="button"
                                            className={styles.button}
                                            onClick={() => {
                                                setHideDeactivate(true);
                                                setDeactivateLegend('deactivate');
                                            }}
                                        >
                                            <p className={styles.buttonText}>
                                                {deactivateLegend}
                                            </p>
                                        </button>
                                    </h3>
                                </>
                        }</>
                    }
                    {
                        !hideDeactivate &&
                            <>
                                <p>
                                    Coming soon.
                                </p>
                            </>
                    }
                </li>
            </ul>
        </div>
    );
}

export default Component
