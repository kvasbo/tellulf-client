import React, { Component } from 'react';
import Moment from 'moment';
import './klokke.css';

export default class Klokke extends Component {
  constructor(props) {
    super(props);
    this.state = {
      time: null,
      dato: null,
    };
  }

  componentDidMount() {
    setInterval(() => {
      this.setTid();
    }, 1000);
  }

  setTid() {
    const now = new Moment();
    const time = now.format('HH:mm');
    const dato = now.format('dddd D. MMM');
    this.setState({ time, dato });
  }

  render() {
    return (
      <div style={{ display: 'flex', flex: 1, height: '100%', width: '100%', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }} >
        <div id="tid">{this.state.time}</div>
        <div id="dag">{this.state.dato}</div>
      </div>
    );
  }
}
