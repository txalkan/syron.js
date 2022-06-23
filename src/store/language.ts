import { createDomain } from 'effector'

export let language: string

const languageDomain = createDomain()
export const updateLanguage = languageDomain.createEvent<string>()
export const $language = languageDomain
    .createStore<string>('en')
    .on(updateLanguage, (_, payload) => payload)
