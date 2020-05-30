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
   * Map events to attributes
   * */
  const eventIDToAttribute = {};
  for (let i = 0; i < graphData.attributes.length; i++) {
    let type = graphData.attributes[i][1];
    let eventID = graphData.attributes[i][2];
    let desc = graphData.attributes[i][3];

    eventIDToAttribute[eventID] = { type: type, desc: desc };
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
   * Map nodes to attributes
   * */
  const nodeIDToAttribute = {};
  Object.keys(eventIDToAttribute).forEach((eventID) => {
    let nodeID = eventIDToNodeID[eventID];
    let attribute = eventIDToAttribute[eventID];
    nodeIDToAttribute[nodeID] = attribute;
  });

  /**
   * Create edges and nodes from entity-entity relations
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
    let attribute;
    if (!nodeSet.has(sourceID)) {
      // get text
      nodeText = graphData.text.substring(
        nodeIDToTextIndex[sourceID][0],
        nodeIDToTextIndex[sourceID][1]
      );
      //   get overlap if exist
      overlapID = nodeIDToOverLapID[sourceID]
        ? nodeIDToOverLapID[sourceID]
        : undefined;

      // get attribute if exist
      attribute = nodeIDToAttribute[sourceID]
        ? nodeIDToAttribute[sourceID]
        : undefined;

      nodes.push({
        id: sourceID,
        text: nodeText,
        type: nodeIDToNodeType[sourceID],
        overlap: overlapID,
        attribute: attribute,
      });
      //   add overlap edge and node
      if (overlapID) {
        edges.push({
          source: sourceID,
          target: overlapID,
          label: "OVERLAP",
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
            attribute: undefined,
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
      //   get overlap if exist
      overlapID = nodeIDToOverLapID[targetID]
        ? nodeIDToOverLapID[targetID]
        : undefined;

      // get attribute if exist
      attribute = nodeIDToAttribute[targetID]
        ? nodeIDToAttribute[targetID]
        : undefined;

      nodes.push({
        id: targetID,
        text: nodeText,
        type: nodeIDToNodeType[targetID],
        overlap: overlapID,
        attribute: attribute,
      });

      //   add overlap edge and node
      if (overlapID) {
        edges.push({
          source: targetID,
          target: overlapID,
          label: "OVERLAP",
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
            attribute: undefined,
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

  // Add remaining nodes from overlap relations
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

        // get attribute if exist
        let attribute = nodeIDToAttribute[sourceID]
          ? nodeIDToAttribute[sourceID]
          : undefined;

        nodes.push({
          id: sourceID,
          text: nodeText,
          type: nodeIDToNodeType[sourceID],
          overlap: overlapID,
          attribute: attribute,
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

export const group2color = {
  "Patient Information": "#EDC1F0",
  Medication: "#2FCACA",
  Lab: "#8f97ff",
  "Lab Value": "#A04AF0",
  "Therapeutic Procedure": "#6495ed",
  "Diagnostic Procedure": "#9fdfff",
  "Sign/Disease": "#f4eded",
  "Sign/Symptom": "#DAE48B",
  "Disease/Disorder": "#EB8315",
  "Events, Activities, Outcomes": "#E07BAF",
  Other: "#ededed",
  Time: "#8fee90",
  Overlap: "#7da2ff",
};

export const type2group = {
  Age: "Patient Information", // Entities
  Sex: "Patient Information",
  Personal_background: "Patient Information",
  Occupation: "Patient Information",
  Weigh: "Patient Information",
  Height: "Patient Information",
  History: "Patient Information",
  Family_history: "Patient Information",
  Family_member: "Patient Information",
  Medication: "Medication",
  Lab: "Lab",
  Therapeutic_procedure: "Therapeutic Procedure",
  Diagnostic_procedure: "Diagnostic Procedure",
  Sign_disease: "Sign/Disease",
  Sign_symptom: "Sign/Symptom",
  Disease_disorder: "Disease/Disorder",
  Activity: "Events, Activities, Outcomes",
  Clinical_event: "Events, Activities, Outcomes",
  Outcome: "Events, Activities, Outcomes",
  Subject: "Other",
  Negation: "Other",
  Uncertainty: "Other",
  Condition: "Other",
  Quantitative_concept: "Other",
  Qualitative_concept: "Other",
  Other_entity: "Other",
  Other_event: "Other",
  Administration: "Other",
  Dosage: "Other",
  Frequency: "Other",
  Cause: "Other",
  Complication: "Other",
  Severity: "Other",
  Location: "Other",
  Result_outcome: "Other",
  Lab_value: "Lab Value",
  Biological_structure: "Other",
  Detail_description: "Other",
  Biological_attribute: "Other",
  Nonbiological_location: "Other",
  Detailed_description: "Other",
  Distance: "Other",
  Area: "Other",
  Volume: "Other",
  Mass: "Other",
  Color: "Other",
  Shape: "Other",
  Texture: "Other",
  Coreference: "Other",
  Date: "Time",
  Time: "Time",
  Duration: "Time",
  OVERLAP: "Overlap",
};
