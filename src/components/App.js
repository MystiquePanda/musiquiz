import React, { Component, location } from "react";

import { Route, Switch } from "react-router-dom";
import { Container, Row } from "react-bootstrap";

import { clientRoutes } from "shared/routes";
import MQUserBar from "components/MQUserBar";

export default class App extends Component {
    //TODO handle errors, check access_token validity

    constructor(props) {
        super(props);
        //console.log("[App.js] >>>>> props:", this.props);
        this.state = this.props;

        if (typeof window !== "undefined" && window.__INITIAL_DATA__) {
            /*console.log(
                "[App.js] >>>> widow initial Data",
                window.__INITIAL_DATA__
            );*/
            this.state = window.__INITIAL_DATA__;
        }
        console.log("[App.js] >>>> state", this.state);
    }

    render() {
        const { userName, musicService } = this.state;

        return (
            <Container
                style={{
                    height: "95vh",
                    width: "95vw",
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                }}
            >
                <Row style={{ marginLeft: "auto", marginRight: "5px" }}>
                    {typeof userName !== "undefined" && (
                        <MQUserBar
                            musicService={musicService}
                            user={{ userName: userName }}
                        />
                    )}
                </Row>
                <Row
                    className="justify-content-center"
                    style={{ flexDirection: "row", margin: "auto" }}
                >
                    <Switch>
                        {clientRoutes.map(
                            ({ path, exact, component: C, ...rest }) => (
                                <Route
                                    key={path}
                                    path={path}
                                    exact={exact}
                                    component={() => (
                                        <C {...rest} {...this.state} />
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
                </Row>
            </Container>
        );
    }
}
