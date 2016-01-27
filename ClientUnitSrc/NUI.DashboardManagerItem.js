define("DashboardManagerItem", ["DashboardManagerItemResources", "object-manager-item", "css!DashboardManagerItem"],
function(resources) {

	/**
	 * @class Terrasoft.DashboardManagerItem
	 * @public
	 * Класс представляет итог.
	 */
	Ext.define("Terrasoft.DashboardManagerItem", {
		extend: "Terrasoft.ObjectManagerItem",
		alternateClassName: "Terrasoft.DashboardManagerItem",

		// region Properties: Private

		/**
		 * Заголовок.
		 * @private
		 * @type {String}
		 */
		caption: null,

		/**
		 * Идентификатор раздела.
		 * @private
		 * @type {String}
		 */
		sectionId: null,

		/**
		 * Конфигурация отображения элементов.
		 * @private
		 * @type {Object[]}
		 */
		viewConfig: null,

		/**
		 * Конфигурация модулей элементов.
		 * @private
		 * @type {Object}
		 */
		items: null,

		/**
		 * Позиция элемента.
		 * @private
		 * @type {Number}
		 */
		position: null,

		/**
		 * Список серелиазированных параметров.
		 * @type {String[]}
		 */
		encodedProperties: ["viewConfig", "items"],

		// endregion

		//region Properties: Public

		/**
		 * Признак валидности итога.
		 * @type {Boolean}
		 */
		isValid: false,

		//endregion

		// region Methods: Public

		/**
		 * Метод возвращает заголовок.
		 * @return {String}
		 */
		getCaption: function() {
			return this.caption;
		},

		/**
		 * Метод возвращает конфигурацию отображения элементов.
		 * @return {Object}
		 */
		getViewConfig: function() {
			return Terrasoft.deepClone(this.viewConfig);
		},

		/**
		 * Метод возвращает конфигурацию модулей элементов.
		 * @return {Object}
		 */
		getItems: function() {
			return Terrasoft.deepClone(this.items);
		},

		/**
		 * Метод возвращает позицию элемента.
		 * @return {Number} Возвращает позицию элемента
		 */
		getPosition: function() {
			return this.position;
		},

		/**
		 * Метод возвращает идентификатор раздела.
		 * @return {String} Возвращает идентификатор раздела.
		 */
		getSectionId: function() {
			return this.sectionId;
		},

		getInvalidDashboardViewConfig: function() {
			var viewConfig = [{
				"layout": {"column": 0, "row": 0, "colSpan": 24, "rowSpan": 3},
				"name": this.id + "dashboard-manager-item-error-container",
				"itemType": Terrasoft.ViewItemType.CONTAINER,
				"classes": {
					"wrapClassName": ["invalid-dashboard-manager-item-container"]
				},
				"controlConfig": {
					"items": [
						{
							className: "Terrasoft.ImageEdit",
							readonly: true,
							classes: {
								wrapClass: ["image-control"]
							},
							"imageSrc": Terrasoft.ImageUrlBuilder.getUrl(resources.localizableImages.InfoImage)
						},
						{
							"className": "Terrasoft.Label",
							"labelClass": ["invalid-dashboard-manager-item-title"],
							"caption": resources.localizableStrings.CantShowDashboard
						},
						{
							"className": "Terrasoft.Label",
							"labelClass": ["invalid-dashboard-manager-item-hint"],
							"caption": resources.localizableStrings.CantShowDashboardHint
						}
					]
				}
			}];
			return viewConfig;
		},

		/**
		 * @inheritDoc Terrasoft.manager.ObjectManagerItem#setProperties
		 * @overridden
		 */
		setProperties: function() {
			this.callParent(arguments);
			try {
				this.viewConfig = (this.viewConfig && Terrasoft.decode(this.viewConfig)) || [];
				this.items = (this.items && Terrasoft.decode(this.items)) || {};
				this.isValid = true;
			} catch (e) {
				this.isValid = false;
				this.viewConfig = this.getInvalidDashboardViewConfig();
				this.items = {};
				var logMessage = Ext.String.format(resources.localizableStrings.InvalidJSONMessage, this.id, e.message);
				this.log(logMessage, Terrasoft.LogMessageType.ERROR);
			}
		},

		/**
		 * @inheritDoc Terrasoft.manager.ObjectManagerItem#setPropertyValue
		 * @overridden
		 */
		setPropertyValue: function(propertyName, propertyValue) {
			if (this.encodedProperties.indexOf(propertyName) !== -1) {
				var encodedPropertyValue = Terrasoft.encode(propertyValue);
				this.callParent([propertyName, encodedPropertyValue]);
				this[propertyName] = propertyValue;
			} else {
				this.callParent(arguments);
			}
		},

		/**
		 * Метод устанавливает значение для заголовка элемента.
		 * @public
		 * @param {String} caption Заголовок.
		 */
		setCaption: function(caption) {
			this.setPropertyValue("caption", caption);
		},

		/**
		 * Метод устанавливает позицию элемента.
		 * @param {Number} position позиция.
		 */
		setPosition: function(position) {
			this.setPropertyValue("position", position);
		},

		/**
		 * Метод устанавливает конфигурацию отображения элементов.
		 * @param {Object[]} viewConfig Конфигурация отображения элементов.
		 */
		setViewConfig: function(viewConfig) {
			this.viewConfig = Terrasoft.deepClone(viewConfig);
			this.setPropertyValue("viewConfig", this.viewConfig);
		},

		/**
		 * Метод устанавливает конфигурацию модулей элементов.
		 * @param {Object} items Конфигурация модулей элементов.
		 */
		setItems: function(items) {
			this.items = Terrasoft.deepClone(items);
			this.setPropertyValue("items", this.items);
		},

		/**
		 * Метод устанавливает идентификатор раздела.
		 * @param {String} sectionId Идентификатор раздела.
		 */
		setSectionId: function(sectionId) {
			this.setPropertyValue("sectionId", this.sectionId);
		},

		/**
		 * @inheritDoc Terrasoft.manager.BaseManagerItem#getSerializedPropertiesConfig
		 * @overridden
		 */
		getSerializedPropertiesConfig: function() {
			var config = this.callParent(arguments);
			Ext.apply(config, {
				"caption": {
				},
				"viewConfig": {
				},
				"items": {
				},
				"position": {
				},
				"sectionId": {
				},
				"encodedProperties": {
				},
				"propertyColumnNames": {
				}
			});
			return config;
		},

		/**
		 * @inheritDoc Terrasoft.manager.BaseManagerItem#copy
		 * @overridden
		 */
		copy: function() {
			var copy = this.callParent(arguments);
			var newCaption = Ext.String.format(resources.localizableStrings.CopyCaptionFormat, copy.getCaption());
			copy.setCaption(newCaption);
			return copy;
		}

		// endregion

	});
	return Terrasoft.DashboardManagerItem;
});
