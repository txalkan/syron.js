import React, { useState, useEffect } from 'react'
import * as tyron from 'tyron'
import Image from 'next/image'
import { toast } from 'react-toastify'
import { SketchPicker } from 'react-color'
import { SortableElement, SortableContainer } from 'react-sortable-hoc'
import { CommonLinks, SubmitUpdateDoc } from '../../../../..'
import { useStore } from 'effector-react'
import { arrayMoveImmutable } from 'array-move'
import { $doc } from '../../../../../../src/store/did-doc'
import styles from './styles.module.scss'
import trash from '../../../../../../src/assets/icons/trash.svg'
import trash_red from '../../../../../../src/assets/icons/trash_red.svg'
import retweet from '../../../../../../src/assets/icons/retweet.svg'
import retweetYellow from '../../../../../../src/assets/icons/retweet_yellow.svg'
import cross from '../../../../../../src/assets/icons/close_icon_white.svg'
import warning from '../../../../../../src/assets/icons/warning_triangle.svg'
import orderIco from '../../../../../../src/assets/icons/order_icon.svg'
import controller from '../../../../../../src/hooks/isController'

function Component() {
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
        let newArrVal = deleteServiceVal.filter((val) => val !== val)
        setDeleteServiceList(newArr)
        setDeleteServiceVal(newArrVal)
    }

    const handleOnChange = (event: { target: { value: any } }) => {
        setDocType(event.target.value)
    }

    const handleServices = async () => {
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
                const id = docIdLength + addServiceList.length + i + 1
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
            addServiceList.map((val) => {
                totalAddService.push({
                    id: val.id,
                    value: val.value,
                })
                totalAddServiceId.push(val.id)
            })
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
                            id: String(this_service.id),
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

    const ToDoItem = ({ val }) => {
        return (
            <div key={val} className={styles.msgFormService}>
                <div style={{ marginRight: '3%' }}>
                    <Image src={orderIco} alt="order-ico" />
                </div>
                <div>
                    <div style={{ fontSize: '14px' }}>
                        {val.value.split('#')[0]}
                    </div>
                    <div className={styles.msgFormTxtServiceUrl}>
                        {generateLinkString(val.value.split('#')[1], 1)}
                    </div>
                    <div className={styles.msgFormTxtServiceUrl}>
                        {generateLinkString(val.value.split('#')[1], 2)}
                    </div>
                </div>
            </div>
        )
    }

    const ToDoList = ({ items }) => {
        return (
            <div>
                {items.map((x, i) => (
                    <SortableItem val={x} index={i} key={x.id} />
                ))}
            </div>
        )
    }

    const onSortEnd = (e) => {
        console.log('ok', totalAddService)
        setPatches([])
        setOrderChanged(true)
        var newArr = arrayMoveImmutable(totalAddService, e.oldIndex, e.newIndex)
        setTotalAddService(newArr)
    }

    const SortableItem = SortableElement(ToDoItem)
    const SortableList = SortableContainer(ToDoList)

    const saveOrder = () => {
        try {
            const patches_: tyron.DocumentModel.PatchModel[] = []
            if (deleteServiceList.length !== 0) {
                patches_.push({
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

            // New services
            if (totalAddService.length !== 0) {
                for (let i = 0; i < totalAddService.length; i += 1) {
                    const this_service = totalAddService[i]
                    const splittedData = this_service.value.split('#')
                    if (
                        this_service.id !== '' &&
                        this_service.value !== '####'
                    ) {
                        add_services.push({
                            id: String(totalAddServiceId[i]),
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
                setOrderChanged(false)
            }
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
        console.log('maseh', patches)
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
                                                                {res[0]}
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
                                                                                                    60
                                                                                                ) {
                                                                                                    toast.error(
                                                                                                        'Max character is 60.',
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
                                            docIdLength + 1,
                                            '####'
                                        )
                                        console.log(addServiceList)
                                    }}
                                    style={{ marginTop: '15%' }}
                                    className="button secondary"
                                >
                                    <p className={styles.txtNewLink}>
                                        create new link
                                    </p>
                                </button>
                            )}
                            <div className={styles.newLinkWrapper}>
                                {input != 0 &&
                                    addServiceListId.map((res: any, i) => {
                                        const id = res
                                        return (
                                            <>
                                                <div
                                                    key={id}
                                                    className={styles.newLink}
                                                >
                                                    <h4
                                                        style={{
                                                            fontSize: '20px',
                                                        }}
                                                    >
                                                        NEW LINK
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
                                                                        console.log(
                                                                            id
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
                                                                                'Max character is 60.',
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
                                                            <h4
                                                                className={
                                                                    styles.colorOptionText
                                                                }
                                                            >
                                                                Option 1
                                                            </h4>
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
                                                        <div
                                                            className={
                                                                styles.colorWrapper
                                                            }
                                                        >
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
                                                            <h4
                                                                className={
                                                                    styles.colorOptionText
                                                                }
                                                            >
                                                                Option 2
                                                            </h4>
                                                        </div>
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
                                                                console.log(
                                                                    addServiceList
                                                                )
                                                            }}
                                                            className={
                                                                styles.newLinkFooterTxt
                                                            }
                                                        >
                                                            ADD MORE
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
                                            </>
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
                                <p>continue</p>
                            </button>
                        </div>
                    ) : (
                        <></>
                    )}
                </div>
            )}
            {next && (
                <>
                    <div className={styles.msgForm}>
                        <Image alt="ico-warning" src={warning} />
                        <h4 className={styles.msgFormTitle}>update key</h4>
                        <div style={{ marginTop: '24px' }}>
                            <h4 className={styles.msgFormAboutTo}>
                                {totalAddService.length === 0 &&
                                replaceServiceList.length === 0
                                    ? 'about to update the following keys'
                                    : 'about to update the following'}
                            </h4>
                            {replaceKeyList.map((val, i) => {
                                if (val !== 'update key') {
                                    return (
                                        <h4
                                            key={i}
                                            className={styles.msgFormTxtKey}
                                        >
                                            {val}
                                        </h4>
                                    )
                                }
                            })}
                        </div>
                        {addServiceList.length > 0 ||
                        selectedCommon.length > 0 ||
                        replaceServiceList.length > 0 ? (
                            <>
                                <div
                                    style={{
                                        fontSize: '14px',
                                        textAlign: 'center',
                                    }}
                                >
                                    Use the{' '}
                                    <span style={{ fontSize: '20px' }}>
                                        &#8942;
                                    </span>{' '}
                                    icon to reorder the links before submitting
                                    transaction
                                </div>
                                <SortableList
                                    items={totalAddService}
                                    onSortEnd={onSortEnd}
                                />
                            </>
                        ) : (
                            <></>
                        )}
                        {deleteServiceVal.length > 0 && (
                            <>
                                <h4
                                    style={{
                                        fontSize: '14px',
                                        marginTop: '48px',
                                    }}
                                >
                                    service ids to delete
                                </h4>
                                {deleteServiceVal.map((val, i) => (
                                    <div
                                        key={i}
                                        className={styles.msgFormService}
                                    >
                                        <div>
                                            <div style={{ fontSize: '14px' }}>
                                                {val[0].split('#')[0]}
                                            </div>
                                            <div
                                                className={
                                                    styles.msgFormTxtServiceUrl
                                                }
                                            >
                                                {generateLinkString(val[1], 1)}
                                            </div>
                                            <div
                                                className={
                                                    styles.msgFormTxtServiceUrl
                                                }
                                            >
                                                {generateLinkString(val[1], 2)}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </>
                        )}
                        {/* need this button to save the state */}
                        {orderChanged && (
                            <button
                                style={{ marginTop: '5%' }}
                                onClick={saveOrder}
                                className="button small secondary"
                            >
                                <span>Save order</span>
                            </button>
                        )}
                        <div
                            onClick={() => {
                                setNext(false)
                                setOrderChanged(false)
                                setTotalAddService([])
                                setTotalAddServiceId([])
                            }}
                            className={styles.msgFormCancel}
                        >
                            CANCEL
                        </div>
                    </div>
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
