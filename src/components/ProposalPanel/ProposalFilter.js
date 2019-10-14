// @flow
import React from 'react';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import Box from '../Box';
import Label from '../Label';
import Button from '../Button';
import { ApprovalStates } from '../../organization';
import { ICONS } from '../../constants';
import Select from '../Select/Select';

const messages = defineMessages({
  active: {
    id: 'resource.active',
    defaultMessage: 'active',
    description: 'Filter for active proposals/surveys/discussions',
  },
  closed: {
    id: 'resource.closed',
    defaultMessage: 'closed',
    description: 'Filter for closed proposals/surveys/discussions',
  },
  accepted: {
    id: 'proposals.accepted',
    defaultMessage: 'accepted',
    description: 'Filter for accepted proposals',
  },
  repelled: {
    id: 'proposals.repelled',
    defaultMessage: 'repelled',
    description: 'Filter for repelled proposals',
  },
  revoked: {
    id: 'proposals.revoked',
    defaultMessage: 'revoked',
    description: 'Filter for revoked proposals',
  },
});

type Props = {
  values: mixed,
  onSelect: () => void,
  intl: intlShape,
  workteams: Array<mixed>,
};

class ProposalFilter extends React.Component<Props> {
  constructor(props) {
    super(props);
    this.handleReset = this.handleReset.bind(this);
  }

  handleReset(field) {
    const { values, onSelect } = this.props;

    onSelect({ type: field, value: values[field] });
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
    const { values, onSelect, intl, workteams } = this.props;
    return (
      <Box fill align wrap between>
        <Box column>
          <span>
            <Label>from workteams</Label>
            {this.renderResetButton('workteam')}
          </span>
          <Select
            options={workteams.map(team => ({
              label: team.displayName,
              value: team.id,
            }))}
            onSearch={false}
            value={values.workteam}
            onChange={e =>
              onSelect({
                type: 'workteam',
                value: e.value,
              })
            }
          />
        </Box>
        <Box column>
          <span>
            <Label>Status</Label>
            {this.renderResetButton('state')}
          </span>
          <Select
            options={['active', 'repelled', 'accepted'].map(state => ({
              value: state,
              label: intl.formatMessage(messages[state]),
            }))}
            onSearch={false}
            value={values.state}
            onChange={e =>
              onSelect({
                type: 'state',
                value: e.value,
              })
            }
          />
        </Box>
        <Box column>
          {/* TODO LATER */}
          {/* <span>
            <Label> with workteam</Label>
            {this.renderResetButton('hasTeamId')}
          </span>
          <CheckBox
            checked={values.hasTeamId}
            label="with workteam"
            onChange={() =>
              onSelect({ type: 'hasTeamId', value: !values.hasTeamId })
            }
          /> */}
        </Box>
        <Box column>
          <span>
            <Label> approvalstates</Label>
            {this.renderResetButton('approvalState')}
          </span>
          <Select
            options={Object.keys(ApprovalStates).map(state => ({
              value: ApprovalStates[state],
              label: state,
            }))}
            onSearch={false}
            value={values.approvalState}
            onChange={e =>
              onSelect({
                type: 'approvalState',
                value: e.value,
              })
            }
          />
        </Box>
      </Box>
    );
  }
}

export default injectIntl(ProposalFilter);
