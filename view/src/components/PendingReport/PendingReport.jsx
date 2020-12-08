import React, { Component } from "react";
import { buildFontAwesomeLib } from "../../utils";
import { Button, Modal } from "antd";
import { CloseCircleOutlined } from "@ant-design/icons";
import "./PendingReport.css";
import axios from "axios";
import { getHost, getGrobidHost } from "../../utils";

import collData from "../Brat/collData";

// build up fontawesome library in root component so everything
// children component can use fontAwesome
buildFontAwesomeLib();

class PendingReport extends Component {
  state = {
    details_visible: false,
    brat_visible: false,
    curContent: {},
  };

  componentDidMount() {
    axios
      .get(getHost() + "/api/getPendingCaseReport")
      .then((res) => {
        const data = res.data.data;
        console.log(data);
        this.setState({ reports: data });
      })
      .catch((err) => console.log(err));
  }

  openModal = (index) => {
    this.setModalContent(index);
    this.setState({ details_visible: true });
  };

  closeModal = () => {
    this.setState({ details_visible: false });
    this.setState({ brat_visible: false });
  };

  showBrat = (curContent) => {
    const options = {};
    if (
      !(
        Object.keys(curContent).length === 0 &&
        curContent.constructor === Object
      )
    ) {
      var elem = document.getElementById("brat-editor");
      window.brat = new window.BratFrontendEditor(
        elem,
        collData,
        curContent,
        options
      );
    }
    document.getElementById("brat-editor").style.display = "block";

    this.setState({ brat_visible: true });
  };

  hideBrat = () => {
    document.getElementById("brat-editor").style.display = "none";
    this.setState({ brat_visible: false });
  };

  handleApprove = (pmID) => {
    axios
      .post(getHost() + "/api/approvePendingCaseReport", { pmID: pmID })
      .then((res) => {
        // console.log(res.data);
        if (res.data.success === true) {
          alert("approve succeeded");
        } else {
          alert("approve failed!");
        }
        this.componentDidMount();
      })
      .catch((err) => console.log(err));
  };

  handleReject = (pmID) => {
    axios
      .post(getHost() + "/api/deletePendingCaseReport", { pmID: pmID })
      .then((res) => {
        // console.log(res.data);
        if (res.data.success === true) {
          alert("reject succeeded");
        } else {
          alert("reject failed!");
        }
        this.componentDidMount();
      })
      .catch((err) => console.log(err));
  };

  setModalContent = (index) => {
    this.setState({ curContent: this.state.reports[index] });
  };
  render() {
    if (!JSON.parse(localStorage.getItem("user")).admin) {
      return <div>You are not an administrator</div>;
    }
    const { reports, details_visible, curContent, brat_visible } = this.state;
    console.log(this.state);
    if (reports && reports.length > 0) {
      console.log(reports);
      const content = reports.map((report, index) => {
        console.log(index);
        return (
          <div>
            <div>PMID: {report.pmID} </div>
            <div>Title: {report.title}</div>
            <div>
              {" "}
              <Button
                onClick={() => {
                  this.openModal(index);
                }}
              >
                show details
              </Button>
            </div>
            <button onClick={() => this.handleApprove(report.pmID)}>
              approve
            </button>
            <button onClick={() => this.handleReject(report.pmID)}>
              reject
            </button>
          </div>
        );
      });

      return (
        <div>
          {content}
          <Modal
            visible={details_visible}
            onCancel={this.closeModal}
            footer={null}
            closeIcon={<CloseCircleOutlined />}
            width={620}
            destroyOnClose={true}
          >
            <Button
              onClick={() => {
                console.log(this.state.brat_visible);
                if (this.state.brat_visible) {
                  this.hideBrat();
                } else {
                  this.showBrat(curContent);
                }
              }}
            >
              {brat_visible ? "hide annotations" : "show annotations"}
            </Button>
            <div>PMID: {curContent.pmID}</div>
            <div>Title: {curContent.title}</div>

            <div>
              Authors:{" "}
              {curContent.authors
                ? curContent.authors.map((author, index) => {
                    return <span> {author.name}</span>;
                  })
                : ""}
            </div>
            <div>DOI: {curContent.doi}</div>
            <div>Keywords: {String(curContent.keywords)}</div>
            {!brat_visible && <div>Content: {curContent.text}</div>}
            <div id="brat-editor" style={{ display: { brat_visible } }} />
          </Modal>
        </div>
      );
    } else {
      return <div> There's no pending report</div>;
    }
  }
}

export default PendingReport;
