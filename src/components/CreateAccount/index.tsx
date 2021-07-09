import React from 'react';
import TravelRule from '../SSIPassport/travelRule';
import PermaWallet from '../Permawallet';
import { useSelector } from '../../context';

function CreateAccount({
    username,
    domain
}: {
    username: string;
    domain: string;
}) {
    const { travelRule } = useSelector((state) => state.user);

    return (
        <div>
            <section style={{ width: '100%' }}>
                <ol>
                    <li style={{ marginTop: '4%' }}>{<TravelRule />}</li>
                    <li style={{ marginTop: '6%' }}>
                        <PermaWallet
                            {...{
                                travelRule
                            }}
                        />
                    </li>
                </ol>
            </section>
        </div>
    );
}

export default CreateAccount;
