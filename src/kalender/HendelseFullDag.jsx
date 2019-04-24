import React from 'react';
import { getTimeString } from './HendelseMedTid';

const style = {
  backgroundColor: '#222222', margin: 5, padding: 5, paddingLeft: 10, borderRadius: '0.5vw',
};

class HendelseFullDag extends React.PureComponent {
  render() {
    return (
      <div style={style}>
        <div>{this.props.data.name}</div>
        {!this.props.data.oneDay && <div>{getTimeString(this.props.data)}</div>}
      </div>
    );
  }
}

export default HendelseFullDag;