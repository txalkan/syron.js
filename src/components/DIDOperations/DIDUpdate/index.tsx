import React, { useState, useRef, useEffect } from 'react';
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
    const searchInput = useRef(null);
    function handleFocus() {
        if (searchInput !== null && searchInput.current !== null) {
            const si = searchInput.current as any;
            si.focus();
        }
    }
    useEffect(() => {
        // current property is refered to input element
        handleFocus()
    }, [])
    const user = useStore($user);
    const contract = useStore($contract);
    const net = useStore($net);

    const [error, setError] = useState('');

    const [inputA, setInputA] = useState(0);
    const input_A = Array(inputA);
    const select_inputA = [];
    for (let i = 0; i < input_A.length; i += 1) {
        select_inputA[i] = i;
    }
    const [input2A, setInput2A] = useState([]);
    const services: string[][] = input2A;

    const [legendA, setLegendA] = useState('continue');
    const [buttonA, setButtonA] = useState('button primary');

    const services_: tyron.DocumentModel.ServiceModel[] = [];
    const [services2, setServices2] = useState(services_);

    const handleInputA = (event: React.ChangeEvent<HTMLInputElement>) => {
        setError(''); setInputA(0); setInput2A([]);
        setButtonA('button primary'); setLegendA('continue');
        setServices2(services_);
        let _input = event.target.value;
        const re = /,/gi;
        _input = _input.replace(re, ".");
        const input = Number(_input);

        if (!isNaN(input) && Number.isInteger(input)) {
            setInputA(input);
        } else if (isNaN(input)) {
            setError('the input is not a number.')
        } else if (!Number.isInteger(input)) {
            setError('the input must be an integer.')
        }
    };

    const handleContinueA = async () => {
        setError('');
        const _services: tyron.DocumentModel.ServiceModel[] = [];
        if (services.length !== 0) {
            for (let i = 0; i < services.length; i += 1) {
                const this_service = services[i];
                if (this_service[0] !== '' && this_service[1] !== '') {
                    _services.push({
                        id: this_service[0],
                        endpoint: tyron.DocumentModel.ServiceEndpoint.Web3Endpoint,
                        val: this_service[1],
                        blockchainType: tyron.DocumentModel.BlockchainType.Zilliqa
                    })
                }
            }
        }
        if (_services.length !== inputA) {
            setError('the input is incomplete')
        } else {
            setServices2(_services);
            setButtonA('button'); setLegendA('saved');
        }
    };

    //@todo process all patches
    const patches: tyron.DocumentModel.PatchModel[] = [
        {
            action: tyron.DocumentModel.PatchAction.AddServices,
            services: services2
        }
    ];

    //update free list
    const [inputB, setInputB] = useState(0);
    const input_B = Array(inputB);
    const select_inputB = [];
    for (let i = 0; i < input_B.length; i += 1) {
        select_inputB[i] = i;
    }
    const [input2B, setInput2B] = useState([]);
    const members: string[] = input2B;

    const [legendB, setLegendB] = useState('continue');
    const [buttonB, setButtonB] = useState('button primary');

    const list: any[] = [];
    const [members_, setMembers_] = useState(list);

    const handleInputB = (event: React.ChangeEvent<HTMLInputElement>) => {
        setError(''); setInputB(0); setInput2B([]);
        setButtonB('button primary'); setLegendB('continue');
        setMembers_(list);
        let _input = event.target.value;
        const re = /,/gi;
        _input = _input.replace(re, ".");
        const input = Number(_input);

        if (!isNaN(input) && Number.isInteger(input)) {
            setInputB(input);
        } else if (isNaN(input)) {
            setError('the input is not a number.')
        } else if (!Number.isInteger(input)) {
            setError('the input must be an integer.')
        }
    };

    const handleContinueB = async () => {
        setError('');
        const _members = [];
        alert(members.length)
        if (members.length !== 0) {
            for (let i = 0; i < members.length; i += 1) {
                const this_item = members[i];
                if (this_item !== '') {
                    _members.push(this_item)
                    alert(this_item);
                }
            }
        }
        if (_members.length !== inputB) {
            setError('the input is incomplete.')
        } else {
            setMembers_(_members);
            setButtonB('button'); setLegendB('saved');
        }
    };

    const [txID, setTxID] = useState('');
    const handleSubmit = async () => {
        if (contract !== null) {
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
            }).then(res => {
                setTxID(res.ID);
            })
        }
    };

    //update transfer tyron
    const [inputC, setInputC] = useState(0);
    const input_C = Array(inputC);
    const select_inputC = [];
    for (let i = 0; i < input_C.length; i += 1) {
        select_inputC[i] = i;
    }
    const [inputCC, setInputCC] = useState([]);
    const membersC: string[] = inputCC;

    const [legendC, setLegendC] = useState('continue');
    const [buttonC, setButtonC] = useState('button primary');

    const list_: any[] = [];
    const [membersC_, setMembersC_] = useState(list_);

    const handleInputC = (event: React.ChangeEvent<HTMLInputElement>) => {
        setError(''); setTxID(''); setInputC(0); setInputCC([]);
        setButtonC('button primary'); setLegendC('continue');
        setMembersC_(list_);
        let _input = event.target.value;
        const re = /,/gi;
        _input = _input.replace(re, ".");
        const input = Number(_input);

        if (!isNaN(input) && Number.isInteger(input)) {
            setInputC(input);
        } else if (isNaN(input)) {
            setError('the input is not a number.')
        } else if (!Number.isInteger(input)) {
            setError('the input must be an integer.')
        }
    };

    const handleContinueC = async () => {
        setError('');
        const _members = [];
        alert(membersC.length)
        if (membersC.length !== 0) {
            for (let i = 0; i < membersC.length; i += 1) {
                const this_item = membersC[i];
                if (this_item !== '') {
                    _members.push(this_item)
                    alert(this_item);
                }
            }
        }
        if (_members.length !== inputC) {
            setError('the input is incomplete.')
        } else {
            setMembersC_(_members);
            setButtonC('button'); setLegendC('saved');
        }
    };

    const handleSubmitC = async () => {

        const transitionID = 'TransferNFTUsernameUpgrade'
        const zilpay = new ZilPayBase();

        const tx_param: tyron.TyronZil.TransitionParams[] = [{
            vname: 'addr',
            type: 'List ByStr20',
            value: membersC_,
        }];

        await zilpay.call(
            {
                contractAddress: "0x9a05250261fa67f866547f617b42366f4a8d1223", // @todo-upgrade tyroni
                transition: transitionID,
                params: tx_param as unknown as Record<string, unknown>[],
                amount: String(0)
            },
            {
                gasPrice: '2000',
                gaslimit: '10000'
            }
        ).then(res => {
            setTxID(res.ID);
        })
    };

    const handleResetA = async () => {
        setError(''); setButtonA('button primary'); setLegendA('continue');
    };
    const handleResetB = async () => {
        setError(''); setButtonB('button primary'); setLegendB('continue');
    };
    const handleResetC = async () => {
        setError(''); setButtonC('button primary'); setLegendC('continue');
    };

    return (
        <>
            {
                user?.nft !== 'init' &&
                <p>
                    Coming soon!
                </p>
            }
            {
                user?.nft === 'init' &&
                <>
                    <h4>Services</h4>
                    <section className={styles.container}>
                        <code style={{ width: '70%' }}>
                            How many web3 addresses would you like to save?
                        </code>
                        <input
                            ref={searchInput}
                            style={{ width: '20%' }}
                            type="text"
                            placeholder="Type amount"
                            onChange={handleInputA}
                            autoFocus
                        />
                    </section>
                    {
                        inputA != 0 &&
                        select_inputA.map((res: number) => {
                            return (
                                <section key={res} className={styles.container}>
                                    <input
                                        style={{ width: '20%' }}
                                        type="text"
                                        placeholder="Type service ID"
                                        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                                            handleResetA();
                                            const value = event.target.value;
                                            if (services[res] === undefined) {
                                                services[res] = ['', ''];
                                            }
                                            services[res][0] = value.toLowerCase();
                                        }}
                                    />
                                    <input
                                        style={{ width: '60%' }}
                                        type="text"
                                        placeholder="Type web3 address"
                                        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                                            handleResetA();
                                            const value = event.target.value;
                                            if (services[res] === undefined) {
                                                services[res] = ['', ''];
                                            }
                                            services[res][1] = value.toLowerCase();
                                        }}
                                    />
                                </section>
                            )
                        })
                    }
                    <TyronDonate />
                    <SubmitUpdateDoc
                        {...{
                            patches: patches
                        }} />
                    <section className={styles.container}>
                        <code style={{ width: '70%' }}>
                            How many members (addresses) would you like to add?
                        </code>
                        <input
                            ref={searchInput}
                            style={{ width: '20%' }}
                            type="text"
                            placeholder="Type amount"
                            onChange={handleInputB}
                            autoFocus
                        />
                    </section>
                    {
                        inputB != 0 &&
                        select_inputB.map((res: number) => {
                            return (
                                <section key={res} className={styles.container}>
                                    <input
                                        ref={searchInput}
                                        style={{ width: '60%' }}
                                        type="text"
                                        placeholder="Type address"
                                        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                                            handleResetB();
                                            let value = event.target.value;
                                            try {
                                                value = zcrypto.fromBech32Address(value);
                                                members[res] = value;
                                            } catch (error) {
                                                try {
                                                    value = zcrypto.toChecksumAddress(value);
                                                    members[res] = value;
                                                } catch {
                                                    setError('wrong addresss')
                                                }
                                            }
                                        }}
                                    />
                                </section>
                            )
                        })
                    }
                    <section className={styles.container}>
                        <code style={{ width: '70%' }}>
                            How many transfers (addresses) would you like to add?
                        </code>
                        <input
                            ref={searchInput}
                            style={{ width: '20%' }}
                            type="text"
                            placeholder="Type amount"
                            onChange={handleInputC}
                            autoFocus
                        />
                    </section>
                    {
                        inputC != 0 &&
                        select_inputC.map((res: number) => {
                            return (
                                <section key={res} className={styles.container}>
                                    <input
                                        ref={searchInput}
                                        style={{ width: '60%' }}
                                        type="text"
                                        placeholder="Type address"
                                        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                                            handleResetC();
                                            let value = event.target.value;
                                            try {
                                                value = zcrypto.fromBech32Address(value);
                                                membersC[res] = value;
                                            } catch (error) {
                                                try {
                                                    value = zcrypto.toChecksumAddress(value);
                                                    membersC[res] = value;
                                                } catch {
                                                    setError('wrong address.')
                                                }
                                            }
                                        }}
                                    />
                                </section>
                            )
                        })
                    }
                    <div>
                        <input type="button" className={buttonA} value={legendA}
                            onClick={() => {
                                handleContinueA();
                            }}
                        />
                    </div>
                    <div>
                        <input type="button" className={buttonB} value={legendB}
                            onClick={() => {
                                handleContinueB();
                            }}
                        />
                    </div>
                    <div>
                        <input type="button" className={buttonC} value={legendC}
                            onClick={() => {
                                handleContinueC();
                            }}
                        />
                    </div>
                    {
                        members_.length !== 0 &&
                        <div style={{ marginTop: '10%' }}>
                            <button className={styles.button} onClick={handleSubmit}>
                                update free list
                            </button>
                        </div>
                    }
                    {
                        membersC_.length !== 0 &&
                        <div style={{ marginTop: '10%' }}>
                            <button className={styles.button} onClick={handleSubmitC}>
                                update transfer list
                            </button>
                        </div>
                    }
                </>
            }
            {
                txID !== '' &&
                <div style={{ marginLeft: '-5%' }}>
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
                <code>
                    Error: {error}
                </code>
            }
        </>
    );
}

export default Component
