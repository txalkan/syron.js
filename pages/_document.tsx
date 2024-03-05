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
                    <meta
                        name="Self-Sovereign Identity Protocol"
                        content="SSI Protocol's open-source web application"
                    />
                    <link
                        rel="icon"
                        href="/syron/ssi_syronUSD_iso.png"
                        type="image/png"
                        sizes="16x16"
                    />
                    {/* <link
                        rel="icon"
                        href="/tyronssi.svg"
                        type="image/svg+xml"
                        sizes="40x40"
                    /> */}
                    <meta
                        name="title"
                        content="Self-Sovereign Identity Protocol"
                    />
                    <meta
                        name="description"
                        content="₿e Your ₿ank: Use your bitcoin savings to mint SU$D without giving up control of your BTC"
                    />
                    <meta
                        property="og:image"
                        content="/syron/ssi_syronUSD_iso.svg"
                    />
                    <meta
                        property="og:title"
                        content="Self-Sovereign Identity Protocol"
                    />
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
