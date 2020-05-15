import React, { Component } from 'react';
import TopBar from "../TopBar/TopBar";
import SearchResults from '../SearchResults/SearchResults';
import LoginModal from '../LoginModal/LoginModal';
import axios from 'axios';
import './SearchPage.css';
import { combineMultiWordEntity, allQueriesToTextEntities } from '../../utils';
import { getHost } from '../../utils';
import RelationSearchBar from '../RelationSearchBar/RelationSearchBar';

import {Card, Layout, Form, Button, Row, Input} from 'antd';
const { Header, Content } = Layout;



class SearchPage extends Component {
    state = {
        results: [],                // search results
        textEntities: [],           // predicted entities
        queryText: '',               // query plain text
        allQueries: [
            //{
            //queries: ['', ''],
            //relations: ['BEFORE']
            //}
        ],
    }

    handleTyping = async (queryText) => {
        const _isLetter = c => /^[a-zA-Z()]$/.test(c);
        if (_isLetter(queryText.charAt(queryText.length - 1))) { return }

        // if last typing is not alphabet
        // go over crf API to get entities

        axios.post(getHost() + "/api/getPrediction", {
            data: { query: queryText }
        })
            .then(response => {
                const { data: { entity_types, tokens } } = response;
                const textEntities = combineMultiWordEntity(entity_types, tokens);

                // update state to save current entity tokens
                this.setState({
                    textEntities,
                    queryText
                });
            })
            .catch(error => { console.log(error); });

        this.setState({
            allQueries: []
        })

    }

    handleSearch = () => {
        const { textEntities, queryText } = this.state;
        const queryObj = {
            entities: textEntities,
            query: queryText
        }
        console.log('basic search: ', queryObj);

        axios.post(getHost() + "/api/searchNodes", queryObj)
            .then(res => {
                // search results
                const results = res.data.data.map(info => {
                    return {
                        id: info._source.pmID,
                        entities: info._source.entities,
                        previewText: info._source.content
                    }
                })
                this.setState({ results })
            })
            .catch(err => console.log(err));
    }
    // this one is being used
    handleSearch3 = () => {
        const { textEntities, queryText, allQueries } = this.state;
        const queryObj = {
            entities: textEntities,
            query: queryText,
            relationQuery: allQueries
        }
        console.log('basic search: ', queryObj);

        axios.post(getHost() + "/api/searchNodesWithRelations", queryObj)
            .then(res => {
                // search results
                const results = res.data.data.map(info => {
                    console.log(info.type);
                    if (info.type == "searchNode") {
                        return {
                            id: info._source.pmID,
                            entities: info._source.entities,
                            previewText: info._source.content
                        }
                    } else if (info.type == "relation") {
                        return {
                            id: info.pmID,
                            entities: info.entities,
                            previewText: "info._source.content info._source.content info._source.content info._source.content info._source.content"
                        }
                    }
                })
                this.setState({ results })
            })
            .catch(err => console.log(err));
    }

    handleTyping2 = row => index => e => {
        const query = e.target.value;
        const { allQueries } = { ...this.state };
        const { queries } = allQueries[row];
        queries[index] = query;
        this.setState({ allQueries });
        console.log(this.state)
    }

    handleSelect2 = row => index => key => {
        const { allQueries } = { ...this.state };
        const { relations } = allQueries[row];
        relations[index] = key;
        this.setState({ allQueries });
    }

    handleKeyDown2 = e => {
        if (e.key === 'Enter') {
            this.handleRelationSearch();
        }
    }

    handleAddColumn2 = row => () => {
        const { allQueries } = { ...this.state };
        const { queries, relations } = allQueries[row];
        queries.push('');
        relations.push('BEFORE')
        this.setState({ allQueries });
    }

    handleAddRow2 = () => {
        const { allQueries } = { ...this.state };
        allQueries.push({
            queries: ['', ''],
            relations: ['BEFORE']
        })
        this.setState({ allQueries });
    }

    handleDeleteRow2 = () => {
        const { allQueries } = { ...this.state };
        allQueries.pop();
        this.setState({ allQueries });
    }

    handleRelationSearch = async () => {
        const { textEntities, queryText } = this.state;
        const type_list = ["Sign_symptom"]
        console.log(textEntities);
        var newQueries = [];
        for (var i = 0; i < textEntities.length; i++) {
            for (var j = i + 1; j < textEntities.length; j++) {
                if (type_list.indexOf(textEntities[i].type) > -1 && type_list.indexOf(textEntities[j].type) > -1) {

                    var query_object = {
                        queries: [textEntities[i].label, textEntities[j].label],
                        relations: ['BEFORE']
                    }
                    var relations = []
                    await axios.post(getHost() + "/api/getRelationPrediction", {
                        data: { query: queryText, query1: query_object.queries[0], query2: query_object.queries[1] }
                    })
                        .then(response => {
                            const { data: { relation } } = response;
                            console.log(relation)
                            relations.push(relation)


                        })
                        .catch(error => { console.log(error); });
                    console.log(query_object.queries[0])
                    console.log(query_object.queries[1])
                    console.log(relations)
                    query_object.relations = relations
                    newQueries.push(query_object)
                }
            }
        }
        console.log(newQueries)
        this.setState({
            allQueries: newQueries
        })
    }


    render() {
        const { results, textEntities, allQueries } = this.state;
        console.log(textEntities.concat(allQueriesToTextEntities(allQueries)));
        console.log("results!!!!");
        console.log(results)
        console.log(allQueries)
        return (
            <div id='searchPage'>
              <Layout>
                <Header style={{ backgroundColor: 'white', display: 'flex', justifyContent: 'flex-end'}}>
                  <LoginModal />
                </Header>
                <Content style={{ backgroundColor: 'white'}}>


                    <div id='top-bar-container'>
                        <TopBar
                            textEntities={textEntities}
                            handleSearch={this.handleSearch3}
                            handleAdvancedSearch={this.handleAdvancedSearch}
                            handleTyping={this.handleTyping}
                        />
                        <button
                            type="submit"
                            id="relationSearchButton"
                            onClick={this.handleRelationSearch}
                        >Parse Relations</button>
                        <RelationSearchBar
                            textEntities={textEntities}
                            allQueries={this.state.allQueries}
                            handleTyping={this.handleTyping2}
                            handleSelect={this.handleSelect2}
                            handleKeyDown={this.handleKeyDown2}
                            handleAddColumn={this.handleAddColumn2}
                            handleAddRow={this.handleAddRow2}
                            handleDeleteRow={this.handleDeleteRow2}
                        />
                    </div>
                    {
                      // results.length > 0 && (
                      //   <div id='search-result-container'>
                      //     {resultList}
                      //   </div>
                      // )
                    }

                     {results.length > 0 &&
                        <div id='search-result-container'>
                            <SearchResults
                                results={results}
                                textEntities={textEntities.concat(allQueriesToTextEntities(allQueries))}
                            />
                        </div>
                    }
                  </Content>
                </Layout>


            </div>
        );
    }
}

export default SearchPage;
