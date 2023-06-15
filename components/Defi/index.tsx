import { useStore } from 'effector-react'
import { useSelector } from 'react-redux'
import { $doc } from '../../src/store/did-doc'
import { useRouter } from 'next/router'
import styles from './styles.module.scss'
import { RootState } from '../../src/app/reducers'
import { $resolvedInfo } from '../../src/store/resolvedInfo'
import { useState } from 'react'
import ThreeDots from '../Spinner/ThreeDots'

function Component() {
    const Router = useRouter()
    const resolvedInfo = useStore($resolvedInfo)
    const resolvedDomain = resolvedInfo?.user_domain

    const [loadingCard1, setLoadingCard1] = useState(false)
    const [loadingCard2, setLoadingCard2] = useState(false)
    const [loadingCard3, setLoadingCard3] = useState(false)
    // const doc = useStore($doc)
    // const controller = resolvedUsername?.controller
    // const zilAddr = useSelector((state: RootState) => state.modal.zilAddr)

    return (



        <div style={{ textAlign: 'center', marginTop: '100px' }}>
            {/* SWAP INTERFAZ     
    */}
            <div className="swap_contenedor_1">
                <div>
                    <div className="swap_contenedor_2">
                        <div className="swap_contenedor_3" style={{ width: "390px" }}>
                            <div className="swap_contenedor_4">
                                <h3>Settings</h3>
                                <span>
                                    <svg width="20" height="20" viewBox="0 0 26 26" fill="none">
                                        <path d="M1.68555 1.68652L24.313 24.3139" stroke="var(--primary-color)" stroke-width="2"></path>
                                        <path d="M1.6875 24.3135L24.3149 1.68606" stroke="var(--primary-color)" stroke-width="2"></path>
                                    </svg>
                                </span>
                            </div>
                            <div>
                                <div className="swap_settings_1">
                                    <div>
                                        <p>Slippage tolerance</p>
                                        <div className="swap_settings_2">
                                            <button>Auto</button>
                                            <label>
                                                <input type="number" value="3" />%
                                            </label>
                                        </div>
                                    </div>
                                    <br />
                                    <div>
                                        <p>Transaction deadline</p>
                                        <div className="swap_settings_2">
                                            <button>Auto</button>
                                            <label>
                                                <input type="number" value="10" />Blocks
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="swap_contenedor_2">
                        <div className="swap_contenedor_3" style={{ width: "400px" }}>
                            <div className="swap_contenedor_4">
                                <h3>Tokens</h3>
                                <span>
                                    <svg width="20" height="20" viewBox="0 0 26 26" fill="none">
                                        <path d="M1.68555 1.68652L24.313 24.3139" stroke="var(--primary-color)" stroke-width="2"></path>
                                        <path d="M1.6875 24.3135L24.3149 1.68606" stroke="var(--primary-color)" stroke-width="2"></path>
                                    </svg>
                                </span>
                            </div>
                            <div>
                                <div className="swap_tokens_1">
                                    <p className="swap_tokens_2">Please check the tokens before investment, check with Terms Of Services.</p>
                                </div>

                                <form className="tokens_lista">
                                    <input className="tokens_buscar" placeholder="Symbol" />
                                    <ul className="tokens_contenedor">
                                        <li className="tokens_card">
                                            <span className='estilo_span_1'>
                                                <span className='estilo_span_2'>
                                                    <img className='estilo_imagen_1' alt="" aria-hidden="true" src="data:image/svg+xml,%3csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20version=%271.1%27%20width=%2750%27%20height=%2750%27/%3e" />
                                                </span>
                                                <img className='estilo_imagen_2' alt="ZIL" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" decoding="async" data-nimg="intrinsic" />
                                                <noscript>
                                                    <img alt="ZIL" srcSet="/_next/image?url=https%3A%2F%2Fmeta.viewblock.io%2Fzilliqa.ZIL%2Flogo%3Ft%3Ddark&amp;w=64&amp;q=75 1x, /_next/image?url=https%3A%2F%2Fmeta.viewblock.io%2Fzilliqa.ZIL%2Flogo%3Ft%3Ddark&amp;w=128&amp;q=75 2x" src="/_next/image?url=https%3A%2F%2Fmeta.viewblock.io%2Fzilliqa.ZIL%2Flogo%3Ft%3Ddark&amp;w=128&amp;q=75" decoding="async" data-nimg="intrinsic"
                                                        // style="position:absolute;top:0;left:0;bottom:0;right:0;box-sizing:border-box;padding:0;border:none;margin:auto;display:block;width:0;height:0;min-width:100%;max-width:100%;min-height:100%;max-height:100%" 
                                                        loading="lazy" />
                                                </noscript>
                                            </span>
                                            <div className="tokens_contenedor_2">
                                                <p className="tokens_left">ZIL</p>
                                                <p className="tokens_right">Zilliqa</p>
                                            </div>
                                            <p></p>
                                        </li>
                                        <li className="tokens_card">
                                            <span className='estilo_span_1'>
                                                <span className='estilo_span_2'>
                                                    <img className='estilo_imagen_1' alt="" aria-hidden="true" src="data:image/svg+xml,%3csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20version=%271.1%27%20width=%2750%27%20height=%2750%27/%3e" />
                                                </span>
                                                <img className='estilo_imagen_2' alt="ZLP" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" decoding="async" data-nimg="intrinsic" />
                                                <noscript>
                                                    <img alt="ZLP" srcSet="/_next/image?url=https%3A%2F%2Fmeta.viewblock.io%2Fzilliqa.zil1l0g8u6f9g0fsvjuu74ctyla2hltefrdyt7k5f4%2Flogo%3Ft%3Ddark&amp;w=64&amp;q=75 1x, /_next/image?url=https%3A%2F%2Fmeta.viewblock.io%2Fzilliqa.zil1l0g8u6f9g0fsvjuu74ctyla2hltefrdyt7k5f4%2Flogo%3Ft%3Ddark&amp;w=128&amp;q=75 2x" src="/_next/image?url=https%3A%2F%2Fmeta.viewblock.io%2Fzilliqa.zil1l0g8u6f9g0fsvjuu74ctyla2hltefrdyt7k5f4%2Flogo%3Ft%3Ddark&amp;w=128&amp;q=75" decoding="async" data-nimg="intrinsic"
                                                        // style="position:absolute;top:0;left:0;bottom:0;right:0;box-sizing:border-box;padding:0;border:none;margin:auto;display:block;width:0;height:0;min-width:100%;max-width:100%;min-height:100%;max-height:100%" 
                                                        loading="lazy" />
                                                </noscript>
                                            </span>
                                            <div className="tokens_contenedor_2">
                                                <p className="tokens_left">ZLP</p>
                                                <p className="tokens_right">ZilPay wallet</p>
                                            </div>
                                            <p></p>
                                        </li>
                                        <li className="tokens_card">
                                            <span className='estilo_span_1'>
                                                <span className='estilo_span_2'>
                                                    <img className='estilo_imagen_1' alt="" aria-hidden="true" src="data:image/svg+xml,%3csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20version=%271.1%27%20width=%2750%27%20height=%2750%27/%3e" />
                                                </span>
                                                <img className='estilo_imagen_2' alt="gZIL" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" decoding="async" data-nimg="intrinsic" />
                                                <noscript>
                                                    <img alt="gZIL" srcSet="/_next/image?url=https%3A%2F%2Fmeta.viewblock.io%2Fzilliqa.zil14pzuzq6v6pmmmrfjhczywguu0e97djepxt8g3e%2Flogo%3Ft%3Ddark&amp;w=64&amp;q=75 1x, /_next/image?url=https%3A%2F%2Fmeta.viewblock.io%2Fzilliqa.zil14pzuzq6v6pmmmrfjhczywguu0e97djepxt8g3e%2Flogo%3Ft%3Ddark&amp;w=128&amp;q=75 2x" src="/_next/image?url=https%3A%2F%2Fmeta.viewblock.io%2Fzilliqa.zil14pzuzq6v6pmmmrfjhczywguu0e97djepxt8g3e%2Flogo%3Ft%3Ddark&amp;w=128&amp;q=75" decoding="async" data-nimg="intrinsic"
                                                        //style="position:absolute;top:0;left:0;bottom:0;right:0;box-sizing:border-box;padding:0;border:none;margin:auto;display:block;width:0;height:0;min-width:100%;max-width:100%;min-height:100%;max-height:100%" 
                                                        loading="lazy" />
                                                </noscript>
                                            </span>
                                            <div className="tokens_contenedor_2">
                                                <p className="tokens_left">gZIL</p>
                                                <p className="tokens_right">Governance ZIL</p>
                                            </div>
                                            <p></p>
                                        </li>
                                        <li className="tokens_card">
                                            <span className='estilo_span_1'>
                                                <span className='estilo_span_2'>
                                                    <img className='estilo_imagen_1' alt="" aria-hidden="true" src="data:image/svg+xml,%3csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20version=%271.1%27%20width=%2750%27%20height=%2750%27/%3e" />
                                                </span>
                                                <img className='estilo_imagen_2' alt="XSGD" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" decoding="async" data-nimg="intrinsic" />
                                                <noscript>
                                                    <img alt="XSGD" srcSet="/_next/image?url=https%3A%2F%2Fmeta.viewblock.io%2Fzilliqa.zil1zu72vac254htqpg3mtywdcfm84l3dfd9qzww8t%2Flogo%3Ft%3Ddark&amp;w=64&amp;q=75 1x, /_next/image?url=https%3A%2F%2Fmeta.viewblock.io%2Fzilliqa.zil1zu72vac254htqpg3mtywdcfm84l3dfd9qzww8t%2Flogo%3Ft%3Ddark&amp;w=128&amp;q=75 2x" src="/_next/image?url=https%3A%2F%2Fmeta.viewblock.io%2Fzilliqa.zil1zu72vac254htqpg3mtywdcfm84l3dfd9qzww8t%2Flogo%3Ft%3Ddark&amp;w=128&amp;q=75" decoding="async" data-nimg="intrinsic"
                                                        //style="position:absolute;top:0;left:0;bottom:0;right:0;box-sizing:border-box;padding:0;border:none;margin:auto;display:block;width:0;height:0;min-width:100%;max-width:100%;min-height:100%;max-height:100%" 
                                                        loading="lazy" />
                                                </noscript>
                                            </span>
                                            <div className="tokens_contenedor_2">
                                                <p className="tokens_left">XSGD</p>
                                                <p className="tokens_right">XSGD</p>
                                            </div>
                                            <p></p>
                                        </li>
                                        <li className="tokens_card">
                                            <span className='estilo_span_1'>
                                                <span className='estilo_span_2'>
                                                    <img className='estilo_imagen_1' alt="" aria-hidden="true" src="data:image/svg+xml,%3csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20version=%271.1%27%20width=%2750%27%20height=%2750%27/%3e" />
                                                </span>
                                                <img className='estilo_imagen_2' alt="zETH" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" decoding="async" data-nimg="intrinsic" />
                                                <noscript>
                                                    <img alt="zETH" srcSet="/_next/image?url=https%3A%2F%2Fmeta.viewblock.io%2Fzilliqa.zil19j33tapjje2xzng7svslnsjjjgge930jx0w09v%2Flogo%3Ft%3Ddark&amp;w=64&amp;q=75 1x, /_next/image?url=https%3A%2F%2Fmeta.viewblock.io%2Fzilliqa.zil19j33tapjje2xzng7svslnsjjjgge930jx0w09v%2Flogo%3Ft%3Ddark&amp;w=128&amp;q=75 2x" src="/_next/image?url=https%3A%2F%2Fmeta.viewblock.io%2Fzilliqa.zil19j33tapjje2xzng7svslnsjjjgge930jx0w09v%2Flogo%3Ft%3Ddark&amp;w=128&amp;q=75" decoding="async" data-nimg="intrinsic"
                                                        //style="position:absolute;top:0;left:0;bottom:0;right:0;box-sizing:border-box;padding:0;border:none;margin:auto;display:block;width:0;height:0;min-width:100%;max-width:100%;min-height:100%;max-height:100%" 
                                                        loading="lazy" />
                                                </noscript>
                                            </span>
                                            <div className="tokens_contenedor_2">
                                                <p className="tokens_left">zETH</p>
                                                <p className="tokens_right">Zilliqa-bridged ETH token</p>
                                            </div>
                                            <p></p>
                                        </li>
                                        <li className="tokens_card">
                                            <span className='estilo_span_1'>
                                                <span className='estilo_span_2'>
                                                    <img className='estilo_imagen_1' alt="" aria-hidden="true" src="data:image/svg+xml,%3csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20version=%271.1%27%20width=%2750%27%20height=%2750%27/%3e" />
                                                </span>
                                                <img className='estilo_imagen_2' alt="zUSDT" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" decoding="async" data-nimg="intrinsic" />
                                                <noscript>
                                                    <img alt="zUSDT" srcSet="/_next/image?url=https%3A%2F%2Fmeta.viewblock.io%2Fzilliqa.zil1sxx29cshups269ahh5qjffyr58mxjv9ft78jqy%2Flogo%3Ft%3Ddark&amp;w=64&amp;q=75 1x, /_next/image?url=https%3A%2F%2Fmeta.viewblock.io%2Fzilliqa.zil1sxx29cshups269ahh5qjffyr58mxjv9ft78jqy%2Flogo%3Ft%3Ddark&amp;w=128&amp;q=75 2x" src="/_next/image?url=https%3A%2F%2Fmeta.viewblock.io%2Fzilliqa.zil1sxx29cshups269ahh5qjffyr58mxjv9ft78jqy%2Flogo%3Ft%3Ddark&amp;w=128&amp;q=75" decoding="async" data-nimg="intrinsic"
                                                    // style="position:absolute;top:0;left:0;bottom:0;right:0;box-sizing:border-box;padding:0;border:none;margin:auto;display:block;width:0;height:0;min-width:100%;max-width:100%;min-height:100%;max-height:100%" loading="lazy" 
                                                    />
                                                </noscript>
                                            </span>
                                            <div className="tokens_contenedor_2">
                                                <p className="tokens_left">zUSDT</p>
                                                <p className="tokens_right">Zilliqa-bridged USDT token</p>
                                            </div>
                                            <p></p>
                                        </li>
                                        <li className="tokens_card">
                                            <span className='estilo_span_1'>
                                                <span className='estilo_span_2'>
                                                    <img className='estilo_imagen_1' alt="" aria-hidden="true" src="data:image/svg+xml,%3csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20version=%271.1%27%20width=%2750%27%20height=%2750%27/%3e" />
                                                </span>
                                                <img className='estilo_imagen_2' alt="ZPAINT" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" decoding="async" data-nimg="intrinsic" />
                                                <noscript>
                                                    <img alt="ZPAINT" srcSet="/_next/image?url=https%3A%2F%2Fmeta.viewblock.io%2Fzilliqa.zil1qldr63ds7yuspqcf02263y2lctmtqmr039vrht%2Flogo%3Ft%3Ddark&amp;w=64&amp;q=75 1x, /_next/image?url=https%3A%2F%2Fmeta.viewblock.io%2Fzilliqa.zil1qldr63ds7yuspqcf02263y2lctmtqmr039vrht%2Flogo%3Ft%3Ddark&amp;w=128&amp;q=75 2x" src="/_next/image?url=https%3A%2F%2Fmeta.viewblock.io%2Fzilliqa.zil1qldr63ds7yuspqcf02263y2lctmtqmr039vrht%2Flogo%3Ft%3Ddark&amp;w=128&amp;q=75" decoding="async" data-nimg="intrinsic"
                                                        // style="position:absolute;top:0;left:0;bottom:0;right:0;box-sizing:border-box;padding:0;border:none;margin:auto;display:block;width:0;height:0;min-width:100%;max-width:100%;min-height:100%;max-height:100%" 
                                                        loading="lazy" />
                                                </noscript>
                                            </span>
                                            <div className="tokens_contenedor_2">
                                                <p className="tokens_left">ZPAINT</p>
                                                <p className="tokens_right">ZilWall Paint</p>
                                            </div>
                                            <p></p>
                                        </li>
                                        <li className="tokens_card">
                                            <span className='estilo_span_1'>
                                                <span className='estilo_span_2'>
                                                    <img className='estilo_imagen_1' alt="" aria-hidden="true" src="data:image/svg+xml,%3csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20version=%271.1%27%20width=%2750%27%20height=%2750%27/%3e" />
                                                </span>
                                                <img className='estilo_imagen_2' alt="stZIL" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" decoding="async" data-nimg="intrinsic" />
                                                <noscript>
                                                    <img alt="stZIL" srcSet="/_next/image?url=https%3A%2F%2Fmeta.viewblock.io%2Fzilliqa.zil1umc54ly88xjw4599gtq860le0qvsuwuj72s246%2Flogo%3Ft%3Ddark&amp;w=64&amp;q=75 1x, /_next/image?url=https%3A%2F%2Fmeta.viewblock.io%2Fzilliqa.zil1umc54ly88xjw4599gtq860le0qvsuwuj72s246%2Flogo%3Ft%3Ddark&amp;w=128&amp;q=75 2x" src="/_next/image?url=https%3A%2F%2Fmeta.viewblock.io%2Fzilliqa.zil1umc54ly88xjw4599gtq860le0qvsuwuj72s246%2Flogo%3Ft%3Ddark&amp;w=128&amp;q=75" decoding="async" data-nimg="intrinsic"
                                                        // style="position:absolute;top:0;left:0;bottom:0;right:0;box-sizing:border-box;padding:0;border:none;margin:auto;display:block;width:0;height:0;min-width:100%;max-width:100%;min-height:100%;max-height:100%" 
                                                        loading="lazy" />
                                                </noscript>
                                            </span>
                                            <div className="tokens_contenedor_2">
                                                <p className="tokens_left">stZIL</p>
                                                <p className="tokens_right">StZIL</p>
                                            </div>
                                            <p></p>
                                        </li>
                                        <li className="tokens_card">
                                            <span className='estilo_span_1'>
                                                <span className='estilo_span_2'>
                                                    <img className='estilo_imagen_1' alt="" aria-hidden="true" src="data:image/svg+xml,%3csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20version=%271.1%27%20width=%2750%27%20height=%2750%27/%3e" />
                                                </span>
                                                <img className='estilo_imagen_2' alt="DMZ" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" decoding="async" data-nimg="intrinsic" />
                                                <noscript>
                                                    <img alt="DMZ" srcSet="/_next/image?url=https%3A%2F%2Fmeta.viewblock.io%2Fzilliqa.zil19lr3vlpm4lufu2q94mmjvdkvmx8wdwajuntzx2%2Flogo%3Ft%3Ddark&amp;w=64&amp;q=75 1x, /_next/image?url=https%3A%2F%2Fmeta.viewblock.io%2Fzilliqa.zil19lr3vlpm4lufu2q94mmjvdkvmx8wdwajuntzx2%2Flogo%3Ft%3Ddark&amp;w=128&amp;q=75 2x" src="/_next/image?url=https%3A%2F%2Fmeta.viewblock.io%2Fzilliqa.zil19lr3vlpm4lufu2q94mmjvdkvmx8wdwajuntzx2%2Flogo%3Ft%3Ddark&amp;w=128&amp;q=75" decoding="async" data-nimg="intrinsic"
                                                        // style="position:absolute;top:0;left:0;bottom:0;right:0;box-sizing:border-box;padding:0;border:none;margin:auto;display:block;width:0;height:0;min-width:100%;max-width:100%;min-height:100%;max-height:100%" 
                                                        loading="lazy" />
                                                </noscript>
                                            </span>
                                            <div className="tokens_contenedor_2">
                                                <p className="tokens_left">DMZ</p>
                                                <p className="tokens_right">DMZ</p>
                                            </div>
                                            <p></p>
                                        </li>
                                        <li className="tokens_card">
                                            <span className='estilo_span_1'>
                                                <span className='estilo_span_2'>
                                                    <img className='estilo_imagen_1' alt="" aria-hidden="true" src="data:image/svg+xml,%3csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20version=%271.1%27%20width=%2750%27%20height=%2750%27/%3e" />
                                                </span>
                                                <img className='estilo_imagen_2' alt="Huny" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" decoding="async" data-nimg="intrinsic" />
                                                <noscript>
                                                    <img alt="Huny" srcSet="/_next/image?url=https%3A%2F%2Fmeta.viewblock.io%2Fzilliqa.zil1m3m5jqqcaemtefnlk795qpw59daukra8prc43e%2Flogo%3Ft%3Ddark&amp;w=64&amp;q=75 1x, /_next/image?url=https%3A%2F%2Fmeta.viewblock.io%2Fzilliqa.zil1m3m5jqqcaemtefnlk795qpw59daukra8prc43e%2Flogo%3Ft%3Ddark&amp;w=128&amp;q=75 2x" src="/_next/image?url=https%3A%2F%2Fmeta.viewblock.io%2Fzilliqa.zil1m3m5jqqcaemtefnlk795qpw59daukra8prc43e%2Flogo%3Ft%3Ddark&amp;w=128&amp;q=75" decoding="async" data-nimg="intrinsic"
                                                        // style="position:absolute;top:0;left:0;bottom:0;right:0;box-sizing:border-box;padding:0;border:none;margin:auto;display:block;width:0;height:0;min-width:100%;max-width:100%;min-height:100%;max-height:100%" 
                                                        loading="lazy" />
                                                </noscript>
                                            </span>
                                            <div className="tokens_contenedor_2">
                                                <p className="tokens_left">Huny</p>
                                                <p className="tokens_right">Huny Token</p>
                                            </div>
                                            <p></p>
                                        </li>
                                        <li className="tokens_card">
                                            <span className='estilo_span_1'>
                                                <span className='estilo_span_2'>
                                                    <img className='estilo_imagen_1' alt="" aria-hidden="true" src="data:image/svg+xml,%3csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20version=%271.1%27%20width=%2750%27%20height=%2750%27/%3e" />
                                                </span>
                                                <img className='estilo_imagen_2' alt="ZWAP" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" decoding="async" data-nimg="intrinsic" />
                                                <noscript>
                                                    <img alt="ZWAP" srcSet="/_next/image?url=https%3A%2F%2Fmeta.viewblock.io%2Fzilliqa.zil1p5suryq6q647usxczale29cu3336hhp376c627%2Flogo%3Ft%3Ddark&amp;w=64&amp;q=75 1x, /_next/image?url=https%3A%2F%2Fmeta.viewblock.io%2Fzilliqa.zil1p5suryq6q647usxczale29cu3336hhp376c627%2Flogo%3Ft%3Ddark&amp;w=128&amp;q=75 2x" src="/_next/image?url=https%3A%2F%2Fmeta.viewblock.io%2Fzilliqa.zil1p5suryq6q647usxczale29cu3336hhp376c627%2Flogo%3Ft%3Ddark&amp;w=128&amp;q=75" decoding="async" data-nimg="intrinsic"
                                                        // style="position:absolute;top:0;left:0;bottom:0;right:0;box-sizing:border-box;padding:0;border:none;margin:auto;display:block;width:0;height:0;min-width:100%;max-width:100%;min-height:100%;max-height:100%" 
                                                        loading="lazy" />
                                                </noscript>
                                            </span>
                                            <div className="tokens_contenedor_2">
                                                <p className="tokens_left">ZWAP</p>
                                                <p className="tokens_right">Zilswap</p>
                                            </div>
                                            <p></p>
                                        </li>
                                        <li className="tokens_card">
                                            <span className='estilo_span_1'>
                                                <span className='estilo_span_2'>
                                                    <img className='estilo_imagen_1' alt="" aria-hidden="true" src="data:image/svg+xml,%3csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20version=%271.1%27%20width=%2750%27%20height=%2750%27/%3e" />
                                                </span>
                                                <img className='estilo_imagen_2' alt="BLOX" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" decoding="async" data-nimg="intrinsic" />
                                                <noscript>
                                                    <img alt="BLOX" srcSet="/_next/image?url=https%3A%2F%2Fmeta.viewblock.io%2Fzilliqa.zil1gf5vxndx44q6fn025fwdaajnrmgvngdzel0jzp%2Flogo%3Ft%3Ddark&amp;w=64&amp;q=75 1x, /_next/image?url=https%3A%2F%2Fmeta.viewblock.io%2Fzilliqa.zil1gf5vxndx44q6fn025fwdaajnrmgvngdzel0jzp%2Flogo%3Ft%3Ddark&amp;w=128&amp;q=75 2x" src="/_next/image?url=https%3A%2F%2Fmeta.viewblock.io%2Fzilliqa.zil1gf5vxndx44q6fn025fwdaajnrmgvngdzel0jzp%2Flogo%3Ft%3Ddark&amp;w=128&amp;q=75" decoding="async" data-nimg="intrinsic"
                                                        // style="position:absolute;top:0;left:0;bottom:0;right:0;box-sizing:border-box;padding:0;border:none;margin:auto;display:block;width:0;height:0;min-width:100%;max-width:100%;min-height:100%;max-height:100%" 
                                                        loading="lazy" />
                                                </noscript>
                                            </span>
                                            <div className="tokens_contenedor_2">
                                                <p className="tokens_left">BLOX</p>
                                                <p className="tokens_right">BLOX</p>
                                            </div>
                                            <p></p>
                                        </li>
                                        <li className="tokens_card">
                                            <span className='estilo_span_1'>
                                                <span className='estilo_span_2'>
                                                    <img className='estilo_imagen_1' alt="" aria-hidden="true" src="data:image/svg+xml,%3csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20version=%271.1%27%20width=%2750%27%20height=%2750%27/%3e" />
                                                </span>
                                                <img className='estilo_imagen_2' alt="SHARDS" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" decoding="async" data-nimg="intrinsic" />
                                                <noscript>
                                                    <img alt="SHARDS" srcSet="/_next/image?url=https%3A%2F%2Fmeta.viewblock.io%2Fzilliqa.zil14d6wwelssqumu6w9c6kaucz2r57z34cxuh96lf%2Flogo%3Ft%3Ddark&amp;w=64&amp;q=75 1x, /_next/image?url=https%3A%2F%2Fmeta.viewblock.io%2Fzilliqa.zil14d6wwelssqumu6w9c6kaucz2r57z34cxuh96lf%2Flogo%3Ft%3Ddark&amp;w=128&amp;q=75 2x" src="/_next/image?url=https%3A%2F%2Fmeta.viewblock.io%2Fzilliqa.zil14d6wwelssqumu6w9c6kaucz2r57z34cxuh96lf%2Flogo%3Ft%3Ddark&amp;w=128&amp;q=75" decoding="async" data-nimg="intrinsic"
                                                        // style="position:absolute;top:0;left:0;bottom:0;right:0;box-sizing:border-box;padding:0;border:none;margin:auto;display:block;width:0;height:0;min-width:100%;max-width:100%;min-height:100%;max-height:100%" 
                                                        loading="lazy" />
                                                </noscript>
                                            </span>
                                            <div className="tokens_contenedor_2">
                                                <p className="tokens_left">SHARDS</p>
                                                <p className="tokens_right">Shards</p>
                                            </div>
                                            <p></p>
                                        </li>
                                        <li className="tokens_card">
                                            <span className='estilo_span_1'>
                                                <span className='estilo_span_2'>
                                                    <img className='estilo_imagen_1' alt="" aria-hidden="true" src="data:image/svg+xml,%3csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20version=%271.1%27%20width=%2750%27%20height=%2750%27/%3e" />
                                                </span>
                                                <img className='estilo_imagen_2' alt="GARY" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" decoding="async" data-nimg="intrinsic" />
                                                <noscript>
                                                    <img alt="GARY" srcSet="/_next/image?url=https%3A%2F%2Fmeta.viewblock.io%2Fzilliqa.zil1w5hwupgc9rxyuyd742g2c9annwahugrx80fw9h%2Flogo%3Ft%3Ddark&amp;w=64&amp;q=75 1x, /_next/image?url=https%3A%2F%2Fmeta.viewblock.io%2Fzilliqa.zil1w5hwupgc9rxyuyd742g2c9annwahugrx80fw9h%2Flogo%3Ft%3Ddark&amp;w=128&amp;q=75 2x" src="/_next/image?url=https%3A%2F%2Fmeta.viewblock.io%2Fzilliqa.zil1w5hwupgc9rxyuyd742g2c9annwahugrx80fw9h%2Flogo%3Ft%3Ddark&amp;w=128&amp;q=75" decoding="async" data-nimg="intrinsic"
                                                        // style="position:absolute;top:0;left:0;bottom:0;right:0;box-sizing:border-box;padding:0;border:none;margin:auto;display:block;width:0;height:0;min-width:100%;max-width:100%;min-height:100%;max-height:100%" 
                                                        loading="lazy" />
                                                </noscript>
                                            </span>
                                            <div className="tokens_contenedor_2">
                                                <p className="tokens_left">GARY</p>
                                                <p className="tokens_right">The GARY Token</p>
                                            </div>
                                            <p></p>
                                        </li>
                                        <li className="tokens_card">
                                            <span className='estilo_span_1'>
                                                <span className='estilo_span_2'>
                                                    <img className='estilo_imagen_1' alt="" aria-hidden="true" src="data:image/svg+xml,%3csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20version=%271.1%27%20width=%2750%27%20height=%2750%27/%3e" />
                                                </span>
                                                <img className='estilo_imagen_2' alt="PORT" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" decoding="async" data-nimg="intrinsic" />
                                                <noscript>
                                                    <img alt="PORT" srcSet="/_next/image?url=https%3A%2F%2Fmeta.viewblock.io%2Fzilliqa.zil18f5rlhqz9vndw4w8p60d0n7vg3n9sqvta7n6t2%2Flogo%3Ft%3Ddark&amp;w=64&amp;q=75 1x, /_next/image?url=https%3A%2F%2Fmeta.viewblock.io%2Fzilliqa.zil18f5rlhqz9vndw4w8p60d0n7vg3n9sqvta7n6t2%2Flogo%3Ft%3Ddark&amp;w=128&amp;q=75 2x" src="/_next/image?url=https%3A%2F%2Fmeta.viewblock.io%2Fzilliqa.zil18f5rlhqz9vndw4w8p60d0n7vg3n9sqvta7n6t2%2Flogo%3Ft%3Ddark&amp;w=128&amp;q=75" decoding="async" data-nimg="intrinsic"
                                                        // style="position:absolute;top:0;left:0;bottom:0;right:0;box-sizing:border-box;padding:0;border:none;margin:auto;display:block;width:0;height:0;min-width:100%;max-width:100%;min-height:100%;max-height:100%" 
                                                        loading="lazy" />
                                                </noscript>
                                            </span>
                                            <div className="tokens_contenedor_2">
                                                <p className="tokens_left">PORT</p>
                                                <p className="tokens_right">Proof Of Receipt Token</p>
                                            </div>
                                            <p></p>
                                        </li>
                                        <li className="tokens_card">
                                            <span className='estilo_span_1'>
                                                <span className='estilo_span_2'>
                                                    <img className='estilo_imagen_1' alt="" aria-hidden="true" src="data:image/svg+xml,%3csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20version=%271.1%27%20width=%2750%27%20height=%2750%27/%3e" />
                                                </span>
                                                <img className='estilo_imagen_2' alt="Lunr" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" decoding="async" data-nimg="intrinsic" />
                                                <noscript>
                                                    <img alt="Lunr" srcSet="/_next/image?url=https%3A%2F%2Fmeta.viewblock.io%2Fzilliqa.zil1xxl6yp2twxvljdnn87g9fk7wykdrcv66xdy4rc%2Flogo%3Ft%3Ddark&amp;w=64&amp;q=75 1x, /_next/image?url=https%3A%2F%2Fmeta.viewblock.io%2Fzilliqa.zil1xxl6yp2twxvljdnn87g9fk7wykdrcv66xdy4rc%2Flogo%3Ft%3Ddark&amp;w=128&amp;q=75 2x" src="/_next/image?url=https%3A%2F%2Fmeta.viewblock.io%2Fzilliqa.zil1xxl6yp2twxvljdnn87g9fk7wykdrcv66xdy4rc%2Flogo%3Ft%3Ddark&amp;w=128&amp;q=75" decoding="async" data-nimg="intrinsic"
                                                        // style="position:absolute;top:0;left:0;bottom:0;right:0;box-sizing:border-box;padding:0;border:none;margin:auto;display:block;width:0;height:0;min-width:100%;max-width:100%;min-height:100%;max-height:100%" 
                                                        loading="lazy" />
                                                </noscript>
                                            </span>
                                            <div className="tokens_contenedor_2">
                                                <p className="tokens_left">Lunr</p>
                                                <p className="tokens_right">Lunr</p>
                                            </div>
                                            <p></p>
                                        </li>
                                        <li className="tokens_card">
                                            <span className='estilo_span_1'>
                                                <span className='estilo_span_2'>
                                                    <img className='estilo_imagen_1' alt="" aria-hidden="true" src="data:image/svg+xml,%3csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20version=%271.1%27%20width=%2750%27%20height=%2750%27/%3e" />
                                                </span>
                                                <img className='estilo_imagen_2' alt="DUCK" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" decoding="async" data-nimg="intrinsic" />
                                                <noscript>
                                                    <img alt="DUCK" srcSet="/_next/image?url=https%3A%2F%2Fmeta.viewblock.io%2Fzilliqa.zil1c6akv8k6dqaac7ft8ezk5gr2jtxrewfw8hc27d%2Flogo%3Ft%3Ddark&amp;w=64&amp;q=75 1x, /_next/image?url=https%3A%2F%2Fmeta.viewblock.io%2Fzilliqa.zil1c6akv8k6dqaac7ft8ezk5gr2jtxrewfw8hc27d%2Flogo%3Ft%3Ddark&amp;w=128&amp;q=75 2x" src="/_next/image?url=https%3A%2F%2Fmeta.viewblock.io%2Fzilliqa.zil1c6akv8k6dqaac7ft8ezk5gr2jtxrewfw8hc27d%2Flogo%3Ft%3Ddark&amp;w=128&amp;q=75" decoding="async" data-nimg="intrinsic"
                                                        // style="position:absolute;top:0;left:0;bottom:0;right:0;box-sizing:border-box;padding:0;border:none;margin:auto;display:block;width:0;height:0;min-width:100%;max-width:100%;min-height:100%;max-height:100%" 
                                                        loading="lazy" />
                                                </noscript>
                                            </span>
                                            <div className="tokens_contenedor_2">
                                                <p className="tokens_left">DUCK</p>
                                                <p className="tokens_right">DuckDuck</p>
                                            </div>
                                            <p></p>
                                        </li>
                                        <li className="tokens_card">
                                            <span className='estilo_span_1'>
                                                <span className='estilo_span_2'>
                                                    <img className='estilo_imagen_1' alt="" aria-hidden="true" src="data:image/svg+xml,%3csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20version=%271.1%27%20width=%2750%27%20height=%2750%27/%3e" />
                                                </span>
                                                <img className='estilo_imagen_2' alt="XCAD" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" decoding="async" data-nimg="intrinsic" />
                                                <noscript>
                                                    <img alt="XCAD" srcSet="/_next/image?url=https%3A%2F%2Fmeta.viewblock.io%2Fzilliqa.zil1z5l74hwy3pc3pr3gdh3nqju4jlyp0dzkhq2f5y%2Flogo%3Ft%3Ddark&amp;w=64&amp;q=75 1x, /_next/image?url=https%3A%2F%2Fmeta.viewblock.io%2Fzilliqa.zil1z5l74hwy3pc3pr3gdh3nqju4jlyp0dzkhq2f5y%2Flogo%3Ft%3Ddark&amp;w=128&amp;q=75 2x" src="/_next/image?url=https%3A%2F%2Fmeta.viewblock.io%2Fzilliqa.zil1z5l74hwy3pc3pr3gdh3nqju4jlyp0dzkhq2f5y%2Flogo%3Ft%3Ddark&amp;w=128&amp;q=75" decoding="async" data-nimg="intrinsic"
                                                        // style="position:absolute;top:0;left:0;bottom:0;right:0;box-sizing:border-box;padding:0;border:none;margin:auto;display:block;width:0;height:0;min-width:100%;max-width:100%;min-height:100%;max-height:100%" 
                                                        loading="lazy" />
                                                </noscript>
                                            </span>
                                            <div className="tokens_contenedor_2">
                                                <p className="tokens_left">XCAD</p>
                                                <p className="tokens_right">XCAD Network Token</p>
                                            </div>
                                            <p></p>
                                        </li>
                                        <li className="tokens_card">
                                            <span className='estilo_span_1'>
                                                <span className='estilo_span_2'>
                                                    <img className='estilo_imagen_1' alt="" aria-hidden="true" src="data:image/svg+xml,%3csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20version=%271.1%27%20width=%2750%27%20height=%2750%27/%3e" />
                                                </span>
                                                <img className='estilo_imagen_2' alt="ZILPEPE" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" decoding="async" data-nimg="intrinsic" />
                                                <noscript>
                                                    <img alt="ZILPEPE" srcSet="/_next/image?url=https%3A%2F%2Fmeta.viewblock.io%2Fzilliqa.zil1tyc45he8tp96tkyv2372le02tc0hch9p8cxws8%2Flogo%3Ft%3Ddark&amp;w=64&amp;q=75 1x, /_next/image?url=https%3A%2F%2Fmeta.viewblock.io%2Fzilliqa.zil1tyc45he8tp96tkyv2372le02tc0hch9p8cxws8%2Flogo%3Ft%3Ddark&amp;w=128&amp;q=75 2x" src="/_next/image?url=https%3A%2F%2Fmeta.viewblock.io%2Fzilliqa.zil1tyc45he8tp96tkyv2372le02tc0hch9p8cxws8%2Flogo%3Ft%3Ddark&amp;w=128&amp;q=75" decoding="async" data-nimg="intrinsic"
                                                        // style="position:absolute;top:0;left:0;bottom:0;right:0;box-sizing:border-box;padding:0;border:none;margin:auto;display:block;width:0;height:0;min-width:100%;max-width:100%;min-height:100%;max-height:100%" 
                                                        loading="lazy" />
                                                </noscript>
                                            </span>
                                            <div className="tokens_contenedor_2">
                                                <p className="tokens_left">ZILPEPE</p>
                                                <p className="tokens_right">ZilPepe</p>
                                            </div>
                                            <p></p>
                                        </li>
                                        <li className="tokens_card">
                                            <span className='estilo_span_1'>
                                                <span className='estilo_span_2'>
                                                    <img className='estilo_imagen_1' alt="" aria-hidden="true" src="data:image/svg+xml,%3csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20version=%271.1%27%20width=%2750%27%20height=%2750%27/%3e" />
                                                </span>
                                                <img className='estilo_imagen_2' alt="ZOGE" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" decoding="async" data-nimg="intrinsic" />
                                                <noscript>
                                                    <img alt="ZOGE" srcSet="/_next/image?url=https%3A%2F%2Fmeta.viewblock.io%2Fzilliqa.zil19zkpv4krrql0j4jtrqlfh7nt67r6gazxttnk5x%2Flogo%3Ft%3Ddark&amp;w=64&amp;q=75 1x, /_next/image?url=https%3A%2F%2Fmeta.viewblock.io%2Fzilliqa.zil19zkpv4krrql0j4jtrqlfh7nt67r6gazxttnk5x%2Flogo%3Ft%3Ddark&amp;w=128&amp;q=75 2x" src="/_next/image?url=https%3A%2F%2Fmeta.viewblock.io%2Fzilliqa.zil19zkpv4krrql0j4jtrqlfh7nt67r6gazxttnk5x%2Flogo%3Ft%3Ddark&amp;w=128&amp;q=75" decoding="async" data-nimg="intrinsic"
                                                        // style="position:absolute;top:0;left:0;bottom:0;right:0;box-sizing:border-box;padding:0;border:none;margin:auto;display:block;width:0;height:0;min-width:100%;max-width:100%;min-height:100%;max-height:100%" 
                                                        loading="lazy" />
                                                </noscript>
                                            </span>
                                            <div className="tokens_contenedor_2">
                                                <p className="tokens_left">ZOGE</p>
                                                <p className="tokens_right">Zoge Coin</p>
                                            </div>
                                            <p></p>
                                        </li>
                                    </ul>
                                </form>

                                <div className="tokens_include">
                                    <p>Import</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="swap_contenedor_2">
                        <div className="swap_contenedor_3" style={{ width: "400px" }}>
                            <div className="swap_contenedor_4">
                                <h3>Tokens</h3>
                                <span>
                                    <svg width="20" height="20" viewBox="0 0 26 26" fill="none">
                                        <path d="M1.68555 1.68652L24.313 24.3139" stroke="var(--primary-color)" stroke-width="2"></path>
                                        <path d="M1.6875 24.3135L24.3149 1.68606" stroke="var(--primary-color)" stroke-width="2"></path>
                                    </svg>
                                </span>
                            </div>
                            <div>
                                <div className="swap_tokens_1">
                                    <p className="swap_tokens_2">Please check the tokens before investment, check with Terms Of Services.</p>
                                </div>
                                <form className="tokens_lista">
                                    <input className="tokens_buscar" placeholder="Symbol" />
                                    <ul className="tokens_contenedor">
                                        <li className="tokens_card">
                                            <span className='estilo_span_1'>
                                                <span className='estilo_span_2' >
                                                    <img className='estilo_imagen_1' alt="" aria-hidden="true" src="data:image/svg+xml,%3csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20version=%271.1%27%20width=%2750%27%20height=%2750%27/%3e" />
                                                </span>
                                                <img className='estilo_imagen_2' alt="ZIL" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" decoding="async" data-nimg="intrinsic" />
                                                <noscript>
                                                    <img alt="ZIL" srcSet="/_next/image?url=https%3A%2F%2Fmeta.viewblock.io%2Fzilliqa.ZIL%2Flogo%3Ft%3Ddark&amp;w=64&amp;q=75 1x, /_next/image?url=https%3A%2F%2Fmeta.viewblock.io%2Fzilliqa.ZIL%2Flogo%3Ft%3Ddark&amp;w=128&amp;q=75 2x" src="/_next/image?url=https%3A%2F%2Fmeta.viewblock.io%2Fzilliqa.ZIL%2Flogo%3Ft%3Ddark&amp;w=128&amp;q=75" decoding="async" data-nimg="intrinsic"
                                                        // style="position:absolute;top:0;left:0;bottom:0;right:0;box-sizing:border-box;padding:0;border:none;margin:auto;display:block;width:0;height:0;min-width:100%;max-width:100%;min-height:100%;max-height:100%" 
                                                        loading="lazy" />
                                                </noscript>
                                            </span>
                                            <div className="tokens_contenedor_2">
                                                <p className="tokens_left">ZIL</p>
                                                <p className="tokens_right">Zilliqa</p>
                                            </div>
                                            <p></p>
                                        </li>
                                        <li className="tokens_card">
                                            <span className='estilo_span_1' >
                                                <span className='estilo_span_2'>
                                                    <img className='estilo_imagen_1' alt="" aria-hidden="true" src="data:image/svg+xml,%3csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20version=%271.1%27%20width=%2750%27%20height=%2750%27/%3e" />
                                                </span>
                                                <img className='estilo_imagen_2' alt="ZLP" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" decoding="async" data-nimg="intrinsic" />
                                                <noscript>
                                                    <img alt="ZLP" srcSet="/_next/image?url=https%3A%2F%2Fmeta.viewblock.io%2Fzilliqa.zil1l0g8u6f9g0fsvjuu74ctyla2hltefrdyt7k5f4%2Flogo%3Ft%3Ddark&amp;w=64&amp;q=75 1x, /_next/image?url=https%3A%2F%2Fmeta.viewblock.io%2Fzilliqa.zil1l0g8u6f9g0fsvjuu74ctyla2hltefrdyt7k5f4%2Flogo%3Ft%3Ddark&amp;w=128&amp;q=75 2x" src="/_next/image?url=https%3A%2F%2Fmeta.viewblock.io%2Fzilliqa.zil1l0g8u6f9g0fsvjuu74ctyla2hltefrdyt7k5f4%2Flogo%3Ft%3Ddark&amp;w=128&amp;q=75" decoding="async" data-nimg="intrinsic"
                                                        // style="position:absolute;top:0;left:0;bottom:0;right:0;box-sizing:border-box;padding:0;border:none;margin:auto;display:block;width:0;height:0;min-width:100%;max-width:100%;min-height:100%;max-height:100%" 
                                                        loading="lazy" />
                                                </noscript>
                                            </span>
                                            <div className="tokens_contenedor_2">
                                                <p className="tokens_left">ZLP</p>
                                                <p className="tokens_right">ZilPay wallet</p>
                                            </div>
                                            <p></p>
                                        </li>
                                        <li className="tokens_card">
                                            <span className='estilo_span_1'>
                                                <span className='estilo_span_2'>
                                                    <img className='estilo_imagen_1' alt="" aria-hidden="true" src="data:image/svg+xml,%3csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20version=%271.1%27%20width=%2750%27%20height=%2750%27/%3e" />
                                                </span>
                                                <img className='estilo_imagen_2' alt="gZIL" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" decoding="async" data-nimg="intrinsic" />
                                                <noscript>
                                                    <img alt="gZIL" srcSet="/_next/image?url=https%3A%2F%2Fmeta.viewblock.io%2Fzilliqa.zil14pzuzq6v6pmmmrfjhczywguu0e97djepxt8g3e%2Flogo%3Ft%3Ddark&amp;w=64&amp;q=75 1x, /_next/image?url=https%3A%2F%2Fmeta.viewblock.io%2Fzilliqa.zil14pzuzq6v6pmmmrfjhczywguu0e97djepxt8g3e%2Flogo%3Ft%3Ddark&amp;w=128&amp;q=75 2x" src="/_next/image?url=https%3A%2F%2Fmeta.viewblock.io%2Fzilliqa.zil14pzuzq6v6pmmmrfjhczywguu0e97djepxt8g3e%2Flogo%3Ft%3Ddark&amp;w=128&amp;q=75" decoding="async" data-nimg="intrinsic"
                                                        // style="position:absolute;top:0;left:0;bottom:0;right:0;box-sizing:border-box;padding:0;border:none;margin:auto;display:block;width:0;height:0;min-width:100%;max-width:100%;min-height:100%;max-height:100%" 
                                                        loading="lazy" />
                                                </noscript>
                                            </span>
                                            <div className="tokens_contenedor_2">
                                                <p className="tokens_left">gZIL</p>
                                                <p className="tokens_right">Governance ZIL</p>
                                            </div>
                                            <p></p>
                                        </li>
                                        <li className="tokens_card">
                                            <span className='estilo_span_1'>
                                                <span className='estilo_span_2' >
                                                    <img className='estilo_imagen_1' alt="" aria-hidden="true" src="data:image/svg+xml,%3csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20version=%271.1%27%20width=%2750%27%20height=%2750%27/%3e" />
                                                </span>
                                                <img className='estilo_imagen_2' alt="XSGD" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" decoding="async" data-nimg="intrinsic" />
                                                <noscript>
                                                    <img alt="XSGD" srcSet="/_next/image?url=https%3A%2F%2Fmeta.viewblock.io%2Fzilliqa.zil1zu72vac254htqpg3mtywdcfm84l3dfd9qzww8t%2Flogo%3Ft%3Ddark&amp;w=64&amp;q=75 1x, /_next/image?url=https%3A%2F%2Fmeta.viewblock.io%2Fzilliqa.zil1zu72vac254htqpg3mtywdcfm84l3dfd9qzww8t%2Flogo%3Ft%3Ddark&amp;w=128&amp;q=75 2x" src="/_next/image?url=https%3A%2F%2Fmeta.viewblock.io%2Fzilliqa.zil1zu72vac254htqpg3mtywdcfm84l3dfd9qzww8t%2Flogo%3Ft%3Ddark&amp;w=128&amp;q=75" decoding="async" data-nimg="intrinsic"
                                                        // style="position:absolute;top:0;left:0;bottom:0;right:0;box-sizing:border-box;padding:0;border:none;margin:auto;display:block;width:0;height:0;min-width:100%;max-width:100%;min-height:100%;max-height:100%" 
                                                        loading="lazy" />
                                                </noscript>
                                            </span>
                                            <div className="tokens_contenedor_2">
                                                <p className="tokens_left">XSGD</p>
                                                <p className="tokens_right">XSGD</p>
                                            </div>
                                            <p></p>
                                        </li>
                                        <li className="tokens_card">
                                            <span className='estilo_span_1'>
                                                <span className='estilo_span_2' >
                                                    <img className='estilo_imagen_1' alt="" aria-hidden="true" src="data:image/svg+xml,%3csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20version=%271.1%27%20width=%2750%27%20height=%2750%27/%3e" />
                                                </span>
                                                <img className='estilo_imagen_2' alt="zETH" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" decoding="async" data-nimg="intrinsic" />
                                                <noscript>
                                                    <img alt="zETH" srcSet="/_next/image?url=https%3A%2F%2Fmeta.viewblock.io%2Fzilliqa.zil19j33tapjje2xzng7svslnsjjjgge930jx0w09v%2Flogo%3Ft%3Ddark&amp;w=64&amp;q=75 1x, /_next/image?url=https%3A%2F%2Fmeta.viewblock.io%2Fzilliqa.zil19j33tapjje2xzng7svslnsjjjgge930jx0w09v%2Flogo%3Ft%3Ddark&amp;w=128&amp;q=75 2x" src="/_next/image?url=https%3A%2F%2Fmeta.viewblock.io%2Fzilliqa.zil19j33tapjje2xzng7svslnsjjjgge930jx0w09v%2Flogo%3Ft%3Ddark&amp;w=128&amp;q=75" decoding="async" data-nimg="intrinsic"
                                                        // style="position:absolute;top:0;left:0;bottom:0;right:0;box-sizing:border-box;padding:0;border:none;margin:auto;display:block;width:0;height:0;min-width:100%;max-width:100%;min-height:100%;max-height:100%" 
                                                        loading="lazy" />
                                                </noscript>
                                            </span>
                                            <div className="tokens_contenedor_2">
                                                <p className="tokens_left">zETH</p>
                                                <p className="tokens_right">Zilliqa-bridged ETH token</p>
                                            </div>
                                            <p></p>
                                        </li>
                                        <li className="tokens_card">
                                            <span className='estilo_span_1'>
                                                <span className='estilo_span_2' >
                                                    <img className='estilo_imagen_1' alt="" aria-hidden="true" src="data:image/svg+xml,%3csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20version=%271.1%27%20width=%2750%27%20height=%2750%27/%3e" />
                                                </span>
                                                <img className='estilo_imagen_2' alt="zUSDT" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" decoding="async" data-nimg="intrinsic" />
                                                <noscript>
                                                    <img alt="zUSDT" srcSet="/_next/image?url=https%3A%2F%2Fmeta.viewblock.io%2Fzilliqa.zil1sxx29cshups269ahh5qjffyr58mxjv9ft78jqy%2Flogo%3Ft%3Ddark&amp;w=64&amp;q=75 1x, /_next/image?url=https%3A%2F%2Fmeta.viewblock.io%2Fzilliqa.zil1sxx29cshups269ahh5qjffyr58mxjv9ft78jqy%2Flogo%3Ft%3Ddark&amp;w=128&amp;q=75 2x" src="/_next/image?url=https%3A%2F%2Fmeta.viewblock.io%2Fzilliqa.zil1sxx29cshups269ahh5qjffyr58mxjv9ft78jqy%2Flogo%3Ft%3Ddark&amp;w=128&amp;q=75" decoding="async" data-nimg="intrinsic"
                                                        // style="position:absolute;top:0;left:0;bottom:0;right:0;box-sizing:border-box;padding:0;border:none;margin:auto;display:block;width:0;height:0;min-width:100%;max-width:100%;min-height:100%;max-height:100%" 
                                                        loading="lazy" />
                                                </noscript>
                                            </span>
                                            <div className="tokens_contenedor_2">
                                                <p className="tokens_left">zUSDT</p>
                                                <p className="tokens_right">Zilliqa-bridged USDT token</p>
                                            </div>
                                            <p></p>
                                        </li>
                                        <li className="tokens_card">
                                            <span className='estilo_span_1' >
                                                <span className='estilo_span_2' >
                                                    <img className='estilo_imagen_1' alt="" aria-hidden="true" src="data:image/svg+xml,%3csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20version=%271.1%27%20width=%2750%27%20height=%2750%27/%3e" />
                                                </span>
                                                <img className='estilo_imagen_2' alt="ZPAINT" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" decoding="async" data-nimg="intrinsic" />
                                                <noscript>
                                                    <img alt="ZPAINT" srcSet="/_next/image?url=https%3A%2F%2Fmeta.viewblock.io%2Fzilliqa.zil1qldr63ds7yuspqcf02263y2lctmtqmr039vrht%2Flogo%3Ft%3Ddark&amp;w=64&amp;q=75 1x, /_next/image?url=https%3A%2F%2Fmeta.viewblock.io%2Fzilliqa.zil1qldr63ds7yuspqcf02263y2lctmtqmr039vrht%2Flogo%3Ft%3Ddark&amp;w=128&amp;q=75 2x" src="/_next/image?url=https%3A%2F%2Fmeta.viewblock.io%2Fzilliqa.zil1qldr63ds7yuspqcf02263y2lctmtqmr039vrht%2Flogo%3Ft%3Ddark&amp;w=128&amp;q=75" decoding="async" data-nimg="intrinsic"
                                                        // style="position:absolute;top:0;left:0;bottom:0;right:0;box-sizing:border-box;padding:0;border:none;margin:auto;display:block;width:0;height:0;min-width:100%;max-width:100%;min-height:100%;max-height:100%" 
                                                        loading="lazy" />
                                                </noscript>
                                            </span>
                                            <div className="tokens_contenedor_2">
                                                <p className="tokens_left">ZPAINT</p>
                                                <p className="tokens_right">ZilWall Paint</p>
                                            </div>
                                            <p></p>
                                        </li>
                                        <li className="tokens_card">
                                            <span className='estilo_span_1' >
                                                <span className='estilo_span_2' >
                                                    <img className='estilo_imagen_1' alt="" aria-hidden="true" src="data:image/svg+xml,%3csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20version=%271.1%27%20width=%2750%27%20height=%2750%27/%3e" />
                                                </span>
                                                <img className='estilo_imagen_2' alt="stZIL" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" decoding="async" data-nimg="intrinsic" />
                                                <noscript>
                                                    <img alt="stZIL" srcSet="/_next/image?url=https%3A%2F%2Fmeta.viewblock.io%2Fzilliqa.zil1umc54ly88xjw4599gtq860le0qvsuwuj72s246%2Flogo%3Ft%3Ddark&amp;w=64&amp;q=75 1x, /_next/image?url=https%3A%2F%2Fmeta.viewblock.io%2Fzilliqa.zil1umc54ly88xjw4599gtq860le0qvsuwuj72s246%2Flogo%3Ft%3Ddark&amp;w=128&amp;q=75 2x" src="/_next/image?url=https%3A%2F%2Fmeta.viewblock.io%2Fzilliqa.zil1umc54ly88xjw4599gtq860le0qvsuwuj72s246%2Flogo%3Ft%3Ddark&amp;w=128&amp;q=75" decoding="async" data-nimg="intrinsic"
                                                        // style="position:absolute;top:0;left:0;bottom:0;right:0;box-sizing:border-box;padding:0;border:none;margin:auto;display:block;width:0;height:0;min-width:100%;max-width:100%;min-height:100%;max-height:100%" 
                                                        loading="lazy" />
                                                </noscript>
                                            </span>
                                            <div className="tokens_contenedor_2">
                                                <p className="tokens_left">stZIL</p>
                                                <p className="tokens_right">StZIL</p>
                                            </div>
                                            <p></p>
                                        </li>
                                        <li className="tokens_card">
                                            <span className='estilo_span_1' >
                                                <span className='estilo_span_2' >
                                                    <img className='estilo_imagen_1' alt="" aria-hidden="true" src="data:image/svg+xml,%3csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20version=%271.1%27%20width=%2750%27%20height=%2750%27/%3e" />
                                                </span>
                                                <img className='estilo_imagen_2' alt="DMZ" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" decoding="async" data-nimg="intrinsic" />
                                                <noscript>
                                                    <img alt="DMZ" srcSet="/_next/image?url=https%3A%2F%2Fmeta.viewblock.io%2Fzilliqa.zil19lr3vlpm4lufu2q94mmjvdkvmx8wdwajuntzx2%2Flogo%3Ft%3Ddark&amp;w=64&amp;q=75 1x, /_next/image?url=https%3A%2F%2Fmeta.viewblock.io%2Fzilliqa.zil19lr3vlpm4lufu2q94mmjvdkvmx8wdwajuntzx2%2Flogo%3Ft%3Ddark&amp;w=128&amp;q=75 2x" src="/_next/image?url=https%3A%2F%2Fmeta.viewblock.io%2Fzilliqa.zil19lr3vlpm4lufu2q94mmjvdkvmx8wdwajuntzx2%2Flogo%3Ft%3Ddark&amp;w=128&amp;q=75" decoding="async" data-nimg="intrinsic"
                                                        // style="position:absolute;top:0;left:0;bottom:0;right:0;box-sizing:border-box;padding:0;border:none;margin:auto;display:block;width:0;height:0;min-width:100%;max-width:100%;min-height:100%;max-height:100%" 
                                                        loading="lazy" />
                                                </noscript>
                                            </span>
                                            <div className="tokens_contenedor_2">
                                                <p className="tokens_left">DMZ</p>
                                                <p className="tokens_right">DMZ</p>
                                            </div>
                                            <p></p>
                                        </li>
                                        <li className="tokens_card">
                                            <span className='estilo_span_1' >
                                                <span className='estilo_span_2' >
                                                    <img className='estilo_imagen_1' alt="" aria-hidden="true" src="data:image/svg+xml,%3csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20version=%271.1%27%20width=%2750%27%20height=%2750%27/%3e" />
                                                </span>
                                                <img className='estilo_imagen_2' alt="Huny" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" decoding="async" data-nimg="intrinsic" />
                                                <noscript>
                                                    <img alt="Huny" srcSet="/_next/image?url=https%3A%2F%2Fmeta.viewblock.io%2Fzilliqa.zil1m3m5jqqcaemtefnlk795qpw59daukra8prc43e%2Flogo%3Ft%3Ddark&amp;w=64&amp;q=75 1x, /_next/image?url=https%3A%2F%2Fmeta.viewblock.io%2Fzilliqa.zil1m3m5jqqcaemtefnlk795qpw59daukra8prc43e%2Flogo%3Ft%3Ddark&amp;w=128&amp;q=75 2x" src="/_next/image?url=https%3A%2F%2Fmeta.viewblock.io%2Fzilliqa.zil1m3m5jqqcaemtefnlk795qpw59daukra8prc43e%2Flogo%3Ft%3Ddark&amp;w=128&amp;q=75" decoding="async" data-nimg="intrinsic"
                                                        // style="position:absolute;top:0;left:0;bottom:0;right:0;box-sizing:border-box;padding:0;border:none;margin:auto;display:block;width:0;height:0;min-width:100%;max-width:100%;min-height:100%;max-height:100%" 
                                                        loading="lazy" />
                                                </noscript>
                                            </span>
                                            <div className="tokens_contenedor_2">
                                                <p className="tokens_left">Huny</p>
                                                <p className="tokens_right">Huny Token</p>
                                            </div>
                                            <p></p>
                                        </li>
                                        <li className="tokens_card">
                                            <span className='estilo_span_1' >
                                                <span className='estilo_span_2' >
                                                    <img className='estilo_imagen_1' alt="" aria-hidden="true" src="data:image/svg+xml,%3csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20version=%271.1%27%20width=%2750%27%20height=%2750%27/%3e" />
                                                </span>
                                                <img className='estilo_imagen_2' alt="ZWAP" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" decoding="async" data-nimg="intrinsic" />
                                                <noscript>
                                                    <img alt="ZWAP" srcSet="/_next/image?url=https%3A%2F%2Fmeta.viewblock.io%2Fzilliqa.zil1p5suryq6q647usxczale29cu3336hhp376c627%2Flogo%3Ft%3Ddark&amp;w=64&amp;q=75 1x, /_next/image?url=https%3A%2F%2Fmeta.viewblock.io%2Fzilliqa.zil1p5suryq6q647usxczale29cu3336hhp376c627%2Flogo%3Ft%3Ddark&amp;w=128&amp;q=75 2x" src="/_next/image?url=https%3A%2F%2Fmeta.viewblock.io%2Fzilliqa.zil1p5suryq6q647usxczale29cu3336hhp376c627%2Flogo%3Ft%3Ddark&amp;w=128&amp;q=75" decoding="async" data-nimg="intrinsic"
                                                        // style="position:absolute;top:0;left:0;bottom:0;right:0;box-sizing:border-box;padding:0;border:none;margin:auto;display:block;width:0;height:0;min-width:100%;max-width:100%;min-height:100%;max-height:100%" 
                                                        loading="lazy" />
                                                </noscript>
                                            </span>
                                            <div className="tokens_contenedor_2">
                                                <p className="tokens_left">ZWAP</p>
                                                <p className="tokens_right">Zilswap</p>
                                            </div>
                                            <p></p>
                                        </li>
                                        <li className="tokens_card">
                                            <span className='estilo_span_1'>
                                                <span className='estilo_span_2' >
                                                    <img className='estilo_imagen_1' alt="" aria-hidden="true" src="data:image/svg+xml,%3csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20version=%271.1%27%20width=%2750%27%20height=%2750%27/%3e" />
                                                </span>
                                                <img className='estilo_imagen_2' alt="BLOX" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" decoding="async" data-nimg="intrinsic" />
                                                <noscript>
                                                    <img alt="BLOX" srcSet="/_next/image?url=https%3A%2F%2Fmeta.viewblock.io%2Fzilliqa.zil1gf5vxndx44q6fn025fwdaajnrmgvngdzel0jzp%2Flogo%3Ft%3Ddark&amp;w=64&amp;q=75 1x, /_next/image?url=https%3A%2F%2Fmeta.viewblock.io%2Fzilliqa.zil1gf5vxndx44q6fn025fwdaajnrmgvngdzel0jzp%2Flogo%3Ft%3Ddark&amp;w=128&amp;q=75 2x" src="/_next/image?url=https%3A%2F%2Fmeta.viewblock.io%2Fzilliqa.zil1gf5vxndx44q6fn025fwdaajnrmgvngdzel0jzp%2Flogo%3Ft%3Ddark&amp;w=128&amp;q=75" decoding="async" data-nimg="intrinsic"
                                                        // style="position:absolute;top:0;left:0;bottom:0;right:0;box-sizing:border-box;padding:0;border:none;margin:auto;display:block;width:0;height:0;min-width:100%;max-width:100%;min-height:100%;max-height:100%" 
                                                        loading="lazy" />
                                                </noscript>
                                            </span>
                                            <div className="tokens_contenedor_2">
                                                <p className="tokens_left">BLOX</p>
                                                <p className="tokens_right">BLOX</p>
                                            </div>
                                            <p></p>
                                        </li>
                                        <li className="tokens_card">
                                            <span className='estilo_span_1'>
                                                <span className='estilo_span_2'>
                                                    <img className='estilo_imagen_1' alt="" aria-hidden="true" src="data:image/svg+xml,%3csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20version=%271.1%27%20width=%2750%27%20height=%2750%27/%3e" />
                                                </span>
                                                <img className='estilo_imagen_2' alt="SHARDS" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" decoding="async" data-nimg="intrinsic" />
                                                <noscript>
                                                    <img alt="SHARDS" srcSet="/_next/image?url=https%3A%2F%2Fmeta.viewblock.io%2Fzilliqa.zil14d6wwelssqumu6w9c6kaucz2r57z34cxuh96lf%2Flogo%3Ft%3Ddark&amp;w=64&amp;q=75 1x, /_next/image?url=https%3A%2F%2Fmeta.viewblock.io%2Fzilliqa.zil14d6wwelssqumu6w9c6kaucz2r57z34cxuh96lf%2Flogo%3Ft%3Ddark&amp;w=128&amp;q=75 2x" src="/_next/image?url=https%3A%2F%2Fmeta.viewblock.io%2Fzilliqa.zil14d6wwelssqumu6w9c6kaucz2r57z34cxuh96lf%2Flogo%3Ft%3Ddark&amp;w=128&amp;q=75" decoding="async" data-nimg="intrinsic"
                                                        // style="position:absolute;top:0;left:0;bottom:0;right:0;box-sizing:border-box;padding:0;border:none;margin:auto;display:block;width:0;height:0;min-width:100%;max-width:100%;min-height:100%;max-height:100%" 
                                                        loading="lazy" />
                                                </noscript>
                                            </span>
                                            <div className="tokens_contenedor_2">
                                                <p className="tokens_left">SHARDS</p>
                                                <p className="tokens_right">Shards</p>
                                            </div>
                                            <p></p>
                                        </li>
                                        <li className="tokens_card">
                                            <span className='estilo_span_1' >
                                                <span className='estilo_span_2'>
                                                    <img className='estilo_imagen_1' alt="" aria-hidden="true" src="data:image/svg+xml,%3csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20version=%271.1%27%20width=%2750%27%20height=%2750%27/%3e" />
                                                </span>
                                                <img className='estilo_imagen_2' alt="GARY" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" decoding="async" data-nimg="intrinsic" />
                                                <noscript>
                                                    <img alt="GARY" srcSet="/_next/image?url=https%3A%2F%2Fmeta.viewblock.io%2Fzilliqa.zil1w5hwupgc9rxyuyd742g2c9annwahugrx80fw9h%2Flogo%3Ft%3Ddark&amp;w=64&amp;q=75 1x, /_next/image?url=https%3A%2F%2Fmeta.viewblock.io%2Fzilliqa.zil1w5hwupgc9rxyuyd742g2c9annwahugrx80fw9h%2Flogo%3Ft%3Ddark&amp;w=128&amp;q=75 2x" src="/_next/image?url=https%3A%2F%2Fmeta.viewblock.io%2Fzilliqa.zil1w5hwupgc9rxyuyd742g2c9annwahugrx80fw9h%2Flogo%3Ft%3Ddark&amp;w=128&amp;q=75" decoding="async" data-nimg="intrinsic"
                                                        // style="position:absolute;top:0;left:0;bottom:0;right:0;box-sizing:border-box;padding:0;border:none;margin:auto;display:block;width:0;height:0;min-width:100%;max-width:100%;min-height:100%;max-height:100%" 
                                                        loading="lazy" />
                                                </noscript>
                                            </span>
                                            <div className="tokens_contenedor_2">
                                                <p className="tokens_left">GARY</p>
                                                <p className="tokens_right">The GARY Token</p>
                                            </div>
                                            <p></p>
                                        </li>
                                        <li className="tokens_card">
                                            <span className='estilo_span_1' >
                                                <span className='estilo_span_2' >
                                                    <img className='estilo_imagen_1' alt="" aria-hidden="true" src="data:image/svg+xml,%3csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20version=%271.1%27%20width=%2750%27%20height=%2750%27/%3e" />
                                                </span>
                                                <img className='estilo_imagen_2' alt="PORT" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" decoding="async" data-nimg="intrinsic" />
                                                <noscript>
                                                    <img alt="PORT" srcSet="/_next/image?url=https%3A%2F%2Fmeta.viewblock.io%2Fzilliqa.zil18f5rlhqz9vndw4w8p60d0n7vg3n9sqvta7n6t2%2Flogo%3Ft%3Ddark&amp;w=64&amp;q=75 1x, /_next/image?url=https%3A%2F%2Fmeta.viewblock.io%2Fzilliqa.zil18f5rlhqz9vndw4w8p60d0n7vg3n9sqvta7n6t2%2Flogo%3Ft%3Ddark&amp;w=128&amp;q=75 2x" src="/_next/image?url=https%3A%2F%2Fmeta.viewblock.io%2Fzilliqa.zil18f5rlhqz9vndw4w8p60d0n7vg3n9sqvta7n6t2%2Flogo%3Ft%3Ddark&amp;w=128&amp;q=75" decoding="async" data-nimg="intrinsic"
                                                        // style="position:absolute;top:0;left:0;bottom:0;right:0;box-sizing:border-box;padding:0;border:none;margin:auto;display:block;width:0;height:0;min-width:100%;max-width:100%;min-height:100%;max-height:100%" 
                                                        loading="lazy" />
                                                </noscript>
                                            </span>
                                            <div className="tokens_contenedor_2">
                                                <p className="tokens_left">PORT</p>
                                                <p className="tokens_right">Proof Of Receipt Token</p>
                                            </div>
                                            <p></p>
                                        </li>
                                        <li className="tokens_card">
                                            <span className='estilo_span_1' >
                                                <span className='estilo_span_2' >
                                                    <img className='estilo_imagen_1' alt="" aria-hidden="true" src="data:image/svg+xml,%3csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20version=%271.1%27%20width=%2750%27%20height=%2750%27/%3e" />
                                                </span>
                                                <img className='estilo_imagen_2' alt="Lunr" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" decoding="async" data-nimg="intrinsic" />
                                                <noscript>
                                                    <img alt="Lunr" srcSet="/_next/image?url=https%3A%2F%2Fmeta.viewblock.io%2Fzilliqa.zil1xxl6yp2twxvljdnn87g9fk7wykdrcv66xdy4rc%2Flogo%3Ft%3Ddark&amp;w=64&amp;q=75 1x, /_next/image?url=https%3A%2F%2Fmeta.viewblock.io%2Fzilliqa.zil1xxl6yp2twxvljdnn87g9fk7wykdrcv66xdy4rc%2Flogo%3Ft%3Ddark&amp;w=128&amp;q=75 2x" src="/_next/image?url=https%3A%2F%2Fmeta.viewblock.io%2Fzilliqa.zil1xxl6yp2twxvljdnn87g9fk7wykdrcv66xdy4rc%2Flogo%3Ft%3Ddark&amp;w=128&amp;q=75" decoding="async" data-nimg="intrinsic"
                                                        // style="position:absolute;top:0;left:0;bottom:0;right:0;box-sizing:border-box;padding:0;border:none;margin:auto;display:block;width:0;height:0;min-width:100%;max-width:100%;min-height:100%;max-height:100%" 
                                                        loading="lazy" />
                                                </noscript>
                                            </span>
                                            <div className="tokens_contenedor_2">
                                                <p className="tokens_left">Lunr</p>
                                                <p className="tokens_right">Lunr</p>
                                            </div>
                                            <p></p>
                                        </li>
                                        <li className="tokens_card">
                                            <span className='estilo_span_1'>
                                                <span className='estilo_span_2' >
                                                    <img className='estilo_imagen_1' alt="" aria-hidden="true" src="data:image/svg+xml,%3csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20version=%271.1%27%20width=%2750%27%20height=%2750%27/%3e" />
                                                </span>
                                                <img className='estilo_imagen_2' alt="DUCK" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" decoding="async" data-nimg="intrinsic" />
                                                <noscript>
                                                    <img alt="DUCK" srcSet="/_next/image?url=https%3A%2F%2Fmeta.viewblock.io%2Fzilliqa.zil1c6akv8k6dqaac7ft8ezk5gr2jtxrewfw8hc27d%2Flogo%3Ft%3Ddark&amp;w=64&amp;q=75 1x, /_next/image?url=https%3A%2F%2Fmeta.viewblock.io%2Fzilliqa.zil1c6akv8k6dqaac7ft8ezk5gr2jtxrewfw8hc27d%2Flogo%3Ft%3Ddark&amp;w=128&amp;q=75 2x" src="/_next/image?url=https%3A%2F%2Fmeta.viewblock.io%2Fzilliqa.zil1c6akv8k6dqaac7ft8ezk5gr2jtxrewfw8hc27d%2Flogo%3Ft%3Ddark&amp;w=128&amp;q=75" decoding="async" data-nimg="intrinsic"
                                                        // style="position:absolute;top:0;left:0;bottom:0;right:0;box-sizing:border-box;padding:0;border:none;margin:auto;display:block;width:0;height:0;min-width:100%;max-width:100%;min-height:100%;max-height:100%" 
                                                        loading="lazy" />
                                                </noscript>
                                            </span>
                                            <div className="tokens_contenedor_2">
                                                <p className="tokens_left">DUCK</p>
                                                <p className="tokens_right">DuckDuck</p>
                                            </div>
                                            <p></p>
                                        </li>
                                        <li className="tokens_card">
                                            <span className='estilo_span_1' >
                                                <span className='estilo_span_2' >
                                                    <img className='estilo_imagen_1' alt="" aria-hidden="true" src="data:image/svg+xml,%3csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20version=%271.1%27%20width=%2750%27%20height=%2750%27/%3e" />
                                                </span>
                                                <img className='estilo_span_1' alt="XCAD" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" decoding="async" data-nimg="intrinsic" />
                                                <noscript>
                                                    <img alt="XCAD" srcSet="/_next/image?url=https%3A%2F%2Fmeta.viewblock.io%2Fzilliqa.zil1z5l74hwy3pc3pr3gdh3nqju4jlyp0dzkhq2f5y%2Flogo%3Ft%3Ddark&amp;w=64&amp;q=75 1x, /_next/image?url=https%3A%2F%2Fmeta.viewblock.io%2Fzilliqa.zil1z5l74hwy3pc3pr3gdh3nqju4jlyp0dzkhq2f5y%2Flogo%3Ft%3Ddark&amp;w=128&amp;q=75 2x" src="/_next/image?url=https%3A%2F%2Fmeta.viewblock.io%2Fzilliqa.zil1z5l74hwy3pc3pr3gdh3nqju4jlyp0dzkhq2f5y%2Flogo%3Ft%3Ddark&amp;w=128&amp;q=75" decoding="async" data-nimg="intrinsic"
                                                        // style="position:absolute;top:0;left:0;bottom:0;right:0;box-sizing:border-box;padding:0;border:none;margin:auto;display:block;width:0;height:0;min-width:100%;max-width:100%;min-height:100%;max-height:100%" 
                                                        loading="lazy" />
                                                </noscript>
                                            </span>
                                            <div className="tokens_contenedor_2">
                                                <p className="tokens_left">XCAD</p>
                                                <p className="tokens_right">XCAD Network Token</p>
                                            </div>
                                            <p></p>
                                        </li>
                                        <li className="tokens_card">
                                            <span className='estilo_span_1' >
                                                <span className='estilo_span_2' >
                                                    <img className='estilo_imagen_1' alt="" aria-hidden="true" src="data:image/svg+xml,%3csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20version=%271.1%27%20width=%2750%27%20height=%2750%27/%3e" />
                                                </span>
                                                <img className='estilo_imagen_2' alt="ZILPEPE" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" decoding="async" data-nimg="intrinsic" />
                                                <noscript>
                                                    <img alt="ZILPEPE" srcSet="/_next/image?url=https%3A%2F%2Fmeta.viewblock.io%2Fzilliqa.zil1tyc45he8tp96tkyv2372le02tc0hch9p8cxws8%2Flogo%3Ft%3Ddark&amp;w=64&amp;q=75 1x, /_next/image?url=https%3A%2F%2Fmeta.viewblock.io%2Fzilliqa.zil1tyc45he8tp96tkyv2372le02tc0hch9p8cxws8%2Flogo%3Ft%3Ddark&amp;w=128&amp;q=75 2x" src="/_next/image?url=https%3A%2F%2Fmeta.viewblock.io%2Fzilliqa.zil1tyc45he8tp96tkyv2372le02tc0hch9p8cxws8%2Flogo%3Ft%3Ddark&amp;w=128&amp;q=75" decoding="async" data-nimg="intrinsic"
                                                        // style="position:absolute;top:0;left:0;bottom:0;right:0;box-sizing:border-box;padding:0;border:none;margin:auto;display:block;width:0;height:0;min-width:100%;max-width:100%;min-height:100%;max-height:100%" 
                                                        loading="lazy" />
                                                </noscript>
                                            </span>
                                            <div className="tokens_contenedor_2">
                                                <p className="tokens_left">ZILPEPE</p>
                                                <p className="tokens_right">ZilPepe</p>
                                            </div>
                                            <p></p>
                                        </li>
                                        <li className="tokens_card">
                                            <span className='estilo_span_1' >
                                                <span className='estilo_span_2' >
                                                    <img className='estilo_imagen_1' alt="" aria-hidden="true" src="data:image/svg+xml,%3csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20version=%271.1%27%20width=%2750%27%20height=%2750%27/%3e" />
                                                </span>
                                                <img className='estilo_imagen_2' alt="ZOGE" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" decoding="async" data-nimg="intrinsic" />
                                                <noscript>
                                                    <img alt="ZOGE" srcSet="/_next/image?url=https%3A%2F%2Fmeta.viewblock.io%2Fzilliqa.zil19zkpv4krrql0j4jtrqlfh7nt67r6gazxttnk5x%2Flogo%3Ft%3Ddark&amp;w=64&amp;q=75 1x, /_next/image?url=https%3A%2F%2Fmeta.viewblock.io%2Fzilliqa.zil19zkpv4krrql0j4jtrqlfh7nt67r6gazxttnk5x%2Flogo%3Ft%3Ddark&amp;w=128&amp;q=75 2x" src="/_next/image?url=https%3A%2F%2Fmeta.viewblock.io%2Fzilliqa.zil19zkpv4krrql0j4jtrqlfh7nt67r6gazxttnk5x%2Flogo%3Ft%3Ddark&amp;w=128&amp;q=75" decoding="async" data-nimg="intrinsic"
                                                        // style="position:absolute;top:0;left:0;bottom:0;right:0;box-sizing:border-box;padding:0;border:none;margin:auto;display:block;width:0;height:0;min-width:100%;max-width:100%;min-height:100%;max-height:100%" 
                                                        loading="lazy" />
                                                </noscript>
                                            </span>
                                            <div className="tokens_contenedor_2">
                                                <p className="tokens_left">ZOGE</p>
                                                <p className="tokens_right">Zoge Coin</p>
                                            </div>
                                            <p></p>
                                        </li>
                                    </ul>
                                </form>
                                <div className="tokens_include">
                                    <p>Import</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <form className="swap_form_contenedor">
                        <div className="swap_contenedor_nombre">
                            <h3>Swap
                                {/* { }//<!-- --> */}
                            </h3>
                            <div className="swap_contenedor_ajustes">
                                <svg width="22" height="27" viewBox="0 0 26 27" fill="none">
                                    <path d="M15.4267 26.8333H10.5734C9.94687 26.8333 9.40479 26.3973 9.27071 25.7853L8.72805 23.2733C8.00412 22.9561 7.31768 22.5595 6.68138 22.0906L4.23205 22.8706C3.63472 23.0611 2.98536 22.8097 2.67205 22.2666L0.240049 18.0653C-0.0698339 17.522 0.036927 16.8366 0.497382 16.4133L2.39738 14.68C2.31098 13.8948 2.31098 13.1025 2.39738 12.3173L0.497382 10.588C0.0362488 10.1644 -0.0705545 9.47825 0.240049 8.93463L2.66672 4.73063C2.98003 4.18756 3.62938 3.93614 4.22672 4.12663L6.67605 4.90663C7.00147 4.6655 7.34023 4.44292 7.69072 4.23996C8.02717 4.05022 8.37343 3.87842 8.72805 3.72529L9.27205 1.21596C9.40547 0.603918 9.94697 0.167285 10.5734 0.166626H15.4267C16.0531 0.167285 16.5946 0.603918 16.728 1.21596L17.2774 3.72663C17.6518 3.89131 18.0164 4.0774 18.3694 4.28396C18.6986 4.47438 19.0169 4.68315 19.3227 4.90929L21.7734 4.12929C22.3703 3.93952 23.0189 4.19084 23.332 4.73329L25.7587 8.93729C26.0686 9.48061 25.9618 10.166 25.5014 10.5893L23.6014 12.3226C23.6878 13.1078 23.6878 13.9001 23.6014 14.6853L25.5014 16.4186C25.9618 16.8419 26.0686 17.5273 25.7587 18.0706L23.332 22.2746C23.0189 22.8171 22.3703 23.0684 21.7734 22.8786L19.3227 22.0986C19.0126 22.327 18.6904 22.5384 18.3574 22.732C18.0078 22.9345 17.6473 23.1175 17.2774 23.28L16.728 25.7853C16.5941 26.3968 16.0527 26.8328 15.4267 26.8333ZM7.16005 19.1386L8.25338 19.9386C8.49985 20.1202 8.75673 20.2871 9.02272 20.4386C9.27298 20.5836 9.53067 20.7153 9.79471 20.8333L11.0387 21.3786L11.648 24.1666H14.3547L14.964 21.3773L16.208 20.832C16.7511 20.5925 17.2666 20.2947 17.7454 19.944L18.84 19.144L21.5614 20.0106L22.9147 17.6666L20.804 15.7426L20.9534 14.3933C21.019 13.8031 21.019 13.2075 20.9534 12.6173L20.804 11.268L22.916 9.33996L21.5614 6.99463L18.84 7.86129L17.7454 7.06129C17.2664 6.70891 16.751 6.40897 16.208 6.16663L14.964 5.62129L14.3547 2.83329H11.648L11.036 5.62263L9.79471 6.16663C9.53046 6.28268 9.27274 6.4131 9.02272 6.55729C8.75836 6.7084 8.50284 6.87444 8.25738 7.05463L7.16272 7.85463L4.44272 6.98796L3.08672 9.33996L5.19738 11.2613L5.04805 12.612C4.98245 13.2021 4.98245 13.7978 5.04805 14.388L5.19738 15.7373L3.08672 17.6613L4.44005 20.0053L7.16005 19.1386ZM12.9947 18.8333C10.0492 18.8333 7.66138 16.4455 7.66138 13.5C7.66138 10.5544 10.0492 8.16663 12.9947 8.16663C15.9402 8.16663 18.328 10.5544 18.328 13.5C18.3244 16.444 15.9387 18.8296 12.9947 18.8333ZM12.9947 10.8333C11.5379 10.8348 10.3519 12.0051 10.331 13.4617C10.3101 14.9184 11.4621 16.1222 12.9183 16.1655C14.3745 16.2087 15.5958 15.0753 15.6614 13.62V14.1533V13.5C15.6614 12.0272 14.4675 10.8333 12.9947 10.8333Z" fill="var(--text-color)"></path>
                                </svg>
                            </div>
                        </div>
                        <label>
                            <div className="swap_contenedor_montos">
                                <div className="swap_contenedor_montos_2">
                                    <input value="0" />
                                    <div className="swap_contenedor_montos_3">
                                        <span className='estilo_span_3'>
                                            <span className='estilo_span_2' >
                                                <img className='estilo_imagen_1' alt="" aria-hidden="true" src="data:image/svg+xml,%3csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20version=%271.1%27%20width=%2730%27%20height=%2730%27/%3e" />
                                            </span>
                                            <img className='estilo_imagen_2' alt="tokens-logo" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" decoding="async" data-nimg="intrinsic" />
                                            <noscript>
                                                <img alt="tokens-logo" srcSet="/_next/image?url=https%3A%2F%2Fmeta.viewblock.io%2Fzilliqa.ZIL%2Flogo%3Ft%3Ddark&amp;w=32&amp;q=75 1x, /_next/image?url=https%3A%2F%2Fmeta.viewblock.io%2Fzilliqa.ZIL%2Flogo%3Ft%3Ddark&amp;w=64&amp;q=75 2x" src="/_next/image?url=https%3A%2F%2Fmeta.viewblock.io%2Fzilliqa.ZIL%2Flogo%3Ft%3Ddark&amp;w=64&amp;q=75" decoding="async" data-nimg="intrinsic"
                                                    // style="position:absolute;top:0;left:0;bottom:0;right:0;box-sizing:border-box;padding:0;border:none;margin:auto;display:block;width:0;height:0;min-width:100%;max-width:100%;min-height:100%;max-height:100%" 
                                                    loading="lazy" />
                                            </noscript>
                                        </span>
                                        <p>ZIL</p>
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--primary-color)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                            <polyline points="6 9 12 15 18 9"></polyline>
                                        </svg>
                                    </div>
                                </div>
                                <div className="swap_contenedor_montos_2">
                                    <p>$0</p>
                                    <div className="input_row__JWkmx">
                                        <p className="input_balance__1QWPP">0
                                            {/* <!-- --> */}
                                            %</p>
                                        <p className="input_balance__1QWPP">10
                                            {/* <!-- --> */}
                                            %</p>
                                        <p className="input_balance__1QWPP">25
                                            {/* <!-- --> */}
                                            %</p>
                                        <p className="input_balance__1QWPP">50
                                            {/* <!-- --> */}
                                            %</p>
                                        <p className="input_balance__1QWPP">75
                                            {/* <!-- --> */}
                                            %</p>
                                        <p className="input_balance__1QWPP">100
                                            {/* <!-- --> */}
                                            %</p>
                                    </div>
                                </div>
                            </div>
                        </label>
                        <svg width="32" height="33" viewBox="0 0 32 33" fill="none">
                            <rect width="32" height="32" transform="translate(0 0.5)" fill="var(--button-color)"></rect>
                            <path d="M23.1595 13.2071L22.0151 12.0628L22.0151 21.1685L20.0151 21.1685L20.0151 11.8904L18.6984 13.2071L17.2842 11.7929L20.9289 8.14813L24.5737 11.7929L23.1595 13.2071Z" fill="var(--text-color)"></path>
                            <path d="M9.95549 21.071L8.63875 19.7543L7.22454 21.1685L10.8693 24.8133L14.514 21.1685L13.0998 19.7543L11.9555 20.8986L11.9555 11.7929L9.9555 11.7929L9.95549 21.071Z" fill="var(--text-color)"></path>
                        </svg>
                        <label>
                            <div className="swap_contenedor_montos">
                                <div className="swap_contenedor_montos_2">
                                    {/* <input disabled="" value="0" /> */}
                                    <div className="swap_contenedor_montos_3">
                                        <span className='estilo_span_3' >
                                            <span className='estilo_span_2' >
                                                <img className='estilo_imagen_1' alt="" aria-hidden="true" src="data:image/svg+xml,%3csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20version=%271.1%27%20width=%2730%27%20height=%2730%27/%3e" />
                                            </span>
                                            <img className='estilo_imagen_2' alt="tokens-logo" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" decoding="async" data-nimg="intrinsic" />
                                            <noscript>
                                                <img alt="tokens-logo" srcSet="/_next/image?url=https%3A%2F%2Fmeta.viewblock.io%2Fzilliqa.zil1l0g8u6f9g0fsvjuu74ctyla2hltefrdyt7k5f4%2Flogo%3Ft%3Ddark&amp;w=32&amp;q=75 1x, /_next/image?url=https%3A%2F%2Fmeta.viewblock.io%2Fzilliqa.zil1l0g8u6f9g0fsvjuu74ctyla2hltefrdyt7k5f4%2Flogo%3Ft%3Ddark&amp;w=64&amp;q=75 2x" src="/_next/image?url=https%3A%2F%2Fmeta.viewblock.io%2Fzilliqa.zil1l0g8u6f9g0fsvjuu74ctyla2hltefrdyt7k5f4%2Flogo%3Ft%3Ddark&amp;w=64&amp;q=75" decoding="async" data-nimg="intrinsic"
                                                    // style="position:absolute;top:0;left:0;bottom:0;right:0;box-sizing:border-box;padding:0;border:none;margin:auto;display:block;width:0;height:0;min-width:100%;max-width:100%;min-height:100%;max-height:100%" 
                                                    loading="lazy" />
                                            </noscript>
                                        </span>
                                        <p>ZLP</p>
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--primary-color)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                            <polyline points="6 9 12 15 18 9"></polyline>
                                        </svg>
                                    </div>
                                </div>
                                <div className="swap_contenedor_montos_2">
                                    <p>$0</p>
                                </div>
                            </div>
                        </label>
                        <div className="contenedor_info_precio">
                            <p>
                                1
                                {/* <!-- --> */}
                                ZIL
                                {/* <!-- --> */}
                                =
                                {/* <!-- --> */}
                                0.180056920553
                                {/* <!-- --> */}
                                <div className='swap_contenedor_1'>
                                    <div>
                                        <div className='swap_contenedor_2'>
                                            <div className='swap_contenedor_3' style={{ width: '390px' }}></div>
                                        </div>
                                        <div className='swap_contenedor_2'></div>
                                        <div className='swap_contenedor_2'></div>
                                        <form className='swap_form_contenedor'></form>
                                    </div>
                                </div>
                                {/* <!-- --> */}
                                ZLP
                                {/* <!-- --> */}
                                <span>(
                                    {/* <!-- --> */}
                                    $0.023781
                                    {/* <!-- --> */}
                                    )</span>
                            </p>
                            <span>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--secondary-color)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <polyline points="6 9 12 15 18 9"></polyline>
                                </svg>
                            </span>
                        </div>
                        <ul className="swap_form_info">
                            <p>ZRC-2 tokens issued by other users are not screened or audited by ZilPay. There is no guarantee that your purchased tokens will maintain its current swap value. Please conduct your own due diligence before swapping.</p>
                            <li>
                                Verify contract address of
                                {/* <!-- --> */}
                                <a href="https://viewblock.io/zilliqa/address/zil1l0g8u6f9g0fsvjuu74ctyla2hltefrdyt7k5f4?network=mainnet" target="_blank" rel="noopener noreferrer">ZLP
                                    {/* <!-- --> */}
                                    {/* <!-- --> */}
                                </a>
                            </li>
                        </ul>
                        {/* <button disabled="">Exchange</button> */}
                    </form>
                </div>
            </div>

            {/* fin */}




            {/* SWAP INTERFAZ       
    */}
            <h1 style={{ marginBottom: '10%' }}>
                <div className={styles.username}>{resolvedDomain}.defi</div>
                <div>DID Domain</div>
            </h1>
            <div
                style={{
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                    flexDirection: 'row',
                }}
            ></div>



            <div
                style={{
                    marginTop: '7%',
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                    flexDirection: 'column',
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                >
                    <h2>
                        <div
                            className={styles.card1}
                            onClick={() => {
                                setLoadingCard1(true)
                                Router.push(`/${resolvedDomain}`)
                                setTimeout(() => {
                                    setLoadingCard1(false)
                                }, 1000)
                            }}
                        >
                            <div className={styles.cardTitle3}>
                                {loadingCard1 ? (
                                    <ThreeDots color="yellow" />
                                ) : (
                                    'DeFi'
                                )}
                            </div>
                            <div className={styles.cardTitle2}>
                                {loadingCard1 ? (
                                    <ThreeDots color="yellow" />
                                ) : (
                                    'Decentralized Identifier document'
                                )}
                            </div>
                        </div>
                    </h2>
                </div>
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                >
                    <h2>
                        <div
                            className={styles.card}
                            onClick={() => {
                                setLoadingCard2(true)
                                Router.push(`/${resolvedDomain}.defi/p2p`)
                                setTimeout(() => {
                                    setLoadingCard2(false)
                                }, 1000)
                                // if (controller === address) {
                                //   updateIsController(true);
                                //   Router.push(`/${username}/xwallet`);
                                // } else {
                                //   toast.error(
                                //     `Only ${username}'s DID Controller can access this wallet.`,
                                //     {
                                //       position: "top-right",
                                //       autoClose: 3000,
                                //       hideProgressBar: false,
                                //       closeOnClick: true,
                                //       pauseOnHover: true,
                                //       draggable: true,
                                //       progress: undefined,
                                //       theme: "dark",
                                //     }
                                //   );
                                // }
                            }}
                        >
                            <div className={styles.cardTitle3}>
                                {loadingCard2 ? (
                                    <ThreeDots color="yellow" />
                                ) : (
                                    'Peer to Peer'
                                )}
                            </div>
                            <div className={styles.cardTitle2}>
                                {loadingCard2 ? (
                                    <ThreeDots color="yellow" />
                                ) : (
                                    'desc'
                                )}
                            </div>
                        </div>
                    </h2>
                    <h2>
                        <div
                            className={styles.card}
                            onClick={() => {
                                setLoadingCard3(true)
                                Router.push(
                                    `/${resolvedDomain}.defi/defi/funds`
                                )
                                setTimeout(() => {
                                    setLoadingCard3(false)
                                }, 1000)
                            }}
                        >
                            <div className={styles.cardTitle3}>
                                {loadingCard3 ? (
                                    <ThreeDots color="yellow" />
                                ) : (
                                    'add funds'
                                )}
                            </div>
                            <div className={styles.cardTitle2}>
                                {loadingCard3 ? (
                                    <ThreeDots color="yellow" />
                                ) : (
                                    'top up wallet'
                                )}
                            </div>
                        </div>
                    </h2>
                </div>
            </div>
        </div>
    )
}

export default Component
