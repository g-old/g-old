import React from 'react';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/withStyles';
import { defineMessages } from 'react-intl';
import InfiniteCalendar, {
  withRange,
  Calendar as CalendarWithRange,
} from 'react-infinite-calendar';

import s from './Calendar.css';

/* eslint-disable */
const messages = defineMessages({
  blank: {
    id: 'calendar.blank',
    defaultMessage: 'No date set',
    description: 'Blank calendar',
  },
  todayShort: {
    id: 'calendar.today.short',
    defaultMessage: 'Today',
    description: 'Today',
  },
  todayLong: {
    id: 'calendar.today.long',
    defaultMessage: 'Today',
    description: 'Today',
  },
});

const months = {
  'de-DE': 'Januar_Februar_März_April_Mai_Juni_Juli_August_September_Oktober_November_Dezember'.split(
    '_',
  ),

  'it-IT': 'gennaio_febbraio_marzo_aprile_maggio_giugno_luglio_agosto_settembre_ottobre_novembre_dicembre'.split(
    '_',
  ),
};
const monthsShort = {
  'de-DE': 'Jan._Febr._Mrz._Apr._Mai_Jun._Jul._Aug._Sept._Okt._Nov._Dez.'.split('_'),
  'it-IT': 'gen_feb_mar_apr_mag_giu_lug_ago_set_ott_nov_dic'.split('_'),
};
const weekdaysShort = {
  'de-DE:': 'So._Mo._Di._Mi._Do._Fr._Sa.'.split('_'),
  'it-IT': 'dom_lun_mar_mer_gio_ven_sab'.split('_'),
};

const weekdays = {
  'de-DE': 'Sonntag_Montag_Dienstag_Mittwoch_Donnerstag_Freitag_Samstag'.split('_'),
  'it-IT': 'domenica_lunedì_martedì_mercoledì_giovedì_venerdì_sabato'.split('_'),
};
const format = {
  'de-DE': 'dddd,MM.YYYY',
  'it-IT': 'D MMMM YYYY',
};

class Calendar extends React.Component {
  static propTypes = {
    lang: PropTypes.string.isRequired,
    intl: PropTypes.shape({
      'calendar.blank': PropTypes.string,
    }).isRequired,
  };

  static locales = {
    'de-DE': require('date-fns/locale/de'),
    'it-IT': require('date-fns/locale/it'),
  };
  render() {
    throw Error('Not finished');

    const today = new Date();
    const lastWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7);
    const { lang, intl } = this.props;

    const localizedWeekdays = weekdaysShort[this.props.lang];
    return (
      <InfiniteCalendar
        Component={withRange(CalendarWithRange)}
        theme={{
          selectionColor: 'rgb(146, 118, 255)',
          textColor: {
            default: '#333',
            active: '#FFF',
          },
          weekdayColor: 'rgb(146, 118, 255)',
          headerColor: 'rgb(127, 95, 251)',
          floatingNav: {
            background: 'rgba(81, 67, 138, 0.96)',
            color: '#FFF',
            chevron: '#FFA726',
          },
        }}
        onSelect={function(date) {
          console.log(`You selected: ${JSON.stringify(date)}`);
        }}
        width={380}
        height={400}
        selected={new Date()}
        locale={{
          locale: Calendar.locales[this.props.lang],
          headerFormat: 'dddd, D MMM',
          weekdays: localizedWeekdays,
          blank: 'Nothing selected',
          todayLabel: {
            long: 'Today',
            short: 'Today',
          },
        }}
      />
    );
  }
}
/* eslint-enable */

export default withStyles(s)(Calendar);
