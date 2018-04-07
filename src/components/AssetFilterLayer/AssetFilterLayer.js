import React from 'react';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
// import cn from 'classnames';
import s from './AssetFilterLayer.css';
import Box from '../Box';
import Layer from '../Layer';
// import Select from '../Select';
import Heading from '../Heading';
// import FormField from '../FormField';
import Menu from '../Menu';
import Button from '../Button';
import FilterControl from '../FilterControl';

class AssetFilterLayer extends React.Component {
  static propTypes = {
    onToggle: PropTypes.func.isRequired,
    filter: PropTypes.shape({}).isRequired,
    layerVisible: PropTypes.bool.isRequired,
    onSubmit: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
  };
  static defaultProps = {};

  render() {
    const {
      onToggle,
      filter,
      layerVisible,
      onSubmit,
      onCancel,
      /* onSearchPostTypes,
      form,
      isFiltering,
      filteredOptions, */
    } = this.props;
    return (
      <Box>
        <FilterControl onClick={onToggle} {...filter} />
        <Layer hidden={!layerVisible} onClose={onToggle} closer align="right">
          <Box tag="header" size="large" justify="between" align="center">
            <Heading tag="h2">Filter Assets</Heading>
          </Box>
          <Box tag="section" pad={{ horizontal: 'large', vertical: 'small' }}>
            <Box>
              {/* Object.keys(form).map(key => {
                const { fieldProps, ...formFieldProps } = form[key];
                if (key === 'postTypes') {
                  return (
                    <Box key={key} pad="medium">
                      <FormField {...formFieldProps}>
                        <Box pad="medium">
                          <Select
                            {...fieldProps}
                            autoFocus
                            onSearch={onSearchPostTypes}
                            options={
                              isFiltering ? filteredOptions : fieldProps.options
                            }
                          />
                        </Box>
                      </FormField>
                    </Box>
                  );
                }
                return null;
              }) */}
            </Box>
          </Box>
          <Box tag="section" pad="large">
            <Box tag="section" align="center" justify="center" pad="large">
              <Menu
                align="center"
                style={{ width: '100%' }}
                justify="between"
                direction="row"
                inline
                responsive={false}
              >
                <Button
                  label="submit"
                  style={{ marginRight: 5 }}
                  onClick={onSubmit}
                  primary
                  type="submit"
                />
                <Button
                  className="grommetux-button--critical"
                  style={{ marginLeft: 5 }}
                  label="clear"
                  onClick={onCancel}
                  primary={false}
                />
              </Menu>
            </Box>
          </Box>
        </Layer>
      </Box>
    );
  }
}

export default withStyles(s)(AssetFilterLayer);
