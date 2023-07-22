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
                        name="TYRON"
                        content="Tyron Network open-source web application"
                    />
                    <link
                        rel="icon"
                        href="/ssi_tyron.png"
                        type="image/png"
                        sizes="32x32"
                    />
                    {/* <link rel="icon" href="/ssi_tyron.svg" type="image/svg+xml" /> */}
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
