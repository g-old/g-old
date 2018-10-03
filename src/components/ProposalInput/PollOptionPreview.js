// @flow
import React from 'react';
import Textarea from 'react-textarea-autosize';
import Button from '../Button';
import Box from '../Box';
import { ICONS } from '../../constants';
import type { OptionShape } from './ProposalInput';

type Props = {
  data: { body?: string, title?: string },
  description: string,
  onSave: OptionShape => void,
};

type State = { description: string, isEditing?: boolean };

class PollOptionPreview extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { description: props.description };
    this.handleEditing = this.handleEditing.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleSaving = this.handleSaving.bind(this);
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

  handleSaving() {
    const { onSave } = this.props;

    if (onSave) {
      const { description } = this.state;
      onSave({ ...this.props, description });
    }
  }

  render() {
    const { description } = this.state;

    const { isEditing } = this.state;
    let text;
    if (isEditing) {
      text = (
        <Textarea
          name="option"
          useCacheForDOMMeasurements
          value={description}
          onChange={this.handleInputChange}
          minRows={2}
        />
      );
    } else {
      text = <span>{description}</span>;
    }

    return (
      <Box column>
        {text}
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
              onClick={this.handleSaving}
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

export default PollOptionPreview;
