import React, { useState } from 'react';
import * as tyron from 'tyron';
import { SubmitNewDoc, TyronDonate } from '..';
import styles from './styles.module.scss';

function Component() {
    const[twitter, setTwitterUsername] = useState('');
    const[btc, setBtc] = useState('');
    const[id, setID] = useState('');
    const[uri, setURI] = useState('');
    
    const[legend, setLegend] = useState('Save');
    const[button, setButton] = useState('button primary');
    const[legend2, setLegend2] = useState('Save');
    const[button2, setButton2] = useState('button primary');
    const[legend3, setLegend3] = useState('Save');
    const[button3, setButton3] = useState('button primary');
    
    const services: tyron.DocumentModel.ServiceModel[] = [];
    if( twitter !== '' ){
        services.push({
            id: 'twitter',
            endpoint: tyron.DocumentModel.ServiceEndpoint.Web2Endpoint,
            type: 'website',
            transferProtocol: tyron.DocumentModel.TransferProtocol.Https,
            uri: twitter
        })
    }
    if( btc !== '' ){
        services.push({
            id: 'bitcoin',
            endpoint: tyron.DocumentModel.ServiceEndpoint.Web2Endpoint,
            type: 'blockchain',
            transferProtocol: tyron.DocumentModel.TransferProtocol.Https,
            uri: btc
        })
    }
    if( id !== '' ){
        services.push({
            id: id,
            endpoint: tyron.DocumentModel.ServiceEndpoint.Web2Endpoint,
            type: 'website',
            transferProtocol: tyron.DocumentModel.TransferProtocol.Https,
            uri: uri
        })
    }
    
    const handleTwitterUsername = (event: { target: { value: any; }; }) => {
        setLegend('Save');
        setButton('button primary');
        const input = event.target.value;
        
        setTwitterUsername(String(input).toLowerCase());
    };
    const handleBtc = (event: { target: { value: any; }; }) => {
        setLegend3('Save');
        setButton3('button primary');
        const input = event.target.value;
        
        setBtc(String(input).toLowerCase());
    };
    const handleOnKeyPress1 = ({
        key
    }: React.KeyboardEvent<HTMLInputElement>) => {
        if (key === 'Enter') {
            setLegend('Saved');
            setButton('button');
        }
    };
    const handleOnKeyPress2 = ({
        key
    }: React.KeyboardEvent<HTMLInputElement>) => {
        if (key === 'Enter') {
            setLegend3('Saved');
            setButton3('button');
        }
    };
    const handleID = (event: { target: { value: any; }; }) => {
        setLegend2('Save');
        setButton2('button primary');
        const input = event.target.value;
        
        setID(String(input).toLowerCase());
    };
    const handleURI = (event: { target: { value: any; }; }) => {
        setLegend2('Save');
        setButton2('button primary');
        const input = event.target.value;
        
        setURI(String(input).toLowerCase());
    };

    return (
        <div>
            <h4>Services</h4>
            <section className={styles.container}>
                <label>ID</label>
                twitter
                <input 
                    style={{ marginLeft: '1%', width: '30%'}}
                    type="text"
                    placeholder="Type twitter username"
                    onChange={ handleTwitterUsername }
                    onKeyPress={ handleOnKeyPress1 }
                    autoFocus
                />
                <input style={{ marginLeft: '2%'}} type="button" className={button} value={ legend }
                    onClick={ () => {
                        setLegend('Saved');
                        setButton('button');
                    }}
                />
            </section>
            <section className={styles.container}>
                <label>ID</label>
                bitcoin
                <input 
                    style={{ marginLeft: '1%', width: '30%'}}
                    type="text"
                    placeholder="Type $BTC address"
                    onChange={ handleBtc }
                    onKeyPress={ handleOnKeyPress2 }
                    autoFocus
                />
                <input style={{ marginLeft: '2%'}} type="button" className={ button3 } value={ legend3 }
                    onClick={ () => {
                        setLegend3('Saved');
                        setButton3('button');
                    }}
                />
            </section>
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
                    placeholder="Type service URI"
                    onChange={ handleURI }
                    autoFocus
                />
                <input style={{ marginLeft: '2%'}} type="button" className={ button2 } value={ legend2 }
                    onClick={ () => {
                        setLegend2('Saved');
                        setButton2('button');
                    }}
                />
            </section>
            <h4 style={{ marginTop: '7%'}}>Verification methods</h4>
            <p>
                You will be creating one DID key pair for each <a href='https://www.ssiprotocol.com/#/did'>verification relationship</a>.
            </p>
            <TyronDonate />
            <SubmitNewDoc
                {...{
                    services: services
                }}/>
        </div>
    );
}

export default Component
