import React from 'react'
import styles from './styles.module.scss'

function Component() {
    return (
        <div className={styles.container}>
            <h2 className={styles.title}>Template</h2>
        </div>
        //     <div className={styles.cardActiveWrapper}>
        //     <div
        //         onClick={() => toggleActive('temp')}
        //         className={
        //             active === 'temp'
        //                 ? styles.cardActive
        //                 : styles.card
        //         }
        //     >
        //         <div className={styles.title}>Template</div>
        //         <div className={styles.icoWrapper}>
        //             <Image src={active === 'temp' ? icoUp : icoDown} alt="toggle-ico" />
        //         </div>
        //     </div>
        //     {active === 'temp' && (
        //         <div className={styles.cardSub}>
        //             <div className={styles.closeIcoWrapper}>
        //                 <div
        //                     onClick={() => toggleActive('')}
        //                     className={styles.closeIco}
        //                 >
        //                     <Image
        //                         width={10}
        //                         src={CloseIco}
        //                         alt="close-ico"
        //                     />
        //                 </div>
        //             </div>
        //             <div className={styles.wrapper}>
        //             </div>
        //         </div>
        //     )}
        // </div>
    )
}

export default Component
