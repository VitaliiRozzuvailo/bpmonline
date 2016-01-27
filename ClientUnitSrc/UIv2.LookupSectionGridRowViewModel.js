define("LookupSectionGridRowViewModel", ["ext-base", "LookupSectionGridRowViewModelResources",
	"BaseSectionGridRowViewModel"], function(Ext, resources) {

	/**
	 * @class Terrasoft.configuration.LookupSectionGridRowViewModel
	 */
	Ext.define("Terrasoft.configuration.LookupSectionGridRowViewModel", {
		extend: "Terrasoft.BaseSectionGridRowViewModel",
		alternateClassName: "Terrasoft.LookupSectionGridRowViewModel",

		constructor: function() {
			this.callParent(arguments);
			this.initResourcesValues(resources);
		},

		/**
		 * @inheritdoc Terrasoft.BaseViewModel#getEntitySchemaQuery
		 * @overridden
		 */
		getEntitySchemaQuery: function() {
			var entitySchemaQuery = this.callParent(arguments);
			this.addSchemaNameColumn(entitySchemaQuery, "[VwSysSchemaInfo:UId:SysEntitySchemaUId].Name", "EntitySchemaName");
			this.addSchemaNameColumn(entitySchemaQuery, "[VwSysSchemaInfo:UId:SysPageSchemaUId].Name", "PageSchemaName");
			var columnName = "SysLookup";
			if (!entitySchemaQuery.columns.contains(columnName)) {
				entitySchemaQuery.addColumn(columnName);
			}
			return entitySchemaQuery;
		},

		/**
		 * Добавляет в запрос колонку имени схемы.
		 * @protected
		 * @virtual
		 * @param {Terrasoft.EntitySchemaQuery} esq Объект запроса.
		 * @param {String} columnPath Путь к колонке.
		 * @param {String} columnAlias Псевдоним колонки.
		 */
		addSchemaNameColumn: function(esq, columnPath, columnAlias) {
			var expressionConfig = {
				columnPath: columnPath,
				parentCollection: this,
				aggregationType: Terrasoft.AggregationType.NONE
			};
			var column = Ext.create("Terrasoft.SubQueryExpression", expressionConfig);
			var filter = Terrasoft.createColumnFilterWithParameter(
				Terrasoft.ComparisonType.EQUAL,
				"SysWorkspace",
				Terrasoft.SysValue.CURRENT_WORKSPACE.value
			);
			column.subFilters.addItem(filter);
			var esqColumn = esq.addColumn(columnAlias);
			esqColumn.expression = column;
		},

		/**
		 * Инициализирует модель значениями ресурсов из объекта ресурсов.
		 * @protected
		 * @virtual
		 * @param {Object} resourcesObj Объект ресурсов.
		 */
		initResourcesValues: function(resourcesObj) {
			var resourcesSuffix = "Resources";
			Terrasoft.each(resourcesObj, function(resourceGroup, resourceGroupName) {
				resourceGroupName = resourceGroupName.replace("localizable", "");
				Terrasoft.each(resourceGroup, function(resourceValue, resourceName) {
					var viewModelResourceName = [resourcesSuffix, resourceGroupName, resourceName].join(".");
					this.set(viewModelResourceName, resourceValue);
				}, this);
			}, this);
		}
	});

	return Terrasoft.BaseSectionGridRowViewModel;
});