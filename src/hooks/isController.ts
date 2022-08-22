import { toast } from 'react-toastify'
import { useStore } from 'effector-react'
import { useRouter } from 'next/router'
import { useSelector } from 'react-redux'
import { RootState } from '../app/reducers'
import { $resolvedInfo } from '../store/resolvedInfo'
import { useTranslation } from 'next-i18next'
import { $doc } from '../store/did-doc'

//@todo-i-checked review and use globally
function controller() {
    const { t } = useTranslation()
    const resolvedInfo = useStore($resolvedInfo)
    const controller = useStore($doc)?.controller
    const zilAddr = useSelector((state: RootState) => state.modal.zilAddr)

    const isController = () => {
        const path = window.location.pathname
            .toLowerCase()
            .replace('/es', '')
            .replace('/cn', '')
            .replace('/id', '')
            .replace('/ru', '')
        const username = resolvedInfo?.name
            ? resolvedInfo?.name
            : path.split('/')[1]
        if (controller !== zilAddr?.base16) {
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
        }
    }

    const checkController = () => {
        if (controller === zilAddr?.base16) {
            return true
        }
        return false
    }

    return {
        isController,
        checkController,
    }
}

export default controller
