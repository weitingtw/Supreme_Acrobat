import React, { Component, createRef } from "react";
import * as d3 from "d3";

import { createGraph } from "./graph-utils";
import { forceManyBody } from "d3";

class Graph extends Component {
  constructor(props) {
    super(props);

    this.ref = createRef();
  }
  componentDidMount() {
    this.createViz();
  }
  shouldComponentUpdate() {
    return false;
  }
  createViz() {
    const graph = createGraph(this.props.graphData);
    const radiusScaler = this.degreeToRadius(graph);
    graph.nodes.forEach((n) => {
      n.radius = radiusScaler(n.indegree);
    });

    let svg = d3.select(this.ref.current),
      width = +svg.attr("width"),
      height = +svg.attr("height");

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
      let edge = svg
        .append("g")
        .attr("id", "edges")
        .selectAll("line")
        .data(graph.edges)
        .enter()
        .append("line")
        .attr("class", "link")
        .attr("stroke", "#000")
        .attr("stroke-opacity", 0.5);

      let node = svg
        .append("g")
        .attr("id", "nodes")
        .selectAll("circle")
        .data(graph.nodes)
        .enter()
        .append("circle")
        .attr("r", (d) => d.radius)
        .call(
          d3
            .drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended)
        );

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
        edge
          .attr("x1", (d) => d.source.x)
          .attr("y1", (d) => d.source.y)
          .attr("x2", (d) => d.target.x)
          .attr("y2", (d) => d.target.y);

        node
          .attr("r", (d) => d.radius)
          .attr("cx", (d) => d.x)
          .attr("cy", (d) => d.y);
      }
      function zoomed() {
        node.attr("transform", d3.event.transform);
        edge.attr("transform", d3.event.transform);
      }
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
      d.fx = d3.event.x;
      d.fy = d3.event.y;
      if (!d3.event.active) simulation.alphaTarget(0);
    }

    run(graph);
  }

  degreeToRadius(data) {
    const degreeExtent = d3.extent(data.nodes, (d) => d.indegree);

    return d3.scaleSqrt().domain(degreeExtent).range([3, 12]);
  }

  render() {
    return <svg ref={this.ref} width={500} height={500} />;
  }
}

export default Graph;
