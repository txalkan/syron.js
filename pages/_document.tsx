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
                        name="Tyron Network"
                        content="TYRON open-source web application"
                    />
                    {/*
                    <link
                        rel="icon"
                        href="/ssi_tyron.png"
                        type="image/png"
                        sizes="32x32"
                    />
                    */}
                    <link
                        rel="icon"
                        href="/public/tyronssi.svg"
                        type="image/svg+xml"
                        sizes="33x33"
                    />
                    <meta name="title" content="Tyron Network" />
                    <meta
                        name="description"
                        content="Tyron SSI is a self-sovereign identity (SSI) protocol to own & control digital identities and DeFi assets with account abstraction (AA)."
                    />
                    <meta property="og:image" content="/public/tyronssi.svg" />
                    <meta property="og:title" content="Tyron Network" />
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
