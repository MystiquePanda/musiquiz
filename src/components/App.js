import React, { Component, location } from "react";

import { Route, Switch } from "react-router-dom";
import { Container } from "react-bootstrap";

import { clientRoutes } from "shared/routes";

import {MQMenu} from "components/MQMenu";

export default class App extends Component {
    //TODO handle errors, check access_token validity

    constructor(props) {
        super(props);
        console.log("[App.js] >>>>> props:", this.props);
        if (typeof window !== "undefined" && window.__INITIAL_DATA__) {
            console.log("[App.js] >>>> widow initial Data", window.__INITIAL_DATA__);
        }
    }

    render() {
        return (
            <Container
                style={{
                    height: "95vh",
                    width:"95vw",
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "row",
                }}
            >
                <Switch>
                    {clientRoutes.map(
                        ({ path, exact, component: C, ...rest }) => (
                            <Route
                                key={path}
                                path={path}
                                exact={exact}
                                component={() => (
                                    <C {...rest} {...this.props.initialData} />
                                )}
                            ></Route>
                        )
                    )}

                    <Route path="*">
                        {
                            //TODO implement 404
                        }
                        <h1>404: no match</h1>
                    </Route>
                </Switch>
            </Container>
        );
    }
}
