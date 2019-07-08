import React from 'react';
import { View, Text, Image, SafeAreaView } from 'react-native';
import PropTypes from 'prop-types';

import I18n from '../../i18n';
import openLink from '../../utils/openLink';
import Button from './Button';
import styles from './styles';
import LoggedView from '../View';

/** @extends React.Component */
export default class OnboardingView extends LoggedView {
	static propTypes = {
		navigator: PropTypes.object
	}

	constructor(props) {
		super('CreateChannelView', props);
	}

	connectServer = () => {
		this.props.navigator.push({
			screen: 'NewServerView',
			backButtonTitle: '',
			navigatorStyle: {
				navBarHidden: true
			}
		});
	}

	joinCommunity = () => {
		this.props.navigator.push({
			screen: 'NewServerView',
			backButtonTitle: '',
			passProps: {
				server: 'http://172.16.0.145:3000'
			},
			navigatorStyle: {
				navBarHidden: true
			}
		});
	}

	createWorkspace = () => {
		openLink('https://cloud.rocket.chat/trial');
	}

	render() {
		return (
			<SafeAreaView style={styles.container} testID='onboarding-view'>
				<Image style={styles.onboarding} source={require('../../static/images/onboarding.png')} />
				<Text style={styles.title}>{I18n.t('Welcome_to_RocketChat')}</Text>
				<View style={styles.buttonsContainer}>
					<Button
						type='secondary'
						title={I18n.t('Connect_to_a_server')}
						icon={<Image source={require('../../static/images/connectServer.png')} />}
						onPress={this.connectServer}
						testID='connect-server-button'
					/>
					<Button
						type='secondary'
						title={I18n.t('Join_the_community')}
						subtitle='互联华建'
						icon={<Image source={require('../../static/images/logoSmall.png')} />}
						onPress={this.joinCommunity}
						testID='join-community-button'
					/>
					{/* <Button
						type='primary'
						title={I18n.t('Create_a_new_workspace')}
						icon={<Image source={require('../../static/images/plusWhite.png')} />}
						onPress={this.createWorkspace}
						testID='create-workspace-button'
					/> */ }
				</View>
			</SafeAreaView>
		);
	}
}
