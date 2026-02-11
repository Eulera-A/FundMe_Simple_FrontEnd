"use client"
import { useEffect, useState } from "react"
import { ethers } from "ethers"
import { abi } from "../constants/constants_Sepolia.js"
import contractAddresses from "../constants/contractAddresses.json"
import PriceFeedCheck from "./PriceFeedCheck.jsx"

const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL // Alchemy/Infura

export default function FundMe() {
    const [ethAmount, setEthAmount] = useState("")
    const [contractBalance, setContractBalance] = useState("")
    const [contractAddress, setContractAddress] = useState(null)
    const [provider, setProvider] = useState(null)
    const [signer, setSigner] = useState(null)
    const [contract, setContract] = useState(null)
    const [account, setAccount] = useState(null)
    const [timeLeft, setTimeLeft] = useState(null)

    const isWeb3Available =
        typeof window !== "undefined" && typeof window.ethereum !== "undefined"

    // ------------------------
    // Initialize Providers
    // ------------------------
    useEffect(() => {
        async function init() {
            let readProvider = new ethers.providers.JsonRpcProvider(RPC_URL)
            setProvider(readProvider)

            if (isWeb3Available) {
                const web3Provider = new ethers.providers.Web3Provider(window.ethereum)
                const accounts = await web3Provider.send("eth_accounts", [])

                if (accounts.length > 0) {
                    const walletSigner = web3Provider.getSigner()
                    setSigner(walletSigner)
                    setAccount(accounts[0])
                    readProvider = web3Provider
                }
            }

            const network = await readProvider.getNetwork()
            const address =
                contractAddresses[network.chainId]?.[0] || null

            if (address) {
                setContractAddress(address)
                const fundMeContract = new ethers.Contract(
                    address,
                    abi,
                    readProvider
                )
                setContract(fundMeContract)
            }
        }

        init()
    }, [])

    // ------------------------
    // Connect Wallet
    // ------------------------
    async function connectWallet() {
        if (!isWeb3Available) {
            alert("Install MetaMask")
            return
        }

        const web3Provider = new ethers.providers.Web3Provider(window.ethereum)
        await web3Provider.send("eth_requestAccounts", [])
        const walletSigner = web3Provider.getSigner()
        const address = await walletSigner.getAddress()

        setSigner(walletSigner)
        setAccount(address)

        const writableContract = contract.connect(walletSigner)
        setContract(writableContract)
    }

    // ------------------------
    // Read Functions (Works in both modes)
    // ------------------------
    async function getBalance() {
        if (!contractAddress || !provider) return
        const balance = await provider.getBalance(contractAddress)
        setContractBalance(ethers.utils.formatEther(balance))
    }

    async function getTimeLeft() {
        if (!contract) return
        const seconds = await contract.timeLeft()
        setTimeLeft(seconds.toNumber())
    }

    useEffect(() => {
        if (!contract) return
        getBalance()
        getTimeLeft()
        const interval = setInterval(getTimeLeft, 1000)
        return () => clearInterval(interval)
    }, [contract])

    // ------------------------
    // Write Functions (Web3 Only)
    // ------------------------
    async function fund() {
        if (!signer) return alert("Connect wallet first")

        try {
            const tx = await contract.fund({
                value: ethers.utils.parseEther(ethAmount),
            })
            await tx.wait(1)
            getBalance()
        } catch (error) {
            console.error(error)
        }
    }

    async function withdraw() {
        if (!signer) return alert("Connect wallet first")

        try {
            const tx = await contract.withdrawFunds()
            await tx.wait(1)
            getBalance()
        } catch (error) {
            console.error(error)
        }
    }

    async function resetDeadline(days) {
        if (!signer) return alert("Connect wallet first")

        try {
            const tx = await contract.resetFundingDeadline(days)
            await tx.wait(1)
        } catch (error) {
            console.error(error)
        }
    }

    function formatTime(seconds) {
        const d = Math.floor(seconds / (3600 * 24))
        const h = Math.floor((seconds % (3600 * 24)) / 3600)
        const m = Math.floor((seconds % 3600) / 60)
        const s = seconds % 60
        return `${d}d ${h}h ${m}m ${s}s`
    }

    // ------------------------
    // UI
    // ------------------------
    return (
        <div className="p-6">
            <h2 className="text-xl font-bold">
                FundMe Contract: {contractAddress || "Loading..."}
            </h2>

            {/* Web3 Status */}
            {!isWeb3Available && (
                <p className="text-blue-600">
                    🔍 Read-only mode (no wallet detected)
                </p>
            )}

            {isWeb3Available && !account && (
                <button
                    onClick={connectWallet}
                    className="bg-blue-500 text-white px-4 py-2 rounded mt-3"
                >
                    Connect Wallet
                </button>
            )}

            {account && (
                <p className="text-green-600 mt-2">
                    Connected: {account.slice(0, 6)}...
                    {account.slice(-4)}
                </p>
            )}

            {/* Balance */}
            <div className="mt-4">
                <button
                    onClick={getBalance}
                    className="bg-gray-600 text-white px-3 py-2 rounded"
                >
                    Refresh Balance
                </button>

                {contractBalance && (
                    <p className="mt-2">
                        Contract Balance: {contractBalance} ETH
                    </p>
                )}
            </div>

            {/* Fund */}
            <div className="mt-6">
                <input
                    placeholder="Amount in ETH"
                    value={ethAmount}
                    onChange={(e) => setEthAmount(e.target.value)}
                    className="border px-3 py-2 mr-2"
                />
                <button
                    onClick={fund}
                    className="bg-green-500 text-white px-4 py-2 rounded"
                >
                    Fund
                </button>
            </div>

            {/* Withdraw */}
            <div className="mt-4">
                <button
                    onClick={withdraw}
                    className="bg-red-500 text-white px-4 py-2 rounded"
                >
                    Withdraw
                </button>
            </div>

            {/* Deadline */}
            {timeLeft !== null && (
                <p className="mt-6 text-blue-700 font-semibold">
                    ⏳ Time Left:{" "}
                    {timeLeft > 0 ? formatTime(timeLeft) : "Funding Closed"}
                </p>
            )}
        </div>
    )
}
