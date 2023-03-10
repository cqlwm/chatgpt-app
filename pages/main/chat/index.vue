<template>
	<view class="u-page">
		<u-list @scrolltolower="scrolltolower">
			<u-list-item v-for="(item, index) in conversations" :key="index">
				<u-cell :title="item.title" @tap='intoConversation(item.cid)'>
					<u-avatar
						slot="icon"
						shape="square"
						size="35"
						:src="avatarUrl"
						customStyle="margin: -3px 5px -3px 0"
					></u-avatar>
				</u-cell>
			</u-list-item>
		</u-list>
	</view>
</template>

<script>
	import { uuid } from "@/utils/common.js";
	export default {
		data() {
			return {
				conversations: [
					{
						title: 'New Chat',
						cid: '0'
					}
				],
				avatarUrl: 'https://s2.loli.net/2023/03/08/rW6TOgkCMSZVejG.jpg'
			}
		},
		onLoad() {
			this.loadmore()
		},
		methods: {
			scrolltolower() {
				this.loadmore()
			},
			loadmore() {
				
			},
			intoConversation(cid) {
				if((cid * 0) == 0) {
					let conversationId = uuid()
					console.log('intoConversation ' + conversationId)
					uni.navigateTo({
						url: 'conversation/index?conversationId=' + conversationId,
						fail: (e) => {
							console.log("navigateTo fail")
							console.log(e)
						},
						success: (e) => {
							this.conversations = [
								...this.conversations,
								{
									title: conversationId,
									cid: conversationId 
								}
							]
						}
					});
					// newConversation
				} else {
					uni.navigateTo({
						url: 'conversation/index?conversationId=' + cid
					});
					// intoConversation
				}
			}
		},
	}
</script>

<style lang="scss">
</style>
