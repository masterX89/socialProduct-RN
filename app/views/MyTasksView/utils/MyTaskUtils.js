import _ from 'lodash';
import { FLOW_CORE_HOST } from '../../../constants/Constants';

export async function getFinalTasks(url, user) {
	let loadingMore = true;
	const tasks = await fetch(url, {
		method: 'GET',
		headers: {
			'Auth-Token': user.token,
			'Auth-uid': user.id
		}
	})
		.then(data => data.json())
		.then((data) => {
			if (data.success) {
				if (data.content.length === 0) {
					loadingMore = false;
				}
				return data.content;
			}
			return [];
		})
		.catch(err => console.log(err));

	// 查询流程ID对应的辅助流程信息，如标题，说明等
	let infoUrl = `${ FLOW_CORE_HOST }/projectAndProcess/getHistoryByFlowIds?`;
	_.each(tasks, (one) => {
		infoUrl += `flowIds%5B%5D=${ one.processInstanceId }&`;
	});
	infoUrl = infoUrl.slice(0, infoUrl.length - 1);
	const taskInfos = await fetch(infoUrl, {
		method: 'GET',
		headers: {
			'Auth-Token': user.token,
			'Auth-uid': user.id
		}
	})
		.then(data => data.json())
		.then((data) => {
			if (data.success) {
				return data.content;
			}
			return [];
		})
		.catch(err => console.log(err));

	// 组合finalTasks
	const finalTasks = _.map(tasks, (item) => {
		const info = _.find(taskInfos, { processId: item.processInstanceId });
		const type = item.processDefinitionId.split(':')[0];
		return {
			...item,
			metaName: info.title,
			metaId: info.externalIds,
			metaMemo: info.memo,
			uri: _.isEmpty(type) ? '/_none/' : `/${ type }/`,
			flowStatus: info.flowStatus
		};
	});
	return {
		finalTasks,
		loadingMore
	};
}

export const taskTemplate = {
	projectTaskTemplate: [{
		activityName: '项目申请审批'
	}, {
		activityName: '部门领导'
	}, {
		activityName: '知识管理'
	}, {
		activityName: 'IT管理'
	}, {
		activityName: '结束'
	}],
	graphTaskTemplate: [{
		activityName: '图纸申请审批'
	}, {
		activityName: '设计'
	}, {
		activityName: '校对'
	}, {
		activityName: '专业负责人'
	}, {
		activityName: '会签'
	}, {
		activityName: '审核'
	}, {
		activityName: '审定'
	}, {
		activityName: '设总'
	}, {
		activityName: '项目经理'
	}, {
		activityName: '档案审批人'
	}, {
		activityName: '结束'
	}]
};
