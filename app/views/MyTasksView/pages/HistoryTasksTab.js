/* eslint-disable */
import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

// antd UI
import { Tabs, Provider } from '@ant-design/react-native';
import ProjectApplyTab from '../component/historyTasks/ProjectApplyTab';
import GraphApprovalTab from '../component/historyTasks/GraphApprovalTab';

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
		return (
			<Provider>
				<Tabs tabs={ tabs }>
					<ProjectApplyTab tab={'ProjectApplyTab'}/>
					<GraphApprovalTab tab={'GraphApprovalTab'}/>
				</Tabs>
			</Provider>
		);
	}
}
