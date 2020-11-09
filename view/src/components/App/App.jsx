import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import RelationSearchPage from '../RelationSearchPage/RelationSearchPage'
import MainPage from "../MainPage/MainPage";
import SearchPage from "../SearchPage/SearchPage";
import DisplayPage from "../DisplayPage/DisplayPage";
import KeywordPage from "../KeywordPage/KeywordPage";
import AdminPage from "../AdminPage/AdminPage";
import { LoginContextProvider } from "./../../LoginContext";
import './App.css';


class App extends Component {
  state = {};

  render() {
    return (
      <LoginContextProvider>
        <Router>
          <div id='app'>
            {/*<TitlePanel />*/}
            <Switch>
              <Route exact path="/" component={SearchPage} />
              <Route exact path="/search" component={SearchPage} />
              <Route exact path="/main" component={MainPage} />
              <Route exact path="/search/:id" component={DisplayPage} />
              <Route path="/user/" component={AdminPage} />
              <Route exact path="/getKeyword/:keyword" component={KeywordPage} />
              <Route exact path="/relationSearch" component={RelationSearchPage} />
              {/*<Route exact path="/addCaseReport" component={AddCaseReport}/>*/}
              <Route component={() => (<h1>404!!!</h1>)} />
            </Switch>
          </div>
        </Router>
      </LoginContextProvider>
    );
  }
}

export default App;
