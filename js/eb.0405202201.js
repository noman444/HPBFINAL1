"use strict";

// Unpkg imports
const Web3Modal = window.Web3Modal.default;
const WalletConnectProvider = window.WalletConnectProvider.default;

// Web3modal instance
let web3Modal;

let web3;

// Chosen wallet provider given by the dialog window
let provider;

// Address of the selected account
let selectedAccount;

let currentBalance = 0;
let currentBalanceEther = 0;

let contract;

let abi = [{ "inputs": [{ "components": [{ "internalType": "string", "name": "name", "type": "string" }, { "internalType": "string", "name": "symbol", "type": "string" }, { "internalType": "address", "name": "owner", "type": "address" }, { "internalType": "uint256", "name": "maxSupply", "type": "uint256" }, { "internalType": "uint256", "name": "mintPrice", "type": "uint256" }, { "internalType": "uint256", "name": "tokensPerMint", "type": "uint256" }, { "internalType": "address payable", "name": "treasuryAddress", "type": "address" }], "internalType": "struct NFTCollection.DeploymentConfig", "name": "deploymentConfig", "type": "tuple" }, { "components": [{ "internalType": "string", "name": "baseURI", "type": "string" }, { "internalType": "bool", "name": "metadataUpdatable", "type": "bool" }, { "internalType": "uint256", "name": "publicMintStart", "type": "uint256" }, { "internalType": "uint256", "name": "presaleMintStart", "type": "uint256" }, { "internalType": "string", "name": "prerevealTokenURI", "type": "string" }, { "internalType": "bytes32", "name": "presaleMerkleRoot", "type": "bytes32" }, { "internalType": "uint256", "name": "royaltiesBps", "type": "uint256" }, { "internalType": "address", "name": "royaltiesAddress", "type": "address" }], "internalType": "struct NFTCollection.RuntimeConfig", "name": "runtimeConfig", "type": "tuple" }], "stateMutability": "nonpayable", "type": "constructor" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "owner", "type": "address" }, { "indexed": true, "internalType": "address", "name": "approved", "type": "address" }, { "indexed": true, "internalType": "uint256", "name": "tokenId", "type": "uint256" }], "name": "Approval", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "owner", "type": "address" }, { "indexed": true, "internalType": "address", "name": "operator", "type": "address" }, { "indexed": false, "internalType": "bool", "name": "approved", "type": "bool" }], "name": "ApprovalForAll", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "previousOwner", "type": "address" }, { "indexed": true, "internalType": "address", "name": "newOwner", "type": "address" }], "name": "OwnershipTransferred", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "bytes32", "name": "role", "type": "bytes32" }, { "indexed": true, "internalType": "bytes32", "name": "previousAdminRole", "type": "bytes32" }, { "indexed": true, "internalType": "bytes32", "name": "newAdminRole", "type": "bytes32" }], "name": "RoleAdminChanged", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "bytes32", "name": "role", "type": "bytes32" }, { "indexed": true, "internalType": "address", "name": "account", "type": "address" }, { "indexed": true, "internalType": "address", "name": "sender", "type": "address" }], "name": "RoleGranted", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "bytes32", "name": "role", "type": "bytes32" }, { "indexed": true, "internalType": "address", "name": "account", "type": "address" }, { "indexed": true, "internalType": "address", "name": "sender", "type": "address" }], "name": "RoleRevoked", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "from", "type": "address" }, { "indexed": true, "internalType": "address", "name": "to", "type": "address" }, { "indexed": true, "internalType": "uint256", "name": "tokenId", "type": "uint256" }], "name": "Transfer", "type": "event" }, { "inputs": [], "name": "ADMIN_ROLE", "outputs": [{ "internalType": "bytes32", "name": "", "type": "bytes32" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "DEFAULT_ADMIN_ROLE", "outputs": [{ "internalType": "bytes32", "name": "", "type": "bytes32" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "VERSION", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "to", "type": "address" }, { "internalType": "uint256", "name": "tokenId", "type": "uint256" }], "name": "approve", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "owner", "type": "address" }], "name": "balanceOf", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "baseURI", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "contractURI", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "tokenId", "type": "uint256" }], "name": "getApproved", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "getInfo", "outputs": [{ "components": [{ "internalType": "uint256", "name": "version", "type": "uint256" }, { "components": [{ "internalType": "string", "name": "name", "type": "string" }, { "internalType": "string", "name": "symbol", "type": "string" }, { "internalType": "address", "name": "owner", "type": "address" }, { "internalType": "uint256", "name": "maxSupply", "type": "uint256" }, { "internalType": "uint256", "name": "mintPrice", "type": "uint256" }, { "internalType": "uint256", "name": "tokensPerMint", "type": "uint256" }, { "internalType": "address payable", "name": "treasuryAddress", "type": "address" }], "internalType": "struct NFTCollection.DeploymentConfig", "name": "deploymentConfig", "type": "tuple" }, { "components": [{ "internalType": "string", "name": "baseURI", "type": "string" }, { "internalType": "bool", "name": "metadataUpdatable", "type": "bool" }, { "internalType": "uint256", "name": "publicMintStart", "type": "uint256" }, { "internalType": "uint256", "name": "presaleMintStart", "type": "uint256" }, { "internalType": "string", "name": "prerevealTokenURI", "type": "string" }, { "internalType": "bytes32", "name": "presaleMerkleRoot", "type": "bytes32" }, { "internalType": "uint256", "name": "royaltiesBps", "type": "uint256" }, { "internalType": "address", "name": "royaltiesAddress", "type": "address" }], "internalType": "struct NFTCollection.RuntimeConfig", "name": "runtimeConfig", "type": "tuple" }], "internalType": "struct NFTCollection.ContractInfo", "name": "info", "type": "tuple" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "bytes32", "name": "role", "type": "bytes32" }], "name": "getRoleAdmin", "outputs": [{ "internalType": "bytes32", "name": "", "type": "bytes32" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "bytes32", "name": "role", "type": "bytes32" }, { "internalType": "address", "name": "account", "type": "address" }], "name": "grantRole", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "bytes32", "name": "role", "type": "bytes32" }, { "internalType": "address", "name": "account", "type": "address" }], "name": "hasRole", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "components": [{ "internalType": "string", "name": "name", "type": "string" }, { "internalType": "string", "name": "symbol", "type": "string" }, { "internalType": "address", "name": "owner", "type": "address" }, { "internalType": "uint256", "name": "maxSupply", "type": "uint256" }, { "internalType": "uint256", "name": "mintPrice", "type": "uint256" }, { "internalType": "uint256", "name": "tokensPerMint", "type": "uint256" }, { "internalType": "address payable", "name": "treasuryAddress", "type": "address" }], "internalType": "struct NFTCollection.DeploymentConfig", "name": "deploymentConfig", "type": "tuple" }, { "components": [{ "internalType": "string", "name": "baseURI", "type": "string" }, { "internalType": "bool", "name": "metadataUpdatable", "type": "bool" }, { "internalType": "uint256", "name": "publicMintStart", "type": "uint256" }, { "internalType": "uint256", "name": "presaleMintStart", "type": "uint256" }, { "internalType": "string", "name": "prerevealTokenURI", "type": "string" }, { "internalType": "bytes32", "name": "presaleMerkleRoot", "type": "bytes32" }, { "internalType": "uint256", "name": "royaltiesBps", "type": "uint256" }, { "internalType": "address", "name": "royaltiesAddress", "type": "address" }], "internalType": "struct NFTCollection.RuntimeConfig", "name": "runtimeConfig", "type": "tuple" }], "name": "initialize", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "owner", "type": "address" }, { "internalType": "address", "name": "operator", "type": "address" }], "name": "isApprovedForAll", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "wallet", "type": "address" }, { "internalType": "bytes32[]", "name": "proof", "type": "bytes32[]" }], "name": "isWhitelisted", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "maxSupply", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "metadataUpdatable", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "mint", "outputs": [], "stateMutability": "payable", "type": "function" }, { "inputs": [], "name": "mintPrice", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "mintingActive", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "name", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "owner", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "tokenId", "type": "uint256" }], "name": "ownerOf", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "prerevealTokenURI", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "presaleActive", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "presaleMerkleRoot", "outputs": [{ "internalType": "bytes32", "name": "", "type": "bytes32" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "amount", "type": "uint256" }, { "internalType": "bytes32[]", "name": "proof", "type": "bytes32[]" }], "name": "presaleMint", "outputs": [], "stateMutability": "payable", "type": "function" }, { "inputs": [], "name": "presaleMintStart", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "publicMintStart", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "bytes32", "name": "role", "type": "bytes32" }, { "internalType": "address", "name": "account", "type": "address" }], "name": "renounceRole", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "bytes32", "name": "role", "type": "bytes32" }, { "internalType": "address", "name": "account", "type": "address" }], "name": "revokeRole", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }, { "internalType": "uint256", "name": "salePrice", "type": "uint256" }], "name": "royaltyInfo", "outputs": [{ "internalType": "address", "name": "receiver", "type": "address" }, { "internalType": "uint256", "name": "royaltyAmount", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "from", "type": "address" }, { "internalType": "address", "name": "to", "type": "address" }, { "internalType": "uint256", "name": "tokenId", "type": "uint256" }], "name": "safeTransferFrom", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "from", "type": "address" }, { "internalType": "address", "name": "to", "type": "address" }, { "internalType": "uint256", "name": "tokenId", "type": "uint256" }, { "internalType": "bytes", "name": "_data", "type": "bytes" }], "name": "safeTransferFrom", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "operator", "type": "address" }, { "internalType": "bool", "name": "approved", "type": "bool" }], "name": "setApprovalForAll", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "bytes4", "name": "interfaceId", "type": "bytes4" }], "name": "supportsInterface", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "symbol", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "tokenId", "type": "uint256" }], "name": "tokenURI", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "tokensPerMint", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "totalSupply", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "to", "type": "address" }], "name": "transferAdminRights", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "from", "type": "address" }, { "internalType": "address", "name": "to", "type": "address" }, { "internalType": "uint256", "name": "tokenId", "type": "uint256" }], "name": "transferFrom", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "newOwner", "type": "address" }], "name": "transferOwnership", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "treasuryAddress", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "components": [{ "internalType": "string", "name": "baseURI", "type": "string" }, { "internalType": "bool", "name": "metadataUpdatable", "type": "bool" }, { "internalType": "uint256", "name": "publicMintStart", "type": "uint256" }, { "internalType": "uint256", "name": "presaleMintStart", "type": "uint256" }, { "internalType": "string", "name": "prerevealTokenURI", "type": "string" }, { "internalType": "bytes32", "name": "presaleMerkleRoot", "type": "bytes32" }, { "internalType": "uint256", "name": "royaltiesBps", "type": "uint256" }, { "internalType": "address", "name": "royaltiesAddress", "type": "address" }], "internalType": "struct NFTCollection.RuntimeConfig", "name": "newConfig", "type": "tuple" }], "name": "updateConfig", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "withdrawFees", "outputs": [], "stateMutability": "nonpayable", "type": "function" }]

