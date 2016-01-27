define("BaseGridRowViewModel", ["EmailHelper", "terrasoft"], function(EmailHelper, Terrasoft) {

	/**
	 * @class Terrasoft.configuration.BaseGridRowViewModel
	 */
	Ext.define("Terrasoft.configuration.BaseGridRowViewModel", {
		extend: "Terrasoft.BaseViewModel",
		alternateClassName: "Terrasoft.BaseGridRowViewModel",

		/**
		 * Добавляет колонку выбора количества точек входа
		 * @overridden
		 */
		getEntitySchemaQuery: function() {
			var entitySchemaQuery = this.callParent(arguments);
			this.addProcessEntryPointColumn(entitySchemaQuery);
			return entitySchemaQuery;
		},

		/**
		 *
		 */
		constructor: function() {
			this.callParent(arguments);
			this.initResources();
		},

		/**
		 * Инициализирует ресуры.
		 * @param {Array} strings Ресурсы
		 * @protected
		 */
		initResources: function(strings) {
			strings = strings || {};
			Terrasoft.each(strings, function(value, key) {
				this.set("Resources.Strings." + key, value);
			}, this);
		},

		/**
		 * Добавляет подзапрос, который вычисляет количество активных точек входа по процессу
		 * @param esq
		 */
		addProcessEntryPointColumn: function(esq) {
			var itemConfig = {
				columnPath: "[EntryPoint:EntityId].Id",
				parentCollection: this,
				aggregationType: Terrasoft.AggregationType.COUNT
			};
			var column = Ext.create("Terrasoft.SubQueryExpression", itemConfig);
			var filter = esq.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL, "IsActive", true);
			column.subFilters.addItem(filter);
			var esqColumn = esq.addColumn("EntryPointsCount");
			esqColumn.expression = column;
		},

		/**
		 * Возвращает реестру конфиг по умолчанию для отображения в виде ссылки e-mail или url
		 * в зависимости от текущего значения в указанной колонке.
		 * @param column
		 */
		getLinkColumnConfig: function(column) {
			var value = this.get(column.columnPath);
			var config = {
				title: value,
				caption: value,
				target: "_blank"
			};
			if (EmailHelper.isEmailAddress(value)) {
				config.target = "_self";
				config.url = EmailHelper.getEmailUrl(value);
			} else if (Terrasoft.isUrl(value)) {
				config.url = value;
			} else {
				config = null;
			}
			return config;
		}
	});

	return Terrasoft.BaseGridRowViewModel;
});