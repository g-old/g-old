/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-present Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import React from 'react';
import { FormattedMessage, defineMessages } from 'react-intl';
import GroupLayout from '../../containers/GroupLayout';
import ProposalForm from '../../components/ProposalInput';
import { getSessionUser } from '../../reducers';
import { canAccess } from '../../organization';
import { loadGroup } from '../../actions/group';

const title = 'Admin';
const messages = defineMessages({
  proposalInput: {
    id: 'proposalInput',
    defaultMessage: 'Create a new proposal',
    description: 'Creating new proposal',
  },
  proposalManager: {
    id: 'proposalManager',
    defaultMessage: 'Manage proposals',
    description: 'Manage proposals',
  },
  phaseOnePoll: {
    id: 'proposalManager.phaseOnePoll',
    defaultMessage: 'TR: 25 - PHASE ONE - NO STATEMENTS',
    description: 'PhaseOnePoll presets',
  },
  phaseTwoPoll: {
    id: 'proposalManager.phaseTwoPoll',
    defaultMessage: 'TR: 50 - PHASE TWO - WITH STATEMENTS',
    description: 'PhaseTwoPoll presets',
  },
  survey: {
    id: 'proposalManager.survey',
    defaultMessage: 'Survey',
    description: 'Survey presets',
  },
  tags: {
    id: 'tags',
    defaultMessage: 'Tags',
    description: 'Tags',
  },
});

const defaultPollValues = {
  1: {
    withStatements: true,
    unipolar: true,
    threshold: 25,
    secret: false,
    thresholdRef: 'all',
  },
  2: {
    withStatements: true,
    unipolar: false,
    threshold: 50,
    secret: false,
    thresholdRef: 'voters',
  },
  3: {
    withStatements: false,
    unipolar: false,
    threshold: 100,
    secret: false,
    thresholdRef: 'voters',
  },
};

const pollOptions = [
  {
    value: '1',
    label: <FormattedMessage {...messages.phaseOnePoll} />,
    mId: messages.phaseOnePoll.id,
  },
  {
    value: '2',
    label: <FormattedMessage {...messages.phaseTwoPoll} />,
    mId: messages.phaseTwoPoll.id,
  },
  {
    value: '3',
    label: <FormattedMessage {...messages.survey} />,
    mId: messages.survey.id,
  },
];

async function action({ store }, { id }) {
  const state = await store.getState();
  const user = getSessionUser(state);

  if (user) {
    if (!canAccess(user, title)) {
      return { redirect: '/admin' };
    }
  }
  await store.dispatch(loadGroup({ id }, true));
  const links = [{ to: 'groups/add', name: 'ADD NEW GROUP' }];
  return {
    chunks: ['admin'],
    title,
    component: (
      <GroupLayout id={id} menuLinks={links}>
        <ProposalForm
          groupId={id}
          maxTags={8}
          pollOptions={pollOptions}
          defaultPollValues={defaultPollValues}
        />
      </GroupLayout>
    ),
  };
}

export default action;
