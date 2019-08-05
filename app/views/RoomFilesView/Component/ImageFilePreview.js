/* eslint-disable */
import React from 'react';
import PropTypes from 'prop-types';
// react-native UI
import { Text, View, WebView } from 'react-native';
// antd UI
import { Modal, Button } from '@ant-design/react-native';
import { isImageFile, getFilePreviewUrl } from '../../../lib/methods/FileUtils';


export default class ImageFilePreview extends React.PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			show: false
		};
	}

	handleOpen = () => {
		this.setState({ show: true });
	};

	handleClose = () => {
		this.setState({ show: false });
	};

	render() {
		const { file: { name, fileId } } = this.props;
		return (
			<View>
				<Button size='small' type='ghost' disabled={ !isImageFile(name) }
				        onPress={ this.handleOpen }>预览</Button>
				<Modal
					popup
					visible={ this.state.show }
					animationType="slide-up"
				>
					<WebView
						source={ { uri: getFilePreviewUrl(fileId) } }
						style={ {
							height: 600
						} }
						onLoadStart={ (e) => console.log('onLoadStart') }
						renderError={ () => {
							console.log('renderError');
							return <View><Text>renderError回调了，出现错误</Text></View>;
						} }
						renderLoading={ () => {
							return <View><Text>加载中。。。</Text></View>;
						} }
						startInLoadingState
						onError={ () => {
							console.log('加载失败');
						} }
						scrollEnabled
					/>
					<Button type='ghost' onPress={ this.handleClose }>关闭预览</Button>
				</Modal>
			</View>
		);
	}
}

ImageFilePreview.propTypes = {
	file: PropTypes.object.isRequired
};

