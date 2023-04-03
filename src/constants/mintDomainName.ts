import { useTranslation } from 'next-i18next' //@todo-x move to tyron.js

//const { t } = useTranslation()
export const optionPayment = [
    {
        value: 'TYRON',
        label: '$TYRON 10.0',
    },
    // {
    //     value: 'S$I',
    //     label: 'S$I 14',
    // },
    {
        value: 'ZIL',
        label: '$ZIL 400.0',
    },
    {
        value: 'gZIL',
        label: '$gZIL 1.4',
    },
    {
        value: 'XSGD',
        label: '$XSGD 14.0',
    },
    {
        value: 'XIDR',
        label: '$XIDR 155,000.0',
    },
    {
        value: 'zUSDT',
        label: '$zUSDT 10.0',
    },
    {
        value: 'FREE',
        label: 'FREE' /*t('FREE')*/,
    },
]

const pattern = /^[^\s.:/?#]*$/u
export const isValidUsername = (domain: string) =>
    (pattern.test(domain) && //(/^[^\s.:/?#\p{L}\p{M}]*$/.test(domain)
        domain.length > 4) ||
    domain === 'init' ||
    domain === 'wfp'

export const isValidUsernameInBatch = (domain: string) =>
    (/^(?![\x20-\x7E]*[\/:\?#\[\]@!"$&'()*+,;=])[^\x00-\x1F\x20\x7F]*$/.test(
        domain
    ) &&
        domain.length > 4) ||
    domain === 'init' ||
    domain === 'wfp'
