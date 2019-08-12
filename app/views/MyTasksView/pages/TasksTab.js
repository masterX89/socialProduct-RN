import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import _ from 'lodash';

import { Text, View, FlatList, Dimensions } from 'react-native';

// antd UI
import { Tabs, Provider, Badge } from '@ant-design/react-native';
import ProjectTab from '../component/nowTasks/ProjectTab';
import GraphApplyTab from '../component/nowTasks/GraphApplyTab';
import { FLOW_CORE_HOST } from '../../../constants/Constants';

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
		// 获取当前activeSection的tasks
		const tasksUrl = `${ FLOW_CORE_HOST }/flow/projectApply/tasks?assignee=${ this.props.user.name }(${ this.props.user.username })`;
		const tasks = await fetch(tasksUrl, {
			method: 'GET',
			headers: {
				'Auth-Token': this.props.user.token,
				'Auth-uid': this.props.user.id
			}
		})
			.then(data => data.json())
			.then((data) => {
				if (data.success) {
					return data.content;
				}
				return [];
			})
			.catch(err => console.log(err));

		// 查询流程ID对应的辅助流程信息，如标题，说明等
		let url = `${ FLOW_CORE_HOST }/projectAndProcess/getHistoryByFlowIds?`;
		_.each(tasks, (one) => {
			url += `flowIds%5B%5D=${ one.processInstanceId }&`;
		});
		url = url.slice(0, url.length - 1);
		const taskInfos = await fetch(url, {
			method: 'GET',
			headers: {
				'Auth-Token': this.props.user.token,
				'Auth-uid': this.props.user.id
			}
		})
			.then(data => data.json())
			.then((data) => {
				if (data.success) {
					return data.content;
				}
				return [];
			})
			.catch(err => console.log(err));

		const promises = [];
		// 组合finalTasks
		const finalTasks = [];
		_.each(tasks, (item) => {
			const info = _.find(taskInfos, { processId: item.processInstanceId });
			const type = item.processDefinitionId.split(':')[0];
			// 获取title
			const promise = fetch(`${ FLOW_CORE_HOST }/projectAndProcess/getByProcessId?processId=${ item.processInstanceId }`, {
				method: 'GET',
				headers: {
					'Auth-Token': this.props.user.token,
					'Auth-uid': this.props.user.id
				}
			})
				.then(data => data.json())
				.then((data) => {
					let title = 'title';
					if (data.success) {
						title = data.content.title;
					}
					finalTasks.push({
						...item,
						metaName: info.title,
						metaId: info.externalIds,
						metaMemo: info.memo,
						uri: _.isEmpty(type) ? '/_none/' : `/${ type }/`,
						title
					});
				});
			promises.push(promise);
		});

		Promise.all(promises)
			.then(() => {
				const taskGroupList = _.groupBy(finalTasks, 'uri');
				const projectApplyList = taskGroupList['/projectApply/'];
				const graphApplyList = _.groupBy(taskGroupList['/graphApply/'], 'activityName');
				this.setState({
					projectApplyList,
					graphApplyList,
					loading: false
				});
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
					<GraphApplyTab graphApplyList={ graphApplyList }/>
				</Tabs>
			</Provider>

		);
	}
}
