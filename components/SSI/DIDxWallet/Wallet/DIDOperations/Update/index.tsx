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
import stylesDark from './styles.module.scss'
import stylesLight from './styleslight.module.scss'
import l_trash from '../../../../../../src/assets/icons/trash.svg'
import d_trash from '../../../../../../src/assets/icons/trash_dark.svg'
import trash_red from '../../../../../../src/assets/icons/trash_red.svg'
import l_retweet from '../../../../../../src/assets/icons/retweet.svg'
import d_retweet from '../../../../../../src/assets/icons/retweet_dark.svg'
import retweetYellow from '../../../../../../src/assets/icons/retweet_yellow.svg'
import l_cross from '../../../../../../src/assets/icons/close_icon_white.svg'
import d_cross from '../../../../../../src/assets/icons/close_icon_black.svg'
import invertIco from '../../../../../../src/assets/icons/invert.svg'
import InfoYellow from '../../../../../../src/assets/icons/warning.svg'
import InfoDefaultReg from '../../../../../../src/assets/icons/info_default.svg'
import InfoDefaultBlack from '../../../../../../src/assets/icons/info_default_black.svg'
import controller from '../../../../../../src/hooks/isController'
import { useTranslation } from 'next-i18next'
import { useSelector } from 'react-redux'
import { RootState } from '../../../../../../src/app/reducers'
import toastTheme from '../../../../../../src/hooks/toastTheme'

