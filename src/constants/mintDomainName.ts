import { useTranslation } from 'next-i18next' //@todo-x move to tyron.js

//const { t } = useTranslation()
export const optionPayment = [
    {
        value: 'TYRON',
        label: '$TYRON 10',
    },
    // {
    //     value: 'S$I',
    //     label: 'S$I 14',
    // },
    {
        value: 'ZIL',
        label: '$ZIL 400',
    },
    {
        value: 'gZIL',
        label: '$gZIL 1.4',
    },
    {
        value: 'XSGD',
        label: '$XSGD 14',
    },
    {
        value: 'XIDR',
        label: '$XIDR 155,000',
    },
    {
        value: 'zUSDT',
        label: '$zUSDT 10',
    },
    {
        value: 'FREE',
        label: 'FREE' /*t('FREE')*/,
    },
]

export const isValidUsername = (domain: string) =>
    (/^[^ .!'();:@&=+$,/?%#]$/.test(domain) && domain.length > 4) ||
    domain === 'init' ||
    domain === 'wfp'

export const isValidUsernameInBatch = (domain: string) =>
    (/^[^\x00-\x1F!;:@&=+$,/?%#.]$/.test(domain) && domain.length > 4) ||
    domain === 'init' ||
    domain === 'wfp'
