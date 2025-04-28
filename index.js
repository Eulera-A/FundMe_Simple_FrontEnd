import { ethers } from "./ethers-5.6.esm.min.js";
import { abi, contractAddress } from "./constants_localHost.js";

const connectButton = document.getElementById("connectButton");
const withdrawButton = document.getElementById("withdrawButton");
const fundButton = document.getElementById("fundButton");
const balanceButton = document.getElementById("balanceButton");
connectButton.onclick = connect;
withdrawButton.onclick = withdraw;
fundButton.onclick = fund;
balanceButton.onclick = getBalance;

async function connect() {
  if (typeof window.ethereum !== "undefined") {
    try {
      await ethereum.request({ method: "eth_requestAccounts" });
    } catch (error) {
      console.log(error);
    }
    connectButton.innerHTML = "Connected";
    const accounts = await ethereum.request({ method: "eth_accounts" });
    console.log(accounts);
  } else {
    connectButton.innerHTML = "Please install MetaMask";
  }
}

async function withdraw() {
  console.log(`Withdrawing...`);
  if (typeof window.ethereum !== "undefined") {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    const signerAddress = await signer.getAddress();
    console.log(`connected with sign address: ${signerAddress}`);

    const contract = new ethers.Contract(contractAddress, abi, signer);
    try {
      const transactionResponse = await contract.withdraw();
      await listenForTransactionMine(transactionResponse, provider);
      // await transactionResponse.wait(1)
    } catch (error) {
      console.log(error);
    }
  } else {
    withdrawButton.innerHTML = "Please install MetaMask";
  }
}

async function fund() {
  const ethAmount = document.getElementById("ethAmount").value;
  console.log(`Funding with ${ethAmount}...`);
  if (typeof window.ethereum !== "undefined") {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []); // Request accounts for Metamask

    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, abi, signer);
    const network = await provider.getNetwork();
    console.log("Connected to Chain ID:", network.chainId);
    try {
      const wei = ethers.utils.parseEther(ethAmount).toString();
      console.log(`Funding value in wei ${wei}`);
      const transactionResponse = await contract.fund({
        value: ethers.utils.parseEther("0.1"), //input ethAmount
      });
      await listenForTransactionMine(transactionResponse, provider);
    } catch (error) {
      console.log(error);
    }
  } else {
    fundButton.innerHTML = "Please install MetaMask";
  }
}

async function getBalance() {
  if (typeof window.ethereum !== "undefined") {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    try {
      const balance = await provider.getBalance(contractAddress);
      console.log(ethers.utils.formatEther(balance));
    } catch (error) {
      console.log(error);
    }
  } else {
    balanceButton.innerHTML = "Please install MetaMask";
  }
}

function listenForTransactionMine(transactionResponse, provider) {
  console.log(`Mining transaction with hash: ${transactionResponse.hash}`);

  return new Promise((resolve, reject) => {
    // Handle errors
    try {
      // Use provider.once to listen for the transaction receipt
      provider.once(transactionResponse.hash, (transactionReceipt) => {
        if (transactionReceipt.status === 1) {
          // Transaction was successful
          console.log(
            `Transaction confirmed with ${transactionReceipt.confirmations} confirmations.`
          );
          resolve(transactionReceipt); // resolve the promise with the transactionReceipt
        } else {
          // Transaction failed
          console.error("Transaction failed");
          reject(new Error("Transaction failed"));
        }
      });
    } catch (error) {
      // Handle any errors during the process
      console.error(
        "Error while listening for transaction confirmation:",
        error
      );
      reject(error);
    }
  });
}
