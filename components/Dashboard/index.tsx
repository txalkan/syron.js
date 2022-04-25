import Image from "next/image";
import { useSelector, useDispatch } from "react-redux";
import { useStore } from "effector-react";
import userConnected from "../../src/assets/icons/user_connected.svg";
import userLoggedIn from "../../src/assets/icons/user_loggedin.svg";
import styles from "./styles.module.scss";
import { RootState } from "../../src/app/reducers";
import { $new_ssi } from "../../src/store/new-ssi";
import { showDashboardModal } from "../../src/app/actions";

function Component() {
  const dispatch = useDispatch();
  const loginInfo = useSelector((state: RootState) => state.modal);
  const new_ssi = useStore($new_ssi);

  return (
    <div
      className={styles.wrapper}
      onClick={() => dispatch(showDashboardModal(true))}
    >
      {new_ssi !== null || loginInfo.address !== null ? (
        <>
          <Image src={userLoggedIn} alt="user-loggedin" />
          <h6 className={styles.txtLoggedIn}>logged in</h6>
        </>
      ) : loginInfo.zilAddr !== null ? (
        <>
          <Image src={userConnected} alt="user-connected" />
          <h6 className={styles.txtConnected}>connected</h6>
        </>
      ) : (
        <></>
      )}
    </div>
  );
}

export default Component;
