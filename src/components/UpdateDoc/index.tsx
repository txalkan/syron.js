import React, { useState } from 'react';
import * as tyron from 'tyron';
import * as zcrypto from '@zilliqa-js/crypto';
import { SubmitUpdateDoc, TyronDonate } from '..';
import styles from './styles.module.scss';

function Component() {
    const[id, setID] = useState('');
    const[addr, setAddr] = useState('');
    
    const[legend, setLegend] = useState('Save');
    const[button, setButton] = useState('button primary');
    
    const handleID = (event: { target: { value: any; }; }) => {
        setLegend('Save');
        setButton('button primary');
        const input = event.target.value;
    
        setID(String(input).toLowerCase());
    };
    const handleAddr = (event: { target: { value: any; }; }) => {
        setLegend('Save');
        setButton('button primary');
        let input = event.target.value;
        try {
            input = zcrypto.fromBech32Address(input);
            setAddr(input);
        } catch (error) {
            alert(error)
        }
    };

    const services: tyron.DocumentModel.ServiceModel[] = [];
    if( id !== '' && addr !== '' ){
        services.push({
            id: id,
            endpoint: tyron.DocumentModel.ServiceEndpoint.Web3Endpoint,
            address: addr
        })
    }
    
    //@todo process all patches
    const patches: tyron.DocumentModel.PatchModel[] = [
        {
            action: tyron.DocumentModel.PatchAction.AddServices,
            services: services
        }
    ];

    return (
        <div>
            <h4>Services</h4>
            <section className={styles.container}>
                <input 
                    style={{ width: '20%'}}
                    type="text"
                    placeholder="Type service ID"
                    onChange={ handleID }
                    autoFocus
                />
                <input 
                    style={{ marginLeft: '1%', width: '60%'}}
                    type="text"
                    placeholder="Type service address"
                    onChange={ handleAddr }
                    autoFocus
                />
                <input style={{ marginLeft: '2%'}} type="button" className={ button } value={ legend }
                    onClick={ () => {
                        setLegend('Saved');
                        setButton('button');
                    }}
                />
            </section>
            <TyronDonate />
            <SubmitUpdateDoc
                {...{
                    patches: patches
                }}/>
        </div>
    );
}

export default Component
