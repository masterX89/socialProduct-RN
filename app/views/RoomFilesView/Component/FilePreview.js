/* eslint-disable */
import React from 'react';
import PropTypes from 'prop-types';
import { Base64 } from 'js-base64';
// react-native UI
import { Dimensions, View, WebView } from 'react-native';
// antd UI
import { Modal, Button } from '@ant-design/react-native';
import { getFilePreviewUrl, fileOpt } from '../../../lib/methods/FileUtils';

export default class FilePreview extends React.PureComponent {
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
		const { height } = Dimensions.get('window');

		const imgUrl = getFilePreviewUrl(fileId);
		const html = `<img src="${ imgUrl }" style="width:100%;height:auto;position:absolute;top:45%;left:50%;transform:translate(-50%,-50%);" alt="img"/>`;
		return (
			<View>
				<Button size='small' type='ghost'
				        disabled={ !((fileOpt.isImageFilePattern.test(fileOpt.isBase64CodePattern.test(name) ? Base64.decode(name) : name)) || (fileOpt.pdfTypePattern.test(fileOpt.isBase64CodePattern.test(name) ? Base64.decode(name) : name))) }
				        onPress={ this.handleOpen }>预览</Button>
				<Modal
					transparent
					onClose={ this.handleClose }
					maskClosable
					visible={ this.state.show }
					closable
				>
					<View style={ {
						height: height * 0.65
					} }>
						<WebView
							originWhitelist={ ['*'] }
							source={ { html: html } }
						/>
					</View>
				</Modal>
			</View>
		);
	}
}

FilePreview.propTypes = {
	file: PropTypes.object.isRequired
};

