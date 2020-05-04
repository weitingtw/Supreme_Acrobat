import React, { Component } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import Brat from "../Brat/Brat";
import Graph from "../Graph/Graph";
import { PacmanLoader } from "react-spinners";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { addHighLight } from "../../utils";
import "./DisplayPage.css";
import { getHost } from "../../utils";

import Sidebar from "react-sidebar";
import LoginModal from "../LoginModal/LoginModal";
import EntityGraph from "../EntityGraph/EntityGraph";

class DisplayPage extends Component {
  state = {
    docData: null,
  };

  componentDidMount() {
    const { id } = this.props.match.params;
    axios
      .post(getHost() + "/api/getCaseReportById", { id })
      .then((res) => {
        const data = res.data.data[0];
        this.setState({ docData: data });
      })
      .catch((err) => console.log(err));
  }

  render() {
    const { id } = this.props.match.params;
    const { docData } = this.state;
    //let title = "A cold sympotom in a 57-year old patient";
    let pub_date = "2019-03-24";
    console.log("docdata");
    console.log(docData);

    let text, // whole plain text of the case report
      entities, // entities for graph
      tokensToHighlight, // array of tokens to highlight
      textEntities, // plain text highlight entities
      authors,
      keywords,
      abstract,
      doi,
      title;

    if (docData) {
      ({ text, doi, title, keywords, abstract, authors } = docData);
    }
    console.log("title: " + title);
    console.log("keywords: " + keywords);
    const kwlink = [];
    // for (const [index, value] of keywords.entries()) {
    //   kwlink.push(<a href="/search">{value}</a>);
    //   kwlink.push(", ");
    // }

    entities = [];

    if (this.props.location.state) {
      ({ textEntities } = this.props.location.state);
      tokensToHighlight = textEntities.map((e) => e.label);
      // Entities
      for (var i = 0; i < this.props.location.state.entities.length; i++) {
        for (var j = 0; j < this.props.location.state.entities[i].length; j++) {
          entities.push(this.props.location.state.entities[i][j]);
        }
      }
      entities = [...new Set(entities)];
    }
    const styles = {
      sidebar: {
        width: 400,
        height: "100%",
      },
      sidebarLink: {
        width: "inherit",
        display: "block",
        padding: "16px 0px",
        color: "#757575",
        textDecoration: "none",
      },
      divider: {
        margin: "8px 0",
        height: 1,
        backgroundColor: "#757575",
      },
      content: {
        padding: "16px",
        height: "100%",
        backgroundColor: "white",
        display: "inline-block",
        textAlign: "center",
        width: "-webkit-fill-available",
      },
      display: "inline-block",
      root: {
        fontFamily:
          '"HelveticaNeue-Light", "Helvetica Neue Light", "Helvetica Neue", Helvetica, Arial, "Lucida Grande", sans-serif',
        fontWeight: 300,
        width: 200,
        height: "100%",
      },
      header: {
        backgroundColor: "#03a9f4",
        color: "white",
        padding: "16px",
        fontSize: "24px",
      },
    };

    const sidebar_content = (
      <div style={styles.root}>
        <div style={styles.header}>Menu</div>
        <div style={styles.content}>
          <a href="/" style={styles.sidebarLink}>
            Home
          </a>
          <a href="/search" style={styles.sidebarLink}>
            Search
          </a>
          <div style={styles.divider} />
          <a key="title" href="#title" style={styles.sidebarLink}>
            Title
          </a>
          <a key="case_report" href="#case_report" style={styles.sidebarLink}>
            Case Presentation
          </a>
          <a key="brat" href="#brat" style={styles.sidebarLink}>
            Brat Graph
          </a>
          <a key="relation" href="#relation" style={styles.sidebarLink}>
            Relation Graph
          </a>
        </div>
      </div>
    );

    return (
      <div>
        {docData && (
          <div>
            <div>
              <div styles={styles.diaplay}>
                <Sidebar
                  sidebar={sidebar_content}
                  styles={{ sidebar: { background: "white" } }}
                  docked={true}
                  shadow={true}
                >
                  <div className="display-page">
                    <div className="banner">
                      <a className="banner-title" href="/">
                        CREAT
                        <span className="E">e</span>
                      </a>
                      <LoginModal />
                    </div>
                    <div className="brat-intro" id="title">
                      <FontAwesomeIcon icon={["fal", "file-alt"]} />
                      {title}
                    </div>
                    <div className="report-info">
                      <div className="report-info-row">
                        <div className="report-info-item">
                          <b>Authors: </b>
                          {authors}
                        </div>
                        <div className="report-info-item">
                          <b>Date Published: </b>
                          {pub_date}
                        </div>
                      </div>
                      <div className="report-info-row">
                        <div className="report-info-item">
                          <b>Case Report ID: </b>
                          {id}
                        </div>
                        <div className="report-info-item">
                          <b>DOI: </b>
                          {doi}
                        </div>
                      </div>
                      <div className="report-info-row">
                        <b>Keywords: </b>
                        {kwlink}
                      </div>
                    </div>

                    <div className="report-section" id="case_report">
                      <div className="report-section-title">
                        <b>Case Presentation</b>
                      </div>
                      <div className="report-content">{text}</div>
                    </div>
                    {docData && (
                      <div className="report-section" id="brat">
                        <div calssName="report-section-title">
                          <b>Brat Graph</b>
                        </div>
                        <div className="brat-container">
                          <Brat docData={docData} />
                        </div>
                      </div>
                    )}

                    {docData && (
                      <div className="report-section" id="relation">
                        <div calssName="report-section-title">
                          <b>Relation Graph</b>
                        </div>
                        <React.Fragment>
                          <div className="subgraph-container">
                            <EntityGraph
                              graphData={docData}
                              entities={entities}
                              viewBoxWidth={500}
                              viewBoxHeight={500}
                            />
                          </div>
                          <div className="graph-container">
                            <EntityGraph
                              graphData={docData}
                              viewBoxWidth={500}
                              viewBoxHeight={500}
                            />
                          </div>
                        </React.Fragment>
                      </div>
                    )}
                  </div>
                </Sidebar>
              </div>
            </div>
          </div>
        )}
        {!docData && (
          <div className="loading-container">
            <span className="loading-text">Loading ......</span>
            <PacmanLoader
              sizeUnit={"px"}
              size={150}
              color={"rgb(1, 136, 203)"}
            />
          </div>
        )}
      </div>
    );
  }
}

// DisplayPage.propTypes = {
//     id: PropTypes.number.isRequired
// };

export default DisplayPage;
