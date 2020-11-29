import React, { Component } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import Brat from "../Brat/Brat";
import Graph from "../Graph/Graph";
import { PacmanLoader } from "react-spinners";
import { FileTextOutlined } from '@ant-design/icons';
import { addHighLight } from "../../utils";
import "./DisplayPage.css";
import { getHost } from "../../utils";
import * as QueryString from "query-string";

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
        console.log("gettttt dataaaaa");
        console.log(data);
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
      title,
      authors,
      doi="",
      keywords,
      abstract;
    const base_link = "https://pubmed.ncbi.nlm.nih.gov/?term=";
    const keyword_link = "/getKeyword/";
    const kwlink = [];
    const author_li = [];
    const auth_aff_li = [];

    if (docData) {
      ({ text, title, authors, doi, keywords, abstract } = docData);
      console.log(keywords == "");
      if (!(keywords == "" || keywords[0] === "none" || keywords === "[]" || keywords === undefined)) {
        if (keywords[0]) {
          for (const [index, value] of keywords.entries()) {
            kwlink.push(<a href={keyword_link + value}>{value}</a>);
            if (index < keywords.length - 1) kwlink.push("; ");
          }
        }
        kwlink.push(".");
      }

      for (const [index, value] of authors.entries()) {
        if (isNaN(value["id"])) {
          author_li.push(
            <a href={base_link + value["name"] + "[Author]"}>{value["name"]}</a>
          );
        } else {
          author_li.push(
            <span>
              <a href={base_link + value["name"] + "[Author]"}>
                {value["name"]}
              </a>
              <sup>{value["id"]}</sup>
            </span>
          );
          auth_aff_li.push(
            <dd className="aff-item">{value["id"] + ". " + value["aff"]}</dd>
          );
        }
        if (index < authors.length - 1) author_li.push(", ");
      }
      author_li.push(".");
    }
    console.log("title: " + title);
    console.log("keywords: ");
    console.log(kwlink);

    entities = [];
    if (this.props.location.search) {
      console.log("hey we have states!");

      const entityQuery = QueryString.parse(this.props.location.search);
      console.log(entityQuery);
      const searchEntities = JSON.parse(entityQuery["searchEntities"]);
      let graphEntities;
      if (entityQuery["entities"] !== "undefined") {
        graphEntities = JSON.parse(entityQuery["entities"]);
      }
      tokensToHighlight = searchEntities.filter(x => x.type !== 'O').map((e) => e.label);
      // Entities
      if (graphEntities) {
        for (var i = 0; i < graphEntities.length; i++) {
          for (var j = 0; j < graphEntities[i].length; j++) {
            entities.push(graphEntities[i][j]);
          }
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
                      <FileTextOutlined />
                      {title}
                    </div>
                    <div className="report-info">
                      <div className="report-info-block">
                        <table className="">
                          {author_li.length > 0 && <tr className="table-row">
                            <th className="table-title">Authors:</th>
                            <th className="table-content">
                              {author_li}
                              <dl className="aff">{auth_aff_li}</dl>
                            </th>
                          </tr>}
                          <tr className="table-row">
                            <td className="table-title">PubMed ID:</td>
                            <td className="table-content">
                              <a href={base_link + id}>{id}</a>
                            </td>
                          </tr>
                          {doi != "" && <tr className="table-row">
                            <td className="table-title">DOI:</td>
                            <td className="table-content">
                              <a href={"https://doi.org/" + doi}>{doi}</a>
                            </td>
                          </tr>}
                          {kwlink.length > 0 && <tr className="table-row">
                            <td className="table-title">Keywords:</td>
                            <td className="table-content">{kwlink}</td>
                          </tr>}
                        </table>
                      </div>
                      {entities && entities.length > 0 && (
                        <div className="report-info-block">
                          <React.Fragment>
                            <div className="subgraph-container">
                              <EntityGraph
                                graphData={docData}
                                entities={entities}
                                viewBoxWidth={400}
                                viewBoxHeight={250}
                              />
                            </div>
                          </React.Fragment>
                        </div>
                      )}
                    </div>

                    {abstract && (
                      <div className="report-section" id="abstract">
                        <div className="report-section-title">
                          <h5>Abstract</h5>
                        </div>
                        <div
                          className="report-content"
                          dangerouslySetInnerHTML={{
                            __html: addHighLight(abstract, tokensToHighlight),
                          }}
                        />
                      </div>
                    )}

                    <div className="report-section" id="case_report">
                      <div className="report-section-title">
                        <h5>Case Presentation</h5>
                      </div>
                      <div
                        className="report-content"
                        dangerouslySetInnerHTML={{
                          __html: addHighLight(text, tokensToHighlight),
                        }}
                      />
                    </div>
                    {docData && (
                      <div className="report-section" id="annotated">
                        <div calssName="report-section-title">
                          <h5>Annotated Report</h5>
                        </div>
                        <div className="brat-container">
                          <Brat docData={docData} />
                        </div>
                      </div>
                    )}

                    {docData && (
                      <div className="report-section" id="relation">
                        <div calssName="report-section-title">
                          <h5>Relation Graph</h5>
                        </div>
                        <React.Fragment>
                          <div className="graph-container">
                            <EntityGraph
                              graphData={docData}
                              viewBoxWidth={800}
                              viewBoxHeight={800}
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
