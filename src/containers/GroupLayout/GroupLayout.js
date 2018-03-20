import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './GroupLayout.css';
import Box from '../../components/Box';
import Anchor from '../../components/Anchor';
import Layout from '../../components/Layout';
import PageHeader from '../../components/PageHeader';
import { getGroup } from '../../reducers';

class GroupLayout extends React.Component {
  static propTypes = {
    children: PropTypes.node.isRequired,
    menuLinks: PropTypes.arrayOf(PropTypes.shape({})),
    group: PropTypes.shape({}).isRequired,
    id: PropTypes.string.isRequired,
  };

  static defaultProps = {
    menuLinks: null,
  };

  render() {
    const { children, menuLinks = [], group } = this.props;

    const pageNav = (
      <Box className={s.pageNav} pad>
        {menuLinks.map(link => <Anchor to={link.to}> {link.name}</Anchor>)}
      </Box>
    );
    return (
      <Layout>
        <div className={s.container}>
          <PageHeader
            displayName={group.displayName}
            link={`/group/${this.props.id}/`}
            account={group.coordinator}
            picture={group.picture}
          />
          {pageNav}
          {children}
        </div>
      </Layout>
    );
  }
}
const mapStateToProps = (state, { id }) => ({ group: getGroup(state, id) });
export default connect(mapStateToProps)(withStyles(s)(GroupLayout));
