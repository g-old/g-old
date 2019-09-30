/* eslint-disable no-shadow */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { setLocale, locales } from '../../actions/intl';
import Menu from '../Menu';
import Link from '../Link';

function LanguageSwitcher({ currentLocale, availableLocales, setLocale }) {
  const localeName = locale => locales[locale] || locale;
  return (
    <div style={{ color: '#fff', fontSize: '1.8rem' }}>
      <Menu
        withControl
        label={localeName(currentLocale)}
        dropAlign={{ top: 'top', right: 'right' }}
        icon={
          <svg aria-label="FormDown" viewBox="0 0 24 24">
            <polyline
              fill="none"
              stroke="#fff"
              strokeWidth="2"
              points="18 9 12 15 6 9"
            />
          </svg>
        }
      >
        {availableLocales
          .filter(locale => locale !== currentLocale)
          .map(locale => (
            <Link
              href={`?lang=${locale}`}
              onClick={e => {
                setLocale({ locale });
                e.preventDefault();
              }}
            >
              {localeName(locale)}
            </Link>
          ))}
      </Menu>
    </div>
  );
}

LanguageSwitcher.propTypes = {
  currentLocale: PropTypes.string.isRequired,
  availableLocales: PropTypes.arrayOf(PropTypes.string).isRequired,
  setLocale: PropTypes.func.isRequired,
};

const mapState = state => ({
  availableLocales: state.runtime.availableLocales,
  currentLocale: state.intl.locale,
});

const mapDispatch = {
  setLocale,
};

export default connect(
  mapState,
  mapDispatch,
)(LanguageSwitcher);
