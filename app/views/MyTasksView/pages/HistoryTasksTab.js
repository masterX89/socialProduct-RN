/* eslint-disable */
import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

// react-native UI
import { Text, View } from 'react-native';
// antd UI
import { Tabs } from '@ant-design/react-native';
import ProjectApplyTab from '../component/ProjectApplyTab';

@connect(state => ({
	user: {
		name: state.login.user && state.login.user.name,
		username: state.login.user && state.login.user.username,
		token: state.login.user && state.login.user.token,
		id: state.login.user && state.login.user.id
	}
}))
export default class HistoryTasksTab extends React.PureComponent {
	static propTypes = {
		user: PropTypes.object
	};

	render() {
		const tabs = [
			{ title: '立项审批' },
			{ title: '图纸审批' }
		];
		const style = {
			alignItems: 'center',
			justifyContent: 'center',
			height: 150,
			backgroundColor: '#fff'
		};
		return (
			<Tabs tabs={ tabs }>
				<ProjectApplyTab/>
				<View style={ style }>
					<Text>Content of Second Tab</Text>
				</View>
			</Tabs>
		);
	}
}
