import React, { Component } from "react";
import axios from 'axios';

import { Layout, Button, Modal, Row, Input } from 'antd';
import {ExclamationCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';

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
    confirmation_visible: false,

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
    // console.log(this.state.docData);
    const data = this.state.docData;

    axios.post(getHost() + "/api/putPendingCaseReport", data)
    .then(res => {
        console.log(res.data);
        if (res.data.success === false) {
            alert('upload failed')
        } else {
            alert('upload succeeded')
            this.closeModal();
        }
    })
    // this should be the same? docData was passed by reference to brat!!
    // console.log(docData);
  };

    redraw = () => {
      if (window.brat != null) {
        window.brat.dispatcher.post("requestRenderData", [this.state.docData]);
        window.brat.dispatcher.post("current", [
          this.collData,
          this.state.docData,
          {},
        ]);
      }
    };

    openModal = () => {
      this.setState({ confirmation_visible: true });
    }
  
    closeModal = () => {
      this.setState({ confirmation_visible: false });
  
    }

  render() {
    return (
      <div className="brat">
        <div className="button-container" >
          <Button onClick={this.openModal}>Submit Changes</Button>
        </div>
        <div id="brat-editor" />

        {/* <span className="button" onClick={this.redraw}>
          redraw
        </span> */}
        <Modal
                          visible={this.state.confirmation_visible}
                          onOk={this.handleSubmit}
                          onCancel={this.closeModal}
                          footer={null}
                          closeIcon={<CloseCircleOutlined />}
                          destroyOnClose={false}
          
        >
          <p className='modal-header'>Confirm</p>
          <p>Are you sure you want to submit the changes for review?</p>
          <div className='modal-button-container'>
            <Button onClick={this.closeModal}>No</Button>
            <Button type="primary" onClick={this.handleSubmit}>Yes</Button>
          </div>

        </Modal>

      </div>
    );
  }
}


Brat.propTypes = {
  docData: PropTypes.object.isRequired,
};

export default Brat;
