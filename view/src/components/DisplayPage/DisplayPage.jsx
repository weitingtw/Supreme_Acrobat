import React, { Component } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import Brat from "../Brat/Brat";
import { PacmanLoader } from "react-spinners";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { addHighLight } from "../../utils";
import "./DisplayPage.css";
import { getHost } from "../../utils";
import EntityGraph from "../EntityGraph/EntityGraph";
import EGraph from "../EntityGraph/EGraph";

class DisplayPage extends Component {
  state = {
    docData: null,
  };

  componentDidMount() {
    const { id } = this.props.match.params;

    axios
      .post(getHost() + ":3001/api/getCaseReportById", { id })
      .then((res) => {
        const data = res.data.data[0];
        this.setState({ docData: data });
      })
      .catch((err) => console.log(err));
  }

  render() {
    const { id } = this.props.match.params;
    const { docData } = this.state;
    let text, // whole plain text of the case report
      entities, // entities for graph
      tokensToHighlight, // array of tokens to highlight
      textEntities; // plain text highlight entities
    if (docData) {
      ({ text } = docData);
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

    return (
      <div className="display-page">
        <div className="brat-intro">
          <FontAwesomeIcon icon={["fal", "file-alt"]} />
          Details about case report <span className="report-id">{id}</span>
        </div>
        {docData && (
          <div
            className="report-plain-text"
            dangerouslySetInnerHTML={{
              __html: addHighLight(text, tokensToHighlight),
            }}
          />
        )}
        {docData && (
          <React.Fragment>
            {/* <div className="subgraph-container">
              <EntityGraph graphData={docData} entities={entities} />
            </div>
            <div className="graph-container">
              <EntityGraph graphData={docData} />
            </div> */}
            <div className="subgraph-container">
              <EGraph
                graphData={docData}
                entities={entities}
                viewBoxWidth={150}
                viewBoxHeight={150}
              />
            </div>
            <div className="graph-container">
              <EGraph
                graphData={docData}
                viewBoxWidth={500}
                viewBoxHeight={500}
              />
            </div>
          </React.Fragment>
        )}
        {docData && (
          <div className="brat-container">
            <Brat docData={docData} />
          </div>
        )}
        }
        {!docData && (
          <div className="loading-container">
            {`Loading ......`}
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
