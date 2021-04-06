import React from "react";
import Chart from "react-google-charts";

function Token() {
	return(
		<div id="main">
            <span role="img" aria-label="back arrow" style={{marginBottom: '2%'}}><a href="/">🔙</a></span>
            <h2 class="major">$AYJA Profit Sharing Token</h2>
            <div>
                <p>The <a href="/mapu">.Mapu</a> platform will launch as a <a href="https://coinmarketcap.com/alexandria/article/profit-sharing-communities-a-deep-dive-by-arweave">profit-sharing community (PSC)</a> with $AYJA as its profit-sharing token (PST). $AYJA holders will also participate in the governance of the platform.</p>
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
                <p>$AYJA complies with the Financial Action Task Force (FATF) Travel Rule at the protocol level by implementing the <a href="https://intervasp.org/wp-content/uploads/2020/05/IVMS101-interVASP-data-model-standard-issue-1-FINAL.pdf">InterVASP Messaging Standard IVMS101</a> between token holders. Therefore, Tyron is committed to avoiding illegal activities that harm society, such as terrorism financing and money laundering.</p>
                <p>Tyron's compliance mechanism makes $AYJA attractive to both retail and institutional investors. The private companies and non-profit organizations that integrate Tyron to provide self-sovereign identity to their users will comply with the FATF Travel Rule not only for $AYJA transfers but also for any virtual-asset transfer supported by the Tyron SSI Protocol.</p>
            
                <h3 class="major">$AYJA token allocations</h3>
                <p>As a % out of the max supply:</p>
                <Chart
                    chartType="PieChart"
                    loader={<div>Loading Chart</div>}
                    data={[
                        ['', ''],
                        ['Founder', 10],
                        ['Team', 20],
                        ['Sales', 70]
                    ]}
                    options={{
                        is3D: true,
                        backgroundColor: 'transparent',
                        chartArea:{width:'100%', height:'100%', left: 96, right: 96},
                        fontName: "Source Sans Pro",
                        colors: ["#32527b", "#296e01","#aaa9ad"],
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
                                <th>Lock-up</th>
                                <th>Distribution (*)</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Founder</td>
                                <td>1,000,000</td>
                                <td>5 years</td>
                                <td>20% per year</td>
                            </tr>
                            <tr>
                                <td>Team</td>
                                <td>2,000,000</td>
                                <td>4 years</td>
                                <td>25% per year</td>
                            </tr>
                            <tr>
                                <td>Sales</td>
                                <td>7,000,000</td>
                                <td>N/A</td>
                                <td>Over 5 years</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <p>(*) <em>% out of the allocated amount</em></p>
            </section>
        </div>
	);
}

export default Token;
