export default {
	methods:{
		ad(position){
			let ad = null//uni.getStorageSync('ad')
			if(!ad){
				return [
					{
						"id": 0,
						"title": "反馈",
						"desc": "遇到问题可以邮箱联系：private.sure@tuta.io",
						"remarks":"Email: private.sure@tuta.io"
					}
				]
			}
			// return ad.filter(item => item.position == position)
		}
	}
}
