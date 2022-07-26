import { useRouter } from 'next/router'
import { updatePrev } from '../store/router'
import { updateResolvedInfo } from '../store/resolvedInfo'

function routerHook() {
    const Router = useRouter()

    const navigate = (path) => {
        updatePrev(window.location.pathname)
        Router.push(path)
    }

    return {
        navigate,
    }
}

export default routerHook
