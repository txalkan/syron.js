import { toast } from 'react-toastify'
import { useStore } from 'effector-react'
import { useRouter } from 'next/router'
import { useSelector } from 'react-redux'
import { RootState } from '../app/reducers'
import { $user } from '../../src/store/user'
import { useTranslation } from 'next-i18next'

function controller() {
    const { t } = useTranslation()
    const user = useStore($user)
    const resolvedUsername = useSelector(
        (state: RootState) => state.modal.resolvedUsername
    )
    const controller = resolvedUsername?.controller
    const zilAddr = useSelector((state: RootState) => state.modal.zilAddr)
    const Router = useRouter()

    const isController = () => {
        const path = window.location.pathname
            .toLowerCase()
            .replace('/es', '')
            .replace('/cn', '')
            .replace('/id', '')
            .replace('/ru', '')
        const username = user?.name ? user?.name : path.split('/')[1]
        if (controller !== zilAddr?.base16) {
            Router.push(`/${username}/did`)
            setTimeout(() => {
                toast.error(
                    t('Only X’s DID Controller can access this wallet.', {
                        name: username,
                    }),
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
