import React from 'react';

import {
    stateContext as StateContext,
    dispatchContext as DispatchContext,
    globalReducer,
    globalState
} from './context/index';
import { Header, Footer } from './components';
import './styles/scss/application.scss';

function App() {
    return (
        <>
            <div id="wrapper">
                <Header />
                <Footer />
            </div>
        </>
    );
}

export default App;
