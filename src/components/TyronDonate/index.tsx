import React, { useState }from 'react';
import styles from './styles.module.scss';
import { updateDonation } from 'src/store/donation';

function Component() {
    //@todo add conditions to amount
    const[amount, setAmount] = useState('')
    const[legend, setLegend] = useState('Save')
    const[button, setButton] = useState('button primary')

    const handleAmount = (event: { target: { value: any; }; }) => {
        updateDonation(null);
        setLegend('Save');
        setButton('button primary');
        let amount = event.target.value;
        
        if( isNaN(amount) ){
            amount = 0
        }
        setAmount(String(amount));
    };
    const handleOnKeyPress = ({
        key
    }: React.KeyboardEvent<HTMLInputElement>) => {
        if (key === 'Enter') {
            setLegend('Saved');
            setButton('button');
            updateDonation(amount);
        }
    };

    return (
        <>
            <section className={styles.container}>
                <code>
                    How much would you like to donate to Tyron on this transaction?
                </code>
                <input 
                    style={{ width: '20%'}}
                    type="text"
                    placeholder="Amount in $ZIL"
                    onChange={ handleAmount }
                    onKeyPress={ handleOnKeyPress }
                    autoFocus
                />
                <input style={{ marginLeft: '2%'}} type="button" className={button} value={ legend }
                    onClick={ () => {
                        setLegend('Saved');
                        setButton('button');
                        updateDonation(amount);
                    }}
                />
            </section>
        </>
    );
}

export default Component;
