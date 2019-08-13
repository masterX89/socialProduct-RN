import React from 'react';
import PropTypes from 'prop-types';
import { Dimensions } from 'react-native';
import { TabBar, Icon } from '@ant-design/react-native';
import LoggedView from '../View';
// pages
import HistoryTasksTab from './pages/HistoryTasksTab';
import MyApplyTasksTab from './pages/MyApplyTasksTab';
import TasksTab from './pages/TasksTab';

/** @extends React.Component */
export default class MyTasksView extends LoggedView {
	static propTypes = {
		navigator: PropTypes.object
	};

	constructor(props) {
		super('MyTasksView', props);
		this.state = {
			selectedTab: 'tasksTab'
		};
		props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
	}

	componentWillMount() {
		this.props.navigator.setButtons({
			leftButtons: [{
				id: 'settings',
				icon: {
					uri: 'settings',
					scale: Dimensions.get('window').scale
				}
			}]
		});
	}

	componentDidMount() {
		this.props.navigator.setDrawerEnabled({
			side: 'left',
			enabled: true
		});
	}

	onNavigatorEvent(event) {
		if (event.type === 'NavBarButtonPress') {
			if (event.id === 'settings') {
				this.props.navigator.toggleDrawer({
					side: 'left'
				});
			}
		}
	}

	onChangeTab(tabName: any) {
		this.setState({
			selectedTab: tabName
		});
	}

	static renderContent(pageText: any) {
		if (pageText === 'tasksTab') {
			return (<TasksTab/>);
		} else if (pageText === 'historyTab') {
			return (
				<HistoryTasksTab/>
			);
		} else if (pageText === 'myApplyTab') {
			return (
				<MyApplyTasksTab/>
			);
		}
	}

	render() {
		const { selectedTab } = this.state;
		return (
			<TabBar
				unselectedTintColor='#949494'
				tintColor='#33A3F4'
				barTintColor='#f5f5f5'
			>
				<TabBar.Item
					title='待办任务'
					icon={ <Icon name='clock-circle'/> }
					selected={ selectedTab === 'tasksTab' }
					onPress={ () => this.onChangeTab('tasksTab') }
				>
					{ MyTasksView.renderContent('tasksTab') }
				</TabBar.Item>
				<TabBar.Item
					icon={ <Icon name='appstore'/> }
					title='已完成任务'
					selected={ selectedTab === 'historyTab' }
					onPress={ () => this.onChangeTab('historyTab') }
				>
					{ MyTasksView.renderContent('historyTab') }
				</TabBar.Item>
				<TabBar.Item
					icon={ <Icon name='flag'/> }
					title='已发起流程'
					selected={ selectedTab === 'myApplyTab' }
					onPress={ () => this.onChangeTab('myApplyTab') }
				>
					{ MyTasksView.renderContent('myApplyTab') }
				</TabBar.Item>
			</TabBar>
		);
	}
}
