/* @flow */

import React from 'react';
import withStyles from 'isomorphic-style-loader/withStyles';
import { FormattedMessage, defineMessages } from 'react-intl';
import cn from 'classnames';
import { connect } from 'react-redux';
import Login from '../../components/Login';
import s from './Home.css';
import history from '../../history';
import {
  getVisibleProposals,
  getResourcePageInfo,
  getLayoutSize,
} from '../../reducers';
import { genProposalPageKey } from '../../reducers/pageInfo';
import ListView from '../../components/ListView';
import ProposalPreview from '../../components/ProposalPreview';
import { sortActiveProposals, sortClosedProposals } from '../utils';
import Box from '../../components/Box';
import Heading from '../../components/Heading';
import Label from '../../components/Label';
import Button from '../../components/Button';

const messages = defineMessages({
  signup: {
    id: 'label.signup',
    defaultMessage: 'Sign Up',
    description: 'Label signup',
  },
  or: {
    id: 'label.or',
    defaultMessage: 'OR',
    description: 'Label or',
  },
});

type Props = {
  proposals: Array<ProposalShape>,
  pageInfo: PageInfoShape,
  small: boolean,
};

class Home extends React.Component<Props> {
  render() {
    const { proposals, pageInfo, small } = this.props;
    return (
      <div>
        <div className={cn(s.root, small && s.small)}>
          <Box column>
            <div className={s.formGroup}>
              <Button
                fill
                className={s.signup}
                label={<FormattedMessage {...messages.signup} />}
                onClick={() => {
                  history.push('/signup');
                }}
              />
            </div>
            <span className={s.or}>
              <FormattedMessage {...messages.or} />
            </span>

            {/* <strong className={s.lineThrough}>
                <FormattedMessage {...messages.or} />
              {/*</strong> */}

            <Login />
          </Box>
        </div>
        {/* Hero  - imgurl: https://unsplash.com/photos/IBWJsMObnnU */}
        <Box column justify align className={s.hero}>
          <div>
            <Heading tag="h1">Stimme ab!</Heading>
            <Label>
              Hier kannst du mit einer Stimme sehr viel bewirken. Denn sie
              zählt, und das ist gut so!
            </Label>
          </div>
          {/*          LIST OF PROPOSALS https://codepen.io/TSUmari/pen/WmXGgo
           */}{' '}
        </Box>
        <Box column align className={s.proposals}>
          <Heading tag="h1">Vorschläge</Heading>
        </Box>
        <ListView
          onRetry={this.handleOnRetry}
          onLoadMore={this.handleLoadMore}
          pageInfo={pageInfo}
        >
          {proposals.map(
            proposal =>
              proposal && (
                <ProposalPreview
                  proposal={{
                    ...proposal,
                    image: proposal.image && `/s460/${proposal.image}`,
                  }}
                  onClick={this.onProposalClick}
                />
              ),
          )}
        </ListView>
        <Box align column>
          <Heading tag="h2">Diskussionen</Heading>
        </Box>
        {/* proposals.map(prop => (
          <div className={s.card}>
            <div
              className={s.bg}
              style={{
                backgroundImage:
                  prop.image &&
                  `url(/s720/${prop.image})` /*`url(https://i.gyazo.com/a846fc87cca5ebd3942ae1e038bb5083.png)`
              }}
            >
              {' '}
           {/* </div>
            <div className={s.avatar}>
              <img src="https://store.playstation.com/store/api/chihiro/00_09_000/container/GB/en/999/EP4312-CUSA07658_00-AV00000000000049/1536930670000/image?w=240&amp;h=240&amp;bg_color=000000&amp;opacity=100&amp;_version=00_09_000" />
            </div>*}
            <div class="pxc-stopper"> </div>
            <div className={s.subCard}>
              <div className={s.title}>{prop.title}</div>
              <div class="pxc-sub">{prop.summary}</div>
              <div class="pxc-feats"></div>
              <div class="pxc-tags"></div>
              <div class="bottom-row">
                <div class="pxc-info">
                  <div class="region">Global</div>
                </div>
              </div>
            </div>
          </div>
          )) */}
      </div>
    );
  }
}

const mapStateToProps = (state, { filter = '' }) => ({
  proposals: getVisibleProposals(state, 'active')
    .filter(p => !p.workTeamId)
    .sort(filter === 'active' ? sortActiveProposals : sortClosedProposals),
  pageInfo: getResourcePageInfo(
    state,
    'proposals',
    genProposalPageKey({ state: filter }),
  ),
  small: getLayoutSize(state),
});

export default connect(mapStateToProps)(withStyles(s)(Home));
