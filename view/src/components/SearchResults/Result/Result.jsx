import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import './Result.css';
import axios from 'axios'
import { getHost } from '../../../utils';
import {Card} from 'antd';


class Result extends Component {
    state = {
        previewText: ''
    }

    componentWillMount() {
        const {
            displayData: { previewText, id, textEntities, entities }
        } = this.props;
        axios.post(getHost() + "/api/getCaseReportById", { id })
            .then(res => {
                console.log(res, "res");
                const text = (res.data.data[0].text).substring(0, 350) + '...';
                console.log(text)
                this.setState({ previewText: text })
            })
            .catch(err => console.log(err));
    }

    render() {
        const { previewText } = this.state;
        console.log(previewText)
        const {
            displayData: { id, textEntities, entities }
        } = this.props;
        const displayPath = `search/${id}`;

        return (
            <div className='result' onClick={this.handleClick}>
                  <Card className=''
                    hoverable
                    title='title'>
                    <FontAwesomeIcon icon={['fab', 'bitcoin']} />
                      <Link to={{
                          pathname: displayPath,
                          state: {
                              textEntities,
                              entities
                          }
                      }}>{previewText}</Link>
                  </Card>
            </div>);
    }
}

Result.propTypes = {
    text: PropTypes.string,
    id: PropTypes.number,
};

Result.defaultProps = {
    text: 'I do not have text ',
    id: 12345
}

export default Result;
