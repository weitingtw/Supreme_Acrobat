import React, { Component } from 'react';
import { buildFontAwesomeLib } from '../../utils';
import { Button, Modal } from 'antd';
import { CloseCircleOutlined } from '@ant-design/icons';
import './Authorization.css';
import axios from 'axios';
import { getHost, getGrobidHost } from '../../utils';


// build up fontawesome library in root component so everything
// children component can use fontAwesome

class Authorization extends Component {
    state = {
    };

    componentDidMount() {
        axios
            .get(getHost() + "/api/getAuthorization")
            .then((res) => {
                const data = res.data.data;
                console.log(data)
                this.setState({ authorizations: data });
            })
            .catch((err) => console.log(err));
    }

    handleApprove = email => {
        axios.post(getHost() + "/api/approveAuthorization", { email: email })
            .then(res => {
                // console.log(res.data);
                if (res.data.success === true) {
                    alert('approve succeeded')
                } else {
                    alert('approve failed!')
                }
                this.componentDidMount();
            })
            .catch((err) => console.log(err));
    }

    handleReject = email => {
        axios.post(getHost() + "/api/deleteAuthorization", { email: email })
            .then(res => {
                // console.log(res.data);
                if (res.data.success === true) {
                    alert('reject succeeded')
                } else {
                    alert('reject failed!')
                }
                this.componentDidMount();
            })
            .catch((err) => console.log(err));
    }

    render() {
        const { authorizations } = this.state;
        console.log(this.state);
        if (authorizations && authorizations.length > 0) {
            console.log(authorizations)
            const content = authorizations.map((authorization, index) => (
                <div>
                    <div>email: {authorization.email} </div>
                    <button onClick={() => this.handleApprove(authorization.email)}>approve</button>
                    <button onClick={() => this.handleReject(authorization.email)}>reject</button>
                </div>
            ));
            return <div>{content}</div>
        } else {
            return <div> There's no pending authorizations</div>
        }
    }
}

export default Authorization;
