import Image from 'next/image'
import { toast } from 'react-toastify'
import * as tyron from 'tyron'
import {
    DndContext,
    closestCenter,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core'
import {
    arrayMove,
    SortableContext,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import stylesDark from './styles.module.scss'
import stylesLight from './styleslight.module.scss'
import warning from '../../../../../../src/assets/icons/warning_triangle.svg'
import orderIco from '../../../../../../src/assets/icons/order_icon.svg'
import { useTranslation } from 'next-i18next'
import toastTheme from '../../../../../../src/hooks/toastTheme'
import { useSelector } from 'react-redux'
import { RootState } from '../../../../../../src/app/reducers'
import { useStore } from 'effector-react'
import { $doc } from '../../../../../../src/store/did-doc'

function Component({
    totalAddService,
    replaceServiceList,
    replaceKeyList,
    addServiceList,
    selectedCommon,
    deleteServiceVal,
    generateLinkString,
    orderChanged,
    setNext,
    setOrderChanged,
    setTotalAddService,
    totalAddServiceId,
    setTotalAddServiceId,
    setPatches,
    patches,
    deleteServiceList,
}) {
    const { t } = useTranslation()
    const isLight = useSelector((state: RootState) => state.modal.isLight)
    const styles = isLight ? stylesLight : stylesDark
    const replaceKeyList_ = replaceKeyList.filter((val) => val !== 'update key')
    const doc = useStore($doc)?.doc

    function SortableItem({ id, val }) {
        const { attributes, listeners, setNodeRef, transform, transition } =
            useSortable({ id })

        const style = {
            transform: CSS.Transform.toString(transform),
            transition,
            cursor: 'grab',
        }

        return (
            <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
                <div className={styles.msgFormService}>
                    <div style={{ marginRight: '3%' }}>
                        <Image src={orderIco} alt="order-ico" />
                    </div>
                    <div>
                        <div className={styles.txt}>
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
            </div>
        )
    }

    const sensors = useSensors(useSensor(PointerSensor))

    const handleDragEnd = (event) => {
        const { active, over } = event
        if (active.id !== over?.id) {
            const oldIndex = totalAddService.findIndex(
                (x) => x.id === active.id
            )
            const newIndex = totalAddService.findIndex((x) => x.id === over?.id)
            const newArr = arrayMove(totalAddService, oldIndex, newIndex)
            setPatches([])
            setOrderChanged(true)
            setTotalAddService(newArr)
        }
    }

    const SortableList = ({ items }) => {
        return (
            <SortableContext
                items={items.map((x) => x.id)}
                strategy={verticalListSortingStrategy}
            >
                {items.map((x) => (
                    <SortableItem key={x.id} id={x.id} val={x} />
                ))}
            </SortableContext>
        )
    }

    const saveOrder = () => {
        try {
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

            // New services
            if (totalAddService.length !== 0) {
                for (let i = 0; i < totalAddService.length; i += 1) {
                    const this_service = totalAddService[i]
                    const splittedData = this_service.value.split('#')
                    if (
                        this_service.id !== '' &&
                        this_service.value !== '####'
                    ) {
                        let oldData = null
                        if (
                            doc?.[1][1][1] !== undefined &&
                            i + 1 <= doc?.[1][1].length
                        ) {
                            oldData = doc?.[1][1]?.[i][1][0]
                        }
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
                    console.log('okok')
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
            toast.warn(String(error), {
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

    return (
        <div className={styles.msgForm}>
            <Image alt="ico-warning" src={warning} />
            <h4 className={styles.msgFormTitle}>{t('UPDATE KEY')}</h4>
            <div style={{ marginTop: '24px' }}>
                {replaceKeyList_.length > 0 && (
                    <h4 className={styles.msgFormAboutTo}>
                        {replaceKeyList_.length > 1
                            ? `${t('UPDATE KEY')}s`
                            : t('UPDATE KEY')}
                    </h4>
                )}
                {replaceKeyList_.map((val, i) => (
                    <h4 key={i} className={styles.msgFormTxtKey}>
                        {val}
                    </h4>
                ))}
            </div>
            {addServiceList.length > 0 ||
            selectedCommon.length > 0 ||
            replaceServiceList.length > 0 ? (
                <>
                    <div className={styles.intstructionTxt}>
                        {t('Use the')}&nbsp;&#8942;&nbsp;
                        {t(
                            'icon to reorder the links before submitting the transaction.'
                        )}
                    </div>
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableList items={totalAddService} />
                    </DndContext>
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
                        {t('LINKS TO DELETE')}
                    </h4>
                    {deleteServiceVal.map((val, i) => (
                        <div key={i} className={styles.msgFormService}>
                            <div>
                                <div className={styles.txt}>
                                    {val[0].split('#')[0]}
                                </div>
                                <div className={styles.msgFormTxtServiceUrl}>
                                    {generateLinkString(val[1], 1)}
                                </div>
                                <div className={styles.msgFormTxtServiceUrl}>
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
                    <span>{t('SAVE ORDER')}</span>
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
                {t('CANCEL')}
            </div>
        </div>
    )
}

export default Component
