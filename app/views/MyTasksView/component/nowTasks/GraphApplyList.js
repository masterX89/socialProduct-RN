import React from 'react';
import { Text, ScrollView, FlatList, Dimensions, View, StyleSheet } from 'react-native';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import moment from 'moment';
// antd UI
import { List, WingBlank } from '@ant-design/react-native';
import Avatar from '../../../../containers/Avatar';
import GraphModal from './GraphModal';
import FlowPanel from '../../utils/FlowPanel';

const wingBlankTitleStyle = {
	flexDirection: 'row',
	alignItems: 'center'
};
const wingBlankButtonStyle = {
	flexDirection: 'row',
	justifyContent: 'space-between',
	alignItems: 'center'
};
const { height } = Dimensions.get('window');
const styles = StyleSheet.create({
	Container: {
		alignItems: 'center',
		justifyContent: 'center',
		height: height * 0.65
	}
});

@connect(state => ({
	user: {
		name: state.login.user && state.login.user.name,
		username: state.login.user && state.login.user.username,
		token: state.login.user && state.login.user.token,
		id: state.login.user && state.login.user.id
	}
}))
export default class GraphApplyList extends React.PureComponent {
	static propTypes = {
		user: PropTypes.object,
		nowTasks: PropTypes.array
	};

	state = {
		graphTaskTemplate: [{
			activityName: '图纸申请审批'
		}, {
			activityName: '设计'
		}, {
			activityName: '校对'
		}, {
			activityName: '专业负责人'
		}, {
			activityName: '会签'
		}, {
			activityName: '审核'
		}, {
			activityName: '审定'
		}, {
			activityName: '设总'
		}, {
			activityName: '项目经理'
		}, {
			activityName: '档案审批人'
		}, {
			activityName: '结束'
		}]
	};

	renderItem = ({ item }) => (
		<List.Item>
			<WingBlank style={ { ...wingBlankTitleStyle } }>
				<Avatar
					style={ styles.avatar }
					text={ this.props.user.avatar ? '' : this.props.user.username }
					size={ 20 }
					avatar={ this.props.user.avatar }
				/>
				<Text style={ { fontSize: 17 } }>{ item.title }/<Text style={ {
					color: '#00f'
				} }>{ item.activityName }</Text></Text>
			</WingBlank>
			<WingBlank style={ { ...wingBlankButtonStyle } }>
				<Text style={ { color: '#808080' } }>{ moment(new Date(item.startTime))
					.format('YYYY-MM-DD HH:mm') }</Text>
				<FlowPanel
					processId={ item.processInstanceId }
					template={ this.state.graphTaskTemplate }/>
				<GraphModal record={ item } { ...this.props }/>
			</WingBlank>
		</List.Item>
	);

	render() {
		const { nowTasks } = this.props;
		if (nowTasks.length === 0) {
			return (
				<View style={ styles.Container }>
					<Text>暂无任务</Text>
				</View>);
		}
		return (
			<ScrollView style={ (nowTasks.length > 0 ? ({
				height: height * 0.65
			}) : null) }>
				<FlatList
					data={ nowTasks }
					keyExtractor={ (item, index) => item.id }
					renderItem={ this.renderItem }
				/>
			</ScrollView>
		);
	}
}
