export function filterTokensBySymbol(
    arr: Array<any>,
    symbols: Array<string>
): Array<any> {
    return arr.filter((obj) => symbols.includes(obj.meta.symbol.toLowerCase()))
}

export function filterTokenStateBySymbol(
    arr: Array<any>,
    symbols: Array<string>
): Array<any> {
    const lowercaseSymbols = symbols.map((symbol) => symbol.toLowerCase())
    return arr.filter((obj) =>
        lowercaseSymbols.includes(obj.symbol.toLowerCase())
    )
}

export function getBalanceBySymbolAndAddress(
    arr: Array<any>,
    symbol: string,
    address: string
): string | undefined {
    const lowercasedSymbol = symbol.toLowerCase()
    const obj = arr.find(
        (obj) => obj.meta.symbol.toLowerCase() === lowercasedSymbol
    )
    if (obj && obj.balance.hasOwnProperty(address.toLowerCase())) {
        return obj.balance[address.toLowerCase()]
    }
    return undefined
}
