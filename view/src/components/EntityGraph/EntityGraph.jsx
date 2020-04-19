import React, { Component, createRef } from "react";
import * as d3 from "d3";

import { createGraph, Graph } from "./graph-utils";

class EntityGraph extends Component {
  constructor(props) {
    super(props);
    let graph = createGraph(this.props.graphData);

    let subgraph = this.props.entities
      ? this.getSubGraph(graph, this.props.entities)
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
      Time: "#dbe48b",
      Duration: "#8fee90",
      OVERLAP: "#fff",
    };
    this.state = {
      graph: this.props.entities ? subgraph : graph,
      colors: nodeColors,
    };

    this.ref = createRef();
  }
  componentDidMount() {
    this.createViz();
  }

  createViz() {
    const { graph, colors } = this.state;
    const adjList = graph.getAdjacencyList();
    const radiusScaler = this.degreeScaler(graph, [6, 20]);
    graph.nodes.forEach((n) => {
      n.radius = n.type === "OVERLAP" ? 6 : radiusScaler(n.indegree);
    });
    let ref = this.ref.current;
    let viz = d3.select(ref);

    let { viewBoxWidth, viewBoxHeight } = this.props;

    let simulation = d3
      .forceSimulation()
      .force("charge", d3.forceManyBody().strength(-200).distanceMax(150))
      .force("link", d3.forceLink(graph.edges).distance(15).strength(1))
      .force(
        "collide",
        d3.forceCollide().radius((d) => radiusScaler(d.indegree))
      )
      .force("center", d3.forceCenter(viewBoxWidth / 2, viewBoxHeight / 2));

    function run(graph) {
      let tooltip = viz
        .append("div")
        .style("opacity", 0)
        .attr("class", "tooltip")
        .style("background-color", "white")
        .style("border", "solid")
        .style("border-width", "1px")
        .style("border-radius", "2px")
        .style("padding", "0.5em")
        .style("pointer-events", "none");

      let svg = viz
        .append("svg")
        .attr("width", viewBoxWidth)
        .attr("height", viewBoxHeight)
        .attr("viewBox", `0 0 ${viewBoxWidth} ${viewBoxHeight}`);

      svg
        .append("defs")
        .append("marker")
        .attr("id", "arrow")
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", 17)
        .attr("refY", 0)
        .attr("markerWidth", 10)
        .attr("markerHeight", 10)
        .attr("markerUnits", "userSpaceOnUse")
        .attr("orient", "auto")
        .attr("fill", "#555")
        .append("svg:path")
        .attr("d", "M-4,-4L8,0L-4,4L");

      let edgesG = svg.append("g").attr("id", "edges");

      let edge = edgesG
        .selectAll("line")
        .data(graph.edges)
        .enter()
        .append("line")
        .attr("class", "link")
        .attr("stroke", (d) => (d.label === "OVERLAP" ? "#86c5da" : "#555"))
        .attr("stroke-opacity", 0.8)
        .attr("marker-end", (d) =>
          d.target.type === "OVERLAP" ? "" : "url(#arrow)"
        );

      let edgeText = edgesG
        .selectAll("text")
        .data(
          graph.edges.filter(
            (d) => !(d.label == "OVERLAP" || d.label == "MODIFY")
          )
        )
        .enter()
        .append("text")
        .text((d) => d.label)
        .attr("font-size", 8)
        .attr("text-anchor", "middle")
        .style("pointer-events", "none");

      let nodesG = svg.append("g").attr("id", "nodes");

      let node = nodesG
        .selectAll("rect")
        .data(graph.nodes)
        .enter()
        .append("rect")
        .attr("class", (d) => `${d.id} node`)
        .attr("rx", (d) => (d.type === "OVERLAP" ? 1 : 2 * d.radius))
        .attr("ry", (d) => (d.type === "OVERLAP" ? 1 : 2 * d.radius))
        .attr("width", (d) => 2 * d.radius)
        .attr("height", (d) => 2 * d.radius)
        .attr("fill", (d) => colors[d.type])
        .attr("stroke", "#000")
        .attr("stroke-width", 0.7)
        .call(
          d3
            .drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended)
        )
        .on("mouseover", handleMouseOver)
        .on("mousemove", handleMouseMove)
        .on("mouseout", handleMouseOut);

      let nodeText = nodesG
        .selectAll("text")
        .data(graph.nodes)
        .enter()
        .append("text")
        .text((d) => d.text)
        .attr("font-size", (d) => (d.type === "OVERLAP" ? 14 : 6))
        .attr("font-weight", (d) => (d.type === "OVERLAP" ? 700 : null))
        .attr("text-anchor", "middle")
        .style("text-transform", "capitalize")
        .style("pointer-events", "none");

      svg.call(
        d3
          .zoom()
          .extent([
            [0, 0],
            [500, 500],
          ])
          .scaleExtent([0.4, 2])
          .on("zoom", zoomed)
      );
      simulation.nodes(graph.nodes).on("tick", ticked);
      simulation.force("link").links(graph.edges);

      function ticked() {
        edgeText
          .attr("x", (d) => {
            return (d.source.x + d.target.x) / 2;
          })
          .attr("y", (d) => {
            return (d.source.y + d.target.y) / 2;
          });

        edge
          .attr("x1", (d) => d.source.x)
          .attr("y1", (d) => d.source.y)
          .attr("x2", (d) => d.target.x)
          .attr("y2", (d) => d.target.y);

        nodeText.attr("x", (d) => d.x).attr("y", (d) => d.y + 2);

        node.attr("x", (d) => d.x - d.radius).attr("y", (d) => d.y - d.radius);
      }
      function zoomed() {
        node.attr("transform", d3.event.transform);
        edge.attr("transform", d3.event.transform);
        nodeText.attr("transform", d3.event.transform);
        edgeText.attr("transform", d3.event.transform);
      }

      function handleMouseOver(d, i) {
        // highlight connected edges
        tooltip.style("opacity", 0.8);
        edge.attr("stroke-opacity", (l) => {
          return l.source === d || l.target === d ? 1.0 : 0.3;
        });

        edgeText.attr("opacity", (l) => {
          return l.source === d || l.target === d ? 1.0 : 0.5;
        });

        // highlight connected nodes
        node
          .attr("stroke", (n) => {
            return d === n || neighboring(d, n) ? "#000" : "#ddd";
          })
          .attr("stroke-opacity", (n) => {
            return d === n || neighboring(d, n) ? 1.0 : 0.5;
          })
          .attr("fill-opacity", (n) => {
            return d == n || neighboring(d, n) ? 1.0 : 0.5;
          });

        nodeText.attr("opacity", (n) => {
          return d == n || neighboring(d, n) ? 1.0 : 0.5;
        });
      }

      function handleMouseMove(d) {
        let content = `<span>${
          d.type != "OVERLAP" ? d.text : `Overlap (${d.id})`
        }</span>`;
        let hasModifiers = false;

        adjList[d.id].forEach((neighborID) => {
          const neighbor = graph.nodes.find((node) => node.id === neighborID);
          const edge = graph.edges.find(
            (edge) => edge.source === neighbor && edge.target === d
          );
          if (edge) {
            if (!hasModifiers) {
              hasModifiers = true;
              content += "<hr/>";
            }
            content += `<span>${neighbor.text} (${
              edge.type || edge.label
            })</span><br/>`;
          }
        });

        tooltip
          .html(content)
          .style("left", d3.mouse(ref)[0] + 10 + "px")
          .style("top", d3.mouse(ref)[1] + "px");
      }
      function handleMouseOut(d, i) {
        tooltip.style("opacity", 0);

        edge.attr("stroke-opacity", 0.8);
        edgeText.attr("opacity", 1.0);
        node
          .attr("stroke", "#000")
          .attr("stroke-opacity", 1.0)
          .attr("fill-opacity", 1.0);
        nodeText.attr("opacity", 1.0);
      }

      function neighboring(n1, n2) {
        const id1 = n1.id;
        const id2 = n2.id;
        return adjList[id1].has(id1) || adjList[id2].has(id1);
      }

      function dragstarted(d) {
        if (!d3.event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      }

      function dragged(d) {
        d.fx = d3.event.x;
        d.fy = d3.event.y;
      }

      function dragended(d) {
        d.fx = null;
        d.fy = null;
        if (!d3.event.active) simulation.alphaTarget(0);
      }
    }

    run(graph);
  }

  isOverlapNode(nodeID) {
    return nodeID.includes("OV");
  }

  findNearestOverlap = (startNode, graph) => {
    const adjList = graph.getAdjacencyList();
    const pathTo = {};
    pathTo[startNode] = null;
    const marked = new Set();
    marked.add(startNode);
    const queue = [startNode];

    let overlapNode = null;

    while (Array.isArray(queue) && !overlapNode && queue.length) {
      let node = queue.shift();
      if (this.isOverlapNode(node)) {
        overlapNode = node;
      } else {
        adjList[node].forEach((neighbor) => {
          if (!(neighbor in pathTo)) {
            pathTo[neighbor] = node;
          }
          if (!marked.has(neighbor)) {
            marked.add(neighbor);
            queue.push(neighbor);
          }
        });
      }
    }

    if (overlapNode) {
      const path = [];
      let currNode = overlapNode;
      while (currNode) {
        path.unshift(currNode);
        currNode = pathTo[currNode];
      }

      return {
        ID: overlapNode,
        path: path,
      };
    } else {
      return {
        ID: startNode,
        path: [startNode],
      };
    }
  };

  getSubGraph = (graph, query) => {
    // get set of all nodes that belong depending on the query
    const adjList = graph.getAdjacencyList();
    const pmid = graph.pmid;
    const subGraphNodeIDs = new Set();
    const overlaps = query.map((node) => this.findNearestOverlap(node, graph));
    const overlappingNodes = [];

    // get all nodes in the overlap
    overlaps.forEach((ov) => {
      adjList[ov.ID].forEach((neighborID) => {
        overlappingNodes.push(neighborID);
      });
      // add all nodes from paths to set of subgraph nodes.
      ov.path.forEach((node) => subGraphNodeIDs.add(node));
    });

    // get neighbors of all overlapping nodes and add to the set.
    overlappingNodes.forEach((nodeID) => {
      subGraphNodeIDs.add(nodeID);
      adjList[nodeID].forEach((neighborID) => {
        subGraphNodeIDs.add(neighborID);
      });
    });

    // then filter: if the node has id that is in the set, then it belongs
    const nodes = graph.nodes;
    let subGraphNodes = nodes.filter((node) => subGraphNodeIDs.has(node.id));
    let subGraphEdges = graph.edges.filter(
      (edge) =>
        subGraphNodeIDs.has(edge.source.id) &&
        subGraphNodeIDs.has(edge.target.id)
    );
    return new Graph(subGraphNodes, subGraphEdges, pmid);
  };

  degreeScaler(data, range) {
    const degreeExtent = d3.extent(data.nodes, (d) => d.indegree);

    return d3.scaleSqrt().domain(degreeExtent).range(range);
  }

  render() {
    return <div class="viz" ref={this.ref} />;
  }
}

export default EntityGraph;
