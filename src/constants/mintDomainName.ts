//@fee domain names
export const optionPayment = [
    // {
    //     value: 'S$I',
    //     label: 'S$I 14',
    // },
    {
        value: 'ZIL',
        label: '$ZIL 200.0',
    },
    {
        value: 'TYRON',
        label: '$TYRON 10.0',
    },
    {
        value: 'ZLP',
        label: '$ZLP 70.0',
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
        label: 'lexica.ssi dApp: Text-to-image AI',
    },
    // {
    //     value: '.gzil',
    //     label: 'gZIL.ssi: .gzil domain names',
    // },
    {
        value: 'dd10k',
        label: 'Dr Death: The Order of the Redeemed',
    },
]
