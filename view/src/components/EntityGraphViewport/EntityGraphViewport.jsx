import React from 'react';
import EntityGraph from '../EntityGraph/EntityGraph';
import {INITIAL_VALUE, ReactSVGPanZoom, TOOL_NONE } from 'react-svg-pan-zoom';

export default class App extends React.PureComponent {

  state = {tool: TOOL_NONE, value: INITIAL_VALUE}
  Viewer = null

  componentDidMount() {
    this.Viewer.fitToViewer();
    this.Viewer.closeMiniature();
  }

  changeTool(nextTool) {
    this.setState({tool: nextTool})
  }

  changeValue(nextValue) {
    this.setState({value: nextValue})
  }

  fitToViewer() {
    this.Viewer.fitToViewer()
  }

  fitSelection() {
    this.Viewer.fitSelection(40, 40, 200, 200)
  }

  zoomOnViewerCenter() {
    this.Viewer.zoomOnViewerCenter(1.1)
  }

  render() {
    const { graphData, entities } = this.props;
    const miniatureProps = { position: "none" };
    return (
      <div>
        <hr/>

        <ReactSVGPanZoom
          width={500} height={300}
          ref={Viewer => this.Viewer = Viewer}
          tool={this.state.tool} onChangeTool={tool => this.changeTool(tool)}
          value={this.state.value} onChangeValue={value => this.changeValue(value)}
          miniatureProps={miniatureProps}
        >
          <svg width={500} height={300}>
            <EntityGraph graphData={graphData} entities={entities} /> 
          </svg>
        </ReactSVGPanZoom>
      </div>
    );
  }
}