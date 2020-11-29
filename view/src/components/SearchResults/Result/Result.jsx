import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import './Result.css';
import axios from 'axios'
import { getHost } from '../../../utils';
import { Card } from 'antd';


class Result extends Component {
    state = {
        previewText: '',
        title: '',
    }

    componentWillMount() {
        const {
            displayData: { previewText, id, textEntities, entities }
        } = this.props;
        console.log(this.props);
        this.setState({ previewText: previewText })
        axios.post(getHost() + "/api/getCaseReportById", { id })
            .then(res => {
                const data = res.data.data[0];
                const text = (data.text).substring(0, 350) + '...';
                const title = data.title
                console.log(text)
                console.log(title)
                this.setState({ previewText: text })
                this.setState({ title: title })
            })
            .catch(err => console.log(err));
    }

    render() {
        const { previewText, title } = this.state;
        console.log(previewText)
        const {
            displayData: { id, textEntities, entities }
        } = this.props;
        console.log("====================");
        console.log(entities);
        console.log("let's see props data");
        console.log(this.props);
        const displayPath = `/search/${id}`;
        console.log(title)

        return (
            <div className='result' onClick={this.handleClick}>
              <Link
                target="_blank"
                to={{
                    pathname: displayPath,
                    search: "searchEntities=" + JSON.stringify(textEntities) + "&entities=" + JSON.stringify(entities),
                }}>
                <Card className=''
                    hoverable
                    title={title}>

                    <p><FontAwesomeIcon icon={['fab', 'bitcoin']} />{previewText}</p>
                </Card>
              </Link>
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
