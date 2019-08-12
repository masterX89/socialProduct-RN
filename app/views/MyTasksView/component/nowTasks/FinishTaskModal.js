import React from 'react';
import PropTypes from 'prop-types';
// react-native UI
import { View, Text } from 'react-native';
import _ from 'lodash';
import { connect } from 'react-redux';
// antd UI
import { Button, Picker, Toast } from '@ant-design/react-native';
import { FLOW_CORE_HOST } from '../../../../constants/Constants';

const district = [{
	value: '同意',
	label: '同意'
}, {
	value: '拒绝',
	label: '拒绝'
}];

@connect(state => ({
	user: {
		name: state.login.user && state.login.user.name,
		username: state.login.user && state.login.user.username,
		token: state.login.user && state.login.user.token,
		id: state.login.user && state.login.user.id
	}
}))
export default class FinishTaskModal extends React.PureComponent {
	static propTypes = {
		user: PropTypes.object,
		record: PropTypes.object,
		getMockData: PropTypes.func
	};

	state = {
		pickerValue: []
	};

	confirmModal(v) {
		const { record } = this.props;
		const values = {
			approved: v[0] === '同意',
			processId: record.processInstanceId,
			taskId: record.taskId,
			projectId: record.metaId,
			tag: 'drawingPlanCheckTags'
		};
		let url = `${ FLOW_CORE_HOST }/flow/projectApply/approveComplete?`;
		_.each(_.keys(values), (one) => {
			url += `${ one }=${ values[one] }&`;
		});
		url = url.slice(0, url.length - 1);
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
					this.props.getMockData();
				} else {
					Toast.fail('电子出图审批失败');
					this.props.getMockData();
				}
			});
	}

	render() {
		return (
			<View>
				<Picker
					title='审核意见'
					data={ district }
					value={ this.state.pickerValue }
					onChange={ v => this.setState({ pickerValue: v }) }
					onOk={ (v) => {
						this.setState({ pickerValue: v });
						this.confirmModal(v);
					} }
				>
					<Button type='ghost' size='small'>
						<Text style={ { fontSize: 17 } }>审批</Text>
					</Button>
				</Picker>
			</View>
		);
	}
}
