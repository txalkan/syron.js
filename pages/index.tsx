import type { NextPage } from 'next'
import Head from 'next/head'
import {Header, Footer} from '../src/components'

const Home: NextPage = () => {
  return (
    <div>
      <Head>
        <title>SSI Browser</title>
        <meta name="SSI Browser" content="Self-Sovereign Identity Browser" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div id="bg"></div>
      <div id="wrapper">
          <Header />
          <Footer />
      </div>
    </div>
  )
}

export default Home
