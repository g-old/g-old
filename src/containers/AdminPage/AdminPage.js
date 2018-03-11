import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './AdminPage.css';
import Box from '../../components/Box';
import Image from '../../components/Image';
import Anchor from '../../components/Anchor';
import Layout from '../../components/Layout';

class AdminPage extends React.Component {
  static propTypes = {
    children: PropTypes.node.isRequired,
    menuLinks: PropTypes.arrayOf(PropTypes.shape({})),
    plattform: PropTypes.shape({}).isRequired,
  };

  static defaultProps = {
    menuLinks: null,
  };

  render() {
    const { children, menuLinks = [], plattform } = this.props;
    const navHeader = (
      <Box className={s.navHeader} between fill>
        <span>
          <Anchor to="/admin" className={s.title}>
            {plattform.name}
          </Anchor>
          <div>
            <span>Owner: </span>
          </div>
        </span>
        <Image className={s.picture} src={plattform.picture} />
      </Box>
    );

    const pageNav = (
      <Box className={s.pageNav} pad>
        {menuLinks.map(link => <Anchor to={link.to}> {link.name}</Anchor>)}
      </Box>
    );
    return (
      <Layout>
        <div className={s.container}>
          {navHeader}
          {pageNav}
          {children}
        </div>
      </Layout>
    );
  }
}
const mapStateToProps = state => ({ plattform: state.plattform });
export default connect(mapStateToProps)(withStyles(s)(AdminPage));
