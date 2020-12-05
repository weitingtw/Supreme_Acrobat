import React, { Component } from "react";
import axios from 'axios';

import { getHost } from '../../utils';

import PropTypes from "prop-types";
import "./Brat.css";

import collData from "./collData";
// import defaultDocData from './defaultDocData';

const options = {
  // assetsPath: "static/",
  // webFontURLs: [//
  //     'fonts/Astloch-Bold.ttf',
  //     'fonts/PT_Sans-Caption-Web-Regular.ttf',
  //     'fonts/Liberation_Sans-Regular.ttf'
  // ],
  // ajax: 'local',
  // overWriteModals: false,
  // maxFragmentLength: 30,
  // showTooltip: true
};

class Brat extends Component {
  state = {
    docData: this.props.docData,
  };
  collData = collData;

  componentDidMount() {
    var elem = document.getElementById("brat-editor");
    window.brat = new window.BratFrontendEditor(
      elem,
      this.collData,
      this.state.docData,
      options
    );
  }

  handleSubmit = () => {
    console.log(this.state.docData);
    const data = this.state.docData;

    axios.post(getHost() + "/api/putPendingCaseReport", data)
    .then(res => {
        console.log(res.data);
        if (res.data.success === false) {
            alert('upload failed')
        } else {
            alert('upload succeeded')
        }
    })

    // this should be the same? docData was passed by reference to brat!!
    // console.log(docData);
  };

  //   redraw = () => {
  //     if (window.brat != null) {
  //       window.brat.dispatcher.post("requestRenderData", [this.state.docData]);
  //       window.brat.dispatcher.post("current", [
  //         this.collData,
  //         this.state.docData,
  //         {},
  //       ]);
  //     }
  //   };

  render() {
    return (
      <div className="brat">
        <span className="button submit-report" onClick={this.handleSubmit}>
          submit case report
        </span>

        {/* <span className="button" onClick={this.redraw}>
          redraw
        </span> */}

        <div id="brat-editor" />
      </div>
    );
  }
}

Brat.propTypes = {
  docData: PropTypes.object.isRequired,
};

export default Brat;
