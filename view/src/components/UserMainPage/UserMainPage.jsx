import React, { Component } from 'react';
import { buildFontAwesomeLib } from '../../utils';
import './UserMainPage.css';

// build up fontawesome library in root component so everything
// children component can use fontAwesome
buildFontAwesomeLib();

class UserMainPage extends Component {
    state = {};

    render() {
        return (
            <div id='mainPage'>
                This is the user main page
            </div>
        );
    }
}

export default UserMainPage;
