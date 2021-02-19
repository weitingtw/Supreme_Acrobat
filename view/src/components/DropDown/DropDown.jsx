import React, { Component } from 'react';
// import { DropdownButton, Dropdown } from 'react-bootstrap';
import { Menu, Dropdown, Button } from 'antd';
import './DropDown.css';
import { Select } from 'antd';

const { Option } = Select;


class DropDown extends Component {
    state = {
        current: this.props.dropDownData[0]
    }

    render() {
        const { current, handleSelect, dropDownData } = this.props;
        const dropdownsize = parseInt(this.props.dropdownsize);
        return (

            <Select defaultValue={current} style={{ width: dropdownsize }} onChange={handleSelect}>
              {dropDownData.map(key => (
                  <Option
                      key={key}
                      value={key}
                  >
                  {key}
                  </Option>
              ))}
            </Select>
            // <Dropdown trigger='click' overlay={menu}>
            //   <Button style={{ marginLeft: 8 }}>
            //     {this.state.current} <DownOutlined />
            //   </Button>
            // </Dropdown>
        )
    }
}

export default DropDown;
