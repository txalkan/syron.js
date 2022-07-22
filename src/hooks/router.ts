import { useRouter } from 'next/router'
import { updatePrev } from '../store/router'
import { updateUser } from '../store/user'

function routerHook() {
    const Router = useRouter()

    const navigate = (path) => {
        updatePrev(window.location.pathname)
        Router.push(path)
        const username = path.split('/')[1]
        const domain = path.split('/')[2].replace('didx', 'did')
        updateUser({ name: username, domain: domain })
    }

    return {
        navigate,
    }
}

export default routerHook
