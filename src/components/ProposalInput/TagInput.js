/* @flow */

import React from 'react';
import FormField from '../FormField';
import Box from '../Box';
import Navigation from './Navigation';
import TagField from '../TagInput';
import type { TagType } from '../TagInput';

export const TAG_ID_SUFFIX = '$tagId';

type Props = {
  selectedTags: [TagType],
  onExit: ([{ name: string, value: [TagType] }]) => void,
  maxTags: number,
  suggestions: [TagType],
};

type State = {
  selectedTagIds: [ID],
  selectedTags: [TagType],
};

class TagInput extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      selectedTagIds: props.selectedTags.map(tag => tag.id),
      selectedTags: props.selectedTags,
    };
    this.handleNext = this.handleNext.bind(this);
    this.handleAddTag = this.handleAddTag.bind(this);
    this.handleRemoveTag = this.handleRemoveTag.bind(this);
  }

  handleNext: () => void;

  handleAddTag: TagType => void;

  handleRemoveTag: ID => void;

  handleNext() {
    const { onExit } = this.props;
    if (onExit) {
      const { selectedTags } = this.state;
      onExit([{ name: 'tags', value: selectedTags }]);
    }
    return true;
  }

  handleAddTag(tag: TagType) {
    const { maxTags, suggestions } = this.props;
    const { selectedTagIds, selectedTags } = this.state;
    let newTag;

    // availableTags = only stored tags
    // actual tags
    if (selectedTagIds.length <= maxTags) {
      const allTags = [...suggestions, ...selectedTags];

      const allTagsMap = new Map(allTags.map(t => [t.id, t]));

      if (!('id' in tag)) {
        // must be new tag
        const duplicateTag = allTags.find(
          t => t.text.trim().toLowerCase() === tag.text.trim().toLowerCase(),
        );
        if (duplicateTag) {
          // take from availableTag
          newTag = duplicateTag;
        } else {
          newTag = {
            ...tag,
            id: Math.floor(Math.random() * 1000) + TAG_ID_SUFFIX,
          };
          allTagsMap.set(newTag.id, newTag);
        }
      } else {
        // check id
        newTag = suggestions.find(t => t.id === tag.id);
        if (!newTag) {
          throw new Error('Tag addition failed');
        }
      }

      this.setState(prevState => {
        const updatedTagIds = [
          ...new Set([...prevState.selectedTagIds, newTag.id]),
        ];
        return {
          selectedTagIds: updatedTagIds,
          selectedTags: updatedTagIds.map(tId => allTagsMap.get(tId)),
        };
      });
    }
  }

  handleRemoveTag(tagId: ID) {
    const { suggestions } = this.props;

    this.setState(({ selectedTagIds, selectedTags }) => {
      const allTags = [...suggestions, ...selectedTags];
      const allTagsMap = new Map(allTags.map(t => [t.id, t]));

      const updatedTagIds = selectedTagIds.filter(tId => tId !== tagId);
      return {
        selectedTagIds: updatedTagIds,
        selectedTags: updatedTagIds.map(tId => allTagsMap.get(tId)),
      };
    });
  }

  render() {
    const { suggestions, maxTags } = this.props;
    const { selectedTags } = this.state;

    return (
      <Box column>
        <FormField label="Tags">
          <TagField
            name="tagInput"
            selectedTags={selectedTags}
            suggestions={suggestions}
            onAddTag={this.handleAddTag}
            onDeleteTag={this.handleRemoveTag}
            numTagsLimit={maxTags}
            predefinedTagsOnly={false}
          />
        </FormField>
        <Navigation onNext={this.handleNext} />
      </Box>
    );
  }
}

export default TagInput;
