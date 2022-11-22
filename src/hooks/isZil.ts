function isZil(version) {
    let version_ = version?.toLowerCase()
    const res: any =
        version_?.includes('zilstak') ||
        version_?.includes('.stake-') ||
        version_?.includes('zilxwal')

    return res
}

export default isZil
