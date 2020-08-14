import React from "react";
import ReactDOMServer from "react-dom/server";
import { StaticRouter } from "react-router-dom";
import sessionManager from "server/session";
import App from "components/App";

export async function serverRenderer(req, data) {
    const initialData = {
        appName: "musiQuiz",
        query: req.query,
        url: req.url,
        baseUrl: req.url.includes("?") ? req.url.split("?")[0] : req.url,
        userName: sessionManager.get(req.session, "userName"),
        musicService: sessionManager.get(req.session, "musicService"),
        data: data,
    };

    const pageData = {
        title: `${initialData.appName}`,
    };

    console.log("[SERVER RENDERER] InitialData : ", initialData);
    return Promise.resolve({
        initialData,
        initialMarkup: ReactDOMServer.renderToString(
            <StaticRouter
                location={{ pathname: initialData.baseUrl }}
                context={{ ...initialData }}
            >
                <App {...initialData} />
            </StaticRouter>
        ),
        pageData,
    });
}
