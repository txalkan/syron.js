import React, { useEffect, useState } from 'react'
import styles from './styles.module.scss'
import Big from 'big.js'
import { useStore } from 'react-stores'
import { $tyron_liquidity } from '../../src/store/shares'
import { DragonDex } from '../../src/mixins/dex'
import { useRouter } from 'next/router'
import Image from 'next/image'
import iconTYRON from '../../src/assets/icons/ssi_token_Tyron.svg'
import iconSSI from '../../src/assets/icons/SSI_dollar.svg'
import iconTyronSSI from '../../src/assets/icons/ssi_tyron_LPtoken.svg'

import { $net } from '../../src/store/network'
import smartContract from '../../src/utils/smartContract'
import * as tyron from 'tyron'
import { Blockchain } from '../../src/mixins/custom-fetch'

const dex = new DragonDex()
const provider = new Blockchain()
function Component() {
    const tydradex_liquidity = useStore($tyron_liquidity)
    const { reserves } = tydradex_liquidity
    const pools_ = reserves
    const [tyronS$IReserves, setTyronS$IReserves] = useState<any>([0, 0])
    const ssiReserve = tyronS$IReserves[0]
    const tyronReserve = tyronS$IReserves[1]
    const [tyronPrice, setTyronPrice] = useState<any>('loading...')

    const net = $net.state.net as 'mainnet' | 'testnet'
    const { getSmartContract } = smartContract()
    const [tyronSupply, setTyronSupply] = useState<string>('')
    const [s$iSupply, setS$iSupply] = useState<string>('')
    const [tyronS$iSupply, setTyronS$iSupply] = useState<string>('')

    //@dev: update tyronDEX state
    useEffect(() => {
        dex.updateState()
    }, [])
    useEffect(() => {
        //@dev: TyronDEX TVL
        const inputReserve = pools_['tyron_s$i'] ? pools_['tyron_s$i'] : [0, 0]
        const [ssiReserve, tyronReserve] = inputReserve
        setTyronS$IReserves([ssiReserve, tyronReserve])

        //@dev: TYRON price
        const price =
            tyronReserve !== 0
                ? Big(ssiReserve).div(Big(tyronReserve)).div(10e5).round(4)
                : 0
        setTyronPrice(String(price))

        //@dev: Tokens supply
        async function readSupply() {
            const init_addr = await tyron.SearchBarUtil.default.fetchAddr(
                net,
                'did',
                'init'
            )
            const get_services = await getSmartContract(init_addr, 'services')
            const services = await tyron.SmartUtil.default.intoMap(
                get_services!.result.services
            )

            const ids = ['TYRON', 'S$I']
            const token_addresses: string[] = []
            ids.forEach((id) => {
                const id_ = id.toLowerCase()
                const token_addr = services.get(id_)
                if (token_addr) {
                    token_addresses.push(token_addr!)
                } else {
                    console.error(`Token address not found for id: ${id}`)
                    // Handle the case where token address is not found for a particular id, if necessary.
                }
            })
            const tokens_supply = await provider.readTokensSupply(
                token_addresses
            )
            const tyron_supply = tokens_supply[0]
                ? Big(tokens_supply[0]).div(1e12).round(1)
                : 0

            setTyronSupply(String(tyron_supply))
            const ssi_supply = tokens_supply[1]
                ? Big(tokens_supply[1]).div(1e18).round(1)
                : 0

            setS$iSupply(String(ssi_supply))
            const tyrons$i_supply = tokens_supply[2]
                ? Big(tokens_supply[2]).div(1e18).round(1)
                : 0

            setTyronS$iSupply(String(tyrons$i_supply))
        }
        readSupply()
    }, [reserves])
    const tyron_tvl = tyronReserve ? Big(tyronReserve).div(1e12).round(1) : 0

    const s$i_tvl = ssiReserve ? Big(ssiReserve).div(1e18).round(1) : 0
    const total_tvl = ssiReserve ? Big(ssiReserve).mul(2).div(1e18).round(1) : 0
    const Router = useRouter()

    const locked_supply = 120000 * 33 + 41666 + 20000 * 99
    const tyron_cs = Number(tyronSupply) - locked_supply
    const tyron_tvl_supply = Number(tyron_tvl) / tyron_cs
    const s$i_tvl_supply = Number(s$i_tvl) / Number(s$iSupply)
    return (
        <div className={styles.dashboard}>
            <div className={styles.title}>stats</div>
            <div className={styles.rowRate}>
                <span>1</span>
                <Image
                    src={iconTYRON}
                    alt="tyron-icon"
                    height="25"
                    width="25"
                />
                <span className={styles.equalsign}>
                    {String(tyronPrice)} SGD
                </span>
            </div>
            <div className={styles.rowRate}>
                <div
                    onClick={() => {
                        Router.push('/tyrondex.ssi')
                    }}
                    className={styles.tyronDEX}
                >
                    on TyronDEX
                </div>
            </div>

            <div className={styles.subtitle}>circulating supply</div>
            <div className={styles.rowRate}>
                <span>{tyron_cs.toLocaleString()}</span>
                <Image
                    src={iconTYRON}
                    alt="tyron-icon"
                    height="25"
                    width="25"
                />
            </div>
            <div className={styles.rowRate}>
                <span>{Number(s$iSupply).toLocaleString()}</span>
                <Image src={iconSSI} alt="s$in-icon" height="25" width="25" />
            </div>
            {/* <div className={styles.rowRate}>
                <Image
                    src={iconTyronSSI}
                    alt="tyrons$i-icon"
                    height="25"
                    width="25"
                />
                <span>{String(tyronS$iSupply)} tyronS$I</span>
            </div> */}
            <div className={styles.subtitle}>TVL</div>
            <div className={styles.subtitle2}>
                {Number(total_tvl).toLocaleString()} SGD
            </div>

            <div className={styles.rowRate}>
                <span>{Number(tyron_tvl).toLocaleString()}</span>
                <Image
                    src={iconTYRON}
                    alt="tyron-icon"
                    height="25"
                    width="25"
                />
            </div>
            <div className={styles.rowRate}>
                <span>{Number(s$i_tvl).toLocaleString()}</span>
                <Image src={iconSSI} alt="s$i-icon" height="25" width="25" />
            </div>
            <div className={styles.subtitle2}>TVL-to-Supply Ratio</div>
            <div className={styles.rowRate}>
                <Image
                    src={iconTYRON}
                    alt="tyron-icon"
                    height="25"
                    width="25"
                />
                <span></span>
                <span>{tyron_tvl_supply.toFixed(2)} %</span>
            </div>
            <div className={styles.rowRate}>
                <Image src={iconSSI} alt="s$i-icon" height="25" width="25" />
                <span></span>
                <span>{s$i_tvl_supply.toFixed(2)} %</span>
            </div>
        </div>
    )
}

export default Component
