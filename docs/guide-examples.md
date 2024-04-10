# Example

## Init SDK

Here is an example of how you might include the necessary dependencies and initialize the `TokenGatingClient` SDK in an HTML file:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Token Gating Client Initialization</title>

    <!-- Dependencies -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/axios/1.6.2/axios.min.js"></script>
    <script src="https://cdn.genunuserdata.online/metamask-sdk-0.18.2.min.js"></script>
    <script src="https://unpkg.com/@metamask/detect-provider/dist/detect-provider.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/ethers/6.9.1/ethers.umd.min.js"></script>

    <!-- SDK -->
    <script src="https://cdn.genunuserdata.online/token-gating-client-sdk.umd.1.2.1.min.js"></script>

    <script>
        // Ensure the DOM is fully loaded before attempting to initialize the SDK
        document.addEventListener('DOMContentLoaded', function() {
            // Initialize the TokenGatingClient with configuration options
            const tokenGatingClient = new GENUN.TokenGatingClient({
                domain: 'https://gating-open.genun.tech/',
                apiKey: 'D098rKb7jKBPGc...',
                debug: true,
                loginRequiredHook() {
                    // Handle the logic when the API returns that user
                    // authentication is required to access the API.
                    console.log('You need to log in to continue');
                },
                timeout: 10000,
            });

            // Additional logic to use the tokenGatingClient can be added here
        });
    </script>
</head>
<body>
    <h1>Welcome to Token Gating Client SDK Initialization</h1>
    <!-- Your HTML content goes here -->
</body>
</html>
```

In this HTML document:

- The dependencies for Axios, MetaMask SDK, MetaMask provider detector, and Ethers.js are included via `<script>` tags from CDNs. These are required for the SDK to function properly.
- Inside the `<script>` block, an event listener is added for the `DOMContentLoaded` event to ensure that the SDK initialization code runs only after the HTML document has been fully loaded.
- The `TokenGatingClient` is initialized inside this event listener with the necessary configuration.
- Replace `'https://gating-open.genun.tech/'` with your actual domain and `'D098rKb7jKBPGc...'` with your actual API key.
- After initialization, the `tokenGatingClient` variable is ready to be used to interact with the GENUN API.

Make sure to insert the actual `domain` and `apiKey` values that you have obtained from GENUN. The `loginRequiredHook` function should be customized to fit the authentication flow of your application, and you can then add additional JavaScript logic to interact with the SDK as needed.

## User Register/Login with Wallet

### MetaMask
To register or log in using a MetaMask wallet, you need to call the `loginWithWallet` method with the necessary parameters obtained from the MetaMask wallet.


**Example:**
```javascript
// get signature from MetaMask via GENUN.MetaMask
const metamask = new GENUN.MetaMask();
await metamask.initMetaMask();
const { id, account, timestamp, signature } = await metamask.getSignature();
await tokenGatingClient.auth.loginWithWallet({
    id,
    account,
    timestamp,
    signature,
    walletType: 2
});
```

### Web3Auth
The process for logging in with Web3Auth is similar to MetaMask, but you would typically have a different `walletType` to specify the use of Web3Auth.

**Example:**
```javascript
await tokenGatingClient.auth.loginWithWallet({
    id: '31dbc3cf-f823-49a7-8af7-e39147a4d5fb',
    account: '0x3414e4e06f5efb3b7eef3a1df57e2dbd7fa4d3d4',
    timestamp: 1712579492,
    signature: '0x47058405f3fe4ae2c1642696019d2818bc8a720baf66c49bbe6c75d6804feb7a16b01c9db326106cc07fb9b71cff90862b7c25e5aed19b6fe724bfc9cf4a52571c',
    walletType: 4,
});
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
    const { shopMerchandiseSKUId } = await tokenGatingClient.identityAsset.authenticate(secureCode);
    // ...
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
    const { shopMerchandiseSKUId } = await tokenGatingClient.identityAsset.authenticate(secureCode);
    // ...
}
```

## Item and NFT Claiming
To claim an item or NFT, use the `claimItem` method with the `shopMerchandiseSKUId` of the item you want to claim.

**Example:**
```javascript
// Get `shopMerchandiseSKUId` from `tokenGatingClient.identityAsset.authenticate()`
const claimResponse = await tokenGatingClient.product.claimItem(shopMerchandiseSKUId);
```

## Token Gating with NFT
To verify if a user has the necessary NFTs to access exclusive content, use the `gating.verify` method. This method will return a boolean indicating whether access is granted.

**Example:**
```javascript
const result = await tokenGatingClient.gating.verify();
```