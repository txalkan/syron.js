import { createDomain } from 'effector'

const isControllerDomain = createDomain()
export const updateIsController = isControllerDomain.createEvent<Boolean>()
export const $isController = isControllerDomain
    .createStore<Boolean | null>(null)
    .on(updateIsController, (_, payload) => payload)
