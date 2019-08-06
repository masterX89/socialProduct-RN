/* eslint-disable */
import React from 'react';

// antd UI
import { Tabs, Provider } from '@ant-design/react-native';
import ProjectApplyTab from '../component/historyTasks/ProjectApplyTab';
import GraphApprovalTab from '../component/historyTasks/GraphApprovalTab';

export default class HistoryTasksTab extends React.PureComponent {

	render() {
		const tabs = [
			{ title: '立项审批' },
			{ title: '图纸审批' }
		];
		return (
			<Provider>
				<Tabs tabs={ tabs }>
					<ProjectApplyTab tab={ 'ProjectApplyTab' }/>
					<GraphApprovalTab tab={ 'GraphApprovalTab' }/>
				</Tabs>
			</Provider>
		);
	}
}
