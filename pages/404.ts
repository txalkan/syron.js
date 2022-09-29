import { useEffect } from 'react'
import { useRouter } from 'next/router'

export default function Custom404() {
    const router = useRouter()

    useEffect(() => {
        const path = window.location.pathname
            .replace('/', '')
            .replace('/es', '')
            .replace('/cn', '')
            .replace('/id', '')
            .replace('/ru', '')
            .toLowerCase()
        // @todo-i-fixed
        // this redirection not valid anymore?
        // A: .domain is deprecated so we can remove it: done

        // since we always redirect user to /username on header useeffect
        // UPDATE: we still need /funds and /tree function from this file
        if (path.split('/')[1] === 'tree') {
            router.push(`${path.split('/')[0]}`)
        } else {
            router.replace('/')
        }
    })

    return null
}
