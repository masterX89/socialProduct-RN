/* eslint-disable */
import React from 'react';
import PropTypes from 'prop-types';
// react-native UI
import { Text, View } from 'react-native';
// antd UI
import { List, WingBlank, Button } from '@ant-design/react-native';
import { Base64 } from 'js-base64';
import FilePreview from './FilePreview';
import FileDelete from './FileDelete';
import { fileOpt } from '../../../lib/methods/FileUtils';
import FileForward from './FileForward';

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
					<Text>{ fileOpt.isBase64CodePattern.test(file.name) ? Base64.decode(file.name) : file.name }</Text>
					<WingBlank
						size='sm'
						style={ { ...wingBlankButtonStyle } }
					>
						<FilePreview file={ file }/>
						<FileForward file={ file }/>
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

