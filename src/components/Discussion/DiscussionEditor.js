// @flow
import React from 'react';
import type { Node } from 'react';
import Box from '../Box';
import { isHtmlEmpty } from '../MessageInput/validationFns';
import Editor from '../MainEditor';
import Validator from '../FormValidation';
import Button from '../Button';
import Notification from '../Notification';

type Props = {
  title: string,
  content: string,
  dateComponent: Node,
  onUpdate: () => Promise<void>,
  storageKey: string,
  className: string,
  children?: Node,
};

type State = {
  storedDataFound?: boolean,
  titleContent?: string,
};

const bodyValidation = (data, state) => {
  let result = { touched: false };
  if (isHtmlEmpty(data) && !state.withOptions) {
    result = { touched: true, errorName: 'empty' };
  }
  return result;
};

class DiscussionEditor extends React.Component<Props, State> {
  static defaultProps = {
    children: null,
  };

  constructor(props) {
    super(props);
    this.state = {};
    this.deleteChanges = this.deleteChanges.bind(this);
  }

  componentDidMount() {
    const { content, storageKey, title } = this.props;
    const storedContent = localStorage.getItem(`${storageKey}content`);
    const storedTitle = localStorage.getItem(`${storageKey}title`);
    if (this.editor) {
      this.editor.setInitialState(storedContent || content);
    }
    this.setState({
      titleContent: storedTitle || title,
      storedDataFound: !!(storedTitle || storedContent),
    });
  }

  editor: ?Editor;

  deleteChanges: () => void;

  deleteChanges() {
    const { storageKey, content, title } = this.props;
    localStorage.removeItem(`${storageKey}title`);
    localStorage.removeItem(`${storageKey}content`);
    if (this.editor) {
      this.editor.setInitialState(content);
    }
    this.setState({ titleContent: title, storedDataFound: false });
  }

  render() {
    const {
      content,
      dateComponent,
      className,
      onUpdate,
      storageKey,
      children,
    } = this.props;
    const { titleContent, storedDataFound } = this.state;
    return (
      <Validator
        submit={onUpdate}
        validations={
          {
            content: { fn: bodyValidation, args: { required: true } },
            title: { args: { required: true, min: 3 } },
          } // hack to circumvent isEmpty check
        }
        data={
          { content, title: titleContent } // || localStorage.getItem(storageKey) || '<p></p>',
        }
      >
        {({
          handleValueChanges,
          values,
          errorMessages,
          onSubmit,
          inputChanged,
        }) => (
          <Box column>
            {storedDataFound && (
              <Notification
                type="alert"
                message="Unsaved content found!"
                action={
                  <Button
                    primary
                    label="Restore"
                    onClick={this.deleteChanges}
                  />
                }
              />
            )}
            {errorMessages.titleError && (
              <Notification type="error" message={errorMessages.titleError} />
            )}
            <div>
              <input
                className={className}
                name="title"
                type="text"
                value={values.title}
                onChange={e => {
                  handleValueChanges(e);
                  localStorage.setItem(`${storageKey}title`, e.target.value);
                }}
              />
              {dateComponent}
              {errorMessages.contentError && (
                <Notification
                  type="error"
                  message={errorMessages.contentError}
                />
              )}
              <Editor
                ref={
                  elm => (this.editor = elm) // eslint-disable-line
                }
                value={values.body}
                onChange={value => {
                  handleValueChanges({
                    target: { name: 'content', value },
                  });
                  localStorage.setItem(`${storageKey}content`, value);
                }}
              />
              {children}
            </div>
            {(inputChanged || storedDataFound) && (
              <Box>
                <Button primary label="Save" onClick={onSubmit} />
              </Box>
            )}
          </Box>
        )}
      </Validator>
    );
  }
}

export default DiscussionEditor;
