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
                </Head>
                <body>
                    <script
                        dangerouslySetInnerHTML={{
                            __html: `
                                // Apply body class immediately to ensure preloaded images are used
                                // Check for light mode preference and apply appropriate class
                                const prefersLight = localStorage.getItem('isLight') === 'true';
                                document.body.classList.add(prefersLight ? 'bodylight' : 'body');
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
