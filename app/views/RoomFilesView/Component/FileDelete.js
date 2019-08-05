/* eslint-disable */
import React from 'react';
import PropTypes from 'prop-types';
// react-native UI
import { Text, View } from 'react-native';
// antd UI
import { Modal, Button, Icon } from '@ant-design/react-native';
import { connect } from 'react-redux';
import { deleteFile } from '../../../lib/methods/FileUtils';

const textStyle = {
	textAlign: 'center'
};

@connect(state => ({
	user: {
		id: state.login.user && state.login.user.id,
		username: state.login.user && state.login.user.username,
		token: state.login.user && state.login.user.token
	}
}))
export default class FileDelete extends React.PureComponent {
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
		const { fileId } = this.props;
		const footerButtons = [
			{
				text: '取消删除'
			},
			{
				text: '确定删除',
				onPress: () => {
					deleteFile(fileId, this.props.user)
						.then(res => {
							if (res.success) {
								this.props.afterFileDelete(res.fileId);
							}
						});
				}
			}
		];
		return (
			<View>
				<Button size='small' type='warning' onPress={ this.handleOpen }>删除</Button>
				<Modal
					title="确定删除么？"
					transparent
					onClose={ this.handleClose }
					maskClosable
					visible={ this.state.show }
					closable
					footer={ footerButtons }
				>
					<View style={ {
						paddingVertical: 10,
						textAlign: 'center'
					} }>
						<Icon name='warning' size='lg' color='#ffd21f' style={ textStyle }/>
						<Text style={ {
							...textStyle,
							marginTop: 20
						} }>你将无法恢复它</Text>
					</View>
				</Modal>
			</View>
		);
	}
}

FileDelete.propTypes = {
	fileId: PropTypes.string.isRequired,
	user: PropTypes.object
};

