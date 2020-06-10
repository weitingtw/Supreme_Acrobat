import React, { Component } from 'react';
import axios from 'axios'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import DropDown from "../DropDown/DropDown";
import SearchResults from '../SearchResults/SearchResults';
import { Button, Input } from 'antd';
import { MonitorOutlined, PlusOutlined, MinusOutlined } from '@ant-design/icons';
import { allQueriesToTextEntities } from '../../utils';
import './RelationSearchBar.css';
import { getHost } from '../../utils';


/*
    Component for multi relation search
    no UI polish since it is for inner test
                                                */
class RelationSearchBar extends Component {
    /*state = {
        allQueries: this.props.allQueries,
    }*/


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

        const { allQueries, textEntities } = this.props;
        console.log(allQueries);
        //console.log(allQueriesToTextEntities(allQueries));

        /*const type_list = ["Sign_symptom"]
        var predict_relation = [];
        for (var i = 0; i < textEntities.length; i++) {
            for (var j = i + 1; j < textEntities.length; j++) {
                if (type_list.indexOf(textEntities[i].type) > -1 && type_list.indexOf(textEntities[j].type) > -1) {
                    const queries = [textEntities[i].label, textEntities[j].label]
                    const relations = ["BEFORE"]
                    const base = (
                        <RelationSearch
                            queries={queries}
                            relations={relations}
                            handleTyping={this.props.handleTyping(i)}
                            handleSelect={this.props.handleSelect(i)}
                            handleAddColumn={this.props.handleAddColumn(i)}
                            handleKeyDown={this.props.handleKeyDown}
                        />
                    )
                    predict_relation.push(base);
                }
            }
        }
        {predict_relation.map((element, i) => (element))}
        */
        return (
            <div id='relationSearchBar'>
                <div id='relation-title'>Relation Setting:</div>
                <Button
                  shape="round"
                  icon={<MonitorOutlined style={{verticalAlign: 'text-bottom'}} />}
                  onClick={this.props.handleRelationSearch}
                  >
                  Parse Relations
                </Button>
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
                <div id="add-minus-button-div">
                    <Button
                      shape="round"
                      icon={<PlusOutlined style={{verticalAlign: 'text-bottom'}} />}
                      onClick={this.props.handleAddRow}
                      >Row</Button>
                    <Button
                      shape="round"
                      icon={<MinusOutlined style={{verticalAlign: 'text-bottom'}} />}
                      onClick={this.props.handleDeleteRow}
                      >Row</Button>
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
                <Input
                    style={{width: '100px', marginTop: '5px'}}
                    value={word}
                    onChange={handleTyping(i)}
                    onKeyDown={handleKeyDown}/>
                </div>)
            } else {
                return (<div className='one_relation' key={i}>
                    <Input
                        style={{width: '100px'}}
                        value={word}
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
            <Button
              shape="round"
              icon={<PlusOutlined style={{verticalAlign: 'text-bottom'}} />}
              onClick={this.handleAddColumn}
              />
        </div>);
    }
}

export default RelationSearchBar;
