import './styles/css/main.css';
import { HashRouter as Router, Route, Switch } from "react-router-dom";
import { Header, Footer, Home, About, Did, Mapu, Token, DeFi, Permawallet, Browser, Contact} from "./components";

function App() {
	return(
		<div id="wrapper">
			<Router>
				<Header />
				<Switch>
					<Route exact path="/" ><Home /></Route>
					<Route exact path="/about" ><About /></Route>
					<Route exact path="/did" ><Did /></Route>
					<Route exact path="/mapu" ><Mapu /></Route>
					<Route exact path="/token" ><Token /></Route>
					<Route exact path="/defi" ><DeFi /></Route>
					<Route exact path="/permawallet" ><Permawallet /></Route>
					<Route exact path="/browser" ><Browser /></Route>
					<Route exact path="/contact" ><Contact /></Route>
					<Route><Home/></Route>
				</Switch>
				<Footer />
			</Router>
		</div>
	);
}

export default App;
