import styles from './styles.module.scss'
import React, { useState } from 'react'
import { useStore } from 'effector-react'
import { $user } from '../../src/store/user'

/*
import { useStore } from 'effector-react';
import * as tyron from 'tyron';
import { ZilPayBase } from '../ZilPay/zilpay-base';
import { $net } from 'src/store/wallet-network';

*/

function Component() {
    const user = useStore($user)
    //const net = useStore($net);
    const [hideAdd, setHideAdd] = useState(true)
    const [addLegend, setAddLegend] = useState('new motion')
    //const [hideList, setHideList] = useState(true);

    //const [error, setError] = useState('');

    /*const handleTest = async () => {
        try {
            const zilpay = new ZilPayBase();
            const id = await tyron.TyronZil.default.OptionParam(tyron.TyronZil.Option.none, 'ByStr32');
            const motion = await tyron.TyronZil.default.OptionParam(tyron.TyronZil.Option.some, 'String', 'let us be self-sovereign!');
            const tyron_ = await tyron.TyronZil.default.OptionParam(tyron.TyronZil.Option.none, 'Uint128');

            const params = [];
            const action = {
                vname: 'action',
                type: 'String',
                value: 'new',
            };
            params.push(action);
            const id_ = {
                vname: 'id',
                type: 'Option ByStr32',
                value: id,
            };
            params.push(id_);
            const motion_ = {
                vname: 'motion',
                type: 'Option String',
                value: motion,
            };
            params.push(motion_);
            const amount_ = {
                vname: 'amount',
                type: 'Uint128',
                value: '500000000000',
            };
            params.push(amount_);
            const tyron__ = {
                vname: 'tyron',
                type: 'Option Uint128',
                value: tyron_,
            };
            params.push(tyron__);
            await zilpay.call(
                {
                    contractAddress: '0x274850d6d7dda91efa32bf0f6d9992f07950eeab',   // user
                    transition: 'XPoints',
                    params: params as unknown as Record<string, unknown>[],
                    amount: String(0)
                }
            )
                .then(res => {
                    window.open(
                        `https://devex.zilliqa.com/tx/${res.ID}?network=https%3A%2F%2F${net === "mainnet" ? "" : "dev-"}api.zilliqa.com`
                    );
                })
        } catch (error) {
            const err = error as string;
            setError(err)
        }
    };*/

    return (
        <div style={{ textAlign: 'center', marginTop: '7%' }}>
            <h1 style={{ marginBottom: '10%', color: '#ffff32' }}>
                <span className={styles.x}>x</span>POINTS DApp
            </h1>
            {
                //hideList &&
                <div style={{ marginTop: '14%' }}>
                    <h3 style={{ marginBottom: '7%', color: 'silver' }}>
                        Raise Your Voice
                    </h3>
                    <div style={{ marginTop: '14%' }}>
                        {hideAdd ? (
                            <button
                                type="button"
                                className={styles.button}
                                onClick={() => {
                                    setHideAdd(false)
                                    setAddLegend('back')
                                }}
                            >
                                <p className={styles.buttonText}>{addLegend}</p>
                            </button>
                        ) : (
                            <>
                                <button
                                    type="button"
                                    className={styles.button}
                                    onClick={() => {
                                        setHideAdd(true)
                                        setAddLegend('new motion')
                                        //handleTest();
                                    }}
                                >
                                    <p className={styles.buttonText}>
                                        {addLegend}
                                    </p>
                                </button>
                            </>
                        )}
                    </div>
                    {!hideAdd && (
                        <div style={{ marginTop: '10%' }}>
                            <p>
                                On the TYRON Network, you are not the product,
                                and therefore most transactions are free (you
                                only have to pay for Zilliqa gas). But we need
                                your help to keep developing the Self-Sovereign
                                Identity Protocol as an open-source project.
                            </p>
                            <p>
                                Donations are optional on most transactions, and
                                the Donate DApp collects them. Then they get
                                distributed as follows:
                            </p>
                            <ol>
                                <li>80% to the Tyron Coop</li>
                                <li>10% to the World Food Program</li>
                                <li>10% to the Insurance Fund</li>
                            </ol>
                        </div>
                    )}
                </div>
            }
            {hideAdd && (
                <div style={{ marginTop: '10%' }}>
                    <p>coming soon!</p>
                </div>
            )}
        </div>
    )
}

export default Component
