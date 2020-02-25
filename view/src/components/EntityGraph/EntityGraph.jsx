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

import { extent, thresholdFreedmanDiaconis } from "d3-array";

import { formatData, getOverlaps } from "./graph-utils";

class EntityGraph extends Component {
  constructor(props) {
    super(props);

    const graph = this.initializeData(formatData(this.props.graphData));

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
      Date: "lightgreen",
      Duration: "lightgreen",
      OVERLAP: "#fff"
    };

    this.state = {
      allData: graph,
      currNodes: graph.nodes,
      currEdges: graph.edges,
      filter: null,
      layout: "force",
      colors: nodeColors,
      adjList: this.getAdjacencyList(graph.edges),
      activeNode: null
    };

    // this.handleMouseEnter = this.handleMouseEnter.bind();
    // this.handleMouseLeave = this.handleMouseLeave.bind();
  }

  initializeData(data) {
    data.nodes.forEach(node => {
      if (node.type == "OVERLAP") {
        node.radius = 28;
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

    const simulation = forceSimulation(nodes)
      .force("charge", forceManyBody().strength(-100))
      .force(
        "link",
        forceLink(edges)
          .distance(10)
          .strength(1)
      )
      .force("collision", forceCollide(30))
      .force("center", forceCenter());

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
    console.log(event.srcElement.id);
    const id = event.srcElement.id;
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

  getClassList = (id, base) => {
    if (
      (this.state.activeNode &&
        this.state.adjList[this.state.activeNode].has(id)) ||
      this.state.activeNode == id
    ) {
      return base + " active";
    }
    return base;
  };

  render() {
    const xDomain = extent(this.state.currNodes, node => node.x);
    const yDomain = extent(this.state.currNodes, node => node.y);

    const width = 1.25 * Math.abs(xDomain[1] - xDomain[0]);
    const height = 1.25 * Math.abs(yDomain[1] - yDomain[0]);

    const nodes = this.state.currNodes.map(n => (
      <circle
        className={this.getClassList(n.id, "node")}
        id={n.id}
        cx={n.x}
        cy={n.y}
        r={n.radius}
        stroke="#000"
        strokeWidth={1.5}
        fill={this.state.colors[n.type]}
      ></circle>
    ));

    const edges = this.state.currEdges.map(e => (
      <line
        className="edge"
        marker-end="url(#arrow)"
        x1={e.source.x}
        y1={e.source.y}
        x2={e.target.x}
        y2={e.target.y}
        stroke="#343434"
        strokeOpacity={0.8}
      ></line>
    ));
    return (
      <svg
        className="graph"
        style={{ border: "2px solid #bcbcbc" }}
        viewBox={`${-width / 2} ${-height / 2} ${width} ${height}`}
      >
        <defs>
          <marker
            id="arrow"
            viewBox="0 -5 10 10"
            refX="16"
            refY="0"
            markerWidth="15"
            markerHeight="15"
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
