import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Base64 } from 'js-base64';
import RNFetchBlob from 'rn-fetch-blob';
// react-native UI
import { View, Text, FlatList, ScrollView, SafeAreaView, Dimensions } from 'react-native';
// antd UI
import { Toast, List, ActivityIndicator } from '@ant-design/react-native';
import styles from '../styles';
import database from '../../../lib/realm';
import I18n from '../../../i18n';
import { TEAM_CORE_HOST } from '../../../constants/Constants';
import { extensionToMime, uploadFile } from '../../../lib/methods/FileUtils';
import RocketChat from '../../../lib/rocketchat';

@connect(state => ({
	user: {
		name: state.login.user && state.login.user.name,
		username: state.login.user && state.login.user.username,
		token: state.login.user && state.login.user.token,
		id: state.login.user && state.login.user.id
	}
}))
export default class ForwardRoomsListView extends React.PureComponent {
	static propTypes = {
		user: PropTypes.object,
		file: PropTypes.object,
		handleClose: PropTypes.func
	};

	constructor(props) {
		super(props);
		this.state = {
			chats: [],
			favorites: [],
			unread: [],
			channels: [],
			privateGroup: [],
			direct: [],
			livechat: []
		};
	}

	componentDidMount() {
		this.data = database.objects('subscriptions')
			.filtered('archived != true && open == true')
			.sorted('roomUpdatedAt', true);
		this.setState({
			chats: this.data.filtered('(unread == 0 && alert == false)')
				.slice(),
			favorites: this.data.filtered('f == true')
				.slice(),
			unread: this.data.filtered('archived != true && open == true')
				.sorted('name', false)
				.filtered('(unread > 0 || alert == true)')
				.slice(),
			channels: this.data.filtered('t == $0', 'c')
				.slice(),
			privateGroup: this.data.filtered('t == $0', 'p')
				.slice(),
			direct: this.data.filtered('t == $0', 'd')
				.slice(),
			livechat: this.data.filtered('t == $0', 'l')
				.slice()
		});
	}

	forwardFile(item) {
		const { user, file, handleClose } = this.props;
		Toast.loading('文件转发中', 3);
		RNFetchBlob.config({
			fileCache: true
		})
			.fetch('GET', `${ TEAM_CORE_HOST }/fileManager/download?id=${ file.fileId }`, {
				'Auth-Token': user.token,
				'Auth-uid': user.id
			})
			.then((res) => {
				handleClose();
				console.log('路径：', res.path());
				const extension = file.fileName.split('.')[file.fileName.split('.').length - 1];
				const forwardFile = {
					mime: extensionToMime[extension.toLowerCase()],
					path: res.path(),
					name: file.fileName,
					sourceUrl: res.path()
				};
				return {
					forwardFile,
					rid: item.rid
				};
			})
			.then((data) => {
				const { forwardFile, rid } = data;
				uploadFile(forwardFile, user, rid)
					.then((res) => {
						if (res.success) {
							RocketChat.sendMessage(rid, `文件已上传：${ file.fileName }(${ res.content })`);
						}
					});
			});
	}

	renderItem = ({ item }) => {
		return (
			<View>
				<List.Item
					onPress={ () => {
						this.forwardFile(item);
					} }
				>
					<Text>{ item.name }</Text>
				</List.Item>
			</View>
		);
	};

	renderSection = (data, header) => {
		return (
			<FlatList
				data={ data }
				renderItem={ this.renderItem }
				keyExtractor={ item => item.rid }
				ListHeaderComponent={ () => (
					<View style={ styles.groupTitleContainer }>
						<Text style={ styles.groupTitle }>{ I18n.t(header) }</Text>
					</View>
				) }
			/>
		);
	};

	renderList = () => {
		const { chats, unread, favorites, channels, privateGroup, direct, livechat } = this.state;
		return (
			<ScrollView>
				{ this.renderSection(favorites, 'Favorites') }
				{ this.renderSection(direct, 'Direct_Messages') }
				{ this.renderSection(privateGroup, 'Private_Groups') }
				{ this.renderSection(livechat, 'Livechat') }
				{ this.renderSection(chats, 'Chats') }
			</ScrollView>
		);
	};

	renderScroll = () => {
		return (<ScrollView>
			{ this.renderList() }
		</ScrollView>);
	};

	render() {
		return (
			<View>
				{ this.renderScroll() }
			</View>
		);
	}
}

