import { toast } from 'react-toastify'
import { useStore } from 'effector-react'
import { useRouter } from 'next/router'
import { $isController } from '../store/controller'

function controller() {
    const isController_ = useStore($isController)
    const Router = useRouter()

    const isController = () => {
        const path = window.location.pathname.toLowerCase()
        const username = path.split('/')[1]
        if (!isController_) {
            Router.push(`/${username}`)
            setTimeout(() => {
                toast.error(
                    `Only ${username}'s controller can access this wallet.`,
                    {
                        position: 'top-right',
                        autoClose: 3000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                        theme: 'dark',
                        toastId: 9,
                    }
                )
            }, 1000)
        }
    }

    return {
        isController,
    }
}

export default controller
