import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import _ from 'lodash';
// react-native UI
import { Text, View, FlatList, Dimensions, StyleSheet } from 'react-native';
// antd UI
import { Modal, Button, WingBlank, List, Checkbox, Toast, ActivityIndicator } from '@ant-design/react-native';

import { FLOW_CORE_HOST } from '../../../constants/Constants';

const { height } = Dimensions.get('window');
const styles = StyleSheet.create({
	Container: {
		alignItems: 'center',
		justifyContent: 'center',
		height: height * 0.415
	}
});
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
export default class GraphModal extends React.PureComponent {
	static propTypes = {
		user: PropTypes.object,
		record: PropTypes.object,
		getMockData: PropTypes.func,
		initialActiveSections: PropTypes.func
	};

	constructor(props) {
		super(props);
		this.state = {
			showGraphModel: false,
			mockData: [],
			rejectIds: [],
			loading: true,
			getDataSuccess: false
		};
	}

	// 防止内存泄漏
	componentWillUnmount() {
		this.setState = (state, callback) => {
			return;
		};
	}

	getMock() {
		const { record: { processInstanceId: processId } } = this.props;
		const mockData = [];
		fetch(`${ FLOW_CORE_HOST }/flow/graphApply/queryApprovingGraph?processId=${ processId }`, {
			method: 'GET',
			headers: {
				'Auth-Token': this.props.user.token,
				'Auth-uid': this.props.user.id
			}
		})
			.then(data => data.json())
			.then((data) => {
				if (data.success) {
					for (let i = 0; i < data.content.length; i++) {
						const data2 = {
							key: data.content[i].id,
							title: data.content[i].name
						};
						mockData.push(data2);
					}
					const rejectIds = _.map(mockData, item => item.key);
					this.setState({
						mockData,
						rejectIds,
						loading: false,
						getDataSuccess: true
					});
				} else {
					this.setState({
						loading: false,
						getDataSuccess: false
					});
				}
			})
			.catch(err => console.log(err));
	}

	showModal = () => {
		this.setState({
			showGraphModel: true
		}, () => {
			this.getMock();
		});
	};

	cancelModal() {
		this.setState({
			showGraphModel: false
		});
	}

	changeRejectIds(event, item) {
		const { rejectIds } = this.state;
		if (event.target.checked) {
			_.remove(rejectIds, one => one === item.key);
		} else {
			rejectIds.push(item.key);
		}
		this.setState({
			rejectIds
		});
	}

	confirmGraphModal() {
		const values = {};
		if (this.state.rejectIds.length > 0) {
			values.rejectIds = this.state.rejectIds.join(',');
		} else {
			values.rejectIds = '-1';
		}
		values.processId = this.props.record.processInstanceId;
		values.taskId = this.props.record.taskId;
		fetch(`${ FLOW_CORE_HOST }/flow/graphApply/queryApprovingGraph?processId=${ this.props.record.processInstanceId }`, {
			method: 'GET',
			headers: {
				'Auth-Token': this.props.user.token,
				'Auth-uid': this.props.user.id
			}
		})
			.then(data => data.json())
			.then((data) => {
				if (data.success) {
					const temp = [];
					for (let i = 0; i < data.content.length; i++) {
						temp.push(data.content[i]);
					}
					values.approved = values.rejectIds !== temp.join(',');
				}
				values.memo = '同意';
				let valuesInPost = '';
				_.each(_.keys(values), (one) => {
					valuesInPost += `${ one }=${ values[one] }&`;
				});
				valuesInPost = valuesInPost.slice(0, valuesInPost.length - 1);
				fetch(`${ FLOW_CORE_HOST }/flow/graphApply/personalApproveComplete`, {
					method: 'POST',
					headers: {
						'Auth-Token': this.props.user.token,
						'Auth-uid': this.props.user.id,
						'Content-Type': 'application/x-www-form-urlencoded'
					},
					body: valuesInPost
				})
					.then(data2 => data2.json())
					.then((data2) => {
						if (data2.success) {
							Toast.success('审批成功', 1);
							this.props.getMockData();
						} else {
							this.props.getMockData();
							Toast.fail('网络错误');
						}
					});
				this.props.initialActiveSections();
				this.setState({
					showGraphModel: false
				});
			});
	}

	render() {
		const { loading, showGraphModel, mockData, getDataSuccess } = this.state;
		return (
			<View>
				<Button type='ghost' size='small' onPress={ this.showModal }>
					<Text style={ { fontSize: 17 } }>审批</Text>
				</Button>
				<Modal
					popup
					visible={ showGraphModel }
					animationType='slide-up'
					onClose={ this.cancelModal.bind(this) }
				>

					<View style={ { height: height * 0.5 } }>
						{ !loading ? (getDataSuccess ? (<FlatList
							keyExtractor={ (item, index) => item.key }
							data={ mockData }
							renderItem={ ({ item }) => (
								<List.Item>
									<Checkbox.CheckboxItem
										onChange={ (event) => {
											this.changeRejectIds(event, item);
										} }
									>
										<Text style={ { fontSize: 17 } }>{ item.title }</Text>
									</Checkbox.CheckboxItem>
									<Button>预览</Button>
								</List.Item>
							) }
						/>) : (<View style={ styles.Container }>
							<Text>获取图纸数据失败，请重试</Text>
						</View>)) : (
							<View style={ styles.Container }>
								<ActivityIndicator/>
							</View>
						) }
						<WingBlank
							size='sm'
							style={ { ...wingBlankButtonStyle } }
						>
							<Button type='ghost' onPress={ this.cancelModal.bind(this) }>
								取消
							</Button>
							<Button type='ghost' disabled={ !getDataSuccess } onPress={ () => {
								this.confirmGraphModal();
							} }>
								审批
							</Button>
						</WingBlank>
					</View>
				</Modal>
			</View>
		);
	}
}
