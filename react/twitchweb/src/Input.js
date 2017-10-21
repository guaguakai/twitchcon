import React, { Component } from 'react';
import {Col, Row, Navbar, Form, FormGroup, FormControl, ControlLabel, Button} from 'react-bootstrap';

class Input extends Component {
  constructor(props) {
    super(props);
    this.state = {value: ""};
  }
  handleOnclick() {
    this.props.postAdd(this.state.value);
    this.setState({value: ""});
  }
  handleInputChange(e) {
    this.setState({value: e.target.value});
  }
  render() {
    return (
      <div>
        <FormGroup controlId="formInlineName">
          <FormControl value={this.state.value} type='text' placeholder='tecnosh' onChange={this.handleInputChange.bind(this)}/>
        </FormGroup>
        <Button onClick={this.handleOnclick.bind(this)}>Add</Button>
      </div>
    )
  }
}

export default Input;
