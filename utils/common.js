export function uuid() {
	return 'xxxxxxxxxxxxxxxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		var r = (Math.random() * 16) | 0,
			v = c == 'x' ? r : (r & 0x3) | 0x8;
		return v.toString(16);
	});
}

export async function uuid2() {
	const {
		data
	} = await uni.$u.http.get(
		'https://www.uuid.online/uuidbackend/generate/?num=1&uuidversion=UUID5&checkbox=true', {
			header: {
				'Host': 'www.uuid.online',
				'Referer': 'https://www.uuid.online/',
				'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36'
			},
			timeout: 300000 // 由于接口请求时间较长
		},
	)
	let id = data[0]
	if (id) {
		return id
	} else {
		return uuid()
	}
}
