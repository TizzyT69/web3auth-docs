---
title: Using Web3Auth with StarkEx.
image: "/contents/web3auth-stark-ex.png"
description: Using Web3Auth with StarkEx.
order: 13
category: misc
---

import Tabs from "@theme/Tabs";

import TabItem from "@theme/TabItem";
import InstallWeb3Auth from "../../../docs/common/web/code/web3auth/_install.mdx";
import InstantiateWeb3Auth from "../../../docs/common/web/code/web3auth/_instantiate-evm.mdx";
import SubscribeEvents from "../../../docs/common/web/code/web3auth/_subscribe_events.mdx";
import CommonSdkFunctions from "../../../docs/common/web/code/web3auth/_common-sdk-functions.mdx";
import CommonChainFunctions from "../../../docs/common/web/code/web3auth/_common-eth-functions.mdx";
import RegisterApplication from "../../../docs/common/web/code/web3auth/_register-client_id.mdx";

## `Introduction`

This guide is a tutorial to go through the steps required for using StarkEx with web3auth.

<RegisterApplication />

<InstallWeb3Auth />

Additional packages are required to get StarkNet account and use StarkEx gateway.

```shell
 npm i --save @starkware-industries/starkex-js
 npm i --save @toruslabs/starkware-crypto"
```

<br />

## `Create web3auth instance`

We need `clientId` and `chainConfig` to initialize web3auth class. You can get your `clientId` by registering your app on
[developer dashboard](https://developer.web3auth.io), whereas `chainConfig` contains following fields:-

- `chainNamespace` : It signifies the type of chain you want to initialize web3auth with, as we want to use `binance smart chain` which in an evm
  compatible chain, so we can set `eip155` as `chainNamespace`.

- `chainId`:- ChainId of the network that you want to use. For binance mainnet `0x38` is chainId and for testnet `0x61` is chainId

- `rpcTarget`:- By default both mainnet and testnet uses web3auth default rpc nodes urls, you can specify your own rpc url here.

- `displayName`:- Network name for displaying to user in wallet and confirmation screens.

- `blockExplorer`:- Link to blockchain's block explorer.

- `ticker`:- Native currency ticker for the chain. For ex: BNB

```ts
import { Web3Auth } from "@web3auth/web3auth";
import { CHAIN_NAMESPACES, CustomChainConfig } from "@web3auth/base";

const binanceChainConfig: CustomChainConfig = {
  chainNamespace: CHAIN_NAMESPACES.EIP155,
  rpcTarget: "https://data-seed-prebsc-2-s3.binance.org:8545",
  blockExplorer: "https://testnet.bscscan.com",
  chainId: "0x61",
  displayName: "Binance SmartChain Testnet",
  ticker: "BNB",
  tickerName: "BNB",
};

const web3auth = new Web3Auth({
  chainConfig: binanceChainConfig,
  clientId: "localhost-id", // get your clientId from https://developer.web3auth.io
});

await web3auth.initModal();
```

<SubscribeEvents />

<InstantiateWeb3Auth />

<CommonSdkFunctions />

## `Use the Web3Auth private key to derive StarkNet key pair`

After login, application will have access to the user's private key Web3Auth provider. We cannot use this key with starknet ec curve specific signing
functions, so we need to derive starknet compatible keys from Web3Auth.

In the code snippet below getStarkAccount function creates a HD account from web3auth's key. It will return hex encoded private key and uncompressed
stark public key.

You can pass account index to derive multiple keys deterministically from single web3auth's key.

```ts
import { ec as elliptic } from "elliptic";
import { grindKey, ec as starkEc } from "@toruslabs/starkware-crypto";
import StarkExAPI from "@starkware-industries/starkex-js/dist/browser";
import BN from "bn.js";

const getStarkAccount = async (): Promise<elliptic.KeyPair | undefined> => {
  if (!web3Auth) {
    console.log("web3auth not initialized yet");
    uiConsole("web3auth not initialized yet");
    return;
  }
  const starkEcOrder = starkEc.n;
  const provider = web3Auth.provider;
  if (!provider) {
    console.log("provider is null");
    uiConsole("provider is null");
    return;
  }

  // Get private key from Web3Auth provider
  const privKey = await provider.request({ method: "eth_private_key" });
  const account = starkEc.keyFromPrivate(grindKey(privKey as string, starkEcOrder as BN), "hex");
  return account;
};
```

Now we have a StarkNet account. We can generate starkKey from this and use on StarkEx transactions.

```ts
const getStarkKey = async (): Promise<string | undefined> => {
  const account = await getStarkAccount();
  return account?.getPrivate("hex");
};
```

<br />

## `Mint, Deposit, and Withdraw requests using StarkEx`.

Here are some of the interactions which you can do using StarkEx. You can find the full documentation of StarkEx API gateway here
https://starkware.co/StarkExRESTAPI/gateway.html and using StakEx-JS here https://github.com/starkware-libs/starkex-js.

```ts
import StarkExAPI from "@starkware-industries/starkex-js/dist/browser";

const starkExAPI = new StarkExAPI({
  endpoint: "https://gw.playground-v2.starkex.co",
});

const onMintRequest = async () => {
  const txId = await starkExAPI.gateway.getFirstUnusedTxId();
  const starkKey = await getStarkKey();

  const request = {
    txId,
    vaultId: 1654615998,
    amount: "6",
    tokenId: "0x400de4b5a92118719c78df48f4ff31e78de58575487ce1eaf19922ad9b8a714",
    starkKey: `0x${starkKey}`,
  };
  const response = await starkExAPI.gateway.mint(request);
  uiConsole({ response });
};

const onDepositRequest = async () => {
  const txId = await starkExAPI.gateway.getFirstUnusedTxId();
  const starkKey = await getStarkKey();
  const request = {
    txId,
    amount: 8,
    starkKey: `0x${starkKey}`,
    tokenId: "0x3ef811e040c4bc9f9eee715441cee470f5d5aff69b9cd9aca7884f5a442a890",
    vaultId: 1924014660,
  };
  const response = await starkExAPI.gateway.deposit(request);
  uiConsole({ response });
};

const onWithdrawalRequest = async () => {
  const txId = await starkExAPI.gateway.getFirstUnusedTxId();
  const starkKey = await getStarkKey();
  const request = {
    txId,
    amount: 8,
    starkKey: `0x${starkKey}`,
    tokenId: "0x2dd48fd7a024204f7c1bd874da5e709d4713d60c8a70639eb1167b367a9c378",
    vaultId: 612008755,
  };
  const response = await starkExAPI.gateway.withdrawal(request);
  uiConsole({ response });
};
```

<br />

## `Done`

You have completed this tutorial, you can refer to working code of this tutorial using ReactJS
[here](https://github.com/Web3Auth/Web3Auth/tree/master/examples/starkex-react-app).