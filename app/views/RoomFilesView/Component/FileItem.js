/* eslint-disable */
import React from 'react';
import PropTypes from 'prop-types';
// react-native UI
import { Text, View } from 'react-native';
// antd UI
import { List, WingBlank } from '@ant-design/react-native';
import ImageFilePreview from './ImageFilePreview';
import FileDelete from './FileDelete';

const wingBlankButtonStyle = {
	flexDirection: 'row',
	justifyContent: 'space-between',
	alignItems: 'center'
};

export default class FileItem extends React.PureComponent {
	render() {
		const { file } = this.props;
		return (
			<View>
				<List.Item>
					<Text>{ file.fileName === 'undefined' ? (file.name) : (file.fileName) }</Text>
					<WingBlank
						size='sm'
						style={ { ...wingBlankButtonStyle } }
					>
						<ImageFilePreview file={ file }/>
						<FileDelete fileId={ file.fileId } { ...this.props }/>
					</WingBlank>

				</List.Item>
			</View>
		);
	}
}

FileItem.propTypes = {
	file: PropTypes.object.isRequired
};

