import React, { useEffect, useState } from 'react'
import styles from './TypingEffect.module.scss'

interface TypingEffectProps {
    text: string
    speed?: number // ms per character
    className?: string
}

const TypingEffect: React.FC<TypingEffectProps> = ({
    text,
    speed,
    className,
}) => {
    const [displayed, setDisplayed] = useState('')
    const [showCursor, setShowCursor] = useState(true)

    useEffect(() => {
        setDisplayed('')
        let i = 0
        const interval = setInterval(() => {
            if (i < text.length) {
                setDisplayed(text.slice(0, i + 1))
                i++
            } else {
                clearInterval(interval)
                setShowCursor(false) // Hide cursor when done
            }
        }, speed)
        return () => clearInterval(interval)
    }, [text, speed])

    useEffect(() => {
        const cursorInterval = setInterval(() => {
            setShowCursor((c) => !c)
        }, 500)
        return () => clearInterval(cursorInterval)
    }, [])

    return (
        <span className={className || styles.typing}>
            {displayed}
            {/* <span className={showCursor ? styles.cursor : styles.cursorHidden}>
                |
            </span> */}
        </span>
    )
}

export default TypingEffect
