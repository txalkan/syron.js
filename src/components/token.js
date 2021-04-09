import React from "react";
import Chart from "react-google-charts";
import { Link, withRouter } from "react-router-dom";

function Token() {
	return(
		<div id="main">
            <span role="img" aria-label="back arrow" style={{marginBottom: '2%'}}><Link to="/">🔙</Link></span>
            <h2 class="major">$AYJA Profit Sharing Token</h2>
            <div>
                <p>The <Link to="/mapu">.Mapu</Link> platform will launch as a <a href="https://coinmarketcap.com/alexandria/article/profit-sharing-communities-a-deep-dive-by-arweave">profit-sharing community (PSC)</a> with $AYJA as its profit-sharing token (PST). Although, only 35% of the tokens will be ever available to sell to investors. The remaining 65% will get managed by Tyron Pungtas, an open organization to become a  Community Interest Company based in the United Kingdom, Europe. However, these profits will get yearly invested in a global sustainable project voted out by <Link to="/defi">$TYRON</Link> token holders.</p>
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
                                <td>The unique symbol assigned to the .Mapu PST. Ayja is the number 9 in Mapuzungun.</td>
                            </tr>
                            <tr>
                                <td>Max supply</td>
                                <td>10,000,000</td>
                                <td>The total amount of tokens that will get minted.</td>
                            </tr>
                            <tr>
                                <td>Smallest unit</td>
                                <td>EPU</td>
                                <td>One $AYJA can get divided into 1,000,000,000 $EPU. Epu is the number 2 in Mapuzungun.</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            <section style={{width:'100%'}}>
                <h3>Travel Rule</h3>
                <p>$AYJA holders can comply with the Financial Action Task Force (FATF) Travel Rule at the protocol level by enabling their Travel Rule SSI Passport that implements the <a href="https://intervasp.org/wp-content/uploads/2020/05/IVMS101-interVASP-data-model-standard-issue-1-FINAL.pdf">InterVASP Messaging Standard IVMS101</a> encrypted in their <Link to="/permawallet">SSI Permawallet</Link>. To avoid illegal activities that harm society, such as terrorism financing and money laundering, developing into a web of trust.</p>
                <p>Such a compliance mechanism makes $AYJA attractive to both retail and institutional investors. The private companies and non-profit organizations that integrate the Tyron Self-Sovereign Identity Protocol will comply with the FATF Travel Rule when requiring their customer base to enable their Travel Rule SSI Passport.</p>
            
                <h3 class="major">$AYJA token allocations</h3>
                <p>As a % out of the max supply:</p>
                <Chart
                    chartType="PieChart"
                    loader={<div>Loading Chart</div>}
                    data={[
                        ['', ''],
                        ['Investors', 35],
                        ['Community Interest Company (CIC)', 65]
                    ]}
                    options={{
                        is3D: true,
                        backgroundColor: 'transparent',
                        chartArea:{width:'100%', height:'100%', left: 96, right: 96},
                        fontName: "Source Sans Pro",
                        colors: ["#32527b", "#aaa9ad"],
                        legend: {position: 'left', textStyle: {color: 'white', fontSize: 16, bold: 'true'}},
                        tooltip: {text: 'percentage', textStyle: {bold: 'true'}},
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
                                <td>Investors</td>
                                <td>3,500,000</td>
                                <td>Exponential decay</td>
                            </tr>
                            <tr>
                                <td>Tyron Pungtas CIC</td>
                                <td>6,500,000</td>
                                <td>Permanent</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <p>(*) <em>% out of the allocated amount</em></p>
            </section>
        </div>
	);
}

export default withRouter(Token);
