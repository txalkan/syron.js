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
    const services: string[][] = input2;
    
    const[legend, setLegend] = useState('add document');
    const[button, setButton] = useState('button primary');
    const[hideDoc, setHideDoc] = useState(true);

    const[twitter, setTwitterUsername] = useState('');
    const[btc, setBtc] = useState('');
    const[github, setGithub] = useState('');
    const[phoneNumber, setPhoneNumber] = useState(0);
    
    const[legend2, setLegend2] = useState('continue');
    const[button2, setButton2] = useState('button primary');
    
    const [hideDonation, setHideDonation] = useState(true);
    const [hideSubmit, setHideSubmit] = useState(true);
    
    const services_: tyron.DocumentModel.ServiceModel[] = [];
    const [services2, setServices2] = useState(services_);
    
    const handleReset = async () => {
        setError(''); setButton2('button primary'); setLegend2('continue');
        setHideDonation(true); setHideSubmit(true);
    };

    const handleDoc = async () => {
        setBtc(''); setTwitterUsername(''); setGithub(''); setPhoneNumber(0);
        setInput(0); handleReset();
        if( hideDoc ){
            setHideDoc(false);
            setLegend('remove document'); setButton('button')
        } else{
            setHideDoc(true);
            setLegend('add document'); setButton('button primary');
        } 
    };
    
    const handleBtc = (event: { target: { value: any; }; }) => {
        handleReset();
        const input = event.target.value;
        setBtc(String(input).toLowerCase());
    };  
    const handleTwitterUsername = (event: { target: { value: any; }; }) => {
        handleReset();
        const input = event.target.value;
        setTwitterUsername(String(input).toLowerCase());
    };
    const handleGithub = (event: { target: { value: any; }; }) => {
        handleReset();
        const input = event.target.value;
        setGithub(String(input));
    };
    const handlePhoneNumber = (event: { target: { value: any; }; }) => {
        handleReset();
        const input = Number(event.target.value);
        if( !isNaN(input) && Number.isInteger(input) ){
            setPhoneNumber(input);
        } else {
            setError('the phone number is not valid.')
        }
    };

    const handleInput = (event: React.ChangeEvent<HTMLInputElement>) => {
        setError(''); setInput(0); setInput2([]); setHideSubmit(true); setHideDonation(true);
        setButton2('button primary'); setLegend2('continue');
        setServices2(services_);
        let _input = event.target.value;
        const re = /,/gi;
        _input = _input.replace(re, "."); 
        const input = Number(_input);

        if( !isNaN(input) && Number.isInteger(input) ){
            setInput(input);
        } else if( isNaN(input) ){
            setError('the input is not a number.')
        } else if( !Number.isInteger(input) ){
            setError('the number of services must be an integer.')
        }
    };

    const services__: tyron.DocumentModel.ServiceModel[] = [];

    if( btc !== '' ){
        services__.push({
            id: 'bitcoin',
            endpoint: tyron.DocumentModel.ServiceEndpoint.Web2Endpoint,
            type: 'blockchain',
            transferProtocol: tyron.DocumentModel.TransferProtocol.Https,
            uri: btc
        });
    }
    if( twitter !== '' ){
        services__.push({
            id: 'twitter',
            endpoint: tyron.DocumentModel.ServiceEndpoint.Web2Endpoint,
            type: 'website',
            transferProtocol: tyron.DocumentModel.TransferProtocol.Https,
            uri: twitter
        });
    }
    if( github !== '' ){
        services__.push({
            id: 'github',
            endpoint: tyron.DocumentModel.ServiceEndpoint.Web2Endpoint,
            type: 'website',
            transferProtocol: tyron.DocumentModel.TransferProtocol.Https,
            uri: github
        });
    }
    if( phoneNumber !== 0 ){
        services__.push({
            id: 'phonenumber',
            endpoint: tyron.DocumentModel.ServiceEndpoint.Web2Endpoint,
            type: 'phonenumber',
            transferProtocol: tyron.DocumentModel.TransferProtocol.Https,
            uri: String(phoneNumber)
        });
    }

    const handleContinue = async () => {
        setError('');
        const _services: tyron.DocumentModel.ServiceModel[] = [];
        if( services.length !== 0 ){
            for( let i = 0; i < services.length; i += 1 ){
                const this_service = services[i];
                if( this_service[0] !== '' && this_service[1] !== '' ){
                    _services.push({
                        id: this_service[0],
                        endpoint: tyron.DocumentModel.ServiceEndpoint.Web2Endpoint,
                        type: 'website',
                        transferProtocol: tyron.DocumentModel.TransferProtocol.Https,
                        uri: this_service[1]
                    })
                }
            }
        }
        if( _services.length !== input ){
            setError('the input is incomplete.')
        } else{
            setServices2(_services);
            setButton2('button'); setLegend2('saved');
            setHideDonation(false); setHideSubmit(false);
        }
    };

    return (
        <>
        {
            <input style={{ marginTop: "5%", marginBottom: '5%' }} type="button" className={ button } value={ legend }
                onClick={ () => {
                    handleDoc();
                }}
            />  
        }
        {
            !hideDoc &&
                <>
                <section style={{ marginBottom: '5%' }}>
                    <h3>
                        Verification methods
                    </h3>
                    <code>
                        You will be creating one DID key pair for each{' '}
                        <a 
                            href='https://www.ssiprotocol.com/#/did'
                            rel="noreferrer" target="_blank"
                        >
                            verification relationship
                        </a>.
                    </code>
                </section>
                <h3 style={{ marginBottom: '5%' }}>
                    Services
                </h3>
                <section className={ styles.container }>
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
                <section className={ styles.container }>
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
                <section className={ styles.container }>
                    <label>ID</label>
                    github
                    <input 
                        style={{ marginLeft: '1%', width: '30%'}}
                        type="text"
                        placeholder="Type GitHub username"
                        onChange={ handleGithub }
                        autoFocus
                    />
                </section>
                <section className={ styles.container }>
                    <label>ID</label>
                    phone
                    <input 
                        style={{ marginLeft: '1%', width: '30%'}}
                        type="text"
                        placeholder="Type phone number"
                        onChange={ handlePhoneNumber }
                        autoFocus
                    />
                </section>
                <section className={ styles.container }>
                    <code style={{ width: '70%' }}>
                        How many other DID Services (websites) would you like to add?
                    </code>
                    <input 
                        style={{ width: '15%'}}
                        type="text"
                        placeholder="Type amount"
                        onChange={ handleInput }
                        autoFocus
                    />
                </section>
                {
                    input != 0 &&
                        select_input.map((res: number) => {
                            return (
                                <section key={ res } className={ styles.container }>
                                    <input
                                        style={{ width: '20%'}}
                                        type="text"
                                        placeholder="Type ID, e.g. LinkedIn"
                                        onChange={ (event: React.ChangeEvent<HTMLInputElement>) => {
                                            handleReset();
                                            const value = event.target.value;
                                            if( services[res] === undefined ){
                                                services[res] = ['', ''];
                                            }
                                            services[res][0] = value.toLowerCase();
                                        }}
                                    />
                                    <code>
                                        https://www.
                                    </code>
                                    <input
                                        style={{ width: '60%'}}
                                        type="text"
                                        placeholder="Type service URL"
                                        onChange={ (event: React.ChangeEvent<HTMLInputElement>) => {
                                            handleReset();
                                            const value = event.target.value;
                                            if( services[res] === undefined ){
                                                services[res] = ['', ''];
                                            }
                                            services[res][1] = value.toLowerCase();
                                        }}
                                    />
                                </section>
                            )
                        })
                }
                {
                    <input type="button" className={ button2 } value={ legend2 }
                        onClick={ () => {
                            handleContinue();
                        }}
                    />
                }
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
                    services: services__.concat(services2)
                }}/>
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
