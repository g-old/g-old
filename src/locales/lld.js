/* eslint eqeqeq: "off"*/
/* eslint no-nested-ternary: "off"*/
/* eslint-disable one-var */
export default [
  {
    locale: 'lld',
    pluralRuleFunction(e, a) {
      const n = String(e).split('.'),
        l = !n[1],
        o = Number(n[0]) == e,
        t = o && n[0].slice(-1),
        r = o && n[0].slice(-2);
      return a
        ? t == 1 && r != 11
          ? 'un'
          : t == 2 && r != 12 ? 'dos' : t == 3 && r != 13 ? 'pauc' : 'autre'
        : e == 1 && l ? 'un' : 'autre';
    },
    fields: {
      year: {
        displayName: 'ann',
        relative: {
          0: 'chest ann',
          1: "l'ann che vegn",
          '-1': "l'ann passé",
        },
        relativeTime: {
          future: {
            one: 'te {0} ann',
            other: 'te {0} agn',
          },
          past: {
            one: 'dant {0} an',
            other: 'dant {0} agn',
          },
        },
      },
      month: {
        displayName: 'meis',
        relative: {
          0: 'chest meis',
          1: 'l mies che vegn',
          '-1': 'l meis passé',
        },
        relativeTime: {
          future: {
            one: 'te {0} meis',
            other: 'te {0} meisc',
          },
          past: {
            one: 'dant {0} meis',
            other: 'dant {0} meisc',
          },
        },
      },
      day: {
        displayName: 'di',
        relative: {
          0: 'encuei',
          1: 'doman',
          '-1': 'enier',
        },
        relativeTime: {
          future: {
            one: 'te {0} di',
            other: 'te {0} dis',
          },
          past: {
            one: 'dant {0} di',
            other: 'dant {0} dis',
          },
        },
      },
      hour: {
        displayName: 'ora',
        relativeTime: {
          future: {
            one: 'te {0} ora',
            other: 'te {0} ores',
          },
          past: {
            one: 'dant {0} ora',
            other: 'dant {0} ores',
          },
        },
      },
      minute: {
        displayName: 'menut',
        relativeTime: {
          future: {
            one: 'te {0} menut',
            other: 'te {0} menuc',
          },
          past: {
            one: 'dant {0} menut',
            other: 'dant {0} menuc',
          },
        },
      },
      second: {
        displayName: 'secont',
        relative: {
          0: 'segn',
        },
        relativeTime: {
          future: {
            one: 'te {0} secont',
            other: 'te {0} seconc',
          },
          past: {
            one: 'dant {0} secont',
            other: 'dant {0} seconc',
          },
        },
      },
    },
  },
];
