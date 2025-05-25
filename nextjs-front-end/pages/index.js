import Head from "next/head"
import styles from "../styles/Home.module.css"
import Header from "../components/Header"
import FundMe from "../components/FundMe"
import { useMoralis } from "react-moralis"
import { useEffect, useState } from "react"
import { ethers } from "ethers"
import networkNames from "../constants/networkNames.json"

const supportedChains = ["31337", "11155111"]

export default function Home() {
    const { isWeb3Enabled, chainId } = useMoralis()
    const [networkName, setNetworkName] = useState(null)
    const [hasWallet, setHasWallet] = useState(false) // default false

    useEffect(() => {
        if (typeof window === "undefined") return // SSR guard

        if (typeof window.ethereum !== "undefined") {
            setHasWallet(true)
            const provider = new ethers.providers.Web3Provider(window.ethereum)
            provider
                .getNetwork()
                .then((network) => {
                    const connectedNetworkName =
                        networkNames[network.chainId.toString()] || "Unknown Network"
                    setNetworkName(connectedNetworkName)
                })
                .catch((error) => {
                    console.error("Error fetching network:", error)
                    setHasWallet(false)
                })
        } else {
            setHasWallet(false)
        }
    }, [isWeb3Enabled, chainId])

    return (
        <div className={styles.container}>
            <Head>
                <title>Simple Smart Contract: Fund Me</title>
                <meta name="description" content="Eulera's Simple Fund Me DApp" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            {hasWallet && <Header />}
            <h1>Hello! & Welcome to This Demo - FundMe Dapp!</h1>

            {!hasWallet ? (
                <div>
                    🚫 No Web3 wallet detected. Please install MetaMask or another wallet
                    extension.
                </div>
            ) : !isWeb3Enabled ? (
                <div>Please connect to a Wallet</div>
            ) : (
                <div>
                    <p>
                        Your Wallet is connected to: <strong>{networkName || "Loading..."}</strong>
                    </p>
                    {supportedChains.includes(parseInt(chainId).toString()) ? (
                        <div className="flex flex-row">
                            <FundMe className="p-8" />
                        </div>
                    ) : (
                        <div>
                            Please switch to a supported chainId. Supported Chain Ids are:{" "}
                            {supportedChains.join(", ")}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
