import express from "express";
import { serverRenderer } from "renderers/serverRender";
import { matchPath } from "react-router-dom";
import { serverRoutes } from "shared/serverRoutes";

const router = express.Router();

function redirectToLink(req, res, next) {
    const activeRoute =
        serverRoutes.find((r) => matchPath(req.url, r)) || {};

    if (activeRoute.isProtected && !req.session.accessToken) {
        console.log("[REACT ROUTE] Redirecting to Door for accessing %s without access", req.url);
        res.redirect("/door");
    } else {
        next();
    }
}

router.get("/*", redirectToLink, async (req, res, next) => {
    try {
        //const reqUrl = req.url.includes("?") ? req.url.split("?")[0] : req.url;
        const reqQuery = new URLSearchParams(
            req.url.includes("?") ? req.url.split("?")[1] : ""
        );
        console.log("[REACT ROUTE] GET Request: ", req.url);

        const activeRoute =
            serverRoutes.find((r) => matchPath(req.url, r)) || {};

        // if can't find a react route, go through express routes
        if (
            Object.keys(activeRoute).length === 0 &&
            activeRoute.constructor === Object
        ) {
            console.log(
                "[REACT ROUTE] did not match a React Route for ",
                req.url
            );
            next();
        }
        console.log("[REACT ROUTE] server route resolved: ", activeRoute);

        const promise = activeRoute.fetchInitialData
            ? activeRoute.fetchInitialData(req.path)
            : Promise.resolve();

        const context = Object.assign(
            { reqQuery: reqQuery },
            await promise.then((data) => {
                console.log(
                    "[REACT ROUTE] Fetching data from InitialDataFetch promise: ",
                    data
                );
                return data;
            })
        );

        const vars = await serverRenderer(req, context);
        res.render("index", vars);
    } catch (err) {
        //TODO prettier error
        console.error(err);
        res.status(500).send("Server error");
    }
});

module.exports = router;
