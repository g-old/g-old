import React from 'react';
import PropTypes from 'prop-types';
import Box from '../Box';
import Value from '../Value';
import Label from '../Label';
import ProfilePicture from '../ProfilePicture';
import history from '../../history';

import { ICONS } from '../../constants';

class UserProfile extends React.Component {
  static propTypes = {
    user: PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      email: PropTypes.string,
      name: PropTypes.string,
      surname: PropTypes.string,
      avatar: PropTypes.string,
      numStatements: PropTypes.number,
      numFollowers: PropTypes.number,
      numLikes: PropTypes.number,
      workTeams: PropTypes.arrayOf(PropTypes.shape({})),
      followees: PropTypes.arrayOf(
        PropTypes.shape({
          avatar: PropTypes.isRequired,
        }),
      ),
    }).isRequired,
    ownAccount: PropTypes.bool.isRequired,
    onImageChange: PropTypes.func.isRequired,
    updates: PropTypes.shape({ dataUrl: PropTypes.string }).isRequired,
  };

  render() {
    if (!this.props.user) return null;
    const {
      avatar,
      name,
      surname,
      numStatements,
      numFollowers,
      numLikes,
    } = this.props.user;
    const canChangeImg = this.props.ownAccount;
    return (
      <Box column align>
        <ProfilePicture
          user={this.props.user}
          img={avatar}
          canChange={canChangeImg}
          onChange={this.props.onImageChange}
          updates={this.props.updates.dataUrl}
        />

        <Label big>
          {name} {surname}
        </Label>
        <Box>
          <Value
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
            label="Followers"
            value={numFollowers || 0}
          />
          <Value
            icon={
              <svg
                viewBox="0 0 24 24"
                width="24px"
                height="24px"
                role="img"
                aria-label="favorite"
              >
                <path
                  fill="none"
                  stroke="#000"
                  strokeWidth="2"
                  d="M2,8.4 C2,4 5,3 7,3 C9,3 11,5 12,6.5 C13,5 15,3 17,3 C19,3 22,4 22,8.4 C22,15 12,21 12,21 C12,21 2,15 2,8.4 Z"
                />
              </svg>
            }
            label="Likes"
            value={numLikes || 0}
          />
          <Value
            icon={
              <svg
                viewBox="0 0 24 24"
                width="24px"
                height="24px"
                role="img"
                aria-label="contact"
              >
                <path
                  fill="none"
                  stroke="#000"
                  strokeWidth="2"
                  d="M1,2 L22,2 L22,18 L14,18 L6,22 L6,18 L1,18 L1,2 Z M6,10 L7,10 L7,11 L6,11 L6,10 Z M11,10 L12,10 L12,11 L11,11 L11,10 Z M16,10 L17,10 L17,11 L16,11 L16,10 Z"
                />
              </svg>
            }
            label="Statements"
            value={numStatements || 0}
          />
        </Box>
        {this.props.user.workTeams &&
          this.props.user.workTeams.map(t => (
            <Box onClick={() => history.push(`/workteams/${t.id}`)}>
              <svg
                version="1.1"
                viewBox="0 0 24 24"
                width="24px"
                height="24px"
                role="img"
                aria-label="group"
              >
                <path
                  fill="none"
                  stroke="#000"
                  strokeWidth="2"
                  d={ICONS.workteam}
                />
              </svg>

              <span>{t.displayName}</span>
            </Box>
          ))}
      </Box>
    );
  }
}

export default UserProfile;
