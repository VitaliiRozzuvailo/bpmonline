define("BaseClientConnector", ["ExecuteCommandRequest"], function() {
	/**
	 * @class Terrasoft.configuration.SocialNetworkClientConnector
	 * Класс реализующий работу с социальной сетью с клиента.
	 */
	Ext.define("Terrasoft.configuration.social.BaseClientConnector", {
		extend: "Terrasoft.core.BaseObject",
		alternateClassName: "Terrasoft.BaseClientConnector",

		//region Properties: Private

		consumerKey: "",
		consumerSecret: "",
		consumerVersion: "",
		type: "",
		user: "",
		socialAccount: null,
		serviceRequestClassName: "",

		//endregion

		//region Methods: Private

		/**
		 * Возвращает сообщение об ошибке.
		 * @private
		 * @param {Object} errorInfo Информация об ошибке.
		 * @returns
		 */
		getConnectorErrorMessage: function(errorInfo) {
			var template = "{0}: {1}\n{2}";
			return Ext.String.format(template, errorInfo.errorCode, errorInfo.message, errorInfo.stackTrace);
		},

		setInitialConsumerInfo: function(callback, scope) {
			this.getConsumerInfo(function(response) {
				if (!response.success) {
					return callback.call(scope, response);
				}
				var consumerInfo = response.consumerInfo;
				var consumerKey = this.consumerKey = consumerInfo.key;
				if (!consumerKey) {
					throw new Terrasoft.NullOrEmptyException({
						message: "consumerKey"
					});
				}
				var consumerVersion = this.consumerVersion = consumerInfo.version;
				if (!consumerVersion) {
					throw new Terrasoft.NullOrEmptyException({
						message: "consumerVersion"
					});
				}
				callback.call(scope, response);
			}, this);
		},

		setInitialSocialAccountInfo: function(callback, scope) {
			this.findSocialAccountInfo(function(response) {
				if (!response.success) {
					return callback.call(scope, response);
				}
				this.socialAccount = response.socialAccountInfo;
				callback.call(scope, response);
			}, this);

		},

		getServiceRequestConfig: function(config) {
			delete config.className;
			if (!config.contractName) {
				delete config.contractName;
			}
			return Ext.apply({}, config, {
				user: this.user,
				type: this.type
			});
		},

		validateGetServiceRequestConfig: function(config) {
			if (!config) {
				throw new Terrasoft.ArgumentNullOrEmptyException({
					argumentName: "config"
				});
			}
			var className = config.className || this.serviceRequestClassName;
			if (!className) {
				throw new Terrasoft.ArgumentNullOrEmptyException({
					argumentName: "serviceRequestClassName"
				});
			}
		},

		/**
		 * Проверяет параметры создания новой Учетной записи во внешнем ресурсе.
		 * @private
		 * @param {Object} config Параметры.
		 * @param {String} config.accessToken Маркер доступа.
		 * @param {String} config.socialId Идентификатор пользователя во внешнем ресурсе.
		 */
		validateCreateSocialAccountConfig: function(config) {
			var accessToken = config.accessToken;
			if (!accessToken) {
				throw new Terrasoft.ArgumentNullOrEmptyException({
					argumentName: "config.accessToken"
				});
			}
			var socialId = config.socialId;
			if (!socialId) {
				throw new Terrasoft.ArgumentNullOrEmptyException({
					argumentName: "config.socialId"
				});
			}
		},

		/**
		 * Возвращает информацию о приложении во внешнем ресурсе.
		 * @private
		 * @param {Function} callback Функция обратного вызова.
		 * @param {Object} scope Контекст вызова функции обратного вызова.
		 */
		getConsumerInfo: function(callback, scope) {
			var request = this.getServiceRequest({
				contractName: "GetConsumerInfo"
			});
			request.execute(function(response) {
				callback.call(scope, response);
				if (!response.success) {
					this.logConnectorError(response.errorInfo);
				}
			}, this);
		},

		//endregion

		//region Methods: Protected

		/**
		 * Добавляет в лог сообщение об ошибке.
		 * @protected
		 * @param {Object} errorInfo Информация об ошибке.
		 */
		logConnectorError: function(errorInfo) {
			if (errorInfo.handled) {
				return;
			}
			var message = this.getConnectorErrorMessage(errorInfo);
			this.log(message, Terrasoft.LogMessageType.ERROR);
		},

		/**
		 * Генерирует сообщение об ошибке.
		 * @protected
		 * @param {Object} errorInfo Информация об ошибке.
		 */
		throwConnectorError: function(errorInfo) {
			throw new Terrasoft.UnknownException({
				message: this.getConnectorErrorMessage(errorInfo)
			});
		},

		getServiceRequest: function(config) {
			this.validateGetServiceRequestConfig(config);
			var className = config.className || this.serviceRequestClassName;
			var requestConfig = this.getServiceRequestConfig(config);
			return Ext.create(className, requestConfig);
		},

		/**
		 * Устанавливает маркер доступа.
		 * @protected
		 * @param {Object} config Параметры установки.
		 * @param {Function} callback Функция обратного вызова.
		 * @param {Object} scope Контекст вызова функции обратного вызова.
		 */
		setAccessToken: function(config, callback, scope) {
			var accessToken = config.accessToken;
			if (!accessToken) {
				throw new Terrasoft.ArgumentNullOrEmptyException({
					argumentName: "accessToken"
				});
			}
			var request = this.getServiceRequest({
				contractName: "SetAccessToken",
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
		 * Возвращает маркер доступа.
		 * @protected
		 * @param {Object} config Параметры получения.
		 * @param {Function} callback Функция обратного вызова.
		 * @param {Object} scope Контекст вызова функции обратного вызова.
		 */
		getAccessToken: function(config, callback, scope) {
			this.findAccessToken(config, function(response) {
				if (!response.accessToken) {
					throw new Terrasoft.ItemNotFoundException({
						message: "AccessToken"
					});
				}
				callback.call(scope, response);
			}, this);
		},

		/**
		 * Возвращает маркер доступа.
		 * @protected
		 * @param {Object} config Параметры получения.
		 * @param {Function} callback Функция обратного вызова.
		 * @param {Object} scope Контекст вызова функции обратного вызова.
		 */
		findAccessToken: function(config, callback, scope) {
			var request = this.getServiceRequest({
				contractName: "FindAccessToken"
			});
			request.execute(function(response) {
				callback.call(scope, response);
				if (!response.success) {
					this.logConnectorError(response.errorInfo);
				}
			}, this);
		},

		//endregion

		//region Methods: Public

		/**
		 * Инициализирет Api для работы с внешним ресурсом.
		 * @param {Function} callback Функция обратного вызова.
		 * @param {Object} scope Контекст вызова функции обратного вызова.
		 */
		init: function(callback, scope) {
			this.setInitialConsumerInfo(function(response) {
				if (!response.success) {
					return callback.call(scope, response);
				}
				this.setInitialSocialAccountInfo(callback, scope);
			}, this);
		},

		/**
		 * Создает Учетную запись во внешнем ресурсе.
		 * @param {Object} config Параметры создания.
		 * @param {Function} callback Функция обратного вызова.
		 * @param {Object} scope Контекст вызова функции обратного вызова.
		 */
		createSocialAccount: function(config, callback, scope) {
			this.validateCreateSocialAccountConfig(config);
			var request = this.getServiceRequest({
				contractName: "CreateSocialAccount",
				accessToken: config.accessToken,
				socialId: config.socialId
			});
			request.execute(function(response) {
				callback.call(scope, response);
				if (!response.success) {
					this.throwConnectorError(response.errorInfo);
				}
			}, this);
		},

		/**
		 * Проверяет наличие Учетной записи во внешнем ресурсе.
		 * @param {Object} config Параметры учетной записи.
		 * @param {Function} callback Функция обратного вызова.
		 * @param {Object} scope Контекст вызова функции обратного вызова.
		 */
		checkSocialAccount: function(config, callback, scope) {
			var request = this.getServiceRequest({
				contractName: "CheckSocialAccount"
			});
			request.execute(function(response) {
				callback.call(scope, response);
				if (!response.success) {
					this.logConnectorError(response.errorInfo);
				}
			}, this);
		},

		/**
		 * Возвращает информацию об Учетной записи во внешнем ресурсе.
		 * @param {Function} callback Функция обратного вызова.
		 * @param {Object} scope Контекст вызова функции обратного вызова.
		 */
		getSocialAccountInfo: function(callback, scope) {
			var request = this.getServiceRequest({
				contractName: "GetSocialAccountInfo"
			});
			request.execute(function(response) {
				callback.call(scope, response);
				if (!response.success) {
					this.throwConnectorError(response.errorInfo);
				}
			}, this);
		},

		/**
		 * Возвращает информацию об Учетной записи во внешнем ресурсе.
		 * @param {Function} callback Функция обратного вызова.
		 * @param {Object} scope Контекст вызова функции обратного вызова.
		 */
		findSocialAccountInfo: function(callback, scope) {
			var request = this.getServiceRequest({
				contractName: "FindSocialAccountInfo"
			});
			request.execute(function(response) {
				callback.call(scope, response);
				if (!response.success) {
					this.logConnectorError(response.errorInfo);
				}
			}, this);
		},

		/**
		 * Удаляет Учетную запись во внешнем ресурсе.
		 * @param {Object} config Параметры учетной записи.
		 * @param {Function} callback Функция обратного вызова.
		 * @param {Object} scope Контекст вызова функции обратного вызова.
		 */
		deleteSocialAccount: function(config, callback, scope) {
			var request = this.getServiceRequest({
				contractName: "DeleteSocialAccount"
			});
			request.execute(function(response) {
				callback.call(scope, response);
				if (!response.success) {
					this.throwConnectorError(response.errorInfo);
				}
			}, this);
		}

		//endregion
	});
});
