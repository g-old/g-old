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
const routeToRegistration = () => {
  history.push(PATH_TO_REGISTER);
};
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
            <h2 style={{ textAlign: 'center' }}>{data.hero.title}</h2>
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
              <Button onClick={routeToRegistration} accent>
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
            <h2 style={{ textAlign: 'center' }}>{data.motivation.title}</h2>
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
          {/* <h1
            style={{ color: '#fff', textAlign: 'center', marginBottom: '2em' }}
          >
            {data.vision.title}
          </h1> */}
          <Box column className={s.motivation} pad align justify>
            <h2 style={{ textAlign: 'center', color: '#fff' }}>
              {data.vision.title}
            </h2>
            <div className={s.divider} />
            <p style={{ color: '#fff' }} className={s.explanation}>
              Mit der Unterstützung der Initiative für mehr Demokratie hast du
              einen Partner im Rücken, auf dessen Fachwissen du zählen kannst.
              Sei es bei der Überprüfung der rechtlichen Voraussetzungen oder
              der Ausarbeitung des Textes – du bist nicht alleine.
            </p>
          </Box>
          <Box between column={small} pad={!small} align>
            <Box column align>
              <InfoCard
                image={data.vision.card.image}
                title={data.vision.card.title}
                content={data.vision.card.text}
              />
              <Button primary>
                <a
                  style={{ color: '#fff' }}
                  rel="noopener noreferrer"
                  target="_blank"
                  href="https://dirdemdi.org"
                >
                  Mehr Info
                </a>
              </Button>
            </Box>
            <svg
              aria-label="Add"
              viewBox="0 0 24 24"
              width="32px"
              height="32px"
            >
              <path
                fill="none"
                stroke="#fff"
                strokeWidth="2"
                d="M12,22 L12,2 M2,12 L22,12"
              />
            </svg>
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
        <Box
          align
          justify
          column={small}
          className={cn(s.dynContent, s.fixGap)}
        >
          <div style={{ padding: '1em', flexBasis: '50%' }}>
            <h2>Die Volksinitiative</h2>
            <p>
              Mit der Volksinitiative kann über einen Vorschlag aus der
              Bevölkerung heraus abgestimmt werden, der eine Materie neu regelt,
              eine bestehende Regelung abändert oder aufhebt.
            </p>
          </div>
          <div style={{ padding: '1em', flexBasis: '50%' }}>
            <h2>Das Referendum</h2>
            <p>
              Bevor ein Gesetz oder ein Beschluss rechtskräftig und anwendbar
              wird, sollen alle stimmberechtigten Bürgerinnen und Bürger in
              einer bindenden Volksabstimmung entscheiden können, ob das
              Beschlossene in Kraft treten soll oder nicht. Die demokratische
              Maxime dahinter ist: Es soll nichts gelten, das nicht von einer
              Mehrheit in der Bevölkerung gewollt wird
            </p>
          </div>
        </Box>
        <Box column justify align>
          <h1>Was kann ich tun?</h1>
          <Box wrap between align justify>
            <div>
              <div className={s.action}>
                <Button
                  plain
                  icon={
                    <svg
                      viewBox="0 0 24 24"
                      width="24px"
                      height="24px"
                      role="img"
                    >
                      <path
                        fill="none"
                        stroke="#666"
                        strokeWidth="2"
                        d={ICONS.document}
                      />
                    </svg>
                  }
                >
                  <span> Einen Vorschlag einstellen</span>
                </Button>
              </div>
              <div className={s.action}>
                <Button
                  plain
                  icon={
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
                  }
                >
                  <span> Abstimmen</span>
                </Button>
              </div>
              <div className={s.action}>
                <Button
                  plain
                  icon={
                    <svg width="24px" height="24px" viewBox="0 0 24 24">
                      <path
                        fill="none"
                        stroke="#666"
                        strokeWidth="2"
                        d="M9,7 L9,1 L23,1 L23,11 L20,11 L20,16 L15,12 M1,7 L15,7 L15,18 L9,18 L4,22 L4,18 L1,18 L1,7 Z"
                      />
                    </svg>
                  }
                >
                  <span> Kommentieren</span>
                </Button>
              </div>
            </div>
            <div>
              <div className={s.action}>
                <Button
                  plain
                  icon={
                    <svg
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
                  }
                >
                  <span> Arbeitsgruppen beitreten</span>
                </Button>
              </div>
              <div className={s.action}>
                <Button
                  plain
                  label=" Den Diskussionstext verändern"
                  icon={
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
                        d={ICONS.editBig}
                      />
                    </svg>
                  }
                />
              </div>
              <div className={s.action}>
                <Button
                  plain
                  icon={
                    <svg
                      aria-label="Star"
                      viewBox="0 0 24 24"
                      width="24px"
                      height="24px"
                    >
                      <polygon
                        fill="#FFC95E"
                        fillRule="evenodd"
                        points="12 16.667 5 22 8 14 2 9.5 9.5 9.5 12 2 14.5 9.5 22 9.5 16 14 19 22"
                      />
                    </svg>
                  }
                >
                  <span> Anerkennung erhalten</span>
                </Button>
              </div>
            </div>
          </Box>
          <Button onClick={routeToRegistration} primary>
            Registrieren
          </Button>
        </Box>

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