const walletConnectButton = document.getElementById("wallet-connect");
const walletConnectMobileButton = document.getElementById("wallet-connect-mobile");
const walletConnectButtonHolder = document.getElementById(
    "wallet-connect-holder"
);
const walletAddress = document.getElementById("wallet-address");
const walletAddressMobile = document.getElementById("wallet-address-mobile");
const statusPlaceholder = document.getElementById("status-placeholder");

const mintPanel = document.getElementById("mint-panel");
const mintOne = document.getElementById("mint-one");
const mintThree = document.getElementById("mint-three");
const mintFive = document.getElementById("mint-five");
const mintMany = document.getElementById("mint-many");

function init() {
    const providerOptions = {
        walletconnect: {
            package: WalletConnectProvider,
            options: {
                infuraId: "95bcdfba5bd944dfad7e2885e7a38933",
            },
        },
    };

    web3Modal = new Web3Modal({
        cacheProvider: false, // optional
        providerOptions, // required
        disableInjectedProvider: false, // optional. For MetaMask / Brave / Opera.
    });

    console.log("Web3Modal instance is", web3Modal);
}

async function afterConnection() {
    web3 = new Web3(provider);
    contract = new web3.eth.Contract(
        abi,
        "0x5fA245a0c4070F44F49fD9D2Af3ef98A00A6b435"
    );

    console.log("Web3 instance is", web3);

    // Get connected chain id from Polygon node
    const chainId = await web3.eth.getChainId();

    if (chainId != 1) {
        updateStatus("Your wallet must be connected to Polygon Mainnet.");
        alert("Your wallet must be connected to Polygon Mainnet.");
        return false;
    }

    const accounts = await web3.eth.getAccounts();

    selectedAccount = accounts[0];

    walletAddress.innerText =
        "Connected: " + obtainReadableAddress(selectedAccount);
    walletAddressMobile.innerText =
        "Connected: " + obtainReadableAddress(selectedAccount);

    web3.eth.getBalance(selectedAccount, function(err, result) {
        if (err) {
            // unable to obtain balance
            currentBalance = 0;
            currentBalanceEther = 0;
        } else {
            currentBalance = result;
            currentBalanceEther = parseFloat(web3.utils.fromWei(result, "Matic")).toFixed(3);
        }
    });

    // walletConnectButtonHolder.classList.add("hidden");
    walletConnectButton.classList.add("hidden");
    walletConnectMobileButton.classList.add("hidden");
    walletAddress.classList.remove("hidden");
    walletAddressMobile.classList.remove("hidden");
}

