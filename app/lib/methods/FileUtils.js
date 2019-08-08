import { Platform } from 'react-native';
import _ from 'lodash';
import { Toast } from '@ant-design/react-native';
import { TEAM_CORE_HOST } from '../../constants/Constants';

export function uploadImageFile(file, user, rid) {
	let uploadFile = { type: file.mime };
	if (Platform.OS === 'android') {
		uploadFile = {
			...uploadFile,
			uri: file.path,
			name: (file.name.split('.')[file.name.split('.').length - 1] === file.mime.split('/')[file.mime.split('/').length - 1] ? file.name : `${ file.name }.${ file.mime.split('/')[file.mime.split('/').length - 1] }`).replace(/[^\x00-\x7F]/g, '')
		};
	} else if (Platform.OS === 'ios') {
		uploadFile = {
			...uploadFile,
			uri: file.sourceURL,
			name: file.name
		};
	}
	const formData = new FormData();
	formData.append('file', uploadFile);
	formData.append('fileName', uploadFile.name);
	formData.append('groupId', rid);

	fetch(`${ TEAM_CORE_HOST }/fileManager/uploadGroupFile`, {
		method: 'POST',
		headers: {
			'Auth-Token': user.token,
			'Auth-uid': user.id,
			'Content-Type': 'multipart/form-data'
		},
		body: formData
	})
		.then(data => data.json())
		.then((res) => {
			if (res.success) {
				Toast.success('文件上传成功', 1);
			} else {
				Toast.fail('文件上传失败', 1);
			}
		})
		.catch((err) => {
			console.log(err);
			Toast.fail('文件上传失败', 1);
		});
}

export function loadFiles(user, rid) {
	return fetch(`${ TEAM_CORE_HOST }/fileManager/getGroupFileList?groupId=${ rid }`, {
		method: 'GET',
		headers: {
			'Auth-Token': user.token,
			'Auth-uid': user.id
		}
	})
		.then(data => data.json())
		.then((data) => {
			if (data.success) {
				return _.sortBy(data.content, 'id')
					.reverse();
			}
			return [];
		})
		.catch(err => console.log(err));
}

export function isImageFile(fileName) {
	const reg = /(.*)\.(jpg|bmp|gif|ico|pcx|jpeg|tif|png|raw|tga)$/i;
	return reg.test(fileName);
}

export function getFilePreviewUrl(fileId) {
	return `${ TEAM_CORE_HOST }/wopi/files/${ fileId }/contents`;
}

export function deleteFile(fileId, user) {
	return fetch(`${ TEAM_CORE_HOST }/fileManager/deleteGroupFile?fileId=${ fileId }`, {
		method: 'POST',
		headers: {
			'Auth-Token': user.token,
			'Auth-uid': user.id
		}
	})
		.then(data => data.json())
		.then((res) => {
			if (res.success) {
				Toast.success('文件删除成功', 1);
				return {
					fileId,
					success: true
				};
			}
			Toast.fail('文件删除失败', 1);
			return { success: false };
		})
		.catch((err) => {
			console.log(err);
			Toast.fail('文件删除失败', 1);
		});
}
