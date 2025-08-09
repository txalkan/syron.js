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
                    <link
                        rel="icon"
                        href="ssi_tyron.svg"
                        type="image/svg+xml"
                        sizes="16x16"
                    />
                    <meta name="title" content="TYRON" />
                    <meta
                        name="description"
                        content="Be Your Own ₿ank: Tyron builds sovereign identity solutions to unlock your financial freedom."
                    />
                    <meta property="og:image" content="ssi_tyron.png" />
                    <meta property="og:title" content="TYRON" />
                    <link
                        rel="preload"
                        as="image"
                        href="/images/lightning.jpg"
                        type="image/jpeg"
                    />
                    <link
                        rel="preload"
                        as="image"
                        href="/images/lightning_mobile.jpg"
                        type="image/jpeg"
                        media="(max-width: 576px)"
                    />
                    <link
                        rel="preload"
                        as="image"
                        href="/images/lightning.webp"
                        type="image/webp"
                        media="(supports: webp)"
                    />
                    <link
                        rel="preload"
                        as="image"
                        href="/images/lightning_mobile.webp"
                        type="image/webp"
                        media="(max-width: 576px) and (supports: webp)"
                    />
                </Head>
                <body>
                    <script
                        dangerouslySetInnerHTML={{
                            __html: `
                                // Apply body class immediately to ensure preloaded images are used
                                document.body.classList.add('body');
                            `,
                        }}
                    />
                    <Main />
                    <NextScript />
                </body>
            </Html>
        )
    }
}

export default MyDocument
