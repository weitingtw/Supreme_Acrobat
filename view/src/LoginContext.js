import React, { Component } from "react";
const context = React.createContext();

class LoginContextProvider extends Component {
    state = {
        email: "",
        createdAt: ""
    };

    setInfo = (email, createdAt) => {
        this.setState(prevState => {
            return {
                email: email,
                cratedAt: createdAt
            };
        });
    };

    render() {
        return (
            <context.Provider
                value={{ email: this.state.email, createdAt: this.state.createdAt, setInfo: this.setInfo }}
            >
                {this.props.children}
            </context.Provider>
        );
    }
}

export { LoginContextProvider, context as LoginContext };
