import Head from "next/head"
import styles from "../styles/Home.module.css"
//import ManualHeader from "../components/ManualHeader"
import Header from "../components/Header"
import FundMe from "../components/FundMe"
import { useMoralis } from "react-moralis"
import PriceFeedCheck from "../components/PriceFeedCheck"
import { useEffect, useState } from "react"
import { ethers } from "ethers"
///only work on these chains
import networkNames from "../constants/networkNames.json"
const supportedChains = ["31337", "11155111"]

export default function Home() {
    const { isWeb3Enabled, chainId } = useMoralis()
    const [networkName, setNetworkName] = useState(null)
    const [hasWallet, setHasWallet] = useState(true)

    useEffect(() => {
        async function fetchNetworkName() {
            if (typeof window === "undefined") return // guard for SSR
            if (typeof window.ethereum === "undefined") {
                setHasWallet(false)
                return
            }

            try {
                const provider = new ethers.providers.Web3Provider(window.ethereum)
                const network = await provider.getNetwork()
                const connectedNetworkName =
                    networkNames[network.chainId.toString()] || "Unknown Network"
                setNetworkName(connectedNetworkName)
            } catch (error) {
                console.error("Error fetching network:", error)
                setHasWallet(false)
            }
        }

        if (isWeb3Enabled) {
            fetchNetworkName()
        }
    }, [isWeb3Enabled, chainId]) // re-run when user switches network

    return (
        <div className={styles.container}>
            <Head>
                <title>Simple Smart Contract: Fund Me </title>
                <meta name="description" content="Eulera's Simple Fund Me DApp" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <Header />
            Hello! & Welcome to This Demo - FundMe Dapp!
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
    ) // 17:00:09
}
