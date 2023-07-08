import React, { useState, useCallback } from 'react'
import * as tyron from 'tyron'
import { useDispatch, useSelector } from 'react-redux'
import { useRouter } from 'next/router'
import { toast } from 'react-toastify'
import stylesDark from './styles.module.scss'
import stylesLight from './styleslight.module.scss'
import { useStore } from 'effector-react'
import { updateDonation } from '../../../src/store/donation'
import { $loading, updateLoading } from '../../../src/store/loading'
import { updateModalBuyNft, updateModalNewSsi } from '../../../src/store/modal'
import { useTranslation } from 'next-i18next'
import { RootState } from '../../../src/app/reducers'
import { Spinner } from '../..'
import { updateResolvedInfo } from '../../../src/store/resolvedInfo'
import toastTheme from '../../../src/hooks/toastTheme'
import { isValidUsername } from '../../../src/constants/mintDomainName'
import { $net } from '../../../src/store/network'

function Component() {
    const { t } = useTranslation()
    const Router = useRouter()
    const net = $net.state.net as 'mainnet' | 'testnet'

    const isLight = useSelector((state: RootState) => state.modal.isLight)
    const styles = isLight ? stylesLight : stylesDark
    const loading = useStore($loading)

    const [domain_, setDomain] = useState('')
    const [avail, setAvail] = useState(true)

    const spinner = <Spinner />

    const handleOnChange = ({
        currentTarget: { value },
    }: React.ChangeEvent<HTMLInputElement>) => {
        Router.push('/')
        updateDonation(null)
        const input = value.toLowerCase().replace(/ /g, '')
        setDomain(input)
    }

    const handleOnKeyPress = ({
        key,
    }: React.KeyboardEvent<HTMLInputElement>) => {
        if (key === 'Enter') {
            save()
        }
    }

    const save = async () => {
        if (isValidUsername(domain_)) {
            resolveDid(domain_)
        } else {
            toast.warn(t('Invalid username'), {
                position: 'top-right',
                autoClose: 6000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: toastTheme(isLight),
                toastId: 1,
            })
        }
    }

    const resolveDid = async (this_domain: string) => {
        setAvail(true)
        updateLoading(true)
        await tyron.SearchBarUtil.default
            .fetchAddr(net, '', this_domain)
            .then(async () => {
                setAvail(false)
                updateLoading(false)
            })
            .catch(() => {
                updateLoading(false)
                updateModalNewSsi(false)
                updateResolvedInfo({
                    user_tld: 'ssi',
                    user_domain: this_domain,
                    user_subdomain: '',
                })
                updateModalBuyNft(true)
                toast.warning(
                    t('For your security, make sure you’re at tyron.network'),
                    {
                        position: 'top-center',
                        autoClose: 3000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                        theme: toastTheme(isLight),
                        toastId: 3,
                    }
                )
            })
    }

    return (
        <div className={styles.container}>
            <div className={styles.searchDiv}>
                <label className={styles.txt} htmlFor="">
                    {t('CHOOSE YOUR NFT USERNAME')}
                </label>
                <div className={styles.searchWrapper}>
                    <input
                        type="text"
                        className={styles.searchBar}
                        onChange={handleOnChange}
                        onKeyPress={handleOnKeyPress}
                        value={domain_}
                        placeholder={domain_}
                    />
                    <div>
                        <button
                            onClick={() => save()}
                            className={styles.searchBtn}
                        >
                            {loading ? (
                                spinner
                            ) : (
                                <i className="fa fa-search"></i>
                            )}
                        </button>
                    </div>
                </div>
                {!avail && (
                    <h6 style={{ marginTop: '2%', color: 'red' }}>
                        NFT Domain Name not available
                    </h6>
                )}
            </div>
        </div>
    )
}

export default Component
