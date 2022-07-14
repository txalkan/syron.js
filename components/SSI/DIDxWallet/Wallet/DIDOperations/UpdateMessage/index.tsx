import Image from 'next/image'
import { toast } from 'react-toastify'
import * as tyron from 'tyron'
import { SortableElement, SortableContainer } from 'react-sortable-hoc'
import { arrayMoveImmutable } from 'array-move'
import styles from './styles.module.scss'
import warning from '../../../../../../src/assets/icons/warning_triangle.svg'
import orderIco from '../../../../../../src/assets/icons/order_icon.svg'
import { useTranslation } from 'next-i18next'

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
    const replaceKeyList_ = replaceKeyList.filter((val) => val !== 'update key')

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
        setPatches([])
        setOrderChanged(true)
        var newArr = arrayMoveImmutable(totalAddService, e.oldIndex, e.newIndex)
        setTotalAddService(newArr)
    }

    const SortableItem = SortableElement(ToDoItem)
    const SortableList = SortableContainer(ToDoList)

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
                    <div
                        style={{
                            fontSize: '14px',
                            textAlign: 'center',
                        }}
                    >
                        {t(
                            'Use the : icon to reorder the links before submitting the transaction'
                        )}
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
                        {t('LINKS TO DELETE')}
                    </h4>
                    {deleteServiceVal.map((val, i) => (
                        <div key={i} className={styles.msgFormService}>
                            <div>
                                <div style={{ fontSize: '14px' }}>
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
