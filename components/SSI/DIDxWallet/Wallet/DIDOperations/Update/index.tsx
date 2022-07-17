import React, { useState, useEffect } from 'react'
import * as tyron from 'tyron'
import Image from 'next/image'
import { toast } from 'react-toastify'
import { SketchPicker } from 'react-color'
import {
    CommonLinks,
    Selector,
    SocialCard,
    SubmitUpdateDoc,
    UpdateMessage,
} from '../../../../..'
import { useStore } from 'effector-react'
import { $doc } from '../../../../../../src/store/did-doc'
import styles from './styles.module.scss'
import trash from '../../../../../../src/assets/icons/trash.svg'
import trash_red from '../../../../../../src/assets/icons/trash_red.svg'
import retweet from '../../../../../../src/assets/icons/retweet.svg'
import retweetYellow from '../../../../../../src/assets/icons/retweet_yellow.svg'
import cross from '../../../../../../src/assets/icons/close_icon_white.svg'
import controller from '../../../../../../src/hooks/isController'
import { useTranslation } from 'next-i18next'

function Component() {
    const { t } = useTranslation()
    const doc = useStore($doc)?.doc
    const [docType, setDocType] = useState('')
    const [replaceKeyList, setReplaceKeyList] = useState(Array())
    const [replaceKeyList_, setReplaceKeyList_] = useState(['update'])
    const [addServiceList, setAddServiceList] = useState(Array())
    const [addServiceListId, setAddServiceListId] = useState(Array())
    const [replaceServiceList, setReplaceServiceList] = useState(Array())
    const [deleteServiceList, setDeleteServiceList] = useState(Array())
    const [deleteServiceVal, setDeleteServiceVal] = useState(Array())
    const [next, setNext] = useState(false)
    const [patches, setPatches] = useState(Array())
    const [showColor, setShowColor] = useState('')
    const [showCommonDropdown, setShowCommonDropdown] = useState(false)
    const [selectedCommon, setSelectedCommon] = useState(Array())
    const [totalAddService, setTotalAddService] = useState(Array())
    const [totalAddServiceId, setTotalAddServiceId] = useState(Array())
    const [commonActive, setCommonActive] = useState('')
    const [commonFacebook, setCommonFacebook] = useState('Facebook####')
    const [commonGithub, setCommonGithub] = useState('Github####')
    const [commonInstagram, setCommonInstagram] = useState('Instagram####')
    const [commonLinkedIn, setCommonLinkedIn] = useState('LinkedIn####')
    const [commonTwitter, setCommonTwitter] = useState('Twitter####')
    const [orderChanged, setOrderChanged] = useState(false)
    const [input, setInput] = useState(0)
    const docIdLength = Number(doc?.[1][1].at(-1)[0])
    const { isController } = controller()

    useEffect(() => {
        isController()
    })

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
        let newArr2 = addServiceListId.filter((val) => val !== id)
        newArr.push(obj)
        newArr2.push(id)
        setAddServiceList(newArr)
        setAddServiceListId(newArr2)
    }

    const pushReplaceServiceList = (id: string, service: string) => {
        const obj = {
            id: id,
            value: service,
        }
        let newArr = replaceServiceList.filter((val) => val.id !== id)
        newArr.push(obj)
        setReplaceServiceList(newArr)
        removeDeleteServiceList(id, service)
    }

    const pushDeleteServiceList = (id: any, val: string) => {
        setDeleteServiceList([...deleteServiceList, id])
        setDeleteServiceVal([...deleteServiceVal, val])
        removeReplaceServiceList(id)
    }

    const removeAddServiceList = (id: any) => {
        let newArr = addServiceList.filter((val) => val.id !== id)
        let newArr2 = addServiceListId.filter((val) => val !== id)
        setAddServiceList(newArr)
        setAddServiceListId(newArr2)
    }

    const removeReplaceServiceList = (id: any) => {
        let newArr = replaceServiceList.filter((val) => val.id !== id)
        setReplaceServiceList(newArr)
    }

    const removeDeleteServiceList = (id: any, val: string) => {
        let newArr = deleteServiceList.filter((val) => val !== id)
        let newArrVal = deleteServiceVal.filter((val_) => val_[0] !== val)
        setDeleteServiceList(newArr)
        setDeleteServiceVal(newArrVal)
        console.log(deleteServiceVal)
    }

    const handleOnChange = (value) => {
        setDocType(value)
    }

    const handleServices = async () => {
        doc?.map((val) => {
            if (val[0] === 'DID services') {
                val[1].map((val_) => {
                    if (
                        !replaceServiceList.some((val) => val.id === val_[0]) &&
                        !deleteServiceList.some((val) => val === val_[0])
                    ) {
                        totalAddService.push({
                            id: val_[0],
                            value:
                                val_[1][0].split('#')[0] +
                                '#' +
                                val_[1][1] +
                                '#' +
                                val_[1][0].split('#')[1] +
                                '#' +
                                val_[1][0].split('#')[2] +
                                '#' +
                                val_[1][0].split('#')[3],
                        })
                        totalAddServiceId.push(val_[0])
                    }
                })
            }
        })
        // Services to replace
        for (let i = 0; i < replaceServiceList.length; i += 1) {
            const this_service = replaceServiceList[i]
            if (
                this_service.id !== '' &&
                this_service.value !== '' &&
                this_service.value !== 'pending'
            ) {
                totalAddService.push({
                    id: this_service.id,
                    value: this_service.value,
                })
                totalAddServiceId.push(this_service.id)
            }
        }

        //New common service
        if (selectedCommon.length !== 0) {
            for (let i = 0; i < selectedCommon.length; i += 1) {
                let state
                let link
                const id = docIdLength + i + 1
                switch (selectedCommon[i]) {
                    case 'Facebook':
                        state = commonFacebook
                        link = 'https://facebook.com/'
                        break
                    case 'Github':
                        state = commonGithub
                        link = 'https://github.com/'
                        break
                    case 'Instagram':
                        state = commonInstagram
                        link = 'https://instagram.com/'
                        break
                    case 'LinkedIn':
                        state = commonLinkedIn
                        link = 'https://linkedin.com/in/'
                        break
                    case 'Twitter':
                        state = commonTwitter
                        link = 'https://twitter.com/'
                        break
                }
                if (state !== '####') {
                    totalAddService.push({
                        id: id,
                        value:
                            state.split('#')[0] +
                            '#' +
                            link +
                            state.split('#')[1] +
                            '#' +
                            state.split('#')[2] +
                            '#' +
                            state.split('#')[3] +
                            '#' +
                            state.split('#')[4],
                    })
                    totalAddServiceId.push(id)
                }
            }
        }

        //New links
        if (addServiceList.length > 0) {
            for (let i = 0; i < addServiceList.length; i += 1) {
                const id = docIdLength + selectedCommon.length + i + 1
                const val = addServiceList[i]
                totalAddService.push({
                    id: id,
                    value: val.value,
                })
                totalAddServiceId.push(id)
            }
        }

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

            const TotalAddServices_ = totalAddService.sort(
                (a, b) => a.id - b.id
            )
            const TotalAddServicesId_ = totalAddServiceId.sort((a, b) => a - b)
            setTotalAddService(TotalAddServices_)
            setTotalAddServiceId(TotalAddServicesId_)

            // Global services
            if (totalAddService.length !== 0) {
                for (let i = 0; i < totalAddService.length; i += 1) {
                    const this_service = totalAddService[i]
                    const splittedData = this_service.value.split('#')
                    if (
                        this_service.id !== '' &&
                        this_service.value !== '####'
                    ) {
                        add_services.push({
                            id: String(i),
                            endpoint:
                                tyron.DocumentModel.ServiceEndpoint
                                    .Web2Endpoint,
                            type:
                                splittedData[0] +
                                '#' +
                                splittedData[2] +
                                '#' +
                                splittedData[3] +
                                '#' +
                                splittedData[4],
                            transferProtocol:
                                tyron.DocumentModel.TransferProtocol.Https,
                            val: splittedData[1],
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

    const generateLinkString = (link: string, line: number) => {
        let link_ = link
            .replaceAll('https://', '')
            .replaceAll('www.', '')
            .split('/')[0]
        if (line === 2) {
            link_ = link
                .replaceAll('https://', '')
                .replaceAll('www.', '')
                .replace(`${link_}`, '')
                .replace('/', '')
        } else {
            link_ = link_ + '/'
        }
        return link_
    }

    const option = [
        {
            key: '',
            name: t('Select document element'),
        },
        {
            key: 'Key',
            name: t('KEYS'),
        },
        {
            key: 'Service',
            name: t('SOCIAL TREE'),
        },
    ]

    return (
        <>
            {!next && (
                <div>
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'center',
                            marginBottom: '25%',
                        }}
                    >
                        <div style={{ width: '100%' }}>
                            <Selector
                                option={option}
                                onChange={handleOnChange}
                                value={docType}
                            />
                        </div>
                    </div>
                    <section style={{ marginTop: '5%' }}>
                        {doc !== null &&
                            doc?.map((res: any) => {
                                if (res[0] !== 'Decentralized identifier') {
                                    return (
                                        <div
                                            style={{
                                                display: 'flex',
                                                justifyContent: 'center',
                                            }}
                                            key={res}
                                        >
                                            {res[0] !== 'DID services' &&
                                            docType === 'Key' ? (
                                                <>
                                                    <div
                                                        key={res}
                                                        className={
                                                            checkIsExist(
                                                                res[0],
                                                                1
                                                            )
                                                                ? styles.serviceKeyReplace
                                                                : checkIsExist(
                                                                      res[0],
                                                                      2
                                                                  )
                                                                ? styles.serviceKeyDelete
                                                                : styles.serviceKey
                                                        }
                                                    >
                                                        <div>
                                                            <h4
                                                                className={
                                                                    styles.serviceKeyTitle
                                                                }
                                                            >
                                                                {t(
                                                                    res[0].toUpperCase()
                                                                )}
                                                            </h4>
                                                            {res[1].map(
                                                                (
                                                                    element: any
                                                                ) => {
                                                                    return (
                                                                        <h4
                                                                            key={
                                                                                element
                                                                            }
                                                                            className={
                                                                                styles.serviceKeyLink
                                                                            }
                                                                        >
                                                                            {element.slice(
                                                                                0,
                                                                                17
                                                                            )}
                                                                            ...
                                                                        </h4>
                                                                    )
                                                                }
                                                            )}
                                                        </div>
                                                        <div
                                                            className={
                                                                styles.serviceIcoWrapper
                                                            }
                                                        >
                                                            {!checkIsExist(
                                                                res[0],
                                                                3
                                                            ) ? (
                                                                <div
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
                                                            ) : (
                                                                <div
                                                                    onClick={() =>
                                                                        removeReplaceKeyList(
                                                                            res[0]
                                                                        )
                                                                    }
                                                                >
                                                                    <Image
                                                                        src={
                                                                            retweetYellow
                                                                        }
                                                                        alt="ico-replace"
                                                                    />
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </>
                                            ) : res[0] === 'DID services' &&
                                              docType === 'Service' ? (
                                                <div>
                                                    <h4
                                                        className={
                                                            styles.existingLabelTitle
                                                        }
                                                    >
                                                        {t('EXISTING LABELS')}
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
                                                                            checkIsExist(
                                                                                val[0],
                                                                                1
                                                                            )
                                                                                ? styles.serviceKeyReplace
                                                                                : checkIsExist(
                                                                                      val[0],
                                                                                      2
                                                                                  )
                                                                                ? styles.serviceKeyDelete
                                                                                : styles.serviceKey
                                                                        }
                                                                    >
                                                                        <div>
                                                                            <h4
                                                                                className={
                                                                                    styles.serviceKeyTitle
                                                                                }
                                                                            >
                                                                                {
                                                                                    val[1][0].split(
                                                                                        '#'
                                                                                    )[0]
                                                                                }
                                                                            </h4>
                                                                            <h4
                                                                                className={
                                                                                    styles.serviceKeyLink
                                                                                }
                                                                            >
                                                                                {generateLinkString(
                                                                                    val[1][1],
                                                                                    1
                                                                                )}
                                                                            </h4>
                                                                            <h4
                                                                                style={{
                                                                                    marginTop:
                                                                                        '-15px',
                                                                                }}
                                                                                className={
                                                                                    styles.serviceKeyLink
                                                                                }
                                                                            >
                                                                                {generateLinkString(
                                                                                    val[1][1],
                                                                                    2
                                                                                )}
                                                                            </h4>
                                                                        </div>
                                                                        {!checkIsExist(
                                                                            val[0],
                                                                            1
                                                                        ) && (
                                                                            <div
                                                                                className={
                                                                                    styles.serviceIcoWrapper
                                                                                }
                                                                            >
                                                                                {!checkIsExist(
                                                                                    val[0],
                                                                                    2
                                                                                ) ? (
                                                                                    <div
                                                                                        onClick={() =>
                                                                                            pushReplaceServiceList(
                                                                                                val[0],
                                                                                                `${
                                                                                                    val[1][0].split(
                                                                                                        '#'
                                                                                                    )[0]
                                                                                                }####`
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
                                                                                ) : (
                                                                                    <div
                                                                                        style={{
                                                                                            marginBottom:
                                                                                                '35px',
                                                                                        }}
                                                                                    />
                                                                                )}
                                                                                {checkIsExist(
                                                                                    val[0],
                                                                                    2
                                                                                ) ? (
                                                                                    <div
                                                                                        style={{
                                                                                            marginTop:
                                                                                                '13px',
                                                                                        }}
                                                                                        onClick={() =>
                                                                                            removeDeleteServiceList(
                                                                                                val[0],
                                                                                                val[1][0]
                                                                                            )
                                                                                        }
                                                                                        className={
                                                                                            styles.deleteIcoWrapperActive
                                                                                        }
                                                                                    >
                                                                                        <div
                                                                                            style={{
                                                                                                marginTop:
                                                                                                    '-12px',
                                                                                            }}
                                                                                        >
                                                                                            <Image
                                                                                                src={
                                                                                                    trash_red
                                                                                                }
                                                                                                alt="ico-delete"
                                                                                            />
                                                                                        </div>
                                                                                    </div>
                                                                                ) : (
                                                                                    <div
                                                                                        style={{
                                                                                            marginTop:
                                                                                                '13px',
                                                                                        }}
                                                                                        onClick={() =>
                                                                                            pushDeleteServiceList(
                                                                                                val[0],
                                                                                                val[1]
                                                                                            )
                                                                                        }
                                                                                        className={
                                                                                            styles.deleteIcoWrapper
                                                                                        }
                                                                                    >
                                                                                        <div
                                                                                            style={{
                                                                                                marginTop:
                                                                                                    '-12px',
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
                                                                                )}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                    {checkIsExist(
                                                                        val[0],
                                                                        1
                                                                    ) && (
                                                                        <div
                                                                            className={
                                                                                styles.wrapperRenderCard
                                                                            }
                                                                        >
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
                                                                                        {t(
                                                                                            'REPLACE LINK'
                                                                                        )}
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
                                                                                            {t(
                                                                                                'URL'
                                                                                            )}
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
                                                                                            {t(
                                                                                                'SHORT DESCRIPTION'
                                                                                            )}
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
                                                                                                        60
                                                                                                    ) {
                                                                                                        toast.error(
                                                                                                            'Max amount of characters is 60.',
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
                                                                                                /60
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
                                                                                    <div
                                                                                        style={{
                                                                                            display:
                                                                                                'flex',
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
                                                                                            {t(
                                                                                                'COLOR PALETTE'
                                                                                            )}
                                                                                        </h4>
                                                                                        <div
                                                                                            style={{
                                                                                                display:
                                                                                                    'flex',
                                                                                                marginLeft:
                                                                                                    '10px',
                                                                                            }}
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
                                                                                        </div>
                                                                                    </div>
                                                                                    {showColor ===
                                                                                        `${val[0]}1` && (
                                                                                        <div
                                                                                            style={{
                                                                                                marginBottom:
                                                                                                    '3%',
                                                                                            }}
                                                                                        >
                                                                                            <div
                                                                                                onClick={() =>
                                                                                                    setShowColor(
                                                                                                        ''
                                                                                                    )
                                                                                                }
                                                                                                className={
                                                                                                    styles.closeWrapper
                                                                                                }
                                                                                            />
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
                                                                                    {showColor ===
                                                                                        `${val[0]}2` && (
                                                                                        <div
                                                                                            style={{
                                                                                                marginBottom:
                                                                                                    '3%',
                                                                                            }}
                                                                                        >
                                                                                            <div
                                                                                                onClick={() =>
                                                                                                    setShowColor(
                                                                                                        ''
                                                                                                    )
                                                                                                }
                                                                                                className={
                                                                                                    styles.closeWrapper
                                                                                                }
                                                                                            />
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
                                                                            <SocialCard
                                                                                label={getArrValue(
                                                                                    val[0],
                                                                                    0,
                                                                                    'replace'
                                                                                )}
                                                                                link={getArrValue(
                                                                                    val[0],
                                                                                    1,
                                                                                    'replace'
                                                                                )}
                                                                                color1={getArrValue(
                                                                                    val[0],
                                                                                    2,
                                                                                    'replace'
                                                                                )}
                                                                                color2={getArrValue(
                                                                                    val[0],
                                                                                    3,
                                                                                    'replace'
                                                                                )}
                                                                                description={getArrValue(
                                                                                    val[0],
                                                                                    4,
                                                                                    'replace'
                                                                                )}
                                                                            />
                                                                        </div>
                                                                    )}
                                                                </>
                                                            )
                                                        )}
                                                    </div>
                                                </div>
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
                            <CommonLinks
                                checkIsExistCommon={checkIsExistCommon}
                                selectCommon={selectCommon}
                                selectedCommon={selectedCommon}
                                commonFacebook={commonFacebook}
                                setCommonFacebook={setCommonFacebook}
                                commonGithub={commonGithub}
                                setCommonGithub={setCommonGithub}
                                commonInstagram={commonInstagram}
                                setCommonInstagram={setCommonInstagram}
                                commonLinkedIn={commonLinkedIn}
                                setCommonLinkedIn={setCommonLinkedIn}
                                commonTwitter={commonTwitter}
                                setCommonTwitter={setCommonTwitter}
                                showColor={showColor}
                                setShowColor={setShowColor}
                                toggleColorPicker={toggleColorPicker}
                                commonActive={commonActive}
                                setCommonActive={setCommonActive}
                                showCommonDropdown={showCommonDropdown}
                                setShowCommonDropdown={setShowCommonDropdown}
                            />
                            {input === 0 && (
                                <button
                                    onClick={() => {
                                        setInput(1)
                                        pushAddServiceList(
                                            docIdLength +
                                                selectedCommon.length +
                                                1,
                                            '####'
                                        )
                                    }}
                                    style={{ marginTop: '15%' }}
                                    className="button secondary"
                                >
                                    <p className={styles.txtNewLink}>
                                        {t('CREATE NEW LINK')}
                                    </p>
                                </button>
                            )}
                            <div className={styles.newLinkWrapper}>
                                {input != 0 &&
                                    addServiceListId.map((res: any, i) => {
                                        const id = res
                                        return (
                                            <div
                                                className={
                                                    styles.wrapperRenderCardLg
                                                }
                                                key={id}
                                            >
                                                <div className={styles.newLink}>
                                                    <h4
                                                        style={{
                                                            fontSize: '20px',
                                                        }}
                                                    >
                                                        {t('NEW LINK')}
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
                                                                    {t('LABEL')}
                                                                </h4>
                                                                <input
                                                                    className={
                                                                        styles.newLinkForm
                                                                    }
                                                                    placeholder="Type label"
                                                                    onChange={(
                                                                        event: React.ChangeEvent<HTMLInputElement>
                                                                    ) => {
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
                                                                    {t('URL')}
                                                                </h4>
                                                                <input
                                                                    className={
                                                                        styles.newLinkForm
                                                                    }
                                                                    placeholder="http://"
                                                                    onChange={(
                                                                        event: React.ChangeEvent<HTMLInputElement>
                                                                    ) => {
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
                                                                {t(
                                                                    'SHORT DESCRIPTION'
                                                                )}
                                                            </h4>
                                                            <div
                                                                className={
                                                                    styles.newLinkTextArea
                                                                }
                                                            >
                                                                <textarea
                                                                    value={getArrValue(
                                                                        id,
                                                                        4,
                                                                        'add'
                                                                    )}
                                                                    onChange={(
                                                                        event
                                                                    ) => {
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
                                                                            60
                                                                        ) {
                                                                            toast.error(
                                                                                'Max amount of characters is 60.',
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
                                                                            id,
                                                                            4,
                                                                            'add'
                                                                        ).length
                                                                    }`}
                                                                    /60
                                                                </h4>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div
                                                        style={{
                                                            marginTop: '5%',
                                                        }}
                                                    >
                                                        <div
                                                            style={{
                                                                display: 'flex',
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
                                                                {t(
                                                                    'COLOR PALETTE'
                                                                )}
                                                            </h4>
                                                            <div
                                                                style={{
                                                                    display:
                                                                        'flex',
                                                                    marginLeft:
                                                                        '10px',
                                                                }}
                                                            >
                                                                <div
                                                                    style={{
                                                                        backgroundColor: `#${getArrValue(
                                                                            id,
                                                                            2,
                                                                            'add'
                                                                        )}`,
                                                                    }}
                                                                    className={
                                                                        styles.colorBox
                                                                    }
                                                                    onClick={() =>
                                                                        toggleColorPicker(
                                                                            `new${id}1`
                                                                        )
                                                                    }
                                                                />
                                                                <div
                                                                    style={{
                                                                        backgroundColor: `#${getArrValue(
                                                                            id,
                                                                            3,
                                                                            'add'
                                                                        )}`,
                                                                    }}
                                                                    className={
                                                                        styles.colorBox
                                                                    }
                                                                    onClick={() =>
                                                                        toggleColorPicker(
                                                                            `new${id}2`
                                                                        )
                                                                    }
                                                                />
                                                            </div>
                                                        </div>
                                                        {showColor ===
                                                            `new${id}1` && (
                                                            <div
                                                                style={{
                                                                    marginBottom:
                                                                        '3%',
                                                                }}
                                                            >
                                                                <div
                                                                    onClick={() =>
                                                                        setShowColor(
                                                                            ''
                                                                        )
                                                                    }
                                                                    className={
                                                                        styles.closeWrapper
                                                                    }
                                                                />
                                                                <SketchPicker
                                                                    color={`#${getArrValue(
                                                                        id,
                                                                        2,
                                                                        'add'
                                                                    )}`}
                                                                    onChangeComplete={(
                                                                        color
                                                                    ) => {
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
                                                        {showColor ===
                                                            `new${id}2` && (
                                                            <div
                                                                style={{
                                                                    marginBottom:
                                                                        '3%',
                                                                }}
                                                            >
                                                                <div
                                                                    onClick={() =>
                                                                        setShowColor(
                                                                            ''
                                                                        )
                                                                    }
                                                                    className={
                                                                        styles.closeWrapper
                                                                    }
                                                                />
                                                                <SketchPicker
                                                                    color={`#${getArrValue(
                                                                        id,
                                                                        3,
                                                                        'add'
                                                                    )}`}
                                                                    onChangeComplete={(
                                                                        color
                                                                    ) => {
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
                                                                const id_ =
                                                                    id + 1
                                                                pushAddServiceList(
                                                                    id_,
                                                                    '####'
                                                                )
                                                            }}
                                                            className={
                                                                styles.newLinkFooterTxt
                                                            }
                                                        >
                                                            {t('ADD MORE')}
                                                        </h4>
                                                        <div
                                                            onClick={() => {
                                                                setInput(
                                                                    input - 1
                                                                )
                                                                removeAddServiceList(
                                                                    id
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
                                                    </div>
                                                </div>
                                                <div
                                                    className={
                                                        styles.flipCardLg
                                                    }
                                                >
                                                    <SocialCard
                                                        label={getArrValue(
                                                            id,
                                                            0,
                                                            'add'
                                                        )}
                                                        link={getArrValue(
                                                            id,
                                                            1,
                                                            'add'
                                                        )}
                                                        color1={getArrValue(
                                                            id,
                                                            2,
                                                            'add'
                                                        )}
                                                        color2={getArrValue(
                                                            id,
                                                            3,
                                                            'add'
                                                        )}
                                                        description={getArrValue(
                                                            id,
                                                            4,
                                                            'add'
                                                        )}
                                                    />
                                                </div>
                                            </div>
                                        )
                                    })}
                            </div>
                        </section>
                    )}
                    {addServiceList.length > 0 ||
                    replaceServiceList.length > 0 ||
                    deleteServiceList.length > 0 ||
                    selectedCommon.length > 0 ||
                    replaceKeyList.length ? (
                        <div style={{ marginTop: '10%', textAlign: 'center' }}>
                            <button
                                type="button"
                                className="button secondary"
                                onClick={handleServices}
                            >
                                <p>{t('CONTINUE')}</p>
                            </button>
                        </div>
                    ) : (
                        <></>
                    )}
                </div>
            )}
            {next && (
                <>
                    <UpdateMessage
                        totalAddService={totalAddService}
                        replaceServiceList={replaceServiceList}
                        replaceKeyList={replaceKeyList}
                        addServiceList={addServiceList}
                        selectedCommon={selectedCommon}
                        deleteServiceVal={deleteServiceVal}
                        generateLinkString={generateLinkString}
                        orderChanged={orderChanged}
                        setNext={setNext}
                        setOrderChanged={setOrderChanged}
                        setTotalAddService={setTotalAddService}
                        totalAddServiceId={totalAddServiceId}
                        setTotalAddServiceId={setTotalAddServiceId}
                        setPatches={setPatches}
                        patches={patches}
                        deleteServiceList={deleteServiceList}
                    />
                    {!orderChanged && (
                        <SubmitUpdateDoc
                            {...{
                                ids: replaceKeyList_,
                                patches: patches,
                            }}
                        />
                    )}
                </>
            )}
        </>
    )
}

export default Component
