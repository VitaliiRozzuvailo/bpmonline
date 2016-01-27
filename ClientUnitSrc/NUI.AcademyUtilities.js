define("AcademyUtilities", ["terrasoft"], function(Terrasoft) {
	Ext.define("Terrasoft.configuration.AcademyUtilities", {
		extend: "Terrasoft.BaseObject",
		alternateClassName: "Terrasoft.AcademyUtilities",

		singleton: true,

		/**
		 * Асинхронно получает ссылку на документацию.
		 * Если значение contextHelpCode указано, то ссылка формируется на основе значений, извлекаемых из таблицы
		 * контекстной справки и дополненых в случае отсутствия значениями из системных настроек.
		 * Если значение contextHelpCode не указано, то ссылка формируется на основе значений системных настроек.
		 * @param {Object} config Объект конфигурации.
		 * @param {Function} config.callback Функция обратного вызова.
		 * @param {Object} config.scope Контекст для выполнения.
		 * @param {String} config.contextHelpCode (optional) Код контекстной справки.
		 * @param {Number} config.contextHelpId (optional) Идентификатор контекстной справки.
		 */
		getUrl: function(config) {
			if (!config) {
				return;
			}
			var callback = config.callback || Terrasoft.emptyFn;
			var scope = config.scope || this;
			var contextHelpCode = config.contextHelpCode;
			var contextHelpId = config.contextHelpId;
			this.getHelpConfigFromSysSettings(contextHelpId, function(defaultHelpConfig) {
				if (contextHelpCode) {
					this.getHelpConfigFromDb(contextHelpCode, function(helpConfig) {
						if (helpConfig) {
							Terrasoft.each(defaultHelpConfig, function(propertyValue, propertyName) {
								if (Ext.isEmpty(helpConfig[propertyName])) {
									helpConfig[propertyName] = propertyValue;
								}
							});
						} else {
							helpConfig = defaultHelpConfig;
						}
						this.buildUrl(helpConfig, callback, scope);
					}, this);
				} else {
					this.buildUrl(defaultHelpConfig, callback, scope);
				}
			}, this);
		},

		/**
		 * Асинхронно получает конфигурацию из системных настроек для построения ссылки на документацию.
		 * @private
		 * @param {Number} contextHelpId Идентификатор контекстной справки.
		 * @param {Function} callback Функция обратного вызова.
		 * @param {Object} scope Контекст для выполнения.
		 */
		getHelpConfigFromSysSettings: function(contextHelpId, callback, scope) {
			var sysSettingsNameArray = ["UseLMSDocumentation", "LMSUrl", "ProductEdition", "ConfigurationVersion",
				"EnableContextHelp"];
			Terrasoft.SysSettings.querySysSettings(sysSettingsNameArray,
				function(values) {
					var helpConfig = {};
					if (values) {
						helpConfig = {
							useLmsDocumentation: values.UseLMSDocumentation,
							lmsUrl: values.LMSUrl,
							enableContextHelp: values.EnableContextHelp,
							contextHelpId: contextHelpId,
							productEdition: values.ProductEdition,
							configurationVersion: values.ConfigurationVersion
						};
					}
					callback.call(scope, helpConfig);
				}, this);
		},

		/**
		 * Асинхронно получает конфигурацию со справочника для построения ссылки на документацию.
		 * @private
		 * @param {String} contextHelpCode Код контекстной справки.
		 * @param {Function} callback Функция обратного вызова.
		 * @param {Object} scope Контекст для выполнения.
		 */
		getHelpConfigFromDb: function(contextHelpCode, callback, scope) {
			var esq = Ext.create("Terrasoft.EntitySchemaQuery", {
				rootSchemaName: "ContextHelp",
				serverESQCacheParameters: {
					cacheLevel: Terrasoft.ESQServerCacheLevels.WORKSPACE,
					cacheGroup: "AcademyUtilities",
					cacheItemName: contextHelpCode
				}
			});
			esq.addColumn("Code");
			esq.addColumn("ContextHelpId");
			esq.addColumn("LMSUrl");
			esq.addColumn("ProductEdition");
			esq.addColumn("ConfigurationVersion");
			esq.filters.add("ContextHelpCode", esq.createColumnFilterWithParameter(
				Terrasoft.ComparisonType.EQUAL, "Code", contextHelpCode));
			esq.getEntityCollection(function(result) {
				var collection = result.collection;
				var helpConfig = null;
				if (result.success && collection.getCount()) {
					var entity = collection.getByIndex(collection.getCount() - 1);
					var lmsUrl = entity.get("LMSUrl");
					var contextHelpId = entity.get("ContextHelpId");
					helpConfig = {
						lmsUrl: lmsUrl,
						enableContextHelp: !Ext.isEmpty(contextHelpId),
						contextHelpId: contextHelpId,
						productEdition: entity.get("ProductEdition"),
						configurationVersion: entity.get("ConfigurationVersion")
					};
				}
				callback.call(scope, helpConfig);
			}, this);
		},

		/**
		 * Возвращает ссылку на документацию на основе объекта конфигурации.
		 * @private
		 * @param {Object} config Объект конфигурации.
		 * @param {Boolean} config.useLmsDocumentation (optional) Доступность контекстной справки.
		 * @param {Function} callback Функция обратного вызова.
		 * @param {Object} scope Контекст для выполнения.
		 */
		buildUrl: function(config, callback, scope) {
			var url = "#";
			if (config) {
				url = (config.useLmsDocumentation) ? this.getLmsDocumentationUrl(config) :
					this.getLocalDocumentationUrl(config);
			}
			callback.call(scope, url);
		},

		/**
		 * Возвращает ссылку на Академию на основе объекта конфигурации.
		 * @private
		 * @param {Object} config Объект конфигурации.
		 * @param {Number} config.lmsUrl Адрес LMS.
		 * @param {String} config.productEdition (optional) Редакция продукта.
		 * @param {String} config.configurationVersion (optional) Версия конфигурации.
		 * @param {Number} config.enableContextHelp (optional) Доступность контекстной справки.
		 * @param {Number} config.contextHelpId (optional) Идентификатор контекстной справки.
		 * @return {String} Ссылка на Академию.
		 */
		getLmsDocumentationUrl: function(config) {
			var parameters = [];
			var productEdition = config.productEdition;
			if (productEdition) {
				parameters.push("product=" + encodeURIComponent(productEdition));
			}
			var configurationVersion = config.configurationVersion;
			if (configurationVersion) {
				parameters.push("ver=" + encodeURIComponent(configurationVersion));
			}
			var enableContextHelp = config.enableContextHelp;
			var contextHelpId = config.contextHelpId;
			if (enableContextHelp && contextHelpId) {
				parameters.push("id=" + encodeURIComponent(contextHelpId));
			}
			return Ext.String.format("{0}?{1}", config.lmsUrl, parameters.join("&"));
		},

		/**
		 * Возвращает ссылку на локальную справку на основе объекта конфигурации.
		 * @private
		 * @param {Object} config Объект конфигурации.
		 * @param {Number} config.contextHelpId (optional) Идентификатор контекстной справки.
		 * @return {String} Ссылка на локальную справку.
		 */
		getLocalDocumentationUrl: function(config) {
			var url = Terrasoft.workspaceBaseUrl + "/WebHelpNui/";
			url += config.productEdition + "/";
			var userCulture = Terrasoft.SysValue.CURRENT_USER_CULTURE.displayValue;
			var userCultureParts = userCulture.split("-", 1);
			url += userCultureParts[0];
			url += "/BPMonline_Help.htm";
			var contextHelpId = config.contextHelpId;
			if (contextHelpId) {
				url += "#<id=" + contextHelpId;
			}
			return url;
		}
	});
	return Terrasoft.AcademyUtilities;
});
