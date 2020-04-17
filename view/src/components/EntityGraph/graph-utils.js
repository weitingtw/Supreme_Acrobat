export function Graph(nodes, edges, pmID) {
  this.nodes = nodes;
  this.edges = edges;
  this.pmID = pmID;

  this.getAdjacencyList = () => {
    const res = {};
    edges.forEach((edge) => {
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
  };
}

/**
 * Converts raw data into an object of nodes and edges
 * @param {Object} graphData
 */

export const createGraph = (graphData) => {
  const nodes = [];
  const edges = [];

  /** Extract node data: type and labels associated with nodeID
   * Note that entity nodes and trigger nodes are mutually exclusive
   */
  const nodeIDToTextIndex = {};
  const nodeIDToNodeType = {};

  // from entities field
  for (let i = 0; i < graphData.entities.length; i++) {
    let nodeID = graphData.entities[i][0];
    let nodeType = graphData.entities[i][1];
    let textStartIndex = graphData.entities[i][2][0][0];
    let textEndIndex = graphData.entities[i][2][0][1];

    nodeIDToTextIndex[nodeID] = [textStartIndex, textEndIndex];
    nodeIDToNodeType[nodeID] = nodeType;
  }

  // from triggers field
  for (let i = 0; i < graphData.triggers.length; i++) {
    let nodeID = graphData.triggers[i][0];
    let nodeType = graphData.triggers[i][1];
    let textStartIndex = graphData.triggers[i][2][0][0];
    let textEndIndex = graphData.triggers[i][2][0][1];

    nodeIDToTextIndex[nodeID] = [textStartIndex, textEndIndex];
    nodeIDToNodeType[nodeID] = nodeType;
  }

  /**
   * Map events to nodes
   * */
  const eventIDToNodeID = {};
  for (let i = 0; i < graphData.events.length; i++) {
    let eventID = graphData.events[i][0];
    let nodeID = graphData.events[i][1];
    eventIDToNodeID[eventID] = nodeID;
  }

  /**
   * Map events to overlaps
   * */
  const eventIDToOverlapID = {};
  for (let i = 0; i < graphData.equivs.length; i++) {
    let overlapID = "OV" + i;
    for (let j = 2; j < graphData.equivs[i].length; j++) {
      let eventID = graphData.equivs[i][j];
      eventIDToOverlapID[eventID] = overlapID;
    }
  }

  /**
   * Map nodes to overlaps
   * */
  const nodeIDToOverLapID = {};
  Object.keys(eventIDToOverlapID).forEach((eventID) => {
    let nodeID = eventIDToNodeID[eventID];
    let overlapID = eventIDToOverlapID[eventID];
    nodeIDToOverLapID[nodeID] = overlapID;
  });

  /**
   * Create edges and nodes
   */
  const nodeSet = new Set();
  let nodeText;
  // create edges
  for (let i = 0; i < graphData.relations.length; i++) {
    let eventID1 = graphData.relations[i][2][0][1];
    let eventID2 = graphData.relations[i][2][1][1];
    let eventLabel = graphData.relations[i][1];

    let sourceID = eventIDToNodeID[eventID1]
      ? eventIDToNodeID[eventID1]
      : eventID1;

    let targetID = eventIDToNodeID[eventID2]
      ? eventIDToNodeID[eventID2]
      : eventID2;

    let overlapID;
    if (!nodeSet.has(sourceID)) {
      // get text
      nodeText = graphData.text.substring(
        nodeIDToTextIndex[sourceID][0],
        nodeIDToTextIndex[sourceID][1]
      );
      //   get overlap
      overlapID = nodeIDToOverLapID[sourceID]
        ? nodeIDToOverLapID[sourceID]
        : undefined;

      nodes.push({
        id: sourceID,
        text: nodeText,
        type: nodeIDToNodeType[sourceID],
        overlap: overlapID,
      });
      //   add overlap edge and node
      if (overlapID) {
        edges.push({
          source: sourceID,
          target: overlapID,
          type: "OVERLAP",
        });

        // if not already have node created, create a node of the overlap
        if (!nodeSet.has(overlapID)) {
          let nOverlaps = graphData.equivs.length - 1;
          let text = undefined;
          if (overlapID == "OV0") {
            text = "START";
          } else if (overlapID == "OV" + nOverlaps) {
            text = "END";
          }
          nodes.push({
            id: overlapID,
            text: text,
            type: "OVERLAP",
            overlap: undefined,
          });
          nodeSet.add(overlapID);
        }
      }

      nodeSet.add(sourceID);
    }

    if (!nodeSet.has(targetID)) {
      // get text
      nodeText = graphData.text.substring(
        nodeIDToTextIndex[targetID][0],
        nodeIDToTextIndex[targetID][1]
      );
      //   get overlap
      overlapID = nodeIDToOverLapID[targetID];

      nodes.push({
        id: targetID,
        text: nodeText,
        type: nodeIDToNodeType[targetID],
        overlap: overlapID,
      });

      if (overlapID) {
        edges.push({
          source: targetID,
          target: overlapID,
          type: "OVERLAP",
        });
        if (!nodeSet.has(overlapID)) {
          let nOverlaps = graphData.equivs.length - 1;
          let text = undefined;
          if (overlapID == "OV0") {
            text = "START";
          } else if (overlapID == "OV" + nOverlaps) {
            text = "END";
          }

          nodes.push({
            id: overlapID,
            text: text,
            type: "OVERLAP",
            overlap: undefined,
          });
          nodeSet.add(overlapID);
        }
      }

      nodeSet.add(targetID);
    }

    edges.push({
      source: sourceID,
      target: targetID,
      label: eventLabel,
    });
  }

  // Add remaining nodes
  for (let i = 0; i < graphData.equivs.length; i++) {
    let overlapID = "OV" + i;
    for (let j = 2; j < graphData.equivs[i].length; j++) {
      let eventID = graphData.equivs[i][j];
      let sourceID = eventIDToNodeID[eventID]
        ? eventIDToNodeID[eventID]
        : eventID;

      if (!nodeSet.has(sourceID)) {
        // get text
        nodeText = graphData.text.substring(
          nodeIDToTextIndex[sourceID][0],
          nodeIDToTextIndex[sourceID][1]
        );

        nodes.push({
          id: sourceID,
          text: nodeText,
          type: nodeIDToNodeType[sourceID],
          overlap: overlapID,
        });
      }
      edges.push({
        source: sourceID,
        target: overlapID,
        label: "OVERLAP",
      });
    }
  }

  resolveEdgeRefs(nodes, edges);
  initializeNodeInDegree(edges);

  // return { nodes: nodes, edges: edges, pmid: graphData.pmID };
  return new Graph(nodes, edges, graphData.pmID);
};

/** Sets edges to reference nodes directly rather than by ID.
 * @param {Array} an array of node objects
 * @param {Array} an array of edge objects
 */
function resolveEdgeRefs(nodes, edges) {
  let nodesMap = mapNodes(nodes);
  edges.forEach((edge) => {
    edge.source = nodesMap[edge.source];
    edge.target = nodesMap[edge.target];
  });
  return edges;
}
/** Returns a map from nodeID to corresponding node object
 * @param {Array} an array of node objects
 */
function mapNodes(nodes) {
  let nodesMap = {};
  nodes.forEach((node) => {
    nodesMap[node.id] = node;
  });
  return nodesMap;
}

/** Adds indegree property to all nodes */
function initializeNodeInDegree(edges) {
  edges.forEach((edge) => {
    if (!edge.source.indegree) {
      edge.source.indegree = 0;
    }
    edge.target.indegree = edge.target.indegree ? edge.target.indegree + 1 : 1;
  });
}
