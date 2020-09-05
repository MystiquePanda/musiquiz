import React, { Component } from "react";

import { Route, Switch } from "react-router-dom";
import { Container, Row } from "react-bootstrap";

import { clientRoutes } from "shared/routes";
import MQUserBadge from "components/MQUserBadge";

export default class App extends Component {
    constructor(props) {
        super(props);

        let state = { ...this.props };
        if (typeof window !== "undefined" && window.__INITIAL_DATA__) {
            state = { ...window.__INITIAL_DATA__ };
        }

        if (state.data && typeof state.data.quiz !== "undefined") {
            state.onQuizReset = () => {
                this.setState((prev) => {
                    prev.data.quiz = undefined;
                    return prev;
                });
            };
        }

        this.state = state;
        console.debug("[App.js] STATE: ", this.state);
    }

    render() {
        const { userName, musicService } = this.state;

        return (
            <Container>
                <Row>
                    {typeof userName !== "undefined" && (
                        <MQUserBadge
                            musicService={musicService}
                            user={{ userName: userName }}
                        />
                    )}
                </Row>
                <Row className="justify-content-center container-body">
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
