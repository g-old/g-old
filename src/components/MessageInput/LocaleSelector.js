import React from 'react';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/withStyles';
import s from './LocaleSelector.css';
import LocaleButton from './LocaleButton';

const labels = { de: 'Deutsch', it: 'Italiano', lld: 'Ladin' };
const LocaleSelector = ({ activeLocale, onActivate, locales }) => {
  const btns = locales.map((locale, index) => (
    <LocaleButton
      onClick={() => onActivate(locale)}
      label={labels[locale]}
      id={`locale-${index}`}
      locale={locale}
      active={locale === activeLocale}
    />
  ));

  return (
    <div role="list">
      <ul className={s.lang}>{btns}</ul>
    </div>
  );
};

LocaleSelector.propTypes = {
  activeLocale: PropTypes.string.isRequired,
  locales: PropTypes.arrayOf(PropTypes.string).isRequired,
  onActivate: PropTypes.func.isRequired,
};

export default withStyles(s)(LocaleSelector);
