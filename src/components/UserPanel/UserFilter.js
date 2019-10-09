// @flow
import React from 'react';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import Box from '../Box';
import CheckBox from '../CheckBox';
import Label from '../Label';
import Button from '../Button';
import { Groups } from '../../organization';
import { ICONS } from '../../constants';
import Select from '../Select/Select';
import { VerificationTypes } from '../../data/models/constants';

const messages = defineMessages({
  denied: {
    id: 'label.denied',
    defaultMessage: 'Denied',
    description: 'Label denied',
  },
  confirmed: {
    id: 'label.confirmed',
    defaultMessage: 'Confirmed',
    description: 'Label confirmed',
  },
  pending: {
    id: 'label.pending',
    defaultMessage: 'Pending',
    description: 'Label pending',
  },
  unrequested: {
    id: 'label.unrequested',
    defaultMessage: 'Unrequested',
    description: 'Label unrequested',
  },
  submit: {
    id: 'command.submit',
    defaultMessage: 'Submit',
    description: 'Short command for sending data to the server',
  },
});

type Props = {
  values: mixed,
  onSelect: () => void,
  intl: intlShape,
};

class UserFilter extends React.Component<Props> {
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
    const { values, onSelect, intl } = this.props;
    return (
      <Box fill wrap between>
        <Box column>
          <span>
            <Label>Groups</Label>
            {this.renderResetButton('group')}
          </span>
          <Select
            options={Object.keys(Groups).map(group => ({
              value: Groups[group],
              label: group,
            }))}
            onSearch={false}
            value={values.group}
            onChange={e =>
              onSelect({
                type: 'group',
                value: e.value,
              })
            }
          />
          {/* Object.keys(Groups).map(type => (
            <CheckBox
              checked={values.group === Groups[type]}
              label={type}
              onChange={() => onSelect({ type: 'group', value: Groups[type] })}
            />
          )) */}
        </Box>
        <Box column>
          <span>
            <Label>VerificationStatus</Label>
            {this.renderResetButton('verificationStatus')}
          </span>
          <Select
            options={Object.keys(VerificationTypes).map(state => ({
              value: VerificationTypes[state],
              label: intl.formatMessage(messages[VerificationTypes[state]]),
            }))}
            onSearch={false}
            value={values.verificationStatus}
            onChange={e =>
              onSelect({
                type: 'verificationStatus',
                value: e.value,
              })
            }
          />
        </Box>
        <Box column>
          <span>
            <Label>Union</Label>
            {this.renderResetButton('union')}
          </span>
          <CheckBox
            checked={values.union}
            label="As Union"
            onChange={() => onSelect({ type: 'union', value: !values.union })}
          />
        </Box>
      </Box>
    );
  }
}

export default injectIntl(UserFilter);
