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
import ucla_logo from "../../static/ucla.png";
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
    // let title = "A cold sympotom in a 57-year old patient";
    // let pub_date = "2019-03-24";
    // let doi = "10.1159/000330840";
    // let author = "Robert D. Rebeck, Isabel Ranges, Lebron D. Franklyn";
    // let keywords = ["Cough", "Fever", "Cold Sympotom"];
    console.log("docs~");
    console.log(docData);
    let text, // whole plain text of the case report
      entities, // entities for graph
      tokensToHighlight, // array of tokens to highlight
      textEntities, // plain text highlight entities
      title,
      authors,
      doi,
      keywords,
      abstract;

    const kwlink = [];

    if (docData) {
      ({ text, title, authors, doi, keywords, abstract } = docData);
      for (const [index, value] of keywords.entries()) {
        kwlink.push(<a href="/search">{value}</a>);
        if (index < keywords.length - 1) kwlink.push(", ");
      }
    }

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
      e: {
        color: "#f49541",
      },
    };

    const sidebar_content = (
      <div style={styles.root}>
        <div style={styles.header}>
          CREAT
          <span style={styles.e}>e</span>
        </div>
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
          <a key="annotated" href="#annotated" style={styles.sidebarLink}>
            Annotated Report
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
                      <React.Fragment>
                        <img
                          src={ucla_logo}
                          alt="uclalogo"
                          width="184.3"
                          height="60.5"
                        />
                        <LoginModal />
                      </React.Fragment>
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
                          <b>Case Report ID: </b>
                          {id}
                        </div>
                        <div className="report-info-item">
                          <b>DOI: </b>
                          {doi}
                        </div>
                        <div className="report-info-item">
                          <b>Keywords: </b>
                          {kwlink}
                        </div>
                      </div>
                      <div className="report-info-row">
                        <React.Fragment>
                          <div className="subgraph-container">
                            <EntityGraph
                              graphData={docData}
                              entities={entities}
                              viewBoxWidth={200}
                              viewBoxHeight={200}
                            />
                          </div>
                        </React.Fragment>
                      </div>
                    </div>

                    {abstract && (
                      <div className="report-section" id="abstract">
                        <div className="report-section-title">
                          <b>Abstract</b>
                        </div>
                        <div className="report-content">{abstract}</div>
                      </div>
                    )}

                    <div className="report-section" id="case_report">
                      <div className="report-section-title">
                        <b>Case Presentation</b>
                      </div>
                      <div className="report-content">{text}</div>
                    </div>
                    {docData && (
                      <div className="report-section" id="annotated">
                        <div calssName="report-section-title">
                          <b>Annotated Report</b>
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
