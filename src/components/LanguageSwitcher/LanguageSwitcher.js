/* eslint-disable no-shadow */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { setLocale, locales } from '../../actions/intl';

function LanguageSwitcher({ currentLocale, availableLocales, setLocale }) {
  const isSelected = locale => locale === currentLocale;

  const localeName = locale => locales[locale] || locale;
  return (
    <div>
      {availableLocales.map(locale => (
        <span key={locale}>
          {isSelected(locale) ? (
            <span>{localeName(locale)}</span>
          ) : (
            // github.com/yannickcr/eslint-plugin-react/issues/945
            // eslint-disable-next-line react/jsx-indent
            <a
              href={`?lang=${locale}`}
              onClick={e => {
                setLocale({ locale });
                e.preventDefault();
              }}
            >
              {localeName(locale)}
            </a>
          )}{' '}
        </span>
      ))}
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

export default connect(mapState, mapDispatch)(LanguageSwitcher);
