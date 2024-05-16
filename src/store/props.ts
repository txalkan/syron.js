import { Store } from 'react-stores'
import { ListedTokenResponse } from '../types/token'

export const $props = new Store<ListedTokenResponse | null>(null)
export function updateProps(input: ListedTokenResponse) {
    $props.setState(input)
}
