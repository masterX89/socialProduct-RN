import React from 'react';
import PropTypes from 'prop-types';
// react-native UI
import { Dimensions, View } from 'react-native';
// antd UI
import { Modal, Button, Toast } from '@ant-design/react-native';
import ForwardRoomsListView from './ForwardRoomsListView';

const { height } = Dimensions.get('window');

export default class FileForward extends React.PureComponent {
	static propTypes = {
		file: PropTypes.object
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

	loadingToast = () => {
		Toast.loading('群聊加载中', 2, this.handleOpen);
	};

	render() {
		const { show } = this.state;
		const { file } = this.props;
		return (
			<View>
				<Button size='small' type='ghost'
				        onPress={ () => {
					        this.loadingToast();
				        } }>转发</Button>
				<Modal
					transparent={ false }
					visible={ show }
					animationType="slide-up"
					onClose={ this.handleClose }
					style={ { height: height * 0.81 } }
				>
					<View>
						<ForwardRoomsListView file={ file } handleClose={ () => {
							this.handleClose();
						} }/>
					</View>
					<Button type="primary" onPress={ this.handleClose }>
						关闭
					</Button>
				</Modal>
			</View>
		);
	}
}

