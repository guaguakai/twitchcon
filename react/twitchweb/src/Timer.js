import React, { Component } from 'react';

class Timer extends Component{
  constructor(props) {
    super(props);
    this.state = {secondsElapsed: 0};
    this.tick = this.tick.bind(this)
  }
  componentDidMount() {
    this.interval = setInterval(this.tick, 1000);
  }
  componentWillUnmount() {
    clearInterval(this.interval);
  }
  tick() {
    var s = this.state.secondsElapsed;
    this.setState({secondsElapsed: s + 1});
  }
  render() {
    return (
      <div>Seconds Elapsed: {this.state.secondsElapsed}</div>
    );
  }
};

export default Timer;
