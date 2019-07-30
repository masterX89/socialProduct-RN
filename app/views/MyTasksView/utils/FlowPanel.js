/* eslint-disable */
import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { FLOW_CORE_HOST } from '../../../constants/Constants';
import _ from 'lodash';
import moment from 'moment';

// react-native UI
import { Text, View, ScrollView } from 'react-native';
// antd UI
import { Modal, Button, WingBlank, Steps, Icon } from '@ant-design/react-native';
// rocketChat
import styles from '../../../containers/message/styles';
import Avatar from '../../../containers/Avatar';

const Step = Steps.Step;

const memoStyle = {
	color: '#808080'
};
const passStyle = {
	color: '#3E8EE2'
};
const errorStyle = {
	color: '#ff0000'
};
const memoTitleStyle = {
	fontWeight: 'bold'
};
const wingBlankStyle = {
	flexDirection: 'row'
};

@connect(state => ({
	user: {
		name: state.login.user && state.login.user.name,
		username: state.login.user && state.login.user.username,
		token: state.login.user && state.login.user.token,
		id: state.login.user && state.login.user.id
	}
}))
export default class FlowPanel extends React.PureComponent {
	static propTypes = {
		user: PropTypes.object
	};

	constructor(props) {
		super(props);
		this.state = {
			show: false,
			tasks: {},
			children: null,
			currentStep: 0
		};
	}

	componentDidMount() {
	}

	cancelModal() {
		this.setState({
			show: false
		});
	}

	async resetTaskList() {
		const { template } = this.props;
		console.log('this.props.processId', this.props.processId);
		const tasks = await fetch(`${ FLOW_CORE_HOST }/flow/projectApply/historyByProcessId?processId=${ this.props.processId }`, {
			method: 'GET',
			headers: {
				'Auth-Token': this.props.user.token,
				'Auth-uid': this.props.user.id
			}
		})
			.then(data => data.json())
			.then(data => {
				console.log('data:', data);
				if (data.success) {
					return _.map(template, (item) => {
						const ct = _.find(data.content, { activityName: item.activityName });
						return (_.isEmpty(ct) ? ({
							..._.clone(item),
							vars: {}
						}) : (_.clone(ct)));
					});
				}
			})
			.catch(err => console.log(err));
		return tasks;
	}

	setSteps(tasks) {
		console.log('tasks:', tasks);
		let currentStep = 1;
		const children = _.map(tasks, (item, index) => {
			// 转换时间
			const startTime = item.startTime !== undefined ? moment(new Date(item.startTime))
				.format('YYYY-MM-DD HH:mm') : '';
			const endTime = item.endTime !== undefined ? moment(new Date(item.endTime))
				.format('YYYY-MM-DD HH:mm') : '';

			if (item.endTime != null && item.vars['approved'] !== false) {
				currentStep++;
			}

			let memo = [];
			if (item.activityType === 'startEvent' || item.activityType === 'endEvent') {
				memo.push(<WingBlank size='sm'><Text style={ memoStyle }><Text
					style={ memoTitleStyle }>开始时间: </Text>{ startTime }</Text></WingBlank>);
				memo.push(<WingBlank size='sm'><Text style={ memoStyle }><Text
					style={ memoTitleStyle }>审批时间: </Text>{ endTime }</Text></WingBlank>);
			}
			if (item.activityType === 'userTask') {
				const username = item.assignee.match(/\(([^)]*)\)/) ? (item.assignee.match(/\(([^)]*)\)/)[1]) : (item.assignee);
				memo.push(<WingBlank style={ wingBlankStyle } size='sm'>
					<Text style={ { ...memoTitleStyle, ...memoStyle } }>审批人: </Text>
					<Avatar
						style={ styles.avatar }
						text={ this.props.user.avatar ? '' : username }
						size={ 20 }
					/>
					<Text style={ passStyle }>{ item.assignee }</Text>
				</WingBlank>);
				memo.push(<WingBlank size='sm'><Text style={ memoStyle }><Text
					style={ memoTitleStyle }>审批结果:</Text>
					{ item.vars.approved !== undefined ? (
						item.vars.approved ? (<Text style={ passStyle }>通过</Text>) : (
							<Text style={ errorStyle }>拒绝</Text>)
					) : '' }
				</Text></WingBlank>);
				memo.push(<WingBlank size='sm'><Text style={ memoStyle }><Text
					style={ memoTitleStyle }>审批时间: </Text>{ endTime }</Text></WingBlank>);
			}

			const description = (<View>
				{ memo }
			</View>);
			return (<Step key={ index } title={ item.activityName }
			              description={ description }
			/>);
		});
		this.setState({
			children,
			currentStep
		});
	}

	showModal() {
		this.resetTaskList()
			.then(data => {
				this.setSteps(data);
			})
			.catch(err => console.log(err));

		this.setState({
			show: true
		});
	}

	render() {
		return (
			<View>
				<Button type='ghost' size='small' onPress={ this.showModal.bind(this) }>
					<Text style={ { fontSize: 17 } }>查看</Text>
				</Button>
				<Modal
					popup={ this.props.template.length <= 7 }
					visible={ this.state.show }
					animationType='slide-up'
					onClose={ this.cancelModal.bind(this) }
				>
					<ScrollView style={ {
						marginTop: 20
					} }>
						<WingBlank size="lg">
							<Steps current={ this.state.currentStep }>
								{ this.state.children }
							</Steps>
							<Button type='ghost' onPress={ this.cancelModal.bind(this) }>
								关闭
							</Button>
						</WingBlank>
					</ScrollView>

				</Modal>
			</View>
		);
	}
}
