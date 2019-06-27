import React from 'react';
import PropTypes from 'prop-types';
import { ScrollView, View, Keyboard, Dimensions, Text, FlatList, WebView } from 'react-native';
import { connect } from 'react-redux';
import SHA256 from 'js-sha256';
import _ from 'lodash';

import { Button, Provider, List, Accordion, Tabs, TabBar, Icon, WingBlank, Picker, Toast, Modal, Checkbox } from '@ant-design/react-native';
import LoggedView from '../View';
import { showErrorAlert, showToast } from '../../utils/info';
import RocketChat from '../../lib/rocketchat';
import log from '../../utils/log';
import I18n from '../../i18n';
import Avatar from '../../containers/Avatar';
import styles from '../../containers/message/styles';
import {TEAM_CORE_HOST, FLOW_CORE_HOST, PDFTRON_HOST} from '../Constants/Constants';

const district = [{ value: '同意', label: '同意' }, { value: '拒绝', label: '拒绝' }];

@connect(state => ({
	user: {
		name: state.login.user && state.login.user.name,
		username: state.login.user && state.login.user.username,
		customFields: state.login.user && state.login.user.customFields,
		emails: state.login.user && state.login.user.emails,
		token: state.login.user && state.login.user.token,
		id: state.login.user && state.login.user.id
	},
	Accounts_CustomFields: state.settings.Accounts_CustomFields
}))
/** @extends React.Component */
export default class MyTasksView extends LoggedView {
	static propTypes = {
		navigator: PropTypes.object,
		user: PropTypes.object,
		Accounts_CustomFields: PropTypes.string
	};

