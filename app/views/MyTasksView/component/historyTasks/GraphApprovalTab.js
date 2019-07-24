/* eslint-disable */
import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

// component
import ProjectApplyList from './ProjectApplyList';

// react-native UI
import { ScrollView} from 'react-native';
// antd UI
import { Accordion } from '@ant-design/react-native';

@connect(state => ({
	user: {
		name: state.login.user && state.login.user.name,
		username: state.login.user && state.login.user.username,
		token: state.login.user && state.login.user.token,
		id: state.login.user && state.login.user.id
	}
}))
export default class GraphApprovalTab extends React.PureComponent {
	static propTypes = {
		user: PropTypes.object
	};

	constructor(props) {
		super(props);
		this.state = {
			activeSections: []
		};
	}

	onChange = (activeSections: number[]) => {
		this.setState({ activeSections });
	};

	render() {
		return (
			<ScrollView>
				<Accordion onChange={ this.onChange } activeSections={ this.state.activeSections }>
					<Accordion.Panel
						header={ `设计` }
					>
						{ this.state.activeSections[0] === 0 ? (
							<ProjectApplyList activeSection={ '设计' }/>) : null }
					</Accordion.Panel>
					<Accordion.Panel
						header={ `校对` }
					>
						{ this.state.activeSections[0] === 1 ? (
							<ProjectApplyList activeSection={ '校对' }/>) : null }
					</Accordion.Panel>
					<Accordion.Panel
						header={ `专业负责人` }
					>
						{ this.state.activeSections[0] === 2 ? (
							<ProjectApplyList activeSection={ '专业负责人' }/>) : null }
					</Accordion.Panel>
					<Accordion.Panel
						header={ `会签` }
					>
						{ this.state.activeSections[0] === 3 ? (
							<ProjectApplyList activeSection={ '会签' }/>) : null }
					</Accordion.Panel>
					<Accordion.Panel
						header={ `审核` }
					>
						{ this.state.activeSections[0] === 4 ? (
							<ProjectApplyList activeSection={ '审核' }/>) : null }
					</Accordion.Panel>
					<Accordion.Panel
						header={ `审定` }
					>
						{ this.state.activeSections[0] === 5 ? (
							<ProjectApplyList activeSection={ '审定' }/>) : null }
					</Accordion.Panel>
					<Accordion.Panel
						header={ `设总` }
					>
						{ this.state.activeSections[0] === 6 ? (
							<ProjectApplyList activeSection={ '设总' }/>) : null }
					</Accordion.Panel>
					<Accordion.Panel
						header={ `项目经理` }
					>
						{ this.state.activeSections[0] === 7 ? (
							<ProjectApplyList activeSection={ '项目经理' }/>) : null }
					</Accordion.Panel>
					<Accordion.Panel
						header={ `档案审批人` }
					>
						{ this.state.activeSections[0] === 8 ? (
							<ProjectApplyList activeSection={ '档案审批人' }/>) : null }
					</Accordion.Panel>
				</Accordion>
			</ScrollView>
		);
	}
}
