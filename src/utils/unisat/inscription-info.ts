// @dev Add inscription info to the Tyron indexer
export const addInscriptionInfo = async (tx_id: string) => {
    const add = await fetch(
        `/api/get-unisat-inscription-info?id=${tx_id + 'i0'}`
    )

    if (!add.ok) {
        throw new Error(`Indexer error! Status: 501`)
    }

    const add_data = await add.json()
    console.log(
        'Add transfer inscription to the Tyron indexer: ',
        JSON.stringify(add_data, null, 2)
    )

    return add_data
}

// @dev Update inscription info in the Tyron indexer
export const updateInscriptionInfo = async (tx_id: string) => {
    const update = await fetch(
        `/api/update-unisat-inscription-info?id=${tx_id + 'i0'}`
    )

    if (!update.ok) {
        throw new Error(`Indexer error! Status: 502`)
    }

    const update_data = await update.json()
    console.log(
        'Update transfer inscription in the Tyron indexer: ',
        JSON.stringify(update_data, null, 2)
    )

    return update_data
}
