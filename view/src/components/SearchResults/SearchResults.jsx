import React, { Component } from 'react';
import Result from './Result/Result';
import PropTypes from 'prop-types';
import './SearchResults.css';


class SearchResults extends Component {
    state = {}

    render() {
        const { results, textEntities } = this.props;
        console.log(results)
        return (
            <div id='searchResults'>
                {
                    results.length <= 0 ? '' : results.map(eachData => {
                        eachData.textEntities = textEntities;
                        console.log('show some each data');
                        console.log(eachData);
                        return <Result
                            displayData={eachData}
                            key={eachData.id}
                        />
                    })
                }

            </div>);
    }
}

SearchResults.propTypes = {
    results: PropTypes.arrayOf(PropTypes.object).isRequired,
};

SearchResults.defaultProps = {
    results: []
}


export default SearchResults;
