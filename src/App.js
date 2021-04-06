import './styles/css/main.css';
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { Header, Footer, Home, About, Did, Mapu, Token, DeFi, Wallet} from "./components";

function App() {
	return(
		<div id="wrapper">
			<Router>
				<Header/>
				<Switch>
				<Route path="/" exact component={() => <Home />} />	
				<Route path="/about" exact component={() => <About />} />
				<Route path="/did" exact component={() => <Did />} />
				<Route path="/mapu" exact component={() => <Mapu />} />
				<Route path="/token" exact component={() => <Token />} />
				<Route path="/defi" exact component={() => <DeFi />} />
				<Route path="/wallet" exact component={() => <Wallet />} />
				</Switch>
				<Footer />
			</Router>
		</div>
	);
}

export default App;
