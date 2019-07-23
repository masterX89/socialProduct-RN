/* eslint-disable */
import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

// component
import GraphModal from '../component/GraphModal';

// react-native UI
import { Text, FlatList, ScrollView } from 'react-native';
// antd UI
import { List, WingBlank, Button } from '@ant-design/react-native';
// RocketChat
import Avatar from '../../../containers/Avatar';
import styles from '../../../containers/message/styles';

const wingBlankTitleStyle = {
	flexDirection: 'row',
	alignItems: 'center'
};
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
export default class FlatListInTasks extends React.PureComponent {
	static propTypes = {
		user: PropTypes.object,
		listData: PropTypes.array
	};

	constructor(props) {
		super(props);
	}

	render() {
		console.log('this.props:', this.props);

		return (
			<ScrollView>
				<FlatList
					data={ this.props.listData }
					keyExtractor={ (item, index) => item.id }
					renderItem={ ({ item }) => (
						<List.Item wrap>
							<WingBlank style={ { ...wingBlankTitleStyle } }>
								<Avatar
									style={ styles.avatar }
									text={ this.props.user.avatar ? '' : this.props.user.username }
									size={ 20 }
									avatar={ this.props.user.avatar }
								/>
								<Text style={ { fontSize: 17 } }>{ item.title }</Text>
							</WingBlank>
							<WingBlank style={ { ...wingBlankButtonStyle } }>
								<Button type='ghost' size='small' disabled>
									<Text style={ { fontSize: 17 } }>进入</Text>
								</Button>
								<GraphModal record={ item } { ...this.props }/>
							</WingBlank>
						</List.Item>
					) }
				/>
			</ScrollView>
		);
	}
}
