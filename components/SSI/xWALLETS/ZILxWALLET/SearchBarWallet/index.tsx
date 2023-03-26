import React from 'react'
import Image from 'next/image'
import stylesDark from './styles.module.scss'
import stylesLight from './styleslight.module.scss'
import { useTranslation } from 'next-i18next'
import TickIcoYellow from '../../../../../src/assets/icons/tick.svg'
import TickIcoBlue from '../../../../../src/assets/icons/tick_blue.svg'
import TickIcoPurple from '../../../../../src/assets/icons/tick_purple.svg'
import { Arrow, Spinner } from '../../../..'
import { useSelector } from 'react-redux'
import { RootState } from '../../../../../src/app/reducers'
import isZil from '../../../../../src/hooks/isZil'
import { useStore } from 'effector-react'
import { $resolvedInfo } from '../../../../../src/store/resolvedInfo'

interface Props {
    resolveUsername: any
    handleInput: any
    input: any
    loading: boolean
    saved: boolean
    bottomTick?: boolean
}

function Component(props: Props) {
    const { resolveUsername, handleInput, input, loading, saved, bottomTick } =
        props
    const resolvedInfo = useStore($resolvedInfo)
    const isZil_ = isZil(resolvedInfo?.version)
    const { t } = useTranslation()
    const isLight = useSelector((state: RootState) => state.modal.isLight)
    const TickIco = isZil_
        ? TickIcoBlue
        : isLight
        ? TickIcoPurple
        : TickIcoYellow
    const styles = isLight ? stylesLight : stylesDark

    const spinner = <Spinner />

    const handleContinue = async () => {
        resolveUsername()
    }
    const handleOnKeyPress = ({
        key,
    }: React.KeyboardEvent<HTMLInputElement>) => {
        if (key === 'Enter') {
            handleContinue()
        }
    }

    return (
        <div
            style={{ width: '100%' }}
            className={bottomTick ? styles.container3 : styles.container2}
        >
            <div style={{ display: 'flex', width: '100%' }}>
                <input
                    type="text"
                    className={styles.input}
                    onChange={handleInput}
                    onKeyPress={handleOnKeyPress}
                    placeholder={t('TYPE_DOMAIN')}
                    value={input}
                />
            </div>
            <div className={styles.arrowWrapper}>
                <div
                    className={saved || loading ? 'continueBtnSaved' : ''}
                    onClick={() => {
                        if (!saved) {
                            handleContinue()
                        }
                    }}
                >
                    {loading ? (
                        spinner
                    ) : (
                        <>
                            {saved ? (
                                <Image
                                    width={35}
                                    height={35}
                                    src={TickIco}
                                    alt="arrow"
                                />
                            ) : (
                                <Arrow isBlue={isZil_} width={35} height={35} />
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Component
