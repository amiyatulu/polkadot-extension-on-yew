const win = window; // don't clobber the existing object, but ensure non-undefined

win.injectedWeb3 = win.injectedWeb3 || {}; // true when anything has been injected and is available

let web3EnablePromise = null;
let isWeb3Injected = web3IsInjected();

function documentReadyPromise(creator) {
    return new Promise(resolve => {
      if (document.readyState === 'complete') {
        resolve(creator());
      } else {
        window.addEventListener('load', () => resolve(creator()));
      }
    });
  }


  function web3IsInjected() {
    return Object.keys(win.injectedWeb3).length !== 0;
  } 

 

  function getWindowExtensions(originName) {
    return Promise.all(Object.entries(win.injectedWeb3).map(([name, {
      enable,
      version
    }]) => Promise.all([Promise.resolve({
      name,
      version
    }), enable(originName).catch(error => {
      console.error(`Error initializing ${name}: ${error.message}`);
    })])));
  } // enables all the providers found on the injected window interface
  

export function web3Enable(originName, compatInits = []) {
    if (!originName) {
      throw new Error('You must pass a name for your app to the web3Enable function');
    }
  
    const initCompat = compatInits.length ? Promise.all(compatInits.map(c => c().catch(() => false))) : Promise.resolve([true]);
    web3EnablePromise = documentReadyPromise(() => initCompat.then(() => getWindowExtensions(originName).then(values => values.filter(value => !!value[1]).map(([info, ext]) => {
      // if we don't have an accounts subscriber, add a single-shot version
      if (!ext.accounts.subscribe) {
        ext.accounts.subscribe = cb => {
          ext.accounts.get().then(cb).catch(console.error);
          return () => {// no ubsubscribe needed, this is a single-shot
          };
        };
      }
  
      return { ...info,
        ...ext
      };
    })).catch(() => []).then(values => {
      const names = values.map(({
        name,
        version
      }) => `${name}/${version}`);
      isWeb3Injected = web3IsInjected();
      console.log(`web3Enable: Enabled ${values.length} extension${values.length !== 1 ? 's' : ''}: ${names.join(', ')}`);
      return values;
    })));
    return web3EnablePromise;
  } // retrieve all the accounts across all providers
  