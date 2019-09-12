import { Platform } from 'react-native';
import _ from 'lodash';
import { Base64 } from 'js-base64';
import { Toast } from '@ant-design/react-native';
import { TEAM_CORE_HOST } from '../../constants/Constants';

export const fileOpt = {
	isEditableFilePattern: /\.(txt|diff?|patch|svg|asc|cnf|cfg|conf|html?|.html|cfm|cgi|aspx?|ini|pl|py|md|css|cs|js|jsp|log|htaccess|htpasswd|gitignore|gitattributes|env|json|atom|eml|rss|markdown|sql|xml|xslt?|sh|rb|as|bat|cmd|cob|for|ftn|frm|frx|inc|lisp|scm|coffee|php[3-6]?|java|c|cbl|go|h|scala|vb|tmpl|lock|go|yml|yaml|tsv|lst)$/i,
	isViewableFilePattern: /\.(doc|docm|docx|dot|dotm|dotx|odt|odp|pot|potm|potx|pps|ppsm|ppsx|ppt|pptm|pptx|ods|xls|xlsb|xlsm|xlsx|pdf|one|onetoc2?)$/i,
	isProjectImagePattern: /\.(dwg?)$/i,
	isImageFilePattern: /\.(jpe?g|gif|bmp|png|svg|tiff?)$/i,
	isExtractableFilePattern: /\.(gz|tar|rar|g?zip)$/i,
	officeWordTypePattern: /\.(doc|docm|docx|dot|dotm|dotx|odt?)$/i,
	officePptTypePattern: /\.(odp|pot|potm|potx|pps|ppsm|ppsx|ppt|pptm|pptx?)$/i,
	officeExcelTypePattern: /\.(ods|xls|xlsb|xlsm|xlsx?)$/i,
	pdfTypePattern: /\.(pdf?)$/i,
	officeOneNoteTypePattern: /\.(one|onetoc2?)$/i,
	isBase64CodePattern: /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/
};

export const extensionToMime = {
	dwg: 'application/acad',
	exe: 'application/octet-stream',
	doc: 'application/vnd.ms-word',
	xls: 'application/vnd.ms-excel',
	ppt: 'application/vnd.ms-powerpoint',
	pdf: 'application/pdf',
	xml: 'application/xml',
	gz: 'application/x-gzip',
	tgz: 'application/x-gzip',
	bz: 'application/x-bzip2',
	bz2: 'application/x-bzip2',
	tbz: 'application/x-bzip2',
	zip: 'application/zip',
	rar: 'application/x-rar',
	tar: 'application/x-tar',
	'7z': 'application/x-7z-compressed',
	txt: 'text/plain',
	php: 'text/x-php',
	html: 'text/html',
	htm: 'text/html',
	js: 'text/javascript',
	css: 'text/css',
	sh: 'text/x-shellscript',
	sql: 'text/x-sql',
	bmp: 'image/x-ms-bmp',
	jpg: 'image/jpeg',
	jpeg: 'image/jpeg',
	gif: 'image/gif',
	png: 'image/png',
	tif: 'image/tiff',
	tiff: 'image/tiff',
	tga: 'image/x-targa',
	psd: 'image/vnd.adobe.photoshop',
	mp3: 'audio/mpeg',
	mid: 'audio/midi',
	ogg: 'audio/ogg',
	mp4a: 'audio/mp4',
	wav: 'audio/wav',
	wma: 'audio/x-ms-wma',
	avi: 'video/x-msvideo',
	dv: 'video/x-dv',
	mp4: 'video/mp4',
	mpeg: 'video/mpeg',
	mpg: 'video/mpeg',
	mov: 'video/quicktime',
	wm: 'video/x-ms-wmv',
	flv: 'video/x-flv',
	mkv: 'video/x-matroska'
};

export function uploadFile(file, user, rid) {
	let willUploadFile = { type: file.mime };
	if (Platform.OS === 'android') {
		willUploadFile = {
			...willUploadFile,
			uri: file.path,
			name: Base64.encode(file.name.split('.')[file.name.split('.').length - 1] === file.mime.split('/')[file.mime.split('/').length - 1] ? file.name : `${ file.name }.${ file.mime.split('/')[file.mime.split('/').length - 1] }`)
		};
	} else if (Platform.OS === 'ios') {
		willUploadFile = {
			...willUploadFile,
			uri: file.sourceURL,
			name: file.name
		};
	}
	const formData = new FormData();
	formData.append('file', willUploadFile);
	formData.append('fileName', willUploadFile.name);
	formData.append('groupId', rid);

	return fetch(`${ TEAM_CORE_HOST }/fileManager/uploadGroupFile`, {
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
				return res;
			}
			Toast.fail('文件上传失败', 1);
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
