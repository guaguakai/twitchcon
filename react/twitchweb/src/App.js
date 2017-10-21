import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import ReactHighcharts from 'react-highcharts';
import 'whatwg-fetch';
import {Col, Row, Navbar, Form, FormGroup, FormControl, ControlLabel, Button} from 'react-bootstrap';
import ReactPlayer from 'react-player'
import { shuffle, range } from 'd3-array';
import { easeBackOut, easeBackInOut } from 'd3-ease';
import NodeGroup from 'react-move/NodeGroup';
import Input from './Input';

const EMOJIES = require('./emojies.js').EMOJIES;
console.log(EMOJIES);

const count = 20;

function getData() {
  var arr = [];
  while (arr.length < count) {
    arr.push(Math.random()*15);
  }
  return shuffle(arr.map((d) => ({ value: d }))).slice(0, count/2);
}


ReactHighcharts.Highcharts.setOptions(
{
  global: {
    useUTC: false,
  }
});

function configSetting(channelHistory, title) {
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
      text: 'https://go.twitch.tv/' + title.slice(1),
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
        text: 'Frequency'
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

const api_addr = 'https://52.229.19.76:5000';
//const api_history = 'https://0.0.0.0:5000/history';
const api_history = api_addr + '/history';
const api_reset = api_addr + '/reset';
const api_add = api_addr + '/add';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {secondsElapsed: 0, history: {}, width: null, items: [], emojies: {}, displayEmojies: {}};
    this.tick = this.tick.bind(this);
    this.getHistory = this.getHistory.bind(this);
    this.updateWidth = this.updateWidth.bind(this);
    this.container = {};
    this.input = "";
    this.getHistory();
  }
  componentDidMount() {
    this.interval = setInterval(this.tick, 10000);
    window.addEventListener('resize', this.updateWidth);
    this.updateWidth();
  }
  componentWillUnmount() {
    clearInterval(this.interval);
    window.removeEventListener('resize', this.updateWidth);
  }
  updateWidth = () => {
    this.setState(() => ({ width: this.container.offsetWidth || 200 }));
  }
  tick() {
    this.setState({secondsElapsed: this.state.secondsElapsed + 10})
    this.getHistory();
  }
  postReset() {
    console.log('start reseting...');
    return fetch(api_reset, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    }).then(res => {
      if (res.ok) {
        res.json().then( data => {
          console.log('reseting...');
        })
      }
    })
  }
  postAdd(channelName) {
    console.log('start adding...');
    fetch(api_add, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        channelName: channelName
      })
    }).then(res => {
      if (res.ok) {
        res.json().then( data => {
          console.log('adding ' + channelName + ' ...');
        })
      }
    })
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
          var emojies = {};
          var displayEmojies = {};
          var channelKeys = Object.keys(data);
          for (var i = 0; i < channelKeys.length; i++) {
            var channelID = channelKeys[i];
            emojies[channelID] = data[channelID]['emojies']

            var count = emojies[channelID].length;
            displayEmojies[channelID] = emojies[channelID]; //shuffle(range(count).map((d) => ({ value: d }))).slice(0, count);

            delete data[channelID]['emojies'];
          }

          this.setState({history: data, emojies: emojies, displayEmojies: displayEmojies});
          console.log(this.state.history);
          console.log(this.state.emojies);
          console.log(this.state.displayEmojies);
        })
      }
    })
  }
  test(key, tmpDisplayEmojies) {
    console.log('test');
    console.log(tmpDisplayEmojies);
    console.log(key);
    console.log(tmpDisplayEmojies[key]);
    if (tmpDisplayEmojies[key]) {
      if (EMOJIES[tmpDisplayEmojies[key].toLowerCase()]) {
        return <img src= {"https://static-cdn.jtvnw.net/emoticons/v1/" + EMOJIES[tmpDisplayEmojies[key].toLowerCase()].id + "/1.0"} ></img>
      } else {
        return <div></div>
      }
    } else {
      return <div></div>
    }
  }
  handleInputChange(e) {
    this.input = e.target.value;
  }
  render() {
    var width = this.state.width;


    var highcharts = [];
    if (this.state.history) {
      var historyKeys = Object.keys(this.state.history);
      for(var i = 0; i < historyKeys.length; i++) {
        var channelID = historyKeys[i];
        var tmpDisplayEmojies = this.state.displayEmojies[channelID];
        var count = tmpDisplayEmojies.length;
        if (count === 0){
          var items = [];
        } else {
          var items = shuffle(range(count).map((d) => ({ value: d }))).slice(0, count/1.5);
        }
        // var items = range(count);
        console.log('items:');
        console.log(items);
        console.log('tmp display emojies:');
        console.log(tmpDisplayEmojies);
        var videoConfig = {width: 800, height: 600, channel: channelID.slice(1)};
        var channelHistory = this.state.history[channelID];
        var emojies = this.state.emojies[channelID];
        delete this.state.history[channelID]['emojies'];
        var highchartComponent = (
          <div>
            <Col md={5}>
              <iframe
                  src= {"https://player.twitch.tv/?channel=" + channelID.slice(1) + "&muted=true"}
                  height="400"
                  width="600"
                  frameborder="50"
                  scrolling="yes"
                  allowfullscreen="true">
              </iframe>
              <ReactHighcharts config={configSetting(channelHistory, channelID)} ></ReactHighcharts>
            </Col>
          </div>
        );
        var emojiesComponent = (
          <div>
            <Col md={1}>
              <div ref={(d) => { this.container = d; }}>
                {width === null ? null : (
                  <NodeGroup
                    data={items}
                    keyAccessor={(d) => d.value}
    
                    start={() => ({
                      x: width*0.5,
                      opacity: 0,
                      color: 'black',
                    })}
    
                    enter={() => ([
                      {
                        x: [width * -0.5],
                        color: ['#00cf77'],
                        timing: { delay: 400 + (Math.random() * 200), duration: 400 + (Math.random() * 200), ease: easeBackOut },
                      },
                      {
                        opacity: [1],
                        timing: { duration: 400 + (Math.random() * 200)},
                      },
                    ])}
    
                    leave={() => ([
                      {
                        x: [width * -3],
                        color: ['#ff0063', 'black'],
                        timing: { duration: 1800 + (Math.random() * 400), ease: easeBackInOut },
                      },
                      {
                        opacity: [0],
                        timing: { delay: 600 + (Math.random() * 300), duration: 1800 + (Math.random() * 400) },
                      },
                    ])}
                  >
                    {(nodes) => (
                      <div style={{ margin: 10, height: count * 20, position: 'relative' }}>
                        {nodes.map(({ key, state: { x, opacity, color } }) => (
                          <div
                            key={key}
                            style={{
                              position: 'absolute',
                              transform: `translate(${x}px, ${Math.random() * 20 + key*200/count}px)`,
                              opacity,
                              color,
                            }}
                          >
                            { this.test(key, tmpDisplayEmojies) }
                          </div>
                        ))}
                      </div>
                    )}
                  </NodeGroup>
                )}
              </div>
            </Col>
          </div>
        );
        var bigComponent = (
          <div>
            { highchartComponent }
            { emojiesComponent }
          </div>
        );
        highcharts.push(bigComponent);
      }
    }
    return (
      <div className="App">
        <Navbar>
          <Navbar.Header>
            <Navbar.Brand>
              <a size="60">Emoji Detection</a>
            </Navbar.Brand>
          </Navbar.Header>
        </Navbar>
        <Col ms={12}>
          <Form inline>
            <Col ms={6}>
              <Input postAdd={this.postAdd.bind(this)} />
            </Col>
            <Col ms={6}>
              <Button onClick={this.postReset.bind(this)} >Reset</Button>
            </Col>
          </Form>
        </Col>
        { highcharts }
      </div>
    );
  }
}

export default App;
