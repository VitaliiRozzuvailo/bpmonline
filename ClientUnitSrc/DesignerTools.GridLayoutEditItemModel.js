define("GridLayoutEditItemModel", ["GridLayoutEditItemModelResources"], function(resources) {

	/**
	 * @class Terrasoft.configuration.GridLayoutEditItemModel
	 * Класс модели элемента сетки для дизайнера клиентских схем.
	 */
	Ext.define("Terrasoft.configuration.GridLayoutEditItemModel", {
		extend: "Terrasoft.BaseViewModel",
		alternateClassName: "Terrasoft.GridLayoutEditItemModel",

		/**
		 * Конфигурация элемента сетки.
		 * @type {Object}
		 */
		itemConfig: null,

		/**
		 * Конфигурация колонки элемента.
		 * @type {Terrasoft.EntitySchemaColumn}
		 */
		column: null,

		/**
		 * Значения позиции элементов в GridLayout по умолчанию.
		 * @private
		 * @type {Object}
		 */
		defaultGridLayoutItemConfig: {
			colSpan: 12,
			rowSpan: 1,
			column: 0,
			row: 0
		},

		/**
		 * Возвращает конфигурацию картинки для текущего типа данных.
		 * @protected
		 * @virtual
		 * @return {Object} Конфигураци картинки.
		 */
		getImageConfig: function() {
			var dataValueType = this.get("DataValueType");
			if (dataValueType) {
				var resourceName = this.getResourceNameForDataValueType(dataValueType);
				return this.get(resourceName);
			}
			return null;
		},

		/**
		 * Возвращает код операции перетаскивания для типа данных.
		 * @protected
		 * @virtual
		 * @return {Object} Конфигураци картинки.
		 */
		getDragActionCode: function() {
			var dragAction = Terrasoft.DragAction.MOVE | Terrasoft.DragAction.RESIZE_LEFT |
				Terrasoft.DragAction.RESIZE_RIGHT;
			var dataValueType = this.get("DataValueType");
			var contentType = this.itemConfig.contentType;
			if (dataValueType === Terrasoft.DataValueType.TEXT && contentType === Terrasoft.ContentType.LONG_TEXT){
				dragAction = Terrasoft.DragAction.ALL;
			}
			return dragAction;
		},

		/**
		 * Возвращает имя локализированного ресурса в зависимости от переданного типа данных.
		 * @protected
		 * @virtual
		 * @param {Terrasoft.DataValueType} dataValueType Тип данных.
		 * @return {string} Имя локализированного ресурса.
		 */
		getResourceNameForDataValueType: function(dataValueType) {
			switch (dataValueType) {
				case Terrasoft.DataValueType.TEXT:
					return "Resources.Images.TextEditImage";
				case Terrasoft.DataValueType.INTEGER:
					return "Resources.Images.IntegerEditImage";
				case Terrasoft.DataValueType.FLOAT:
				case Terrasoft.DataValueType.MONEY:
					return "Resources.Images.FloatEditImage";
				case Terrasoft.DataValueType.DATE_TIME:
				case Terrasoft.DataValueType.DATE:
				case Terrasoft.DataValueType.TIME:
					return "Resources.Images.DateTimeEditImage";
				case Terrasoft.DataValueType.LOOKUP:
					return "Resources.Images.LookupEditImage";
				case Terrasoft.DataValueType.ENUM:
					return "Resources.Images.ComboBoxEditImage";
				case Terrasoft.DataValueType.BOOLEAN:
					return "Resources.Images.CheckBoxImage";
			}
			return "";
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
		 * Инициализировет параметры модели представленя, отвечающие за расположение элемента в сетке.
		 * @protected
		 * @virtual
		 */
		initLayout: function() {
			var layout = this.itemConfig.layout;
			var itemLayout = Ext.apply({}, layout, this.defaultGridLayoutItemConfig);
			this.itemConfig.layout = itemLayout;
			Terrasoft.each(itemLayout, function(item, key) {
				this.set(key, item);
			}, this);
		},

		/**
		 * Инициализирует отображаемое значение для элемента.
		 * @protected
		 * @virtual
		 */
		initCaption: function() {
			var column = this.column;
			if (!column) {
				var itemName = this.itemConfig.name;
				this.set("content", itemName);
			} else {
				var caption = column.getPropertyValue && column.getPropertyValue("caption");
				caption = Terrasoft.instanceOfClass(caption, "Terrasoft.LocalizableString")
					? caption.getValue()
					: caption;
				this.set("content", caption);
			}
		},

		/**
		 * Инициализирует тип данных для элемента.
		 * @protected
		 * @virtual
		 */
		initDataValueType: function() {
			var column = this.column;
			if (column) {
				this.set("DataValueType", column.dataValueType);
			}
		},

		/**
		 * Генерирует массив классов для текущего элемента.
		 * @protected
		 * @virtual
		 * @return {String[]} Массив CSS классов.
		 */
		getItemClasses: function() {
			var column = this.column;
			var wrapClasses = [];
			if (column) {
				if (column.isRequired) {
					wrapClasses.push("is-required");
				}
			}
			return wrapClasses;
		},

		/**
		 * Инициализируер CSS классы элемента.
		 * @protected
		 * @virtual
		 */
		initStyles: function() {
			var wrapClasses = this.getItemClasses();
			this.set("wrapClasses", wrapClasses);
		},

		/**
		 * Инициализирует аттрибут обязательности колонки.
		 * @protected
		 * @virtual
		 */
		initIsRequired: function() {
			this.set("IsRequired", this.column && this.column.isRequired);
		},

		/**
		 * Инициализирует код операции перетаскивания для типа данных.
		 * @protected
		 * @virtual
		 */
		initDragActionCode: function() {
			this.set("DragActionsCode", this.getDragActionCode());
		},

		/**
		 * Обновляет объект расположения в конфигурации элемента в соответствии с текущим положением.
		 * @protected
		 * @virtual
		 */
		updateLayout: function() {
			var layout = this.itemConfig.layout;
			Terrasoft.each(layout, function(item, key) {
				layout[key] = this.get(key);
			}, this);
		},

		/**
		 * Возвращает обновленный объект конфигурации элемента сетки.
		 * @return {Object}
		 */
		getConfigObject: function() {
			this.updateLayout();
			return Terrasoft.deepClone(this.itemConfig);
		},

		/**
		 * Обрабативает изменение колонки.
		 * @protected
		 * @virtual
		 */
		onColumnChange: function() {
			this.initCaption();
			this.initIsRequired();
			this.initDataValueType();
			this.initDragActionCode();
			this.initStyles();
		},

		/**
		 * Создает объект, инициализирует его свойства.
		 * @overridden
		 */
		constructor: function() {
			this.callParent(arguments);
			var itemName = this.itemConfig.name;
			this.set("itemId", itemName);
			this.initLayout();
			this.onColumnChange();
			if (this.column) {
				this.column.on("changed", this.onColumnChange, this);
			}
			this.initResourcesValues(resources);
		},

		/**
		 * Проверяет видимость кнопки настройки для данного поля.
		 * @protected
		 * @virtual
		 * @return {boolean} true - если поле можно настраивать, false - в обратном случае.
		 */
		getConfigurationButtonVisible: function() {
			return this.column && !this.itemConfig.generator;
		},

		/**
		 * Добавляет группу для перетаскивания.
		 * @param {String} groupName Название группы.
		 */
		addDraggableGroupName: function(groupName) {
			var draggableGroupNames = this.get("draggableGroupNames") || [];
			draggableGroupNames = Terrasoft.deepClone(draggableGroupNames);
			draggableGroupNames.push(groupName);
			this.set("draggableGroupNames", draggableGroupNames);
		},

		/**
		 * Проверяет видимость кнопки удаления для данного поля.
		 * @protected
		 * @virtual
		 * @return {boolean} true - если поле можно удалять, false - в обратном случае.
		 */
		getRemoveButtonVisible: function() {
			return true;
		},

		/**
		 * @inheritdoc Terrasoft.BaseViewModel#destroy
		 * @overridden
		 */
		destroy: function() {
			if (this.column) {
				this.column.un("changed", this.onColumnChange, this);
			}
			this.callParent(arguments);
		}
	});

	/**
	 * @class Terrasoft.configuration.GridLayoutEditDragableItemModel
	 * Класс модели перетаскиваемого элемента для сетки дизайнера клиентских схем.
	 */
	Ext.define("Terrasoft.configuration.GridLayoutEditDragableItemModel", {
		extend: "Terrasoft.GridLayoutEditItemModel",
		alternateClassName: "Terrasoft.GridLayoutEditDragableItemModel",

		sandbox: null,

		/**
		 * Название класса элемента, если он уже был использован в станице.
		 * @type {String}
		 */
		usedClassName: "used-item",

		/**
		 * Признак того, что поле является шаблоном для новых полей.
		 * @type {Boolean}
		 */
		isVirtual: false,

		/**
		 * Инициализирует обработчики изменения модели.
		 * @protected
		 * @virtual
		 */
		initModelBindings: function() {
			this.on("change:ItemUsed", this.onItemUsedChange, this);
		},

		/**
		 * @inheritdoc Terrasoft.GridLayoutEditItemModel#getItemClasses
		 * @overridden
		 */
		getItemClasses: function() {
			var wrapClasses = this.callParent(arguments);
			if (this.get("ItemUsed")) {
				wrapClasses.push(this.usedClassName);
			}
			return wrapClasses;
		},

		/**
		 * Добавляет к элементу стиль если элемент был использовать на странице и
		 * убирает если он больше не используется.
		 * @param {Object} model Backbone модель.
		 * @param {Boolean} value Признак используемости элемента.
		 */
		onItemUsedChange: function(model, value) {
			var wrapClasses = this.get("wrapClasses") || [];
			wrapClasses = Terrasoft.deepClone(wrapClasses);
			if (value) {
				if (wrapClasses.indexOf(this.usedClassName) === -1) {
					wrapClasses.push(this.usedClassName);
				}
			} else {
				var itemIndex = wrapClasses.indexOf(this.usedClassName);
				if (itemIndex !== -1) {
					wrapClasses.splice(itemIndex, 1);
				}
			}
			this.set("wrapClasses", wrapClasses);
		},

		/**
		 * Обрабатывает неправильное перетаскивание.
		 * @protected
		 * @virtual
		 */
		onInvalidDrop: function() {
			this.fireEvent("change", this, { operation: "InvalidDrop" });
		},

		/**
		 * Обрабатывает перетаскиваниt над зоной вставки.
		 * @protected
		 * @virtual
		 */
		onDragOver: function(intersection) {
			Ext.apply(intersection, {
				colSpan: this.get("colSpan"),
				rowSpan: this.get("rowSpan"),
				operation: "DragOver"
			});
			this.fireEvent("change", this, intersection);
		},

		/**
		 * Обрабатывает удачное перетаскивание.
		 * @protected
		 * @virtual
		 */
		onDragDrop: function(info) {
			Ext.apply(info, {
				operation: "DragDrop"
			});
			this.fireEvent("change", this, info);
		},

		/**
		 * Создает объект, инициализирует его свойства.
		 * @overridden
		 */
		constructor: function() {
			this.callParent(arguments);
			this.initModelBindings();
		}

	});

	return Terrasoft.GridLayoutEditItemModel;
});