import React, { useState }from 'react';
import * as tyron from 'tyron';
import * as zcrypto from '@zilliqa-js/crypto';
import styles from './styles.module.scss';
import { useStore } from 'effector-react';
import { ZilPayBase } from '../ZilPay/zilpay-base';
import { $user } from 'src/store/user';
import { TyronDonate } from '..';
import { $donation, updateDonation } from 'src/store/donation';
import { $contract } from 'src/store/contract';
import { $net } from 'src/store/wallet-network';

function Component() {
    const user = $user.getState();
    const contract = useStore($contract);
    const donation = useStore($donation);
    const net = useStore($net);
    
    const[input, setInput] = useState('');   // the beneficiary address
    const [legend, setLegend] = useState('Save')
    const [button, setButton] = useState('button primary')

    const [error, setError] = useState('');
    const [txID, setTxID] = useState('');

    const handleSave = async () => {
        setLegend('Saved');
        setButton('button');
    };

    const handleInput = (event: { target: { value: any; }; }) => {
        setError(''); setTxID(''); updateDonation(null);
        setInput('');
        setLegend('Save');
        setButton('button primary');
        let input = event.target.value;
        try {
            input = zcrypto.fromBech32Address(input);
            setInput(input); handleSave();
        } catch (error) {
            try{
                input = zcrypto.toChecksumAddress(input);
                setInput(input); handleSave();
            } catch{
                setError('wrong address.')
            }
        }
    };
    const handleInputOnKeyPress = async ({
        key
    }: React.KeyboardEvent<HTMLInputElement>) => {
        if (key === 'Enter') {
            handleInput;
        }
    };

    const handleSubmit = async () => {
        if( contract !== null && donation !== null ){
            alert(`You're about to transfer the ${user?.nft} NFT Username for $TYRON 10. You're also donating $ZIL ${donation} to Tyron.`);
        
            const zilpay = new ZilPayBase();
            const username = user?.nft as string;
            const guardianship = await tyron.TyronZil.default.OptionParam(tyron.TyronZil.Option.some, 'ByStr20', input);
            const id = "tyron";
            const tyron_ = await tyron.TyronZil.default.OptionParam(tyron.TyronZil.Option.some, 'Uint128', String(donation*1e12));
            const tx_params = await tyron.TyronZil.default.TransferNFTUsername(username, input, guardianship, id, tyron_);
            
            const res = await zilpay.call({
                contractAddress: contract.addr,
                transition: 'TransferNFTUsername',
                params: tx_params as unknown as Record<string, unknown>[],
                amount: String(donation*1e12)
            });
            updateDonation(null);
            setTxID(res.ID)
            //@todo-ux add link to the transaction on devex.zilliqa.com
            //@todo-ui better alert
        } else {
            setError('some data is missing.')
        }
    };

    return (
        <>
            <div>
                <h4 style={{ marginBottom: '6%' }}>
                    Transfer{' '}
                    <span className={styles.username}>
                        {user?.nft}
                    </span>
                    {' '}NFT Username
                </h4>
                <code>to:</code>
                <div className={ styles.containerInput }>
                    <input
                        style={{ width: '70%'}}
                        type="text"
                        placeholder="Type beneficiary address"
                        onChange={ handleInput }
                        onKeyPress={ handleInputOnKeyPress }
                        autoFocus
                    />
                    <input style={{ marginLeft: '2%'}} type="button" className={ button } value={ legend }
                        onClick={ () => {
                            handleInput;
                            handleSave();
                        }}
                    />
                </div>
            </div>
            {
                input !== '' && txID === '' &&
                    <TyronDonate />
            }
            {
                input !== '' && donation !== null &&
                    <div style={{ marginTop: '6%' }}>
                        <button className={ styles.button } onClick={ handleSubmit }>
                            Transfer{' '}
                                <span className={styles.username}>
                                    {user?.nft}
                                </span>
                            {' '}NFT Username
                        </button>
                    </div>
            }
            {
                txID !== '' &&
                    <div style={{  marginLeft: '-1%' }}>
                        <code>
                            Transaction ID:{' '}
                                <a
                                    href={`https://viewblock.io/zilliqa/tx/${txID}?network=${net}`}
                                    rel="noreferrer" target="_blank"
                                >
                                    {txID}
                                </a>
                        </code>
                    </div>
            }
            {
                error !== '' &&
                    <div style={{  marginLeft: '-1%' }}>
                        <code>
                            Error: {error}
                        </code>
                    </div>
            }
        </>
    );
}

export default Component;
