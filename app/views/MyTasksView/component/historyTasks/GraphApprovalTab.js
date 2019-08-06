/* eslint-disable */
import React from 'react';
// react-native UI
import { View } from 'react-native';
// antd UI
import { Accordion } from '@ant-design/react-native';
// component
import ProjectApplyList from './ProjectApplyList';

export default class GraphApprovalTab extends React.PureComponent {
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
		const activeSection = this.state.activeSections[0];
		return (
			<View>
				<Accordion onChange={ this.onChange } activeSections={ this.state.activeSections }>
					<Accordion.Panel
						header={ `设计` }
						style={ ((activeSection === undefined || activeSection === 0) ? null : { display: 'none' }) }
					>
						{ this.state.activeSections[0] === 0 ? (
							<ProjectApplyList activeSection={ '设计' } tab={ this.props.tab }/>) : null }
					</Accordion.Panel>
					<Accordion.Panel
						header={ `校对` }
						style={ ((activeSection === undefined || activeSection === 1) ? null : { display: 'none' }) }
					>
						{ this.state.activeSections[0] === 1 ? (
							<ProjectApplyList activeSection={ '校对' } tab={ this.props.tab }/>) : null }
					</Accordion.Panel>
					<Accordion.Panel
						header={ `专业负责人` }
						style={ ((activeSection === undefined || activeSection === 2) ? null : { display: 'none' }) }
					>
						{ this.state.activeSections[0] === 2 ? (
							<ProjectApplyList activeSection={ '专业负责人' } tab={ this.props.tab }/>) : null }
					</Accordion.Panel>
					<Accordion.Panel
						header={ `会签` }
						style={ ((activeSection === undefined || activeSection === 3) ? null : { display: 'none' }) }
					>
						{ this.state.activeSections[0] === 3 ? (
							<ProjectApplyList activeSection={ '会签' } tab={ this.props.tab }/>) : null }
					</Accordion.Panel>
					<Accordion.Panel
						header={ `审核` }
						style={ ((activeSection === undefined || activeSection === 4) ? null : { display: 'none' }) }
					>
						{ this.state.activeSections[0] === 4 ? (
							<ProjectApplyList activeSection={ '审核' } tab={ this.props.tab }/>) : null }
					</Accordion.Panel>
					<Accordion.Panel
						header={ `审定` }
						style={ ((activeSection === undefined || activeSection === 5) ? null : { display: 'none' }) }
					>
						{ this.state.activeSections[0] === 5 ? (
							<ProjectApplyList activeSection={ '审定' } tab={ this.props.tab }/>) : null }
					</Accordion.Panel>
					<Accordion.Panel
						header={ `设总` }
						style={ ((activeSection === undefined || activeSection === 6) ? null : { display: 'none' }) }
					>
						{ this.state.activeSections[0] === 6 ? (
							<ProjectApplyList activeSection={ '设总' } tab={ this.props.tab }/>) : null }
					</Accordion.Panel>
					<Accordion.Panel
						header={ `项目经理` }
						style={ ((activeSection === undefined || activeSection === 7) ? null : { display: 'none' }) }
					>
						{ this.state.activeSections[0] === 7 ? (
							<ProjectApplyList activeSection={ '项目经理' } tab={ this.props.tab }/>) : null }
					</Accordion.Panel>
					<Accordion.Panel
						header={ `档案审批人` }
						style={ ((activeSection === undefined || activeSection === 8) ? null : { display: 'none' }) }
					>
						{ this.state.activeSections[0] === 8 ? (
							<ProjectApplyList activeSection={ '档案审批人' } tab={ this.props.tab }/>) : null }
					</Accordion.Panel>
				</Accordion>
			</View>
		);
	}
}
