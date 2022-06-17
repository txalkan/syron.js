import React, { useState, useCallback, useEffect } from 'react'
import * as tyron from 'tyron'
import Image from 'next/image'
import { toast } from 'react-toastify'
import { SketchPicker } from 'react-color'
import { SubmitUpdateDoc } from '../../../../..'
import { useStore } from 'effector-react'
import { $doc } from '../../../../../../src/store/did-doc'
import styles from './styles.module.scss'
import tick from '../../../../../../src/assets/logos/tick.png'
import trash from '../../../../../../src/assets/icons/trash.svg'
import retweet from '../../../../../../src/assets/icons/retweet.svg'
import cross from '../../../../../../src/assets/icons/close_icon_white.svg'
import warning from '../../../../../../src/assets/icons/warning_triangle.svg'
import arrowDown from '../../../../../../src/assets/icons/arrow_down_white.svg'
import arrowUp from '../../../../../../src/assets/icons/arrow_up_white.svg'
import defaultCheckmark from '../../../../../../src/assets/icons/default_checkmark.svg'
import selectedCheckmark from '../../../../../../src/assets/icons/selected_checkmark.svg'
import discordIco from '../../../../../../src/assets/icons/discord_icon.svg'
import facebookIco from '../../../../../../src/assets/icons/facebook_icon.svg'
import githubIco from '../../../../../../src/assets/icons/github_icon.svg'
import instagramIco from '../../../../../../src/assets/icons/instagram_icon.svg'
import twitterIco from '../../../../../../src/assets/icons/twitter_icon.svg'
import addIco from '../../../../../../src/assets/icons/add_icon.svg'
import minusIco from '../../../../../../src/assets/icons/minus_yellow_icon.svg'
import controller from '../../../../../../src/hooks/isController'

