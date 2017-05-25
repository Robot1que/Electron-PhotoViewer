import "reflect-metadata";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { Router, Route } from "react-router";
import { createBrowserHistory as createHistory } from "history";
import { Main } from "./components/Main";

ReactDOM.render(
    <Router history={createHistory()}>
        <Route path="/" component={Main} />
    </Router>,
    document.getElementById("root")
);
