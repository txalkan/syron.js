import styles from './styles.module.scss'

function SSN({ onChange, title }) {
    return (
        <div style={{ width: '100%' }}>
            <div className={styles.titleCardRight}>{title}</div>
            <select onChange={onChange}>
                <option value="">Select SSN</option>
                <option value="SSN#1">SSN#1</option>
                <option value="SSN#2">SSN#2</option>
            </select>
        </div>
    )
}

export default SSN
