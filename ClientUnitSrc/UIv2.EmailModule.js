define("EmailModule", ["BaseSchemaModuleV2"],
	function() {
		/**
		 * @class Terrasoft.configuration.EmailModule
		 * Класс EmailModule предназначен для создания экземпляра модуля для работы с почтой.
		 */
		Ext.define("Terrasoft.configuration.EmailModule", {
			alternateClassName: "Terrasoft.EmailModule",
			extend: "Terrasoft.BaseSchemaModule",
			Ext: null,
			sandbox: null,
			Terrasoft: null,

			/**
			 *  Инициализация начальных параметров модуля.
			 * @overridden
			 */
			init: function() {
				this.useHistoryState = false;
				this.callParent(arguments);
			},

			/**
			 * Название схемы отображаемой сущности.
			 * @protected
			 * @type {String}
			 */
			schemaName: "CommunicationPanelEmailSchema",

			/**
			 * Признак того, что параметры схемы установлены извне.
			 * @public
			 * @type {Boolean}
			 */
			isSchemaConfigInitialized: true,

			/**
			 * Выполняет прорисовку модуля в контейнер.
			 * @private
			 * @overridden
			 * @param {Ext.Element} renderTo Элемент, в который будет происходить отрисовка.
			 */
			render: function(renderTo) {
				this.callParent(arguments);
			}
		});
		return Terrasoft.EmailModule;
	});
