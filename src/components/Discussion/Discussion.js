// @flow

import {
  FormattedRelative,
  defineMessages,
  FormattedMessage,
  injectIntl,
  IntlShape,
} from 'react-intl';
import React, { lazy, Suspense } from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Discussion.css';
import UserThumbnail from '../UserThumbnail';

const Editor = lazy(() => import('./DiscussionEditor'));

const messages = defineMessages({
  edited: {
    id: 'label.edited',
    defaultMessage: '{time} (edited)',
    description: 'Comment edited',
  },
});

type Props = {
  title: string,
  content: string,
  createdAt: ?string,
  closedAt: ?string,
  author: UserShape,
  onUpdate: () => Promise<void>,
  storageKey: string,
  isEditing: boolean,
  intl: IntlShape,
  updatedAt: ?string,
};

class Discussion extends React.Component<Props> {
  static defaultProps = {};

  render() {
    const {
      isEditing,
      onUpdate,
      title,
      content,
      createdAt,
      closedAt,
      storageKey,
      author,
      updatedAt,
      intl,
    } = this.props;
    let component;
    let date;
    if (updatedAt) {
      date = (
        <FormattedMessage
          {...messages.edited}
          values={{ time: intl.formatRelative(updatedAt) }}
        />
      );
    } else {
      date = <FormattedRelative value={createdAt} />;
    }
    const dateComponent = <div className={s.date}>{date}</div>;
    if (isEditing) {
      component = (
        <Suspense fallback={<div> Loading Editor ....</div>}>
          <Editor
            content={content}
            title={title}
            className={s.headline}
            onUpdate={onUpdate}
            storageKey={storageKey}
            dateComponent={dateComponent}
          >
            {author && <UserThumbnail user={author} marked />}
          </Editor>
        </Suspense>
      );
    } else {
      component = (
        <React.Fragment>
          <div className={s.headline}>{title}</div>
          {dateComponent}
          <div
            className={s.body}
            dangerouslySetInnerHTML={{ __html: content }}
          />
          {author && <UserThumbnail user={author} marked />}
        </React.Fragment>
      );
    }
    return (
      <div className={s.root}>
        <div className={s.container}>
          <div className={s.state}>{closedAt && 'CLOSED'}</div>

          {component}
        </div>
      </div>
    );
  }
}

export default withStyles(s)(injectIntl(Discussion));
