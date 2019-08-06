import React from 'react';
// antd UI
import { Tabs } from '@ant-design/react-native';
// component
import MyApplyTasksList from '../component/myApplyTasks/MyApplyTasksList';

export default class MyApplyTasksTab extends React.PureComponent {
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
