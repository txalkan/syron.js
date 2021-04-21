import React from "react";
import Chart from "react-google-charts";
import { Link, withRouter } from "react-router-dom";

function Token() {
	return(
		<div id="main">
            <span role="img" aria-label="back arrow" style={{ marginTop:"7%", marginBottom: '2%' }}><Link to="/">🔙</Link></span>
            <h2 style={{ width: "100%", textAlign:"center" }} class="major">$AYJA Profit Sharing Token</h2>
            <section style={{ width: "100%" }}>
                <p>The Tyron SSI Protocol will grow to be governed by the AYJA Profit-Sharing Community with $AYJA as its profit-sharing token. Accordingly, $AYJA holders dubbed SSI Agents will:</p>
                <ul>
                    <li>Receive their proportional amount of profits from fees collected by the protocol</li>
                    <li>Vote and constitute the SSI Governance</li>
                    <li>Access exclusive products and services such as DAOs and the possibility to operate <Link to="/defi">SSI gas stations</Link></li>
                </ul>
                <div class="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th></th>
                                <th>Value</th>
                                <th>Description</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Ticker</td>
                                <td>AYJA</td>
                                <td>The unique symbol assigned to the $AYJA profit-sharing token.</td>
                            </tr>
                            <tr>
                                <td>Max supply</td>
                                <td>10,000,000</td>
                                <td>The total amount of tokens that will get minted.</td>
                            </tr>
                            <tr>
                                <td>Smallest unit</td>
                                <td>EPU</td>
                                <td>One $AYJA can get divided into 1,000,000,000 $EPU.</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>
            <section style={{ width:'100%' }}> 
                <h3 class="major">SSI Governance</h3>
                <p>Decentralized governance with the following features:</p>
                <ul>
                    <li>A quorum of 67% of the voting power</li>
                    <li>1 $AYJA = 1 vote</li>
                    <li>Voting is mandatory or incurs a penalty</li>
                </ul>
                <p>To decide:</p>
                <ul>
                    <li>Pairs that liquidity mine <Link to="/defi">$TYRON</Link> - e.g. AYJA/ZIL, TYRON/ZIL</li>
                    <li>Mint rate of $TYRON from liquidity, developer and usage rewards</li>
                    <li>Price for SSI products and services such as domain name purchase and DID CRUD operations</li>
                    <li>The annual sustainable project where the profits of Tyron Pungtas CIC will get invested</li>
                    <li>Lockup periods for $AYJA token sales</li>
                </ul>
            </section>
            <section style={{ width:'100%' }}>        
                <h3 class="major">$AYJA token allocations</h3>
                <p>Only 49% of the $AYJA profit-sharing tokens will be ever available for sale. The remaining 51% will get managed by Tyron Pungtas, an open organization to become a Community Interest Company - so that most of these profits get yearly invested in a global sustainable project voted by SSI Governance.</p>
                <p>As a % of the max supply:</p>
                <Chart
                    chartType="PieChart"
                    loader={<div>Loading Chart</div>}
                    data={[
                        ['', ''],
                        ['Community Interest Company (CIC)', 51],
                        ['SSI Agents', 40],
                        ['Founder', 9]
                        
                    ]}
                    options={{
                        is3D: true,
                        backgroundColor: 'transparent',
                        chartArea:{ width:'100%', height:'100%', left: 96, right: 96 },
                        fontName: "Source Sans Pro",
                        colors: ["#32527b", "#aaa9ad", "#fecb00"],
                        legend: { position: 'left', textStyle: { color: 'white', fontSize: 16, bold: 'true' }},
                        tooltip: { text: 'percentage', textStyle: { bold: 'true' }},
                        pieSliceTextStyle: { color: 'black', bold: 'true' }
                    }}
                    rootProps={{ 'data-testid': '1' }}
                />
                <h3>Lock-up periods & distribution </h3>
                <div class="table-wrapper">
                    <table class="alt">
                        <thead>
                            <tr>
                                <th></th>
                                <th>Allocation ($AYJA)</th>
                                <th>Lock-up period</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Tyron Pungtas CIC</td>
                                <td>5,100,000</td>
                                <td>Permanent</td>
                            </tr>
                            <tr>
                                <td>SSI Agents</td>
                                <td>4,000,000</td>
                                <td>Exponential decay</td>
                            </tr>
                            <tr>
                                <td>Founder</td>
                                <td>900,000</td>
                                <td>Exponential decay</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>
            <section style={{ width:'100%' }}>
                <h3 class="major">Travel Rule</h3>
                <p>In compliance with the Financial Action Task Force (FATF) Travel Rule, the Tyron SSI Protocol grants every self-sovereign identity the possibility to have an SSI Travel Rule Passport that implements the <a href="https://intervasp.org/wp-content/uploads/2020/05/IVMS101-interVASP-data-model-standard-issue-1-FINAL.pdf">InterVASP Messaging Standard IVMS101</a> encrypted in their <Link to="/permawallet">SSI Permawallet</Link>. To avoid illegal activities that harm society, such as terrorism financing and money laundering, developing into a web of trust.</p>
                <p>Such a compliance mechanism makes $AYJA attractive to both retail and institutional investors. The private companies and non-profit organizations that integrate the Tyron Self-Sovereign Identity Protocol will comply with the FATF Travel Rule when requiring their customer base to enable their SSI Travel Rule Passport.</p>
            </section>
        </div>
	);
}

export default withRouter(Token);
