export default {
	secret: '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
	mongo: {
		development: {
			connectionString: 'mongodb://用户名:密码@127.0.0.1:27017/mall'
		},
		production: {
			connectionString: 'mongodb://用户名:密码@127.0.0.1:27017/mall'
		}
	},
	redis: {
		development: {
			connectionString: 'redis://127.0.0.1:6379'
		},
		production: {
			connectionString: 'redis://127.0.0.1:6379',
		}
	},
	upload: {
		tmp : 'public/tmp/',
		path: 'public/uploads/'
	},
	superAdmin: {
		username: 'admin', 
		password: '123456', 
	},s
	orderStatus: {
		'submitted': '已提交', 
		'canceled' : '已取消', 
		'confirmed': '已确认', 
		'finished' : '已完成', 
	},
	wechat: {
		appid: '',
		secret: '',
		mch_id: '',
		goodsclass: '公司-调味品',
        notifyurl:'http://',
		mch_key:'',
	},
}