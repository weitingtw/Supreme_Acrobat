import React, { Component } from "react";
import Result from "./Result/Result";
import PropTypes from "prop-types";
import "./SearchResults.css";

import ReactPaginate from "react-paginate";

class SearchResults extends Component {
  constructor(props) {
    super(props);

    const perPage = 10;

    this.state = {
      offset: 0,
      perPage: 10,
      currentPage: 0,
      pageCount: Math.ceil(props.results.length / perPage),
    };
    this.handlePageClick = this.handlePageClick.bind(this);
  }

  handlePageClick = (event) => {
    const selectedPage = event.selected;
    const offset = selectedPage * this.state.perPage;

    this.setState({
      currentPage: selectedPage,
      offset: offset,
    });
  };

  render() {
    const { results, textEntities } = this.props;
    console.log(results);
    return (
      <div id="searchResults">
        <p>{`Showing results ${this.state.offset + 1}-${Math.min(
          this.state.offset + this.state.perPage,
          results.length
        )} of ${results.length}`}</p>
        <ReactPaginate
          previousLabel={"prev"}
          nextLabel={"next"}
          breakLabel={"..."}
          breakClassName={"break-me"}
          pageCount={this.state.pageCount}
          marginPagesDisplayed={2}
          pageRangeDisplayed={5}
          onPageChange={this.handlePageClick}
          containerClassName={"pagination"}
          subContainerClassName={"pages pagination"}
          activeClassName={"active"}
        />

        {results.length <= 0
          ? ""
          : results
              .slice(this.state.offset, this.state.offset + this.state.perPage)
              .map((eachData) => {
                eachData.textEntities = textEntities;
                console.log("show some each data");
                console.log(eachData);
                return <Result displayData={eachData} key={eachData.id} />;
              })}
      </div>
    );
  }
}

SearchResults.propTypes = {
  results: PropTypes.arrayOf(PropTypes.object).isRequired,
};

SearchResults.defaultProps = {
  results: [],
};

export default SearchResults;
