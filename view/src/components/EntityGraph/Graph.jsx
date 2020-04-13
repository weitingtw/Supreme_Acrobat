import React, { Component, createRef } from "react";
import * as d3 from "d3";

import { createGraph } from "./graph-utils";
import { linkVertical } from "d3";

class Graph extends Component {
  constructor(props) {
    super(props);

    const graph = createGraph(this.props.graphData);

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
      OVERLAP: "#000",
    };
    this.state = {
      graph: graph,
      adjList: graph.getAdjacencyList(),
      colors: nodeColors,
    };

    this.ref = createRef();
  }
  componentDidMount() {
    this.createViz();
  }

  createViz() {
    const { graph, adjList, colors } = this.state;
    const radiusScaler = this.degreeScaler(graph, [6, 20]);
    graph.nodes.forEach((n) => {
      n.radius = n.type === "OVERLAP" ? 6 : radiusScaler(n.indegree);
    });
    let ref = this.ref.current;
    let vizcontainer = d3.select(ref);

    let width = 500;
    let height = 500;
    // let svg = d3.select(this.ref.current),
    //   width = +svg.attr("width"),
    //   height = +svg.attr("height");

    let simulation = d3
      .forceSimulation()
      .force("charge", d3.forceManyBody().strength(-200).distanceMax(150))
      .force("link", d3.forceLink(graph.edges).distance(10).strength(1))
      .force(
        "collide",
        d3.forceCollide().radius((d) => radiusScaler(d.indegree))
      )
      .force("center", d3.forceCenter(width / 2, height / 2));

    function run(graph) {
      let tooltip = vizcontainer
        .append("div")
        .style("opacity", 0)
        .attr("class", "tooltip")
        .style("background-color", "white")
        .style("border", "solid")
        .style("border-width", "1px")
        .style("border-radius", "2px")
        .style("padding", "0.5em")
        .style("pointer-events", "none");

      let svg = vizcontainer
        .append("svg")
        .attr("width", width)
        .attr("height", height);

      svg
        .append("defs")
        .append("marker")
        .attr("id", "arrow")
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", 20)
        .attr("refY", 0)
        .attr("markerWidth", 10)
        .attr("markerHeight", 10)
        .attr("markerUnits", "userSpaceOnUse")
        .attr("orient", "auto")
        .attr("fill", "#555")
        .append("svg:path")
        .attr("d", "M-4,-4L8,0L-4,4L");

      let link = svg.append("g").attr("id", "edges");

      let edge = link
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

      let edgeText = link
        .selectAll("text")
        .data(graph.edges)
        .enter()
        .append("text")
        .text((d) => (d.label === "OVERLAP" ? "" : d.label))
        .attr("font-size", 8)
        .attr("text-anchor", "middle");

      let node = svg
        .append("g")
        .attr("id", "nodes")
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

      svg.call(
        d3
          .zoom()
          .extent([
            [0, 0],
            [500, 500],
          ])
          .scaleExtent([1, 8])
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

        node.attr("x", (d) => d.x - d.radius).attr("y", (d) => d.y - d.radius);
      }
      function zoomed() {
        node.attr("transform", d3.event.transform);
        edge.attr("transform", d3.event.transform);
        edgeText.attr("transform", d3.event.transform);
      }

      function handleMouseOver(d, i) {
        // highlight connected edges
        tooltip.style("opacity", 0.85);
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
      }

      function handleMouseMove(d) {
        let content = `<span> ${
          d.text ? "Description: " + d.text : "Overlap"
        }</span>`;

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

  degreeScaler(data, range) {
    const degreeExtent = d3.extent(data.nodes, (d) => d.indegree);

    return d3.scaleSqrt().domain(degreeExtent).range(range);
  }

  render() {
    return <div ref={this.ref} />;
  }
}

export default Graph;
