define("CtiContainerList", ["terrasoft", "ext-base", "ContainerList", "SchemaBuilderV2"], function(Terrasoft, Ext) {

	/**
	 * Класс реализует отображение коллекции панелей.
	 */
	Ext.define("Terrasoft.controls.CtiContainerList", {
		extend: "Terrasoft.ContainerList",
		alternateClassName: "Terrasoft.CtiContainerList",

		/**
		 * Префикс идеднтификатора элемента панели.
		 * @type {String}
		 */
		dataItemIdPrefix: "cti-panel-item",

		/**
		 * Идеднтификатор sandbox.
		 * Используется для формирования уникального идентификатора элемента панели.
		 * @type {String}
		 */
		sandboxId: "",

		/**
		 * Класс внешнего контейнера панели.
		 * @type {String}
		 */
		wrapClassName: "list-item-container",

		/**
		 * CSS селектор элемента коллекции.
		 * @type {String}
		 */
		rowCssSelector: ".list-item-container",

		/**
		 * @inheritdoc Terrasoft.ContainerList#getItemElementId
		 * @overridden
		 */
		getItemElementId: function(item) {
			var id = item.get(this.idProperty);
			return this.dataItemIdPrefix + "-" + id + item.sandbox.id;
		},

		/**
		 * Получает уникальный marker value элемента интерфейса.
		 * @protected
		 * @param {Object} item Элемент коллекции панелей.
		 * @returns {String} Уникальный marker value элемента интерфейса.
		 */
		getItemMarkerValue: function(item) {
			var id = item.get(this.idProperty);
			return this.dataItemIdPrefix + "-" + id;
		},

		/**
		 * Возвращает конфигурация представления элемента панели.
		 * @protected
		 * @param {Object} item Элемент коллекции панелей.
		 * @returns {Object} Конфигурация представления элемента панели.
		 */
		getItemConfig: function(item) {
			var itemConfig = this.defaultItemConfig;
			var itemCfg = {};
			this.fireEvent("onGetItemConfig", itemCfg, item);
			if (itemCfg.config) {
				itemConfig = itemCfg.config;
				this.defaultItemConfig = itemCfg.config;
			}
			if (Ext.isFunction(this.getCustomItemConfig)) {
				itemConfig = this.getCustomItemConfig(item) || itemConfig;
			}
			return Terrasoft.deepClone(itemConfig);
		},

		/**
		 * @inheritdoc Terrasoft.ContainerList#getItemView
		 * @overridden
		 */
		getItemView: function(item) {
			this.sandboxId = item.sandbox.id;
			var itemConfig = this.getItemConfig(item);
			var itemMarkerValue = this.getItemMarkerValue(item);
			var itemElementId = this.getItemElementId(item);
			this.decorateView(itemConfig, itemElementId, this.sandboxId);
			return Ext.create("Terrasoft.Container", {
				id: itemElementId,
				markerValue: itemMarkerValue,
				items: itemConfig,
				classes: {"wrapClassName": [this.wrapClassName]}
			});
		}

	});

});