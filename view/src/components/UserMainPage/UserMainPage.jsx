import React, { Component } from 'react';
import { buildFontAwesomeLib } from '../../utils';
import './UserMainPage.css';

// build up fontawesome library in root component so everything
// children component can use fontAwesome
buildFontAwesomeLib();

class UserMainPage extends Component {
    state = {};
    componentDidMount() {
        let user = JSON.parse(localStorage.getItem('user'));
        this.setState(user);
    }
    render() {
        const { email, first, last, org, createdAt, username } = this.state;

        return (
            <div id='mainPage'>
                <div>username: {username}</div>
                <div>email: {email}</div>
                <div>organization: {org}</div>
                <div>name: {last}, {first}</div>
                <div>registered at: {createdAt}</div>
            </div>
        );
    }
}

export default UserMainPage;
