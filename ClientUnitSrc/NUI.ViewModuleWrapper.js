define("ViewModuleWrapper", ["ext-base", "sandbox", "terrasoft", "ConfigurationBootstrap", "css!CommonCSSV2",
	"css!ViewModule"],
	function(Ext, sandbox, Terrasoft) {

		/**
		 * @class Terrasoft.configuration.ViewModule
		 * Класс модуля-обертки над визуальным модулем представления.
		 */
		Ext.define("Terrasoft.configuration.ViewModuleWrapper", {
			extend: "Terrasoft.BaseObject",
			alternateClassName: "Terrasoft.ViewModuleWrapper",

			Ext: null,
			sandbox: null,
			Terrasoft: null,

			/**
			 * Имя модуля представления по умолчанию.
			 * @type {String}
			 */
			defaultViewModule: "ConfigurationViewModule",

			/**
			 * Имя модуля представления для дизайнера разделов.
			 * @type {String}
			 */
			sectionDesignerViewModule: "SectionDesignerViewModule",

			/**
			 * Контейнер загрузки модуля.
			 * @type {Object}
			 */
			renderTo: Ext.getBody(),

			/**
			 * Признак асинхронности модуля.
			 * @type {Boolean}
			 */
			isAsync: true,

			/**
			 * Инициализирует модуль.
			 * @virtual
			 * @param {Function} callback Функция, которая будет вызвана по завершению.
			 * @param {Object} scope Контекст, в котором будет вызвана функция callback.
			 */
			init: function(callback, scope) {
				this.subscribeMessages();
				if (this.isSectionDesigner()) {
					this.defaultViewModule = this.sectionDesignerViewModule;
				}
				callback.call(scope);
			},

			/**
			 * Проверяет, работаем ли мы с дизайнером разделов.
			 * @protected
			 * @virtual
			 * @return {Boolean} Возвращает true если мы работаем с дизайнером раздела, false в обратном случае.
			 */
			isSectionDesigner: function() {
				var hash = Terrasoft.router.Router.getHash();
				return hash.indexOf("SectionDesigner") === 0;
			},

			/**
			 * Отображение представление.
			 * @virtual
			 * @param {Ext.Element} renderTo Ссылка на контейнер, в котором будет отображаться представление.
			 */
			render: function(renderTo) {
				Ext.create("Terrasoft.Container", {
					renderTo: renderTo,
					id: "mainContentWrapper",
					classes: { wrapClassName: ["main-content-wrapper"] },
					selectors: { wrapEl: "#mainContentWrapper" }
				});
				this.reloadViewModule();
			},

			/**
			 * Подписывается на сообщения.
			 * @protected
			 * @virtual
			 */
			subscribeMessages: function() {
				var sandbox = this.sandbox;
				sandbox.subscribe("ReloadViewModule", this.reloadViewModule, this, [this.sandbox.id]);
			},

			/**
			 * Загружает модуль представления.
			 * @protected
			 * @virtual
			 * @param {Object} config Объект конфигурации.
			 * @param {String} config.viewModuleName Имя модуля для загрузки.
			 */
			reloadViewModule: function(config) {
				var queryParameters = Terrasoft.QueryParameters;
				var viewModuleName = (config && config.viewModuleName) || queryParameters.vm || this.defaultViewModule;
				var sandbox = this.sandbox;
				sandbox.loadModule(viewModuleName, {
					renderTo: "mainContentWrapper",
					id: "ViewModule"
				});
			}
		});

		return Ext.create("Terrasoft.ViewModuleWrapper", {
			Ext: Ext,
			sandbox: sandbox,
			Terrasoft: Terrasoft
		});
	});