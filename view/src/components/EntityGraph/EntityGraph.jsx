import React, { Component, createRef } from "react";
import * as d3 from "d3";

import { group2color, type2group, createGraph, Graph } from "./graph-utils";
import "./EntityGraph.css";

class EntityGraph extends Component {
  constructor(props) {
    super(props);
    let graph = createGraph(this.props.graphData);

    let subgraph = this.props.entities
      ? this.getSubGraph(graph, this.props.entities)
      : null;

    let nodeGroups = subgraph
      ? this.getNodeGroups(subgraph.nodes)
      : this.getNodeGroups(graph.nodes);

    this.state = {
      graph: this.props.entities ? subgraph : graph,
      nodeGroups: nodeGroups,
    };

    this.ref = createRef();
    this.legendRef = createRef();
  }
  componentDidMount() {
    this.createViz();
    this.createLegend();
  }

  createLegend() {
    let keys = [...this.state.nodeGroups].sort();
    let edges = ["Modify", "Overlap"];

    let width = Math.min(
      250,
      55 + 8 * Math.max(...keys.map((key) => key.length))
    );
    console.log("keys" + keys);

    let height = keys.length * 25 + 20 + 50;

    let legendRef = this.legendRef.current;
    let legend = d3.select(legendRef);
    let legendSVG = legend
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    let legendEdges = legendSVG.append("g");
    let legendNodes = legendSVG.append("g");

    legendEdges
      .selectAll("line")
      .data(edges)
      .enter()
      .append("line")
      .attr("x1", 20 - 7)
      .attr("x2", 20 + 7)
      .attr("y1", (d, i) => {
        return 20 + i * 25;
      })
      .attr("y2", (d, i) => {
        return 20 + i * 25;
      })
      .attr("stroke", (d) => (d === "Overlap" ? "#7da2ff" : "#555"))
      .attr("stroke-width", 2.5)
      .attr("stroke-dasharray", (d) => (d === "Modify" ? "3, 3" : "none"));

    legendEdges
      .selectAll("line-text")
      .data(edges)
      .enter()
      .append("text")
      .attr("x", 40)
      .attr("y", (d, i) => {
        return 20 + i * 25;
      })
      .text((d) => {
        return d;
      })
      .attr("text-anchor", "left")
      .style("alignment-baseline", "middle");

    legendNodes
      .selectAll("circle")
      .data(keys)
      .enter()
      .append("circle")
      .attr("cx", 20)
      .attr("cy", (d, i) => {
        return 70 + i * 25;
      })
      .attr("r", 7)
      .style("fill", (d) => {
        return group2color[d];
      })
      .attr("stroke", "#000");

    legendNodes
      .selectAll("text")
      .data(keys)
      .enter()
      .append("text")
      .attr("x", 40)
      .attr("y", (d, i) => {
        return 70 + i * 25;
      })
      .text((d) => {
        return d;
      })
      .attr("text-anchor", "left")
      .style("alignment-baseline", "middle");
  }

  createViz() {
    const { graph } = this.state;
    let { viewBoxWidth, viewBoxHeight } = this.props;
    let activeNode = null;

    const adjList = graph.getAdjacencyList();
    const radiusScaler = this.degreeScaler(graph, [6, 20]);
    const arrowPosScaler = this.degreeScaler(graph, [17, 24]);
    graph.nodes.forEach((n) => {
      n.radius = n.type === "OVERLAP" ? 4 : radiusScaler(n.indegree);
      n.arrPos = arrowPosScaler(n.indegree);
    });

    let ref = this.ref.current;
    let viz = d3.select(ref);

    let simulation = d3
      .forceSimulation()
      .force("charge", d3.forceManyBody().strength(-200).distanceMax(150))
      .force(
        "link",
        d3
          .forceLink(graph.edges)
          .distance((d) => {
            return 25;
          })
          .strength(1)
      )
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
        .attr("refX", 8)
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
        .attr("stroke", (d) => (d.label === "OVERLAP" ? "#7da2ff" : "#555"))
        .attr("stroke-width", (d) => (d.label === "OVERLAP" ? 1.5 : 1))
        .attr("stroke-dasharray", (d) =>
          d.label === "MODIFY" ? "3, 4" : "none"
        )
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
        .attr("font-size", 6)
        .attr("text-anchor", "middle")
        .style("pointer-events", "none");

      let nodesG = svg.append("g").attr("id", "nodes");

      let node = nodesG
        .selectAll("circle")
        .data(graph.nodes)
        .enter()
        .append("circle")
        .attr("class", (d) => `${d.id} node`)
        .attr("r", (d) => d.radius)
        .attr("fill", (d) => group2color[type2group[d.type]])
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
          .attr("x1", (d) => scaleEdges(d).x1)
          .attr("y1", (d) => scaleEdges(d).y1)
          .attr("x2", (d) => scaleEdges(d).x2)
          .attr("y2", (d) => {
            // check if must recompute. Should never resolve to true
            if (!d.scaled) {
              console.log("recompute edge scaling");
            }
            let y2 = scaleEdges(d).y2;
            return y2;
          });

        nodeText.attr("x", (d) => d.x).attr("y", (d) => d.y + 2);

        node.attr("cx", (d) => d.x).attr("cy", (d) => d.y);

        // reset scaled for next tick
        edge.each((d) => {
          d.scaled = null;
        });
      }

      function scaleEdges(d) {
        if (d.scaled) {
          return d.scaled;
        }

        let dx = d.target.x - d.source.x;
        let dy = d.target.y - d.source.y;
        let l = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));

        let rs = d.source.radius;
        let rt = d.target.radius;

        let scaledCoordinates = {
          x1: d.source.x + (dx * rs) / l,
          y1: d.source.y + (dy * rs) / l,
          x2: d.target.x - (dx * rt) / l,
          y2: d.target.y - (dy * rt) / l,
        };
        d.scaled = scaledCoordinates;
        return scaledCoordinates;
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
        // update tooltip contents only if different node active
        if (activeNode !== d) {
          activeNode = d;

          let content = `<span>${
            d.type != "OVERLAP"
              ? `${d.text} (${d.type.replace("_", " ")})`
              : `Overlap (${d.id})`
          }</span>`;

          if (d.attribute) {
            content += `<br/><span>${d.attribute.type}: ${d.attribute.desc}</span>`;
          }

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

          tooltip.html(content);
        }
        // update position always
        tooltip
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

  getNodeGroups = (graph) => {
    return new Set(graph.map((node) => type2group[node.type]));
  };

  degreeScaler(data, range) {
    const degreeExtent = d3.extent(data.nodes, (d) => d.indegree);

    return d3.scaleSqrt().domain(degreeExtent).range(range);
  }

  render() {
    return (
      <div class="viz-container">
        <div class="viz" ref={this.ref} />
        <div class="legend" ref={this.legendRef}></div>
      </div>
    );
  }
}

export default EntityGraph;
