import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
// react-native UI
import { View, Text } from 'react-native';
// antd UI
import { Accordion } from '@ant-design/react-native';
import GraphApplyList from './GraphApplyList';

export default class GraphApplyTab extends React.PureComponent {
	static propTypes = {
		graphApplyList: PropTypes.object
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
		const activeSection = this.state.activeSections[0];
		const { graphApplyList } = this.props;
		const designerList = _.has(graphApplyList, '设计') ? graphApplyList['设计'] : [];
		const proofreaderList = _.has(graphApplyList, '校对') ? graphApplyList['校对'] : [];
		const professionManagerList = _.has(graphApplyList, '专业负责人') ? graphApplyList['专业负责人'] : [];
		const counterList = _.has(graphApplyList, '会签') ? graphApplyList['会签'] : [];
		const checkerList = _.has(graphApplyList, '审核') ? graphApplyList['审核'] : [];
		const deciderList = _.has(graphApplyList, '审定') ? graphApplyList['审定'] : [];
		const chiefDesignerList = _.has(graphApplyList, '设总') ? graphApplyList['设总'] : [];
		const projectManagerList = _.has(graphApplyList, '项目经理') ? graphApplyList['项目经理'] : [];
		const archiveApproverList = _.has(graphApplyList, '档案审批人') ? graphApplyList['档案审批人'] : [];

		return (
			<View>
				<Accordion onChange={ this.onChange } activeSections={ this.state.activeSections }>
					<Accordion.Panel
						header={ `设计【${ designerList.length }】` }
						style={ ((activeSection === undefined || activeSection === 0) ? null : { display: 'none' }) }
					>
						{ this.state.activeSections[0] === 0 ? (
							<GraphApplyList nowTasks={ designerList }/>) : null }
					</Accordion.Panel>
					<Accordion.Panel
						header={ `校对【${ proofreaderList.length }】` }
						style={ ((activeSection === undefined || activeSection === 1) ? null : { display: 'none' }) }
					>
						{ this.state.activeSections[0] === 1 ? (
							<GraphApplyList nowTasks={ proofreaderList }/>) : null }
					</Accordion.Panel>
					<Accordion.Panel
						header={ `专业负责人【${ professionManagerList.length }】` }
						style={ ((activeSection === undefined || activeSection === 2) ? null : { display: 'none' }) }
					>
						{ this.state.activeSections[0] === 2 ? (
							<GraphApplyList nowTasks={ professionManagerList }/>) : null }
					</Accordion.Panel>
					<Accordion.Panel
						header={ `会签【${ counterList.length }】` }
						style={ ((activeSection === undefined || activeSection === 3) ? null : { display: 'none' }) }
					>
						{ this.state.activeSections[0] === 3 ? (
							<GraphApplyList nowTasks={ counterList }/>) : null }
					</Accordion.Panel>
					<Accordion.Panel
						header={ `审核【${ checkerList.length }】` }
						style={ ((activeSection === undefined || activeSection === 4) ? null : { display: 'none' }) }
					>
						{ this.state.activeSections[0] === 4 ? (
							<GraphApplyList nowTasks={ checkerList }/>) : null }
					</Accordion.Panel>
					<Accordion.Panel
						header={ `审定【${ deciderList.length }】` }
						style={ ((activeSection === undefined || activeSection === 5) ? null : { display: 'none' }) }
					>
						{ this.state.activeSections[0] === 5 ? (
							<GraphApplyList nowTasks={ deciderList }/>) : null }
					</Accordion.Panel>
					<Accordion.Panel
						header={ `设总【${ chiefDesignerList.length }】` }
						style={ ((activeSection === undefined || activeSection === 6) ? null : { display: 'none' }) }
					>
						{ this.state.activeSections[0] === 6 ? (
							<GraphApplyList nowTasks={ chiefDesignerList }/>) : null }
					</Accordion.Panel>
					<Accordion.Panel
						header={ `项目经理【${ projectManagerList.length }】` }
						style={ ((activeSection === undefined || activeSection === 7) ? null : { display: 'none' }) }
					>
						{ this.state.activeSections[0] === 7 ? (
							<GraphApplyList nowTasks={ projectManagerList }/>) : null }
					</Accordion.Panel>
					<Accordion.Panel
						header={ `档案审批人【${ archiveApproverList.length }】` }
						style={ ((activeSection === undefined || activeSection === 8) ? null : { display: 'none' }) }
					>
						{ this.state.activeSections[0] === 8 ? (
							<GraphApplyList nowTasks={ archiveApproverList }/>) : null }
					</Accordion.Panel>
				</Accordion>
			</View>
		);
	}
}
