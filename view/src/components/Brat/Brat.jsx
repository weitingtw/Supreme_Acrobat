import React, { Component } from 'react';
import './Brat.css';

import collData from './collData';
import docData from './docData';

const options = {
    // assetsPath: "static/",
    // webFontURLs: [//
    //     'fonts/Astloch-Bold.ttf',
    //     'fonts/PT_Sans-Caption-Web-Regular.ttf',
    //     'fonts/Liberation_Sans-Regular.ttf'
    // ],
    // ajax: 'local',
    // overWriteModals: false,
    // maxFragmentLength: 30,
    // showTooltip: true
}

class Brat extends Component {
    state = {}
    docData = JSON.parse(JSON.stringify(docData));
    collData = JSON.parse(JSON.stringify(collData));
    old_data = JSON.parse(JSON.stringify(docData));

    componentDidMount(){
        var elem = document.getElementById("brat-editor");
        window.brat = new window.BratFrontendEditor(elem, this.collData, this.props.docData, options);
    }

    handleSubmit = () => {
        console.log(this.props.docData);

        // this should be the same! docData was passed by reference to brat!!
        // console.log(docData);
    }

    getCaseReport = id => {
        // console.log(this);
        this.props.docData = JSON.parse(JSON.stringify(this.old_data));
        this.redraw();
    }

    redraw = () => {
        if (window.brat != null) {
            window.brat.dispatcher.post('requestRenderData', [this.props.docData]);
            window.brat.dispatcher.post('current', [this.collData, this.props.docData, {}]);
        }
    }

    render () {
        this.redraw()
        return(
            <div id='brat'>

                <span 
                    id='submit-report' 
                    className='button'
                    onClick={this.handleSubmit}
                >
                    submit case report
                </span>

                <span 
                    className='button'
                    onClick={this.getCaseReport}
                >
                    get case report
                </span>

                <span 
                    className='button'
                    onClick={this.redraw}
                >
                    redraw
                </span>

                <div id="brat-editor" />

            </div>
        );
    }
}

Brat.defaultProps = {
    docData: docData
}

export default Brat;