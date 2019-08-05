/* eslint-disable */
import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { FLOW_CORE_HOST } from '../../../../constants/Constants';
import moment from 'moment';

import _ from 'lodash';

// react-native UI
import { Text, ScrollView, FlatList, Dimensions } from 'react-native';
// antd UI
import { Button, List, WingBlank } from '@ant-design/react-native';
import Avatar from '../../../../containers/Avatar';
import styles from '../../../../containers/message/styles';

const wingBlankTitleStyle = {
	flexDirection: 'row',
	alignItems: 'center'
};
const wingBlankButtonStyle = {
	flexDirection: 'row',
	justifyContent: 'space-between',
	alignItems: 'center'
};

@connect(state => ({
	user: {
		name: state.login.user && state.login.user.name,
		username: state.login.user && state.login.user.username,
		token: state.login.user && state.login.user.token,
		id: state.login.user && state.login.user.id
	}
}))
export default class MyApplyTasksList extends React.PureComponent {
	static propTypes = {
		user: PropTypes.object,
		activeSection: PropTypes.string
	};

	constructor(props) {
		super(props);
		this.state = {
			pageSize: 10,
			offset: 1,
			nowTasks: [],
			loadingMore: true
		};
	}

	async getMockData(activeSection) {
		if (this.state.loadingMore) {
			// 获取当前activeSection的tasks
			let tasksUrl = `${ FLOW_CORE_HOST }/flow/projectApply/historyByAssigneeAndActivityNameListForCreator?assignee=${ this.props.user.name }(${ this.props.user.username })`;
			tasksUrl += `&activityNameListString=${ activeSection }`;
			tasksUrl += `&pageSize=${ this.state.pageSize }`;
			tasksUrl += `&pageNum=${ this.state.offset }`;
			const tasks = await fetch(tasksUrl, {
				method: 'GET',
				headers: {
					'Auth-Token': this.props.user.token,
					'Auth-uid': this.props.user.id
				}
			})
				.then(data => data.json())
				.then(data => {
					if (data.success) {
						if (data.content.length === 0) {
							this.setState({ loadingMore: false });
						}
						return data.content;
					} else {
						return [];
					}
				})
				.catch(err => console.log(err));
			//查询流程ID对应的辅助流程信息，如标题，说明等
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
			// 组合finalTasks
			const finalTasks = _.map(tasks, (item) => {
				const info = _.find(taskInfos, { processId: item.processInstanceId });
				return {
					...item,
					metaName: info.title,
					metaId: info.externalIds,
					metaMemo: info.memo
				};
			});
			this.setState({
				nowTasks: this.state.nowTasks.concat(finalTasks),
				offset: this.state.pageSize + this.state.offset
			});
		}
	}

	componentDidMount() {
		const { activeSection } = this.props;
		this.getMockData(activeSection)
			.catch(err => console.log(err));
	}

	render() {
		let { height } = Dimensions.get('window');
		const { nowTasks, loadingMore } = this.state;
		return (
			<ScrollView style={ (nowTasks.length > 0 ? ({
				height: height * 0.65
			}) : null) }>
				<FlatList
					data={ nowTasks }
					keyExtractor={ (item, index) => item.id }
					renderItem={ ({ item }) => (
						<List.Item wrap>
							<WingBlank style={ { ...wingBlankTitleStyle } }>
								<Avatar
									style={ styles.avatar }
									text={ this.props.user.avatar ? '' : this.props.user.username }
									size={ 20 }
									avatar={ this.props.user.avatar }
								/>
								<Text
									style={ { fontSize: 17 } }>{ item.metaName }/<Text style={ {
									color: '#00f'
								} }>{ item.activityName }</Text></Text>
							</WingBlank>
							<WingBlank style={ { ...wingBlankButtonStyle } }>
								<Text style={ { color: '#808080' } }>{ moment(new Date(item.endTime))
									.format('YYYY-MM-DD HH:mm') }</Text>
							</WingBlank>
						</List.Item>
					) }
				/>
				<Button
					disabled={ !loadingMore }
					onPress={ () => {
						this.getMockData(this.props.activeSection)
							.catch(err => console.log(err));
					} }>{ loadingMore ? '加载更多' : '加载完成' }</Button>
			</ScrollView>
		);
	}
}