	constructor(props) {
		super('MyTasksView', props);
		this.state = {
			showPasswordAlert: false,
			saving: false,
			name: null,
			username: null,
			email: null,
			newPassword: null,
			typedPassword: null,
			avatarUrl: null,
			avatar: {},
			avatarSuggestions: {},
			customFields: {},
			activeSections: [],
			selectedTab: 'tasksTab',
			projectTypes: {
				projectApply: `${ TEAM_CORE_HOST }/projectApply/getProjectsByFlowIds`,
				graphApply: ''
			},
			flowList: [],
			projectApplyList: [],
			graphApplyList: [],
			designerList: [], // 设计
			proofreaderList: [], // 校对
			majorPrincipalList: [], // 专业负责人
			counterList: [], // 会签人
			checkerList: [], // 审核
			deciderList: [], // 审定
			chiefDesignerList: [], // 设总
			projectManagerList: [], // 项目经理
			archiveApproverList: [], // 档案审批人
			pageSize: 10,
			pageNum: 1,
			pickerValue: [],
			currentTask: {},
			processId: '',
			showGraphModel: false,
			mockData: [],
			checkboxItem1: true,
			rejectIds: [],
			showGraphPreview: false
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

	async componentDidMount() {
		this.init();

		this.props.navigator.setDrawerEnabled({
			side: 'left',
			enabled: true
		});
		try {
			this.listQuery()
				.catch((e) => {
					console.log('error:', e);
				});
		} catch (e) {
			log('getAvatarSuggestion', e);
		}
	}

	componentWillReceiveProps(nextProps) {
		if (this.props.user !== nextProps.user) {
			this.init(nextProps.user);
		}
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

	setAvatar = (avatar) => {
		this.setState({ avatar });
	};

	init = (user) => {
		const {
			name, username, emails, customFields
		} = user || this.props.user;
		this.setState({
			name,
			username,
			email: emails ? emails[0].address : null,
			newPassword: null,
			typedPassword: null,
			avatarUrl: null,
			avatar: {},
			customFields: customFields || {}
		});
	};

	formIsChanged = () => {
		const {
			name, username, email, newPassword, avatar, customFields
		} = this.state;
		const { user } = this.props;
		let customFieldsChanged = false;

		const customFieldsKeys = Object.keys(customFields);
		if (customFieldsKeys.length) {
			customFieldsKeys.forEach((key) => {
				if (user.customFields[key] !== customFields[key]) {
					customFieldsChanged = true;
				}
			});
		}

		return !(user.name === name &&
			user.username === username &&
			!newPassword &&
			(user.emails && user.emails[0].address === email) &&
			!avatar.data &&
			!customFieldsChanged
		);
	};

	handleError = (e, func, action) => {
		if (e && e.error && e.error !== 500) {
			if (e.details && e.details.timeToReset) {
				return showErrorAlert(I18n.t('error-too-many-requests', {
					seconds: parseInt(e.details.timeToReset / 1000, 10)
				}));
			}
			return showErrorAlert(I18n.t(e.error, e.details));
		}
		showErrorAlert(I18n.t('There_was_an_error_while_action', { action: I18n.t(action) }));
		log(func, e);
	};

	submit = async() => {
		Keyboard.dismiss();

		if (!this.formIsChanged()) {
			return;
		}

		this.setState({
			saving: true,
			showPasswordAlert: false
		});

		const {
			name, username, email, newPassword, typedPassword, avatar, customFields
		} = this.state;
		const { user } = this.props;
		const params = {};

		// Name
		if (user.name !== name) {
			params.realname = name;
		}

		// Username
		if (user.username !== username) {
			params.username = username;
		}

		// Email
		if (user.emails && user.emails[0].address !== email) {
			params.email = email;
		}

		// newPassword
		if (newPassword) {
			params.newPassword = newPassword;
		}

		// typedPassword
		if (typedPassword) {
			params.typedPassword = SHA256(typedPassword);
		}

		const requirePassword = !!params.email || newPassword;
		if (requirePassword && !params.typedPassword) {
			return this.setState({
				showPasswordAlert: true,
				saving: false
			});
		}

		try {
			if (avatar.url) {
				try {
					await RocketChat.setAvatarFromService(avatar);
				} catch (e) {
					this.setState({
						saving: false,
						typedPassword: null
					});
					return setTimeout(() => this.handleError(e, 'setAvatarFromService', 'changing_avatar'), 300);
				}
			}

			await RocketChat.saveUserProfile(params, customFields);
			this.setState({ saving: false });
			setTimeout(() => {
				showToast(I18n.t('Profile_saved_successfully'));
				this.init();
			}, 300);
		} catch (e) {
			this.setState({
				saving: false,
				typedPassword: null
			});
			setTimeout(() => {
				this.handleError(e, 'saveUserProfile', 'saving_profile');
			}, 300);
		}
	};

	resetAvatar = async() => {
		try {
			await RocketChat.resetAvatar();
			showToast(I18n.t('Avatar_changed_successfully'));
			this.init();
		} catch (e) {
			this.handleError(e, 'resetAvatar', 'changing_avatar');
		}
	};

	onChangeTab(tabName: any) {
		this.setState({
			// pageNum: 1,
			selectedTab: tabName
		});
	}

	onChange = (activeSections: number[]) => {
		this.setState({ activeSections });
	};

	getMock = () => {
		const mockData = [];
		const temp = [];
		const self = this;
		console.log('获取图纸数据');
		fetch(`${ FLOW_CORE_HOST }/flow/graphApply/queryApprovingGraph?processId=${ this.state.processId }`, {
			method: 'GET',
			headers: {
				'Auth-Token': this.props.user.token,
				'Auth-uid': this.props.user.id
			}
		}).then(data => data.json()).then((data) => {
			console.log(data);
			if (data.success) {
				for (let i = 0; i < data.content.length; i++) {
					temp.push(data.content[i]);
					const data2 = {
						key: data.content[i],
						title: `${ data.content[i] }号图纸`
					};
					mockData.push(data2);
				}
				const rejectIds = _.map(mockData, item => item.key);
				self.setState({
					mockData,
					rejectIds
				}, () => {
					console.log('mockData:', self.state.mockData);
					console.log('rejectIds:', self.state.rejectIds);
				});
			}
		});
	}

	finishTask(record) {
		const self = this;
		console.log('record: ', record);
		const temp = record.processDefinitionId;
		self.setState({
			processId: record.processInstanceId
		}, () => {
			const firstNum = temp.substr(0, 5);
			console.log(firstNum);
			if (firstNum === 'graph') {
				self.getMock();
				self.setState({
					currentTask: record,
					showConfirmModel: false,
					showGraphModel: true,
					showDesignedModel: false
				});
			} else if (firstNum === 'proje') {
				self.setState({
					currentTask: record,
					showConfirmModel: true,
					showGraphModel: false,
					showDesignedModel: false
				});
			} else {
				self.setState({
					currentTask: record,
					showConfirmModel: false,
					showGraphModel: false,
					showDesignedModel: true
				});
			}
		});
	}

	confirmModal(v) {
		const self = this;
		const values = { approved: v[0] === '同意' };
		console.log('values: ', values);
		console.log('currentTask', self.state.currentTask);
		values.processId = this.state.currentTask.processInstanceId;
		values.taskId = this.state.currentTask.taskId;
		values.projectId = this.state.currentTask.metaId;
		values.tag = 'drawingPlanCheckTags';
		let url = `${ FLOW_CORE_HOST }/flow/projectApply/approveComplete?`;
		_.each(_.keys(values), (one) => {
			url += `${ one }=${ values[one] }&`;
		});
		url = url.slice(0, url.length - 1);
		console.log('url:', url);
		fetch(url, {
			method: 'GET',
			headers: {
				'Auth-Token': this.props.user.token,
				'Auth-uid': this.props.user.id
			}
		})
			.then(data => data.json())
			.then((data) => {
				if (data.success) {
					Toast.success('电子出图审批成功', 1);
					self.listQuery();
				} else {
					self.listQuery();
					Toast.fail('电子出图审批失败');
				}
			});
	}

	cancelModal() {
		this.setState({
			showGraphModel: false
		});
	}

	changeRejectIds(event, item) {
		console.log('rejectIds:', this.state.rejectIds);
		console.log('item:', item.key);
		console.log('event:', event.target.checked);
		const rejectIds = this.state.rejectIds;
		if (event.target.checked) {
			_.remove(rejectIds, one => one === item.key);
		} else {
			rejectIds.push(item.key);
		}
		this.setState({ rejectIds });
	}

	confirmGraphModal() {
		const self = this;
		const values = {};
		if (this.state.rejectIds.length > 0) {
			values.rejectIds = this.state.rejectIds.join(',');
		} else {
			values.rejectIds = '-1';
		}
		values.processId = this.state.currentTask.processInstanceId;
		values.taskId = this.state.currentTask.taskId;
		fetch(`${ FLOW_CORE_HOST }/flow/graphApply/queryApprovingGraph?processId=${ this.state.currentTask.processInstanceId }`, {
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
					console.log(temp.join(','));
					console.log(values.rejectIds);
					console.log(values.rejectIds === temp.join(','));
					if (values.rejectIds === temp.join(',')) {
						values.approved = false;
					} else {
						values.approved = true;
					}
				}
				values.memo = '同意';
				console.log('values in post: ', values);
				let valuesInPost = '';
				_.each(_.keys(values), (one) => {
					valuesInPost += `${ one }=${ values[one] }&`;
				});
				valuesInPost = valuesInPost.slice(0, valuesInPost.length - 1);
				console.log('valuesInPost:', valuesInPost);
				fetch(`${ FLOW_CORE_HOST }/flow/graphApply/personalApproveComplete`, {
					method: 'POST',
					headers: {
						'Auth-Token': this.props.user.token,
						'Auth-uid': this.props.user.id,
						'Content-Type': 'application/x-www-form-urlencoded'
					},
					body: valuesInPost
				}).then(data2 => data2.json()).then((data2) => {
					if (data2.success) {
						Toast.success('审批成功', 1);
						self.listQuery();
					} else {
						self.listQuery();
						Toast.fail('网络错误');
					}
				});
				self.setState({
					showGraphModel: false,
					activeSections: []
				});
			});
	}

	showGraphPreviewModal() {
		const self = this;
		self.setState({
			showGraphPreview: true
		});
	}

	closeGraphPreviewModal() {
		const self = this;
		self.setState({
			showGraphPreview: false
		});
	}

	renderContent(pageText: any) {
		const self = this;
		const projectPanelStyle = {
			backgroundColor: '#36cfc9'
		};
		const designerPanelStyle = {
			backgroundColor: '#ff7a45'
		};
		const proofreaderPanelStyle = {
			backgroundColor: '#ffa940'
		};
		const majorPrincipalPanelStyle = {
			backgroundColor: '#ffc53d'
		};
		const counterPanelStyle = {
			backgroundColor: '#ffec3d'
		};
		const checkerPanelStyle = {
			backgroundColor: '#bae637'
		};
		const deciderPanelStyle = {
			backgroundColor: '#73d13d'
		};
		const chiefDesignerPanelStyle = {
			backgroundColor: '#5cdbd3'
		};
		const projectManagerPanelStyle = {
			backgroundColor: '#69c0ff'
		};
		const archiveApproverPanelStyle = {
			backgroundColor: '#85a5ff'
		};
		if (pageText === 'tasksTab') {
			return (
				<Provider>
					<Modal
						popup
						visible={this.state.showGraphModel}
						animationType='slide-up'
						onClose={this.cancelModal.bind(this)}
					>
						<View style={{ paddingVertical: 20, paddingHorizontal: 20 }}>
							<FlatList
								data={this.state.mockData}
								renderItem={({ item }) => (<List.Item>
										<Checkbox.CheckboxItem
											onChange={ (event) => {
												self.changeRejectIds(event, item);
												self.setState({ checkboxItem1: event.target.checked });
											} }
										>
											<Text style={ { fontSize: 17 } }>{ item.title }</Text>
										</Checkbox.CheckboxItem>
										<Button type='ghost' onPress={this.showGraphPreviewModal.bind(this)}>预览</Button>
									</List.Item>)}
								keyExtractor={(item, index) => item.id}
							/>
							<WingBlank
								size='sm'
								style={{
									flexDirection: 'row',
									justifyContent: 'space-between',
									alignItems: 'center'
								}}
							>
								<Button type='ghost' onPress={this.cancelModal.bind(this)}>
								取消
								</Button>
								<Button type='ghost' onPress={this.confirmGraphModal.bind(this)}>
								审批
								</Button>
							</WingBlank>
						</View>
					</Modal>

					<Modal
						popup
						visible={ this.state.showGraphPreview }
						animationType="slide-up"
					>
						<WebView
							source={ { uri: 'http://webviewer.arcplus-99.com:3010/samples/viewing/viewing/index.html?key=demo:601439739@qq.com:743d76bd0107bdda259b1ca19b0cb79456070bb2f0c4d57a89&url=http://teamcore.arcplus-99.com:7087/fileManager/download?id=37e70b64-adeb-4101-b029-cb993ebf3908;1.0&isWopi=false&name=本次系统更新内容.docx' } }
							// source={ { uri: 'http://www.jianshu.com/u/d5b531888b2b' } }
							style={ {
								width: '100%',
								height: 600
							} }
							onLoadStart={ (e) => console.log('onLoadStart') }
							renderError={ () => {
								console.log('renderError');
								return <View><Text>renderError回调了，出现错误</Text></View>;
							} }
							renderLoading={ () => {
								return <View><Text>加载中。。。</Text></View>;
							} }
							startInLoadingState={ true }
							onError={ () => {
								console.log('加载失败');
							} }
							scrollEnabled
						/>
						<Button type="ghost" onPress={ this.closeGraphPreviewModal.bind(this) }>
							关闭预览
						</Button>
					</Modal>

					<ScrollView style={{
						flex: 1,
						backgroundColor: 'white'
					}}
					>
						<View style={{
							marginTop: 0,
							marginBottom: 10
						}}
						>
							<Accordion onChange={this.onChange} activeSections={this.state.activeSections}>
								<Accordion.Panel
									header={`立项审批【${ _.size(self.state.projectApplyList) }】`}
									style={_.size(this.state.projectApplyList) > 0 ? projectPanelStyle : null}
								>
									<FlatList
										data={this.state.projectApplyList}
										renderItem={({ item }) => (<List.Item wrap>
											<WingBlank
												size='sm'
												style={{
													flexDirection: 'row',
													alignItems: 'center'
												}}
											>
												<Avatar
													style={styles.avatar}
													text={this.props.user.avatar ? '' : this.props.user.username}
													size={20}
													avatar={this.props.user.avatar}
												/>
												<Text style={{ fontSize: 17 }}>{ item.title }</Text>
											</WingBlank>
											<WingBlank
												size='sm'
												style={{
													flexDirection: 'row',
													justifyContent: 'space-between',
													alignItems: 'center'
												}}
											>
												{/*<Button type='ghost' size='small' disabled><Text
													style={{ fontSize: 17 }}
												>进入
												</Text>
												</Button>*/}
												<Button type='ghost' size='small' disabled><Text
													style={{ fontSize: 17 }}
												>查看
												</Text>
												</Button>
												<Picker
													title='审核意见'
													data={district}
													value={this.state.pickerValue}
													onChange={v => this.setState({ pickerValue: v })}
													onOk={(v) => {
														this.setState({ pickerValue: v }, () => { console.log('pickerValue:', self.state.pickerValue); });
														self.confirmModal(v);
													}}
												><Button
														type='ghost' size='small' onPress={() => {
															self.finishTask(item);
														}}
													><Text style={{ fontSize: 17 }}>审批</Text>
													</Button>
												</Picker>
											</WingBlank>
										</List.Item>)}
										keyExtractor={(item, index) => item.id}
									/>
								</Accordion.Panel>
								<Accordion.Panel
									header={`图纸设计审批【${ _.size(self.state.designerList) }】`}
									style={_.size(this.state.designerList) > 0 ? designerPanelStyle : null}
								>
									<FlatList
										data={this.state.designerList}
										renderItem={({ item }) => (<List.Item wrap>
											<WingBlank
												style={{
													flexDirection: 'row',
													alignItems: 'center'
												}}
											>
												<Avatar
													style={styles.avatar}
													text={this.props.user.avatar ? '' : this.props.user.username}
													size={20}
													avatar={this.props.user.avatar}
												/>
												<Text style={{ fontSize: 17 }}>{ item.title }</Text>
											</WingBlank>
											<WingBlank
												style={{
													flexDirection: 'row',
													justifyContent: 'space-between',
													alignItems: 'center'
												}}
											>
												{/*<Button type='ghost' size='small' disabled><Text*/}
												{/*	style={{ fontSize: 17 }}*/}
												{/*>进入*/}
												{/*</Text>*/}
												{/*</Button>*/}
												<Button type='ghost' size='small' disabled><Text
													style={{ fontSize: 17 }}
												>查看
												</Text>
												</Button>
												<Button
													type='ghost'
													size='small'
													onPress={() => {
														self.finishTask(item);
													}}
												><Text style={{ fontSize: 17 }}>审批</Text>
												</Button>
											</WingBlank>
										</List.Item>)}
										keyExtractor={(item, index) => item.id}
									/>
								</Accordion.Panel>
								<Accordion.Panel
									header={`图纸校对审批【${ _.size(self.state.proofreaderList) }】`}
									style={_.size(this.state.proofreaderList) > 0 ? proofreaderPanelStyle : null}
								>
									<FlatList
										data={this.state.proofreaderList}
										renderItem={({ item }) => (<List.Item wrap>
											<WingBlank
												style={{
													flexDirection: 'row',
													alignItems: 'center'
												}}
											>
												<Avatar
													style={styles.avatar}
													text={this.props.user.avatar ? '' : this.props.user.username}
													size={20}
													avatar={this.props.user.avatar}
												/>
												<Text style={{ fontSize: 17 }}>{ item.title }</Text>
											</WingBlank>
											<WingBlank
												style={{
													flexDirection: 'row',
													justifyContent: 'space-between',
													alignItems: 'center'
												}}
											>
												{/*<Button type='ghost' size='small' disabled><Text*/}
												{/*	style={{ fontSize: 17 }}*/}
												{/*>进入*/}
												{/*</Text>*/}
												{/*</Button>*/}
												<Button type='ghost' size='small' disabled><Text
													style={{ fontSize: 17 }}
												>查看
												</Text>
												</Button>
												<Button
													type='ghost'
													size='small'
													onPress={() => {
														self.finishTask(item);
													}}
												><Text style={{ fontSize: 17 }}>审批</Text>
												</Button>
											</WingBlank>
										</List.Item>)}
										keyExtractor={(item, index) => item.id}
									/>
								</Accordion.Panel>
								<Accordion.Panel
									header={`图纸专业负责人审批【${ _.size(self.state.majorPrincipalList) }】`}
									style={_.size(this.state.majorPrincipalList) > 0 ? majorPrincipalPanelStyle : null}
								>
									<FlatList
										data={this.state.majorPrincipalList}
										renderItem={({ item }) => (<List.Item wrap>
											<WingBlank
												style={{
													flexDirection: 'row',
													alignItems: 'center'
												}}
											>
												<Avatar
													style={styles.avatar}
													text={this.props.user.avatar ? '' : this.props.user.username}
													size={20}
													avatar={this.props.user.avatar}
												/>
												<Text style={{ fontSize: 17 }}>{ item.title }</Text>
											</WingBlank>
											<WingBlank
												style={{
													flexDirection: 'row',
													justifyContent: 'space-between',
													alignItems: 'center'
												}}
											>
												{/*<Button type='ghost' size='small' disabled><Text*/}
												{/*	style={{ fontSize: 17 }}*/}
												{/*>进入*/}
												{/*</Text>*/}
												{/*</Button>*/}
												<Button type='ghost' size='small' disabled><Text
													style={{ fontSize: 17 }}
												>查看
												</Text>
												</Button>
												<Button
													type='ghost'
													size='small'
													onPress={() => {
														self.finishTask(item);
													}}
												><Text style={{ fontSize: 17 }}>审批</Text>
												</Button>
											</WingBlank>
										</List.Item>)}
										keyExtractor={(item, index) => item.id}
									/>
								</Accordion.Panel>
								<Accordion.Panel
									header={`图纸会签审批【${ _.size(self.state.counterList) }】`}
									style={_.size(this.state.counterList) > 0 ? counterPanelStyle : null}
								>
									<FlatList
										data={this.state.counterList}
										renderItem={({ item }) => (<List.Item wrap>
											<WingBlank
												style={{
													flexDirection: 'row',
													alignItems: 'center'
												}}
											>
												<Avatar
													style={styles.avatar}
													text={this.props.user.avatar ? '' : this.props.user.username}
													size={20}
													avatar={this.props.user.avatar}
												/>
												<Text style={{ fontSize: 17 }}>{ item.title }</Text>
											</WingBlank>
											<WingBlank
												style={{
													flexDirection: 'row',
													justifyContent: 'space-between',
													alignItems: 'center'
												}}
											>
												{/*<Button type='ghost' size='small' disabled><Text*/}
												{/*	style={{ fontSize: 17 }}*/}
												{/*>进入*/}
												{/*</Text>*/}
												{/*</Button>*/}
												<Button type='ghost' size='small' disabled><Text
													style={{ fontSize: 17 }}
												>查看
												</Text>
												</Button>
												<Button
													type='ghost'
													size='small'
													onPress={() => {
														self.finishTask(item);
													}}
												><Text style={{ fontSize: 17 }}>审批</Text>
												</Button>
											</WingBlank>
										</List.Item>)}
										keyExtractor={(item, index) => item.id}
									/>
								</Accordion.Panel>
								<Accordion.Panel
									header={`图纸审核审批【${ _.size(self.state.checkerList) }】`}
									style={_.size(this.state.checkerList) > 0 ? checkerPanelStyle : null}
								>
									<FlatList
										data={this.state.checkerList}
										renderItem={({ item }) => (<List.Item wrap>
											<WingBlank
												style={{
													flexDirection: 'row',
													alignItems: 'center'
												}}
											>
												<Avatar
													style={styles.avatar}
													text={this.props.user.avatar ? '' : this.props.user.username}
													size={20}
													avatar={this.props.user.avatar}
												/>
												<Text style={{ fontSize: 17 }}>{ item.title }</Text>
											</WingBlank>
											<WingBlank
												style={{
													flexDirection: 'row',
													justifyContent: 'space-between',
													alignItems: 'center'
												}}
											>
												{/*<Button type='ghost' size='small' disabled><Text*/}
												{/*	style={{ fontSize: 17 }}*/}
												{/*>进入*/}
												{/*</Text>*/}
												{/*</Button>*/}
												<Button type='ghost' size='small' disabled><Text
													style={{ fontSize: 17 }}
												>查看
												</Text>
												</Button>
												<Button
													type='ghost'
													size='small'
													onPress={() => {
														self.finishTask(item);
													}}
												><Text style={{ fontSize: 17 }}>审批</Text>
												</Button>
											</WingBlank>
										</List.Item>)}
										keyExtractor={(item, index) => item.id}
									/>
								</Accordion.Panel>
								<Accordion.Panel
									header={`图纸审定审批【${ _.size(self.state.deciderList) }】`}
									style={_.size(this.state.deciderList) > 0 ? deciderPanelStyle : null}
								>
									<FlatList
										data={this.state.deciderList}
										renderItem={({ item }) => (<List.Item wrap>
											<WingBlank
												style={{
													flexDirection: 'row',
													alignItems: 'center'
												}}
											>
												<Avatar
													style={styles.avatar}
													text={this.props.user.avatar ? '' : this.props.user.username}
													size={20}
													avatar={this.props.user.avatar}
												/>
												<Text style={{ fontSize: 17 }}>{ item.title }</Text>
											</WingBlank>
											<WingBlank
												style={{
													flexDirection: 'row',
													justifyContent: 'space-between',
													alignItems: 'center'
												}}
											>
												{/*<Button type='ghost' size='small' disabled><Text*/}
												{/*	style={{ fontSize: 17 }}*/}
												{/*>进入*/}
												{/*</Text>*/}
												{/*</Button>*/}
												<Button type='ghost' size='small' disabled><Text
													style={{ fontSize: 17 }}
												>查看
												</Text>
												</Button>
												<Button
													type='ghost'
													size='small'
													onPress={() => {
														self.finishTask(item);
													}}
												><Text style={{ fontSize: 17 }}>审批</Text>
												</Button>
											</WingBlank>
										</List.Item>)}
										keyExtractor={(item, index) => item.id}
									/>
								</Accordion.Panel>
								<Accordion.Panel
									header={`图纸设总审批【${ _.size(self.state.chiefDesignerList) }】`}
									style={_.size(this.state.chiefDesignerList) > 0 ? chiefDesignerPanelStyle : null}
								>
									<FlatList
										data={this.state.chiefDesignerList}
										renderItem={({ item }) => (<List.Item wrap>
											<WingBlank
												style={{
													flexDirection: 'row',
													alignItems: 'center'
												}}
											>
												<Avatar
													style={styles.avatar}
													text={this.props.user.avatar ? '' : this.props.user.username}
													size={20}
													avatar={this.props.user.avatar}
												/>
												<Text style={{ fontSize: 17 }}>{ item.title }</Text>
											</WingBlank>
											<WingBlank
												style={{
													flexDirection: 'row',
													justifyContent: 'space-between',
													alignItems: 'center'
												}}
											>
												{/*<Button type='ghost' size='small' disabled><Text*/}
												{/*	style={{ fontSize: 17 }}*/}
												{/*>进入*/}
												{/*</Text>*/}
												{/*</Button>*/}
												<Button type='ghost' size='small' disabled><Text
													style={{ fontSize: 17 }}
												>查看
												</Text>
												</Button>
												<Button
													type='ghost'
													size='small'
													onPress={() => {
														self.finishTask(item);
													}}
												><Text style={{ fontSize: 17 }}>审批</Text>
												</Button>
											</WingBlank>
										</List.Item>)}
										keyExtractor={(item, index) => item.id}
									/>
								</Accordion.Panel>
								<Accordion.Panel
									header={`图纸项目经理审批【${ _.size(self.state.projectManagerList) }】`}
									style={_.size(this.state.projectManagerList) > 0 ? projectManagerPanelStyle : null}
								>
									<FlatList
										data={this.state.projectManagerList}
										renderItem={({ item }) => (<List.Item wrap>
											<WingBlank
												style={{
													flexDirection: 'row',
													alignItems: 'center'
												}}
											>
												<Avatar
													style={styles.avatar}
													text={this.props.user.avatar ? '' : this.props.user.username}
													size={20}
													avatar={this.props.user.avatar}
												/>
												<Text style={{ fontSize: 17 }}>{ item.title }</Text>
											</WingBlank>
											<WingBlank
												style={{
													flexDirection: 'row',
													justifyContent: 'space-between',
													alignItems: 'center'
												}}
											>
												{/*<Button type='ghost' size='small' disabled><Text*/}
												{/*	style={{ fontSize: 17 }}*/}
												{/*>进入*/}
												{/*</Text>*/}
												{/*</Button>*/}
												<Button type='ghost' size='small' disabled><Text
													style={{ fontSize: 17 }}
												>查看
												</Text>
												</Button>
												<Button
													type='ghost'
													size='small'
													onPress={() => {
														self.finishTask(item);
													}}
												><Text style={{ fontSize: 17 }}>审批</Text>
												</Button>
											</WingBlank>
										</List.Item>)}
										keyExtractor={(item, index) => item.id}
									/>
								</Accordion.Panel>
								<Accordion.Panel
									header={`图纸档案审批人审批【${ _.size(self.state.archiveApproverList) }】`}
									style={_.size(this.state.archiveApproverList) > 0 ? archiveApproverPanelStyle : null}
								>
									<FlatList
										data={this.state.archiveApproverList}
										renderItem={({ item }) => (<List.Item wrap>
											<WingBlank
												style={{
													flexDirection: 'row',
													alignItems: 'center'
												}}
											>
												<Avatar
													style={styles.avatar}
													text={this.props.user.avatar ? '' : this.props.user.username}
													size={20}
													avatar={this.props.user.avatar}
												/>
												<Text style={{ fontSize: 17 }}>{ item.title }</Text>
											</WingBlank>
											<WingBlank
												style={{
													flexDirection: 'row',
													justifyContent: 'space-between',
													alignItems: 'center'
												}}
											>
												{/*<Button type='ghost' size='small' disabled><Text*/}
												{/*	style={{ fontSize: 17 }}*/}
												{/*>进入*/}
												{/*</Text>*/}
												{/*</Button>*/}
												<Button type='ghost' size='small' disabled><Text
													style={{ fontSize: 17 }}
												>查看
												</Text>
												</Button>
												<Button
													type='ghost'
													size='small'
													onPress={() => {
														self.finishTask(item);
													}}
												><Text style={{ fontSize: 17 }}>审批</Text>
												</Button>
											</WingBlank>
										</List.Item>)}
										keyExtractor={(item, index) => item.id}
									/>
								</Accordion.Panel>
							</Accordion>
						</View>
					</ScrollView>
				</Provider>
			);
		} else if (pageText === 'historyTab') {
			return (
				<ScrollView style={{
					flex: 1,
					backgroundColor: 'white'
				}}
				>
					<Text style={{ margin: 10 }}>{ pageText }</Text>
					<View style={{
						marginTop: 0,
						marginBottom: 0
					}}
					>
						<FlatList
							data={this.state.flowList}
							renderItem={({ item }) => (<List.Item
								wrap
							>{ `${ item.title }/${ item.activityName }` }
                                  </List.Item>)}
							keyExtractor={(item, index) => item.id}
						/>
					</View>
					<Button onPress={() => {
						self.listQuery();
					}}
					>加载更多
					</Button>
				</ScrollView>
			);
		}
	}

	async listQuery() {
		const self = this;
		// const response = await fetch('http://facebook.github.io/react-native/movies.json');
		// 区分三个标签页
		let urlTab = FLOW_CORE_HOST;
		if (self.state.selectedTab === 'tasksTab') {
			urlTab += `/flow/projectApply/tasks?assignee=${ this.props.user.name }(${ this.props.user.username })`;
		} else if (self.state.selectedTab === 'historyTab') {
			urlTab += `/flow/projectApply/historyByAssignee?assignee=${ this.props.user.name }(${ this.props.user.username })&pageNum=${ self.state.pageNum }&pageSize=${ self.state.pageSize }`;
		}
		const response = await fetch(urlTab, {
			method: 'GET',
			headers: {
				'Auth-Token': this.props.user.token,
				'Auth-uid': this.props.user.id
			}
		})
			.catch((e) => {
				console.log(e);
			});
		const responseJson = await response.json();
		console.log('responseJson', responseJson);
		const tasks = responseJson.content;
		let taskTypes = tasks.map(item => _.pick(item, 'processInstanceId', 'processDefinitionId'))
			.map(item => ({
				...item,
				processDefinitionId: item.processDefinitionId.split(':')[0]
			}));
		taskTypes = _.groupBy(taskTypes, 'processDefinitionId');

		const promises = [];

		// 获取流程ID对应的项目
		_.map(taskTypes, (v, k) => {
			const ids = _.map(v, one => one.processInstanceId);
			console.log('ids in k:', ids);
			let url = `${ this.state.projectTypes[k] }?`;
			_.each(ids, (one) => {
				url += `flowIds%5B%5D=${ one }&`;
			});
			url = url.slice(0, url.length - 1);
			console.log('url:',url);
			if (!_.isEmpty(this.state.projectTypes[k])) {
				const promise = fetch(url, {
					method: 'GET',
					headers: {
						'Auth-Token': this.props.user.token,
						'Auth-uid': this.props.user.id
					}
				})
					.then(data => data.json())
					.then((data) => {
						console.log('data1:', data);
						if (data.success) {
							const res = {};
							res[k] = data.content;
							return res;
						}
						return null;
					});
				promises.push(promise);
			}
		});

		// 查询流程ID对应的辅助流程信息，如标题，说明等
		let url = `${ FLOW_CORE_HOST }/projectAndProcess/getHistoryByFlowIds?`;
		_.each(tasks, (one) => {
			url += `flowIds%5B%5D=${ one.processInstanceId }&`;
		});
		url = url.slice(0, url.length - 1);
		const processPromise = fetch(url, {
			method: 'GET',
			headers: {
				'Auth-Token': this.props.user.token,
				'Auth-uid': this.props.user.id
			}
		})
			.then(data => data.json())
			.then((data) => {
				console.log('data2:', data);
				if (data.success) {
					return data.content;
				}
				return [];
			});
		promises.push(processPromise);

		const finalTasks = [];
		console.log(promises);
		Promise.all(promises)
			.then((datas) => {
				console.log('datas in promise all', datas);
				const taskInfos = _.last(datas);
				const metaInfos = {};
				_.map(_.without(datas, taskInfos), (one) => {
					_.map(one, (v, k) => {
						metaInfos[k] = v;
					});
				});
				console.log('taskInfos', taskInfos);
				console.log('metaInfos', metaInfos);

				if (_.isEmpty(tasks)) {
					self.setState({
						flowList: [],
						projectApplyList: [],
						graphApplyList: [],
						designerList: [],
						proofreaderList: [],
						majorPrincipalList: [],
						counterList: [],
						checkerList: [],
						deciderList: [],
						chiefDesignerList: [],
						projectManagerList: [],
						archiveApproverList: []
					});
				}

				_.each(tasks, (item) => {
					const type = item.processDefinitionId.split(':')[0];

					const meta = _.find(metaInfos[type], { processId: item.processInstanceId });
					const info = _.find(taskInfos, { processId: item.processInstanceId });
					console.log('my meta in tasks', meta);
					console.log('my info in history table', info);
					if (_.isEmpty(info)) {
						return [];
					}
					item.metaName = info.title;
					item.metaId = info.externalIds;
					item.metaMemo = info.memo;
					item.uri = _.isEmpty(type) ? '/_none/' : `/${ type }/`;
					finalTasks.push(item);
					const title = 'title';
					console.log('item in TaskList', item);
					let nowTasks = self.state.flowList;
					fetch(`${ FLOW_CORE_HOST }/projectAndProcess/getByProcessId?processId=${ item.processInstanceId }`, {
						method: 'GET',
						headers: {
							'Auth-Token': this.props.user.token,
							'Auth-uid': this.props.user.id
						}
					})
						.then(data => data.json())
						.then((data) => {
							if (data.success) {
								const titleIndex = data.content.title.lastIndexOf('-包含《');
								if (titleIndex > -1 && _.isEqual(data.content.title.slice(-3), '张图纸')) {
									item[title] = `${ data.content.title.slice(0, titleIndex + 1) }${ data.content.title.slice(titleIndex + 1) }`;
								} else {
									item[title] = data.content.title;
								}
								console.log('item.title: ', item.title);
							}
							console.log('my tasks finalTasks', finalTasks);
							console.log('self.state.selectedTab: ', self.state.selectedTab);
							if (self.state.selectedTab === 'historyTab') {
								if (!_.isEmpty(finalTasks)) {
									nowTasks = nowTasks.concat(finalTasks);
								}
								console.log('nowTasks',nowTasks);
								self.setState({
									flowList: nowTasks,
									pageNum: self.state.isAddPage ? self.state.pageNum + 1 : self.state.pageNum + 1
								}, () => {
									console.log('flowList: ', self.state.flowList);
								});
							} else if (self.state.selectedTab === 'tasksTab' || self.state.selectedTab === 'myApplyTab') {
								const taskGroupList = _.groupBy(finalTasks, 'uri');
								const projectApplyList = taskGroupList['/projectApply/'];
								const graphApplyList = taskGroupList['/graphApply/'];

								const graphGroupList = _.groupBy(graphApplyList, 'activityName');
								const designerList = graphGroupList['设计'];
								const professionManagerList = graphGroupList['专业负责人'];
								const counterList = graphGroupList['会签'];
								const proofreaderList = graphGroupList['校对'];
								const checkerList = graphGroupList['审核'];
								const deciderList = graphGroupList['审定'];
								const chiefDesignerList = graphGroupList['设总'];
								const projectManagerList = graphGroupList['项目经理'];
								const archiveApproverList = graphGroupList['档案审批人'];
								self.setState({
									flowList: finalTasks,
									projectApplyList,
									graphApplyList,
									designerList,
									proofreaderList,
									majorPrincipalList: professionManagerList,
									counterList,
									checkerList,
									deciderList,
									chiefDesignerList,
									projectManagerList,
									archiveApproverList
								}, () => {
									console.log('self.projectApplyList: ', self.state.projectApplyList);
								});
							}
						});
				});
			});

		// this.setState({
		// 	dataSource: tasks
		// }, () => {
		// 	console.log('responseJson', this.state.dataSource);
		// });
	}

	render() {
		console.disableYellowBox = true;
		console.warn('YellowBox is disabled.');
		return (
			<TabBar
				unselectedTintColor='#949494'
				tintColor='#33A3F4'
				barTintColor='#f5f5f5'
			>
				<TabBar.Item
					title='待办任务'
					icon={<Icon name='clock-circle' />}
					selected={this.state.selectedTab === 'tasksTab'}
					onPress={() => this.onChangeTab('tasksTab')}
				>
					{ this.renderContent('tasksTab') }
				</TabBar.Item>
				<TabBar.Item
					icon={<Icon name='appstore' />}
					title='已完成任务'
					selected={this.state.selectedTab === 'historyTab'}
					onPress={() => this.onChangeTab('historyTab')}
				>
					{ this.renderContent('historyTab') }
				</TabBar.Item>
				<TabBar.Item
					icon={<Icon name='flag' />}
					title='历史任务'
					selected={this.state.selectedTab === 'myApplyTab'}
					onPress={() => this.onChangeTab('myApplyTab')}
				>
					{ this.renderContent('myApplyTab') }
				</TabBar.Item>
			</TabBar>
		);
	}
}
