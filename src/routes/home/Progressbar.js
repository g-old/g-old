/* eslint-disable jsx-a11y/click-events-have-key-events */
import React from 'react';
import withStyles from 'isomorphic-style-loader/withStyles';
import cn from 'classnames';
import { WizardContext } from '../../components/Wizard/wizard-context';
import s from './Progressbar.css';
import { ICONS } from '../../constants';

const icons = [
  <svg viewBox="0 0 24 24" width="16px" height="16px" role="img">
    <path fill="none" stroke="#fff" strokeWidth="2" d={ICONS.document} />
  </svg>,
  <svg viewBox="0 0 24 24" width="16px" height="16px" role="img">
    <path fill="none" stroke="#fff" strokeWidth="2" d={ICONS.group} />
  </svg>,
  <svg version="1.1" viewBox="0 0 24 24" width="16px" height="16px" role="img">
    <path fill="none" stroke="#fff" strokeWidth="2" d={ICONS.thumbUpAlt} />
  </svg>,
  <svg width="16px" height="16px" aria-label="StatusGood" viewBox="0 0 24 24">
    <path
      fill="none"
      stroke="#fff"
      strokeWidth="2"
      d="M12,22 C17.5228475,22 22,17.5228475 22,12 C22,6.4771525 17.5228475,2 12,2 C6.4771525,2 2,6.4771525 2,12 C2,17.5228475 6.4771525,22 12,22 Z M7,12 L11,15 L16,8"
    />
  </svg>,
];

const Progressbar = () => (
  <WizardContext.Consumer>
    {({ step, steps, push }) => (
      <div className={s.progressbar}>
        {icons.map((icon, index) => (
          // eslint-disable-next-line jsx-a11y/no-static-element-interactions
          <div
            className={cn(s.step, step.id === `${index}i` && s.active)}
            onClick={() => push(`${index}i`)}
          >
            <div
              className={cn(
                s.index,
                steps.indexOf(step) > index - 1 && s.accomplished,
              )}
            >
              {icon}
            </div>
          </div>
        ))}

        <div
          style={{
            width: `${
              steps.indexOf(step) === 0
                ? 0
                : (steps.indexOf(step) / (steps.length - 1)) * 100
            }%`,
          }}
          className={s.progression}
        />
      </div>
    )}
  </WizardContext.Consumer>
);

export default withStyles(s)(Progressbar);
