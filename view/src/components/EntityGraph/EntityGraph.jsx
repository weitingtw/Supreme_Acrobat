import React, { Component } from "react";
import {
  forceSimulation,
  forceManyBody,
  forceLink,
  forceCenter,
  forceCollide,
  forceX
} from "d3-force";

import "./EntityGraph.css";

import { extent } from "d3-array";

import { formatData } from "./graph-utils";

class EntityGraph extends Component {
  constructor(props) {
    super(props);

    const graph = this.initializeData(formatData(this.props.graphData));
    const adjList = this.getAdjacencyList(graph.edges);
    const subGraph = this.props.entities
      ? this.getSubGraph(graph, adjList, this.props.entities)
      : null;

    const nodeColors = {
      Age: "#EDC1F0", // Entities
      Sex: "#EDC1F0",
      Personal_background: "#EDC1F0",
      Occupation: "#EDC1F0",
      Weigh: "#EDC1F0",
      Height: "#EDC1F0",
      History: "ellipse",
      Family_history: "#EDC1F0",
      Family_member: "#EDC1F0",
      Medication: "#2FCACA",
      Lab: "#8f97ff",
      Therapeutic_procedure: "#6495ed",
      Diagnostic_procedure: "#9fdfff",
      Sign_disease: "#f4eded",
      Sign_symptom: "#DAE48B",
      Disease_disorder: "#EB8315",
      Activity: "#E07BAF",
      Clinical_event: "#E07BAF",
      Outcome: "#E07BAF",
      Subject: "#ffd700",
      Negation: "#ffd700",
      Uncertainty: "#ffd700",
      Condition: "#ffd700",
      Quantitative_concept: "#ffd700",
      Qualitative_concept: "#ffd700",
      Other_entity: "#c1cdcd",
      Other_event: "#c1cdcd",
      Administration: "#ffd700",
      Dosage: "#ffd700",
      Frequency: "#ffd700",
      Cause: "#ffd700",
      Complication: "#ffd700",
      Severity: "#ffd700",
      Location: "#ffd700",
      Result_outcome: "#ffd700",
      Lab_value: "#A04AF0",
      Biological_structure: "#ffd700",
      Detail_description: "#ffd700",
      Biological_attribute: "#ffd700",
      Nonbiological_location: "#ffd700",
      Detailed_description: "#ffd700",
      Distance: "#ffd700",
      Area: "#ffd700",
      Volume: "#ffd700",
      Mass: "#ffd700",
      Color: "#ffd700",
      Shape: "#ffd700",
      Texture: "#ffd700",
      Coreference: "#808000",
      Date: "#8fee90",
      Duration: "#8fee90",
      OVERLAP: "#fff"
    };

    this.state = {
      currNodes: this.props.entities ? subGraph.nodes : graph.nodes,
      currEdges: this.props.entities ? subGraph.edges : graph.edges,
      layout: "force",
      colors: nodeColors,
      adjList: adjList,
      activeNode: null
    };
  }

  initializeData(data) {
    data.nodes.forEach(node => {
      if (node.type == "OVERLAP") {
        node.radius = 5;
      } else {
        node.radius = 12;
      }
    });

    let nodesMap = this.mapNodes(data.nodes);

    data.edges.forEach(edge => {
      edge.source = nodesMap[edge.source];
      edge.target = nodesMap[edge.target];
    });

    return data;
  }

  getOverlaps(nodesIDs, adjList) {
    const overlaps = [];
    nodesIDs.forEach(id => {
      if (id.includes("OV")) {
        overlaps.push(id);
      }
      adjList[id].forEach(neighborID => {
        if (neighborID.includes("OV")) {
          overlaps.push(neighborID);
        }
      });
    });
    return overlaps;
  }

  getSubGraph(graph, adjList, query) {
    // get set of all nodes that belong depending on the query
    const subGraphNodeIDs = new Set();
    const overlaps = this.getOverlaps(query, adjList);

    const overlappingNodes = [];

    // get all nodes in the overlap
    overlaps.forEach(ovID => {
      adjList[ovID].forEach(neighborID => {
        overlappingNodes.push(neighborID);
      });
    });

    // get neighbors of all overlapping nodes and add to the set.
    overlappingNodes.forEach(nodeID => {
      subGraphNodeIDs.add(nodeID);
      adjList[nodeID].forEach(neighborID => {
        subGraphNodeIDs.add(neighborID);
      });
    });

    // then filter: if the node has id that is in the set, then it belongs
    const nodes = graph.nodes;
    let subGraphNodes = nodes.filter(node => subGraphNodeIDs.has(node.id));
    let subGraphEdges = graph.edges.filter(
      edge =>
        subGraphNodeIDs.has(edge.source.id) &&
        subGraphNodeIDs.has(edge.target.id)
    );
    return { nodes: subGraphNodes, edges: subGraphEdges };
  }

  mapNodes(nodes) {
    let nodesMap = {};
    nodes.forEach(node => {
      nodesMap[node.id] = node;
    });
    return nodesMap;
  }

  componentDidMount() {
    const nodes = this.state.currNodes;
    const edges = this.state.currEdges;
    const chargeForce = this.props.entities
      ? forceManyBody().strength(-50)
      : forceManyBody().strength(-100);

    let simulation = forceSimulation(nodes)
      .force("charge", chargeForce)
      .force(
        "link",
        forceLink(edges)
          .distance(10)
          .strength(1)
      )
      .force("collision", forceCollide(30))
      .force("center", forceCenter());
    simulation.tick(100);

    simulation.on("tick", () => {
      this.setState({ currNodes: nodes });
      this.setState({ currEdges: edges });
    });

    document.querySelectorAll(".node").forEach(node => {
      node.addEventListener("mouseenter", event => {
        this.handleMouseEnter(event);
      });
      node.addEventListener("mouseleave", event => {
        this.handleMouseLeave(event);
      });
    });
  }

