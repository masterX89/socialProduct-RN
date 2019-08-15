/* eslint-disable */
import React from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
import _ from 'lodash';
import PropTypes from 'prop-types';
// react-native UI
import { Text, ScrollView, FlatList, Dimensions, View } from 'react-native';
// antd UI
import { ActivityIndicator, Button, List, WingBlank } from '@ant-design/react-native';
import { FLOW_CORE_HOST } from '../../../../constants/Constants';


import Avatar from '../../../../containers/Avatar';
import styles from '../../../../containers/message/styles';
import { getFinalTasks } from '../../utils/MyTaskUtils';

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
			loadingMore: true,
			loading: true
		};
	}

	componentDidMount() {
		const { activeSection } = this.props;
		this.getMockData(activeSection)
			.catch(err => console.log(err));
	}

	getMockData = async(activeSection) => {
		const { user } = this.props;
		const { pageSize, offset, loadingMore, nowTasks } = this.state;
		if (loadingMore) {
			// 获取当前activeSection的tasks
			let url = `${ FLOW_CORE_HOST }/flow/projectApply/historyByAssigneeAndActivityNameListForCreator?assignee=${ user.name }(${ user.username })`;
			url += `&activityNameListString=${ activeSection }`;
			url += `&pageSize=${ pageSize }`;
			url += `&pageNum=${ offset }`;
			const { finalTasks, loadingMore } = await getFinalTasks(url, user);
			this.setState({
				nowTasks: nowTasks.concat(finalTasks),
				offset: pageSize + offset,
				loading: false,
				loadingMore
			});
		}
	};

	render() {
		const { height } = Dimensions.get('window');
		const { nowTasks, loadingMore, loading } = this.state;
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
								{ item.flowStatus === '已拒绝' ? (<Text style={ {
									color: '#f00'
								} }>{ item.flowStatus }</Text>) : (<Text style={ {
									color: '#3E8EE1'
								} }>{ item.flowStatus }</Text>) }

							</WingBlank>
						</List.Item>
					) }
				/>
				{ loading && <ActivityIndicator/> }
				<Button
					disabled={ !loadingMore }
					onPress={ () => {
						this.setState({ loading: true }, () => {
							this.getMockData(this.props.activeSection)
								.catch(err => console.log(err));
						});
					} }>{ loadingMore ? '加载更多' : '暂无更多任务' }</Button>
			</ScrollView>
		);
	}
}
