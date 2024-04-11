# Example

## Init SDK

Here is an example of how you might include the necessary dependencies and initialize the `GENUNClient` SDK in an HTML file:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>GENU-N Client Initialization</title>

    <!-- Dependencies -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/axios/1.6.2/axios.min.js"></script>

    <!-- SDK -->
    <script src="https://cdn.genunuserdata.online/genun.sdk.umd.1.4.0.min.js"></script>

    <script>
        // Ensure the DOM is fully loaded before attempting to initialize the SDK
        document.addEventListener('DOMContentLoaded', function() {
            // Initialize the GENUNClient with configuration options
            const genunClient = new GENUNClient({
                domain: 'https://open.genun.tech/',
                apiKey: 'D098rKb7jKBPGc...',
                debug: true,
                loginRequiredHook() {
                    // Handle the logic when the API returns that user
                    // authentication is required to access the API.
                    console.log('You need to log in to continue');
                },
                timeout: 10000,
            });

            // Additional logic to use the genunClient can be added here
        });
    </script>
</head>
<body>
    <h1>Welcome to GENU-N Client SDK Initialization</h1>
    <!-- Your HTML content goes here -->
</body>
</html>
```

In this HTML document:

- The dependencies for Axios is included via `<script>` tags from CDN. These are required for the SDK to function properly.
- Inside the `<script>` block, an event listener is added for the `DOMContentLoaded` event to ensure that the SDK initialization code runs only after the HTML document has been fully loaded.
- The `GENUNClient` is initialized inside this event listener with the necessary configuration.
- Replace `'https://open.genun.tech/'` with your actual domain and `'D098rKb7jKBPGc...'` with your actual API key.
- After initialization, the `genunClient` variable is ready to be used to interact with the GENUN API.

Make sure to insert the actual `domain` and `apiKey` values that you have obtained from GENUN. The `loginRequiredHook` function should be customized to fit the authentication flow of your application, and you can then add additional JavaScript logic to interact with the SDK as needed.

## User Register/Login with Wallet

### MetaMask
To register or log in using a MetaMask wallet, you need to call the `loginWithWallet` method with the necessary parameters obtained from the MetaMask wallet.


**Example:**
```html
<!-- Load GENUNMetaMask SDK and its dependencies -->
<script src="https://cdn.genunuserdata.online/metamask-sdk-0.18.2.min.js"></script>
<script src="https://unpkg.com/@metamask/detect-provider/dist/detect-provider.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/ethers/6.9.1/ethers.umd.min.js"></script>
<script src="https://cdn.genunuserdata.online/genun.metamask.umd.1.4.0.min.js"></script>

<script>
    // Get the signature from MetaMask via GENUNMetaMask
    const metamask = new GENUNMetaMask();
    const loginViaMetaMask = async function () {
        await metamask.initMetaMask();
        const { id, account, timestamp, signature } = await metamask.getSignature();
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

### Web3Auth
The process for logging in with Web3Auth is similar to MetaMask, but you would typically have a different `walletType` to specify the use of Web3Auth.

**Example:**
```html
<!-- Load Web3Auth SDK and its dependencies -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/uuid/8.3.2/uuidv4.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/ethers/6.9.1/ethers.umd.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@web3auth/modal@7.3.1/dist/modal.umd.min.js"></script>

<script>
    const getSignatureFromWeb3Auth = async function ({
        appName, // Your application name
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
            appName: 'YourAppName',
            clientId: 'YourClientID',
            chainId: '0x1',
            rpcTarget: 'https://rpc.ankr.com/eth',
            web3AuthNetwork: 'sapphire_mainnet',
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