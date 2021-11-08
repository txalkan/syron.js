import { useStore } from 'effector-react';
import React, { useState } from 'react';
import { $donation } from 'src/store/donation';
import * as tyron from 'tyron';
import { SubmitNewDoc, TyronDonate } from '..';
import styles from './styles.module.scss';

function Component() {
    const donation = useStore($donation);
    
    const [error, setError] = useState('');
    const [input, setInput] = useState(0);
    const input_ = Array(input);
    const select_input = [];
    for( let i = 0; i < input_.length; i += 1 ){
        select_input[i] = i;
    }
    const [input2, setInput2] = useState([]);

    const[twitter, setTwitterUsername] = useState('');
    const[btc, setBtc] = useState('');
    const[id, setID] = useState('');
    const[uri, setURI] = useState('');
    
    const[legend, setLegend] = useState('add document');
    const[hideDoc, setHideDoc] = useState(true);
    
    const[button, setButton] = useState('button primary');
    const[legend2, setLegend2] = useState('save');
    const[button2, setButton2] = useState('button primary');
    const[legend3, setLegend3] = useState('save');
    const[button3, setButton3] = useState('button primary');
   
    const [hideDonation, setHideDonation] = useState(true);
    const [hideSubmit, setHideSubmit] = useState(true);
    const [txID, setTxID] = useState('');
  
    const handleInput = (event: React.ChangeEvent<HTMLInputElement>) => {
        setError(''); setInput(0); setInput2([]); setHideSubmit(true); setHideDonation(true);
        setLegend('continue');
        setButton('button primary');
        let _input = event.target.value;
        const re = /,/gi; 
        _input = _input.replace(re, "."); 
        const input = Number(_input);

        if(
            !isNaN(input) && Number.isInteger(input) && input >= 3
        ){
            setInput(input);
        } else if( isNaN(input) ){
            setError('the input is not a number.')
        } else if( !Number.isInteger(input) ){
            setError('the number of guardians must be an integer.')
        } else if( input < 3 && input !== 0 ){
            setError('the number of guardians must be at least three.')
        }
    };

    const handleSave = async () => {
        setError('');
        if( hideDoc ){
            setHideDoc(false);
            setLegend('hide document'); setButton('button')
        } else{
            setHideDoc(true);
            setLegend('add document'); setButton('button primary')
        }
        
    };

     
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
        const input = event.target.value;
        setTwitterUsername(String(input).toLowerCase());
    };
    const handleBtc = (event: { target: { value: any; }; }) => {
        const input = event.target.value;
        setBtc(String(input).toLowerCase());
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
        <>
            {
                txID === '' &&
                    <>
                    {
                        <div style={{ marginTop: '4%', marginBottom: '8%' }}>
                            <input style={{ marginTop: "5%" }} type="button" className={ button } value={ legend }
                                onClick={ () => {
                                    handleSave();
                                }}
                            />
                        </div>   
                    }
                    {
                        !hideDoc &&
                            <>
                            <h3 style={{ marginBottom: '5%' }}>
                                Services
                            </h3>
                            <section className={styles.container}>
                                <label>ID</label>
                                twitter
                                <input 
                                    style={{ marginLeft: '1%', width: '30%'}}
                                    type="text"
                                    placeholder="Type twitter username"
                                    onChange={ handleTwitterUsername }
                                    autoFocus
                                />
                            </section>
                            <section className={styles.container}>
                                <label>ID</label>
                                bitcoin
                                <input 
                                    style={{ marginLeft: '1%', width: '30%'}}
                                    type="text"
                                    placeholder="Type BTC address"
                                    onChange={ handleBtc }
                                    autoFocus
                                />
                            </section>
                            <section className={ styles.container2 }>
                                <code style={{ width: '80%' }}>
                                    How many other DID Services (websites) would you like to add?
                                </code>
                                <input 
                                    style={{ width: '25%'}}
                                    type="text"
                                    placeholder="Type amount"
                                    onChange={ handleInput }
                                    autoFocus
                                />
                            </section>
                            <section className={styles.container}>
                                <input 
                                    style={{ width: '20%'}}
                                    type="text"
                                    placeholder="Type ID"
                                    onChange={ handleID }
                                    autoFocus
                                />
                                <code>
                                    https://
                                </code>
                                <input 
                                    style={{ marginLeft: '1%', width: '60%'}}
                                    type="text"
                                    placeholder="Type service URI"
                                    onChange={ handleURI }
                                    autoFocus
                                />
                            </section>
                            <section style={{ marginTop: '8%'}}>
                                <h3>
                                    Verification methods
                                </h3>
                                <code>
                                    You will be creating one DID key pair for each
                                    <a 
                                        href='https://www.ssiprotocol.com/#/did'
                                        rel="noreferrer" target="_blank"
                                    >
                                        verification relationship
                                    </a>.
                                </code>
                            </section>
                            </>
                    }
                    {
                        !hideDonation &&
                            <TyronDonate />
                    }
                    {
                        !hideSubmit && donation !== null &&
                            <SubmitNewDoc
                            {...{
                                services: services
                            }}/>
                    }
                    </>
            }
            {
                error !== '' &&
                    <div style={{  marginTop: '5%' }}>
                        <code>
                            Error: {error}
                        </code>
                    </div>
            }
        </>
    );
}

export default Component
