/* eslint-disable */
import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

// component
import MyApplyTasksList from '../component/myApplyTasks/MyApplyTasksList';

// antd UI
import { Tabs } from '@ant-design/react-native';
import ProjectApplyList from '../component/historyTasks/ProjectApplyList';

@connect(state => ({
	user: {
		name: state.login.user && state.login.user.name,
		username: state.login.user && state.login.user.username,
		token: state.login.user && state.login.user.token,
		id: state.login.user && state.login.user.id
	}
}))
export default class MyApplyTasksTab extends React.PureComponent {
	static propTypes = {
		user: PropTypes.object
	};

	render() {
		const tabs = [
			{ title: '立项审批' },
			{ title: '图纸审批' }
		];
		return (
			<Tabs tabs={ tabs }>
				<MyApplyTasksList activeSection={ '项目申请_创建人' }/>
				<MyApplyTasksList activeSection={ '图纸审批申请_创建人' }/>
			</Tabs>
		);
	}
}
