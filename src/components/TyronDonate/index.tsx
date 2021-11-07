import React, { useState }from 'react';
import styles from './styles.module.scss';
import { $donation, updateDonation } from 'src/store/donation';

function Component() {
    const donation = $donation.getState();
    let donation_;
    
    let legend_ = 'continue';
    let button_ = 'button primary';

    if( donation === null ){
        donation_ = "ZIL amount"
    } else {
        donation_ = String(donation)+" ZIL";
        legend_ = 'saved';
        button_ = 'button'
    }

    const[legend, setLegend] = useState(`${ legend_ }`)
    const[button, setButton] = useState(`${ button_ }`)

    const handleSave = async () => {
        setLegend('saved');
        setButton('button');
    };
    
    const[input, setInput] = useState(0);   // donation amount
    const handleInput = (event: { target: { value: any; }; }) => {
        updateDonation(null);
        setLegend('continue');
        setButton('button primary');
        let input = event.target.value;
        const re = /,/gi; 
        input = input.replace(re, "."); 
        input = Number(input);
        setInput(input);
        if( isNaN(input) ){
            input = 0
        }
        setInput(input);
    };
    const handleOnKeyPress = ({
        key
    }: React.KeyboardEvent<HTMLInputElement>) => {
        if (key === 'Enter') {
            handleSubmit();
        }
    };

    const handleSubmit = async () => {
        handleSave();
        updateDonation(input);
        const donation = $donation.getState();
        if( input !== 0 ){
            alert(`Donating ZIL ${donation} to Tyron - thank you!`)
        } else { alert(`Donating 0`)}
        
    };

    return (
        <section className={ styles.container }>
            <code style={{ width: '50%' }}>
                How much would you like to donate to Tyron on this transaction?
            </code>
            <div>
                <input 
                    style={{ marginTop: '27%', width: '55%'}}
                    type="text"
                    placeholder={ donation_ }
                    onChange={ handleInput }
                    onKeyPress={ handleOnKeyPress }
                    autoFocus
                />
            <input style={{ marginTop: '5%'}} type="button" className={button} value={ legend }
                onClick={ () => {
                    handleSubmit();
                }}
            />
            </div>
        </section>
    );
}

export default Component;