function Component() {
    const { t } = useTranslation()
    const isLight = useSelector((state: RootState) => state.modal.isLight)
    const styles = isLight ? stylesLight : stylesDark
    const retweet = isLight ? d_retweet : l_retweet
    const trash = isLight ? d_trash : l_trash
    const cross = isLight ? d_cross : l_cross
    const InfoDefault = isLight ? InfoDefaultBlack : InfoDefaultReg
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
    const [orderChanged, setOrderChanged] = useState(false)
    const [input, setInput] = useState(0)
    const [renderCommon, setRenderCommon] = useState(true)
    const docIdLength =
        doc?.[1] === undefined ? 0 : Number(doc?.[1][1]?.at(-1)[0])
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
                setReplaceKeyList_([
                    ...replaceKeyList_,
                    id_.replace(' key', '').replace('-', ''),
                ])
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
            default:
                {
                    newArr_ = replaceKeyList_.filter(
                        (val) => val !== id.replace(' key', '').replace('-', '')
                    )
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

    const rmvDuplicateUrl = (link: string) => {
        return link
            .replaceAll('discord.com/invite/', '')
            .replaceAll('discord.gg/', '')
            .replaceAll('facebook.com/', '')
            .replaceAll('github.com/', '')
            .replaceAll('instagram.com/', '')
            .replaceAll('linkedin.com/in/', '')
            .replaceAll('onlyfans.com/', '')
            .replaceAll('t.me/', '')
            .replaceAll('tiktok.com/@', '')
            .replaceAll('twitch.tv/', '')
            .replaceAll('twitter.com/', '')
            .replaceAll('wa.me/', '')
            .replaceAll('youtube.com/', '')
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
            const state = this_service.value
            let link
            switch (state.split('#')[0]) {
                case 'Discord Invite':
                    link =
                        'https://discord.com/invite/' +
                        rmvDuplicateUrl(state.split('#')[1])
                    break
                case 'Facebook':
                    link =
                        'https://facebook.com/' +
                        rmvDuplicateUrl(state.split('#')[1])
                    break
                case 'GitHub':
                    link =
                        'https://github.com/' +
                        rmvDuplicateUrl(state.split('#')[1])
                    break
                case 'Instagram':
                    link =
                        'https://instagram.com/' +
                        rmvDuplicateUrl(state.split('#')[1])
                    break
                case 'LinkedIn':
                    link =
                        'https://linkedin.com/' +
                        rmvDuplicateUrl(state.split('#')[1])
                    break
                case 'OnlyFans':
                    link =
                        'https://onlyfans.com/' +
                        rmvDuplicateUrl(state.split('#')[1])
                    break
                case 'Telegram':
                    link =
                        'https://t.me/' + rmvDuplicateUrl(state.split('#')[1])
                    break
                case 'TikTok':
                    link =
                        'https://tiktok.com/@' +
                        rmvDuplicateUrl(state.split('#')[1])
                    break
                case 'Twitch':
                    link =
                        'https://twitch.tv/' +
                        rmvDuplicateUrl(state.split('#')[1])
                    break
                case 'Twitter':
                    link =
                        'https://twitter.com/' +
                        rmvDuplicateUrl(state.split('#')[1])
                    break
                case 'WhatsApp':
                    link =
                        'https://wa.me/' + rmvDuplicateUrl(state.split('#')[1])
                    break
                case 'YouTube':
                    link =
                        'https://youtube.com/' +
                        rmvDuplicateUrl(state.split('#')[1])
                    break
                default:
                    link = state.split('#')[1]
            }
            if (
                this_service.id !== '' &&
                this_service.value !== '' &&
                this_service.value !== 'pending'
            ) {
                totalAddService.push({
                    id: this_service.id,
                    value:
                        state.split('#')[0] +
                        '#' +
                        link +
                        '#' +
                        state.split('#')[2] +
                        '#' +
                        state.split('#')[3] +
                        '#' +
                        state.split('#')[4],
                })
                totalAddServiceId.push(this_service.id)
            }
        }

        //New common service
        if (selectedCommon.length !== 0) {
            for (let i = 0; i < selectedCommon.length; i += 1) {
                const state = selectedCommon[i].val
                let link
                const id = docIdLength + i + 1
                switch (selectedCommon[i].name) {
                    case 'Discord Invite':
                        link = 'https://discord.com/invite/'
                        break
                    case 'Facebook':
                        link = 'https://facebook.com/'
                        break
                    case 'GitHub':
                        link = 'https://github.com/'
                        break
                    case 'Instagram':
                        link = 'https://instagram.com/'
                        break
                    case 'LinkedIn':
                        link = 'https://linkedin.com/'
                        break
                    case 'OnlyFans':
                        link = 'https://onlyfans.com/'
                        break
                    case 'Telegram':
                        link = 'https://t.me/'
                        break
                    case 'TikTok':
                        link = 'https://tiktok.com/@'
                        break
                    case 'Twitch':
                        link = 'https://twitch.tv/'
                        break
                    case 'Twitter':
                        link = 'https://twitter.com/'
                        break
                    case 'WhatsApp':
                        link = 'https://wa.me/'
                        break
                    case 'YouTube':
                        link = 'https://youtube.com/'
                        break
                }
                if (state !== '####') {
                    totalAddService.push({
                        id: id,
                        value:
                            state.split('#')[0] +
                            '#' +
                            link +
                            rmvDuplicateUrl(state.split('#')[1]) +
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
                        const oldData = doc?.[1]?.[1]?.[i]?.[1]?.[0]
                        const typeData =
                            splittedData[0] +
                            '#' +
                            splittedData[2] +
                            '#' +
                            splittedData[3] +
                            '#' +
                            splittedData[4]
                        if (typeData !== oldData) {
                            add_services.push({
                                id: String(i),
                                endpoint:
                                    tyron.DocumentModel.ServiceEndpoint
                                        .Web2Endpoint,
                                type: typeData,
                                transferProtocol:
                                    tyron.DocumentModel.TransferProtocol.Https,
                                val: splittedData[1],
                            })
                        }
                    }
                }
            }
            if (add_services.length !== 0) {
                patches.push({
                    action: tyron.DocumentModel.PatchAction.AddServices,
                    services: add_services,
                })
            }

            if (deleteServiceList.length !== 0) {
                const addLength = addServiceList.length + selectedCommon.length
                let diffArr: any = []
                if (addLength < deleteServiceList.length) {
                    const diff = deleteServiceList.length - addLength
                    for (let i = 0; i < diff; i += 1) {
                        const id = i + totalAddService.length
                        diffArr.push(String(id))
                    }
                }
                patches.push({
                    action: tyron.DocumentModel.PatchAction.RemoveServices,
                    ids: deleteServiceList.concat(diffArr),
                })
            }

            setPatches(patches)
            setNext(true)
        } catch (error) {
            console.log(error)
            toast.error(String(error), {
                position: 'top-right',
                autoClose: 6000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: toastTheme(isLight),
            })
        }
    }

    const selectCommon = (val) => {
        if (!checkIsExistCommon(val.id)) {
            const res = {
                id: Math.random()
                    .toString(36)
                    .replace(/[^a-z]+/g, '')
                    .substr(2, 10),
                name: val.name,
                val: val.val,
            }
            let arr = selectedCommon
            arr.push(res)
            setSelectedCommon(arr)
        } else {
            let arr = selectedCommon.filter((arr) => arr.id !== val.id)
            setSelectedCommon(arr)
        }
        setRenderCommon(false)
        setTimeout(() => {
            setRenderCommon(true)
        }, 1)
    }

    const editCommon = (id, val) => {
        let arr = selectedCommon
        const objIndex = arr.findIndex((obj) => obj.id == id)
        arr[objIndex].val = val
        setSelectedCommon(arr)
    }

    const checkIsExistCommon = (id) => {
        if (selectedCommon.some((arr) => arr.id === id)) {
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

    const invertColor = (id, type) => {
        let data_
        let push
        if (type === 'add') {
            data_ = addServiceList
            push = pushAddServiceList
        } else {
            data_ = replaceServiceList
            push = pushReplaceServiceList
        }
        const data: any = data_.filter((val_) => val_.id === id)[0]

        const string =
            data?.value.split('#')[0] +
            '#' +
            data?.value.split('#')[1] +
            '#' +
            getArrValue(id, 3, type) +
            '#' +
            getArrValue(id, 2, type) +
            '#' +
            data?.value.split('#')[4]
        push(id, string)
    }

    const checkIsCommonLink = (id: string) => {
        if (
            socialDropdown.some(
                (arr) => arr.name.toLowerCase() === id.toLowerCase()
            )
        ) {
            return true
        } else {
            return false
        }
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

    const socialDropdown = [
        {
            name: 'Discord Invite',
            val: 'Discord Invite##000#000#',
        },
        {
            name: 'Facebook',
            val: 'Facebook##000#000#',
        },
        {
            name: 'GitHub',
            val: 'GitHub##000#000#',
        },
        {
            name: 'Instagram',
            val: 'Instagram##000#000#',
        },
        {
            name: 'LinkedIn',
            val: 'LinkedIn##000#000#',
        },
        {
            name: 'OnlyFans',
            val: 'OnlyFans##000#000#',
        },
        {
            name: 'Telegram',
            val: 'Telegram##000#000#',
        },
        {
            name: 'TikTok',
            val: 'TikTok##000#000#',
        },
        {
            name: 'Twitch',
            val: 'Twitch##000#000#',
        },
        {
            name: 'Twitter',
            val: 'Twitter##000#000#',
        },
        {
            name: 'WhatsApp',
            val: 'WhatsApp##000#000#',
        },
        {
            name: 'YouTube',
            val: 'YouTube##000#000#',
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
                                                                : styles.serviceKey2
                                                        }
                                                    >
                                                        <div>
                                                            <h4
                                                                className={
                                                                    styles.serviceKeyTitle
                                                                }
                                                                style={{
                                                                    textTransform:
                                                                        'none',
                                                                }}
                                                            >
                                                                {t(res[0])}
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
                                                                            default:
                                                                                pushReplaceKeyList(
                                                                                    res[0],
                                                                                    res[0]
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
                                                            ) => {
                                                                let baseUrl
                                                                let placeholder
                                                                let whatsapp =
                                                                    false
                                                                let linkedin =
                                                                    false
                                                                switch (
                                                                    val[1][0]
                                                                        .split(
                                                                            '#'
                                                                        )[0]
                                                                        .toLowerCase()
                                                                ) {
                                                                    case 'discord invite':
                                                                        baseUrl =
                                                                            'discord.com/invite/'
                                                                        placeholder =
                                                                            'Type invite URL'
                                                                        break
                                                                    case 'facebook':
                                                                        baseUrl =
                                                                            'facebook.com/'
                                                                        placeholder =
                                                                            'Type username'
                                                                        break
                                                                    case 'gitHub':
                                                                        baseUrl =
                                                                            'github.com/'
                                                                        placeholder =
                                                                            'Type username'
                                                                        break
                                                                    case 'instagram':
                                                                        baseUrl =
                                                                            'instagram.com/'
                                                                        placeholder =
                                                                            'Type username'
                                                                        break
                                                                    case 'linkedin':
                                                                        baseUrl = `linkedin.com/${
                                                                            generateLinkString(
                                                                                val[1][1],
                                                                                2
                                                                            ).includes(
                                                                                'company/'
                                                                            )
                                                                                ? 'company/'
                                                                                : 'in/'
                                                                        }`
                                                                        placeholder =
                                                                            'Type username'
                                                                        linkedin =
                                                                            true
                                                                        break
                                                                    case 'onlyfans':
                                                                        baseUrl =
                                                                            'onlyfans.com/'
                                                                        placeholder =
                                                                            'Type username'
                                                                        break
                                                                    case 'telegram':
                                                                        baseUrl =
                                                                            't.me/'
                                                                        placeholder =
                                                                            'Type username'
                                                                        break
                                                                    case 'tiktok':
                                                                        baseUrl =
                                                                            'tiktok.com/@'
                                                                        placeholder =
                                                                            'Type username'
                                                                        break
                                                                    case 'twitch':
                                                                        baseUrl =
                                                                            'twitch.tv/'
                                                                        placeholder =
                                                                            'Type username'
                                                                        break
                                                                    case 'twitter':
                                                                        baseUrl =
                                                                            'twitter.com/'
                                                                        placeholder =
                                                                            'Type username'
                                                                        break
                                                                    case 'whatsapp':
                                                                        baseUrl =
                                                                            'wa.me/'
                                                                        placeholder =
                                                                            'Type phone number'
                                                                        whatsapp =
                                                                            true
                                                                        break
                                                                    case 'youtube':
                                                                        baseUrl =
                                                                            'youtube.com/'
                                                                        placeholder =
                                                                            'Type URL'
                                                                        break
                                                                    default:
                                                                        baseUrl =
                                                                            'URL'
                                                                        placeholder =
                                                                            'Type new service value'
                                                                }
                                                                return (
                                                                    <>
                                                                        <div
                                                                            key={
                                                                                i
                                                                            }
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
                                                                                                {
                                                                                                    baseUrl
                                                                                                }
                                                                                                {whatsapp && (
                                                                                                    <span
                                                                                                        className={
                                                                                                            styles.tooltip
                                                                                                        }
                                                                                                    >
                                                                                                        <div
                                                                                                            className={
                                                                                                                styles.ico
                                                                                                            }
                                                                                                        >
                                                                                                            <div
                                                                                                                className={
                                                                                                                    styles.icoDefault
                                                                                                                }
                                                                                                            >
                                                                                                                <Image
                                                                                                                    alt="info-ico"
                                                                                                                    src={
                                                                                                                        InfoDefault
                                                                                                                    }
                                                                                                                    width={
                                                                                                                        20
                                                                                                                    }
                                                                                                                    height={
                                                                                                                        20
                                                                                                                    }
                                                                                                                />
                                                                                                            </div>
                                                                                                            <div
                                                                                                                className={
                                                                                                                    styles.icoColor
                                                                                                                }
                                                                                                            >
                                                                                                                <Image
                                                                                                                    alt="info-ico"
                                                                                                                    src={
                                                                                                                        InfoYellow
                                                                                                                    }
                                                                                                                    width={
                                                                                                                        20
                                                                                                                    }
                                                                                                                    height={
                                                                                                                        20
                                                                                                                    }
                                                                                                                />
                                                                                                            </div>
                                                                                                        </div>
                                                                                                        <span
                                                                                                            className={
                                                                                                                styles.tooltiptext
                                                                                                            }
                                                                                                        >
                                                                                                            <div
                                                                                                                style={{
                                                                                                                    fontSize:
                                                                                                                        '14px',
                                                                                                                }}
                                                                                                            >
                                                                                                                With
                                                                                                                the
                                                                                                                country
                                                                                                                code.
                                                                                                            </div>
                                                                                                        </span>
                                                                                                    </span>
                                                                                                )}
                                                                                            </h4>
                                                                                            <input
                                                                                                className={
                                                                                                    styles.newLinkForm
                                                                                                }
                                                                                                placeholder={
                                                                                                    placeholder
                                                                                                }
                                                                                                onChange={(
                                                                                                    event: React.ChangeEvent<HTMLInputElement>
                                                                                                ) => {
                                                                                                    const value =
                                                                                                        event
                                                                                                            .target
                                                                                                            .value
                                                                                                    if (
                                                                                                        whatsapp &&
                                                                                                        isNaN(
                                                                                                            Number(
                                                                                                                value
                                                                                                            )
                                                                                                        )
                                                                                                    ) {
                                                                                                        toast.error(
                                                                                                            t(
                                                                                                                'The input is not a number.'
                                                                                                            ),
                                                                                                            {
                                                                                                                position:
                                                                                                                    'top-right',
                                                                                                                autoClose: 2000,
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
                                                                                                                theme: toastTheme(
                                                                                                                    isLight
                                                                                                                ),
                                                                                                                toastId: 1,
                                                                                                            }
                                                                                                        )
                                                                                                    } else {
                                                                                                        let value_ =
                                                                                                            value
                                                                                                        if (
                                                                                                            linkedin
                                                                                                        ) {
                                                                                                            value_ =
                                                                                                                `${
                                                                                                                    generateLinkString(
                                                                                                                        val[1][1],
                                                                                                                        2
                                                                                                                    ).includes(
                                                                                                                        'company/'
                                                                                                                    )
                                                                                                                        ? 'company/'
                                                                                                                        : 'in/'
                                                                                                                }` +
                                                                                                                value
                                                                                                        }
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
                                                                                                            value_ +
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
                                                                                                    }
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
                                                                                                    className={
                                                                                                        styles.textarea
                                                                                                    }
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
                                                                                                                    theme: toastTheme(
                                                                                                                        isLight
                                                                                                                    ),
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
                                                                                    {!checkIsCommonLink(
                                                                                        getArrValue(
                                                                                            val[0],
                                                                                            0,
                                                                                            'replace'
                                                                                        )
                                                                                    ) && (
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
                                                                                                        marginRight:
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
                                                                                                    onClick={() =>
                                                                                                        invertColor(
                                                                                                            val[0],
                                                                                                            'replace'
                                                                                                        )
                                                                                                    }
                                                                                                    className={
                                                                                                        styles.invertIco
                                                                                                    }
                                                                                                >
                                                                                                    <Image
                                                                                                        height={
                                                                                                            20
                                                                                                        }
                                                                                                        width={
                                                                                                            20
                                                                                                        }
                                                                                                        src={
                                                                                                            invertIco
                                                                                                        }
                                                                                                        alt="invert-ico"
                                                                                                    />
                                                                                                </div>
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
                                                                                                    <div
                                                                                                        className={
                                                                                                            styles.pickerColor
                                                                                                        }
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
                                                                                                    <div
                                                                                                        className={
                                                                                                            styles.pickerColor
                                                                                                        }
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
                                                                                                </div>
                                                                                            )}
                                                                                        </div>
                                                                                    )}
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
                                                                                    isCommon={checkIsCommonLink(
                                                                                        getArrValue(
                                                                                            val[0],
                                                                                            0,
                                                                                            'replace'
                                                                                        )
                                                                                    )}
                                                                                />
                                                                            </div>
                                                                        )}
                                                                    </>
                                                                )
                                                            }
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
                                selectCommon={selectCommon}
                                selectedCommon={selectedCommon}
                                renderCommon={renderCommon}
                                commonActive={commonActive}
                                setCommonActive={setCommonActive}
                                showCommonDropdown={showCommonDropdown}
                                setShowCommonDropdown={setShowCommonDropdown}
                                editCommon={editCommon}
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
                                                        className={styles.txt}
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
                                                                    placeholder={t(
                                                                        'Type label'
                                                                    )}
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
                                                                    className={
                                                                        styles.textarea
                                                                    }
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
                                                                                    theme: toastTheme(
                                                                                        isLight
                                                                                    ),
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
                                                            marginTop: '2%',
                                                        }}
                                                    >
                                                        <div
                                                            style={{
                                                                display: 'flex',
                                                            }}
                                                        >
                                                            <h4
                                                                style={{
                                                                    marginRight:
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
                                                                onClick={() =>
                                                                    invertColor(
                                                                        id,
                                                                        'add'
                                                                    )
                                                                }
                                                                className={
                                                                    styles.invertIco
                                                                }
                                                            >
                                                                <Image
                                                                    height={20}
                                                                    width={20}
                                                                    src={
                                                                        invertIco
                                                                    }
                                                                    alt="invert-ico"
                                                                />
                                                            </div>
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
                                                                <div
                                                                    className={
                                                                        styles.pickerColor
                                                                    }
                                                                >
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
                                                                <div
                                                                    className={
                                                                        styles.pickerColor
                                                                    }
                                                                >
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
                                                        isCommon={false}
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
