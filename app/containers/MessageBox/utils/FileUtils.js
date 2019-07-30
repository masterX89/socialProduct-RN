import { Toast } from '@ant-design/react-native';
import { TEAM_CORE_HOST } from '../../../constants/Constants';

export function uploadImageFile(file, user, rid) {
	const uploadFile = {
		uri: file.sourceURL,
		type: file.mime,
		name: file.filename
	};
	const formData = new FormData();
	formData.append('file', uploadFile);
	formData.append('fileName', file.filename);
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
