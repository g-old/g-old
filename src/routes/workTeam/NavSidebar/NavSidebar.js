import React from 'react';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/withStyles';
import s from './NavSidebar.css';
import Sidebar from '../../../components/Sidebar';
import Label from '../../../components/Label';
import Heading from '../../../components/Heading';
import Image from '../../../components/Image';
import Box from '../../../components/Box';
import Button from '../../../components/Button';

class Navbar extends React.Component {
  static propTypes = {
    logo: PropTypes.string,
    displayName: PropTypes.string.isRequired,
    numMembers: PropTypes.number.isRequired,
    handleNavClicks: PropTypes.func.isRequired,
  };

  static defaultProps = {
    logo: null,
  };

  render() {
    const { logo, displayName, numMembers, handleNavClicks } = this.props;
    let groupImage;
    if (logo) {
      groupImage = <Image src={logo} />;
    } else {
      groupImage = (
        <svg
          version="1.1"
          viewBox="0 0 24 24"
          role="img"
          width="100px"
          height="100px"
          aria-label="cloud"
        >
          <path
            fill="none"
            stroke="#000"
            strokeWidth="2"
            d="M18,17 L18,18 C18,21 16,22 13,22 L11,22 C8,22 6,21 6,18 L6,17 C3.23857625,17 1,14.7614237 1,12 C1,9.23857625 3.23857625,7 6,7 L12,7 M6,7 L6,6 C6,3 8,2 11,2 L13,2 C16,2 18,3 18,6 L18,7 C20.7614237,7 23,9.23857625 23,12 C23,14.7614237 20.7614237,17 18,17 L12,17"
          />
        </svg>
      );
    }
    const links = [
      { path: 'proposals', label: 'Votings' },
      { path: 'discussions', label: 'Discussions' },
    ].map(page => (
      <div // eslint-disable-line
        onClick={e => {
          handleNavClicks(e, page.path);
        }}
        className={s.menuLink}
      >
        <Label>{page.label}</Label>
      </div>
    ));
    return (
      <Sidebar column className={s.sidebar} fixed size>
        <Box column align>
          {groupImage}
          <Heading tag="h2">{displayName}</Heading>
        </Box>
        <Box column>
          <Box between align pad>
            <Label>Members</Label>
            <Button
              plain
              icon={
                <svg viewBox="0 0 24 24" width="24px" height="24px" role="img">
                  <path
                    fill="none"
                    stroke="#000"
                    strokeWidth="2"
                    d="M12,13 C14.209139,13 16,11.209139 16,9 C16,6.790861 14.209139,5 12,5 C9.790861,5 8,6.790861 8,9 C8,11.209139 9.790861,13 12,13 Z M6,22 L6,19 C6,15.6862915 8.6862915,13 12,13 C15.3137085,13 18,15.6862915 18,19 L18,22 M13,5 C13.4037285,3.33566165 15.0151447,2 17,2 C19.172216,2 20.98052,3.790861 21,6 C20.98052,8.209139 19.172216,10 17,10 L16,10 L17,10 C20.287544,10 23,12.6862915 23,16 L23,18 M11,5 C10.5962715,3.33566165 8.98485529,2 7,2 C4.82778404,2 3.01948003,3.790861 3,6 C3.01948003,8.209139 4.82778404,10 7,10 L8,10 L7,10 C3.71245602,10 1,12.6862915 1,16 L1,18"
                  />
                </svg>
              }
              label={numMembers}
            />
          </Box>

          <div>{links}</div>
        </Box>
      </Sidebar>
    );
  }
}

export default withStyles(s)(Navbar);
