define("LookupUtilitiesV2", ["terrasoft", "MaskHelper", "ModalBox"],
	function(Terrasoft, MaskHelper, ModalBox) {

//		Example:
//			Terrasoft.LookupUtilities.Open({
//						handlerMethodName: "onLookupResult",
//						lookupConfig: config,
//						scope: this
//					});

		Ext.define("Terrasoft.configuration.LookupUtilities", {
			extend: "Terrasoft.BaseObject",
			alternateClassName: "Terrasoft.LookupUtilities",

			singleton: true,

			/**
			 * Контейнер в который будет отрисован LookupPage
			 * @private
			 * @type {Object}
			 */
			modalBoxContainer: null,

			/**
			 * Конфигурация открытия модального окна
			 * @private
			 * @type {Object}
			 */
			modalBoxSize: {
				minHeight : "1",
				minWidth : "1",
				maxHeight : "100",
				maxWidth : "100"
			},

			/**
			 * Возвращает фиксированный контейнер в модальном окне
			 * @protected
			 * @returns {Object}
			 */
			getFixedHeaderContainer: function() {
				return ModalBox.getFixedBox();
			},

			/**
			 * Возвращает основной контейнер в модальном окне
			 * @protected
			 * @returns {Object}
			 */
			getGridContainer: function() {
				return this.modalBoxContainer;
			},

			/**
			 * Обновляет размеры окна в соответствии с контентом
			 */
			UpdateSize: function() {
				ModalBox.updateSizeByContent();
			},

			/**
			 * Подготавливает модальное окно для загрузки туда модуля справочника
			 * @private
			 */
			prepareModalBox: function() {
				this.modalBoxContainer = ModalBox.show(this.modalBoxSize);
				ModalBox.setSize(820, 600);
			},

			/**
			 * Закрывает модальное окно Lookup-а и выгружает модуль
			 */
			CloseModalBox: function() {
				if (this.modalBoxContainer) {
					ModalBox.close();
					this.modalBoxContainer = null;
				}
			},

			/**
			 * Генерирует идентификатор для модуля справочника
			 * @private
			 * @param {Object} sandbox Песоцница модуля, вызывающего открытие справочника
			 * @return {string}
			 */
			getLookupPageId: function(sandbox) {
				return sandbox.id + "_LookupPage";
			},

			/**
			 * Открывает окно выбора из справочника
			 * @param {Object} config Конфигурация открытия выбора из справочника
			 * @param {String} config.handlerMethodName Имя метода-обработчика результата выбора. Должен содержатся в
			 * окружении "scope"
			 * @param {Terrasoft.BaseViewModel} config.scope Окружение, в рамках которого вызывается метод-обработчик.
			 * Также хранит параметры открытия окна выбора из справочника
			 * @param {Object} [config.sandbox] Песоцница модуля, вызывающего открытие справочника
			 * Необязательный, если ее содержит окружение
			 * @param {Object} config.lookupConfig Объект параметров для страницы выбора из справочника
			 */
			Open: function(config) {
				var scope = config.scope;
				var sandbox = config.sandbox || scope.sandbox;
				var openLookupConfig = config.lookupConfig;
				openLookupConfig.handlerMethodName = config.handlerMethodName;
				var lookupPageId = openLookupConfig.lookupPageId = this.getLookupPageId(sandbox);
				scope.lookupPageParams = openLookupConfig;
				//todo: реализовать регистрацию сообщений в песоцнице модуля
				sandbox.subscribe("LookupInfo", function() {
					return this.lookupPageParams;
				}, scope, [lookupPageId]);
				sandbox.subscribe("ResultSelectedRows", function(args) {
					var lookupPageParams = this.lookupPageParams;
					if (Ext.isFunction(this[lookupPageParams.handlerMethodName])) {
						this[lookupPageParams.handlerMethodName](args);
					}
					Terrasoft.LookupUtilities.CloseModalBox();
					this.sandbox.unloadModule(lookupPageParams.lookupPageId);
					delete this.lookupPageParams;
				}, scope, [lookupPageId]);
				this.prepareModalBox();
				MaskHelper.ShowBodyMask();
				sandbox.loadModule("LookupPageV2", {
					renderTo: this.getGridContainer(),
					id: lookupPageId
				});
			}
		});

	});