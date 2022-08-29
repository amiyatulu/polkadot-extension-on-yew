const win = window // don't clobber the existing object, but ensure non-undefined

win.injectedWeb3 = win.injectedWeb3 || {} // true when anything has been injected and is available

let web3EnablePromise = null
let isWeb3Injected = web3IsInjected()

function documentReadyPromise(creator) {
  return new Promise((resolve) => {
    if (document.readyState === "complete") {
      resolve(creator())
    } else {
      window.addEventListener(
        "load",
        () => resolve(creator()),
        5000
      )
    }
  })
}


function web3IsInjected() {
  
  // console.log(window.injectedWeb3)
  return Object.keys(window.injectedWeb3).length !== 0
}

function mapAccounts(source, list, ss58Format) {
  return list.map(({ address, genesisHash, name, type }) => ({
    address: address.length === 42 ? address : address,
    meta: {
      genesisHash,
      name,
      source,
    },
    type,
  }))
} // have we found a properly constructed window.injectedWeb3

function getWindowExtensions(originName) {
  // console.log(win.injectedWeb3, "win.injectedweb3")
  return Promise.all(
    Object.entries(win.injectedWeb3).map(([name, { enable, version }]) =>
      Promise.all([
        Promise.resolve({
          name,
          version,
        }),
        enable(originName).catch((error) => {
          console.error(`Error initializing ${name}: ${error.message}`)
        }),
      ])
    )
  )
} // enables all the providers found on the injected window interface

export function web3Enable(originName, compatInits = []) {
  if (!originName) {
    throw new Error(
      "You must pass a name for your app to the web3Enable function"
    )
  }

  const initCompat = compatInits.length
    ? Promise.all(compatInits.map((c) => c().catch(() => false)))
    : Promise.resolve([true])
  web3EnablePromise = documentReadyPromise(() =>
    initCompat.then(() =>
      getWindowExtensions(originName)
        .then((values) =>
          values
            .filter((value) => !!value[1])
            .map(([info, ext]) => {
              // if we don't have an accounts subscriber, add a single-shot version
              if (!ext.accounts.subscribe) {
                ext.accounts.subscribe = (cb) => {
                  ext.accounts.get().then(cb).catch(console.error)
                  return () => {
                    // no ubsubscribe needed, this is a single-shot
                  }
                }
              }

              return { ...info, ...ext }
            })
        )
        .catch(() => [])
        .then((values) => {
          const names = values.map(({ name, version }) => `${name}/${version}`)
          isWeb3Injected = web3IsInjected()
          console.log(
            `web3Enable: Enabled ${values.length} extension${
              values.length !== 1 ? "s" : ""
            }: ${names.join(", ")}`
          )
          return values
        })
    )
  )
  return web3EnablePromise
} // retrieve all the accounts across all providers

export async function web3Accounts({
  accountType,
  extensions,
  ss58Format,
} = {}) {
  if (!web3EnablePromise) {
    return throwError("web3Accounts")
  }
  const accounts = []
  const injected = await web3EnablePromise
  const retrieved = await Promise.all(
    injected
      .filter(({ name: source }) => !extensions || extensions.includes(source))
      .map(async ({ accounts, name: source }) => {
        try {
          const list = await accounts.get()
          return mapAccounts(
            source,
            list.filter(({ type }) =>
              type && accountType ? accountType.includes(type) : true
            ),
            ss58Format
          )
        } catch (error) {
          // cannot handle this one
          return []
        }
      })
  )
  retrieved.forEach((result) => {
    accounts.push(...result)
  })
  const addresses = accounts.map(({ address }) => address)
  console.log(
    `web3Accounts: Found ${accounts.length} address${
      accounts.length !== 1 ? "es" : ""
    }: ${addresses.join(", ")}`
  )
  return accounts
}
