import React, { useState } from 'react';
import * as tyron from 'tyron';
import * as zcrypto from '@zilliqa-js/crypto';
import { SubmitUpdateDoc, TyronDonate } from '../..';
import styles from './styles.module.scss';
import { useStore } from 'effector-react';
import { $user } from 'src/store/user';
import { ZilPayBase } from 'src/components/ZilPay/zilpay-base';
import { $contract } from 'src/store/contract';
import { $net } from 'src/store/wallet-network';

function Component() {
    const user = useStore($user);
    const contract = useStore($contract);
    const net = useStore($net);

    const[id, setID] = useState('');
    const[addr, setInput] = useState('');
    
    const[legend, setLegend] = useState('Save');
    const[button, setButton] = useState('button primary');
    const [error, setError] = useState('');
    
    const handleID = (event: { target: { value: any; }; }) => {
        setLegend('Save');
        setButton('button primary');
        const input = event.target.value;
    
        setID(String(input).toLowerCase());
    };
    const handleInput = (event: { target: { value: any; }; }) => {
        setLegend('Save');
        setButton('button primary');
        let input = event.target.value;
        try {
            input = zcrypto.fromBech32Address(input);
            setInput(input);
        } catch (error) {
            try{
                zcrypto.toChecksumAddress(input);
                setInput(input);
            } catch{
                setError('wrong address.')
            }
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

    //update free list
    const [inputB, setInputB] = useState(0);
    const input_B = Array(inputB);
    const select_inputB = [];
    for( let i = 0; i < input_B.length; i += 1 ){
        select_inputB[i] = i;
    }
    const [input2B, setInput2B] = useState([]);
    const members: string[] = input2B;

    const[legend2B, setLegend2B] = useState('continue');
    const[button2B, setButton2B] = useState('button primary');

    const list: any[] = [];
    const [members_, setMembers_] = useState(list);

    const handleInputB = (event: React.ChangeEvent<HTMLInputElement>) => {
        setError(''); setInputB(0); setInput2B([]);
        setButton2B('button primary'); setLegend2B('continue');
        setMembers_(list);
        let _input = event.target.value;
        const re = /,/gi;
        _input = _input.replace(re, "."); 
        const input = Number(_input);

        if( !isNaN(input) && Number.isInteger(input) ){
            setInputB(input);
        } else if( isNaN(input) ){
            setError('the input is not a number.')
        } else if( !Number.isInteger(input) ){
            setError('the input must be an integer.')
        }
    };

    const handleContinueB = async () => {
        setError('');
        const _members = [];
        alert(members.length)
        if( members.length !== 0 ){
            for( let i = 0; i < members.length; i += 1 ){
                const this_item = members[i];
                if( this_item !== '' ){
                    _members.push(this_item)
                    alert(this_item);
                }
            }
        }
        if( _members.length !== inputB ){
            setError('the input is incomplete.')
        } else{
            setMembers_(_members);
            setButton2B('button'); setLegend2B('saved');
        }
    };

    const handleResetB = async () => {
        setError(''); setButton2B('button primary'); setLegend2B('continue');
    };

    const[txID, setTxID] = useState('');
    const handleSubmit = async () => {
        if( contract !== null ){
            const transitionID = 'UpdateFreeList'
            const zilpay = new ZilPayBase();

            const tx_param: tyron.TyronZil.TransitionParams[] = [{
                vname: 'new',
                type: 'List ByStr20',
                value: members_,
            }];
        
            await zilpay.call({
                contractAddress: contract.addr,
                transition: transitionID,
                params: tx_param as unknown as Record<string, unknown>[],
                amount: String(0)
            }).then( res => {
                setTxID(res.ID);
            })
        }
    };

    return (
        <>
            {
                user?.nft === 'init' &&
                <div>
                    <h4>Services</h4>
                    <section className={styles.containerInput}>
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
                            onChange={ handleInput }
                            autoFocus
                        />
                        <input style={{ marginLeft: '2%'}} type="button" className={ button } value={ legend }
                            onClick={ () => {
                                try{
                                    zcrypto.fromBech32Address(addr);
                                    setLegend('Saved'); setButton('button');
                                } catch (error) {
                                    try{
                                        zcrypto.toChecksumAddress(addr);
                                        setLegend('Saved'); setButton('button');
                                    } catch{
                                        setError('wrong address.')
                                    }
                                }
                            }}
                        />
                    </section>
                    <TyronDonate />
                    <SubmitUpdateDoc
                        {...{
                            patches: patches
                        }}/>
                </div>
            }
            {
                user?.nft !== 'init' &&
                    <p>
                        Coming soon!
                    </p>
            }
            <section className={ styles.container }>
                <code style={{ width: '70%' }}>
                    How many members (addresses) would you like to add?
                </code>
                <input 
                    style={{ width: '15%'}}
                    type="text"
                    placeholder="Type amount"
                    onChange={ handleInputB }
                    autoFocus
                />
            </section>
            {
                inputB != 0 &&
                    select_inputB.map((res: number) => {
                        return (
                            <section key={ res } className={ styles.container }>
                                <input
                                    style={{ width: '60%'}}
                                    type="text"
                                    placeholder="Type address"
                                    onChange={ (event: React.ChangeEvent<HTMLInputElement>) => {
                                        handleResetB();
                                        let value = event.target.value;
                                        try {
                                            value = zcrypto.fromBech32Address(value);
                                            members[res] = value;
                                        } catch (error) {
                                            try{
                                                value = zcrypto.toChecksumAddress(value);
                                                members[res] = value;
                                            } catch{
                                                setError('wrong address.')
                                            }
                                        }
                                    }}
                                />
                            </section>
                        )
                    })
            }
            {
                <input type="button" className={ button2B } value={ legend2B }
                    onClick={ () => {
                        handleContinueB();
                    }}
                />
            }
            {
                members_.length !== 0 &&
                    <div style={{ marginTop: '10%' }}>
                        <button className={ styles.button2 } onClick={ handleSubmit }>
                            update free list
                        </button>
                    </div>
            }   
            {
                txID !== '' &&
                    <div style={{  marginLeft: '-5%' }}>
                        <code>
                            Transaction ID:{' '}
                                <a
                                    href={`https://viewblock.io/zilliqa/tx/${ txID }?network=${ net }`}
                                    rel="noreferrer" target="_blank"
                                >
                                    { txID }
                                </a>
                        </code>
                    </div>
            }
            {
                error !== '' &&
                    <code>
                        Error: {error}
                    </code>
            }
        </>
    );
}

export default Component
