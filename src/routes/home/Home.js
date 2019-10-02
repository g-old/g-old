/* @flow */

import React from 'react';
import withStyles from 'isomorphic-style-loader/withStyles';
import { FormattedMessage, defineMessages } from 'react-intl';
import cn from 'classnames';
import { connect } from 'react-redux';
import s from './Home.css';
import {
  getVisibleProposals,
  getResourcePageInfo,
  getLayoutSize,
} from '../../reducers';
import { genProposalPageKey } from '../../reducers/pageInfo';
import ProposalPreview from '../../components/ProposalPreview';
import { sortActiveProposals, sortClosedProposals } from '../utils';
import Box from '../../components/Box';
import Heading from '../../components/Heading';
import Label from '../../components/Label';
import VIPMask from './VIPMask';
import Header from './Header';
import InfoCard from './InfoCard';

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
      <Box column>
        {small && <VIPMask small={small} />}

        <Header small={small} />

        {/* Hero  - imgurl: https://unsplash.com/photos/IBWJsMObnnU */}
        <Box>
          <Box column justify align className={s.hero}>
            <div>
              <Heading tag="h1">Stimme ab!</Heading>
              <Label>
                Hast du eine Idee, wie unser tägliches Zusammenleben verbessert
                werden kann? Bring einen Vorschlag ein oder unterstütze mit
                deiner Stimme und Mitwirkung die Idee anderer.
              </Label>
            </div>
            {/*          LIST OF PROPOSALS https://codepen.io/TSUmari/pen/WmXGgo
             */}{' '}
          </Box>
          {!small && <VIPMask small={small} />}
          {/* Card Box */}
        </Box>
        <Box className={small && s.bigCards} fill wrap align between>
          {proposals && proposals.length && (
            <div className={s.cardBlack}>
              <Box column align className={s.proposals}>
                <Heading tag="h1">Vorschläge</Heading>
              </Box>

              <Box column>
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
              </Box>
            </div>
          )}
          <div className={s.card}>
            <InfoCard
              image="/stop_sign_stp.jpeg"
              title="Vetorecht"
              content={` Bisher wurde hier bei uns, trotz Demokratie und wie in den meisten
            "demokratischen" Ländern, über das Volk geherrscht. Ab jetzt muss
            mit dem Volk regiert werden, so wie es sich für eine echte
            Demokratie gehört. Mit dieser Woche ist das neue Gesetz zur Direkten
            Demokratie in Kraft!`}
            />
          </div>
          <div className={s.card}>
            <InfoCard
              title="Referendum"
              content={`Alle vom Landtag nicht mit Zweidrittelmehrheit verabschiedeten Gesetze können vor
ihrem Inkrafttreten dem Referendum unterworfen werden, wenn das innerhalb von 20
Tagen nach Verabschiedung von 300 Promotoren verlangt wird.`}
            />
          </div>
        </Box>
      </Box>
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
