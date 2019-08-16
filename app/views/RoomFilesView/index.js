/* eslint-disable */
import React from 'react';
import PropTypes from 'prop-types';
import { FlatList, View, Text } from 'react-native';
import { connect } from 'react-redux';

// antd UI
import { Provider, ActivityIndicator } from '@ant-design/react-native';

import { loadFiles } from '../../lib/methods/FileUtils';
import FileItem from './Component/FileItem';

import LoggedView from '../View';
import { openRoomFiles, closeRoomFiles } from '../../actions/roomFiles';
import styles from './styles';
import I18n from '../../i18n';

@connect(state => ({
	messages: state.roomFiles.messages,
	ready: state.roomFiles.ready,
	user: {
		id: state.login.user && state.login.user.id,
		username: state.login.user && state.login.user.username,
		token: state.login.user && state.login.user.token
	}
}), dispatch => ({
	openRoomFiles: (rid, limit) => dispatch(openRoomFiles(rid, limit)),
	closeRoomFiles: () => dispatch(closeRoomFiles())
}))
/** @extends React.Component */
export default class RoomFilesView extends LoggedView {
	static propTypes = {
		rid: PropTypes.string,
		user: PropTypes.object,
		closeRoomFiles: PropTypes.func
	};

	constructor(props) {
		super('RoomFilesView', props);
		this.state = {
			loading: true,
			files: []
		};
	}

	componentDidMount() {
		this.load();
	}

	componentWillUnmount() {
		this.props.closeRoomFiles();
	}

	load = () => {
		console.log(this.props.rid);
		loadFiles(this.props.user, this.props.rid)
			.then((files) => {
				this.setState({
					files,
					loading: false
				});
			});
	};

	afterFileDelete = (fileId) => {
		const index = this.state.files.findIndex((file) => file.fileId === fileId);
		this.state.files.splice(index, 1);
		this.setState({ files: this.state.files });
	};

	renderItem = ({ item }) => (
		<FileItem file={ item } afterFileDelete={ (fileId) => this.afterFileDelete(fileId) }/>
	);


	render() {
		const { loading, files } = this.state;

		const emptyView = (
			<View style={ styles.listEmptyContainer } testID='room-files-view'>
				<Text>{ I18n.t('No_files') }</Text>
			</View>
		);

		const loadingView = (
			<View style={ { top: '40%' } }>
				<ActivityIndicator/>
			</View>
		);
		return (
			<Provider>
				{ loading ? (loadingView) : (
					(files && files.length > 0) ? (
						<FlatList
							data={ files }
							renderItem={ this.renderItem }
							style={ styles.list }
							keyExtractor={ item => item.fileId }
						/>
					) : (
						emptyView
					)
				) }
			</Provider>
		);
	}
}
