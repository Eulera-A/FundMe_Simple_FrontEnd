import Head from "next/head"
import styles from "../styles/Home.module.css"
import Header_DualMode from "../components/Header_DualMode"
import FundMe from "../components/FundMe_DualMode"
import { useEffect, useState } from "react"
import { ethers } from "ethers"
import networkNames from "../constants/networkNames.json"
import Link from "next/link"

const supportedChains = ["31337", "11155111"]

export default function Home() {
    const [networkName, setNetworkName] = useState(null)
    const [hasWallet, setHasWallet] = useState(false)
    const [isConnected, setIsConnected] = useState(false)
    const [chainId, setChainId] = useState(null)

    useEffect(() => {
        if (typeof window === "undefined") return
        if (!window.ethereum) {
            setHasWallet(false)
            return
        }

        setHasWallet(true)

        const provider = new ethers.providers.Web3Provider(
            window.ethereum,
            "any", // 👈 IMPORTANT
        )

        async function init() {
            try {
                const network = await provider.getNetwork()

                setChainId(network.chainId.toString())
                setNetworkName(networkNames[network.chainId.toString()] || "Unknown Network")

                const accounts = await provider.listAccounts()
                if (accounts.length > 0) {
                    setIsConnected(true)
                }
            } catch (error) {
                console.error("Network detection error:", error)
            }
        }

        init()

        // 👇 Handle chain switching safely
        provider.on("network", (newNetwork, oldNetwork) => {
            if (oldNetwork) {
                window.location.reload()
            }
        })
    }, [])

    return (
        <div className={styles.container}>
            <Head>
                <title>Simple Smart Contract: Fund Me</title>
                <meta name="description" content="Eulera's Simple Fund Me DApp" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <Header_DualMode />

            <h1>Hello! & Welcome to This Demo - FundMe Dapp!</h1>

            {/* Public page link (no wallet required) */}
            <div style={{ display: "flex", gap: "20px", marginTop: "30px" }}>
                <Link href="/PriceFeedPage">
                    <div
                        style={{
                            padding: "20px",
                            border: "1px solid #ccc",
                            borderRadius: "10px",
                            cursor: "pointer",
                            width: "250px",
                        }}
                    >
                        <h3>🔗 Chainlink Price Feed</h3>
                        <p>Read ETH/USD directly from blockchain</p>
                    </div>
                </Link>

                <Link href="/stocks">
                    <div
                        style={{
                            padding: "20px",
                            border: "1px solid #ccc",
                            borderRadius: "10px",
                            cursor: "pointer",
                            width: "250px",
                        }}
                    >
                        <h3>📈 Stock Market Data</h3>
                        <p>Live stock prices via Finnhub API</p>
                    </div>
                </Link>
            </div>

            {!hasWallet ? (
                <div>
                    🚫 No Web3 wallet detected. Please install MetaMask for Web3 Interactions.
                </div>
            ) : !isConnected ? (
                <div>Please connect to a Wallet</div>
            ) : (
                <div>
                    <p>
                        Your Wallet is connected to: <strong>{networkName || "Loading..."}</strong>
                    </p>

                    {supportedChains.includes(chainId) ? (
                        <div className="flex flex-row">
                            <FundMe className="p-8" />
                        </div>
                    ) : (
                        <div>
                            Please switch to a supported chain. Supported Chain Ids are:{" "}
                            {supportedChains.join(", ")}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
