export default {
	data() {
		return {
			qaObj: {
				prompt: "",
				answer: ""
			},
			problem: '',
			answer: '',
			show: false,
			key: '',
			chat: [],
			type: '',
			token: ''
		}
	},
	onShow() {
		this.init()
	},
	methods: {
		// 初始化
		init() {
			// this.chat = uni.getStorageSync('historyProblem') || []
			this.key = uni.getStorageSync('key') || ''
			this.token = uni.getStorageSync('token') || ''
			this.uid = uni.getStorageSync('uid') || ''
			if (!this.uid) {
				this.setStorageUid()
				this.token = uni.getStorageSync('token') || ''
			} else {
				console.log(`uid ${this.uid}`)
			}
		},
		// 复制
		copy(val) {
			uni.setClipboardData({
				data: this.answer || val,
				success: function() {
					uni.showToast({
						title: '复制成功',
						icon: 'none'
					})
				}
			});
		},
		// 切换key
		changeKey() {
			uni.setStorageSync('key', this.key)
			this.show = false
		},
		// 下个问题
		next() {
			uni.removeStorageSync('historyProblem');
			this.init()
			uni.showToast({
				title: '已清除！'
			})
		},
		// 滚动到最底部
		toBottom() {
			this.$nextTick(() => uni.pageScrollTo({
				scrollTop: 9999,
				duration: 300
			}))
		},
		// 获取问题答案
		async getAnswer() {

			if (this.problem == '清除记忆') {
				this.next()
				return
			}
			if (!this.problem) {
				uni.showToast({
					title: '你还没有输入问题呢！',
					icon: 'none'
				})
				return
			}

			this.chat = [
				...this.chat,
				{
					name: 'my',
					message: this.problem,
					status: 'success'
				},
				{
					name: 'chatgpt',
					message: '',
					status: 'loading'
				}
			]
			console.log("this.chat")
			console.log(this.chat)
			let index = this.chat.length - 1
			let loading
			if (this.type === 'chat') {
				this.problem = ''
				this.toBottom()
			} else {
				loading = true
				this.answer = '思考中'
				const sleep = (ms) => {
					setTimeout(() => {
						if (loading == true) {
							if (this.answer == '思考中...') {
								this.answer = '思考中'
							} else {
								this.answer += '.'
							}
							sleep(ms)
						} else {

						}
					}, ms)
				}
				sleep(300)
			}
			try {

				// https://api.openai.com/v1/chat/completions
				// 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

				const {
					data
				} = await uni.$u.http.post('/v1/chat/completions', {
					"model": "gpt-3.5-turbo",
					"messages": [{
						"role": "user",
						"content": this.handlePrompt()
					}]
				}, {
					header: {
						"Authorization": "Bearer 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"
					},
					timeout: 300000 // 由于接口请求时间较长
				})

				if (data.choices[0]) {
					let c = data.choices[0].message.content
					this.answer = c
					this.$set(this.chat, index, {
						name: 'chatgpt',
						message: c,
						status: 'success'
					})
				} else {
					let e = "服务器繁忙, 联系邮箱：private.sure@tuta.io"
					this.answer = e
					this.$set(this.chat, index, {
						name: 'chatgpt',
						message: e,
						status: 'error'
					})
				}

				console.log(this.chat)
			} catch (e) {
				this.answer = e
				this.$set(this.chat, index, {
					name: 'chatgpt',
					message: JSON.stringify(e),
					status: 'error'
				})
			}
			uni.setStorageSync('historyProblem', this.chat)
			if (this.type === 'chat') {
				this.toBottom()
			} else {
				loading = false
			}
		},
		handlePrompt() {
			let query = ''
			this.chat.forEach(item => {
				if (item.status == 'success') {
					switch (item.name) {
						case 'my':
							query += `\nQ: ${item.message}`
							break;
						case 'chatgpt':
							query += `\nA: ${item.message}`
							break;
						default:
							break;
					}
				}

			})
			query += `<|endoftext|>\n\nA: `
			return query
		},
		setStorageUid() {
			uni.request({
				url: 'https://www.uuid.online/uuidbackend/generate/?num=1&uuidversion=UUID5&checkbox=true',
				method: 'GET',
				header: {
					'Host': 'www.uuid.online',
					'Referer': 'https://www.uuid.online/',
					'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36'
				},
				success: (res) => {
					let id = res.data[0]
					if (id.length == 32) {
						console.log(`uuid api result ${id}`)
					} else {
						id = this.generateUuid()
						console.log(`generateUuid method result ${id}`);
					}
					uni.setStorageSync('uid', id)
					// build token
				},
				fail() {
					let id = this.generateUuid()
					console.log(`api request failed, generateUuid method result ${id}`);
					uni.setStorageSync('uid', id)
				}
			});
		},
		generateUuid() {
			return 'xxxxxxxx-xxxx-xxxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
				var r = (Math.random() * 16) | 0,
					v = c == 'x' ? r : (r & 0x3) | 0x8;
				return v.toString(16);
			}).replace('-', '');
		},


		async getQaAnswer() {
			let stopFlag = { stop: false }
			this.loading(()=> {
				return this.qaObj.answer
			}, (t) => { 
				this.$set(this.qaObj,'answer', t) 
			}, ()=>{
				return stopFlag.stop
			})
			
			const {
				data
			} = await uni.$u.http.post('/v1/completions', {
				"model": "text-davinci-003",
				"prompt": this.qaObj.prompt,
				"max_tokens": 2048,
				"temperature": 0.8,
				// "top_p": 1,
				// "n": 1,
				"stream": false,
				// "logprobs": null,
				// "stop": "\n"
			}, {
				header: {
					"Authorization": "Bearer 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",
					"uid": "",
					"token": ""
				},
				timeout: 300000 // 由于接口请求时间较长
			})
			
			stopFlag.stop = true
			
			let answer 
			if (data.choices[0]) {
				answer = data.choices[0].text
			} else {
				answer = "服务器繁忙, 联系邮箱：private.sure@tuta.io"
			}
			
			// this.qaObj.answer = e
			this.$set(this.qaObj,'answer', answer)
		},
		loading(getText, setText, stop) {
			let loading = true
			let x = 0
			setText('思考中')
			const sleep = (ms) => {
				setTimeout(() => {
					if (loading == true) {
						if (getText() == '思考中...') {
							setText('思考中')
						} else {
							setText(getText() + '.')
						}
						console.log("stop()" + stop())
						x += 1
						if(x == 60 || stop()) {
							return
						}
						sleep(ms)
					} else {
			
					}
				}, ms)
			}
			sleep(500)
		}
	}

}
