import "../styles/css/fontawesome-all.min.css";
import "../styles/css/main.css";
import "../styles/css/noscript.css";
import "../styles/scss/variables/_breakpoints.scss";
import "../styles/scss/variables/_colors.scss";
import "../styles/scss/_normalizer.scss";
import "../styles/scss/application.scss";
import "react-toastify/dist/ReactToastify.css";

import type { AppProps } from "next/app";
import { Provider } from "react-redux";
import { store } from "../src/app/store";

function SSIBrowser({ Component, pageProps }: AppProps) {
  return (
    <>
      <Provider store={store}>
        <Component {...pageProps} />
      </Provider>
    </>
  );
}

export default SSIBrowser;
