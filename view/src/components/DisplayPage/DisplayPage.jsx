import React, { Component } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios'
import Brat from '../Brat/Brat'
import Graph from '../Graph/Graph'
import { PacmanLoader } from 'react-spinners';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { addHighLight } from '../../utils';
import './DisplayPage.css';
import { getHost } from '../../utils';

import Sidebar from "react-sidebar";


class DisplayPage extends Component {
    state = {
        docData: null,
    }


    componentDidMount() {
        const { id } = this.props.match.params;
        console.log("in did mount");

        axios.post(getHost() + ":3001/api/getCaseReportById", { id })
            .then(res => {
              console.log(res.data);
                const data = res.data.data[0];
                this.setState({ docData: data })
            })
            .catch(err => console.log(err));
    }


    render() {
        const { id } = this.props.match.params;
        const { docData } = this.state;
        let title = "A cold sympotom in a 57-year old patient";
        let pub_date = "2019-03-24";
        let doi = "10.1159/000330840";
        let author = "Robert D. Rebeck, Isabel Ranges, Lebron D. Franklyn";
        let keywords = ["Cough", "Fever", "Cold Sympotom"];
        const kwlink = [];
        for (const [index, value] of keywords.entries()) {
          kwlink.push(<a href="/search">{value}</a>);
          kwlink.push(", ");
        }

        let text,                   // whole plain text of the case report
            entities,               // entities for graph
            tokensToHighlight,      // array of tokens to highlight
            textEntities;           // plain text highlight entities
        if (docData) { ({ text } = docData); }
        if (this.props.location.state) {
            // console.log('data:', this.props.location.state);
            ({ entities, textEntities } = this.props.location.state);
            console.log(textEntities);
            tokensToHighlight = textEntities.map(e => e.label);
            console.log('tokensToHighlight:', tokensToHighlight);
        }
        const styles = {
          sidebar: {
            width: 400,
            height: "100%"
          },
          sidebarLink: {
            width: "inherit",
            display: "block",
            padding: "16px 0px",
            color: "#757575",
            textDecoration: "none"
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
            height: "100%"
          },
          header: {
            backgroundColor: "#03a9f4",
            color: "white",
            padding: "16px",
            fontSize: "1.5em"
          }
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
                <a key="title" href="#title" style={styles.sidebarLink}>Title</a>
                <a key="case_report" href="#case_report" style={styles.sidebarLink}>Case Presentation</a>
                <a key="brat" href="#brat" style={styles.sidebarLink}>Brat Graph</a>
                <a key="relation" href="#relation" style={styles.sidebarLink}>Relation Graph</a>
            </div>
          </div>
        );

        return (
            <div>

                <div className="banner">
                banner
                </div>

                <div className="content">
                  <div styles={styles.diaplay}>
                    <Sidebar
                      sidebar={sidebar_content}
                      styles={{ sidebar: { background: "white" } }}
                      docked={true}
                      shadow={true}
                    >
                    <div className='display-page'>
                      <div className='brat-intro' id="title">
                          <FontAwesomeIcon icon={['fal', 'file-alt']} />
                          {title}
                      </div>
                      <div className="report-info">
                        <div className="report-info-row">
                          <div className="report-info-item"><b>Authors: </b>{author}</div>
                          <div className="report-info-item"><b>Date Published: </b>{pub_date}</div>
                        </div>
                        <div className="report-info-row">
                          <div className="report-info-item"><b>Case Report ID: </b>{id}</div>
                          <div className="report-info-item"><b>DOI: </b>{doi}</div>
                        </div>
                        <div className="report-info-row"><b>Keywords: </b>{kwlink}</div>
                      </div>

                      <div className="report-section" id="case_report">
                        <div calssName="report-section-title"><b>Case Presentation</b></div>
                        <div className="report-content">{text}</div>
                      </div>
                      {docData &&
                        <div className="report-section" id="brat">
                            <div calssName="report-section-title"><b>Brat Graph</b></div>
                            <div className='brat-container'>
                                <Brat docData={docData} />
                            </div>
                        </div>
                      }

                        {docData &&
                          <div className="report-section" id='relation'>
                            <div calssName="report-section-title"><b>Relation Graph</b></div>
                            <div className='graph-container'>
                                <Graph
                                    graphData={docData}
                                    entities={entities}
                                />
                            </div>
                          </div>
                        }
                    </div>
                    </Sidebar>
                  </div>

                  {!docData &&
                        <div className='loading-container'>
                            {`Loading ......`}
                            <PacmanLoader
                                sizeUnit={"px"}
                                size={150}
                                color={'rgb(1, 136, 203)'}
                            />
                        </div>
                    }

                </div>
            </div>
        );
    }
}

// DisplayPage.propTypes = {
//     id: PropTypes.number.isRequired
// };
// <div className="report" styles={styles.content}>
//
//
//
//   {docData &&
//       <div
//           className='report-plain-text'
//           dangerouslySetInnerHTML={{
//               __html: addHighLight(text, tokensToHighlight)
//           }}
//       />
//   }
//
//   {docData &&
//       <div className='brat-container'>
//           <Brat docData={docData} />
//       </div>
//   }
//
//   {docData &&
//       <div className='graph-container'>
//           <Graph
//               graphData={docData}
//               entities={entities}
//           />
//       </div>
//   }
//
//
//
// </div>


export default DisplayPage;
