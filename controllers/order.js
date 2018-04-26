import request from 'request'
import proxy from '../proxy'
import config from '../config'

class Ctrl{
	constructor(app) {
		Object.assign(this, {
			app, 
			model: proxy.order, 
		})

		this.init()
	}

	/**
	 * 初始化
	 */
	init() {
		this.routes()
	}

	/**
	 * 注册路由
	 */
	routes() {
		this.app.get('/api/order', this.getAll.bind(this))
		this.app.get('/api/order/:id', this.get.bind(this))
		this.app.post('/api/order', this.post.bind(this))
		this.app.put('/api/order/:id', this.put.bind(this))
		this.app.delete('/api/order/:id', this.delete.bind(this))
	}

    // 生成签名
    paysignjsapi(appid,body,mch_id,nonce_str,notify_url,openid,out_trade_no,spbill_create_ip,total_fee) {
        const ret = {
            appid: appid,
            body: body,
            mch_id: mch_id,
            nonce_str: nonce_str,
            notify_url:notify_url,
            openid:openid,
            out_trade_no:out_trade_no,
            spbill_create_ip:spbill_create_ip,
            total_fee:total_fee,
            trade_type: 'JSAPI'
        };
        let str = this.raw(ret);
        str = str + '&key='+key;
        let md5Str = cryptoMO.createHash('md5').update(str).digest('hex');
        md5Str = md5Str.toUpperCase();
        return md5Str;
    };
    raw(args) {
        let keys = Object.keys(args);
        keys = keys.sort();
        let newArgs = {};
        keys.forEach(function(key) {
            newArgs[key.toLowerCase()] = args[key];
        });

        let str = '';
        for(let k in newArgs) {
            str += '&' + k + '=' + newArgs[k];
        }
        str = str.substr(1);
        return str;
    };

	paysignjs(appid, nonceStr, package, signType, timeStamp) {
        const ret = {
            appId: appid,
            nonceStr: nonceStr,
            package: package,
            signType: signType,
            timeStamp: timeStamp
        };
        let str = this.raw1(ret);
        str = str + '&key='+key;
        return cryptoMO.createHash('md5').update(str).digest('hex');
    };

    raw1(args) {
        let keys = Object.keys(args);
        keys = keys.sort()
        let newArgs = {};
        keys.forEach(function(key) {
            newArgs[key] = args[key];
        });

        let str = '';
        for(const k in newArgs) {
            str += '&' + k + '=' + newArgs[k];
        }
        str = str.substr(1);
        return str;
    };

    randomString(len) {
        len = len || 32;
        const $chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';    /****默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1****/
        const maxPos = $chars.length;
        var pwd = '';
        for (i = 0; i < len; i++) {
            pwd += $chars.charAt(Math.floor(Math.random() * maxPos));
        }
        return pwd;
    }
	/**
	 * @apiDefine Header
	 * @apiHeader {String} Authorization jsonwebtoken
	 */
	
	/**
	 * @apiDefine Success
	 * @apiSuccess {Object} meta 状态描述
	 * @apiSuccess {Number} meta.code 标识码，0表示成功，1表示失败
	 * @apiSuccess {String} meta.message 标识信息
	 * @apiSuccess {Object} data 数据内容
	 */
	
