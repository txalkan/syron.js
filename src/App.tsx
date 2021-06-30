import React, { useReducer } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';

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
                    <Router>
                        <Header />
                        {/* <Switch>
              <Route exact path={Routes.Home} component={Home} />
              <Route exact path={Routes.Domains} component={Domains} />
              <Route exact path={Routes.Contact} component={Contact} />
              <Redirect to={Routes.Home} />
            </Switch> */}
                        <Footer />
                    </Router>
                </div>
                <SignInModal />
            </DispatchContext.Provider>
        </StateContext.Provider>
    );
}

export default App;
