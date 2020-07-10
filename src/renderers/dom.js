import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter } from "react-router-dom";

import App from "components/App";

import "../styles/index.css";
import "bootstrap/dist/css/bootstrap.min.css";

ReactDOM.hydrate(
    <BrowserRouter>
        <App {...window.__INITIAL_DATA__} />
    </BrowserRouter>,
    document.getElementById("root")
);