	/**
	 * @api {get} /order 列出所有资源
	 * @apiDescription 列出所有资源
	 * @apiName getAll
	 * @apiGroup order
	 * 
	 * @apiParam {String} [page=1] 指定第几页
	 * @apiParam {String} [limit=10] 指定每页的记录数
	 * @apiParam {Boolean} [is_show] 指定is_show过滤
	 *
	 * @apiPermission none
	 * @apiSampleRequest /order
	 * 
	 * @apiUse Header
	 * @apiUse Success
	 *
	 * @apiSuccessExample Success-Response:
	 *     HTTP/1.1 200 OK
	 *     {
	 *       "meta": {
	 *       	"code": 0,
	 *       	"message": "调用成功"
	 *       },
	 *       "data": [{
	 *       	"_id": "_id",
	 *       	"images": [{
	 *       		"_id": "_id",
	 *       		"name": "name",
	 *       		"path": "path",
	 *       		"create_at": "create_at"
	 *       	}],
	 *       	"is_show": "is_show",
	 *       	"remark": "remark",
	 *       	"sort": "sort",
	 *       	"title": "title",
	 *       	"create_at": "create_at",
	 *       	"update_at": "update_at"
	 *       }]
	 *     }
	 */
	getAll(req, res, next) {
		const status = req.query.type

		const query = {
			user  : req.user._id,
			status: status,
		}

		status === 'all' && delete query.status

		const opts = {
			page : req.query.page, 
			limit: req.query.limit, 
		}

		const params = {
			query  : query, 
			fields : {}, 
			options: opts, 
		}

		const options = {
			path    : 'user', 
			select  : {}, 
		}

		Promise.all([
			this.model.countAsync(query), 
			this.model.findAndPopulateAsync(params, options), 
		])
		.then(docs => {
			res.tools.setJson(0, '调用成功', {
				items   : docs[1], 
				paginate: res.paginate(Number(opts.page), Number(opts.limit), docs[0]), 
			})
		})
		.catch(err => next(err))
	}
	
	/**
	 * @api {get} /order/:id 获取某个指定资源的信息
	 * @apiDescription 获取某个指定资源的信息
	 * @apiName get
	 * @apiGroup order
	 *
	 * @apiParam {String} id 资源ID
	 *
	 * @apiPermission none
	 * @apiSampleRequest /order/:id
	 * 
	 * @apiUse Header
	 * @apiUse Success
	 *
	 * @apiSuccessExample Success-Response:
	 *     HTTP/1.1 200 OK
	 *     {
	 *       "meta": {
	 *       	"code": 0,
	 *       	"message": "调用成功"
	 *       },
	 *       "data": {
	 *       	"_id": "_id",
	 *       	"images": [{
	 *       		"_id": "_id",
	 *       		"name": "name",
	 *       		"path": "path",
	 *       		"create_at": "create_at"
	 *       	}],
	 *       	"is_show": "is_show",
	 *       	"remark": "remark",
	 *       	"sort": "sort",
	 *       	"title": "title",
	 *       	"create_at": "create_at",
	 *       	"update_at": "update_at"
	 *       }
	 *     }
	 */
	get(req, res, next) {
		const query = {
			_id : req.params.id, 
			user: req.user._id, 
		}

		const params = {
			query  : query, 
			fields : {}, 
			options: {}, 
		}

		const options = {
			path    : 'user', 
			select  : {}, 
		}

		this.model.findOneAndPopulateAsync(params, options)
		.then(doc => {
			if (!doc) return res.tools.setJson(1, '资源不存在或已删除')
			return res.tools.setJson(0, '调用成功', doc)
		})
		.catch(err => next(err))
	}

