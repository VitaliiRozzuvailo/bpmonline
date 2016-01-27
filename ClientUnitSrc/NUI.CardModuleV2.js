define("CardModuleV2", ["BusinessRulesApplierV2", "BaseSchemaModuleV2"], function(BusinessRulesApplier) {
	/**
	 * @class Terrasoft.configuration.CardModule
	 * Это класс, который используется для создания модуля картчоки
	 */
	Ext.define("Terrasoft.configuration.CardModule", {
		alternateClassName: "Terrasoft.CardModule",
		extend: "Terrasoft.BaseSchemaModule",

		/**
		 * Флаг, указывающий на то, что карточка на странице одна.
		 * Если значение false, то на странице присутствует SectionModule
		 * @protected
		 * @type {Boolean}
		 */
		isSeparateMode: true,

		/**
		 * Название схемы объекта.
		 * @protected
		 * @type {String}
		 */
		entitySchemaName: "",

		/**
		 * Значения певричной колонки
		 * @protected
		 * @type {String}
		 */
		primaryColumnValue: Terrasoft.GUID_EMPTY,

		/**
		 * Режим работы карточки.
		 * ConfigurationEnums.CardStateV2.ADD|EDIT|COPY
		 * @protected
		 * @type {String}
		 */
		operation: "",

		/**
		 * Флаг, указывающий на то, что карточка открыта в цепочке
		 * @protected
		 * @type {Boolean}
		 */
		isInChain: false,

		/**
		 * Заменяет последний элемент в цепочке состояний, если его идентификатор модуля отличается от текущего
		 * @protected
		 * @overridden
		 */
		initHistoryState: function() {
			var sandbox = this.sandbox;
			var historyState = sandbox.publish("GetHistoryState");
			var state = historyState.state || {};
			if (state.isInChain || this.getIsSeparateMode()) {
				this.callParent(arguments);
			}
		},

		getIsSeparateMode: function() {
			var historyState = this.sandbox.publish("GetHistoryState");
			var hash = historyState.hash;
			return (hash.moduleName === "CardModuleV2");
		},

		/**
		 * Инициализирует название схемы
		 * @protected
		 * @overridden
		 */
		initSchemaName: function() {
			var historyState = this.sandbox.publish("GetHistoryState");
			var state = historyState.state || {};
			this.isInChain = state.isInChain;
			if (Ext.isEmpty(state.schemaName) && !state.isInChain) {
				var hash = historyState.hash;
				var isSeparateMode =  this.isSeparateMode = this.getIsSeparateMode();
				if (isSeparateMode) {
					this.schemaName = hash.entityName;
					this.operation = hash.operationType;
					this.primaryColumnValue = hash.recordId;
				} else {
					var stateItems = hash.historyState.split("/");
					this.schemaName = stateItems[2];
					this.operation = stateItems[3];
					this.primaryColumnValue = stateItems[4];
				}
			} else {
				this.isSeparateMode = state.isSeparateMode;
				if (state.entitySchemaName) {
					this.entitySchemaName = state.entitySchemaName;
				}
				this.schemaName = state.schemaName;
				this.operation = state.operation;
				this.primaryColumnValue = state.primaryColumnValue;
			}
		},

		/**
		 * Возвращает объект настроек модели представления.
		 * @return {Object} Возвращает объект настроек модели представления.
		 */
		getViewModelConfig: function() {
			var viewModelConfig = this.callParent(arguments);
			Ext.apply(viewModelConfig, {
				values: {
					IsSeparateMode: this.isSeparateMode,
					PrimaryColumnValue: this.primaryColumnValue,
					Operation: this.operation,
					IsInChain: this.isInChain
				}
			});
			return viewModelConfig;
		},

		/**
		 * @inheritdoc Terrasoft.BaseSchemaModule#createViewModel
		 * Метод для схем карточек, применяет зависимости колонок
		 * (см. {@link Terrasoft.BusinessRulesApplier.applyDependencies}).
		 * @protected
		 * @overridden
		 */
		createViewModel: function() {
			var viewModel = this.callParent(arguments);
			if (viewModel.type === Terrasoft.SchemaType.EDIT_VIEW_MODEL_SCHEMA) {
				BusinessRulesApplier.applyDependencies(viewModel);
			}
			return viewModel;
		}

	});
	return Terrasoft.CardModule;
});
