use crate::router::{switch, Route};
use gloo::console::log;
use gloo_timers::callback::Timeout;
use stylist::yew::styled_component;
use wasm_bindgen_futures;
use yew::prelude::*;
use yew_router::prelude::*;
mod components;
mod polkadot_extension_binding;
mod router;
use serde::{self, Serialize, Deserialize};


// #[derive(Serialize, Deserialize, Clone)]
// pub struct Accounts {
//     pub address: String,
// }

#[styled_component(App)]
pub fn app() -> Html {
    let first_load = use_state(|| true);

    use_effect(move || {
        let timeout = Timeout::new(1_000, move || {
            let data = polkadot_extension_binding::web3Enable("my cool dapp".to_owned());
            wasm_bindgen_futures::spawn_local(async move {
                let response = wasm_bindgen_futures::JsFuture::from(data).await.unwrap();
                log!("response", response);
            });
            let data2 = polkadot_extension_binding::web3Accounts();
            wasm_bindgen_futures::spawn_local(async move {
                let response = wasm_bindgen_futures::JsFuture::from(data2).await.unwrap();
                log!(response.clone());
                // let account: Accounts = response.into_serde().unwrap();
                // log!(account.address)

            });
        });
        timeout.forget();
        if *first_load {
            //code
            first_load.set(false);
        }
        || {}
    });

    html! (
       <BrowserRouter>
           <Switch<Route> render={Switch::render(switch)} />
       </BrowserRouter>
    )
}
