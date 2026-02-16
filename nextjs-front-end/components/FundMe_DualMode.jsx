"use client"
import { useEffect, useState } from "react"
import { ethers } from "ethers"
import { abi } from "../constants/constants_Sepolia.js"

export default function FundMe() {
    const [ethAmount, setEthAmount] = useState("")
    const [contractBalance, setContractBalance] = useState("")
    const [contractAddress, setContractAddress] = useState(null)
    const [signer, setSigner] = useState(null)
    const [contract, setContract] = useState(null)
    const [account, setAccount] = useState(null)
    const [timeLeft, setTimeLeft] = useState(null)

    const isWeb3Available =
        typeof window !== "undefined" && window.ethereum

    // ------------------------
    // READ MODE (API)
    // ------------------------
    async function loadContractData() {
        try {
            const response = await fetch("/api/fundme_read")
            const data = await response.json()

            if (!response.ok) throw new Error(data.error)

            setContractAddress(data.address)
            setContractBalance(data.balance)
            setTimeLeft(parseInt(data.timeLeft))
        } catch (error) {
            console.error("Read error:", error)
        }
    }

    useEffect(() => {
        loadContractData()

        const interval = setInterval(loadContractData, 10000)
        return () => clearInterval(interval)
    }, [])

    // ------------------------
    // CONNECT WALLET
    // ------------------------
    async function connectWallet() {
        if (!isWeb3Available) {
            alert("Install MetaMask")
            return
        }

        const web3Provider = new ethers.providers.Web3Provider(
            window.ethereum,
            "any"
        )

        await web3Provider.send("eth_requestAccounts", [])

        const walletSigner = web3Provider.getSigner()
        const address = await walletSigner.getAddress()

        setSigner(walletSigner)
        setAccount(address)

        const writableContract = new ethers.Contract(
            contractAddress,
            abi,
            walletSigner
        )

        setContract(writableContract)
    }

    // ------------------------
    // WRITE FUNCTIONS
    // ------------------------
    async function fund() {
        if (!contract) return alert("Connect wallet first")

        try {
            const tx = await contract.fund({
                value: ethers.utils.parseEther(ethAmount),
            })
            await tx.wait(1)
            loadContractData()
        } catch (error) {
            console.error(error)
        }
    }

    async function withdraw() {
        if (!contract) return alert("Connect wallet first")

        try {
            const tx = await contract.withdrawFunds()
            await tx.wait(1)
            loadContractData()
        } catch (error) {
            console.error(error)
        }
    }

    async function resetDeadline(days) {
        if (!contract) return alert("Connect wallet first")

        try {
            const tx = await contract.resetFundingDeadline(days)
            await tx.wait(1)
            loadContractData()
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

            <div className="mt-4">
                <p>Contract Balance: {contractBalance || "Loading..."} ETH</p>
            </div>

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

            <div className="mt-4">
                <button
                    onClick={withdraw}
                    className="bg-red-500 text-white px-4 py-2 rounded"
                >
                    Withdraw
                </button>
            </div>

            {timeLeft !== null && (
                <p className="mt-6 text-blue-700 font-semibold">
                    ⏳ Time Left:{" "}
                    {timeLeft > 0 ? formatTime(timeLeft) : "Funding Closed"}
                </p>
            )}
        </div>
    )
}
