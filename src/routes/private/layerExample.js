import React from 'react';
import PropTypes from 'prop-types';
import Button from '../../components/Button/Button';
import Layer from '../../components/Layer/Layer';
import Box from '../../components/Box/Box';

class LayerExample extends React.Component {
  constructor() {
    super();
    this.state = { openA: false, openB: false, openFill: false };
  }

  render() {
    const { children } = this.props;
    const { openA, openB, openFill } = this.state;
    return (
      <Box>
        <Button onClick={() => this.setState({ openA: true })}>
          openA Layer
        </Button>
        {openA && (
          <Layer onClose={() => this.setState({ openA: false })}>
            {children}
          </Layer>
        )}
        <Button onClick={() => this.setState({ openB: true })}>
          openB Layer
        </Button>
        {openB && (
          <Layer hidden onClose={() => this.setState({ openB: false })}>
            <Box align>
              {children}
              {children}
            </Box>
          </Layer>
        )}
        <Button onClick={() => this.setState({ openFill: true })}>
          openFill Layer
        </Button>
        {openFill && (
          <Layer fill onClose={() => this.setState({ openFill: false })}>
            {children}
          </Layer>
        )}
      </Box>
    );
  }
}

LayerExample.propTypes = { children: PropTypes.element.isRequired };

export default LayerExample;
