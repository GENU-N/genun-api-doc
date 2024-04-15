# Examples

This document provides detailed examples of how to use the `@genun/client-sdk` in various environments, including plain HTML and React applications.

## Using the UMD Package in the Browser

To use the UMD package directly in the browser, include the script from the CDN and use the global `GENUNClient` object.

### HTML Setup

Include the SDK and dependencies in your HTML file:

```html
<!-- Dependencies -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/axios/1.6.2/axios.min.js"></script>

<!-- Include @genun/client-sdk from CDN -->
<script src="https://cdn.genunuserdata.online/genun-client-sdk.umd.1.5.3.min.js"></script>
```

### JavaScript Usage

After including the SDK script, you can instantiate and use the SDK like this:

```html
<script>
    // Create an instance of the SDK
    const genunClient = new GENUNClient({
        domain: 'API_DOMAIN',
        apiKey: 'YOUR_API_KEY',
        debug: true,
        loginRequiredHook() {
            // Handle the logic when the API returns that user
            // authentication is required to access the API.
            console.log('You need to log in to continue');
        },
        timeout: 10000,
    });

    // Example API call using the SDK
    genunClient.apiModule.apiMethod().then(response => {
        console.log('API call result:', response);
    }).catch(error => {
        console.error('API call error:', error);
    });
</script>
```

### HTML Sample

