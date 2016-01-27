define("ContextHelpModule", ["ContextHelpModuleResources", "performancecountermanager", "AcademyUtilities",
		"BaseSchemaModuleV2", "ConfigurationConstants"],
	function(resources, performanceCounterManager, AcademyUtilities) {
		/**
		 * @class Terrasoft.configuration.ContextHelpModule
		 * Класс ContextHelpModule предназначен для создания экземпляра модуля контекстной справки.
		 */
		Ext.define("Terrasoft.configuration.ContextHelpModule", {
			alternateClassName: "Terrasoft.ContextHelpModule",
			extend: "Terrasoft.BaseModule",

			Ext: null,
			sandbox: null,
			Terrasoft: null,

			/**
			 * Внутренняя модель представления модуля контекстной справки.
			 * @type {Object}
			 */
			viewModel: null,

			/**
			 * Получает конфигурацию представления модуля контекстной справки.
			 * @private
			 * @return {Object} Возращает конфигурацию представления
			 */
			getViewConfig: function() {
				var view = {
					className: "Terrasoft.Container",
					id: "context-help-container",
					selectors: {
						el: "#context-help-container",
						wrapEl: "#context-help-container"
					},
					items: [
						{
							className: "Terrasoft.Button",
							style: Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
							classes: {
								wrapperClass: "help-button",
								imageClass: "help-button-image"
							},
							markerValue: "ContextHelpButton",
							hint: resources.localizableStrings.HelpButtonHint,
							imageConfig: resources.localizableImages.HelpIcon,
							click: {bindTo: "linkClick"}
						}
					]
				};
				return view;
			},

			/**
			 * Возращает модель представления модуля контекстной справки.
			 * @private
			 * @return {Object} Модель представления модуля справки.
			 */
			getViewModel: function() {
				var viewModel = this.Ext.create("Terrasoft.BaseViewModel", {
					methods: {
						linkClick: function() {
							var config = {
								callback: function(url) {
									window.open(url, "_blank");
								},
								scope: this,
								contextHelpId: this.get("contextHelpId"),
								contextHelpCode: this.get("contextHelpCode")
							};
							AcademyUtilities.getUrl(config);
						}
					},
					values: {
						/**
						 * Идентификатор раздела справки.
						 * @protected
						 * @type {Number}
						 */
						contextHelpId: 0,

						/**
						 * Флаг, который включает или отключает отображение справки.
						 * @protected
						 * @type {Boolean}
						 */
						enableContextHelp: false
					}
				});
				return viewModel;
			},

			/**
			 * Указатель асинхронности модуля
			 * @type {Boolean} [isAsync=true]
			 */
			isAsync: true,

			/**
			 * Выполняет отрисовку модуля контекстной справки.
			 * @private
			 * @param {Object} renderTo Контейнер в который отрисовывается модуль.
			 */
			render: function(renderTo) {
				var viewConfig = this.getViewConfig();
				var view = this.Ext.create(viewConfig.className || "Terrasoft.Container", viewConfig);
				view.bind(this.viewModel);
				view.render(renderTo);
				performanceCounterManager.setTimeStamp("loadAdditionalModulesComplete");
			},

			/**
			 * Инициализирует настройки контекстной справки.
			 * @private
			 * @param {Object|Number} config Конфигурация справки или её идентификатор.
			 * @param {Number} config.contextHelpId Идентификатор.
			 * @param {String} config.contextHelpCode Код.
			 * @param {String} config.product Редакция продукта.
			 */
			setContextHelp: function(config) {
				var contextHelpId = null;
				var viewModel = this.viewModel;
				if (this.Ext.isNumber(config)) {
					contextHelpId = config;
				} else if (this.Ext.isObject(config)) {
					if (config.contextHelpId) {
						contextHelpId = config.contextHelpId;
					}
					if (config.contextHelpCode) {
						viewModel.set("contextHelpCode", config.contextHelpCode);
					}
					if (config.product) {
						viewModel.set("productEdition", config.product);
					}
				}
				viewModel.set("contextHelpId", contextHelpId);
			},

			/**
			 * Иницализирует начальные значения модуля.
			 * @private
			 * @param {Function} callback Функция обратного вызова.
			 * @param {Object} scope Контекст функции обратного вызова.
			 */
			init: function(callback, scope) {
				var sysSettingsNameArray = ["EnableContextHelp"];
				this.Terrasoft.SysSettings.querySysSettings(sysSettingsNameArray, function(values) {
					this.viewModel = this.getViewModel();
					this.enableContextHelp = values.EnableContextHelp;
					if (this.enableContextHelp) {
						this.sandbox.subscribe("ChangeContextHelpId", function(config) {
							this.setContextHelp(config);
						}, this, [this.sandbox.id]);
						var config = this.sandbox.publish("GetContextHelpId", null, [this.sandbox.id]);
						this.setContextHelp(config);
						if (callback) {
							callback.call(scope);
						}
					}
				}, this);
			}
		});
		return Terrasoft.ContextHelpModule;
	});
