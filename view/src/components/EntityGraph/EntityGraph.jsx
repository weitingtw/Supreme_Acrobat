import React, { Component } from "react";
import {
  forceSimulation,
  forceManyBody,
  forceLink,
  forceCenter
} from "d3-force";

import { formatData } from "./graph-utils";

class EntityGraph extends Component {
  constructor(props) {
    super(props);

    const graph = this.initializeData(formatData(this.props.graphData));

    this.state = {
      allData: graph,
      currNodes: [],
      currEdges: [],
      filter: null,
      layout: "force",
      width: 975,
      height: 610
    };
  }

  initializeData(data) {
    data.nodes.forEach(node => {
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

  componentDidMount() {
    const currNodes = this.state.allData.nodes;
    const currEdges = this.state.allData.edges;

    const simulation = forceSimulation(currNodes)
      .force("charge", forceManyBody().strength(-10))
      .force("link", forceLink(currEdges))
      .force("center", forceCenter());
    simulation.on("tick", () => {
      this.setState({ currNodes: currNodes });
      this.setState({ currEdges: currEdges });
    });
  }

  render() {
    return (
      <svg
        className="graph"
        style={{ border: "2px solid #bcbcbc" }}
        viewBox={`${-this.state.width / 2} ${-this.state.height / 2} ${
          this.state.width
        } ${this.state.height}`}
      >
        <g id="edges">
          {this.state.currEdges.map(e => (
            <line
              className="edge"
              x1={e.source.x}
              y1={e.source.y}
              x2={e.target.x}
              y2={e.target.y}
              stroke="#ccc"
              strokeOpacity={0.8}
            ></line>
          ))}
        </g>
        <g id="nodes">
          {this.state.currNodes.map(n => (
            <circle
              className="node"
              cx={n.x}
              cy={n.y}
              r={n.radius}
              style={{ strokeWidth: 1.0 }}
            ></circle>
          ))}
        </g>
      </svg>
    );
  }
}

export default EntityGraph;
