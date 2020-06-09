import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import './SearchBar.css';
import {Input} from 'antd';
import { BackTop } from 'antd';


const {Search} = Input;



class SearchBar extends Component {
    state = {
        query: ''
    }

    handleTyping = e => {
        const query = e.target.value;
        this.setState({ query });
        this.props.handleTyping(query);
    }

    handleSearch = () => {
        this.props.handleSearch(this.state.query);
    }

    handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            this.handleSearch();
        }
    }


    render() {
        console.log('search kw is');
        console.log(this.props.queryText);
        return (
            <div id='search-section'>
                <div id='searchBar'>
                    <Search
                      placeholder="search in over 1000000+ medical case reports..."
                      onChange={this.handleTyping}
                      onKeyDown={this.handleKeyDown}
                      onSearch={this.handleSearch}
                      enterButton
                      />
                    {
                    //   <input
                    //     ref="searchBar"
                    //     type="text"
                    //     id="searchText"
                    //     placeholder="search in over 1000000+ medical case reports..."
                    //     onChange={this.handleTyping}
                    //     onKeyDown={this.handleKeyDown}
                    // />
                    // <button
                    //     type="submit"
                    //     id="searchButton"
                    //     onClick={this.handleSearch}
                    // >
                    //     <FontAwesomeIcon icon={['fas', 'search']} />
                    // </button>
                  }
                </div>
                <div>
                  <BackTop />
                </div>
            </div>);
    }
}

export default SearchBar;
