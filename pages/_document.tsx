import Document, { Html, Head, Main, NextScript } from 'next/document'

class MyDocument extends Document {
    static async getInitialProps(ctx) {
        const initialProps = await Document.getInitialProps(ctx)
        return { ...initialProps }
    }

    render() {
        return (
            <Html>
                <Head>
                    <meta property="og:title" content="Tyron" />
                    <meta
                        property="og:description"
                        content="Web application of the Tyron Self-Sovereign Identity Protocol where you can manage a Web3 self-custodial account secured by social recovery."
                    />
                    <link
                        rel="icon"
                        href="/ssi_tyron.png"
                        type="image/png"
                        sizes="16x16"
                    />
                    {/* <link
                        rel="icon"
                        href="/tyronssi.svg"
                        type="image/svg+xml"
                        sizes="40x40"
                    /> */}
                    {/* <meta name="title" content="Tyron" /> */}
                    {/* <meta
                        name="description"
                        content="Tyron SSI is a self-sovereign identity (SSI) protocol to own & control digital identities and DeFi assets with account abstraction (AA)."
                    /> */}
                    <meta property="og:image" content="/tyronssi.svg" />
                </Head>
                <body>
                    <Main />
                    <NextScript />
                </body>
            </Html>
        )
    }
}

export default MyDocument
