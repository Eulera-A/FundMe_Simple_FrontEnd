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

    useEffect(() => {
        async function fetchNetworkName() {
            if (typeof window.ethereum !== "undefined") {
                const provider = new ethers.providers.Web3Provider(window.ethereum)
                const network_chainId = await (await provider.getNetwork()).chainId
                const connectedNetworkName =
                    networkNames[network_chainId.toString()] || "Unknown Network"

                console.log(`Connected to: ${connectedNetworkName}`)

                setNetworkName(connectedNetworkName)
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
            {isWeb3Enabled ? (
                <div>
                    <p>
                        Your Wallet is connected to: <strong>{networkName || "Loading..."}</strong>
                    </p>
                    {supportedChains.includes(parseInt(chainId).toString()) ? (
                        <div className="flex flex-row">
                            <FundMe className="p-8" />
                        </div>
                    ) : (
                        <div>{`Please switch to a supported chainId. The supported Chain Ids are: ${supportedChains}`}</div>
                    )}
                </div>
            ) : (
                <div>Please connect to a Wallet</div>
            )}
        </div>
        // 17:00:09
    )
}