async function onMintOne() {
    doMint("mintOne", "4", 1);
}

async function onMintThree() {
    doMint("mintThree", "12", 1);
}

async function onMintFive() {
    doMint("mintFiveOrMore", "20", 5);
}

async function onMintMany() {
    let quantity = document.getElementById("counting").innerText;
    doMint("mintFiveOrMore", "4", quantity);
}

async function doMint(type, price, quantity = 1) {

    if (selectedAccount == undefined) {
        updateStatus("You must connect your wallet first.");
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
    }


    if (currentBalanceEther <= (price * quantity)) {
        updateStatus("You don't have enough funds in your wallet.");
        return;
    }

    let mintPrice = web3.utils.toWei(price, "matic");

    let nftMethod;
    if (quantity == 1) {
        nftMethod = contract.methods[type]();
    } else {
        nftMethod = contract.methods[type](quantity);
    }

    let options = {
        from: selectedAccount,
        value: mintPrice * quantity,
    };

    const methodGasEstimate = await nftMethod
        .estimateGas({
            from: selectedAccount,
            value: options.value,
        })
        .then((gas) => {
            return gas;
        })
        .catch((error) => {
            updateStatus("An error has occured. Minting inactive.");
            throw new Error(error.message);
        });

    await nftMethod
        .send(options, function(err, res) {
            if (err) {
                updateStatus("An error has occured. Your funds are untouched.");
                return;
            }
            console.log(res);
            return;
        })
        .on("transactionHash", function(hash) {
            updateStatus("The transaction is now processing...");
            window.open(`https://polygonscan.com/tx/${hash}`, "_blank");
        })
        .catch((error) => {
            updateStatus(error.message);
        });
}

