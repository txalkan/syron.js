import './styles/css/main.css';
import { HashRouter as Router, Route, Switch } from "react-router-dom";
import { Header, Footer, Home, Browser, Contact} from "./components";

function App() {
	return(
		<div id="wrapper">
			<Router>
				<Header />
				<Switch>
					<Route exact path="/" ><Home /></Route>
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
