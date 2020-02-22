import React, { Component } from "react";

import { formatData } from "./graph-utils";

class EntityGraph extends Component {
  constructor(props) {
    super(props);

    const graph = formatData(this.props.graphData);

    this.state = {
      allData: graph,
      currNodes: graph.nodes,
      currEdges: graph.edges,
      filter: null,
      layout: "force"
    };
  }
  render() {
    return (
      <svg
        className="graph"
        style={{ border: "2px solid #bcbcbc" }}
        viewBox="0 0 500 500"
      ></svg>
    );
  }
}

export default EntityGraph;
