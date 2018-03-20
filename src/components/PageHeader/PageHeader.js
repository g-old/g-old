import React from 'react';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import Box from '../Box';
import Anchor from '../Anchor';
import Image from '../Image';

import s from './PageHeader.css';

function PageHeader({ displayName, link, account, picture }) {
  return (
    <Box className={s.navHeader} between fill>
      <span>
        <Anchor to={link} className={s.title}>
          {displayName}
        </Anchor>
        <div>
          <span>{account && `Admin: ${account.name} ${account.surname} `}</span>
        </div>
      </span>
      <Image className={s.picture} src={picture} />
    </Box>
  );
}

PageHeader.propTypes = {
  displayName: PropTypes.string.isRequired,
  link: PropTypes.string.isRequired,
  account: PropTypes.shape({}),
  picture: PropTypes.string,
};

PageHeader.defaultProps = {
  account: null,
  picture: null,
};

export default withStyles(s)(PageHeader);
