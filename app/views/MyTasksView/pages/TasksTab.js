import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { Text } from 'react-native';
// antd UI
import { Tabs, Provider, Badge } from '@ant-design/react-native';
import ProjectTab from '../component/nowTasks/ProjectTab';
import GraphApplyTab from '../component/nowTasks/GraphApplyTab';
import { FLOW_CORE_HOST } from '../../../constants/Constants';
import { getFinalTasks } from '../utils/MyTaskUtils';

@connect(state => ({
	user: {
		name: state.login.user && state.login.user.name,
		username: state.login.user && state.login.user.username,
		token: state.login.user && state.login.user.token,
		id: state.login.user && state.login.user.id
	}
}))
export default class TasksTab extends React.PureComponent {
	static propTypes = {
		user: PropTypes.object
	};
	state = {
		projectApplyList: [],
		graphApplyList: {},
		loading: true
	};

	componentDidMount() {
		this.getMockData()
			.catch(err => console.log(err));
	}

	async getMockData() {
		const { user } = this.props;
		const url = `${ FLOW_CORE_HOST }/flow/projectApply/tasks?assignee=${ user.name }(${ user.username })`;
		const { finalTasks } = await getFinalTasks(url, user);
		const taskGroupList = _.groupBy(finalTasks, 'uri');
		const projectApplyList = taskGroupList['/projectApply/'];
		const graphApplyList = _.groupBy(taskGroupList['/graphApply/'], 'activityName');
		this.setState({
			projectApplyList,
			graphApplyList,
			loading: false
		});
	}

	render() {
		const tabs = [
			{ title: '立项审批' },
			{ title: '图纸审批' }
		];
		const { projectApplyList, graphApplyList, loading } = this.state;
		let graphApplyListLength = 0;
		if (graphApplyList) {
			graphApplyListLength = _.reduce(Object.keys(graphApplyList), (sum, key) => {
				return sum + graphApplyList[key].length;
			}, 0);
		}
		return (
			<Provider>
				<Tabs tabs={ tabs } renderTab={ (tab) =>
					tab.title === '立项审批' ?
						(<Badge text={ projectApplyList && projectApplyList.length }>
							<Text style={ { fontSize: 15 } }>{ tab.title }</Text>
						</Badge>) :
						(<Badge text={ graphApplyListLength }>
							<Text style={ { fontSize: 15 } }>{ tab.title }</Text>
						</Badge>)
				}>
					<ProjectTab projectApplyList={ projectApplyList } getMockData={ () => {
						this.getMockData()
							.catch(err => console.log(err));
					} } loading={ loading }/>
					<GraphApplyTab graphApplyList={ graphApplyList } getMockData={ () => {
						this.getMockData()
							.catch(err => console.log(err));
					} }/>
				</Tabs>
			</Provider>

		);
	}
}
