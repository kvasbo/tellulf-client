import React from 'react';
import { getTimeString } from './HendelseMedTid';
import { Event } from '../types/calendar';

const style = {
  backgroundColor: '#222222',
  margin: 5,
  padding: 5,
  paddingLeft: 10,
  borderRadius: '0.5vw',
};

interface Props {
  data: Event;
}

class HendelseFullDag extends React.PureComponent<Props, {}> {
  public render() {
    return (
      <div style={style}>
        <div>{this.props.data.name}</div>
        {!this.props.data.oneDay && <div>{getTimeString(this.props.data)}</div>}
      </div>
    );
  }
}

export default HendelseFullDag;
