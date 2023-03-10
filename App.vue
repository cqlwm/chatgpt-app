<script>
	import { uuid2 } from "@/utils/common.js";
	export default {
		onLaunch: async function() {
			console.log('onLaunch')
			this.getAd()
			let uid = await uuid2()
			uni.setStorageSync("uid", uid)
		},
		onShow: function() {
			console.log('App Show')
		},
		onHide: function() {
			console.log('App Hide')
		},
		methods:{
			async getAd() {
				// const {
				// 	data
				// } = await uni.$u.http.post('/app/ad/info/list', {
				// 	"position": this.adPosition,
				// }, {
				// 	timeout: 300000
				// })
				// uni.hideLoading()
				// if (data.code != 1000) {
				// 	uni.showToast({
				// 		title: data.message,
				// 		icon: 'none'
				// 	})
				// }
				// uni.setStorageSync('ad', data.data)
				uni.setStorageSync('ad', {})
			}
		}
	}
</script>

<style lang="scss">
	/* 注意要写在第一行，同时给style标签加入lang="scss"属性 */
	@import "uview-ui/index.scss";

	page {
		font-size: 28rpx;
	}
</style>
