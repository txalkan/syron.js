import { Base64 } from 'js-base64'

export function stringToBase64(stringToEncode: string) {
    // btoa only support ascii, use js-base64 instead
    return Base64.encode(stringToEncode)
}

export function getStringByteCount(str: string) {
    let totalLength = 0
    let charCode: number
    for (let i = 0; i < str.length; i++) {
        charCode = str.charCodeAt(i)
        if (charCode < 0x007f) {
            totalLength++
        } else if (0x0080 <= charCode && charCode <= 0x07ff) {
            totalLength += 2
        } else if (0x0800 <= charCode && charCode <= 0xffff) {
            totalLength += 3
        } else {
            totalLength += 4
        }
    }
    return totalLength
}

export const extractRejectText = (error: string) => {
    //const match = error.match(/value: (.*?), src/)
    const match = error.match(/(?:value:|with message:)\s(.*?),\s?src/)

    let rejectMsg = match ? match[1] : error

    // Remove any links like src/basic_bitcoin ...
    // rejectMsg = rejectMsg.replace(/src\/\S+/g, '')
    return rejectMsg
}
