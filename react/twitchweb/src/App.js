import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import ReactHighcharts from 'react-highcharts';
import 'whatwg-fetch'


function configSetting(channelHistory) {
  if (channelHistory) {
    var draw_series = [];
    var keys = Object.keys(channelHistory);
    for(var i = 0; i < keys.length; i++) {
      var tmp = {};
      tmp['name'] = keys[i];
      tmp['data'] = channelHistory[keys[i]]
      draw_series.push(tmp)
    }
  }
  return {
    chart: {
      zoomType: 'x'
    },
    title: {
      text: 'title',
      x: -20 //center
    },
    rangeSelector: {
      enabled: true,
    },
    xAxis: {
      type: 'datetime'
    },
    yAxis: {
      title: {
        text: 'Rank'
      },
      plotLines: [{
        value: 0,
        width: 1,
        color: '#808080'
      }]
    },
    series: draw_series,
    //series: [{name: 'frequency', data: [[1508556117.133573, 9], [1508556122.131093, 12], [1508556127.131935, 8], [1508556132.132488, 13], [1508556137.142115, 14], [1508556142.140831, 15], [1508556147.142206, 17], [1508556152.141945, 12], [1508556157.142118, 11], [1508556162.142911, 4], [1508556167.143821, 3], [1508556172.146076, 11], [1508556177.148393, 12], [1508556182.150883, 6], [1508556187.151581, 6], [1508556192.151255, 4], [1508556197.153385, 3], [1508556202.155949, 6], [1508556207.156514, 10], [1508556212.157469, 13], [1508556217.157799, 13], [1508556222.159159, 10], [1508556227.160318, 6], [1508556232.161968, 4], [1508556237.162771, 4], [1508556242.165297, 6], [1508556247.166444, 9], [1508556252.167448, 10], [1508556257.167874, 6], [1508556262.167702, 9], [1508556267.16842, 7]]}]
  };
}

const api_history = 'https://0.0.0.0:5000/history'

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {secondsElapsed: 0, history: {}};
    this.tick = this.tick.bind(this);
    this.getHistory = this.getHistory.bind(this);
    this.getHistory();
  }
  componentDidMount() {
    this.interval = setInterval(this.tick, 10000);
  }
  componentWillUnmount() {
    clearInterval(this.interval);
  }
  tick() {
    this.setState({secondsElapsed: this.state.secondsElapsed + 10})
    this.getHistory();
  }
  getHistory() {
    fetch(api_history, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      }
    }).then(res => {
      if (res.ok) {
        res.json().then( data => {
          this.setState({history: data});
          console.log(this.state.history);
        })
      }
    })
  }
  render() {
    var highcharts = [];
    if (this.state.history) {
      var historyKeys = Object.keys(this.state.history);
      for(var i = 0; i < historyKeys.length; i++) {
        var channelID = historyKeys[i];
        console.log(channelID);
        var channelHistory = this.state.history[channelID];
        var highchartComponent = (
          <ReactHighcharts config = {configSetting(channelHistory)}></ReactHighcharts>
        );
      }
    }
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React</h1>
        </header>
        <p className="App-intro">
          To get started, edit <code>src/App.js</code> and save to reload.
        </p>
        <ReactHighcharts config = {configSetting(this.state.history['#kamikat'])}></ReactHighcharts>
        { highcharts }
        <div>Seconds Elapsed: {this.state.secondsElapsed}</div>
      </div>
    );
  }
}

export default App;
