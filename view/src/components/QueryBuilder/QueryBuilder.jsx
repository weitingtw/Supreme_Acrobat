import React, { Component } from 'react';
import PropTypes from 'prop-types';
import QueryItem from '../QueryItem/QueryItem';
import { combineMultiWordEntity } from '../../utils';
import { Switch } from 'antd';
import './QueryBuilder.css';


class QueryBuilder extends Component {
    state = {
        showO: true
    }

    handleToggle = () => {
        this.setState(prevState => ({
            showO: !prevState.showO
        }));
    }

    handleEntitySelect = index => type => {
        this.props.handleEntitySelect(index, type);
    }

    render() {
        const { entities } = this.props;
        const { showO } = this.state;

        return (
            <div id='queryBuilder' >
                <div id='entity-query'>
                  <div id='entity-query-title'>Entity Setting:</div>
                  <div id='show_type'>
                    Show Type O
                    <Switch
                      size='small'
                      defaultChecked
                      style={{marginLeft: '10px'}}
                      onChange={this.handleToggle}/>
                  </div>

                </div>

                {
                    entities.map((token, index) => {
                        const { label, type } = token;

                        const handleEntitySelect = this.handleEntitySelect(index);
                        if (type !== 'O' || showO) {
                            console.log('before query item');
                            console.log(label);
                            console.log(index);
                            console.log(type);
                            console.log(typeof(type));
                            return <QueryItem
                                word={label}
                                key={index}
                                type={type}
                                handleEntitySelect={handleEntitySelect}
                            />
                        } else {
                            return null;
                        }
                    })
                }

            </div>
        );
    }
}

QueryBuilder.propTypes = {
    entities: PropTypes.array,
    handleEntitySelect: PropTypes.func
};

// QueryBuilder.defaultProps = {
//     queries: {
//         query1: '',
//         query2: ''
//     }
// };

export default QueryBuilder;
