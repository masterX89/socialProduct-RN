import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Base64 } from 'js-base64';
// react-native UI
import { Dimensions, StyleSheet, View, WebView } from 'react-native';
// antd UI
import { Modal, Button, ActivityIndicator } from '@ant-design/react-native';
import { getFilePreviewUrl, fileOpt } from '../../../lib/methods/FileUtils';
import { PDF_KEY, PDFTRON_HOST, TEAM_CORE_HOST } from '../../../constants/Constants';

const { height } = Dimensions.get('window');
const styles = StyleSheet.create({
	Container: {
		alignItems: 'center',
		justifyContent: 'center',
		height: height * 0.415
	}
});

@connect(state => ({
	user: {
		name: state.login.user && state.login.user.name,
		username: state.login.user && state.login.user.username,
		token: state.login.user && state.login.user.token,
		id: state.login.user && state.login.user.id
	}
}))
export default class FilePreview extends React.PureComponent {
	static propTypes = {
		user: PropTypes.object,
		file: PropTypes.object.isRequired
	};

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
		const { file: { name, fileId }, user } = this.props;
		const { show } = this.state;

		const imgUrl = getFilePreviewUrl(fileId);
		// 自动缩放的图片
		const html = `<img src="${ imgUrl }" style="width:100%;height:auto;position:absolute;top:45%;left:50%;transform:translate(-50%,-50%);" alt="img"/>`;
		const url = `${ PDFTRON_HOST }/samples/viewing/viewing/index.html?key=${ PDF_KEY }&token=${ user.token }&uid=${ user.id }&uname=${ user.username }&url=${ TEAM_CORE_HOST }/fileManager/download?id=${ fileId }&isWopi=false&name=${ name }`;
		// base64 decode
		const nameDecode = fileOpt.isBase64CodePattern.test(name) ? Base64.decode(name) : name;
		const buttonDisable = !((fileOpt.isImageFilePattern.test(nameDecode)) || (fileOpt.pdfTypePattern.test(nameDecode)) || (fileOpt.isProjectImagePattern.test(nameDecode)));
		return (
			<View>
				<Button size='small' type='ghost'
				        disabled={ buttonDisable }
				        onPress={ this.handleOpen }>预览</Button>
				<Modal
					popup
					visible={ show }
					animationType='slide-up'
				>
					<WebView
						source={ { uri: url } }
						style={ {
							width: '100%',
							height: height * 0.82
						} }
						renderLoading={ () => {
							return (<View style={ styles.Container }>
								<ActivityIndicator/>
							</View>);
						} }
						startInLoadingState
						scrollEnabled
					/>
					<Button type="ghost" onPress={ this.handleClose }>
						关闭预览
					</Button>
				</Modal>
			</View>
		);
	}
}

