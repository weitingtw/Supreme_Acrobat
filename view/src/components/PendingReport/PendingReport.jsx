import React, { Component } from 'react';
import { buildFontAwesomeLib } from '../../utils';
import './PendingReport.css';
import axios from 'axios';
import { getHost, getGrobidHost } from '../../utils';


// build up fontawesome library in root component so everything
// children component can use fontAwesome
buildFontAwesomeLib();

class PendingReport extends Component {
    state = {
        reports: null
    };

    componentDidMount() {
        axios
            .get(getHost() + "/api/getPendingCaseReport")
            .then((res) => {
                const data = res.data.data;
                console.log(data)
                this.setState({ reports: data });
            })
            .catch((err) => console.log(err));
    }
    handleApprove = pmID => {
        axios.post(getHost() + "/api/approvePendingCaseReport", { pmID: pmID })
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

    handleReject = pmID => {
        axios.post(getHost() + "/api/deletePendingCaseReport", { pmID: pmID })
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
        console.log(localStorage.getItem('user'));
        console.log(JSON.parse(localStorage.getItem('user')));
        if (!(JSON.parse(localStorage.getItem('user')).admin)) {
            return <div>You are not an administrator</div>
        }
        const { reports } = this.state;

        if (reports && reports.length > 0) {
            console.log(reports)
            const content = reports.map((report, index) => (
                <div>
                    <div>PMID: {report.pmID} </div>
                    <div>Title: {report.title}</div>
                    <button onClick={() => this.handleApprove(report.pmID)}>approve</button>
                    <button onClick={() => this.handleReject(report.pmID)}>reject</button>
                </div>
            ));
            return <div>{content}</div>
        } else {
            return <div> There's no pending report</div>
        }
    }
}

export default PendingReport;
