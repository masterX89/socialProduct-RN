/* eslint-disable */
import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

// component
import ProjectApplyList from './ProjectApplyList';

// react-native UI
import { View } from 'react-native';
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
export default class ProjectApplyTab extends React.PureComponent {
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
		const activeSection = this.state.activeSections[0];
		return (
			<View>
				<Accordion onChange={ this.onChange } activeSections={ this.state.activeSections }>
					<Accordion.Panel
						header={ `部门领导` }
						style={ ((activeSection === undefined || activeSection === 0) ? null : { display: 'none' }) }
					>
						{ activeSection === 0 ? (
							<ProjectApplyList activeSection={ '部门领导' }/>) : null }
					</Accordion.Panel>
					<Accordion.Panel
						header={ `知识管理` }
						style={ ((activeSection === undefined || activeSection === 1) ? null : { display: 'none' }) }
					>
						{ activeSection === 1 ? (
							<ProjectApplyList activeSection={ '知识管理' }/>) : null }
					</Accordion.Panel>
					<Accordion.Panel
						header={ `IT管理` }
						style={ ((activeSection === undefined || activeSection === 2) ? null : { display: 'none' }) }
					>
						{ activeSection === 2 ? (
							<ProjectApplyList activeSection={ 'IT管理' }/>) : null }
					</Accordion.Panel>
				</Accordion>
			</View>
		);
	}
}
