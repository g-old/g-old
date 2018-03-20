import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './AdminPage.css';
import Box from '../../components/Box';
import Anchor from '../../components/Anchor';
import Layout from '../../components/Layout';
import PageHeader from '../../components/PageHeader';

import { getPlatform } from '../../reducers';

class AdminPage extends React.Component {
  static propTypes = {
    children: PropTypes.node.isRequired,
    menuLinks: PropTypes.arrayOf(PropTypes.shape({})),
    platform: PropTypes.shape({}).isRequired,
  };

  static defaultProps = {
    menuLinks: null,
  };

  render() {
    const { children, menuLinks = [], platform } = this.props;

    const pageNav = (
      <Box className={s.pageNav} pad>
        {menuLinks.map(link => <Anchor to={link.to}> {link.name}</Anchor>)}
      </Box>
    );
    return (
      <Layout>
        <div className={s.container}>
          <PageHeader
            displayName={platform.displayName}
            link="/admin"
            account={platform.admin}
            picture={platform.picture || '/tile.png'}
          />
          {pageNav}
          {children}
        </div>
      </Layout>
    );
  }
}
const mapStateToProps = state => ({ platform: getPlatform(state) });
export default connect(mapStateToProps)(withStyles(s)(AdminPage));
