/* eslint-disable */
import React from 'react';

// react-native UI
import { Text, View } from 'react-native';
// antd UI
import { List, Modal, Button, WingBlank } from '@ant-design/react-native';

const wingBlankButtonStyle = {
	flexDirection: 'row',
	justifyContent: 'space-between',
	alignItems: 'center'
};

export default class FileItem extends React.PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			show: false
		};
	}

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
						<Button size='small' type='ghost' disabled={ file.fileName.endsWith('jpeg') }>预览</Button>
						<Button size='small' type='ghost'>删除</Button>
					</WingBlank>

				</List.Item>
				<Modal
					popup
					visible={ this.state.show }
					animationType="slide-up"
				>
				</Modal>
			</View>
		);
	}
}

