//@domains-mainnet
export const optionPayment = [
    {
        value: 'ZIL',
        label: '1,200 ZIL',
    },
    {
        value: 'TYRON',
        label: '10 TYRON (50% discount)',
    },
    {
        value: 'S$I',
        label: '20 S$I (25% discount)',
    },
    {
        value: 'XSGD',
        label: '27 XSGD',
    },
    {
        value: 'XIDR',
        label: '300,000 XIDR',
    },
    {
        value: 'zUSDT',
        label: '20 zUSDT',
    },
    {
        value: 'gZIL',
        label: '4 gZIL',
    },
    {
        value: 'ZLP',
        label: '300 ZLP',
    },
]

const pattern = /^[^\s.:/?@#]*$/u
/*
The condition you provided is a regular expression pattern that matches any string that does not contain whitespace or certain characters often used in URLs.

Here's a breakdown of the pattern:

/ - start of the regular expression pattern
^ - start of the string
[^\s.:/?#]* - any number of characters that are not whitespace (\s) or any of the following characters: ., :, /, ?, #
$ - end of the string
/ - end of the regular expression pattern
u - flag indicating that the pattern should be interpreted as a Unicode string
So, for example, the following strings would match this pattern:

"hello"
"abc123"
"!@#$%"
"こんにちは"
"مرحبا"
And the following strings would not match:

"hello world" (contains a space)
"http://example.com" (contains : and /)
"example.com" (contains .)
*/
export const isValidUsername = (domain: string) =>
    (pattern.test(domain) && //(/^[^\s.:/?#\p{L}\p{M}]*$/.test(domain)
        domain.length > 3 &&
        !premium.includes(domain)) ||
    domain === 'init' ||
    domain === 'wfp'

export const isValidUsernameInBatch = (domain: string) =>
    (/^(?![\x20-\x7E]*[\/:\?#\[\]@!"$&'()*+,;=])[^\x00-\x1F\x20\x7F]*$/.test(
        domain
    ) &&
        domain.length > 3 &&
        !premium.includes(domain)) ||
    domain === 'init' ||
    domain === 'wfp'

//@nfts-mainnet
export const optionAddr = [
    {
        value: 'lexicassi',
        label: 'Lexica.ssi: Text-to-Image AI',
    },
    // {
    //     value: '.gzil',
    //     label: 'gZIL.ssi: .gzil domain names',
    // },
    {
        value: 'dd10k',
        label: 'Dr. Death: The Order of the Redeemed',
    },
    {
        value: 'tscwomen',
        label: 'The Soulless Citadel: The Rise of Women Warriors',
    },
    {
        value: 'blackgold',
        label: 'Teleisey: Black and Gold',
    },
    {
        value: 'metazoa',
        label: 'Zolar',
    },
]

export const ecoNfts = ['ddk10', 'tscwomen', 'blackgold', 'metazoa']

export const premium = [
    'hola',
    'chau',
    'pago',
    'land',
    'xero',
    'zero',
    'cero',
    'ivan',
    'iván',
    'manu',
    'amor',
    'love',
    'casa',
    'auto',
    'netflix',
    'mama',
    'mother',
    'father',
    'papa',
    'rios',
    'alex',
    'adam',
    'marx',
    'mark',
    'marc',
    'lago',
    'lake',
    'house',
    'true',
    'tree',
    'kind',
    'deep',
    'done',
    'life',
    'ride',
    'just',
    'line',
    'full',
    'take',
    'tate',
    'first',
    'meta',
    'boss',
    'hugo',
    'music',
    'nfts',
    'planet',
    'stats',
    'bird',
    'apple',
    'empire',
    'star',
    'stars',
    'trees',
    'reel',
    'rbol',
    'play',
    'dance',
    'zeus',
    'metal',
    'month',
    'stay',
    'comm',
    'comms',
    'comma',
    'after',
    'name',
    'nombre',
    'hombre',
    'mujer',
    'lady',
    'last',
    'week',
    'weekend',
    'soul',
    'ratio',
    'radio',
    'year',
    'alien',
    'some',
    'none',
    'real',
    'fake',
    'number',
    'seven',
    'nine',
    'four',
    'team',
    'local',
    'yours',
    'your',
    'they',
    'risk',
    'hope',
    'note',
    'well',
    'light',
    'dark',
    'mint',
    'park',
    'money',
    'passport',
    'pass',
    'port',
    'worth',
    'bien',
    'nina',
    'niños',
    'niñas',
    'niño',
    'niña',
    'starwars',
    'prime',
    'media',
    'news',
    'ship',
    'nave',
    'país',
    'plus',
    'monday',
    'tuesday',
    'wednesday',
    'capital',
    'thursday',
    'friday',
    'saturday',
    'sunday',
    'help',
    'file',
    'going',
    'gaga',
    'noche',
    'come',
    'back',
    'trust',
    'block',
    'website',
    'sure',
    'site',
    'theblock',
    'block',
    'chain',
    'humor',
    'over',
    'here',
    'dale',
    'okay',
    'east',
    'girl',
    'girls',
    'west',
    'keep',
    'droid',
    'chat',
    'back',
    'front',
    'black',
    'make',
    'male',
    'tell',
    'ever',
    'that',
    'this',
    'look',
    'even',
    'care',
    'food',
    'gear',
    'know',
    'stop',
    'told',
    'time',
    'beep',
    'gone',
    'haha',
    'jaja',
    'haus',
    'exit',
    'luke',
    'nick',
    'klaus',
    'kvme',
]
