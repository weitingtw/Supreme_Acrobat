import React, { Component } from 'react';
import { Redirect } from "react-router-dom";
import * as QueryString from "query-string"
import TopBar from "../TopBar/TopBar";
import LoginModal from '../LoginModal/LoginModal';
import SearchResults from '../SearchResults/SearchResults';
import axios from 'axios';
import './SearchPage.css';
import { combineMultiWordEntity, allQueriesToTextEntities } from '../../utils';
import { getHost } from '../../utils';
import 'antd/dist/antd.css';
import { Layout, Button, Row, Input } from 'antd';
const { Header, Content } = Layout;

// var storage=window.localStorage;

class SearchPage extends Component {
    state = {
        results: [],               // search results
        urlquery: "",
        textEntities: [],           // predicted entities
        queryText: '',               // query plain text
        allQueries: [
            //{
            //queries: ['', ''],
            //relations: ['BEFORE']
            //}
        ],
        timeout: 0
        // redirect: false,
    }

    componentWillMount() {
        console.log('componentDidMount is called!');
        console.log(this.props.location);
        const { search } = this.props.location;
        const { urlquery } = this.props.location.search;
        // this.setState({});
        const params = QueryString.parse(this.props.location.search);
        console.log(params);
        console.log(params.length);

        if (Object.keys(params).length > 0) {
            console.log('i am called');
            console.log(params);
            const textEntities = JSON.parse(params['entities']);
            const queryText = params['query'];
            const allQueries = JSON.parse(params['relationQuery']);
            this.setState({ textEntities, queryText, allQueries });
            const queryObj = {
                entities: textEntities,
                query: queryText,
                relationQuery: allQueries
            }
            console.log('fetch data before!', queryObj);

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
    }

    handleTyping = async (queryText) => {
        if (this.state.timeout) {
            clearTimeout(this.state.timeout);
        }
        this.state.timeout = setTimeout(() => {
            this.late_search(queryText);
        }, 1000);
    }

    late_search = (queryText) => {
        axios.post(getHost() + "/api/getPrediction", {
            data: { query: queryText }
        })
            .then(response => {
                const { data: { entity_types, tokens } } = response;
                const textEntities = combineMultiWordEntity(entity_types, tokens);
                console.log(textEntities)
                // update state to save current entity tokens
                this.setState({
                    textEntities,
                    queryText
                }, () => {
                    console.log(this.state);
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
        console.log("handle search called!");
        const { textEntities, queryText, allQueries } = this.state;
        const queryObj = {
            entities: textEntities,
            query: queryText,
            relationQuery: allQueries
        }
        let urlquery = '/search?entities=' + JSON.stringify(textEntities) + '&query=' + queryText + '&relationQuery=' + JSON.stringify(allQueries);
        this.setState({ urlquery });
        this.props.history.push(urlquery);
        // window.location.reload();
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
                    <Header style={{ backgroundColor: 'white', display: 'flex', justifyContent: 'flex-end' }}>
                        <LoginModal />
                    </Header>
                    <Content style={{ backgroundColor: 'white' }}>


                        <div id='top-bar-container'>
                            <TopBar
                                textEntities={textEntities}
                                handleSearch={this.handleSearch3}
                                handleAdvancedSearch={this.handleAdvancedSearch}
                                handleTyping={this.handleTyping}
                                handleRelationSearch={this.handleRelationSearch}
                                allQueries={this.state.allQueries}
                                handleTypingRelation={this.handleTyping2}
                                handleSelect={this.handleSelect2}
                                handleKeyDown={this.handleKeyDown2}
                                handleAddColumn={this.handleAddColumn2}
                                handleAddRow={this.handleAddRow2}
                                handleDeleteRow={this.handleDeleteRow2}
                            />
                        </div>

                        {
                            results.length > 0 &&
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
