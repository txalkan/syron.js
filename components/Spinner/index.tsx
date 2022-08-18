import { useSelector } from 'react-redux'
import { RootState } from '../../src/app/reducers'

function Spinner() {
    const isLight = useSelector((state: RootState) => state.modal.isLight)
    return (
        <i
            style={{ color: isLight ? '#000' : 'silver' }}
            className="fa fa-lg fa-spin fa-circle-notch"
            aria-hidden="true"
        ></i>
    )
}

export default Spinner
