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

export function sanitize(
    obj: any,
    allowedKeys: Record<string, any>
): Record<string, any> {
    const sanitized_obj: Record<string, any> = {}

    for (const key in allowedKeys) {
        if (obj.hasOwnProperty(key)) {
            if (
                typeof allowedKeys[key] === 'object' &&
                !Array.isArray(allowedKeys[key]) &&
                obj[key] !== null
            ) {
                sanitized_obj[key] = sanitize(obj[key], allowedKeys[key])
            } else if (Array.isArray(allowedKeys[key])) {
                if (Array.isArray(obj[key])) {
                    sanitized_obj[key] = obj[key].map((item: any) =>
                        sanitize(item, allowedKeys[key][0])
                    )
                } else {
                    sanitized_obj[key] = []
                }
            } else {
                sanitized_obj[key] = obj[key]
            }
        } else {
            sanitized_obj[key] = allowedKeys[key]
        }
    }

    return sanitized_obj
}
