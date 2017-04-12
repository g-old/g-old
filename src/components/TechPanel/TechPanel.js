import React from 'react';

class TechPanel extends React.Component {
  render() {
    return (
      <div>
        {' '}
        <h1>DATA</h1>
        {' '}
        <ul>
          <li> <h2>Imagestore</h2><ul><li><h3>Size</h3></li><li><h3>Backup</h3></li></ul></li>{' '}
        </ul>
        {' '}
        <h1> PROCESS STATUS </h1>
        {' '}
        <h1> DB STATISTICS </h1>
        {' '}
      </div>
    );
  }
}
export default TechPanel;
