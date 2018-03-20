import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './UserLayout.css';
import Box from '../../components/Box';
import Anchor from '../../components/Anchor';
import Layout from '../../components/Layout';
import PageHeader from '../../components/PageHeader';
import { getUser } from '../../reducers';

class UserLayout extends React.Component {
  static propTypes = {
    children: PropTypes.node.isRequired,
    menuLinks: PropTypes.arrayOf(PropTypes.shape({})),
    user: PropTypes.shape({}).isRequired,
    id: PropTypes.string.isRequired,
  };

  static defaultProps = {
    menuLinks: null,
  };

  render() {
    const { children, menuLinks = [], user } = this.props;

    const pageNav = (
      <Box className={s.pageNav} pad>
        {menuLinks.map(link => <Anchor to={link.to}> {link.name}</Anchor>)}
      </Box>
    );
    return (
      <Layout>
        <div className={s.container}>
          <PageHeader
            displayName={`${user.name} ${user.surname}`}
            link={`/useraccount/${this.props.id}/`}
            picture={user.picture}
          />
          {pageNav}
          {children}
        </div>
      </Layout>
    );
  }
}
const mapStateToProps = (state, { id }) => ({ user: getUser(state, id) });
export default connect(mapStateToProps)(withStyles(s)(UserLayout));
