import React, { Component } from 'react';
import SearchBar from "../SearchBar/SearchBar";
import QueryBuilder from '../QueryBuilder/QueryBuilder';
import { Link } from "react-router-dom";
import './TopBar.css';
import {Form, Button, Row, Input} from 'antd';
const Search = Input.Search;
/*
    Component that contains the search bar and
    the query builder under the search bar
                                                */
class TopBar extends Component {
    state = {
        expand: false,
        expand_name: "Advanced"
    }
    handleTyping = query => {
        this.props.handleTyping(query);
    }

    handleSearch = () => {
        this.props.handleSearch();
    }

    handleEntitySelect = (index, type) => {
        const newState = { ...this.state };
        this.props.textEntities[index].type = type;
        this.setState(newState);
    }


    toggle = () => {
      const { expand, expand_name } = this.state;
      this.setState({ expand: !expand });
      if(!expand) this.setState({ expand_name : "Collapse"});
      else this.setState({ expand_name : "Advanced"});
    }

    render() {
        const { textEntities, queries } = this.props;
        console.log('textEntities: ', textEntities);
        return (
            <div id='topBar'>
                <Link to="/" id='title'>
                    CREAT<span id='E'>e</span>
                </Link>

                <div id='search-bar-container'>
                    <SearchBar
                        handleSearch={this.handleSearch}
                        handleTyping={this.handleTyping}
                    />
                </div>

                <a onClick={this.toggle}>{this.state.expand_name}</a>

                {this.state.expand && <div id='query-builder-container'>
                    <QueryBuilder
                        queries={queries}
                        entities={textEntities}
                        handleEntitySelect={this.handleEntitySelect}
                    />
                </div>}
            </div>
        );
    }
}

export default TopBar;
