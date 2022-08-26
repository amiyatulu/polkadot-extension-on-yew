use wasm_bindgen::prelude::*;
use js_sys::Promise;

#[wasm_bindgen(module = "/js/web3Enable.js")]
extern "C" {
    #[wasm_bindgen]
    pub fn web3Enable(originName: String) -> Promise;
}