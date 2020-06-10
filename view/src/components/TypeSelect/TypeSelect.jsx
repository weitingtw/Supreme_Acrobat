import React, { Component } from 'react';
import PropTypes from 'prop-types';
import DropDown from '../DropDown/DropDown';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import './TypeSelect.css';


/* -----
    component that display entity type and
    normalization suggestions drop down select
                                            ----- */
class TypeSelect extends Component {
    state = {
        currentType: this.props.typeName,
        currentNorm: 'norm_1',
    }

    handleSelectType = key => {
        console.log('in type select');
        console.log(key);
        this.props.handleEntitySelect(key);
        // this.props.handleSelect();
    }

    handleSelectNorm = key => {
        this.setState({ currentNorm: key });
        // this.props.handleSelect();
    }

    render() {
        const { typeName } = this.props;
        const typeDropDownData = [
            'Age',
            'Sex',
            'Disease_disorder',
            'Nonbiological_location',
            'Detailed_description',
            'Duration',
            'Therapeutic_procedure',
            'Sign_symptom',
            'Lab_value',
            'Dosage',
            'Medication',
            'Severity',
            'Frequency'
        ];
        const normDropDownData = ['norm_1', 'norm_2', 'norm_3'];

        return (
            <div className='type-select' >
                <span className='drop-down-container'>
                    <DropDown
                        dropdownsize='185'
                        handleSelect={ this.handleSelectType }
                        dropDownData={ typeDropDownData }
                        current={ typeName }
                    />
                </span>
                <span className='drop-down-container'>
                    <DropDown
                        dropdownsize='90'
                        handleSelect={ this.handleSelectNorm }
                        dropDownData={ normDropDownData }
                        current={ this.state.currentNorm }
                    />
                </span>
                <FontAwesomeIcon
                    icon={['far', 'times-circle']}
                    onClick={() => console.log('close!')}
                />
            </div>
        );
    }
}

TypeSelect.propTypes = {
    typeName: PropTypes.string,
    handleSelect: PropTypes.func
};

TypeSelect.defaultProps = {
    handleSelect: () => {}
}

export default TypeSelect;
