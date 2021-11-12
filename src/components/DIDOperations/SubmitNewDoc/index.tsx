import * as tyron from 'tyron';
import { useStore } from 'effector-react';
import React from 'react';
import { $contract } from 'src/store/contract';
import { $donation, updateDonation } from 'src/store/donation';
import styles from './styles.module.scss';
import { operationKeyPair } from 'src/lib/dkms';
import { $arconnect } from 'src/store/arconnect';
import { $net } from 'src/store/wallet-network';
import { ZilPayBase } from 'src/components/ZilPay/zilpay-base';

function Component({ services }: { 
    services: tyron.DocumentModel.ServiceModel[]
}) {
    const donation = useStore($donation);
    const contract = useStore($contract);
    const arConnect = useStore($arconnect);
    const net = useStore($net);

    const handleSubmit = async () => {
        const key_input = [
            {
                id: tyron.VerificationMethods.PublicKeyPurpose.SocialRecovery
            },
            {
                id: tyron.VerificationMethods.PublicKeyPurpose.General
            },
            {
                id: tyron.VerificationMethods.PublicKeyPurpose.Auth
            },
            {
                id: tyron.VerificationMethods.PublicKeyPurpose.Assertion
            },
            {
                id: tyron.VerificationMethods.PublicKeyPurpose.Agreement
            },
            {
                id: tyron.VerificationMethods.PublicKeyPurpose.Invocation
            },
            {
                id: tyron.VerificationMethods.PublicKeyPurpose.Delegation
            },
            {
                id: tyron.VerificationMethods.PublicKeyPurpose.Update
            },
            {
                id: tyron.VerificationMethods.PublicKeyPurpose.Recovery
            },
        ];
        
        if( arConnect !== null && contract !== null && donation !== null ){
            const verification_methods: tyron.TyronZil.TransitionValue[] = [];
            for( const input of key_input ) {
                // Creates the cryptographic DID key pair
                const doc = await operationKeyPair(
                    {
                        arConnect: arConnect,
                        id: input.id,
                        addr: contract.addr
                    }
                );
                verification_methods.push(doc.parameter);
            }

            const zilpay = new ZilPayBase();
            alert(`You're about to submit a DID Create transaction. You're also donating ${donation} ZIL to the SSI Protocol.`);
            
            let tyron_;
            const donation_= String(donation*1e12);
            switch (donation) {
                case 0:
                    tyron_= await tyron.TyronZil.default.OptionParam(tyron.TyronZil.Option.none, 'Uint128');
                    break;
                default:
                    tyron_= await tyron.TyronZil.default.OptionParam(tyron.TyronZil.Option.some, 'Uint128', donation_);
                    break;
            } 
            
            const tx_params = await tyron.DidCrud.default.Create({
                addr: contract.addr,
                verificationMethods: verification_methods,
                services: services,
                tyron_: tyron_ 
            })
            await zilpay.call({
                contractAddress: contract.addr,
                transition: 'DidCreate',
                params: tx_params.txParams as unknown as Record<string, unknown>[],
                amount: String(donation) //@todo-ux would u like to top up your wallet as well?
            }).then( res => {
                updateDonation(null);
                window.open(
                    `https://viewblock.io/zilliqa/tx/${ res.ID }?network=${ net }`
                );
                alert(
                    `Wait a little bit, and then access your public identity to see the changes.`
                );
            })
        }
    };

    return (
        <>
            {
                donation !== null &&
                    <div style={{ marginTop: '10%' }}>
                        <button className={styles.button} onClick={handleSubmit}>
                            create{' '}
                            <span style={{ color: 'yellow' }}>
                                did
                            </span>
                        </button>
                    </div>
            }
        </>
    );
}

export default Component
