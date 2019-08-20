import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
// react-native UI
import { Dimensions, StyleSheet, Text, View, WebView } from 'react-native';
// antd UI
import { Modal, Button, ActivityIndicator } from '@ant-design/react-native';
import { PDF_KEY, PDFTRON_HOST, TEAM_CORE_HOST } from '../../../../constants/Constants';

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
export default class GraphPreviewModal extends React.PureComponent {
	static propTypes = {
		user: PropTypes.object,
		currentGraph: PropTypes.object
	};

	constructor(props) {
		super(props);
		this.state = {
			show: false,
			currentGraphPreviewUrl: ''
		};
	}

	cancelModal = () => {
		this.setState({
			show: false
		});
	};

	showGraphPreviewModal = () => {
		const { currentGraph } = this.props;
		fetch(`${ TEAM_CORE_HOST }/majorPlanning/getById?id=${ parseInt(currentGraph.key) }`, {
			method: 'GET',
			headers: {
				'Auth-Token': this.props.user.token,
				'Auth-uid': this.props.user.id
			}
		})
			.then(data => data.json())
			.then((data2) => {
				const flow = 'design';
				const { signFilePath: filePath, majorId } = data2.content;
				const newFilePath = filePath.replace(/\//g, '@!!@')
					.replace(/\+/g, '@!_!@')
					.replace(/&/g, '@!__!@');
				fetch(`${ TEAM_CORE_HOST }/majorDetail/getByIdForPreview?id=${ majorId }`, {
					method: 'GET',
					headers: {
						'Auth-Token': this.props.user.token,
						'Auth-uid': this.props.user.id
					}
				})
					.then(data => data.json())
					.then((majorData) => {
						const { gitlabId: dirId } = majorData.content;
						const pdfUrl = `${ PDFTRON_HOST }/samples/viewing/viewing/index.html?key=${ PDF_KEY }&url=${ TEAM_CORE_HOST }/wopi/files/${ dirId }/${ flow }/${ newFilePath }/${ majorId }/contents`;
						this.setState({
							show: true,
							currentGraphPreviewUrl: pdfUrl
						});
					});
			});

	};

	render() {
		const { currentGraphPreviewUrl, show } = this.state;
		return (
			<View>
				<Button type='ghost' onPress={ this.showGraphPreviewModal }>
					<Text style={ { fontSize: 17 } }>预览</Text>
				</Button>
				<Modal
					popup
					visible={ show }
					animationType='slide-up'
				>
					<WebView
						source={ { uri: currentGraphPreviewUrl } }
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
					<Button type="ghost" onPress={ this.cancelModal }>
						关闭预览
					</Button>
				</Modal>
			</View>
		);
	}
}
