import Head from "next/head"
import styles from "../styles/Home.module.css"
//import ManualHeader from "../components/ManualHeader"
import Header from "../components/Header"
import FundMe from "../components/FundMe"
import { useMoralis } from "react-moralis"

///only work on these chains
const supportedChains = ["31337", "11155111"]

export default function Home() {
    const { isWeb3Enabled, chainId } = useMoralis()

    return (
        <div className={styles.container}>
            <Head>
                <title>Simple Smart Contract: Fund Me </title>
                <meta name="description" content="Eulera's Simple Fund Me app on Sepolia" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            Hello! & Welcome to This Demo - FundMe Dapp on Sepolia!
            <Header />
            {isWeb3Enabled ? (
                <div>
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
