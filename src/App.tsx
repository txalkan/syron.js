import React, { useReducer } from 'react';

import {
    stateContext as StateContext,
    dispatchContext as DispatchContext,
    globalReducer,
    globalState
} from './context/index';
import { Header, Footer, SignInModal } from './components';
import './styles/scss/application.scss';

function App() {
    const [state, dispatch] = useReducer(globalReducer, globalState);
    return (
        <StateContext.Provider value={state}>
            <DispatchContext.Provider value={dispatch}>
                <div id="wrapper">
                    <Header />
                    <Footer />
                </div>
                <SignInModal />
            </DispatchContext.Provider>
        </StateContext.Provider>
    );
}

export default App;
