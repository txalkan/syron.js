import React from 'react'
import styles from './styles.module.scss'
import Big from 'big.js'

interface CollateralRatioProgressBarProps {
    collateralRatio: string
    syron: {
        syron_usd_loan: Big
        syron_btc: Big
    } | null
}

const CollateralRatioProgressBar: React.FC<CollateralRatioProgressBarProps> = ({
    collateralRatio,
    syron,
}) => {
    if (!collateralRatio) {
        return null
    }

    return (
        <div className={styles.collateralProgressBar}>
            <div className={styles.progressBarContainer}>
                {/* Main progress bar with single gradient - 120% to 170% range */}
                <div
                    className={styles.progressBar}
                    style={{
                        position: 'relative',
                        height: '20px',
                        borderRadius: '10px',
                        overflow: 'hidden',
                        width: '100%',
                        minWidth: '280px',
                        margin: '0 auto',
                        // Single gradient replaces the three separate divs
                        background:
                            'linear-gradient(to right, #ef4444 0%, #ef4444 20%, #f59e0b 20%, #f59e0b 60%, #10b981 60%, #10b981 100%)',
                    }}
                >
                    {/* Current position marker - 120% to 170% range */}
                    <div
                        className={styles.progressMarker}
                        style={{
                            position: 'absolute',
                            left: `${Math.max(0, Math.min(((parseFloat(collateralRatio) - 120) / 50) * 100, 100))}%`,
                            top: '-2px',
                            width: '4px',
                            height: 'calc(100% + 4px)',
                            backgroundColor: '#000',
                            borderRadius: '2px',
                            zIndex: 10,
                        }}
                    />
                </div>

                {/* Zone information with key Bitcoin prices - responsive layout */}
                <div
                    className={styles.progressZones}
                    style={{
                        display: 'flex',
                        width: '100%',
                        marginTop: 'clamp(8px, 2vw, 12px)',
                        minWidth: '280px',
                        margin: 'clamp(8px, 2vw, 12px) auto 0',
                    }}
                >
                    {/* 120% - Liquidation Price */}
                    <div
                        style={{
                            width: '20%',
                            textAlign: 'left',
                            fontSize: 'clamp(9px, 2.5vw, 11px)',
                            paddingLeft: '2px',
                            minWidth: '56px',
                        }}
                    >
                        <div
                            style={{
                                fontWeight: 'bold',
                                marginBottom: '2px',
                                fontSize: 'clamp(10px, 2.8vw, 12px)',
                            }}
                        >
                            120%
                        </div>
                        <div
                            style={{
                                color: '#ef4444',
                                wordBreak: 'break-all',
                                lineHeight: '1.2',
                            }}
                        >
                            $
                            {syron?.syron_usd_loan && syron?.syron_btc
                                ? (
                                      (1.2 * Number(syron.syron_usd_loan)) /
                                      Number(syron.syron_btc)
                                  ).toFixed(0)
                                : '0'}
                        </div>
                    </div>

                    {/* 130% - Warning Price */}
                    <div
                        style={{
                            width: '40%',
                            textAlign: 'left',
                            fontSize: 'clamp(9px, 2.5vw, 11px)',
                            paddingLeft: '2px',
                            minWidth: '112px',
                        }}
                    >
                        <div
                            style={{
                                fontWeight: 'bold',
                                marginBottom: '2px',
                                fontSize: 'clamp(10px, 2.8vw, 12px)',
                            }}
                        >
                            130%
                        </div>
                        <div
                            style={{
                                color: '#f59e0b',
                                wordBreak: 'break-all',
                                lineHeight: '1.2',
                            }}
                        >
                            $
                            {syron?.syron_usd_loan && syron?.syron_btc
                                ? (
                                      (1.3 * Number(syron.syron_usd_loan)) /
                                      Number(syron.syron_btc)
                                  ).toFixed(0)
                                : '0'}
                        </div>
                    </div>

                    {/* 150% - Safe Price */}
                    <div
                        style={{
                            width: '40%',
                            textAlign: 'left',
                            fontSize: 'clamp(9px, 2.5vw, 11px)',
                            paddingLeft: '2px',
                            minWidth: '112px',
                        }}
                    >
                        <div
                            style={{
                                fontWeight: 'bold',
                                marginBottom: '2px',
                                fontSize: 'clamp(10px, 2.8vw, 12px)',
                            }}
                        >
                            150%
                        </div>
                        <div
                            style={{
                                color: '#10b981',
                                wordBreak: 'break-all',
                                lineHeight: '1.2',
                            }}
                        >
                            $
                            {syron?.syron_usd_loan && syron?.syron_btc
                                ? (
                                      (1.5 * Number(syron.syron_usd_loan)) /
                                      Number(syron.syron_btc)
                                  ).toFixed(0)
                                : '0'}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CollateralRatioProgressBar
