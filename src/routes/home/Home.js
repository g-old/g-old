/* @flow */

import React from 'react';
import withStyles from 'isomorphic-style-loader/withStyles';
import cn from 'classnames';
import { connect } from 'react-redux';
import s from './Home.css';
import { ICONS } from '../../constants';
import {
  getVisibleProposals,
  getResourcePageInfo,
  getLayoutSize,
} from '../../reducers';
import { genProposalPageKey } from '../../reducers/pageInfo';
import { sortActiveProposals, sortClosedProposals } from '../utils';
import Box from '../../components/Box';
import VIPMask from './VIPMask';
import Header from './Header';
import InfoCard from './InfoCard';
import Button from '../../components/Button';
import Wizard from '../../components/Wizard';
import Steps from '../../components/Steps';
import Step from '../../components/Steps/Step';
import StepPage from '../../components/StepPage';
import history from '../../history';

type Props = {
  proposals: Array<ProposalShape>,
  small: boolean,
  data: {
    header: { title: string },
    actions: [string],
    hero: { title: string, explanation: string },
    featureCards: [{ text: string, call: string }],
    motivation: { title: string, text: string },
  },
};

const PATH_TO_REGISTER = '/signup';

class Home extends React.Component<Props> {
  render() {
    const { proposals, small, data } = this.props;
    // const testAddText = '';
    return (
      <Box column>
        {small && <VIPMask small={small} />}

        <Header data={data.header} small={small} />
        <Box className={s.motivation} pad align justify>
          <Box column align>
            <h3 style={{ textAlign: 'center' }}>{data.hero.title}</h3>
            <div className={s.divider} />
            <p className={s.explanation}>{data.hero.explanation}</p>
          </Box>
          {!small && <VIPMask small={small} />}
        </Box>
        {/* Benefits */}
        <Box justify>
          <Box column={small} pad>
            <div className={cn(s.featureCard, s.lower)}>
              <svg
                version="1.1"
                viewBox="0 0 24 24"
                width="24px"
                height="24px"
                role="img"
              >
                <path
                  fill="none"
                  stroke="#666"
                  strokeWidth="2"
                  d={ICONS.edit}
                />
              </svg>
              <p>{data.featureCards[0].text}</p>
              <Button onClick={() => history.push(PATH_TO_REGISTER)} accent>
                {data.featureCards[0].call}
              </Button>
            </div>
            <div className={cn(s.featureCard, small && s.lower)}>
              <svg
                version="1.1"
                viewBox="0 0 24 24"
                width="24px"
                height="24px"
                role="img"
              >
                <path
                  fill="none"
                  stroke="#666"
                  strokeWidth="2"
                  d={ICONS.group}
                />
              </svg>
              <p>{data.featureCards[1].text}</p>
              <Button primary>{data.featureCards[1].call}</Button>
            </div>
            <div className={cn(s.featureCard, s.lower)}>
              <svg
                version="1.1"
                viewBox="0 0 24 24"
                width="24px"
                height="24px"
                role="img"
              >
                <path
                  fill="none"
                  stroke="#666"
                  strokeWidth="2"
                  d={ICONS.thumbUpAlt}
                />
              </svg>
              <p>
                <p>{data.featureCards[2].text}</p>
              </p>
              <Button accent>Melde dich an</Button>
            </div>
          </Box>
        </Box>
        {/* Hero  - imgurl: https://unsplash.com/photos/IBWJsMObnnU */}
        <Box align justify column={small} className={s.dynContent}>
          <Box column className={s.motivation} pad align justify>
            <h3 style={{ textAlign: 'center' }}>{data.motivation.title}</h3>
            <div className={s.divider} />
            <p className={s.explanation}>{data.motivation.text}</p>
          </Box>

          {proposals && proposals.length > 0 && (
            <Wizard basename="">
              {({ steps, step, next, push }) => {
                return (
                  <StepPage>
                    <Steps>
                      {proposals.map(
                        proposal =>
                          proposal && (
                            <Step id={proposal.id}>
                              <InfoCard
                                onClick={() => {
                                  if (steps.indexOf(step) < steps.length - 1) {
                                    next();
                                  } else {
                                    push(steps[0].id);
                                  }
                                }}
                                title={proposal.title}
                                poll={proposal.pollTwo}
                                content={proposal.summary}
                                image={
                                  proposal.image && `/s460/${proposal.image}`
                                }
                              />
                            </Step>
                          ),
                      )}
                    </Steps>
                    {proposals.length > 1 && (
                      <Button
                        plain
                        icon={
                          <svg
                            version="1.1"
                            viewBox="0 0 24 24"
                            width="32px"
                            height="32px"
                            role="img"
                          >
                            <path
                              fill="none"
                              stroke="#666"
                              strokeWidth="2"
                              d={ICONS.leftArrow}
                            />
                          </svg>
                        }
                        onClick={() => {
                          if (steps.indexOf(step) < steps.length - 1) {
                            next();
                          } else {
                            push(steps[0].id);
                          }
                        }}
                      />
                    )}
                  </StepPage>
                );
              }}
            </Wizard>
          )}

          {/* Card Box */}
        </Box>
        <Box className={s.dictionary}> </Box>

        <Box className={small && s.bigCards} fill wrap align between>
          {/* data.content.boxes.map(box => (
            <div className={s.card}>
              <InfoCard
                image={box.image}
                title={box.title}
                content={box.text}
              />
            </div>
          ))}
          {/*         <div className={s.card}>
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
            </div> */}
        </Box>
      </Box>
    );
  }
}

const mapStateToProps = (state, { filter = '' }) => ({
  proposals: getVisibleProposals(state, 'active')
    .filter(p => !p.workteamId)
    .sort(filter === 'active' ? sortActiveProposals : sortClosedProposals),
  pageInfo: getResourcePageInfo(
    state,
    'proposals',
    genProposalPageKey({ state: filter }),
  ),
  small: getLayoutSize(state),
});

export default connect(mapStateToProps)(withStyles(s)(Home));