	/**
	 * @api {post} /order 新建一个资源
	 * @apiDescription 新建一个资源
	 * @apiName post
	 * @apiGroup order
	 *
	 * @apiParam {String} title 标题
	 * @apiParam {String} remark 描述
	 * @apiParam {Number} sort 排序
	 * @apiParam {Boolean} is_show 是否显示
	 * @apiParam {Array} images 图片
	 *
	 * @apiPermission none
	 * @apiSampleRequest /order
	 * 
	 * @apiUse Header
	 * @apiUse Success
	 *
	 * @apiSuccessExample Success-Response:
	 *     HTTP/1.1 200 OK
	 *     {
	 *       "meta": {
	 *       	"code": 0,
	 *       	"message": "新增成功"
	 *       },
	 *       "data": {
	 *       	"_id": "_id"
	 *       }
	 *     }
	 */
	post(req, res, next) {
		const body = {
			items      : [], 
			totalAmount: 0, 
			address_id : req.body.address_id, 
			user       : req.user._id, 
		}

		const query = {
			_id: {
				$in: req.body.items.map(n => n.id),
			},
		}

		const params = {
			query  : query, 
			fields : {}, 
			options: {}, 
		}

		const options = {
			path    : 'types', 
			select  : {}, 
		}

		proxy.address.findByIdAsync(body.address_id)
		.then(doc => {
			if (!doc) return res.tools.setJson(1, '地址不存在或已删除')
			body.recipientName = doc.name
			body.recipientGender = doc.gender
			body.recipientTel = doc.tel
			body.recipientAddress = doc.address
			return proxy.goods.findAndPopulateAsync(params, options)
		})
		.then(doc => {
			doc.forEach(n => {
				const items = {
					goods: n,
					meta : {},
				}
				req.body.items.forEach(m => {
					if (n._id.toString() === m.id.toString()) {
						items.meta.total = Math.abs(m.total)
						items.meta.totalAmount = Math.abs(n.price * m.total)
						body.totalAmount += items.meta.totalAmount
					}
				})
				body.items.push(items)
			})
			return this.model.post(body)
		})
        .then(doc=>{
            const param = req.query || req.params;
            const openid = param.openid;
            const spbill_create_ip = req.ip.replace(/::ffff:/, ''); // 获取客户端ip
            const pay_body = config.wechat.goodsclass; // 商品描述
            const notify_url = 'https://www.hgdqdev.cn/api/wxpay' // 支付成功的回调地址  可访问 不带参数
            const nonce_str = this.randomString(); // 随机字符串
            const out_trade_no = doc._id; // 商户订单号
            const total_fee = Math.abs(doc.totalAmount*100); // 订单价格 单位是 分
            const timestamp = Math.round(new Date().getTime()/1000); // 当前时间
			const mch_id = config.wechat.mch_id;//商户号
			const appid = config.wechat.appid;//小程序id

            let bodyData = '<xml>';
            bodyData += '<appid>' + appid + '</appid>';  // 小程序ID
            bodyData += '<body>' + pay_body + '</body>'; // 商品描述
            bodyData += '<mch_id>' + mch_id + '</mch_id>'; // 商户号
            bodyData += '<nonce_str>' + nonce_str + '</nonce_str>'; // 随机字符串
            bodyData += '<notify_url>' + notify_url + '</notify_url>'; // 支付成功的回调地址
            bodyData += '<openid>' + openid + '</openid>'; // 用户标识
            bodyData += '<out_trade_no>' + out_trade_no + '</out_trade_no>'; // 商户订单号
            bodyData += '<spbill_create_ip>' + spbill_create_ip + '</spbill_create_ip>'; // 终端IP
            bodyData += '<total_fee>' + total_fee + '</total_fee>'; // 总金额 单位为分
            bodyData += '<trade_type>JSAPI</trade_type>'; // 交易类型 小程序取值如下：JSAPI
            // 签名
            const sign = this.paysignjsapi(
                appid,
                pay_body,
                mch_id,
                nonce_str,
                notify_url,
                openid,
                out_trade_no,
                spbill_create_ip,
                total_fee
            );
            bodyData += '<sign>' + sign + '</sign>';
            bodyData += '</xml>';
            // 微信小程序统一下单接口
            const urlStr = 'https://api.mch.weixin.qq.com/pay/unifiedorder';
            request({
                url: urlStr,
                method: 'POST',
                body: bodyData
            }, function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    let returnValue = {};
                    parseString(body, function (err, result) {
                        if (result.xml.return_code[0] == 'SUCCESS') {
                            returnValue.msg = '操作成功';
                            returnValue.status = '100';
                            returnValue.out_trade_no = out_trade_no;  // 商户订单号
                            // 小程序 客户端支付需要 nonceStr,timestamp,package,paySign  这四个参数
                            returnValue.nonceStr = result.xml.nonce_str[0]; // 随机字符串
                            returnValue.timestamp = timestamp.toString(); // 时间戳
                            returnValue.package = 'prepay_id=' + result.xml.prepay_id[0]; // 统一下单接口返回的 prepay_id 参数值
                            returnValue.paySign = this.paysignjs(appid, returnValue.nonceStr, returnValue.package, 'MD5',timestamp); // 签名
                            //res.end(JSON.stringify(returnValue));
                            res.tools.setJson(0, '统一下单成功', JSON.stringify(returnValue));
                        } else{
                            returnValue.msg = result.xml.return_msg[0];
                            returnValue.status = '102';
                            //res.end(JSON.stringify(returnValue));
                            res.tools.setJson(0, '统一下单失败', JSON.stringify(returnValue));
                        }
                    });
                }
            })
        })
		/*.then(doc => {
			proxy.cart.removeAsync({
				user: req.user._id,
				goods: {
					$in: req.body.items.map(n => n.id),
				},
			})
			res.tools.setJson(0, '统一下单成功', doc)
		})*/
		.catch(err => next(err))
	}

	/**
	 * @api {put} /order/:id 更新某个指定资源的信息
	 * @apiDescription 更新某个指定资源的信息
	 * @apiName put
	 * @apiGroup order
	 *
	 * @apiParam {String} id 资源ID
	 * @apiParam {String} [title] 标题
	 * @apiParam {String} [remark] 描述
	 * @apiParam {Number} [sort] 排序
	 * @apiParam {Boolean} [is_show] 是否显示
	 * @apiParam {Array} [images] 图片
	 *
	 * @apiPermission none
	 * @apiSampleRequest /order/:id
	 * 
	 * @apiUse Header
	 * @apiUse Success
	 *
	 * @apiSuccessExample Success-Response:
	 *     HTTP/1.1 200 OK
	 *     {
	 *       "meta": {
	 *       	"code": 0,
	 *       	"message": "更新成功"
	 *       },
	 *       "data": {
	 *       	"_id": "_id",
	 *       	"images": [{
	 *       		"_id": "_id",
	 *       		"name": "name",
	 *       		"path": "path",
	 *       		"create_at": "create_at"
	 *       	}],
	 *       	"is_show": "is_show",
	 *       	"remark": "remark",
	 *       	"sort": "sort",
	 *       	"title": "title",
	 *       	"create_at": "create_at",
	 *       	"update_at": "update_at"
	 *       }
	 *     }
	 */
	put(req, res, next) {
		const query = {
			_id : req.params.id, 
			user: req.user._id, 
		}

		const body = {
			title    : req.body.title,
			remark   : req.body.remark,
			sort     : req.body.sort || 99,
			is_show  : req.body.is_show,
			images   : req.body.images,
		}

		this.model.put(query, body)
		.then(doc => {
			if (!doc) return res.tools.setJson(1, '资源不存在或已删除')
			return res.tools.setJson(0, '更新成功', doc)
		})
		.catch(err => next(err))
	}

	/**
	 * @api {delete} /order/:id 删除某个指定资源
	 * @apiDescription 删除某个指定资源
	 * @apiName delete
	 * @apiGroup order
	 *
	 * @apiParam {String} id 资源ID
	 * @apiSampleRequest /order/:id
	 * 
	 * @apiPermission none
	 * 
	 * @apiUse Header
	 * @apiUse Success
	 *
	 * @apiSuccessExample Success-Response:
	 *     HTTP/1.1 200 OK
	 *     {
	 *       "meta": {
	 *       	"code": 0,
	 *       	"message": "删除成功"
	 *       },
	 *       "data": null
	 *     }
	 */
	delete(req, res, next) {
		const query = {
			_id : req.params.id, 
			user: req.user._id, 
		}
		
		this.model.delete(query)
		.then(doc => {
			if (!doc) return res.tools.setJson(1, '资源不存在或已删除')
			return res.tools.setJson(0, '删除成功')
		})
		.catch(err => next(err))
	}
}

export default Ctrl