  handleMouseEnter = event => {
    const id = event.srcElement.classList[0];
    this.setState({ activeNode: id });
  };

  handleMouseLeave = event => {
    this.setState({ activeNode: null });
  };

  getAdjacencyList(edges) {
    const res = {};
    edges.forEach(edge => {
      if (!res[edge.source.id]) {
        res[edge.source.id] = new Set();
      }
      if (!res[edge.target.id]) {
        res[edge.target.id] = new Set();
      }
      res[edge.source.id].add(edge.target.id);
      res[edge.target.id].add(edge.source.id);
    });
    return res;
  }

  getNodeClassList = id => {
    if (
      (this.state.activeNode &&
        this.state.adjList[this.state.activeNode].has(id)) ||
      this.state.activeNode == id
    ) {
      return `${id} node active`;
    }
    return `${id} node`;
  };

  getEdgeClassList = (source, target) => {
    const activeNode = this.state.activeNode;
    if (activeNode && (activeNode == source || activeNode == target)) {
      return "edge active";
    }
    return "edge";
  };

  wordWrap = (text, anchor) => {
    const words = text.split(" ");
    const textSegments = (
      <React.Fragment>
        <tspan x={anchor} dy="0em">
          {words[0]}
        </tspan>
        {words.slice(1).map(word => (
          <tspan x={anchor} dy="1em">
            {word}
          </tspan>
        ))}
      </React.Fragment>
    );
    return textSegments;
  };

  // Source: https://www.sitepoint.com/javascript-generate-lighter-darker-color/
  colorLuminance = (hex, lum) => {
    // validate hex string
    hex = String(hex).replace(/[^0-9a-f]/gi, "");
    if (hex.length < 6) {
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    lum = lum || 0;

    // convert to decimal and change luminosity
    var rgb = "#",
      c,
      i;
    for (i = 0; i < 3; i++) {
      c = parseInt(hex.substr(i * 2, 2), 16);
      c = Math.round(Math.min(Math.max(0, c + c * lum), 255)).toString(16);
      rgb += ("00" + c).substr(c.length);
    }

    return rgb;
  };

  render() {
    const xDomain = extent(this.state.currNodes, node => node.x);
    const yDomain = extent(this.state.currNodes, node => node.y);

    const viewBoxWidth = 1.25 * Math.abs(xDomain[1] - xDomain[0]);
    const viewBoxHeight = 1.25 * Math.abs(yDomain[1] - yDomain[0]);
    const viewBoxDim = Math.max(viewBoxWidth, viewBoxHeight);

    const nodes = this.state.currNodes.map(n => {
      if (n.type == "OVERLAP") {
        return (
          <React.Fragment>
            <rect
              className={this.getNodeClassList(n.id)}
              id={n.id}
              x={n.x - n.radius}
              y={n.y - n.radius}
              rx={n.radius / 4}
              width={2 * n.radius}
              height={2 * n.radius}
              stroke="#343434"
              strokeWidth={1.5}
              fill={this.state.colors[n.type]}
            ></rect>
          </React.Fragment>
        );
      } else {
        return (
          <React.Fragment>
            <circle
              className={this.getNodeClassList(n.id, "node")}
              cx={n.x}
              cy={n.y}
              r={n.radius}
              stroke={this.colorLuminance(this.state.colors[n.type], -0.6)}
              strokeWidth={1.3}
              fill={this.state.colors[n.type]}
            ></circle>
            <text x={n.x} y={n.y} textAnchor="middle" fontSize={8}>
              {n.text ? this.wordWrap(n.text, n.x) : ""}
            </text>
          </React.Fragment>
        );
      }
    });

    const edges = this.state.currEdges.map(e => (
      <React.Fragment>
        <line
          className={this.getEdgeClassList(e.source.id, e.target.id)}
          marker-end={e.target.type == "OVERLAP" ? "" : "url(#arrow)"}
          x1={e.source.x}
          y1={e.source.y}
          x2={e.target.x}
          y2={e.target.y}
          stroke={e.target.type == "OVERLAP" ? "#86c5da" : "#343434"}
          strokeOpacity={0.8}
        ></line>
        <text
          x={(e.source.x + e.target.x) / 2}
          y={(e.source.y + e.target.y) / 2}
          textAnchor="middle"
          fontSize={8}
        >
          {e.label == "OVERLAP" ? "" : e.label}
        </text>
      </React.Fragment>
    ));

    return (
      <svg
        className="graph"
        style={{ border: "2px solid #bcbcbc" }}
        viewBox={`${-viewBoxDim / 2} ${-viewBoxDim /
          2} ${viewBoxDim} ${viewBoxDim}`}
      >
        <defs>
          <marker
            id="arrow"
            viewBox="0 -5 10 10"
            refX="16"
            refY="0"
            markerWidth="15"
            markerHeight="15"
            markerUnits="userSpaceOnUse"
            orient="auto"
            fill="#343434"
          >
            <path d="M-4,-4L8,0L-4,4L" />
          </marker>
        </defs>
        <g id="edges">{edges}</g>
        <g id="nodes">{nodes}</g>
      </svg>
    );
  }
}

export default EntityGraph;
