/* @flow */
import React from 'react';
import PropTypes from 'prop-types';
import Layer from '../Layer';
import Box from '..//Box';
// import Footer from 'grommet/components/Footer';
import Form from '../Form';
import Header from '../Header';
import Heading from '../Heading';
import Button from '../Button';

export default function ConfirmLayer(props) {
  const action = props.action || 'Löschen';
  return (
    <Layer onClose={props.onClose}>
      <Form>
        <Header pad="medium" direction="column">
          <Heading tag="h2" margin="none">
            Bitte bestätigen
          </Heading>
        </Header>
        <Box pad="medium">
          <Heading tag="h4" align="center">
            Sind Sie sicher, dass sie das löschen wollen?
          </Heading>
          <Box align="center" justify="center">
            {props.note}
          </Box>
        </Box>
        <Box tag="footer" justify padding="medium">
          <div>
            <Button label={action} onClick={props.onSubmit} />{' '}
            <Button label="Abbrechen" primary onClick={props.onClose} />
          </div>
        </Box>
      </Form>
    </Layer>
  );
}

ConfirmLayer.propTypes = {
  action: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  note: PropTypes.string,
};

ConfirmLayer.defaultProps = {
  name: null,
  note: null,
};
