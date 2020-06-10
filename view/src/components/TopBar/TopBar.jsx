import React, { Component } from 'react';
import SearchBar from "../SearchBar/SearchBar";
import RelationSearchBar from '../RelationSearchBar/RelationSearchBar';
import QueryBuilder from '../QueryBuilder/QueryBuilder';
import { DownOutlined, UpOutlined } from '@ant-design/icons';
import { Link } from "react-router-dom";
import './TopBar.css';

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
                        style={{display: 'inline-block'}}
                        handleSearch={this.handleSearch}
                        handleTyping={this.handleTyping}
                    />
                </div>

                <a id="search-bar-advanced" onClick={this.toggle}>
                  {this.state.expand_name}
                  {this.state.expand ? <UpOutlined style={{verticalAlign: 'text-bottom'}} />:<DownOutlined style={{verticalAlign: 'text-bottom'}} /> }
                </a>

                {this.state.expand && <div id='query-builder-container'>
                    <QueryBuilder
                        queries={queries}
                        entities={textEntities}
                        handleEntitySelect={this.handleEntitySelect}
                    />
                </div>}

                {this.state.expand && <div id='relation-container'>
                    <RelationSearchBar
                        textEntities={textEntities}
                        handleRelationSearch={this.props.handleRelationSearch}
                        allQueries={this.props.allQueries}
                        handleTyping={this.props.handleTypingRelation}
                        handleSelect={this.props.handleSelect}
                        handleKeyDown={this.props.handleKeyDown}
                        handleAddColumn={this.props.handleAddColumn}
                        handleAddRow={this.props.handleAddRow}
                        handleDeleteRow={this.props.handleDeleteRow}
                    />
                </div>}
            </div>
        );
    }
}

export default TopBar;
