import React, { useState, useCallback } from 'react';
import { $donation, updateDonation } from '../../src/store/donation';

function Component() {
    const callbackRef = useCallback(inputElement => {
        if (inputElement) {
            inputElement.focus();
        }
    }, []);

    const donation = $donation.getState();
    let donation_;

    let legend_ = 'continue';
    let button_ = 'button primary';

    if (donation === null) {
        donation_ = "ZIL amount"
    } else {
        donation_ = String(donation) + " ZIL";
        legend_ = 'saved';
        button_ = 'button'
    }

    const [legend, setLegend] = useState(`${legend_}`)
    const [button, setButton] = useState(`${button_}`)

    const handleSave = async () => {
        setLegend('saved');
        setButton('button');
    };

    const [input, setInput] = useState(0);   // donation amount
    const handleInput = (event: { target: { value: any; }; }) => {
        updateDonation(null);
        setLegend('continue');
        setButton('button primary');
        let input = event.target.value;
        const re = /,/gi;
        input = input.replace(re, ".");
        input = Number(input);
        setInput(input);
        if (isNaN(input)) {
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
        if (input !== 0) {
            alert(`Donating ${donation} ZIL to donate.did, which gives you ${donation} xPoints - thank you!`)
        } else { alert(`Donating 0, thus 0 xPoints.`) }

    };

    return (
        <div style={{ margin: '10%' }}>
            <code>
                <ul>
                    <li>
                        How much would you like to{' '}
                        <a
                            href='https://ssiprotocol.notion.site/ssiprotocol/TYRON-a-network-for-self-sovereign-identities-3e39d78b34464d178f4490048d026941#bc71f38999684cd6a523c1062385799c'
                            rel="noreferrer" target="_blank"
                        >
                            donate.did
                        </a>
                        {' '}on this transaction?
                    </li>
                </ul>
            </code>
            <div>
                <input
                    ref={callbackRef}
                    style={{ width: '30%', marginLeft: '19%' }}
                    type="text"
                    placeholder={donation_}
                    onChange={handleInput}
                    onKeyPress={handleOnKeyPress}
                    autoFocus
                />
                <code style={{ marginLeft: '19%' }}>
                    = {input} xP
                </code>
                <div>
                    <input style={{ marginTop: '7%', marginLeft: '50%' }} type="button" className={button} value={legend}
                        onClick={() => {
                            handleSubmit();
                        }}
                    />
                </div>
            </div>
        </div>
    );
}

export default Component;
