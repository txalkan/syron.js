import React, { useState, useCallback, useEffect } from 'react'
import * as tyron from 'tyron'
import Image from 'next/image'
import { toast } from 'react-toastify'
import { SubmitUpdateDoc } from '../../../../..'
import { useStore } from 'effector-react'
import { $doc } from '../../../../../../src/store/did-doc'
import styles from './styles.module.scss'
import tick from '../../../../../../src/assets/logos/tick.png'
import controller from '../../../../../../src/hooks/isController'

function Component() {
    const doc = useStore($doc)?.doc
    const [docType, setDocType] = useState('')
    const [replaceKeyList, setReplaceKeyList] = useState(Array())
    const [replaceKeyList_, setReplaceKeyList_] = useState(['update'])
    const [replaceServiceList, setReplaceServiceList] = useState(Array())
    const [deleteServiceList, setDeleteServiceList] = useState(Array())
    const [tickList, setTickList] = useState(Array())
    const [next, setNext] = useState(false)
    const [patches, setPatches] = useState(Array())
    const [input, setInput] = useState(0)
    const input_ = Array(input)
    const select_input = Array()
    for (let i = 0; i < input_.length; i += 1) {
        select_input[i] = i
    }
    const [input2, setInput2] = useState([])
    const services: string[][] = input2
    const { isController } = controller()

    useEffect(() => {
        isController()
    })

    const callbackRef = useCallback((inputElement) => {
        if (inputElement) {
            inputElement.focus()
        }
    }, [])

    const checkIsExist = (id: any, type: number) => {
        if (replaceServiceList.some((val) => val.id === id) && type === 1) {
            return true
        } else if (deleteServiceList.some((val) => val === id) && type === 2) {
            return true
        } else if (replaceKeyList.some((val) => val === id) && type === 3) {
            return true
        } else if (tickList.some((val) => val === id) && type === 4) {
            return true
        } else {
            return false
        }
    }

    const pushReplaceKeyList = (id: string, id_: string) => {
        if (!checkIsExist(id, 3)) {
            if (id_ !== 'update') {
                setReplaceKeyList_([...replaceKeyList_, id_])
            }
            setReplaceKeyList([...replaceKeyList, id])
        }
    }

    const removeReplaceKeyList = (id: any) => {
        let newArr = replaceKeyList.filter((val) => val !== id)
        setReplaceKeyList(newArr)
        let newArr_: string[] = []
        switch (id) {
            case 'social-recovery key':
                {
                    newArr_ = replaceKeyList_.filter(
                        (val) => val !== 'socialrecovery'
                    )
                }
                break
            case 'update key':
                {
                    newArr_ = replaceKeyList_
                }
                break
            case 'general-purpose key':
                {
                    newArr_ = replaceKeyList_.filter((val) => val !== 'general')
                }
                break
            case 'authentication key':
                {
                    newArr_ = replaceKeyList_.filter(
                        (val) => val !== 'authentication'
                    )
                }
                break
            case 'assertion key':
                {
                    newArr_ = replaceKeyList_.filter(
                        (val) => val !== 'assertion'
                    )
                }
                break
            case 'agreement key':
                {
                    newArr_ = replaceKeyList_.filter(
                        (val) => val !== 'agreement'
                    )
                }
                break
            case 'invocation key':
                {
                    newArr_ = replaceKeyList_.filter(
                        (val) => val !== 'invocation'
                    )
                }
                break
            case 'delegation key':
                {
                    newArr_ = replaceKeyList_.filter(
                        (val) => val !== 'delegation'
                    )
                }
                break
            case 'verifiable-credential key':
                {
                    newArr_ = replaceKeyList_.filter((val) => val !== 'vc')
                }
                break
        }
        setReplaceKeyList_(newArr_)
    }

    const pushReplaceServiceList = (id: string, service: string) => {
        const obj = {
            id: id,
            value: service,
        }
        let newArr = replaceServiceList.filter((val) => val.id !== id)
        newArr.push(obj)
        setReplaceServiceList(newArr)
        removeDeleteServiceList(id)
    }

    const pushDeleteServiceList = (id: any) => {
        setDeleteServiceList([...deleteServiceList, id])
        removeReplaceServiceList(id)
    }

    const removeReplaceServiceList = (id: any) => {
        let newArr = replaceServiceList.filter((val) => val.id !== id)
        setReplaceServiceList(newArr)
    }

    const removeDeleteServiceList = (id: any) => {
        let newArr = deleteServiceList.filter((val) => val !== id)
        setDeleteServiceList(newArr)
    }

    const handleOnChange = (event: { target: { value: any } }) => {
        setDocType(event.target.value)
    }

    const handleInput = (event: React.ChangeEvent<HTMLInputElement>) => {
        setInput(0)
        setInput2([])
        let _input = event.target.value
        const re = /,/gi
        _input = _input.replace(re, '.')
        const input = Number(_input)

        if (!isNaN(input) && Number.isInteger(input)) {
            setInput(input)
        } else if (isNaN(input)) {
            toast.error('The input is not a number.', {
                position: 'top-right',
                autoClose: 6000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: 'dark',
            })
        } else if (!Number.isInteger(input)) {
            toast.error('The number of services must be an integer.', {
                position: 'top-right',
                autoClose: 6000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: 'dark',
            })
        }
    }

    const handleServices = async () => {
        try {
            const patches: tyron.DocumentModel.PatchModel[] = []
            if (deleteServiceList.length !== 0) {
                patches.push({
                    action: tyron.DocumentModel.PatchAction.RemoveServices,
                    ids: deleteServiceList,
                })
            }

            let checkPending = replaceServiceList.filter(
                (val) => val.value === 'pending'
            )
            if (checkPending.length > 0) {
                throw Error('Some input data is missing.')
            }

            const add_services: tyron.DocumentModel.ServiceModel[] = []

            // Services to replace
            for (let i = 0; i < replaceServiceList.length; i += 1) {
                const this_service = replaceServiceList[i]
                if (
                    this_service.id !== '' &&
                    this_service.value !== '' &&
                    this_service.value !== 'pending'
                ) {
                    add_services.push({
                        id: this_service.id,
                        endpoint:
                            tyron.DocumentModel.ServiceEndpoint.Web2Endpoint,
                        type: 'website',
                        transferProtocol:
                            tyron.DocumentModel.TransferProtocol.Https,
                        val: `https://${this_service.value}`,
                    })
                }
            }

            // New services
            if (services.length !== 0) {
                for (let i = 0; i < services.length; i += 1) {
                    const this_service = services[i]
                    if (this_service[0] !== '' && this_service[1] !== '') {
                        add_services.push({
                            id: this_service[0],
                            endpoint:
                                tyron.DocumentModel.ServiceEndpoint
                                    .Web2Endpoint,
                            type: 'website',
                            transferProtocol:
                                tyron.DocumentModel.TransferProtocol.Https,
                            val: `https://${this_service[1]}`,
                        })
                    }
                }
            }
            if (add_services.length !== 0) {
                patches.push({
                    action: tyron.DocumentModel.PatchAction.AddServices,
                    services: add_services,
                })
            }
            setPatches(patches)
            setNext(true)
        } catch (error) {
            toast.error(String(error), {
                position: 'top-right',
                autoClose: 6000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: 'dark',
            })
        }
    }

    return (
        <>
            {!next && (
                <div>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <select
                            style={{ width: '100%' }}
                            onChange={handleOnChange}
                        >
                            <option value="">Select document element</option>
                            <option value="Key">Keys</option>
                            <option value="Service">Services</option>
                        </select>
                    </div>
                    <section style={{ marginTop: '5%' }}>
                        {doc !== null &&
                            doc?.map((res: any) => {
                                if (res[0] !== 'Decentralized identifier') {
                                    return (
                                        <div key={res}>
                                            {res[0] !== 'DID services' &&
                                            docType === 'Key' ? (
                                                <>
                                                    <div
                                                        className={
                                                            styles.keyWrapper
                                                        }
                                                    >
                                                        <div
                                                            key={res}
                                                            className={
                                                                styles.docInfo
                                                            }
                                                        >
                                                            <h3
                                                                className={
                                                                    styles.blockHead
                                                                }
                                                            >
                                                                {res[0]}
                                                            </h3>
                                                            {res[1].map(
                                                                (
                                                                    element: any
                                                                ) => {
                                                                    return (
                                                                        <p
                                                                            key={
                                                                                element
                                                                            }
                                                                            className={
                                                                                styles.didkey
                                                                            }
                                                                        >
                                                                            {(
                                                                                element as string
                                                                            ).slice(
                                                                                0,
                                                                                22
                                                                            )}
                                                                            ...
                                                                        </p>
                                                                    )
                                                                }
                                                            )}
                                                        </div>
                                                        <div
                                                            className={
                                                                styles.actionBtnWrapper
                                                            }
                                                        >
                                                            {checkIsExist(
                                                                res[0],
                                                                3
                                                            ) ? (
                                                                <button
                                                                    className={
                                                                        styles.button2
                                                                    }
                                                                    onClick={() =>
                                                                        removeReplaceKeyList(
                                                                            res[0]
                                                                        )
                                                                    }
                                                                >
                                                                    <p
                                                                        className={
                                                                            styles.buttonText2
                                                                        }
                                                                    >
                                                                        to
                                                                        replace
                                                                    </p>
                                                                </button>
                                                            ) : (
                                                                <button
                                                                    className={
                                                                        styles.button
                                                                    }
                                                                    onClick={() => {
                                                                        switch (
                                                                            res[0]
                                                                        ) {
                                                                            case 'social-recovery key':
                                                                                pushReplaceKeyList(
                                                                                    res[0],
                                                                                    'socialrecovery'
                                                                                )
                                                                                break
                                                                            case 'update key':
                                                                                pushReplaceKeyList(
                                                                                    res[0],
                                                                                    'update'
                                                                                )
                                                                                break
                                                                            case 'general-purpose key':
                                                                                pushReplaceKeyList(
                                                                                    res[0],
                                                                                    'general'
                                                                                )
                                                                                break
                                                                            case 'authentication key':
                                                                                pushReplaceKeyList(
                                                                                    res[0],
                                                                                    'authentication'
                                                                                )
                                                                                break
                                                                            case 'assertion key':
                                                                                pushReplaceKeyList(
                                                                                    res[0],
                                                                                    'assertion'
                                                                                )
                                                                                break
                                                                            case 'agreement key':
                                                                                pushReplaceKeyList(
                                                                                    res[0],
                                                                                    'agreement'
                                                                                )
                                                                                break
                                                                            case 'invocation key':
                                                                                pushReplaceKeyList(
                                                                                    res[0],
                                                                                    'invocation'
                                                                                )
                                                                                break
                                                                            case 'delegation key':
                                                                                pushReplaceKeyList(
                                                                                    res[0],
                                                                                    'delegation'
                                                                                )
                                                                                break
                                                                            case 'verifiable-credential key':
                                                                                pushReplaceKeyList(
                                                                                    res[0],
                                                                                    'vc'
                                                                                )
                                                                                break
                                                                        }
                                                                    }}
                                                                >
                                                                    <p
                                                                        className={
                                                                            styles.buttonText
                                                                        }
                                                                    >
                                                                        Replace
                                                                    </p>
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </>
                                            ) : res[0] === 'DID services' &&
                                              docType === 'Service' ? (
                                                <>
                                                    {res[1].map(
                                                        (
                                                            val: any[],
                                                            i:
                                                                | React.Key
                                                                | null
                                                                | undefined
                                                        ) => (
                                                            <>
                                                                <div
                                                                    className={
                                                                        styles.keyWrapper
                                                                    }
                                                                    key={i}
                                                                >
                                                                    <div
                                                                        key={
                                                                            res
                                                                        }
                                                                        className={
                                                                            styles.docInfo
                                                                        }
                                                                    >
                                                                        <h3
                                                                            className={
                                                                                styles.blockHead
                                                                            }
                                                                        >
                                                                            {
                                                                                val[0]
                                                                            }
                                                                        </h3>
                                                                        <p
                                                                            key={
                                                                                i
                                                                            }
                                                                            className={
                                                                                styles.didkey
                                                                            }
                                                                        >
                                                                            {
                                                                                val[1]
                                                                            }
                                                                        </p>
                                                                    </div>
                                                                    <div
                                                                        className={
                                                                            styles.actionBtnWrapper
                                                                        }
                                                                    >
                                                                        {checkIsExist(
                                                                            val[0],
                                                                            1
                                                                        ) ? (
                                                                            <button
                                                                                className={
                                                                                    styles.button2
                                                                                }
                                                                                onClick={() =>
                                                                                    removeReplaceServiceList(
                                                                                        val[0]
                                                                                    )
                                                                                }
                                                                            >
                                                                                <p
                                                                                    className={
                                                                                        styles.buttonText2
                                                                                    }
                                                                                >
                                                                                    to
                                                                                    replace
                                                                                </p>
                                                                            </button>
                                                                        ) : (
                                                                            <button
                                                                                className={
                                                                                    styles.button
                                                                                }
                                                                                onClick={() =>
                                                                                    pushReplaceServiceList(
                                                                                        val[0],
                                                                                        'pending'
                                                                                    )
                                                                                }
                                                                            >
                                                                                <p
                                                                                    className={
                                                                                        styles.buttonText
                                                                                    }
                                                                                >
                                                                                    replace
                                                                                </p>
                                                                            </button>
                                                                        )}
                                                                        {checkIsExist(
                                                                            val[0],
                                                                            2
                                                                        ) ? (
                                                                            <button
                                                                                className={
                                                                                    styles.button2
                                                                                }
                                                                                onClick={() =>
                                                                                    removeDeleteServiceList(
                                                                                        val[0]
                                                                                    )
                                                                                }
                                                                            >
                                                                                <p
                                                                                    className={
                                                                                        styles.buttonText2
                                                                                    }
                                                                                >
                                                                                    to
                                                                                    delete
                                                                                </p>
                                                                            </button>
                                                                        ) : (
                                                                            <button
                                                                                className={
                                                                                    styles.button
                                                                                }
                                                                                onClick={() =>
                                                                                    pushDeleteServiceList(
                                                                                        val[0]
                                                                                    )
                                                                                }
                                                                            >
                                                                                <p
                                                                                    className={
                                                                                        styles.buttonText
                                                                                    }
                                                                                >
                                                                                    delete
                                                                                </p>
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                {checkIsExist(
                                                                    val[0],
                                                                    1
                                                                ) ? (
                                                                    <p
                                                                        className={
                                                                            styles.containerInput
                                                                        }
                                                                    >
                                                                        ID:{' '}
                                                                        {val[0]}
                                                                        <input
                                                                            style={{
                                                                                marginLeft:
                                                                                    '2%',
                                                                                marginRight:
                                                                                    '2%',
                                                                                width: '60%',
                                                                            }}
                                                                            type="text"
                                                                            placeholder="Type new service value"
                                                                            onChange={(
                                                                                event: React.ChangeEvent<HTMLInputElement>
                                                                            ) => {
                                                                                const value =
                                                                                    event.target.value
                                                                                        .replaceAll(
                                                                                            'wwww.',
                                                                                            ''
                                                                                        )
                                                                                        .replaceAll(
                                                                                            'https://',
                                                                                            ''
                                                                                        )
                                                                                pushReplaceServiceList(
                                                                                    val[0],
                                                                                    value
                                                                                )
                                                                                setTickList(
                                                                                    [
                                                                                        ...tickList,
                                                                                        val[0],
                                                                                    ]
                                                                                )
                                                                            }}
                                                                            autoFocus
                                                                        />
                                                                        {checkIsExist(
                                                                            val[0],
                                                                            4
                                                                        ) ? (
                                                                            <Image
                                                                                width={
                                                                                    25
                                                                                }
                                                                                height={
                                                                                    25
                                                                                }
                                                                                alt="tick-ico"
                                                                                src={
                                                                                    tick
                                                                                }
                                                                            />
                                                                        ) : (
                                                                            <>

                                                                            </>
                                                                        )}
                                                                    </p>
                                                                ) : (
                                                                    <></>
                                                                )}
                                                            </>
                                                        )
                                                    )}
                                                </>
                                            ) : (
                                                <></>
                                            )}
                                        </div>
                                    )
                                }
                            })}
                    </section>
                    {docType === 'Service' && (
                        <section
                            style={{
                                marginTop: '14%',
                                display: 'flex',
                                alignItems: 'center',
                                flexDirection: 'column',
                            }}
                        >
                            <h3>New services</h3>
                            <p className={styles.container}>
                                Would you like to add new services?
                                <input
                                    ref={callbackRef}
                                    style={{ width: '25%', marginLeft: '2%' }}
                                    type="text"
                                    placeholder="Type amount"
                                    onChange={handleInput}
                                    autoFocus
                                />
                            </p>
                            {input != 0 &&
                                select_input.map((res: number) => {
                                    return (
                                        <p
                                            key={res}
                                            className={styles.container}
                                        >
                                            <input
                                                ref={callbackRef}
                                                style={{
                                                    width: '20%',
                                                    marginRight: '3%',
                                                }}
                                                type="text"
                                                placeholder="Type ID"
                                                onChange={(
                                                    event: React.ChangeEvent<HTMLInputElement>
                                                ) => {
                                                    const value =
                                                        event.target.value

                                                    if (
                                                        doc?.filter(
                                                            (val) =>
                                                                val[0] ===
                                                                'DID services'
                                                        )[0] !== undefined
                                                    ) {
                                                        var list = doc?.filter(
                                                            (val) =>
                                                                val[0] ===
                                                                'DID services'
                                                        )[0][1] as any
                                                    } else {
                                                        var list = [] as any
                                                    }
                                                    let checkDuplicate =
                                                        list.filter(
                                                            (val: string[]) =>
                                                                val[0] === value
                                                        )
                                                    if (
                                                        checkDuplicate.length >
                                                        0
                                                    ) {
                                                        toast.error(
                                                            'Service ID repeated so it will not get added to your DID Document.',
                                                            {
                                                                position:
                                                                    'top-right',
                                                                autoClose: 6000,
                                                                hideProgressBar:
                                                                    false,
                                                                closeOnClick:
                                                                    true,
                                                                pauseOnHover:
                                                                    true,
                                                                draggable: true,
                                                                progress:
                                                                    undefined,
                                                                theme: 'dark',
                                                            }
                                                        )
                                                    } else {
                                                        if (
                                                            services[res] ===
                                                            undefined
                                                        ) {
                                                            services[res] = [
                                                                '',
                                                                '',
                                                            ]
                                                        }
                                                        services[res][0] = value
                                                    }
                                                }}
                                            />
                                            https://www.
                                            <input
                                                ref={callbackRef}
                                                style={{ width: '60%' }}
                                                type="text"
                                                placeholder="Type service URL"
                                                onChange={(
                                                    event: React.ChangeEvent<HTMLInputElement>
                                                ) => {
                                                    const value =
                                                        event.target.value.toLowerCase()
                                                    if (
                                                        services[res] ===
                                                        undefined
                                                    ) {
                                                        services[res] = ['', '']
                                                    }
                                                    services[res][1] = value
                                                        .replaceAll('wwww.', '')
                                                        .replaceAll(
                                                            'https://',
                                                            ''
                                                        )
                                                }}
                                            />
                                        </p>
                                    )
                                })}
                        </section>
                    )}
                    <div style={{ marginTop: '10%', textAlign: 'center' }}>
                        <button
                            type="button"
                            className="button primary"
                            onClick={handleServices}
                        >
                            <p>continue</p>
                        </button>
                    </div>
                </div>
            )}
            {next && (
                <>
                    <div className={styles.docInfo}>
                        <h3 className={styles.blockHead}>
                            About to update the following
                        </h3>
                        <div
                            style={{
                                textAlign: 'left',
                                marginBottom: '7%',
                                marginLeft: '4%',
                                width: '100%',
                            }}
                        >
                            {replaceKeyList_.length > 0 && (
                                <>
                                    {replaceKeyList_.map((val, i) => (
                                        <p key={i} className={styles.didkey}>
                                            - {val} key
                                        </p>
                                    ))}
                                </>
                            )}
                            {replaceServiceList.length > 0 && (
                                <>
                                    <h4 style={{ marginTop: '7%' }}>
                                        Service IDs to replace:
                                    </h4>
                                    {replaceServiceList.map((val, i) => (
                                        <p key={i} className={styles.didkey}>
                                            - {val.id}: {val.value}
                                        </p>
                                    ))}
                                </>
                            )}
                            {deleteServiceList.length > 0 && (
                                <>
                                    <h4 style={{ marginTop: '7%' }}>
                                        Service IDs to delete:
                                    </h4>
                                    {deleteServiceList.map((val, i) => (
                                        <p key={i} className={styles.didkey}>
                                            - {val}
                                        </p>
                                    ))}
                                </>
                            )}
                            {services.length > 0 && (
                                <>
                                    <p style={{ marginTop: '7%' }}>
                                        Adding new services too!
                                    </p>
                                    {services.map((val, i) => (
                                        <p key={i} className={styles.didkey}>
                                            - {val[0]}
                                        </p>
                                    ))}
                                </>
                            )}
                        </div>
                    </div>
                    <SubmitUpdateDoc
                        {...{
                            ids: replaceKeyList_,
                            patches: patches,
                        }}
                    />
                </>
            )}
        </>
    )
}

export default Component
