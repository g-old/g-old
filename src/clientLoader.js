// polyfills
import main from './client';

function run() {
  // Run the application when both DOM is ready and page content is loaded
  if (
    ['complete', 'loaded', 'interactive'].includes(document.readyState) &&
    document.body
  ) {
    main();
  } else {
    document.addEventListener('DOMContentLoaded', main, false);
  }
}

if (!global.Intl) {
  // You can show loading banner here

  require.ensure(
    [
      // Add all large polyfills here
      'intl',
      'intl/locale-data/jsonp/de.js',
      'intl/locale-data/jsonp/it.js',
    ],
    require => {
      // and require them here
      require('intl');
      require('intl/locale-data/jsonp/de.js');
      require('intl/locale-data/jsonp/it.js');

      run();
    },
    'polyfills',
  );
} else {
  run();
}
