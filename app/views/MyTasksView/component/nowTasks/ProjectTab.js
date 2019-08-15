import React from 'react';
import PropTypes from 'prop-types';
// react-native UI
import { View, Text, FlatList, StyleSheet, ScrollView, Dimensions } from 'react-native';
// antd UI
import { List, WingBlank, ActivityIndicator } from '@ant-design/react-native';
import { connect } from 'react-redux';
import moment from 'moment';

import Avatar from '../../../../containers/Avatar';
import FinishTaskModal from './FinishTaskModal';
import FlowPanel from '../../utils/FlowPanel';
import { taskTemplate } from '../../utils/MyTaskUtils';

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
export default class ProjectTab extends React.PureComponent {
	static propTypes = {
		user: PropTypes.object,
		projectApplyList: PropTypes.array,
		loading: PropTypes.bool
	};

	state = {
		projectTaskTemplate: taskTemplate.projectTaskTemplate
	};

	renderItem = ({ item }) => (
		<List.Item wrap>
			<WingBlank size='sm' style={ wingBlankTitleStyle }>
				<Avatar
					style={ styles.avatar }
					text={ this.props.user.avatar ? '' : this.props.user.username }
					size={ 20 }
					avatar={ this.props.user.avatar }
				/>
				<Text style={ { fontSize: 17 } }>{ item.metaName }/<Text style={ {
					color: '#00f'
				} }>{ item.activityName }</Text></Text>
			</WingBlank>
			<WingBlank size='sm' style={ wingBlankButtonStyle }>
				<Text style={ { color: '#808080' } }>{ moment(new Date(item.startTime))
					.format('YYYY-MM-DD HH:mm') }</Text>
				<FlowPanel
					processId={ item.processInstanceId }
					template={ this.state.projectTaskTemplate }/>
				<FinishTaskModal record={ item } { ...this.props }/>
			</WingBlank>
		</List.Item>
	);

	render() {
		const { projectApplyList, loading } = this.props;
		const emptyView = (
			<View style={ styles.Container }>
				<Text>暂无任务</Text>
			</View>
		);
		const loadingView = (
			<View style={ styles.Container }>
				<ActivityIndicator/>
			</View>
		);
		return (
			<ScrollView>
				{ loading ? (loadingView) : (
					(projectApplyList && projectApplyList.length) > 0 ? (<FlatList
						data={ projectApplyList }
						renderItem={ this.renderItem }
						keyExtractor={ (item, index) => item.id }
					/>) : (emptyView)
				) }
			</ScrollView>
		);
	}
}

