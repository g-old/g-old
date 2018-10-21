// @flow
import React from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './PollOptionPreview.css';
import Button from '../Button';
import Box from '../Box';
import { ICONS } from '../../constants';
import Label from '../Label';
import ProposalBody from './ProposalBody';
import type { OptionShape } from './ProposalInput';

type Props = {
  data: { body?: string, title?: string },
  description: string,
  onSave: OptionShape => void,
  onDelete: number => void,
  pos: number,
  title: string,
};

type State = { description: string, isEditing?: boolean };

class PollOptionPreview extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { description: props.description, title: props.title };
    this.handleEditing = this.handleEditing.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleSaving = this.handleSaving.bind(this);
    this.handleDeletion = this.handleDeletion.bind(this);
    this.register = this.register.bind(this);
    this.triggerCallback = this.triggerCallback.bind(this);
  }

  componentDidUpdate(prevProps) {
    const { title, description } = this.props;
    if (prevProps.title !== title || prevProps.description !== description) {
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({ title, description });
    }
  }

  handleEditing: () => void;

  handleDeletion: () => void;

  handleInputChange: () => void;

  handleSaving: () => void;

  handleEditing() {
    this.setState({ isEditing: true });
  }

  handleInputChange(e) {
    this.setState({ description: e.target.value });
  }

  handleDeletion() {
    const { onDelete, pos } = this.props;

    if (onDelete) {
      onDelete(pos);
      this.setState({ isEditing: false });
    }
  }

  handleSaving(values) {
    const { onSave, onDelete, ...fields } = this.props;

    if (onSave) {
      onSave({
        ...fields,
        description: values.find(val => val.name === 'body').value,
        title: values.find(val => val.name === 'title').value,
      });
      this.setState({ isEditing: false });
    }
  }

  triggerCallback() {
    const { dataCb } = this.state;
    dataCb();
  }

  register(data, cb) {
    this.setState({ dataCb: cb });
  }

  render() {
    const { description, title } = this.state;

    const { isEditing } = this.state;
    let content;

    if (isEditing) {
      content = (
        <ProposalBody
          onExit={this.handleSaving}
          callback={this.register}
          data={{ body: description, title }}
          withOptions
        />
      );
    } else {
      content = (
        <Box column>
          <Label>{title}</Label>
          <div dangerouslySetInnerHTML={{ __html: description }} />
        </Box>
      );
    }

    return (
      <Box column className={s.root}>
        {content}
        <Box>
          {!isEditing && (
            <Button
              plain
              icon={
                <svg
                  version="1.1"
                  viewBox="0 0 24 24"
                  width="24px"
                  height="24px"
                  role="img"
                >
                  <path
                    fill="none"
                    stroke="#000"
                    strokeWidth="2"
                    d={ICONS.edit}
                  />
                </svg>
              }
              onClick={this.handleEditing}
            />
          )}

          {isEditing && (
            <Button
              plain
              icon={
                <svg
                  version="1.1"
                  viewBox="0 0 24 24"
                  width="24px"
                  height="24px"
                  role="img"
                >
                  <polyline
                    fill="none"
                    stroke="#000"
                    strokeWidth="2"
                    points={ICONS.check}
                  />
                </svg>
              }
              onClick={this.triggerCallback}
            />
          )}

          <Button
            plain
            icon={
              <svg
                version="1.1"
                viewBox="0 0 24 24"
                width="24px"
                height="24px"
                role="img"
              >
                <path
                  fill="none"
                  stroke="#000"
                  strokeWidth="2"
                  d={ICONS.delete}
                />
              </svg>
            }
            onClick={this.handleDeletion}
          />
        </Box>
      </Box>
    );
  }
}

export default withStyles(s)(PollOptionPreview);
