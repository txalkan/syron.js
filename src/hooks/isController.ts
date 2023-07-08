// import { toast } from 'react-toastify'
import { useStore } from 'effector-react'
// import { useRouter } from 'next/router'
import { useSelector } from 'react-redux'
import { RootState } from '../app/reducers'
import { $resolvedInfo } from '../store/resolvedInfo'
import { useTranslation } from 'next-i18next'
import { $doc } from '../store/did-doc'
import { updateIsController } from '../store/controller'

//@review: asap
function controller() {
    const { t } = useTranslation()
    const resolvedInfo = useStore($resolvedInfo)
    // console.log('resolved_info', JSON.stringify(resolvedInfo))

    const doc = useStore($doc)
    // console.log('resolved_doc', JSON.stringify(doc))

    const controller = useStore($doc)?.controller
    const zilAddr = useSelector((state: RootState) => state.modal.zilAddr)

    const isController = () => {
        updateIsController(false)
        // const path = window.location.pathname
        //     .toLowerCase()
        //     .replace('/es', '')
        //     .replace('/cn', '')
        //     .replace('/id', '')
        //     .replace('/ru', '')
        // const username = resolvedInfo?.name
        //     ? resolvedInfo?.name
        //     : path.split('/')[1]
        if (controller !== undefined) {
            if (controller === zilAddr?.base16) {
                //if (controller !== zilAddr?.base16) {
                // toast.warn(
                //     t('Only X’s DID Controller can access this wallet.', {
                //         name: username,
                //     }),
                //     {
                //         position: 'top-right',
                //         autoClose: 3000,
                //         hideProgressBar: false,
                //         closeOnClick: true,
                //         pauseOnHover: true,
                //         draggable: true,
                //         progress: undefined,
                //         theme: toastTheme(isLight),
                //         toastId: 9,
                //     }
                // )
                //} else {
                updateIsController(true)
            }
        }
    }

    return {
        isController,
    }
}

export default controller
