uni.$u.http.setConfig((config) => {
    /* config 为默认全局配置*/
	if (process.env.NODE_ENV === 'development0') {
		config.baseURL = `http://127.0.0.1:8001`; /* 根域名 */
	} else {
		config.baseURL = `https://api.openai.com`; /* 根域名 */
	}
    return config
})