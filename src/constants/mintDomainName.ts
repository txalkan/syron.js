//@mainnet-domains
export const optionPayment = [
    {
        value: 'ZIL',
        label: '1,200 ZIL',
    },
    {
        value: 'TYRON',
        label: '3 TYRON',
    },
    {
        value: 'S$I',
        label: '10 S$I',
    },
    {
        value: 'XSGD',
        label: '10 XSGD',
    },
    {
        value: 'zUSDT',
        label: '7 zUSDT',
    },
    {
        value: 'gZIL',
        label: '1.5 gZIL',
    },
    {
        value: 'XIDR',
        label: '103,000 XIDR',
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

export const optionAddr = [
    {
        value: 'lexicassi',
        label: 'Lexica.ssi DApp: Text-to-Image AI',
    },
    // {
    //     value: '.gzil',
    //     label: 'gZIL.ssi: .gzil domain names',
    // },
    {
        value: 'dd10k',
        label: 'The Order of the Redeemed by Dr. Death',
    },
]
