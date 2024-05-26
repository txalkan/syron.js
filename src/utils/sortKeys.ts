export function sortKeys(obj: any): any {
    if (Array.isArray(obj)) {
        return obj.map(sortKeys)
    } else if (obj !== null && typeof obj === 'object') {
        return Object.keys(obj)
            .sort()
            .reduce((result: { [key: string]: any }, key: string) => {
                result[key] = sortKeys(obj[key])
                return result
            }, {})
    }
    return obj
}
