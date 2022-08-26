use crate::router::{switch, Route};
use gloo::console::log;
use stylist::{yew::styled_component};
use yew::prelude::*;
use yew_router::prelude::*;
use wasm_bindgen_futures;


mod components;
mod router;
mod polkadot_extension_binding;




#[styled_component(App)]
pub fn app() -> Html {
    let first_load = use_state(|| true);

    use_effect(move || {
      let data = polkadot_extension_binding::web3Enable("my cool dapp".to_owned());
       wasm_bindgen_futures::spawn_local(async move {
        let response = wasm_bindgen_futures::JsFuture::from(data).await.unwrap();
        log!(response);
       });
      

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
