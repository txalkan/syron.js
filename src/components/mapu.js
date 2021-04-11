import React from "react";
import incendios_chubut from "../images/incendios_chubut.jpg";
import { Link, withRouter } from "react-router-dom";

function Mapu() {
	return(
		<div id="main">
            <span role="img" aria-label="back arrow" style={{ marginTop:"7%", marginBottom: '2%' }}><Link to="/">🔙</Link></span>
            <h2 class="major">The .Mapu platform</h2>
            <p><b>.Mapu</b> will be a profit-sharing community advocating for more sustainable practices in our day-to-day life, such as waste management. On this platform, self-sovereign identities will share articles and encrypted messages (DID Comm) as well as peer-to-peer donations to support environmental movements.</p>
            <p>You will be able to give your self-sovereign identity a <b>username.mapu</b> that represents you on this platform.</p>
            <p>A lot of people care about our natural environment. However, information is scattered, like-minded communities disconnected from each other, and many of us don't know where to start. Global warming is a real threat, but humans make it worse by continuing the unsustainable exploitation of natural resources.</p>
            <p>Change is coming, and we see it reflected in kids and young generations. Furthermore, indigenous people, such as native South Americans, have that respect for nature internalized in their cultures. But they were colonized and deprived of that. The Mapuche people of North Patagonia got attacked by the Argentinian and Chilean states in the late 19th century in one of the biggest genocides of modern history. But we are still here.</p>
            <span class="image main" style={{width:"70%"}}><img src={incendios_chubut} alt=""/></span>
            <p>Thousands of hectares got <a href="https://www.opendemocracy.net/en/democraciaabierta/patagonia-argentina-mining-indigenous-politics-fire/">intentionally burnt in Patagonia in March 2021</a>, including national parks. Similar fires happened in Australia and the Amazon, killing everything in their paths. In the last year:</p>
            <ul>
                <li>More than 6,000,000 hectares burnt in Australia.</li>
                <li>NASA satellites detected about 1.4 million anomalies in the southern Amazon, compared to 1.1 million in 2019. In the Pantanal along the border of Brazil, Paraguay, and Bolivia fires destroyed 4.4 million in 2020, about 28% of the Pantanal.</li>
                <li>In Chubut province, Argentina, fires burnt more than 500 houses along seven towns - including areas in national parks.</li>
            </ul>
            <p> Many of us may come from different places, but we share moral values. Blockchain technologies can help us distribute information that cannot get censored and donate crypto assets peer-to-peer - we can protect nature and future generations.</p>
            <section>
                <h3 class="major">Kvme Felen</h3>
                <p>In the Mapuzungun language, <i>mapu</i> means earth/soil/ground - and <i>che</i> means people. Mapuche's vision is the <i>Kvme Felen</i>, or "good living", focused on building a society more just and with biodiversity - learning from the past and present to build a better future.</p>
            </section>
        </div>
	);
}

export default withRouter(Mapu);
