/* @flow */
import React from 'react';
import withStyles from 'isomorphic-style-loader/withStyles';
import { Spring, animated } from 'react-spring';
import s from './VoteBar.css';

/* taken from https://github.com/grommet/grommet/blob/master/src/js/utils/graphics.js */
const POST_DECIMAL_DIGITS = 10;
const polarToCartesian = (centerX, centerY, radius, angleInDegrees) => {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
};
const arcCommands = (centerX, centerY, radius, startAngle, endAngle) => {
  // handle that we can't draw a complete circle
  let normalizedEndAngle = endAngle;
  if (endAngle - startAngle >= 360) {
    normalizedEndAngle = startAngle + 359.99;
  }
  const start = polarToCartesian(centerX, centerY, radius, normalizedEndAngle);
  const end = polarToCartesian(centerX, centerY, radius, startAngle);
  const arcSweep = normalizedEndAngle - startAngle <= 180 ? '0' : '1';
  const d = [
    'M',
    start.x.toFixed(POST_DECIMAL_DIGITS),
    start.y.toFixed(POST_DECIMAL_DIGITS),
    'A',
    radius.toFixed(POST_DECIMAL_DIGITS),
    radius.toFixed(POST_DECIMAL_DIGITS),
    0,
    arcSweep,
    0,
    end.x.toFixed(POST_DECIMAL_DIGITS),
    end.y.toFixed(POST_DECIMAL_DIGITS),
  ].join(' ');
  return d;
};

type Props = {
  upvotes: number,
  downvotes?: number,
  threshold: number,
  votersCount: number,
  unipolar: boolean,
  upColor: string,
  downColor: string,
  onUpClick: () => void,
  onDownClick: () => void,
  upstrokeWidth: number,
  downstrokeWidth: number,
};

class VoteBar extends React.Component<Props> {
  static defaultProps = {
    downvotes: 0,
  };

  constructor(props) {
    super(props);
    this.computeUp = this.computeUp.bind(this);
  }

  computeUp() {
    let result = 0;
    const { unipolar, votersCount, upvotes, downvotes = 0 } = this.props;
    const sum = unipolar ? votersCount : upvotes + downvotes;
    result = sum > 0 ? 100 - 100 * (upvotes / sum) : 50;
    if (!unipolar && !result) {
      result = (100 * downvotes) / sum;
    }
    return result;
  }

  render() {
    const {
      threshold,
      upColor,
      downColor,
      onUpClick,
      onDownClick,
      upstrokeWidth,
      downstrokeWidth,
    } = this.props;
    const upDegrees = this.computeUp() * 3.6;
    return (
      <div className={s.root}>
        <svg width="80px" height="80px" viewBox="0 0 40 40">
          <g stroke="#aaa" strokeWidth="4" fill="none">
            {/* <circle strokeWidth="2" stroke={downColor} cx="20" cy="20" r="16" />
            <path
              strokeWidth="8"
              stroke="#340000"
              strokeLinecap="butt"
              d={arcCommands(20, 20, 16, 0, upDegrees)}
            /> */}

            <Spring from={{ t: 0 }} to={{ t: upDegrees }} native update>
              {({ t }) => (
                <g>
                  <animated.path
                    className={s.clickable}
                    onClick={onUpClick}
                    strokeWidth={upstrokeWidth}
                    strokeLinecap="butt"
                    stroke={upColor}
                    d={t.interpolate(angle =>
                      arcCommands(20, 20, 16, angle, 360),
                    )}
                  />
                  <animated.path
                    className={s.clickable}
                    onClick={onDownClick}
                    strokeWidth={downstrokeWidth}
                    stroke={downColor}
                    strokeLinecap="butt"
                    d={t.interpolate(angle =>
                      arcCommands(20, 20, 16, 0, angle),
                    )}
                  />
                </g>
              )}
            </Spring>

            <path
              strokeWidth="8"
              stroke="#ddd"
              strokeLinecap="butt"
              d={arcCommands(
                20,
                20,
                16,
                360 - (threshold - 1) * 3.6,
                360 - (threshold + 1) * 3.6,
              )}
            />
          </g>
        </svg>
      </div>
    );
  }
}

export default withStyles(s)(VoteBar);
