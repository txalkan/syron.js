import styles from "./styles.module.scss";

function Component() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        textAlign: "center",
        alignItems: "center",
      }}
    >
      <h2>
        <div
          onClick={() => {
            // updateIsController(true);
            // Router.push(`/${username}/did/wallet/crud/create`);
          }}
          className={styles.flipCard}
        >
          <div className={styles.flipCardInner}>
            <div className={styles.flipCardFront}>
              <p className={styles.cardTitle3}>INCREASE</p>
            </div>
            <div className={styles.flipCardBack}>
              <p className={styles.cardTitle2}>DESC</p>
            </div>
          </div>
        </div>
      </h2>
      <h2>
        <div
          onClick={() => {
            // updateIsController(true);
            // Router.push(`/${username}/did/wallet/crud/create`);
          }}
          className={styles.flipCard}
        >
          <div className={styles.flipCardInner}>
            <div className={styles.flipCardFront}>
              <p className={styles.cardTitle3}>DECREASE</p>
            </div>
            <div className={styles.flipCardBack}>
              <p className={styles.cardTitle2}>DESC</p>
            </div>
          </div>
        </div>
      </h2>
    </div>
  );
}

export default Component;
