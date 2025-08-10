import React from 'react'
import styles from './styles.module.scss'

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg'
    className?: string
}

function LoadingSpinner({ size = 'md', className = '' }: LoadingSpinnerProps) {
    return (
        <div
            className={`${styles.loadingSpinner} ${styles[size]} ${className}`}
        />
    )
}

export default LoadingSpinner
