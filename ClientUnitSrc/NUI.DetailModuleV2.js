define("DetailModuleV2", ["BaseSchemaModuleV2"], function() {
	/**
	 * @class Terrasoft.configuration.DetailModule
	 * Класс DetailModule предназначен для создания экземпляра детали
	 */
	Ext.define("Terrasoft.configuration.DetailModule", {
		alternateClassName: "Terrasoft.DetailModule",
		extend: "Terrasoft.BaseSchemaModule",

		/**
		 * Информация о детали
		 */
		detailInfo: null,

		/**
		 * Возвращает ключ профиля
		 * @returns {String}
		 */
		getProfileKey: function() {
			return this.detailInfo.cardPageName + this.detailInfo.schemaName;
		},

		/**
		 * Инициализация состояние, названия схемы, генерирует класс модели представления и представление.
		 * После этого создает и инициализирует экземпляр представления
		 * @overriden
		 */
		init: function() {
			this.subscribeMessages();
			this.initDetailInfo();
			this.callParent(arguments);
		},

		/**
		 * Подписывается на сообщения
		 * @protected
		 */
		subscribeMessages: function() {
			this.sandbox.subscribe("RerenderDetail", function(config) {
				if (this.viewModel) {
					var renderTo = this.Ext.get(config.renderTo);
					if (renderTo) {
						this.render(renderTo);
						return true;
					}
				}
			}, this, [this.sandbox.id]);
		},

		/**
		 * Возвращает объект настроек модели представления.
		 * @return {Object} Возвращает объект настроек модели представления.
		 */
		getViewModelConfig: function() {
			var viewModelConfig = this.callParent(arguments);
			var detailInfo = this.detailInfo;
			this.Ext.apply(viewModelConfig, {
				values: {
					MasterRecordId: detailInfo.masterRecordId,
					DetailColumnName: detailInfo.detailColumnName,
					Filter: detailInfo.filter,
					CardPageName: detailInfo.cardPageName,
					SchemaName: detailInfo.schemaName,
					DefaultValues: detailInfo.defaultValues,
					Caption: detailInfo.caption,
					UseRelationship: detailInfo.useRelationship,
					RelationType: detailInfo.relationType,
					RelationTypePath: detailInfo.relationTypePath,
					RelationshipPath: detailInfo.relationshipPath
				}
			});
			return viewModelConfig;
		},

		/**
		 * Инициализирует название схемы.
		 * @protected
		 * @overriden
		 */
		initSchemaName: function() {
			this.schemaName = this.detailInfo.schemaName || "";
			this.entitySchemaName = this.detailInfo.entitySchemaName;
		},

		/**
		 * Инициализирует информацию детали
		 * @protected
		 */
		initDetailInfo: function() {
			this.detailInfo = this.sandbox.publish("GetDetailInfo", null, [this.sandbox.id]) || {};
		},

		/**
		 * Заменяет последний элемент в цепочке состояний, если его идентификатор модуля отличается от текущего
		 * @protected
		 * @overriden
		 */
		initHistoryState: Ext.emptyFn
	});
	
	return Terrasoft.DetailModule;
});