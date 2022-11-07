function isZil(version) {
    const res: any =
        version?.includes('zilstak') ||
        version?.includes('.stake-') ||
        version?.includes('zilxwal')

    return res
}

export default isZil
