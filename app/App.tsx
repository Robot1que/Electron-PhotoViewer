import "reflect-metadata";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { Router, Route } from "react-router";
import { createBrowserHistory as createHistory } from "history";
import { Main } from "./components/Main";
import { ItemList } from "./components/ItemList";

ReactDOM.render(
    <Router history={createHistory()}>
        <Route path="/" component={Main}>
            {/*<Route exact={true} path="/folders" component={ItemList} />
            <Route path="/folders/:folderId" component={ItemList} />*/}
        </Route>
    </Router>,
    document.getElementById("root")
);
