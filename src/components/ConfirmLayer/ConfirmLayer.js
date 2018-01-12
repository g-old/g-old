/* @flow */
import React from 'react';
import PropTypes from 'prop-types';
import Layer from '../Layer';
import Box from '..//Box';
// import Footer from 'grommet/components/Footer';
import Header from '../Header2';
import Button from '../Button';

class ConfirmLayer extends React.Component {
  componentWillReceiveProps({ success }) {
    if (success && !this.props.success) {
      this.props.onClose();
    }
  }
  render() {
    const action = this.props.action || 'delete';

    return (
      <Layer onClose={this.props.onClose} closer>
        <Box padding="medium" column align>
          <Header padding="medium">
            <h1>Please confirm</h1>
          </Header>
          <Box tag="footer" justify pad>
            <div>
              <Button
                label={action}
                plain={false}
                disabled={this.props.pending}
                onClick={this.props.onSubmit}
              />{' '}
              <Button
                label="cancel"
                plain={false}
                disabled={this.props.pending}
                onClick={this.props.onClose}
              />
            </div>
          </Box>
        </Box>
      </Layer>
    );
  }
}
export default ConfirmLayer;

ConfirmLayer.propTypes = {
  action: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  pending: PropTypes.bool,
  success: PropTypes.bool,
};

ConfirmLayer.defaultProps = {
  pending: null,
  success: null,
};
