import React, { useState, useCallback } from 'react'
import * as tyron from 'tyron'
import { useDispatch } from 'react-redux'
import { useRouter } from 'next/router'
import { toast } from 'react-toastify'
import styles from './styles.module.scss'
import { updateUser } from '../../../src/store/user'
import { useStore } from 'effector-react'
import { updateDonation } from '../../../src/store/donation'
import { $loading, updateLoading } from '../../../src/store/loading'
import { $net } from '../../../src/store/wallet-network'
import { updateModalBuyNft, updateModalNewSsi } from '../../../src/store/modal'
import { UpdateResolvedInfo } from '../../../src/app/actions'
import { useTranslation } from 'next-i18next'

function Component() {
    const { t } = useTranslation()
    const Router = useRouter()
    const dispatch = useDispatch()
    const net = useStore($net)
    const loading = useStore($loading)

    const callbackRef = useCallback((inputElement) => {
        if (inputElement) {
            inputElement.focus()
        }
    }, [])

    const [search, setSearch] = useState('')
    const [name, setName] = useState('')
    const [domain, setDomain] = useState('')
    const [avail, setAvail] = useState(true)

    const spinner = (
        <i
            style={{ color: '#ffff32' }}
            className="fa fa-lg fa-spin fa-circle-notch"
            aria-hidden="true"
        ></i>
    )

    const handleOnChange = ({
        currentTarget: { value },
    }: React.ChangeEvent<HTMLInputElement>) => {
        Router.push('/')
        updateDonation(null)
        dispatch(UpdateResolvedInfo(null))

        const input = value.toLowerCase().replace(/ /g, '')
        setSearch(input)
        setName(input)
        setDomain('did')
        if (input.includes('.')) {
            const [username = '', domain = ''] = input.split('.')
            setDomain(domain)
            setName(username)
        }
    }

    const handleOnKeyPress = ({
        key,
    }: React.KeyboardEvent<HTMLInputElement>) => {
        if (key === 'Enter') {
            resolveDid(name)
        }
    }

    const resolveDid = async (_username: string) => {
        setAvail(true)
        if (domain !== 'did') {
            toast.warning('It has to be .did', {
                position: 'top-left',
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: 'dark',
                toastId: 3,
            })
        } else {
            if (tyron.SearchBarUtil.default.isValidUsername(_username)) {
                setSearch(`${_username}.did`)
                updateLoading(true)
                await tyron.SearchBarUtil.default
                    .fetchAddr(net, _username, 'did')
                    .then(async () => {
                        setAvail(false)
                        updateLoading(false)
                    })
                    .catch(() => {
                        updateLoading(false)
                        updateUser({
                            name: _username,
                            domain: 'did',
                        })
                        updateModalNewSsi(false)
                        updateModalBuyNft(true)
                        toast.warning(
                            t(
                                'For your security, make sure you’re at tyron.network'
                            ),
                            {
                                position: 'top-center',
                                autoClose: 3000,
                                hideProgressBar: false,
                                closeOnClick: true,
                                pauseOnHover: true,
                                draggable: true,
                                progress: undefined,
                                theme: 'dark',
                                toastId: 3,
                            }
                        )
                    })
            } else {
                toast.error(
                    t(
                        'Invalid username. Names with less than six characters are premium and will be for sale later on.'
                    ),
                    {
                        position: 'top-right',
                        autoClose: 6000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                        theme: 'dark',
                    }
                )
            }
        }
    }

    return (
        <div className={styles.container}>
            <div className={styles.searchDiv}>
                <label htmlFor="">{t('SEARCH_NFT2')}</label>
                <div className={styles.searchWrapper}>
                    <input
                        ref={callbackRef}
                        type="text"
                        className={styles.searchBar}
                        onChange={handleOnChange}
                        onKeyPress={handleOnKeyPress}
                        value={search}
                        placeholder={search}
                        autoFocus
                    />
                    <div>
                        <button
                            onClick={() => resolveDid(name)}
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
                        NFT Username not available
                    </h6>
                )}
            </div>
        </div>
    )
}

export default Component
