import React, { Component } from 'react';
import axios from 'axios'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import DropDown from "../DropDown/DropDown";
import SearchResults from '../SearchResults/SearchResults';
import { allQueriesToTextEntities } from '../../utils';
import './RelationSearchBar.css';
import { getHost } from '../../utils';


/*
    Component for multi relation search
    no UI polish since it is for inner test
                                                */
class RelationSearchBar extends Component {
    state = {
        allQueries: this.props.allQueries
    }

    /*handleTyping = row => index => e => {
        const query = e.target.value;
        const { allQueries } = { ...this.state };
        const { queries } = allQueries[row];
        queries[index] = query;
        this.setState({ allQueries });
    }

    handleSelect = row => index => key => {
        const { allQueries } = { ...this.state };
        const { relations } = allQueries[row];
        relations[index] = key;
        this.setState({ allQueries });
    }

    handleKeyDown = e => {
        if (e.key === 'Enter') {
            this.handleRelationSearch();
        }
    }

    handleRelationSearch = () => {
        const { allQueries } = this.state;
        console.log(allQueries);
        axios.post(getHost() + ":3001/api/searchMultiRelations", allQueries)
            .then(res => {
                const results = res.data.data.map(info => {
                    console.log(info)
                    return {
                        id: info.pmID,
                        entities: info.entities,
                        previewText: "info._source.content info._source.content info._source.content info._source.content info._source.content"
                    }
                })
                console.log(results);
                this.setState({
                    results
                })
            })
            .catch(err => console.log(err));
    }

    handleAddColumn = row => () => {
        const { allQueries } = { ...this.state };
        const { queries, relations } = allQueries[row];
        queries.push('');
        relations.push('BEFORE')
        this.setState({ allQueries });
    }

    handleAddRow = () => {
        const { allQueries } = { ...this.state };
        allQueries.push({
            queries: ['', ''],
            relations: ['BEFORE']
        })
        this.setState({ allQueries });
    }*/

    render() {
        const { allQueries, results } = this.state;
        console.log(allQueries);
        console.log(allQueriesToTextEntities(allQueries));
        return (
            <div id='relationSearchBar'>
                {allQueries.map((oneQuery, i) =>
                    <RelationSearch
                        queries={oneQuery.queries}
                        relations={oneQuery.relations}
                        handleTyping={this.props.handleTyping(i)}
                        handleSelect={this.props.handleSelect(i)}
                        handleAddColumn={this.props.handleAddColumn(i)}
                        handleKeyDown={this.props.handleKeyDown}
                    />
                )}
                <div>
                    <button
                        className="button"
                        onClick={this.props.handleAddRow}
                    >
                        <FontAwesomeIcon icon={['fas', 'plus']} />
                        {' Row'}
                    </button>
                    <button
                        className="button"
                        onClick={this.props.handleDeleteRow}
                    >
                        <FontAwesomeIcon icon={['fas', 'minus']} />
                        {' Row'}
                    </button>
                </div>

            </div>
        );
    }
}


class RelationSearch extends Component {
    handleAddColumn = () => {
        this.props.handleAddColumn();
    }

    render() {
        const {
            queries,
            relations,
            handleTyping,
            handleSelect,
            handleKeyDown
        } = this.props;
        const allRelations = ['BEFORE', 'AFTER', 'OVERLAP', 'MODIFY', 'IDENTICAL', 'SUBPROCEDURE'];

        const inputComponent = queries.map((word, i) => {
            if (i === queries.length - 1) {
                return (<div className='one_relation' key={i}>
                    <input
                        type="text"
                        className="searchText"
                        onChange={handleTyping(i)}
                        onKeyDown={handleKeyDown}
                    />
                </div>)
            } else {
                return (<div className='one_relation' key={i}>
                    <input
                        type="text"
                        className="searchText"
                        onChange={handleTyping(i)}
                        onKeyDown={handleKeyDown}
                    />
                    <div className='drop-down-container'>
                        <DropDown
                            handleSelect={handleSelect(i)}
                            dropDownData={allRelations}
                            current={relations[i]}
                        />
                    </div>
                </div>)
            }
        })
        return (<div className='one_query'>
            {inputComponent}
            <button
                className="button"
                onClick={this.handleAddColumn}
            >
                <FontAwesomeIcon icon={['fas', 'plus']} />
            </button>
        </div>);
    }
}

export default RelationSearchBar;