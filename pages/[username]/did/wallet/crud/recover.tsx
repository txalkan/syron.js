import Image from 'next/image'
import Layout from '../../../../../components/Layout'
import { NewDoc, Headline } from '../../../../../components'
import styles from '../../../../styles.module.scss'
import Warning from '../../../../../src/assets/icons/warning.svg'

function Recover() {
    const data = [
        {
            name: 'wallet',
            route: '/did/wallet',
        },
        {
            name: 'did operations',
            route: '/did/wallet/crud',
        },
    ]

    return (
        <>
            <Layout>
                <div className={styles.headlineWrapper}>
                    <Headline data={data} />
                    <h2 className={styles.title}>DID update</h2>
                    <h4>
                        With this transaction, you will upload a brand new DID
                        Document.
                        <span className={styles.tooltip}>
                            <Image
                                alt="warning-ico"
                                src={Warning}
                                width={20}
                                height={20}
                            />
                            <span className={styles.tooltiptext}>
                                <h5 className={styles.modalInfoTitle}>INFO</h5>
                                <p>
                                    This transaction is a specific type of DID
                                    Update operation that is only possible after
                                    a DID Social Recovery operation.
                                </p>
                            </span>
                        </span>
                    </h4>
                </div>
                <NewDoc typeInput="recover" />
            </Layout>
        </>
    )
}

export default Recover
