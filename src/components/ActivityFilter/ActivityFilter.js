import React from 'react';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/withStyles';
import s from './ActivityFilter.css';
import Box from '../Box';
import CheckBox from '../CheckBox';
import Label from '../Label';
import SearchField from '../SearchField';
import Button from '../Button';
import FormField from '../FormField';

import { ICONS } from '../../constants';

class ActivityFilter extends React.Component {
  static propTypes = {
    values: PropTypes.shape({}).isRequired,
    onSelect: PropTypes.func.isRequired,
    fetchUser: PropTypes.func.isRequired,
    userData: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  };

  static defaultProps = {};

  constructor(props) {
    super(props);
    this.handleReset = this.handleReset.bind(this);
  }

  handleReset(field) {
    const { values, onSelect } = this.props;

    onSelect({ type: field, value: values[field] });
    if (field === 'actorId') {
      this.searchFieldUsers.reset();
    } else if (field === 'objectId' || field === 'USER') {
      this.searchFieldObjects.reset();
    }
  }

  renderResetButton(field) {
    let btn;
    const { values } = this.props;
    if (values[field]) {
      btn = (
        <Button
          plain
          onClick={() => this.handleReset(field)}
          icon={
            <svg
              version="1.1"
              viewBox="0 0 24 24"
              width="24px"
              height="24px"
              role="img"
              aria-label="close"
            >
              <path
                fill="none"
                stroke="#000"
                strokeWidth="2"
                d={ICONS.delete}
              />
            </svg>
          }
        />
      );
    }
    return btn;
  }

  render() {
    const { fetchUser, userData, values, onSelect } = this.props;
    return (
      <Box wrap>
        <Box className={s.container} column>
          <span>
            <Label>Resource</Label>
            {this.renderResetButton('type')}
          </span>
          {[
            'USER',
            'COMMENT',
            'MESSAGE',
            'PROPOSAL',
            'LIKE',
            'VOTE',
            'REQUEST',
            'STATEMENT',
            'DISCUSSION',
          ].map(type => (
            <CheckBox
              checked={values.type === type}
              label={type}
              onChange={() => onSelect({ type: 'type', value: type })}
            />
          ))}
        </Box>
        <Box column className={s.container}>
          <span>
            <Label>Action</Label>
            {this.renderResetButton('verb')}
          </span>
          {['CREATE', 'UPDATE', 'DELETE'].map(verb => (
            <CheckBox
              checked={values.verb === verb}
              label={verb.toUpperCase()}
              onChange={() => onSelect({ type: 'verb', value: verb })}
            />
          ))}
        </Box>
        <Box column className={s.container}>
          <span>
            <Label>Actor</Label>
            {this.renderResetButton('actorId')}
          </span>
          <FormField overflow label="Username">
            <SearchField // eslint-disable-next-line no-return-assign
              onRef={elm => (this.searchFieldUsers = elm)}
              data={userData}
              fetch={fetchUser}
              displaySelected={data =>
                onSelect({ type: 'actorId', value: data.id })
              }
            />
          </FormField>
          {values.type === 'USER' && (
            <Box column>
              <span>
                <Label>Object</Label>
                {this.renderResetButton('objectId')}
              </span>
              <FormField overflow label="Username">
                <SearchField // eslint-disable-next-line no-return-assign
                  onRef={elm => (this.searchFieldObjects = elm)}
                  data={userData}
                  fetch={fetchUser}
                  displaySelected={data =>
                    onSelect({ type: 'objectId', value: data.id })
                  }
                />
              </FormField>
            </Box>
          )}
        </Box>
      </Box>
    );
  }
}

export default withStyles(s)(ActivityFilter);
