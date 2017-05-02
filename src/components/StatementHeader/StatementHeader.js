/* eslint-disable */
import React from 'react';
import Proptypes from 'prop-types';

const renderLikeButton = (likeFn, liked) => (
  <button
    onClick={likeFn}
    className={cn(s.like, liked ? 'fa fa-thumbs-up' : 'fa fa-thumbs-o-up')}
  />
);

const renderFollowButton = (ownStatement, isFollowee, followFn) =>
  (ownStatement || isFollowee ? null : <button onClick={followFn}> +follow </button>);

const StatementHeader = props => {
  const {
    id,
    text,
    author,
    flag,
    user,
    likes,
    canLike,
    ownLike,
    ownStatement,
    isFollowee,
    handleLikeClick,
    updateUser,
  } = props;
  throw Error('NOT FINISHED');
  return (
    <div className={s.header}>
      <div>
        <span className={s.author}>
          {author.name} {author.surname}
        </span>
        <span>
          {likes ? ` (+${likes})` : ''}
          {canLike &&
            renderLikeButton(ownLike, () => {
              handleLikeClick(e, ownLike);
            })}
        </span>
      </div>
      {renderFollowButton(
        ownStatement,
        isFollowee,
        updateUser({ id: user.id, followee: author.id }),
      )}
      {!ownStatement &&
        <button
          onClick={() =>
            flag({
              statementId: id,
              content: text,
            })}
        >
          !Flag!
        </button>}
      <span className={s.menu}>
        {(this.props.asInput || ownStatement || ['admin', 'mod'].includes(user.role.type)) &&
          <span style={{ marginRight: '0.5em' }}>
            {this.state.edit
              ? <span>
                  <button onClick={this.onTextSubmit} disabled={!hasMinimumInput}>
                    <i className="fa fa-check" />
                  </button>
                  <button
                    onClick={this.onEndEditing}
                    disabled={this.props.asInput && !hasMinimumInput}
                  >
                    <i className="fa fa-times" />
                  </button>
                </span>
              : <button onClick={this.onEditStatement}>
                  <i className="fa fa-pencil" />
                </button>}
            {!this.props.asInput &&
              <button onClick={this.onDeleteStatement}>
                <i className="fa fa-trash" />
              </button>}
          </span>}
      </span>
    </div>
  );
};
/* eslint-enable */
