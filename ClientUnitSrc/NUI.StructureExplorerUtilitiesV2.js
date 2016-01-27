define("StructureExplorerUtilitiesV2", ["terrasoft", "ModalBox"],
	function(Terrasoft, ModalBox) {

//		Example:
//			Terrasoft.StructureExplorerUtilities.Open({
//						handlerMethodName: "onLookupResult",
//						moduleConfig: config,
//						scope: this
//					});

		Ext.define("Terrasoft.configuration.StructureExplorerUtilities", {
			extend: "Terrasoft.BaseObject",
			alternateClassName: "Terrasoft.StructureExplorerUtilities",

			singleton: true,

			/**
			 * Контейнер в который будет отрисован StructureExplorer.
			 * @private
			 * @type {Object}
			 */
			modalBoxContainer: null,

			/**
			 * Конфигурация открытия модального окна.
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
			 * Возвращает фиксированный контейнер в модальном окне.
			 * @protected
			 * @returns {Object}
			 */
			getFixedHeaderContainer: function() {
				return ModalBox.getFixedBox();
			},

			/**
			 * Возвращает основной контейнер в модальном окне.
			 * @protected
			 * @returns {Object}
			 */
			getGridContainer: function() {
				return this.modalBoxContainer;
			},

			/**
			 * Обновляет размеры окна в соответствии с контентом.
			 */
			UpdateSize: function() {
				ModalBox.updateSizeByContent();
			},

			/**
			 * Подготавливает модальное окно для загрузки туда модуля.
			 * @private
			 */
			prepareModalBox: function() {
				this.modalBoxContainer = ModalBox.show(this.modalBoxSize);
				ModalBox.setSize(820, 600);
			},

			/**
			 * Закрывает модальное окно.
			 */
			closeModalBox: function() {
				if (this.modalBoxContainer || ModalBox.getFixedBox()) {
					ModalBox.close();
					this.modalBoxContainer = null;
				}
			},

			/**
			 * Генерирует идентификатор для модуля.
			 * @private
			 * @param {Object} sandbox Песоцница модуля, вызывающего открытие выбора колонки.
			 * @return {string} Возвращает идентификатор для модуля.
			 */
			getStructureExplorerPageId: function(sandbox) {
				return sandbox.id + "_StructureExplorerModule";
			},

			/**
			 * Регистрирует необходимые модулю сообщения.
			 * @protected
			 * @param {Object} sandbox Песочница модуля.
			 */
			registerStructureExplorerModuleMessages: function(sandbox) {
				var messages = {
					"StructureExplorerInfo": {
						"mode": Terrasoft.MessageMode.PTP,
						"direction": Terrasoft.MessageDirectionType.SUBSCRIBE
					},
					"ColumnSelected": {
						"mode": Terrasoft.MessageMode.PTP,
						"direction": Terrasoft.MessageDirectionType.SUBSCRIBE
					}
				};
				sandbox.registerMessages(messages);
			},

			/**
			 * Открывает окно выбора колонки.
			 * @param {Object} config Конфигурация модуля выбора колонки.
			 * @param {String} config.handlerMethodName Имя метода-обработчика результата выбора. Должен содержатся в
			 * окружении "scope".
			 * @param {Function} config.handlerMethod Метод-обработчик результата выбора.
			 * @param {Terrasoft.BaseViewModel} config.scope Окружение, в рамках которого вызывается метод-обработчик.
			 * Также хранит параметры открытия окна выбора из справочника
			 * @param {Object} [config.sandbox] Песоцница модуля, вызывающего открытие справочника
			 * Необязательный, если ее содержит окружение.
			 * @param {Object} config.lookupConfig Объект параметров для страницы выбора из справочника.
			 */
			open: function(config) {
				var scope = config.scope;
				var sandbox = config.sandbox || scope.sandbox;
				var moduleConfig = config.moduleConfig;
				moduleConfig.handlerMethodName = config.handlerMethodName;
				moduleConfig.handlerMethod = config.handlerMethod;
				var structureExplorerPageId = moduleConfig.structureExplorerPageId = this.getStructureExplorerPageId(sandbox);
				scope.structureExplorerConfig = moduleConfig;
				this.registerStructureExplorerModuleMessages(sandbox);
				sandbox.subscribe("StructureExplorerInfo", function() {
					return this.structureExplorerConfig;
				}, scope, [structureExplorerPageId]);
				sandbox.subscribe("ColumnSelected", function(args) {
					var structureExplorerConfig = this.structureExplorerConfig;
					if (Ext.isFunction(this[structureExplorerConfig.handlerMethodName])) {
						this[structureExplorerConfig.handlerMethodName](args);
					}
					if (Ext.isFunction(structureExplorerConfig.handlerMethod)) {
						structureExplorerConfig.handlerMethod.call(scope, args);
					}
					sandbox.unloadModule(structureExplorerConfig.structureExplorerPageId);
					Terrasoft.LookupUtilities.CloseModalBox();
					delete this.structureExplorerConfig;
				}, scope, [structureExplorerPageId]);
				this.prepareModalBox();
				sandbox.loadModule("StructureExploreModule", {
					renderTo: this.getGridContainer(),
					id: structureExplorerPageId
				});
			}
		});

	});
