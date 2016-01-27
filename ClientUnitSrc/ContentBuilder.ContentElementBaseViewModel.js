define("ContentElementBaseViewModel", function() {

	Ext.define("Terrasoft.ContentBuilder.ContentElementBaseViewModel", {
		extend: "Terrasoft.BaseViewModel",
		alternateClassName: "Terrasoft.ContentElementBaseViewModel",

		/**
		 * @inheritdoc Terrasoft.BaseViewModel#constructor
		 * @overridden
		 */
		constructor: function() {
			this.callParent(arguments);
			this.set("ClassName", this.className);
			this.on("change:Selected", this.onSelectedChanged, this);
		},

		/**
		 * Обрабатывет изменени выделенного элемента.
		 * @protected
		 * @virtual
		 */
		onSelectedChanged: function() {
			this.fireEvent("change", this, {
				event: "onselected",
				arguments: {Id: this.get("Id")}
			});
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
		},

		/**
		 * Кененирует объект конфигурации представления элемента.
		 * @return {Object} Объект конфигурации представления.
		 */
		getViewConfig: Terrasoft.abstractFn,

		/**
		 * Возвращает объект конфигураций инструментов блока контента.
		 * @protected
		 * @virtual
		 * @return {Array} Объект конфигураций инструментов блока контента..
		 */
		getToolsViewConfig: Terrasoft.abstractFn

	});

});
