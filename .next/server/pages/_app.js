"use strict";
(() => {
var exports = {};
exports.id = 888;
exports.ids = [888];
exports.modules = {

/***/ 3206:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  "default": () => (/* binding */ _app)
});

// EXTERNAL MODULE: external "react/jsx-runtime"
var jsx_runtime_ = __webpack_require__(997);
// EXTERNAL MODULE: external "react-redux"
var external_react_redux_ = __webpack_require__(6022);
;// CONCATENATED MODULE: external "@reduxjs/toolkit"
const toolkit_namespaceObject = require("@reduxjs/toolkit");
// EXTERNAL MODULE: ./src/app/actions.ts
var actions = __webpack_require__(9471);
;// CONCATENATED MODULE: ./src/app/reducers.ts


const initialState = {
    signInModal: false,
    ssiKeyModal: false,
    newWalletModal: false
};
function modalReducer(state = initialState, action) {
    switch(action.type){
        case actions/* ModalActionTypes.ShowSignInModal */.R_.ShowSignInModal:
            return {
                ...state,
                signInModal: true
            };
        case actions/* ModalActionTypes.HideSignInModal */.R_.HideSignInModal:
            return {
                ...state,
                signInModal: false
            };
        case actions/* ModalActionTypes.ShowSsiKeyModal */.R_.ShowSsiKeyModal:
            return {
                ...state,
                ssiKeyModal: true
            };
        case actions/* ModalActionTypes.HideSsiKeyModal */.R_.HideSsiKeyModal:
            return {
                ...state,
                ssiKeyModal: false
            };
        case actions/* ModalActionTypes.ShowNewWalletModal */.R_.ShowNewWalletModal:
            return {
                ...state,
                newWalletModal: true
            };
        case actions/* ModalActionTypes.HideNewWalletModal */.R_.HideNewWalletModal:
            return {
                ...state,
                newWalletModal: false
            };
        default:
            return state;
    }
}
const rootReducer = (0,toolkit_namespaceObject.combineReducers)({
    modal: modalReducer
});
/* harmony default export */ const reducers = (rootReducer);

;// CONCATENATED MODULE: ./src/app/store.ts


const store = (0,toolkit_namespaceObject.createStore)(reducers);

;// CONCATENATED MODULE: ./pages/_app.tsx










function SSIBrowser({ Component , pageProps  }) {
    return(/*#__PURE__*/ jsx_runtime_.jsx(jsx_runtime_.Fragment, {
        children: /*#__PURE__*/ jsx_runtime_.jsx(external_react_redux_.Provider, {
            store: store,
            children: /*#__PURE__*/ jsx_runtime_.jsx(Component, {
                ...pageProps
            })
        })
    }));
}
/* harmony default export */ const _app = (SSIBrowser);


/***/ }),

/***/ 6022:
/***/ ((module) => {

module.exports = require("react-redux");

/***/ }),

/***/ 997:
/***/ ((module) => {

module.exports = require("react/jsx-runtime");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, [471], () => (__webpack_exec__(3206)));
module.exports = __webpack_exports__;

})();