/**
 * Connect wallet button pressed.
 */
async function onConnect() {
    try {
        provider = await web3Modal.connect();
    } catch (e) {
        updateStatus("Could not connect to wallet | " + e);
        console.log("Could not get a wallet connection", e);
        return;
    }

    provider.on("accountsChanged", (accounts) => {
        updateStatus("The account/wallet has changed.");
        alert("The account/wallet has changed.");
    });

    provider.on("chainChanged", (chainId) => {
        updateStatus("The chain has changed.");
        alert("The chain has changed.");
    });

    await afterConnection();
}

/**
 * Main entry point.
 */
window.addEventListener("load", async() => {
    init();

    document
        .querySelector("#wallet-connect")
        .addEventListener("click", onConnect);

    document
        .querySelector("#wallet-connect-mobile")
        .addEventListener("click", onConnect);

    if (mintOne) {
        mintOne.addEventListener("click", onMintOne);
    }

    if (mintThree) {
        mintThree.addEventListener("click", onMintThree);
    }

    if (mintFive) {
        mintFive.addEventListener("click", onMintFive);
    }

    if (mintMany) {
        mintMany.addEventListener("click", onMintMany);
    }
});

const obtainReadableAddress = (address) => {
    return address.substr(0, 5) + "..." + address.substr(38, 4);
};

const updateStatus = (message) => {
    statusPlaceholder.innerHTML = message;
    statusPlaceholder.classList.remove("hidden");

    setTimeout(() => {
        statusPlaceholder.classList.add("hidden");
    }, 5000);
};