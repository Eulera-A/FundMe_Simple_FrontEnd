import { ConnectButton } from "web3uikit"
import { useEffect, useState } from "react"
import { ethers } from "ethers"

export default function Header() {
    const [walletBalance, setWalletBalance] = useState("0")

    useEffect(() => {
        async function updateBalance() {
            if (typeof window.ethereum !== "undefined") {
                const provider = new ethers.providers.Web3Provider(window.ethereum)
                const signer = provider.getSigner()
                try {
                    const balance = await provider.getBalance(await signer.getAddress())
                    setWalletBalance(ethers.utils.formatEther(balance))
                } catch (err) {
                    console.error("Error fetching balance:", err)
                }
            }
        }

        updateBalance()
        // Optional: auto-update balance on new block
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        provider.on("block", updateBalance)

        return () => {
            provider.off("block", updateBalance)
        }
    }, [])

    return (
        <nav className="p-5 border-b-2 flex flex-row">
            <h1 className="py-4 px-4 font-bold text-3xl"> Eulera's Simple Fund Me App</h1>
            <div className="ml-auto py-2 px-4">
                <ConnectButton moralisAuth={false} key={walletBalance} />
            </div>
        </nav>
    )
}