You can find a complete HTML sample [here](https://github.com/GENU-N/genun-client-sdk-js/tree/main/sample/html), which demonstrates how to integrate and use the `@genun/client-sdk` within a simple HTML page.


### User Register/Login with Wallet

#### MetaMask
To register or log in using a MetaMask wallet, you need to call the `loginWithWallet` method with the necessary parameters obtained from the MetaMask wallet.


**Example:**
```html
<!-- MetaMask SDK for connecting to the MetaMask Plugin -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/uuid/8.3.2/uuidv4.min.js"></script>
<script src="https://unpkg.com/@metamask/detect-provider/dist/detect-provider.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/ethers/6.9.1/ethers.umd.min.js"></script>

<script>
    const EIP712 = {
        domain: {
            name: 'GENU.N Authentication',
            version: '1.0',
            verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
        },
        primaryType: 'Request',
        types: {
            Request: [
                { name: 'id', type: 'string' },
                { name: 'account', type: 'address' },
                { name: 'timestamp', type: 'uint256' },
            ],
        },
    };

    // Get the signature from MetaMask
    const getSignatureFromMetaMask = async function () {
        const _ethereum = window.ethereum || await detectEthereumProvider();
        if (!_ethereum) {
            throw new Error('Please install MetaMask and create wallet in MetaMask!');
        }
        if (!_ethereum.isMetaMask) {
            throw new Error('Please install MetaMask or set MetaMask as the default wallet!');
        }

        const [address] = await _ethereum.request({ method: 'eth_requestAccounts', params: []  });
        const account = address.toLowerCase();

        const value = {
            id: uuidv4(),
            account,
            timestamp: Math.floor(+new Date() / 1000),
        };

        const message = ethers.TypedDataEncoder.getPayload(EIP712.domain, EIP712.types, value);

        const signature = await _ethereum.request({
            method: 'eth_signTypedData_v4',
            params: [
                account, JSON.stringify(message),
            ],
        });

        return {
            ...value,
            signature,
        }
    }

    const loginViaMetaMask = async function () {
        const { id, account, timestamp, signature } = await getSignatureFromMetaMask();
        const result = await genunClient.auth.loginWithWallet({
            id,
            account,
            timestamp,
            signature,
            walletType: 2
        });
    }
    loginViaMetaMask();
</script>
```

#### Web3Auth
The process for logging in with Web3Auth is similar to MetaMask, but you would typically have a different `walletType` to specify the use of Web3Auth.

**Example:**
```html
<!-- Load Web3Auth SDK and its dependencies -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/uuid/8.3.2/uuidv4.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/ethers/6.9.1/ethers.umd.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@web3auth/modal@7.3.1/dist/modal.umd.min.js"></script>

<script>
    const EIP712 = {
        domain: {
            name: 'GENU.N Authentication',
            version: '1.0',
            verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
        },
        primaryType: 'Request',
        types: {
            Request: [
                { name: 'id', type: 'string' },
                { name: 'account', type: 'address' },
                { name: 'timestamp', type: 'uint256' },
            ],
        },
    };

    const getSignatureFromWeb3Auth = async function ({
        clientId, // Your client ID from the Web3Auth project dashboard
        chainId, // Chain ID which you want to connect
        rpcTarget, // RPC Url for the chain
        web3AuthNetwork, // Web3Auth network
    }) {
        const web3auth = new Modal.Web3Auth({
            clientId: clientId,
            chainConfig: {
                chainNamespace: 'eip155',
                chainId,
                rpcTarget,
            },
            web3AuthNetwork,
        });
        await web3auth.initModal();
        const web3authProvider = await web3auth.connect();
        const provider = new ethers.BrowserProvider(web3authProvider);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        const account = address.toLowerCase();

        const dataToBeSigned = {
            id: uuidv4(),
            account,
            timestamp: Math.floor(Date.now() / 1000),
        }
        const message = ethers.TypedDataEncoder.getPayload(EIP712.domain, EIP712.types, dataToBeSigned);
        const params = [account, JSON.stringify(message)];
        const method = 'eth_signTypedData_v4';
        const signature = await signer.provider.send(method, params);
        // web3auth.logout()

        return {
            ...dataToBeSigned,
            signature,
        }
    }

    const loginViaWeb3Auth = async function () {
        const { id, account, timestamp, signature } = await getSignatureFromWeb3Auth({
            clientId: 'your_web3auth_client_id', // Obtain from your Web3Auth project
            chainId: 'your_preferred_chain_id', // Set to the chain ID of the blockchain you want to use
            rpcTarget: 'your_blockchain_rpc_url', // Set to the RPC URL of your preferred blockchain
            web3AuthNetwork: 'your_web3auth_network', // Obtain from your Web3Auth project
        })
        const result = await genunClient.auth.loginWithWallet({
            id,
            account,
            timestamp,
            signature,
            walletType: 4,
        });
    }

    loginViaWeb3Auth();
</script>
```


## Using the ESM Package with Module Bundlers

For modern JavaScript projects with module bundlers like Webpack, Rollup, or Parcel, you can import the SDK as an ES module.

### JavaScript Setup

First, import the SDK at the top of your JavaScript file:

```javascript
import GENUNClient from '@genun/client-sdk';
```

### JavaScript Usage

Then create an instance of the SDK and make API calls as follows:

```javascript
// Create an instance of the SDK
const genunClient = new GENUNClient({
    domain: 'API_DOMAIN',
    apiKey: 'YOUR_API_KEY',
    debug: true,
    loginRequiredHook() {
        // Handle the logic when the API returns that user
        // authentication is required to access the API.
        console.log('You need to log in to continue');
    },
    timeout: 10000,
});

// Example API call using the SDK
genunClient.apiModule.apiMethod().then(response => {
    console.log('API call result:', response);
}).catch(error => {
    console.error('API call error:', error);
});
```

### React Sample

For developers working with React, we provide a sample project demonstrating how to integrate the `@genun/client-sdk` into a React application.

You can access the React sample [here](https://github.com/GENU-N/genun-client-sdk-js/tree/main/sample/react). This example includes the setup of the SDK within a React component and illustrates the process of making API calls through the SDK in a React application context.


### User Register/Login with Wallet

#### MetaMask
To register or log in using a MetaMask wallet, you need to call the `loginWithWallet` method with the necessary parameters obtained from the MetaMask wallet.


**Example:**
```javascript
import { v4 as uuidv4 } from 'uuid';
import detectEthereumProvider from '@metamask/detect-provider';
import { ethers } from 'ethers';

const EIP712 = {
    domain: {
        name: 'GENU.N Authentication',
        version: '1.0',
        verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
    },
    primaryType: 'Request',
    types: {
        Request: [
            { name: 'id', type: 'string' },
            { name: 'account', type: 'address' },
            { name: 'timestamp', type: 'uint256' },
        ],
    },
};

// Get the signature from MetaMask
const getSignatureFromMetaMask = async function () {
    const _ethereum = window.ethereum || await detectEthereumProvider();
    if (!_ethereum) {
        throw new Error('Please install MetaMask and create wallet in MetaMask!');
    }
    if (!_ethereum.isMetaMask) {
        throw new Error('Please install MetaMask or set MetaMask as the default wallet!');
    }

    const [address] = await _ethereum.request({ method: 'eth_requestAccounts', params: []  });
    const account = address.toLowerCase();

    const value = {
        id: uuidv4(),
        account,
        timestamp: Math.floor(+new Date() / 1000),
    };

    const message = ethers.TypedDataEncoder.getPayload(EIP712.domain, EIP712.types, value);

    const signature = await _ethereum.request({
        method: 'eth_signTypedData_v4',
        params: [
            account, JSON.stringify(message),
        ],
    });

    return {
        ...value,
        signature,
    }
}

const loginViaMetaMask = async function () {
    const { id, account, timestamp, signature } = await getSignatureFromMetaMask();
    const result = await genunClient.auth.loginWithWallet({
        id,
        account,
        timestamp,
        signature,
        walletType: 2
    });
}
loginViaMetaMask();
```

#### Web3Auth
The process for logging in with Web3Auth is similar to MetaMask, but you would typically have a different `walletType` to specify the use of Web3Auth.

**HTML Setup:**

```html
<!--
    Load Web3Auth SDK and its dependencies
    Note: Web3Auth SDK should load via script tag in the HTML file, like this:
    <script src="https://cdn.jsdelivr.net/npm/@web3auth/modal@7.3.1/dist/modal.umd.min.js"></script>
    If not so, ethers can't sign the EIP-712 message through Web3Auth,
    at least in the version of Web3Auth 7.x.
-->
<script src="https://cdn.jsdelivr.net/npm/@web3auth/modal@7.3.1/dist/modal.umd.min.js"></script>
```

**Example:**

```javascript
import { v4 as uuidv4 } from 'uuid'
import { ethers } from 'ethers'

const EIP712 = {
    domain: {
        name: 'GENU.N Authentication',
        version: '1.0',
        verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
    },
    primaryType: 'Request',
    types: {
        Request: [
            { name: 'id', type: 'string' },
            { name: 'account', type: 'address' },
            { name: 'timestamp', type: 'uint256' },
        ],
    },
};

const getSignatureFromWeb3Auth = async function ({
    clientId,
    chainId,
    rpcTarget,
    web3AuthNetwork,
}) {
    const web3auth = new window.Modal.Web3Auth({
        clientId: clientId,
        chainConfig: {
            chainNamespace: 'eip155',
            chainId,
            rpcTarget,
        },
        web3AuthNetwork,
    });
    await web3auth.initModal();
    const web3authProvider = await web3auth.connect();
    const provider = new ethers.BrowserProvider(web3authProvider);
    const signer = await provider.getSigner();
    const address = await signer.getAddress();
    const account = address.toLowerCase();

    const value = {
        id: uuidv4(),
        account,
        timestamp: Math.floor(Date.now() / 1000),
    };

    const message = ethers.TypedDataEncoder.getPayload(EIP712.domain, EIP712.types, value);
    const params = [account, JSON.stringify(message)];
    const method = 'eth_signTypedData_v4';
    const signature = await signer.provider.send(method, params);
    // web3auth.logout();

    return {
        ...value,
        signature,
    }
}

const loginViaWeb3Auth = async function () {
    const { id, account, timestamp, signature } = await getSignatureFromWeb3Auth({
        clientId: 'your_web3auth_client_id', // Obtain from your Web3Auth project
        chainId: 'your_preferred_chain_id', // Set to the chain ID of the blockchain you want to use
        rpcTarget: 'your_blockchain_rpc_url', // Set to the RPC URL of your preferred blockchain
        web3AuthNetwork: 'your_web3auth_network', // Obtain from your Web3Auth project
    })
    const result = await genunClient.auth.loginWithWallet({
        id,
        account,
        timestamp,
        signature,
        walletType: 4,
    });
}

loginViaWeb3Auth();
```


## Item Authentication

### NTAG 424 Authentication
To authenticate an item with an NTAG 424 chip, extract the secure code from the NTAG and use the `identityAsset.authenticate` method.

**Example:**
```javascript
// Ntag link example: https://partner-domain.com/path/to/authentication?e=851B62AEDC58D9497AD42F80F280A0B0BFFA100A5A0D034EA7C834C1496B174EA6398F9E53EA2024
// Extract the secureCode from the NTAG link
const urlParams = new URLSearchParams(window.location.search);
const secureCode = params.get('e');
if (secureCode) {
    const { shopMerchandiseSKUId } = await genunClient.identityAsset.authenticate(secureCode);
    // Now you can load the item information using `shopMerchandiseSKUId`
    const itemDetail = await genunClient.product.itemDetail({
        shopMerchandiseSKUId,
    });
}
```

### QR Code Authentication
To authenticate an item using a QR code, scan the QR code to get the secure code and use the `identityAsset.authenticate` method.

**Example:**
```javascript
// QR Code link example: https://partner-domain.com/path/to/authentication?e=e488f838-2330-4f8c-86ff-8b10b7dc391e
// Extract the secureCode from the QR code
const urlParams = new URLSearchParams(window.location.search);
const secureCode = params.get('e');
if (secureCode) {
    const { shopMerchandiseSKUId } = await genunClient.identityAsset.authenticate(secureCode);
    const itemDetail = await genunClient.product.itemDetail({
        shopMerchandiseSKUId,
    });
}
```

## Item and NFT Claiming
To claim an item or NFT, use the `claimItem` method with the `shopMerchandiseSKUId` of the item you want to claim.

**Example:**
```javascript
// Get `shopMerchandiseSKUId` from `genunClient.identityAsset.authenticate()`
const claimResponse = await genunClient.product.claimItem(shopMerchandiseSKUId);
if (claimResponse) {
    // alert('You have successfully claimed the product item')
}
```

## Token Gating with NFT
To verify if a user has the necessary NFTs to access exclusive content, use the `gating.verify` method. This method will return a boolean indicating whether access is granted.

**Example:**
```javascript
const { accessGranted } = await genunClient.gating.verify();
if (accessGranted) {
    // The user is authorized and begins to load member-only content
} else {
    // The user does not have permission, operation terminated
}
```