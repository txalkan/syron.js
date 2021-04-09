import React from "react";
import { Link, withRouter } from "react-router-dom";

function Browser() {
	return(
		<div id="main">
            <span role="img" aria-label="back arrow" style={{marginBottom: '2%'}}><Link to="/">🔙</Link></span>
            <h2 class="major">Browser</h2>
            <section style={{width:'100%'}}>
                <p>Search for a self-sovereign identity by username and domain:</p>
                <div class="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>Domain</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>.mapu</td>
                                <td>Access any <Link to="/mapu">.Mapu</Link> profile or create yours!</td>
                            </tr>
                        </tbody>
                    </table>
                    <ol>
                        <li>Create your <Link to="/permawallet">SSI Permawallet</Link>.</li>
                    </ol>
                </div>
                <form>
                    <div class="fields">
                        <div class="field half">
                            <label for="username">Username</label>
                            <input type="text" name="username" id="username" />
                        </div>
                        <div class="field half">
                            <label for="domain">Domain</label>
                            <select name="domain" id="domain">
                                <option value="mapu">.mapu</option>
                                <option value="twitter">.twitter</option>
                                <option value="github">.github</option>
                            </select>
                        </div>
                    </div>
                    <ul class="actions">
                        <li><input class="button primary" type="button" value="Search" onclick="browser()"></input></li>
                        <li><input type="reset" value="Reset" /></li>
                    </ul>
                </form>
            </section>	
        </div>
	);
}

export default withRouter(Browser);
