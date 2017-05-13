import "reflect-metadata";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { Router, Route, Switch } from "react-router";
import { createBrowserHistory as createHistory } from "history";
import { Main, State as MainState } from "./components/Main";

ReactDOM.render(
    <Router history={createHistory()}>
        <Route path="/" component={Main} />
    </Router>,
    document.getElementById("root")
);
