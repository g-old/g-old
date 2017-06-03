import React from 'react';
import history from '../../history';

class AccountSettings extends React.Component {
  render() {
    return (
      <div>

        <h1>
          ADDITIONAL DETAILS
        </h1>
        <h1>
          INFORMATION
        </h1>
        <h1>
          NEXT STEPS
        </h1>
        <button onClick={() => history.push('/account')}>NEXT</button>
      </div>
    );
  }
}
export default AccountSettings;
