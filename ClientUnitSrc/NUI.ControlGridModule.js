define("ControlGridModule", ["terrasoft", "ext-base"], function(Terrasoft, Ext) {
	/**
	 * @class Terrasoft.configuration.ControlGrid
	 * Класс реализует логику отображения контрола в реестре.
	 */
	Ext.define("Terrasoft.configuration.ControlGrid", {

		extend: "Terrasoft.Grid",

		alternateClassName: "Terrasoft.ControlGrid",

		/**
		 * Имя колонки используемой для отображения контрола.
		 * @protected
		 */
		controlColumnName: null,

		/**
		 * Коллекция объектов, содержащая ссылки на элементы управления.
		 * @protected
		 */
		controlsCollection: null,

		/**
		 * Css класс ячейки контрола.
		 * @protected
		 */
		controlCellClass: "control-cell",

		/**
		 * Css класс обертки контрола.
		 * @protected
		 */
		controlWrapClass: "control-wrap",

		/**
		 * @inheritDoc Terrasoft.Component#initDomEvents
		 * @protected
		 * @overridden
		 */
		init: function() {
			this.controlsCollection = [];
			this.callParent(arguments);
			this.addEvents("applyControlConfig");
		},

		/**
		 * Рендеринг ячейки.
		 * @protected
		 * @param {Array} result Коллекция объектов используемая для формирования HTML кода ячеек реестра.
		 * @param {Object} options Объект с структурой ячейки и значениями отображаемых полей текущей строки.
		 */
		renderCell: function(result, options) {
			var isControlColumn = false;
			var cell = options.cell;
			var data = options.row;
			Terrasoft.each(cell.key, function(column) {
				if (column.name && Ext.isObject(column.name) &&
						(column.name.bindTo === this.controlColumnName)) {
					isControlColumn = true;
				}
			}, this);
			if (!isControlColumn) {
				return this.callParent(arguments);
			}
			var cellReadyState = 0;
			var styles = {};
			var htmlConfig = {
				tag: "div",
				cls: "grid-cols-" + cell.cols,
				html: "",
				children: []
			};
			htmlConfig.cls += " " + this.controlCellClass;
			if (cell.minHeight) {
				styles["min-height"] = cell.minHeight;
			}
			if (cell.maxHeight) {
				styles["max-height"] = cell.maxHeight;
				styles.overflow = "hidden";
			}
			var key = cell.key;
			if (Ext.isArray(key)) {
				Terrasoft.each(key, function(column) {
					cellReadyState += this.formatControlCellContent(htmlConfig, data, column);
				}, this);
			}
			htmlConfig.style = Ext.DomHelper.generateStyles(styles);
			if (cellReadyState > 0) {
				result.push(htmlConfig);
				return 1;
			} else {
				htmlConfig.html = "";
				result.push(htmlConfig);
				return 0;
			}
		},

		/**
		 * Форматирование данных для ячейки контрола.
		 * @protected
		 * @param {Object} cell Объект формирующий HTML код ячееки реестра.
		 * @param {Object} data Отображаемые поля и значениями для текущей строки реестра.
		 * @param {Object} column Часть данных выводимая в ячейке реестра.
		 * @return {number} Количество порций данных, которое было добавлено за итерацию.
		 */
		formatControlCellContent: function(cell, data, column) {
			var cellReadyState = 0;
			var name = this.getDataKey(column.name);
			var type = column.type || "text";
			var gridType = this.type;
			var cellData = data[name];
			var internalColumn = Ext.Array.contains(this.internalColumns, type);
			if (!cellData && !internalColumn) {
				return cellReadyState;
			}
			if (type === "caption") {
				if (gridType === "tiled" && cell.html.length === 0 && (this.multiSelect || this.hierarchical)) {
					cell.style = "padding-top: 6px;";
				}
				/*jshint quotmark: false */
				cell.html += '<span class="grid-label">' + Terrasoft.utils.common.encodeHtml(name) + '</span>';
				/*jshint quotmark: true */
			} else if (type === "text" || type === "title") {
				var controlWrapId = Ext.String.format("{0}-{1}", this.controlWrapClass, data.Id);
				cell.html += Ext.String.format("<div id=\'{0}\' class=\'{1}\'></div>", controlWrapId,
						this.controlWrapClass);
				var controlObject = {
					id: data.Id,
					domId: controlWrapId,
					control: null
				};
				var isControlExist = Terrasoft.some(this.controlsCollection, function(item) {
					return item.id === data.Id;
				});
				if (!isControlExist) {
					this.controlsCollection.push(controlObject);
				}
				if (type === "title") {
					cell.cls += " grid-header";
				}
				cellReadyState += 1;
			}
			return cellReadyState;
		},

		/**
		 * Метод передает по ссылке конфиг контрола.
		 * @param {Object} control Объект содержащий конфиг контрола.
		 */
		applyControlConfig: function(control) {
			control.config = null;
		},

		/**
		 * Обработчик события "AfterRender".
		 * @overridden
		 */
		onAfterRender: function() {
			this.callParent(arguments);
			this.renderControlsCollection();
		},

		/**
		 * Обработчик события "AfterReRender".
		 * @overridden
		 */
		onAfterReRender: function() {
			this.callParent(arguments);
			this.renderControlsCollection();
		},

		/**
		 * Обработчик события "dataLoaded" коллекции Terrasoft.Collection.
		 * @overridden
		 */
		onCollectionDataLoaded: function() {
			this.callParent(arguments);
			this.renderControlsCollection();
		},

		/**
		 * Метод выполняет рендеринг контрола в ячейках реестра.
		 * @protected
		 */
		renderControlsCollection: function() {
			Terrasoft.each(this.controlsCollection, function(item) {
				var control = {};
				this.fireEvent("applyControlConfig", control);
				if (control.config) {
					var renderTo = Ext.get(item.domId);
					if (item.control === null) {
						var controlItem = Ext.create(control.config.className, control.config);
						var viewModel = this.collection.find(item.id);
						if (viewModel) {
							controlItem.bind(viewModel);
						}
						item.control = controlItem;
						if (renderTo) {
							item.control.render(renderTo);
						}
					} else {
						if (renderTo && item.control.allowRerender()) {
							item.control.reRender();
						}
					}
				}
			}, this);
		},

		/**
		 * Метод выполняет рендеринг контрола при обнолении ячейки реестра.
		 * @protected
		 * @param {Terrasoft.BaseViewModel} item Элемент коллекции.
		 */
		updateControlItem: function(item) {
			var itemId = item.get(this.primaryColumnName);
			var controlsItem = null;
			Terrasoft.each(this.controlsCollection, function(collectionItem) {
				if (collectionItem.id === itemId) {
					controlsItem = collectionItem;
					return false;
				}
			}, this);
			var control = {};
			this.fireEvent("applyControlConfig", control);
			if (controlsItem && control.config) {
				var renderTo = Ext.get(controlsItem.domId);
				var newControl = Ext.create(control.config.className, control.config);
				var viewModel = this.collection.find(itemId);
				if (viewModel) {
					newControl.bind(viewModel);
				}
				controlsItem.control = newControl;
				if (renderTo) {
					newControl.render(renderTo);
				}
			}
		},

		/**
		 * @inheritDoc Terrasoft.Grid#onUpdateItem
		 * @overridden
		 */
		onUpdateItem: function(item) {
			this.callParent(arguments);
			this.updateControlItem(item);
		},

		/**
		 * Метод очистки реестра. Удаляются как DOM элементы так и
		 * данных сохраненные в реестре, но не в коллекции.
		 * @overridden
		 */
		onDestroy: function() {
			this.callParent(arguments);
			Terrasoft.each(this.controlsCollection, function(item) {
				if (item.control) {
					item.control.destroy();
				}
				item.control = null;
			});
		},

		/**
		 * @inheritDoc Terrasoft.Bindable#subscribeForCollectionEvents
		 * @overridden
		 */
		onDeleteItem: function(item) {
			this.callParent(arguments);
			var idDeleting = item.get("Id");
			var controlDeleting = Terrasoft.where(this.controlsCollection, {id: idDeleting});
			if (controlDeleting.length > 0) {
				this.controlsCollection = Terrasoft.without(this.controlsCollection, controlDeleting[0]);
			}
		}
	});
	return Terrasoft.ControlGrid;
});