function Component() {
    const doc = useStore($doc)?.doc
    const [docType, setDocType] = useState('')
    const [replaceKeyList, setReplaceKeyList] = useState(Array())
    const [replaceKeyList_, setReplaceKeyList_] = useState(['update'])
    const [addServiceList, setAddServiceList] = useState(Array())
    const [replaceServiceList, setReplaceServiceList] = useState(Array())
    const [deleteServiceList, setDeleteServiceList] = useState(Array())
    const [tickList, setTickList] = useState(Array())
    const [next, setNext] = useState(false)
    const [patches, setPatches] = useState(Array())
    const [color1, setColor1] = useState('')
    const [color2, setColor2] = useState('')
    const [showColor1, setShowColor1] = useState(false)
    const [showColor2, setShowColor2] = useState(false)
    const [showColor, setShowColor] = useState('')
    const [showCommonDropdown, setShowCommonDropdown] = useState(false)
    const [selectedCommon, setSelectedCommon] = useState(Array())
    const [commonActive, setCommonActive] = useState('')
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
        } else if (addServiceList.some((val) => val === id) && type === 4) {
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

    const pushAddServiceList = (id: number, service: string) => {
        const obj = {
            id: id,
            value: service,
        }
        let newArr = addServiceList.filter((val) => val.id !== id)
        newArr.push(obj)
        setAddServiceList(newArr)
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

    const removeAddServiceList = (id: any) => {
        let newArr = addServiceList.filter((val) => val.id !== id)
        setAddServiceList(newArr)
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
                        val: this_service.value,
                    })
                }
            }

            // New services
            if (addServiceList.length !== 0) {
                for (let i = 0; i < addServiceList.length; i += 1) {
                    const this_service = addServiceList[i]
                    const splittedService = this_service.value.split('#')
                    if (
                        this_service.id !== '' &&
                        this_service.value !== '####'
                    ) {
                        add_services.push({
                            id: String(this_service.id),
                            endpoint:
                                tyron.DocumentModel.ServiceEndpoint
                                    .Web2Endpoint,
                            type:
                                splittedService[0] +
                                '#' +
                                splittedService[2] +
                                '#' +
                                splittedService[3] +
                                '#' +
                                splittedService[4],
                            transferProtocol:
                                tyron.DocumentModel.TransferProtocol.Https,
                            val: splittedService[1],
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

    const handleChangeCompleteOpt = (color, id) => {
        if (id === 1) {
            setColor1(color.hex)
        } else {
            setColor2(color.hex)
        }
    }

    const socialDropdown = [
        'Discord',
        'Facebook',
        'Github',
        'Instagram',
        'Twitter',
    ]

    const selectCommon = (val) => {
        setShowCommonDropdown(false)
        if (!checkIsExistCommon(val)) {
            let arr = selectedCommon
            arr.push(val)
            setSelectedCommon(arr)
        } else {
            let arr = selectedCommon.filter((arr) => arr !== val)
            setSelectedCommon(arr)
        }
    }

    const checkIsExistCommon = (val) => {
        if (selectedCommon.some((arr) => arr === val)) {
            return true
        } else {
            return false
        }
    }

    const getArrValue = (id, arr, data_) => {
        let res
        switch (data_) {
            case 'add':
                res = addServiceList
                break
            case 'replace':
                res = replaceServiceList
                break
        }
        const data: any = res.filter((val_) => val_.id === id)[0]
        const string = data?.value.split('#')[arr]
        return string
    }

    const toggleColorPicker = (id) => {
        if (id === showColor) {
            setShowColor('')
        } else {
            setShowColor(id)
        }
    }

    return (
        <>
            {!next && (
                <div>
                    {docType === '' && (
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'center',
                            }}
                        >
                            <select
                                style={{ width: '100%' }}
                                onChange={handleOnChange}
                            >
                                <option value="">
                                    Select document element
                                </option>
                                <option value="Key">Keys</option>
                                <option value="Service">Services</option>
                            </select>
                        </div>
                    )}
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
                                                    <h4
                                                        className={
                                                            styles.existingLabelTitle
                                                        }
                                                    >
                                                        Existing Labels
                                                    </h4>
                                                    <div
                                                        className={
                                                            styles.serviceWrapper
                                                        }
                                                    >
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
                                                                        key={i}
                                                                        className={
                                                                            styles.serviceKey
                                                                        }
                                                                    >
                                                                        <div>
                                                                            <h4
                                                                                className={
                                                                                    styles.serviceKeyTitle
                                                                                }
                                                                            >
                                                                                {
                                                                                    val[1].split(
                                                                                        '#'
                                                                                    )[0]
                                                                                }
                                                                            </h4>
                                                                            <h4
                                                                                className={
                                                                                    styles.serviceKeyLink
                                                                                }
                                                                            >
                                                                                {
                                                                                    val[1].split(
                                                                                        '#'
                                                                                    )[1]
                                                                                }
                                                                            </h4>
                                                                        </div>
                                                                        <div
                                                                            className={
                                                                                styles.serviceIcoWrapper
                                                                            }
                                                                        >
                                                                            <div
                                                                                onClick={() =>
                                                                                    pushReplaceServiceList(
                                                                                        val[0],
                                                                                        `${val[0]}####`
                                                                                    )
                                                                                }
                                                                                style={{
                                                                                    cursor: 'pointer',
                                                                                }}
                                                                            >
                                                                                <Image
                                                                                    src={
                                                                                        retweet
                                                                                    }
                                                                                    alt="ico-replace"
                                                                                />
                                                                            </div>
                                                                            <div
                                                                                onClick={() =>
                                                                                    setNext(
                                                                                        true
                                                                                    )
                                                                                }
                                                                                style={{
                                                                                    cursor: 'pointer',
                                                                                    marginLeft:
                                                                                        '2%',
                                                                                }}
                                                                            >
                                                                                <Image
                                                                                    src={
                                                                                        trash
                                                                                    }
                                                                                    alt="ico-delete"
                                                                                />
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    {checkIsExist(
                                                                        val[0],
                                                                        1
                                                                    ) && (
                                                                        <div
                                                                            className={
                                                                                styles.replaceLink
                                                                            }
                                                                        >
                                                                            <div
                                                                                className={
                                                                                    styles.replaceLinkHeader
                                                                                }
                                                                            >
                                                                                <div
                                                                                    style={{
                                                                                        fontSize:
                                                                                            '20px',
                                                                                    }}
                                                                                >
                                                                                    REPLACE
                                                                                    LINK
                                                                                </div>
                                                                                <div
                                                                                    className={
                                                                                        styles.icoClose
                                                                                    }
                                                                                    onClick={() =>
                                                                                        removeReplaceServiceList(
                                                                                            val[0]
                                                                                        )
                                                                                    }
                                                                                >
                                                                                    <Image
                                                                                        src={
                                                                                            cross
                                                                                        }
                                                                                        alt="ico-cross"
                                                                                    />
                                                                                </div>
                                                                            </div>
                                                                            <div
                                                                                style={{
                                                                                    marginTop:
                                                                                        '15%',
                                                                                }}
                                                                            >
                                                                                <div
                                                                                    style={{
                                                                                        marginBottom:
                                                                                            '5%',
                                                                                    }}
                                                                                >
                                                                                    <h4
                                                                                        className={
                                                                                            styles.newLinkFormTitle
                                                                                        }
                                                                                    >
                                                                                        url
                                                                                    </h4>
                                                                                    <input
                                                                                        className={
                                                                                            styles.newLinkForm
                                                                                        }
                                                                                        placeholder="Type new service value"
                                                                                        onChange={(
                                                                                            event: React.ChangeEvent<HTMLInputElement>
                                                                                        ) => {
                                                                                            const value =
                                                                                                event
                                                                                                    .target
                                                                                                    .value
                                                                                            const data: any =
                                                                                                replaceServiceList.filter(
                                                                                                    (
                                                                                                        val_
                                                                                                    ) =>
                                                                                                        val_.id ===
                                                                                                        val[0]
                                                                                                )[0]
                                                                                            const string =
                                                                                                data?.value.split(
                                                                                                    '#'
                                                                                                )[0] +
                                                                                                '#' +
                                                                                                value +
                                                                                                '#' +
                                                                                                data?.value.split(
                                                                                                    '#'
                                                                                                )[2] +
                                                                                                '#' +
                                                                                                data?.value.split(
                                                                                                    '#'
                                                                                                )[3] +
                                                                                                '#' +
                                                                                                data?.value.split(
                                                                                                    '#'
                                                                                                )[4]
                                                                                            pushReplaceServiceList(
                                                                                                val[0],
                                                                                                string
                                                                                            )
                                                                                        }}
                                                                                    />
                                                                                </div>
                                                                                <div>
                                                                                    <h4
                                                                                        className={
                                                                                            styles.newLinkFormTitle
                                                                                        }
                                                                                    >
                                                                                        short
                                                                                        description
                                                                                    </h4>
                                                                                    <div
                                                                                        className={
                                                                                            styles.replaceLinkTextArea
                                                                                        }
                                                                                    >
                                                                                        <textarea
                                                                                            value={getArrValue(
                                                                                                val[0],
                                                                                                4,
                                                                                                'replace'
                                                                                            )}
                                                                                            onChange={(
                                                                                                event
                                                                                            ) => {
                                                                                                const value =
                                                                                                    event
                                                                                                        .target
                                                                                                        .value
                                                                                                if (
                                                                                                    value.length >
                                                                                                    100
                                                                                                ) {
                                                                                                    toast.error(
                                                                                                        'Max character is 100.',
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
                                                                                                            draggable:
                                                                                                                true,
                                                                                                            progress:
                                                                                                                undefined,
                                                                                                            theme: 'dark',
                                                                                                            toastId: 13,
                                                                                                        }
                                                                                                    )
                                                                                                } else {
                                                                                                    const data: any =
                                                                                                        replaceServiceList.filter(
                                                                                                            (
                                                                                                                val_
                                                                                                            ) =>
                                                                                                                val_.id ===
                                                                                                                val[0]
                                                                                                        )[0]
                                                                                                    const string =
                                                                                                        data?.value.split(
                                                                                                            '#'
                                                                                                        )[0] +
                                                                                                        '#' +
                                                                                                        data?.value.split(
                                                                                                            '#'
                                                                                                        )[1] +
                                                                                                        '#' +
                                                                                                        data?.value.split(
                                                                                                            '#'
                                                                                                        )[2] +
                                                                                                        '#' +
                                                                                                        data?.value.split(
                                                                                                            '#'
                                                                                                        )[3] +
                                                                                                        '#' +
                                                                                                        value
                                                                                                    pushReplaceServiceList(
                                                                                                        val[0],
                                                                                                        string
                                                                                                    )
                                                                                                    console.log(
                                                                                                        replaceServiceList
                                                                                                    )
                                                                                                }
                                                                                            }}
                                                                                        />
                                                                                        <h4
                                                                                            className={
                                                                                                styles.textAreaCount
                                                                                            }
                                                                                        >
                                                                                            {
                                                                                                getArrValue(
                                                                                                    val[0],
                                                                                                    4,
                                                                                                    'replace'
                                                                                                )
                                                                                                    .length
                                                                                            }
                                                                                            /100
                                                                                        </h4>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                            <div
                                                                                style={{
                                                                                    marginTop:
                                                                                        '10%',
                                                                                }}
                                                                            >
                                                                                <h4
                                                                                    style={{
                                                                                        marginBottom:
                                                                                            '3%',
                                                                                    }}
                                                                                    className={
                                                                                        styles.newLinkFormTitle
                                                                                    }
                                                                                >
                                                                                    color
                                                                                    palette
                                                                                </h4>
                                                                                <div
                                                                                    className={
                                                                                        styles.colorWrapper
                                                                                    }
                                                                                >
                                                                                    <div
                                                                                        style={{
                                                                                            backgroundColor: `#${getArrValue(
                                                                                                val[0],
                                                                                                2,
                                                                                                'replace'
                                                                                            )}`,
                                                                                        }}
                                                                                        className={
                                                                                            styles.colorBox
                                                                                        }
                                                                                        onClick={() =>
                                                                                            toggleColorPicker(
                                                                                                `${val[0]}1`
                                                                                            )
                                                                                        }
                                                                                    />
                                                                                    <h4
                                                                                        className={
                                                                                            styles.colorOptionText
                                                                                        }
                                                                                    >
                                                                                        Option
                                                                                        1
                                                                                    </h4>
                                                                                </div>
                                                                                {showColor ===
                                                                                    `${val[0]}1` && (
                                                                                    <div
                                                                                        style={{
                                                                                            marginBottom:
                                                                                                '3%',
                                                                                        }}
                                                                                    >
                                                                                        <SketchPicker
                                                                                            color={`#${getArrValue(
                                                                                                val[0],
                                                                                                2,
                                                                                                'replace'
                                                                                            )}`}
                                                                                            onChangeComplete={(
                                                                                                color
                                                                                            ) => {
                                                                                                const data: any =
                                                                                                    replaceServiceList.filter(
                                                                                                        (
                                                                                                            val_
                                                                                                        ) =>
                                                                                                            val_.id ===
                                                                                                            val[0]
                                                                                                    )[0]
                                                                                                const string =
                                                                                                    data?.value.split(
                                                                                                        '#'
                                                                                                    )[0] +
                                                                                                    '#' +
                                                                                                    data?.value.split(
                                                                                                        '#'
                                                                                                    )[1] +
                                                                                                    '#' +
                                                                                                    color.hex.replace(
                                                                                                        '#',
                                                                                                        ''
                                                                                                    ) +
                                                                                                    '#' +
                                                                                                    data?.value.split(
                                                                                                        '#'
                                                                                                    )[3] +
                                                                                                    '#' +
                                                                                                    data?.value.split(
                                                                                                        '#'
                                                                                                    )[4]
                                                                                                pushReplaceServiceList(
                                                                                                    val[0],
                                                                                                    string
                                                                                                )
                                                                                            }}
                                                                                        />
                                                                                    </div>
                                                                                )}
                                                                                <div
                                                                                    className={
                                                                                        styles.colorWrapper
                                                                                    }
                                                                                >
                                                                                    <div
                                                                                        style={{
                                                                                            backgroundColor: `#${getArrValue(
                                                                                                val[0],
                                                                                                3,
                                                                                                'replace'
                                                                                            )}`,
                                                                                        }}
                                                                                        className={
                                                                                            styles.colorBox
                                                                                        }
                                                                                        onClick={() =>
                                                                                            toggleColorPicker(
                                                                                                `${val[0]}2`
                                                                                            )
                                                                                        }
                                                                                    />
                                                                                    <h4
                                                                                        className={
                                                                                            styles.colorOptionText
                                                                                        }
                                                                                    >
                                                                                        Option
                                                                                        2
                                                                                    </h4>
                                                                                </div>
                                                                                {showColor ===
                                                                                    `${val[0]}2` && (
                                                                                    <div
                                                                                        style={{
                                                                                            marginBottom:
                                                                                                '3%',
                                                                                        }}
                                                                                    >
                                                                                        <SketchPicker
                                                                                            color={`#${getArrValue(
                                                                                                val[0],
                                                                                                3,
                                                                                                'replace'
                                                                                            )}`}
                                                                                            onChangeComplete={(
                                                                                                color
                                                                                            ) => {
                                                                                                const data: any =
                                                                                                    replaceServiceList.filter(
                                                                                                        (
                                                                                                            val_
                                                                                                        ) =>
                                                                                                            val_.id ===
                                                                                                            val[0]
                                                                                                    )[0]
                                                                                                const string =
                                                                                                    data?.value.split(
                                                                                                        '#'
                                                                                                    )[0] +
                                                                                                    '#' +
                                                                                                    data?.value.split(
                                                                                                        '#'
                                                                                                    )[1] +
                                                                                                    '#' +
                                                                                                    data?.value.split(
                                                                                                        '#'
                                                                                                    )[2] +
                                                                                                    '#' +
                                                                                                    color.hex.replace(
                                                                                                        '#',
                                                                                                        ''
                                                                                                    ) +
                                                                                                    '#' +
                                                                                                    data?.value.split(
                                                                                                        '#'
                                                                                                    )[4]
                                                                                                pushReplaceServiceList(
                                                                                                    val[0],
                                                                                                    string
                                                                                                )
                                                                                            }}
                                                                                        />
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </>
                                                            )
                                                        )}
                                                    </div>
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
                            {input === 0 && (
                                <button
                                    onClick={() => {
                                        setInput(1)
                                        pushAddServiceList(
                                            doc?.[1][1].length + 1,
                                            '####'
                                        )
                                    }}
                                    className="button secondary"
                                >
                                    <p className={styles.txtNewLink}>
                                        create new link
                                    </p>
                                </button>
                            )}
                            {/* <h3>New services</h3>
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
                            </p> */}
                            <div className={styles.newLinkWrapper}>
                                {input != 0 &&
                                    select_input.map((res: number, i) => {
                                        return (
                                            <>
                                                <div
                                                    key={res}
                                                    className={styles.newLink}
                                                >
                                                    <h4
                                                        style={{
                                                            fontSize: '20px',
                                                        }}
                                                    >
                                                        new link
                                                    </h4>
                                                    <div
                                                        className={
                                                            styles.newLinkBody
                                                        }
                                                    >
                                                        <div>
                                                            <div
                                                                style={{
                                                                    marginBottom:
                                                                        '5%',
                                                                }}
                                                            >
                                                                <h4
                                                                    className={
                                                                        styles.newLinkFormTitle
                                                                    }
                                                                >
                                                                    label
                                                                </h4>
                                                                <input
                                                                    className={
                                                                        styles.newLinkForm
                                                                    }
                                                                    placeholder="Type label"
                                                                    onChange={(
                                                                        event: React.ChangeEvent<HTMLInputElement>
                                                                    ) => {
                                                                        const id =
                                                                            doc?.[1][1]
                                                                                .length +
                                                                            i +
                                                                            1
                                                                        const value =
                                                                            event
                                                                                .target
                                                                                .value
                                                                        const data: any =
                                                                            addServiceList.filter(
                                                                                (
                                                                                    val_
                                                                                ) =>
                                                                                    val_.id ===
                                                                                    id
                                                                            )[0]
                                                                        const string =
                                                                            value +
                                                                            '#' +
                                                                            data?.value.split(
                                                                                '#'
                                                                            )[1] +
                                                                            '#' +
                                                                            data?.value.split(
                                                                                '#'
                                                                            )[2] +
                                                                            '#' +
                                                                            data?.value.split(
                                                                                '#'
                                                                            )[3] +
                                                                            '#' +
                                                                            data?.value.split(
                                                                                '#'
                                                                            )[4]
                                                                        pushAddServiceList(
                                                                            id,
                                                                            string
                                                                        )
                                                                    }}
                                                                />
                                                            </div>
                                                            <div
                                                                style={{
                                                                    marginBottom:
                                                                        '5%',
                                                                }}
                                                            >
                                                                <h4
                                                                    className={
                                                                        styles.newLinkFormTitle
                                                                    }
                                                                >
                                                                    url
                                                                </h4>
                                                                <input
                                                                    className={
                                                                        styles.newLinkForm
                                                                    }
                                                                    placeholder="http://"
                                                                    onChange={(
                                                                        event: React.ChangeEvent<HTMLInputElement>
                                                                    ) => {
                                                                        const id =
                                                                            doc?.[1][1]
                                                                                .length +
                                                                            i +
                                                                            1
                                                                        const value =
                                                                            event
                                                                                .target
                                                                                .value
                                                                        const data: any =
                                                                            addServiceList.filter(
                                                                                (
                                                                                    val_
                                                                                ) =>
                                                                                    val_.id ===
                                                                                    id
                                                                            )[0]
                                                                        const string =
                                                                            data?.value.split(
                                                                                '#'
                                                                            )[0] +
                                                                            '#' +
                                                                            value +
                                                                            '#' +
                                                                            data?.value.split(
                                                                                '#'
                                                                            )[2] +
                                                                            '#' +
                                                                            data?.value.split(
                                                                                '#'
                                                                            )[3] +
                                                                            '#' +
                                                                            data?.value.split(
                                                                                '#'
                                                                            )[4]
                                                                        pushAddServiceList(
                                                                            id,
                                                                            string
                                                                        )
                                                                        console.log(
                                                                            addServiceList
                                                                        )
                                                                    }}
                                                                />
                                                            </div>
                                                        </div>
                                                        <div
                                                            className={
                                                                styles.newLinkBodyLeft
                                                            }
                                                        >
                                                            <h4
                                                                className={
                                                                    styles.newLinkFormTitle
                                                                }
                                                            >
                                                                short
                                                                description
                                                            </h4>
                                                            <div
                                                                className={
                                                                    styles.newLinkTextArea
                                                                }
                                                            >
                                                                <textarea
                                                                    value={getArrValue(
                                                                        doc?.[1][1]
                                                                            .length +
                                                                            i +
                                                                            1,
                                                                        4,
                                                                        'add'
                                                                    )}
                                                                    onChange={(
                                                                        event
                                                                    ) => {
                                                                        const id =
                                                                            doc?.[1][1]
                                                                                .length +
                                                                            i +
                                                                            1
                                                                        const value =
                                                                            event
                                                                                .target
                                                                                .value
                                                                        const data: any =
                                                                            addServiceList.filter(
                                                                                (
                                                                                    val_
                                                                                ) =>
                                                                                    val_.id ===
                                                                                    id
                                                                            )[0]
                                                                        const string =
                                                                            data?.value.split(
                                                                                '#'
                                                                            )[0] +
                                                                            '#' +
                                                                            data?.value.split(
                                                                                '#'
                                                                            )[1] +
                                                                            '#' +
                                                                            data?.value.split(
                                                                                '#'
                                                                            )[2] +
                                                                            '#' +
                                                                            data?.value.split(
                                                                                '#'
                                                                            )[3] +
                                                                            '#' +
                                                                            value
                                                                        if (
                                                                            value.length >
                                                                            100
                                                                        ) {
                                                                            toast.error(
                                                                                'Max character is 100.',
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
                                                                                    draggable:
                                                                                        true,
                                                                                    progress:
                                                                                        undefined,
                                                                                    theme: 'dark',
                                                                                    toastId: 13,
                                                                                }
                                                                            )
                                                                        } else {
                                                                            pushAddServiceList(
                                                                                id,
                                                                                string
                                                                            )
                                                                        }
                                                                    }}
                                                                />
                                                                <h4
                                                                    className={
                                                                        styles.textAreaCount
                                                                    }
                                                                >
                                                                    {`${
                                                                        getArrValue(
                                                                            doc?.[1][1]
                                                                                .length +
                                                                                i +
                                                                                1,
                                                                            4,
                                                                            'add'
                                                                        ).length
                                                                    }`}
                                                                    /100
                                                                </h4>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div
                                                        style={{
                                                            marginTop: '5%',
                                                        }}
                                                    >
                                                        <h4
                                                            style={{
                                                                marginBottom:
                                                                    '3%',
                                                            }}
                                                            className={
                                                                styles.newLinkFormTitle
                                                            }
                                                        >
                                                            color palette
                                                        </h4>
                                                        <div
                                                            className={
                                                                styles.colorWrapper
                                                            }
                                                        >
                                                            <div
                                                                style={{
                                                                    backgroundColor: `#${getArrValue(
                                                                        doc?.[1][1]
                                                                            .length +
                                                                            i +
                                                                            1,
                                                                        2,
                                                                        'add'
                                                                    )}`,
                                                                }}
                                                                className={
                                                                    styles.colorBox
                                                                }
                                                                onClick={() =>
                                                                    toggleColorPicker(
                                                                        `new${
                                                                            doc?.[1][1]
                                                                                .length +
                                                                            i +
                                                                            1
                                                                        }1`
                                                                    )
                                                                }
                                                            />
                                                            <h4
                                                                className={
                                                                    styles.colorOptionText
                                                                }
                                                            >
                                                                Option 1
                                                            </h4>
                                                        </div>
                                                        {showColor ===
                                                            `new${
                                                                doc?.[1][1]
                                                                    .length +
                                                                i +
                                                                1
                                                            }1` && (
                                                            <div
                                                                style={{
                                                                    marginBottom:
                                                                        '3%',
                                                                }}
                                                            >
                                                                <SketchPicker
                                                                    color={`#${getArrValue(
                                                                        doc?.[1][1]
                                                                            .length +
                                                                            i +
                                                                            1,
                                                                        2,
                                                                        'add'
                                                                    )}`}
                                                                    onChangeComplete={(
                                                                        color
                                                                    ) => {
                                                                        const id =
                                                                            doc?.[1][1]
                                                                                .length +
                                                                            i +
                                                                            1
                                                                        const data: any =
                                                                            addServiceList.filter(
                                                                                (
                                                                                    val_
                                                                                ) =>
                                                                                    val_.id ===
                                                                                    id
                                                                            )[0]
                                                                        console.log(
                                                                            data
                                                                        )
                                                                        const string =
                                                                            data?.value.split(
                                                                                '#'
                                                                            )[0] +
                                                                            '#' +
                                                                            data?.value.split(
                                                                                '#'
                                                                            )[1] +
                                                                            '#' +
                                                                            color.hex.replace(
                                                                                '#',
                                                                                ''
                                                                            ) +
                                                                            '#' +
                                                                            data?.value.split(
                                                                                '#'
                                                                            )[3] +
                                                                            '#' +
                                                                            data?.value.split(
                                                                                '#'
                                                                            )[4]
                                                                        pushAddServiceList(
                                                                            id,
                                                                            string
                                                                        )
                                                                    }}
                                                                />
                                                            </div>
                                                        )}
                                                        <div
                                                            className={
                                                                styles.colorWrapper
                                                            }
                                                        >
                                                            <div
                                                                style={{
                                                                    backgroundColor: `#${getArrValue(
                                                                        doc?.[1][1]
                                                                            .length +
                                                                            i +
                                                                            1,
                                                                        3,
                                                                        'add'
                                                                    )}`,
                                                                }}
                                                                className={
                                                                    styles.colorBox
                                                                }
                                                                onClick={() =>
                                                                    toggleColorPicker(
                                                                        `new${
                                                                            doc?.[1][1]
                                                                                .length +
                                                                            i +
                                                                            1
                                                                        }2`
                                                                    )
                                                                }
                                                            />
                                                            <h4
                                                                className={
                                                                    styles.colorOptionText
                                                                }
                                                            >
                                                                Option 2
                                                            </h4>
                                                        </div>
                                                        {showColor ===
                                                            `new${
                                                                doc?.[1][1]
                                                                    .length +
                                                                i +
                                                                1
                                                            }2` && (
                                                            <div
                                                                style={{
                                                                    marginBottom:
                                                                        '3%',
                                                                }}
                                                            >
                                                                <SketchPicker
                                                                    color={`#${getArrValue(
                                                                        doc?.[1][1]
                                                                            .length +
                                                                            i +
                                                                            1,
                                                                        3,
                                                                        'add'
                                                                    )}`}
                                                                    onChangeComplete={(
                                                                        color
                                                                    ) => {
                                                                        const id =
                                                                            doc?.[1][1]
                                                                                .length +
                                                                            i +
                                                                            1
                                                                        const data: any =
                                                                            addServiceList.filter(
                                                                                (
                                                                                    val_
                                                                                ) =>
                                                                                    val_.id ===
                                                                                    id
                                                                            )[0]
                                                                        console.log(
                                                                            data
                                                                        )
                                                                        const string =
                                                                            data?.value.split(
                                                                                '#'
                                                                            )[0] +
                                                                            '#' +
                                                                            data?.value.split(
                                                                                '#'
                                                                            )[1] +
                                                                            '#' +
                                                                            data?.value.split(
                                                                                '#'
                                                                            )[2] +
                                                                            '#' +
                                                                            color.hex.replace(
                                                                                '#',
                                                                                ''
                                                                            ) +
                                                                            '#' +
                                                                            data?.value.split(
                                                                                '#'
                                                                            )[4]
                                                                        pushAddServiceList(
                                                                            id,
                                                                            string
                                                                        )
                                                                        console.log(
                                                                            addServiceList
                                                                        )
                                                                    }}
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div
                                                        className={
                                                            styles.newLinkFooter
                                                        }
                                                    >
                                                        <h4
                                                            onClick={() => {
                                                                setInput(
                                                                    input + 1
                                                                )
                                                                const id =
                                                                    addServiceList.length +
                                                                    doc?.[1][1]
                                                                        .length +
                                                                    1
                                                                pushAddServiceList(
                                                                    id,
                                                                    '####'
                                                                )
                                                            }}
                                                            className={
                                                                styles.newLinkFooterTxt
                                                            }
                                                        >
                                                            ADD MORE
                                                        </h4>
                                                        {addServiceList.length ===
                                                            i + 1 && (
                                                            <div
                                                                onClick={() => {
                                                                    setInput(
                                                                        input -
                                                                            1
                                                                    )
                                                                    const id =
                                                                        doc?.[1][1]
                                                                            .length +
                                                                        i +
                                                                        1
                                                                    removeAddServiceList(
                                                                        id
                                                                    )
                                                                    console.log(
                                                                        addServiceList
                                                                    )
                                                                }}
                                                                style={{
                                                                    cursor: 'pointer',
                                                                }}
                                                            >
                                                                <Image
                                                                    src={trash}
                                                                    alt="ico-delete"
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                {/* <p
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
                                                        console.log("ok", services)
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
                                            </p> */}
                                            </>
                                        )
                                    })}
                            </div>
                            <div className={styles.commonLinksWrapper}>
                                <div>COMMON LINKS</div>
                                <div
                                    className={styles.dropdownCheckListWrapper}
                                >
                                    <div
                                        onClick={() =>
                                            setShowCommonDropdown(
                                                !showCommonDropdown
                                            )
                                        }
                                        className={styles.dropdownCheckList}
                                    >
                                        Add new links
                                        <Image
                                            src={
                                                showCommonDropdown
                                                    ? arrowUp
                                                    : arrowDown
                                            }
                                            alt="arrow"
                                        />
                                    </div>
                                    {showCommonDropdown && (
                                        <div className={styles.wrapperOption}>
                                            {socialDropdown.map((val, i) => (
                                                <div
                                                    key={i}
                                                    className={styles.option}
                                                >
                                                    {checkIsExistCommon(val) ? (
                                                        <div
                                                            onClick={() =>
                                                                selectCommon(
                                                                    val
                                                                )
                                                            }
                                                            className={
                                                                styles.optionIco
                                                            }
                                                        >
                                                            <Image
                                                                src={
                                                                    selectedCheckmark
                                                                }
                                                                alt="arrow"
                                                            />
                                                        </div>
                                                    ) : (
                                                        <div
                                                            onClick={() =>
                                                                selectCommon(
                                                                    val
                                                                )
                                                            }
                                                            className={
                                                                styles.optionIco
                                                            }
                                                        >
                                                            <Image
                                                                src={
                                                                    defaultCheckmark
                                                                }
                                                                alt="arrow"
                                                            />
                                                        </div>
                                                    )}
                                                    <div>{val}</div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                            {selectedCommon.map((val, i) => {
                                let socialIcon
                                switch (val) {
                                    case 'Discord':
                                        socialIcon = discordIco
                                        break
                                    case 'Facebook':
                                        socialIcon = facebookIco
                                        break
                                    case 'Github':
                                        socialIcon = githubIco
                                        break
                                    case 'Instagram':
                                        socialIcon = instagramIco
                                        break
                                    case 'Twitter':
                                        socialIcon = twitterIco
                                        break
                                }
                                return (
                                    <>
                                        <div
                                            key={i}
                                            className={styles.commonService}
                                        >
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                }}
                                            >
                                                <Image
                                                    alt="social-ico"
                                                    src={socialIcon}
                                                />
                                                <div
                                                    className={
                                                        styles.commonServiceTxt
                                                    }
                                                >
                                                    {val}
                                                </div>
                                            </div>
                                            <div
                                                onClick={() =>
                                                    setCommonActive(
                                                        commonActive === val
                                                            ? ''
                                                            : val
                                                    )
                                                }
                                                style={{ cursor: 'pointer' }}
                                            >
                                                <Image
                                                    src={
                                                        commonActive === val
                                                            ? minusIco
                                                            : addIco
                                                    }
                                                    alt="add-ico"
                                                />
                                            </div>
                                        </div>
                                        {commonActive === val && (
                                            <div
                                                style={{
                                                    marginBottom: '18px',
                                                    marginTop: '0px',
                                                }}
                                                className={styles.replaceLink}
                                            >
                                                <div>
                                                    <div
                                                        style={{
                                                            marginBottom: '5%',
                                                        }}
                                                    >
                                                        <h4
                                                            style={{
                                                                textTransform:
                                                                    'lowercase',
                                                            }}
                                                            className={
                                                                styles.newLinkFormTitle
                                                            }
                                                        >
                                                            {val.toLowerCase()}
                                                            .com/
                                                        </h4>
                                                        <input
                                                            className={
                                                                styles.newLinkForm
                                                            }
                                                            placeholder="Type username"
                                                        />
                                                    </div>
                                                    <div>
                                                        <h4
                                                            className={
                                                                styles.newLinkFormTitle
                                                            }
                                                        >
                                                            short description
                                                        </h4>
                                                        <div
                                                            className={
                                                                styles.replaceLinkTextArea
                                                            }
                                                        >
                                                            <textarea />
                                                            <h4
                                                                className={
                                                                    styles.textAreaCount
                                                                }
                                                            >
                                                                0/100
                                                            </h4>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div
                                                    style={{
                                                        marginTop: '5%',
                                                    }}
                                                >
                                                    <h4
                                                        style={{
                                                            marginBottom: '3%',
                                                        }}
                                                        className={
                                                            styles.newLinkFormTitle
                                                        }
                                                    >
                                                        color palette
                                                    </h4>
                                                    <div
                                                        className={
                                                            styles.colorWrapper
                                                        }
                                                    >
                                                        <div
                                                            style={{
                                                                backgroundColor:
                                                                    color1,
                                                            }}
                                                            className={
                                                                styles.colorBox
                                                            }
                                                            onClick={() =>
                                                                setShowColor1(
                                                                    !showColor1
                                                                )
                                                            }
                                                        />
                                                        <h4
                                                            className={
                                                                styles.colorOptionText
                                                            }
                                                        >
                                                            Option 1
                                                        </h4>
                                                    </div>
                                                    {showColor1 && (
                                                        <div
                                                            style={{
                                                                marginBottom:
                                                                    '3%',
                                                            }}
                                                        >
                                                            <SketchPicker
                                                                color={color1}
                                                                onChangeComplete={(
                                                                    e
                                                                ) =>
                                                                    handleChangeCompleteOpt(
                                                                        e,
                                                                        1
                                                                    )
                                                                }
                                                            />
                                                        </div>
                                                    )}
                                                    <div
                                                        className={
                                                            styles.colorWrapper
                                                        }
                                                    >
                                                        <div
                                                            style={{
                                                                backgroundColor:
                                                                    color2,
                                                            }}
                                                            className={
                                                                styles.colorBox
                                                            }
                                                            onClick={() =>
                                                                setShowColor2(
                                                                    !showColor2
                                                                )
                                                            }
                                                        />
                                                        <h4
                                                            className={
                                                                styles.colorOptionText
                                                            }
                                                        >
                                                            Option 2
                                                        </h4>
                                                    </div>
                                                    {showColor2 && (
                                                        <div
                                                            style={{
                                                                marginBottom:
                                                                    '3%',
                                                            }}
                                                        >
                                                            <SketchPicker
                                                                color={color2}
                                                                onChangeComplete={(
                                                                    e
                                                                ) =>
                                                                    handleChangeCompleteOpt(
                                                                        e,
                                                                        2
                                                                    )
                                                                }
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )
                            })}
                        </section>
                    )}
                    <div style={{ marginTop: '10%', textAlign: 'center' }}>
                        <button
                            type="button"
                            className="button secondary"
                            onClick={handleServices}
                        >
                            <p>continue</p>
                        </button>
                    </div>
                </div>
            )}
            {next && (
                <>
                    <div className={styles.msgForm}>
                        <Image alt="ico-warning" src={warning} />
                        <h4 className={styles.msgFormTitle}>update key</h4>
                        <div style={{ marginTop: '24px' }}>
                            <h4 className={styles.msgFormAboutTo}>
                                about to update the following
                            </h4>
                            <h4 className={styles.msgFormTxtKey}>Update key</h4>
                        </div>
                        {addServiceList.length > 0 && (
                            <>
                                <h4
                                    style={{
                                        fontSize: '14px',
                                        marginTop: '48px',
                                    }}
                                >
                                    service ids to add
                                </h4>
                                {addServiceList.map((val, i) => (
                                    <div
                                        key={i}
                                        className={styles.msgFormService}
                                    >
                                        <div style={{ fontSize: '14px' }}>
                                            {val.value.split('#')[0]}
                                        </div>
                                        <div
                                            className={
                                                styles.msgFormTxtServiceUrl
                                            }
                                        >
                                            {val.value.split('#')[1]}
                                        </div>
                                    </div>
                                ))}
                            </>
                        )}
                        {replaceServiceList.length > 0 && (
                            <>
                                <h4
                                    style={{
                                        fontSize: '14px',
                                        marginTop: '48px',
                                    }}
                                >
                                    service ids to replace
                                </h4>
                                {replaceServiceList.map((val, i) => (
                                    <div
                                        key={i}
                                        className={styles.msgFormService}
                                    >
                                        <div style={{ fontSize: '14px' }}>
                                            {val.value.split('#')[0]}
                                        </div>
                                        <div
                                            className={
                                                styles.msgFormTxtServiceUrl
                                            }
                                        >
                                            {val.value.split('#')[1]}
                                        </div>
                                    </div>
                                ))}
                            </>
                        )}
                        {/* <h4 style={{ fontSize: '14px', marginTop: '48px' }}>
                            service ids to delete
                        </h4>
                        <div className={styles.msgFormService}>
                            <div style={{ fontSize: '14px' }}>TWITTER</div>
                            <div className={styles.msgFormTxtServiceUrl}>
                                https://twitter.com/tyroncoop
                            </div>
                        </div> */}
                        <div
                            onClick={() => setNext(false)}
                            className={styles.msgFormCancel}
                        >
                            CANCEL
                        </div>
                    </div>
                    {/* <div className={styles.docInfo}>
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
                    </div> */}
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
