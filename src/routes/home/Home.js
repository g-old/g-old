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
import Progressbar from './Progressbar';

type Props = {
  proposals: Array<ProposalShape>,
  small: boolean,
  data: {
    header: { title: string },
    actions: [string],
    hero: { title: string, explanation: string },
    featureCards: [{ text: string, call: string }],
    motivation: { title: string, text: string },
    steps: { cards: [{ title: string, text: string }] },
    vision: {
      title: string,
      card: { title: string, text: string, image: string },
    },
  },
};

const PATH_TO_REGISTER = '/signup';
class Home extends React.Component<Props> {
  constructor() {
    super();
    this.visionRef = React.createRef();
    this.scrollToLogin = this.scrollToLogin.bind(this);
    this.scrollToVision = this.scrollToVision.bind(this);
  }

  scrollToLogin() {
    const loginHandler = this.loginRef;
    if (loginHandler) {
      loginHandler.scrollIntoView({
        block: 'center',
        behavior: 'smooth',
      });
    }
  }

  scrollToVision() {
    const visionHandler = this.visionRef.current;
    visionHandler.scrollIntoView({
      block: 'center',
      behavior: 'smooth',
    });
    // scrollToRef(this.visionRef);
  }

  render() {
    const { proposals, small, data } = this.props;

    // const testAddText = '';
    return (
      <Box column>
        {small && (
          // eslint-disable-next-line no-return-assign
          <VIPMask small={small} onRef={ref => (this.loginRef = ref)} />
        )}
        <Header data={data.header} small={small} />
        <Box className={s.motivation} pad align justify>
          <Box column align>
            <h3 style={{ textAlign: 'center' }}>{data.hero.title}</h3>
            <div className={s.divider} />
            <p className={s.explanation}>{data.hero.explanation}</p>
          </Box>
          {!small && (
            // eslint-disable-next-line no-return-assign
            <VIPMask onRef={ref => (this.loginRef = ref)} small={small} />
          )}
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
              <Button onClick={this.scrollToLogin} primary>
                {data.featureCards[1].call}
              </Button>
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
              <p>{data.featureCards[2].text}</p>
              <Button onClick={this.scrollToVision} accent>
                {data.featureCards[2].call}
              </Button>
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
        <Box column className={s.dictionary}>
          <h1
            style={{ color: '#fff', textAlign: 'center', marginBottom: '2em' }}
          >
            {data.vision.title}
          </h1>
          <Box between column={small} pad={!small} align>
            <InfoCard
              image={data.vision.card.image}
              title={data.vision.card.title}
              content={data.vision.card.text}
            />
            {data.steps.cards && (
              <Box className={s.stepCard} align column>
                <h2 ref={this.visionRef}>In vier Schritten zur Veränderung</h2>
                <Wizard basename="/">
                  {({ steps, step, next, push, previous }) => {
                    return (
                      <Box column align>
                        <Progressbar />
                        <Steps>
                          {data.steps.cards.map((card, index) => {
                            return (
                              <Step id={`${index}i`}>
                                <Button
                                  plain
                                  onClick={() => {
                                    if (
                                      steps.indexOf(step) <
                                      steps.length - 1
                                    ) {
                                      next();
                                    } else {
                                      push(steps[0].id);
                                    }
                                  }}
                                  className={s.featureCard}
                                >
                                  <h3>{card.title}</h3>
                                  <p>{card.text}</p>
                                </Button>
                              </Step>
                            );
                          })}
                        </Steps>
                        <Box>
                          <Button
                            onClick={() => {
                              if (steps.indexOf(step) > 0) {
                                previous();
                              }
                            }}
                            plain
                            icon={
                              <svg
                                width="32px"
                                height="32px"
                                aria-label="LinkPrevious"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  fill="none"
                                  stroke="#666"
                                  strokeWidth="2"
                                  d={ICONS.leftArrow}
                                  transform="matrix(-1 0 0 1 24 0)"
                                />
                              </svg>
                            }
                          />

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
                        </Box>
                      </Box>
                    );
                  }}
                </Wizard>
              </Box>
            )}
          </Box>
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
