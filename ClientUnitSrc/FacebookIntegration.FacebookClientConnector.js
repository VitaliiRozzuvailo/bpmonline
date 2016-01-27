requirejs.config({
	paths: {
		"facebook": "//connect.facebook.net/en_US/all",
		"facebook-debug": "//connect.facebook.net/en_US/all/debug"
	},
	shim: {
		"facebook": {
			exports: "FB"
		},
		"facebook-debug": {
			exports: "FB"
		}
	}
});
define("FacebookClientConnector", ["FacebookClientConnectorResources", "facebook", "BaseClientConnector",
		"FacebookServiceRequest", "ExecuteBatchRequest", "SearchResultViewModel"], function(resources, facebook) {
	/**
	 * @class Terrasoft.configuration.social.FacebookClientConnector
	 * Класс реализующий работу с социальной сетью Facebook с клиента.
	 */
	Ext.define("Terrasoft.configuration.social.FacebookClientConnector", {
		extend: "Terrasoft.configuration.social.BaseClientConnector",
		alternateClassName: "Terrasoft.FacebookClientConnector",

		//region Properties: Private

		serviceRequestClassName: "Terrasoft.FacebookServiceRequest",

		cookie: false,
		xfbml: false,

		STATUS_CONNECTED: "connected",
		STATUS_NOT_AUTHORIZED: "not_authorized",
		STATUS_UNKNOWN: "unknown",

		pageFields: "name,picture.type(large).width(100).height(100){{url,is_silhouette}},cover,category" +
			",website,phone,location",
		userFields: "id,name,picture.type(large).width(100).height(100){{url,is_silhouette}},cover",

		//endregion

		//region Methods: Private

		/**
		 * Инициализирует Api для работы с внешним ресурсом.
		 * @private
		 */
		initApi: function() {
			facebook.init({
				appId: this.consumerKey,
				version: this.consumerVersion,
				cookie: this.cookie,
				xfbml: this.xfbml
			});
		},

		prepareBatchSearchConfig: function(config) {
			return {
				contractName: "ExecuteSearch",
				commands: [
					this.getPageSearchCommand(config),
					this.getUserSearchCommand(config)
				]
			};
		},

		fillResponseCollection: function(collection, entities) {
			Terrasoft.each(entities, function(entity) {
				var id = entity.id;
				collection.add(id, Ext.create("Terrasoft.SearchResult", {
					values: {
						Id: id,
						Name: entity.name,
						Photo: entity.imageUrl,
						IsDefaultPhoto: entity.isDefaultImage,
						Cover: entity.coverUrl,
						Category: entity.category,
						Web: entity.website,
						Phone: entity.phone,
						Country: entity.country,
						City: entity.city
					}
				}));
			}, this);
		},

		parseExecuteSearchResponse: function(response, callback, scope) {
			if (response.success) {
				var collection = response.collection = Ext.create("Terrasoft.BaseViewModelCollection");
				var text = response.text;
				var json = JSON.parse(text);
				var data = json.data || [json];
				this.fillResponseCollection(collection, data);
			}
			callback.call(scope, response);
		},

		parseExecuteBatchSearchResponse: function(response, callback, scope) {
			if (response.success) {
				var collection = response.collection = Ext.create("Terrasoft.BaseViewModelCollection");
				this.fillResponseCollection(collection, response.entities);
			}
			callback.call(scope, response);
		},

		//endregion

		//region Methods: Protected

		/**
		 * Осуществляет вход пользователя во внешний ресурс.
		 * @protected
		 * @param {Function} callback Функция обратного вызова.
		 * @param {Object} scope Контекст вызова функции обратного вызова.
		 */
		login: function(callback, scope) {
			facebook.login(function(response) {
				callback.call(scope, response);
			});
		},

		/**
		 * Возвращает информацию о состоянии авторизации пользователя во внешнем ресурсе.
		 * @param {Object} config Параметры получения информации.
		 * @param {Boolean} config.force Указывает на то, что необходимо сделать запрос,
		 * а не использовать закешированную копию информации.
		 * @param {Function} callback Функция обратного вызова.
		 * @param {Object} scope Контекст вызова функции обратного вызова.
		 */
		getLoginStatus: function(config, callback, scope) {
			var force = config.force;
			facebook.getLoginStatus(function(response) {
				callback.call(scope, response);
			}, force);
		},

		executeCommand: function(config, callback, scope) {
			var request = this.getServiceRequest({
				className: "Terrasoft.configuration.social.ExecuteCommandRequest",
				serviceName: "FacebookService",
				command: config.command
			});
			request.execute(function(response) {
				callback.call(scope, response);
			}, this);
		},

		executeBatchCommand: function(config, callback, scope) {
			var request = this.getServiceRequest({
				className: "Terrasoft.configuration.social.ExecuteBatchRequest",
				contractName: config.contractName,
				serviceName: "FacebookService",
				commands: config.commands
			});
			request.execute(function(response) {
				callback.call(scope, response);
			}, this);
		},

		getUserSearchCommand: function(config) {
			return {
				name: "search",
				parameters: [
					{
						name: "q",
						value: config.query
					},
					{
						name: "type",
						value: "user"
					},
					{
						name: "fields",
						value: this.userFields
					},
					{
						name: "limit",
						value: "50"
					}
				]
			};
		},

		getPageSearchCommand: function(config) {
			return {
				name: "search",
				parameters: [
					{
						name: "q",
						value: config.query
					},
					{
						name: "type",
						value: "page"
					},
					{
						name: "fields",
						value: this.pageFields
					},
					{
						name: "limit",
						value: "50"
					}
				]
			};
		},

		getSinglePageSearchCommand: function(config) {
			return {
				command: {
					name: config.page,
					parameters: [
						{
							name: "fields",
							value: this.pageFields
						}
					]
				}
			};
		},

		getSingleUserSearchCommand: function(config) {
			return {
				command: {
					name: config.id,
					parameters: [
						{
							name: "fields",
							value: this.userFields
						}
					]
				}
			};
		},

		//endregion

		//region Methods: Public

		/**
		 * @inheritdoc
		 * @overridden
		 */
		init: function(callback, scope) {
			this.callParent([function(response) {
				if (response.success) {
					this.initApi();
				}
				callback.call(scope, response);
			}, this]);
		},

		/**
		 * Выполняет поиск страниц и профилей.
		 * @param {Object} config Параметры поиска.
		 * @param {Function} callback Функция обратного вызова.
		 * @param {Object} scope Контекст вызова функции обратного вызова.
		 */
		executeSearch: function(config, callback, scope) {
			var searchConfig = this.prepareBatchSearchConfig(config);
			this.executeBatchCommand(searchConfig, function(response) {
				this.parseExecuteBatchSearchResponse(response, callback, scope);
			}, this);
		},

		/**
		 * Выполняет поиск страниц. Формирует запрос вида: search?q=config.page&type=page.
		 * @param {Object} config Параметры поиска.
		 * @param {Function} callback Функция обратного вызова.
		 * @param {Object} scope Контекст вызова функции обратного вызова.
		 */
		executeSinglePageSearch: function(config, callback, scope) {
			var searchConfig = this.getSinglePageSearchCommand(config);
			this.executeCommand(searchConfig, function(response) {
				this.parseExecuteSearchResponse(response, callback, scope);
			}, this);
		},

		/**
		 * Выполняет поиск профилей. Формирует запрос вида: search?q=config.id&type=user.
		 * @param {Object} config Параметры поиска.
		 * @param {Function} callback Функция обратного вызова.
		 * @param {Object} scope Контекст вызова функции обратного вызова.
		 */
		executeSingleUserSearch: function(config, callback, scope) {
			var searchConfig = this.getSingleUserSearchCommand(config);
			this.executeCommand(searchConfig, function(response) {
				this.parseExecuteSearchResponse(response, callback, scope);
			}, this);
		},

		/**
		 * Возвращает информацию об объектах Facebook.
		 * @param {Object} config Конфигурационная информация для запроса данных об объектах.
		 * @param {Array} config.nodes Имена объектов Facebook.
		 * @param {Array} config.fields Массив полей объектов.
		 * @param {Function} callback Функция обратного вызова.
		 * @param {Object} scope Контекст для функции обратного вызова.
		 */
		getNodesData: function(config, callback, scope) {
			var request = this.getServiceRequest({
				className: "Terrasoft.SocialNetworkServiceRequest",
				contractName: "GetNodesData",
				serviceName: "FacebookService",
				socialIds: config.nodes
			});
			request.execute(function(response) {
				callback.call(scope, response);
				if (!response.success) {
					this.throwConnectorError(response.errorInfo);
				}
			}, this);
		},

		/**
		 * Аннулирует текущий маркер доступа.
		 * @param {Object} config Параметры маркера доступа.
		 * @param {Function} callback Функция обратного вызова.
		 * @param {Object} scope Контекст вызова функции обратного вызова.
		 */
		revokeCurrentAccessToken: function(config, callback, scope) {
			var request = this.getServiceRequest({
				contractName: "RevokeCurrentAccessToken"
			});
			request.execute(function(response) {
				callback.call(scope, response);
			}, this);
		},

		/**
		 * Подготавливает параметры команды создания Учетной записи во внешнем ресурсе.
		 * @param {Object} authResponse Авторизационные данные.
		 * @param {String} authResponse.accessToken Маркер доступа.
		 * @param {String} authResponse.userID Идентификатор пользователя во внешнем ресурсе.
		 * @return {Object} Параметры команды создания Учетной записи во внешнем ресурсе.
		 */
		prepareCreateSocialAccountConfig: function(authResponse) {
			return {
				accessToken: authResponse.accessToken,
				socialId: authResponse.userID
			};
		},

		/**
		 * Производит попытку авторизировать пользователя в социальную сеть.
		 * @param {Function} callback Функция обратного вызова.
		 * @param {Object} scope Контекст вызова функции обратного вызова.
		 */
		tryLoginUser: function(callback, scope) {
			var getLoginStatusConfig = {
				force: true
			};
			this.getLoginStatus(getLoginStatusConfig, function(response) {
				var responseStatus = response.status;
				if (responseStatus === this.STATUS_NOT_AUTHORIZED || responseStatus === this.STATUS_UNKNOWN) {
					this.login(function(response) {
						callback.call(scope, response.authResponse);
					}, this);
				}
				if (responseStatus === this.STATUS_CONNECTED) {
					callback.call(scope, response.authResponse);
				}
			}, this);
		},

		/**
		 * Получает информацию о текущем маркере доступа.
		 * @param {Object} config Параметры получения.
		 * @param {Function} callback Функция обратного вызова.
		 * @param {Object} scope Контекст вызова функции обратного вызова.
		 */
		debugCurrentAccessToken: function(config, callback, scope) {
			var request = this.getServiceRequest({
				contractName: "DebugCurrentAccessToken"
			});
			request.execute(function(response) {
				callback.call(scope, response);
				if (!response.success) {
					this.throwConnectorError(response.errorInfo);
				}
			}, this);
		},

		/**
		 * Получает информацию о маркере доступа.
		 * @param {Object} config Параметры получения.
		 * @param {Function} callback Функция обратного вызова.
		 * @param {Object} scope Контекст вызова функции обратного вызова.
		 */
		debugAccessToken: function(config, callback, scope) {
			var accessToken = config.accessToken;
			if (!accessToken) {
				throw new Terrasoft.ArgumentNullOrEmptyException({
					argumentName: "accessToken"
				});
			}
			var request = this.getServiceRequest({
				contractName: "DebugAccessToken",
				accessToken: accessToken
			});
			request.execute(function(response) {
				callback.call(scope, response);
				if (!response.success) {
					this.throwConnectorError(response.errorInfo);
				}
			}, this);
		},

		/**
		 * Обновляет текущий маркер доступа.
		 * @param {Object} config Параметры обновления.
		 * @param {Function} callback Функция обратного вызова.
		 * @param {Object} scope Контекст вызова функции обратного вызова.
		 */
		updateAccessToken: function(config, callback, scope) {
			this.tryLoginUser(function(authResponse) {
				if (!authResponse) {
					return;
				}
				var config = {
					accessToken: authResponse.accessToken
				};
				this.debugAccessToken(config, function(response) {
					if (response.success) {
						var accessTokenInfo = response.accessTokenInfo;
						if (!accessTokenInfo.isValid) {
							throw new Terrasoft.UnknownException();
						}
						this.setAccessToken(config, callback, scope);
					}
				}, this);
			}, this);
		},

		/**
		 * Проверяет возможность взаимодействия с социальной сетью.
		 * @param {Object} config Параметры проверки.
		 * @param {Function} callback Функция обратного вызова.
		 * @param {Object} scope Контекст вызова функции обратного вызова.
		 */
		checkCanOperate: function(config, callback, scope) {
			var request = this.getServiceRequest({
				contractName: "CheckCanOperate"
			});
			request.execute(function(response) {
				callback.call(scope, response);
			}, this);
		}

		//endregion

	});
});
