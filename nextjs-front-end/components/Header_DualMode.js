import { useEffect, useState } from "react"
import { ethers } from "ethers"
import Link from "next/link"

export default function Header_DualMode() {
    const [walletBalance, setWalletBalance] = useState(null)
    const [account, setAccount] = useState(null)

    useEffect(() => {
        if (typeof window === "undefined") return
        if (!window.ethereum) return

        const provider = new ethers.providers.Web3Provider(window.ethereum)

        async function init() {
            try {
                const accounts = await provider.send("eth_accounts", [])
                if (accounts.length > 0) {
                    const signer = provider.getSigner()
                    const address = await signer.getAddress()
                    const balance = await provider.getBalance(address)

                    setAccount(address)
                    setWalletBalance(ethers.utils.formatEther(balance))
                }
            } catch (err) {
                console.error(err)
            }
        }

        init()
    }, [])

    async function connectWallet() {
        if (!window.ethereum) return alert("Please install MetaMask")

        const provider = new ethers.providers.Web3Provider(window.ethereum)
        await provider.send("eth_requestAccounts", [])

        const signer = provider.getSigner()
        const address = await signer.getAddress()
        const balance = await provider.getBalance(address)

        setAccount(address)
        setWalletBalance(ethers.utils.formatEther(balance))
    }

    return (
        <nav className="p-5 border-b-2 flex flex-row items-center">
            <h1 className="py-4 px-4 font-bold text-3xl">Eulera's Fund Me App</h1>

            {/* Web2 Link */}
            <Link href="/about">
                <span className="ml-6 cursor-pointer text-blue-600">About (No Wallet Needed)</span>
            </Link>

            <div className="ml-auto px-4">
                {account ? (
                    <div>
                        <div>Connected</div>
                        <div className="text-sm">
                            {account.slice(0, 6)}...
                            {account.slice(-4)}
                        </div>
                        <div className="text-sm">{parseFloat(walletBalance).toFixed(4)} ETH</div>
                    </div>
                ) : (
                    <button
                        onClick={connectWallet}
                        className="bg-blue-500 text-white px-4 py-2 rounded"
                    >
                        Connect Wallet
                    </button>
                )}
            </div>
        </nav>
    )
}
