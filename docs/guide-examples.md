# Example

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