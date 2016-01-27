define("FacebookClientUtilities", ["FacebookClientUtilitiesResources", "ConfigurationConstants"],
		function(resources, ConfigurationConstants) {
	Ext.define("Terrasoft.configuration.social.mixins.FacebookClientUtilities", {
		alternateClassName: "Terrasoft.FacebookClientUtilities",

		/**
		 * True, если подключение к Facebook проинициализировано.
		 * @private
		 * @type {Boolean}
		 */
		facebookConnectorInitialized: false,

		/**
		 * Название свойства модели представления хранящее экземпляр класса,
		 * который реализовывает подключение к Facebook.
		 * @private
		 * @type {String}
		 */
		facebookConnectorPropertyName: "FacebookConnector",

		/**
		 * Название класса, который реализовывает подключение к Facebook.
		 * @private
		 * @type {String}
		 */
		facebookConnectorClassName: "Terrasoft.FacebookClientConnector",

		/**
		 * Название схемы определяющей класс, который реализовывает подключение к Facebook.
		 * @private
		 * @type {String}
		 */
		facebookConnectorSchemaName: "FacebookClientConnector",

		/**
		 * Возвращает экземпляр класса, который реализовывает подключение к Facebook.
		 * @protected
		 * @param {Function} callback Функция обратного вызова.
		 * @param {Object} scope Контекст вызова функции обратного вызова.
		 */
		getFacebookConnector: function(callback, scope) {
			if (this.facebookConnectorInitialized) {
				callback.call(scope, this.get(this.facebookConnectorPropertyName));
				return;
			}
			this.initFacebookConnector(function() {
				callback.call(scope, this.get(this.facebookConnectorPropertyName));
			}, this);
		},

		/**
		 * Возвращает название класса, который реализовывает подключение к Facebook.
		 * @protected
		 * @virtual
		 * @return {String} Название класса, который реализовывает подключение к Facebook.
		 */
		getFacebookConnectorClassName: function() {
			return this.facebookConnectorClassName;
		},

		/**
		 * Инциализирует подключение к Facebook.
		 * @private
		 * @param {Function} callback Функция обратного вызова.
		 * @param {Object} scope Контекст вызова функции обратного вызова.
		 */
		initFacebookConnector: function(callback, scope) {
			this.Terrasoft.require([this.facebookConnectorSchemaName], function() {
				var connectorClassName = this.getFacebookConnectorClassName();
				var connector = this.Ext.create(connectorClassName, {
					type: ConfigurationConstants.CommunicationTypes.Facebook,
					user: this.Terrasoft.SysValue.CURRENT_USER.value
				});
				connector.init(function(response) {
					if (response && !response.success) {
						return this.handleConnectorError(response.errorInfo, function() {
							callback.call(scope);
						}, this);
					}
					this.set(this.facebookConnectorPropertyName, connector);
					this.facebookConnectorInitialized = true;
					callback.call(scope);
				}, scope);
			}, this);
		},

		/**
		 * Обрабатывает ошибки при работе с внешним ресурсом.
		 * @param {Object} errorInfo Информация об ошибке.
		 * @param {Function} callback Функция обратного вызова.
		 * @param {Object} scope Контекст вызова функции обратного вызова.
		 */
		handleConnectorError: function(errorInfo, callback, scope) {
			var errorCode = errorInfo.errorCode;
			if (errorCode === "MissingConsumerKeyException") {
				return this.handleMissingConsumerKeyException(errorInfo, function() {
					callback.call(scope);
				}, this);
			}
			if (errorCode === "MissingConsumerSecretException") {
				return this.handleMissingConsumerSecretException(errorInfo, function() {
					callback.call(scope);
				}, this);
			}
			if (errorCode === "MissingSocialAccountException") {
				return this.handleMissingSocialAccountException(errorInfo, function() {
					callback.call(scope);
				}, this);
			}
			if (errorCode === "InvalidAccessTokenException") {
				return this.handleInvalidAccessTokenException(errorInfo, function() {
					callback.call(scope);
				}, this);
			}
			if (errorCode === "MissingConsumerInfoServiceUriException") {
				return this.handleMissingConsumerInfoServiceUriException(errorInfo, function() {
					callback.call(scope);
				}, this);
			}
			if (errorCode === "DublicateDataException") {
				return this.handleDublicateDataExceptionException(errorInfo, function() {
					callback.call(scope);
				}, this);
			}
			if (errorCode === "FacebookOAuthException") {
				return this.handleFacebookOAuthException(errorInfo, function() {
					callback.call(scope);
				}, this);
			}
			this.throwConnectorError(errorInfo);
		},

		/**
		 * Генерирует сообщение об ошибке.
		 * @private
		 * @param {Object} errorInfo Информация об ошибке.
		 */
		throwConnectorError: function(errorInfo) {
			throw new this.Terrasoft.UnknownException({
				message: this.getConnectorErrorMessage(errorInfo)
			});
		},

		/**
		 * Добавляет в лог сообщение об ошибке.
		 * @private
		 * @param {Object} errorInfo Информация об ошибке.
		 * @param {Terrasoft.LogMessageType} type Тип сообщения, если не указано - используется метод console.error.
		 */
		logConnectorError: function(errorInfo, type) {
			var message = this.getConnectorErrorMessage(errorInfo);
			var messageType = (this.Ext.isEmpty(type)) ? this.Terrasoft.LogMessageType.ERROR : type;
			this.log(message, messageType);
		},

		/**
		 * Возвращает сообщение об ошибке.
		 * @private
		 * @param {Object} errorInfo Информация об ошибке.
		 * @return Сообщение об ошибке.
		 */
		getConnectorErrorMessage: function(errorInfo) {
			var template = "{0}: {1}\n{2}";
			return this.Ext.String.format(template, errorInfo.errorCode, errorInfo.message, errorInfo.stackTrace);
		},

		/**
		 * Обрабатывает ситуацию, когда у пользователя отсутствует учетная запись в социальной сети.
		 * Производит попытку аутентифицировать пользователя и создать учетную запись.
		 * @private
		 * @param {Object} errorInfo Информация об ошибке.
		 * @param {Function} callback Функция обратного вызова.
		 * @param {Object} scope Контекст вызова функции обратного вызова.
		 */
		handleMissingSocialAccountException: function(errorInfo, callback, scope) {
			this.logConnectorError(errorInfo, this.Terrasoft.LogMessageType.INFORMATION);
			this.createFacebookSocialAccount(callback, scope);
		},

		/**
		 * Обрабатывает ситуацию, когда в системе не заполнена системная настройка
		 * "Ключ Facebook для доступа к соц. сети".
		 * @private
		 * @param {Object} errorInfo Информация об ошибке.
		 */
		handleMissingConsumerKeyException: function(errorInfo) {
			this.logConnectorError(errorInfo);
			this.showInformationDialog(resources.localizableStrings.FacebookConnectorErrorMessage);
		},

		/**
		 * Обрабатывает ситуацию, когда в системе не заполнена системная настройка
		 * "Секретный ключ Facebook для доступа к соц. сети".
		 * @private
		 * @param {Object} errorInfo Информация об ошибке.
		 */
		handleMissingConsumerSecretException: function(errorInfo) {
			this.logConnectorError(errorInfo);
			this.showInformationDialog(resources.localizableStrings.FacebookConnectorErrorMessage);
		},

		/**
		 * Обрабатывает ситуацию, когда в системе не заполнен адрес сервиса получения настроек приложения во внешнем
		 * ресурсе.
		 * @private
		 */
		handleMissingConsumerInfoServiceUriException: function() {
			this.showInformationDialog(resources.localizableStrings.FacebookConnectorErrorMessage);
		},

		/**
		 * Обрабатывает ситуацию, когда в системе уже существует учетная запись во внешнем ресурсе.
		 * @private
		 */
		handleDublicateDataExceptionException: function() {
			this.showInformationDialog(resources.localizableStrings.DublicateDataErrorMessage);
		},

		/**
		 * Обрабатывает ситуацию, когда произошла внутренняя ошибка Facebook SDK.
		 * @private
		 * @param {Object} errorInfo Информация об ошибке.
		 */
		handleFacebookOAuthException: function(errorInfo) {
			this.logConnectorError(errorInfo);
			this.showInformationDialog(resources.localizableStrings.FacebookConnectorErrorMessage);
		},

		/**
		 * Обрабатывает ситуацию, когда токен доступа пользователя к социальной сети не корректен.
		 * Производит попытку аутентифицировать пользователя и обновить токен доступа.
		 * @private
		 * @param {Object} errorInfo Информация об ошибке.
		 * @param {Function} callback Функция обратного вызова.
		 * @param {Object} scope Контекст вызова функции обратного вызова.
		 */
		handleInvalidAccessTokenException: function(errorInfo, callback, scope) {
			this.logConnectorError(errorInfo);
			this.getFacebookConnector(function(connector) {
				var currentSocialAccount = connector.socialAccount;
				var isPublic = currentSocialAccount.isPublic;
				var isOwner = (currentSocialAccount.userId === this.Terrasoft.SysValue.CURRENT_USER.value);
				if (isPublic && !isOwner) {
					this.createFacebookSocialAccount(function() {
						callback.call(scope);
					}, this);
				} else {
					var config = {};
					connector.updateAccessToken(config, function() {
						callback.call(scope);
					}, this);
				}
			}, this);
		},

		/**
		 * Создает Учетную запись во внешнем ресурсе.
		 * @protected
		 * @param {Function} callback Функция обратного вызова.
		 * @param {Object} scope Контекст вызова функции обратного вызова.
		 */
		createFacebookSocialAccount: function(callback, scope) {
			this.getFacebookConnector(function(connector) {
				connector.tryLoginUser(function(authResponse) {
					var config = connector.prepareCreateSocialAccountConfig(authResponse);
					connector.createSocialAccount(config, function(response) {
						if (!response.success) {
							return this.handleConnectorError(response.errorInfo, function() {
								callback.call(scope);
							}, this);
						}
						callback.call(scope, response);
					}, this);
				}, this);
			}, this);
		},

		/**
		 * Проверяет, возможно ли соединение с внешним ресурсом.
		 * @protected
		 * @param {Function} callback Функция обратного вызова.
		 * @param {Object} scope Контекст вызова функции обратного вызова.
		 */
		checkCanFacebookConnectorOperate: function(callback, scope) {
			this.getFacebookConnector(function(connector) {
				connector.checkCanOperate({}, function(response) {
					var success = response.success;
					if (!success) {
						return this.handleConnectorError(response.errorInfo, function() {
							callback.call(scope);
						}, this);
					}
					callback.call(scope);
				}, this);
			}, this);
		}
	});
});
