import React, { Component } from 'react';
import PropTypes from 'prop-types';
import TypeSelect from '../TypeSelect/TypeSelect';
import { CaretRightOutlined } from '@ant-design/icons';
import './QueryItem.css';


class QueryItem extends Component {
    render() {
        const { word, type, handleEntitySelect } = this.props;

        return (
            <div className='query-item' >
                <div className='item-word'>
                    { word }
                </div>
                  <CaretRightOutlined />
                  <TypeSelect
                      typeName={ type }
                      handleEntitySelect={ handleEntitySelect }
                  />
            </div>
        );
    }
}

QueryItem.propTypes = {
    word: PropTypes.string,
    type: PropTypes.string,
    handleEntitySelect: PropTypes.func
};

export default QueryItem;
