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
        displayName: 'an',
        relative: {
          0: 'ongan',
          1: "l'an que ven",
          '-1': "l'an passat",
        },
        relativeTime: {
          future: {
            one: 'dins {0} an',
            other: 'dins {0} ans',
          },
          past: {
            one: 'fa {0} an',
            other: 'fa {0} ans',
          },
        },
      },
      month: {
        displayName: 'mes',
        relative: {
          0: 'aqueste mes',
          1: 'lo mes que ven',
          '-1': 'lo mes passat',
        },
        relativeTime: {
          future: {
            one: 'dins {0} mes',
            other: 'dins {0} meses',
          },
          past: {
            one: 'fa {0} mes',
            other: 'fa {0} meses',
          },
        },
      },
      day: {
        displayName: 'jorn',
        relative: {
          0: 'uèi',
          1: 'deman',
          '-1': 'ièr',
        },
        relativeTime: {
          future: {
            one: 'dins {0} jorn',
            other: 'dins {0} jorns',
          },
          past: {
            one: 'fa {0} jorn',
            other: 'fa {0} jorns',
          },
        },
      },
      hour: {
        displayName: 'ora',
        relativeTime: {
          future: {
            one: 'dins {0} ora',
            other: 'dins {0} oras',
          },
          past: {
            one: 'fa {0} ora',
            other: 'fa {0} oras',
          },
        },
      },
      minute: {
        displayName: 'minuta',
        relativeTime: {
          future: {
            one: 'dins {0} minuta',
            other: 'dins {0} minutas',
          },
          past: {
            one: 'fa {0} minuta',
            other: 'fa {0} minutas',
          },
        },
      },
      second: {
        displayName: 'segonda',
        relative: {
          0: 'ara',
        },
        relativeTime: {
          future: {
            one: 'dins {0} segonda',
            other: 'dins {0} segondas',
          },
          past: {
            one: 'fa {0} segonda',
            other: 'fa {0} segondas',
          },
        },
      },
    },
  },
];
