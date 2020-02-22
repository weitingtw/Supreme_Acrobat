import React, { Component } from "react";

import { formatData } from "./graph-utils";

class EntityGraph extends Component {
  constructor(props) {
    super(props);

    const graph = this.initializeData(formatData(this.props.graphData));

    this.state = {
      allData: graph,
      currNodes: graph.nodes,
      currEdges: graph.edges,
      filter: null,
      layout: "force",
      width: 975,
      height: 610
    };
  }

  initializeData(data) {
    data.nodes.forEach(node => {
      node.cx = Math.floor(Math.random() * this.props.width);
      node.cy = Math.floor(Math.random() * this.props.height);
      node.radius = 4;
    });

    let nodesMap = this.mapNodes(data.nodes);

    data.edges.forEach(edge => {
      edge.source = nodesMap[edge.source];
      edge.target = nodesMap[edge.target];
    });

    return data;
  }

  mapNodes(nodes) {
    let nodesMap = {};
    nodes.forEach(node => {
      nodesMap[node.id] = node;
    });
    return nodesMap;
  }

  render() {
    return (
      <svg
        className="graph"
        style={{ border: "2px solid #bcbcbc" }}
        viewBox={`0 0 ${this.state.width} ${this.state.height}`}
      >
        <g id="nodes">
          {this.state.currNodes.map(n => (
            <circle
              className="node"
              cx={n.cx}
              cy={n.cy}
              r={n.radius}
              style={{ strokeWidth: 1.0 }}
            ></circle>
          ))}
        </g>
        <g id="edges"></g>
      </svg>
    );
  }
}

export default EntityGraph;
