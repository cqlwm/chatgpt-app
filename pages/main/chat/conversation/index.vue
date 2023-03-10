<template>
	<view class="chat">
		<view class="chat-item">
			<view v-for="item in ad('2')" :key="item.id">
				<view class="chat-item__left u-flex">
					<u-avatar src="../../../../static/avatar.jpeg" shape="square"></u-avatar>
					<view class="chat-item__left-right">
						<view class="chat-item__left-name"> Chat GPT </view>
						<view class="chat-item__left-bottom">
							<view class="chat-item__left-message">
								<mp-html :content="item.desc"></mp-html>
							</view>
							<view v-if="item.id == 0" style="margin-top:auto;">
								<u-icon v-show="true" @tap="copy(item.desc)" name="file-text"></u-icon>
							</view>
						</view>
					</view>
				</view>
			</view>
		</view>
		<view class="chat-item" v-for="(item, index) in chat" :key="index">
			<!-- 机器人消息 -->
			<u-transition :show="true" mode="fade-left" v-if="item.name == 'chatgpt'">
				<view class="chat-item__left u-flex">
					<u-avatar src="../../../../static/avatar.jpeg" shape="square"></u-avatar>
					<view class="chat-item__left-right">
						<view class="chat-item__left-name"> Chat GPT </view>
						<view class="chat-item__left-bottom">
							<view class="chat-item__left-message" @longtap="copy(item.message)">
								<mp-html :content="item.message || '思考中...'" />
							</view>
							<u-loading-icon v-show="item.status == 'loading'"></u-loading-icon>
							<u-icon v-show="item.status == 'error'" name="error"></u-icon>
							<view style="margin-top:auto;">
								<u-icon v-show="item.status == 'success'" @tap="copy(item.message)" name="file-text">
								</u-icon>
							</view>
						</view>
					</view>
				</view>
			</u-transition>
			<!-- 我的消息  -->
			<u-transition :show="true" mode="fade-right" v-else>
				<view class="chat-item__right">
					<view class="chat-item__right-message" @longtap="copy(item.problem)">
						{{ item.message }}
					</view>
					<u-avatar shape="square" :mp-avatar="true"></u-avatar>
				</view>
			</u-transition>
		</view>
		<view style="height:100rpx"></view>
		<view class="send">
			<u--input placeholder="请输入内容" border="surround" v-model="problem" @confirm="getAnswer"></u--input>
			<u-button iconColor="#ffffff" color="#26B3A0" text="发送" @tap="getAnswer">
			</u-button>
		</view>
	</view>
</template>

<script>
	import adMixin from "@/mixins/ad.js"
	export default {
		mixins: [adMixin],
		data() {
			return {
				type: "chat",
				conversationId: "",
				conversationCacheKey: "",
				uid: "",
				chat: [],
				problem: ''
			};
		},
		onShow() {
			this.loadCache()
		},
		onLoad(e) {
			console.log(e)
			this.conversationId = e.conversationId
			this.conversationCacheKey = `conversation_${this.conversationId}`
			this.uid = uni.getStorageSync('uid')
			this.loadCache()
		},
		onHide() {
			this.cache()
		},
		onUnload() {
			this.cache()
		},
		onBackPress() {
			this.cache()
		},
		methods: {
			cache() {
				let conversationData = {
					"chat": this.chat,
					"uid": this.uid
				}
				uni.setStorageSync(this.conversationCacheKey, conversationData)
			},
			loadCache() {
				let d = uni.getStorageSync(this.conversationCacheKey)
				if (d) {
					console.log('onload cache')
					console.log(d)
					this.chat = d.chat
					this.uid = d.uid
				}
				this.toBottom()
			},
			// 复制
			copy(val) {
				uni.setClipboardData({
					data: val,
					success: function() {
						uni.showToast({
							title: '复制成功',
							icon: 'none'
						})
					}
				});
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
				let index = this.chat.length - 1
				this.problem = ''
				this.toBottom()
				
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
						}],
						"user": 'user'+this.uid + '_' + this.conversationCacheKey,
					}, {
						header: {
							"Authorization": "Bearer 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"
						},
						timeout: 600000 // 由于接口请求时间较长
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
				
				this.toBottom()
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
			}
		}
	};
</script>

<style lang="scss" scoped>
	.chat {
		padding: 20rpx;
		box-sizing: border-box;

		&-item {
			&__left {
				display: flex;
				margin-top: 20rpx;

				&-right {
					margin-left: 20rpx;
				}

				&-name {
					font-size: 24rpx;
				}

				&-message {
					margin-top: 10rpx;
					background: #26b3a0;
					padding: 20rpx;
					border-radius: 10rpx;
					font-size: 28rpx;
					color: #fff;
					margin-right: 20rpx;
				}

				&-bottom {
					display: flex;
				}
			}

			&__right {
				display: flex;
				margin-top: 20rpx;
				justify-content: flex-end;

				&-message {
					margin-right: 20rpx;
					background: #f6f6f6;
					padding: 20rpx;
					border-radius: 10rpx;
					font-size: 28rpx;
				}
			}
		}
	}

	.send {
		display: flex;
		background: #fff;
		position: fixed;
		height: 100rpx;
		bottom: var(--window-bottom, 0);
		left: 0;
		width: 100%;
		padding: 20rpx;
		box-sizing: border-box;
		justify-content: space-between;

		.u-input {
			width: 600rpx;
			height: 54rpx;
		}

		.u-button {
			margin-left: 20rpx;
			width: 100rpx;
			height: 80rpx;
		}
	}
</style>
