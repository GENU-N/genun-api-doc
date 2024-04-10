# SDK Guide

## Install SDK

To integrate the GENU.N Open Platform SDK into your HTML page, you need to include the SDK script and its dependencies in the following order:

```html
<!-- Dependencies -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/axios/1.6.2/axios.min.js"></script>
<script src="https://cdn.genunuserdata.online/metamask-sdk-0.18.2.min.js"></script>
<script src="https://unpkg.com/@metamask/detect-provider/dist/detect-provider.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/ethers/6.9.1/ethers.umd.min.js"></script>

<!-- SDK -->
<script src="https://cdn.genunuserdata.online/token-gating-client-sdk.umd.1.2.1.min.js"></script>
```

## Init SDK

To initialize the SDK, create a new instance of `GENUN.TokenGatingClient` with your API domain and API key, as well as any additional configurations needed for your setup.

```javascript
const tokenGatingClient = new GENUN.TokenGatingClient({
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
```

## Customer Registration and Login With Wallet

**API Method:**
```javascript
async tokenGatingClient.auth.loginWithWallet({
    id,
    account,
    timestamp,
    signature,
    walletType,
});
```

**Parameters:**
- `id` (String): A version 4 UUID that must be unique and cannot be reused.
- `account` (String): The user's Ethereum account address.
- `timestamp` (Number): The current timestamp when the signature was generated.
- `signature` (String): The signature conforming to the EIP-712 standard, generated by wallet plugin such as MetaMask.
- `walletType` (Number): The type of wallet.

**Here are the `walletType` IDs for each supported wallet:**
```
WALLET_TYPE_IDs = {
    "MetaMask": 2,
    "WalletConnect": 3,
    "Web3Auth": 4,
    "TrustWallet": 5,
    "CoinbaseWallet": 6
}
```

**EIP-712 Signature Generation for Wallet Authentication:**

To authenticate using the `loginWithWallet` method, you must generate a signature that conforms to the EIP-712 standard. This involves creating a structured data object that the user's wallet will sign. The following JSON object defines the data structure required for the signature:

```
{
    "domain": {
        "name": "GENU.N Authentication",
        "version": "1.0",
        "verifyingContract": "0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC"
    },
    "primaryType": "Request",
    "types": {
        "Request": [
            { "name": "id", "type": "string" },
            { "name": "account", "type": "address" },
            { "name": "timestamp", "type": "uint256" }
        ]
    }
}
```

Steps for Generating the Signature:
1. **Generate a UUID**: Create a version 4 UUID to use as the `id`. This will serve as a unique identifier for the authentication request.
2. **Get the Wallet Address**: Retrieve the currently connected wallet address to use as the `account`.
3. **Create a Timestamp**: Generate the current time as a `Unix timestamp` to use as the `timestamp`.
4. **Submit for Signing**: Combine the `id`, `account`, and `timestamp` with the above EIP-712 data structure and submit it to the wallet plugin or service to generate the `signature`.
5. **Call `loginWithWallet`**: Use the `signature` along with the `id`, `account`, and `timestamp` as parameters to call the `loginWithWallet` method.


**Example:**
```javascript
const result = await tokenGatingClient.auth.loginWithWallet({
    id: 'uuid',
    account: '0xUSER_ACCOUNT_ADDRESS',
    timestamp: CURRENT_UNIX_TIMESTAMP,
    signature: 'SIGNATURE_FROM_WALLET',
    walletType: WALLET_TYPE_ID,
});
```

**Returns:**
```json
{
    "token": "JWT_TOKEN"
}
```

## List All Product Items

**API Method:**
```javascript
async tokenGatingClient.product.list({
    limit,
    page,
});
```

**Parameters:**
- `limit` (Number): The number of products per page.
- `page` (Number): The page number to retrieve.

**Example:**
```javascript
const result = await tokenGatingClient.product.list({
    limit: 10,
    page: 1,
});
```

**Returns:**
```json
{
    "data": [
        {
            "id": "PRODUCT_ID",
            "name": "PRODUCT_NAME",
            // Additional product details...
        },
        // More products...
    ],
    "limit": 10,
    "page": 1,
    "total": TOTAL_NUMBER_OF_PRODUCTS
}
```

## Get Product Item Details

**API Method:**
```javascript
async tokenGatingClient.product.detail(shopMerchandiseId);
```

**Parameters:**
- `shopMerchandiseId` (String): The unique identifier of the product.

**Example:**
```javascript
const result = await tokenGatingClient.product.detail('PRODUCT_ID');
```

**Returns:**
```json
{
    "id": "PRODUCT_ID",
    "name": "PRODUCT_NAME",
    // Additional product details...
}
```

## Item Authentication

**API Method:**
```javascript
async tokenGatingClient.identityAsset.authenticate(secureCode);
```

**Parameters:**
- `secureCode` (String): The secure code extracted from the QR code or Ntag.

**Example:**
```javascript
const secureCode = 'SECURE_CODE_FROM_QR';
const result = await tokenGatingClient.identityAsset.authenticate(secureCode);
```

**Returns:**
```json
{
    "shopMerchandiseSKUId": "ITEM_ID"
}
```

## Item and NFT Claiming

**API Method:**
```javascript
async tokenGatingClient.product.claimItem(shopMerchandiseSKUId);
```

**Parameters:**
- `shopMerchandiseSKUId` (String): The unique identifier of the product item to claim.

**Example:**
```javascript
const claimResponse = await tokenGatingClient.product.claimItem('ITEM_ID');
```

**Returns:**
- The same structure as the product detail response.

## List Customer Claimed Items

**API Method:**
```javascript
async tokenGatingClient.user.items({
    userId,
    limit,
    page,
});
```

**Parameters:**
- `userId` (String, optional): The unique identifier of the user, default is the id of current logged-in user.
- `limit` (Number): The number of items per page.
- `page` (Number): The page number to retrieve.

**Example:**
```javascript
const result = await tokenGatingClient.user.items({
    limit: 10,
    page: 1,
});
```

**Returns:**
```json
{
    "data": [
        {
            "shopMerchandiseSKU": {
                "id": "ITEM_ID",
                "SN": "SERIAL_NUMBER",
                // Additional item details...
            },
            // More items...
        }
    ],
    "limit": 10,
    "page": 1,
    "total": TOTAL_NUMBER_OF_ITEMS
}
```

## List Customer Claimed NFTs

**API Method:**
```javascript
async tokenGatingClient.user.nfts({
    userId,
    limit,
    page,
});
```

**Parameters:**
- `userId` (String, optional): The unique identifier of the user, default is the id of current logged-in user.
- `limit` (Number): The number of NFTs per page.
- `page` (Number): The page number to retrieve.

**Example:**
```javascript
const result = await tokenGatingClient.user.nfts({
    limit: 10,
    page: 1,
});
```

**Returns:**
```json
{
    "data": [
        {
            "bcNft": {
                "tokenId": "NFT_TOKEN_ID",
                "contractAddress": "CONTRACT_ADDRESS",
                // Additional NFT details...
            },
            // More NFTs...
        }
    ],
    "limit": 10,
    "page": 1,
    "total": TOTAL_NUMBER_OF_NFTS
}
```

## NFT Token Gating

**API Method:**
```javascript
async tokenGatingClient.gating.verify();
```

**Returns:**
```json
{
    "accessGranted": Boolean
}
```

**Example:**
```javascript
const result = await tokenGatingClient.gating.verify();
```