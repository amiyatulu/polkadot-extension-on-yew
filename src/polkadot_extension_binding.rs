use wasm_bindgen::prelude::*;
use js_sys::Promise;

#[wasm_bindgen(module = "/js/polkadotextension.js")]
extern "C" {
    #[wasm_bindgen]
    pub fn web3Enable(originName: String) -> Promise;

    #[wasm_bindgen]
    pub fn web3Accounts() -> Promise;
}