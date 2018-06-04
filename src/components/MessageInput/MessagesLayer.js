import React from 'react';
import PropTypes from 'prop-types';
import Layer from '../Layer';
import Button from '../Button';

class MessagesLayer extends React.Component {
  static propTypes = {
    onClose: PropTypes.func.isRequired,
    onSelection: PropTypes.func.isRequired,
  };
  render() {
    const notes = [
      {
        createdAt: new Date(),
        published: false,
        textHtml: { de: 'Hallo', it: 'Ciao' },
      },
    ];
    return (
      <Layer onClose={this.props.onClose}>
        {notes.map(n => (
          <p>
            {n.textHtml.de}{' '}
            <Button
              label="Take me"
              onClick={e => {
                e.stopPropagation();
                e.preventDefault();
                this.props.onSelection(n);
              }}
            />{' '}
          </p>
        ))}
      </Layer>
    );
  }
}

export default MessagesLayer;
