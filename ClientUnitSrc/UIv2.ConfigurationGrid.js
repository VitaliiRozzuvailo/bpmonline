define("ConfigurationGrid", ["css!ConfigurationGrid"], function() {

	Ext.define("Terrasoft.controls.ConfigurationGrid", {
		extend: "Terrasoft.Grid",
		alternateClassName: "Terrasoft.ConfigurationGrid",

		/**
		 * @inheritDoc Terrasoft.Grid#activeRowCss
		 * @overridden
		 */
		activeRowCss: "configuration-grid-row-active",

		/**
		 * Элементы управления активной строки.
		 * @private
		 * @type {Array}
		 */
		activeRowControls: [],

		/**
		 * @inheritDoc Terrasoft.Grid#actionsRowTpl
		 * @overridden
		 */
		/*jshint quotmark: false */
		actionsRowTpl: new Ext.Template('<div id="{id}" class="configuration-grid-row-actions"></div>'),
		/*jshint quotmark: true */

		/**
		 * Элемент шаблона DOM-элемента набора элементов редактирования активной строки.
		 * @protected
		 */
		/*jshint quotmark: false */
		controlsRowTpl: new Ext.Template('<div id="{id}" class="grid-row-controls"></div>'),
		/*jshint quotmark: true */

		/**
		 * Префикс идентификатора DOM-элемента набора элементов редактирования активной строки.
		 * @protected
		 */
		controlsRowPrefix: "-controls-item-",

		/**
		 * .
		 * @private
		 */
		columnNameAttribute: "column-name",

		/**
		 * @inheritDoc Terrasoft.Grid#selectedRowCss
		 * @overridden
		 */
		selectedRowCss: "configuration-grid-row-selected",

		/**
		 * Экземпляр класса Ext.KeyMap для обработки нажатия кнопок в активной строке.
		 * @private
		 * @type {Ext.KeyMap}
		 */
		keyMap: null,

		/**
		 * Признак необходимости обработки нажатия кнопок в активной строке.
		 * @private
		 * @type {Boolean}
		 */
		keyMapEnabled: true,

		/**
		 * Признак необходимости очистки информации о ссылках в ячейках.
		 * @type {Boolean}
		 */
		useLinks: false,

		/**
		 * @inheritdoc Terrasoft.Grid#activateRow
		 * @overridden
		 */
		activateRow: function(id) {
			this.callParent(arguments);
			this.addRowControls(id);
		},

		/**
		 * Добавляет элементы редактирования активной строки.
		 * @private
		 * @param {String} id Идентификатор активной строки.
		 */
		addRowControls: function(id) {
			var renderTo = this.createControlsRow(id);
			if (renderTo) {
				this.initKeyMap(renderTo);
				this.renderRowControls(renderTo, id);
			}
		},

		/**
		 * Проверяет значения элементов редактирования активной строки.
		 * @private
		 * @param oldId
		 * @param newId
		 * @return {Object} True, если значения элементов управления корректны.
		 */
		changeRow: function(oldId, newId) {
			var config = {
				success: true,
				oldId: oldId,
				newId: newId
			};
			this.fireEvent("changeRow", config);
			return config.success;
		},

		/**
		 * Создает и возвращет контейнер для отрисовки элементов редактирования активной строки.
		 * @private
		 * @param {String} id Идентификатор записи.
		 * @return {Object} Контейнер для отрисовки элементов редактирования активной строки.
		 */
		createControlsRow: function(id) {
			var item = Ext.get(this.id + this.collectionItemPrefix + id);
			if (!item || !item.dom) {
				return;
			}
			var html = this.controlsRowTpl.apply({
				id: this.id + this.controlsRowPrefix + id
			});
			var renderToNode = Ext.DomHelper.insertHtml("beforeEnd", item.dom, html);
			var controlsRow = Ext.get(renderToNode);
			controlsRow.on("click", this.onControlsContainerClick, this);
			return controlsRow;
		},

		/**
		 * @inheritDoc Terrasoft.Grid#createActionsRow
		 * @overridden
		 */
		createActionsRow: function(id) {
			var item = Ext.get(this.id + this.collectionItemPrefix + id);
			if (!item) {
				return;
			}
			var renderTo;
			var where = "beforeEnd";
			var el = item.dom;
			var html =  this.actionsRowTpl.apply({
				id: this.id + this.actionsRowPrefix + id
			});
			var renderToNode = Ext.DomHelper.insertHtml(where, el, html);
			renderTo = Ext.get(renderToNode);
			return renderTo;
		},

		/**
		 * @inheritDoc Terrasoft.Grid#deactivateRow
		 * @overridden
		 */
		deactivateRow: function(id) {
			this.callParent(arguments);
			this.removeRowControls(id);
		},

		/**
		 *
		 */
		deactivateRows: function() {
			this.setActiveRow(null);
		},

		/**
		 * Уничтожает подписки на события body.
		 * @private
		 */
		destroyActiveRowControls: function() {
			Terrasoft.each(this.activeRowControls, function(activeRowControl) {
				activeRowControl.destroy();
			}, this);
			this.activeRowControls = [];
		},

		/**
		 * Уничтожает подписки на события body.
		 * @private
		 */
		destroyBodyEvents: function() {
			var body = Ext.getBody();
			body.un("click", this.deactivateRows, this);
		},

		/**
		 * Удаляет обработчики нажатия кнопок в активной строке.
		 * @private
		 */
		destroyKeyMap: function() {
			if (this.keyMap) {
				this.keyMap.destroy();
				this.keyMap = null;
			}
		},

		/**
		 * @inheritDoc Terrasoft.Grid#formatCellContent
		 * @overridden
		 */
		formatCellContent: function(htmlConfig, data, column, link) {
			if (this.useLinks === false) {
				link = "";
			}
			htmlConfig[this.columnNameAttribute] = column.name.bindTo;
			return this.callParent(arguments);
		},

		/**
		 * Возвращает название колонки на которой был произведен клик при выборе строки.
		 * @param {Object} target
		 * @return {String} Название колонки на которой был произведен клик при выборе строки.
		 */
		getActiveColumnName: function(target) {
			var targetEl = Ext.get(target);
			var column = targetEl.findParent("[" + this.columnNameAttribute + "]", this.getWrapEl().dom);
			return column ? column.getAttribute(this.columnNameAttribute) : "";
		},

		/**
		 * Возвращает модель представления строки.
		 * @private
		 * @param {String} id Идентификатор записи.
		 * @return {Terrasoft.BaseViewModel} Модель представления строки.
		 */
		getActiveRowViewModel: function(id) {
			if (this.collection) {
				return this.collection.get(id);
			}
		},

		/**
		 * Возвращает конфигурацию привязки к модели. Реализует интерфейс миксина {@link Terrasoft.Bindable}.
		 * @protected
		 */
		getBindConfig: function() {
			var bindConfig = this.callParent(arguments);
			var gridBindConfig = {
				keyMapEnabled: {
					changeMethod: "setKeyMapEnabled"
				}
			};
			Ext.apply(gridBindConfig, bindConfig);
			return gridBindConfig;
		},

		/**
		 * Возвращает конфигурацию элементов редактирования активной строки.
		 * @private
		 * @param {String} id Идентификатор строки.
		 * @return {Array} Конфигурация элементов редактирования.
		 */
		getRowControls: function(id) {
			var rowControls = [];
			this.fireEvent("generateControlsConfig", id, this.columnsConfig, rowControls);
			return rowControls;
		},

		/**
		 * Возвращает элементы колонок.
		 * @private
		 * @param {String} id Идентификатор строки.
		 * @return {Object} Элементы колонок.
		 */
		getDomRowColumns: function(id) {
			var root = this.getWrapEl();
			if (!this.rendered || !id || !root) {
				return null;
			}
			var row = this.getDomRow(id);
			return row.select("[class*=\"grid-cols-\"]");
		},

		/**
		 * @inheritDoc Terrasoft.Grid#init
		 * @overridden
		 */
		init: function() {
			this.callParent(arguments);
			this.addEvents(
				/**
				 * @event
				 * Получение конфигурации элементов редактирования активной строки.
				 */
				"generateControlsConfig",
				/**
				 * @event
				 * Валидация значений элементов редактирования активной строки.
				 */
				"validateRow",
				/**
				 * @event
				 * Событие нажатия кнопки в активной строке.
				 */
				"initActiveRowKeyMap",
				/**
				 * @event
				 *
				 */
				"onGridClick",
				/**
				 * @event
				 *
				 */
				"changeRow"
			);
			this.classes.wrapEl.push("configuration-grid");
			this.initBodyEvents();
		},

		/**
		 * Инициализирует подписку на события body.
		 * @private
		 */
		initBodyEvents: function() {
			var body = Ext.getBody();
			body.on("click", this.deactivateRows, this);
		},

		/**
		 * Инициализирует подписку на события нажатия кнопок в активной строке.
		 * @private
		 */
		initKeyMap: function(target) {
			var keyMap = [];
			this.fireEvent("initActiveRowKeyMap", keyMap);
			if (keyMap.length) {
				this.keyMap = new Ext.util.KeyMap({
					target: target,
					binding: keyMap
				});
			}
		},

		/**
		 * Инициализирует элементы редактирования активной строки.
		 * @private
		 */
		initControlsRow: function() {
			var rows = (this.multiSelect) ? this.selectedRows : ((this.activeRow) ? [this.activeRow] : []);
			rows.forEach(function(id) {
				this.addRowControls(id);
			}, this);
		},

		/**
		 * @inheritdoc Terrasoft.Grid#initColumnBindings
		 * @overridden
		 */
		initColumnBindings: function(columnsConfig) {
			if (this.useLinks) {
				this.callParent(arguments);
				return;
			}
			var bindings = this.columnBindings;
			for (var key in columnsConfig) {
				var configItem = columnsConfig[key];
				if (Ext.isArray(configItem)) {
					this.initColumnBindings(configItem);
				} else {
					for (var propertyName in configItem) {
						if (propertyName === "link") {
							continue;
						}
						var item = configItem[propertyName];
						if (Ext.isArray(item)) {
							this.initColumnBindings(item);
						} else if (Ext.isObject(item) && item.bindTo) {
							var binding = this.initBinding(propertyName, item);
							if (binding) {
								binding.config.isColumnConfig = true;
								var GridKeyType = Terrasoft.GridKeyType;
								if (propertyName.type === GridKeyType.ICON16 ||
										propertyName.type === GridKeyType.ICON22 ||
										propertyName.type === GridKeyType.ICON32 ||
										propertyName.type === GridKeyType.ICON16LISTED ||
										propertyName.type === GridKeyType.ICON22LISTED ||
										propertyName.type === GridKeyType.ICON32LISTED) {
									binding.imageSize = this.getIconSize(propertyName.type);
								}
								bindings[item.bindTo] = binding;
							}
						}
					}
				}
			}
		},

		/**
		 * @inheritdoc Terrasoft.Grid#initActionItems
		 * @overridden
		 */
		initActionItems: function() {
			var activeRow = this.activeRow;
			if (activeRow) {
				this.addRowActions(activeRow);
			}
		},

		/**
		 * @inheritdoc
		 * @overridden
		 */
		selectRow: function (id) {
			// TODO: Убрать после выполнения задачи #CRM-12197
			if (this.rendered) {
				this.setCheckboxChecked(id, true);
			}
			this.fireEvent("selectRow", id);
		},

		/**
		 * @inheritdoc
		 * @overridden
		 */
		unselectRow: function (id) {
			// TODO: Убрать после выполнения задачи #CRM-12197
			if (this.rendered) {
				this.setCheckboxChecked(id, false);
			}
			this.fireEvent("unSelectRow", id);
		},

		/**
		 * @inheritDoc Terrasoft.Grid#onUpdateItem
		 * @overridden
		 */
		onUpdateItem: function(item) {
			if (item.get(this.primaryColumnName) !== this.activeRow) {
				this.callParent(arguments);
			} else {
				var id = item.get(this.primaryColumnName);
				if (!this.rendered || !this.collection.contains(id)) {
					return;
				}
				this.theoreticallyActiveRows = null;
				var row = this.getRow(item);
				var options = {
					rows: [row],
					row: row
				};
				var columns = [];
				this.renderColumns(columns, options);
				var domRowColumns = this.getDomRowColumns(id);
				domRowColumns.each(function(domRowColumn, instance, index) {
					var columnHtml = Ext.DomHelper.createHtml(columns[index]);
					var domRowColumnSibling = domRowColumn.insertSibling(columnHtml, "after");
					domRowColumn.replaceWith(domRowColumnSibling);
				}, this);
			}
		},

		/**
		 * @inheritDoc Terrasoft.Grid#onAfterReRender
		 * @protected
		 */
		onAfterReRender: function() {
			this.callParent(arguments);
			this.initControlsRow();
		},

		/**
		 * @inheritDoc Terrasoft.Grid#onAfterRender
		 * @protected
		 */
		onAfterRender: function() {
			this.callParent(arguments);
			this.initControlsRow();
		},

		/**
		 * @inheritDoc Terrasoft.Grid#onDestroy
		 * @overridden
		 */
		onDestroy: function(clear) {
			var rows = (this.multiSelect) ? this.selectedRows : ((this.activeRow) ? [this.activeRow] : []);
			rows.forEach(function(id) {
				this.removeRowControls(id);
			}, this);
			this.destroyKeyMap();
			if (!clear) {
				this.destroyBodyEvents();
			}
			this.callParent(arguments);
		},

		/**
		 * Обработчик события клика по контейнеру элементов управления активной строки.
		 * @param event {Ext.EventObject}
		 */
		onControlsContainerClick: function(event) {
			event.stopEvent();
		},

		/**
		 * @inheritDoc Terrasoft.Grid#onGridClick
		 * @overridden
		 */
		onGridClick: function(event, target) {
			if (!this.multiSelect) {
				this.callParent(arguments);
				var columnName = this.getActiveColumnName(target);
				this.fireEvent("onGridClick", {columnName: columnName});
			} else {
				var targetEl = Ext.get(target);
				var root = this.getWrapEl().dom;
				/*jshint quotmark: false */
				var row = targetEl.findParent('[class*="' + this.theoreticallyActiveRowCss + '"]', root, true);
				/*jshint quotmark: true */
				var rowId;
				if (row) {
					rowId = row.id.replace(this.id + this.collectionItemPrefix, "");
					event.stopEvent();
					this.setActiveRow(rowId);
				}
			}
		},

		/**
		 * @inheritDoc Terrasoft.Grid#onCheckboxClick
		 * @overridden
		 */
		onCheckboxClick: function(checkbox) {
			if (!this.multiSelect) {
				this.callParent(arguments);
			} else {
				var value = checkbox.value;
				var checked = checkbox.checked;
				this.setRowSelected(value, checked);
				if (checked) {
					this.fireEvent("selectRow", value);
				} else {
					this.fireEvent("unSelectRow", value);
				}
				this.fireEvent("rowsSelectionChanged");
			}
		},

		/**
		 * @inheritDoc Terrasoft.Grid#renderRowActions
		 * @overridden
		 */
		renderRowActions: function(renderTo, id) {
			var rowActions = Ext.clone(this.activeRowActions);
			var self = this;
			function actionHandler() {
				self.onActionItemClick(this.tag, id);
			}
			for (var i = 0, c = rowActions.length; i < c; i += 1) {
				var action = rowActions[i];
				action = Ext.apply({}, action, {
					renderTo: renderTo,
					handler: actionHandler,
					classes: {
						wrapperClass: ["configuration-grid-action-button"]
					}
				});
				var actionItem = Ext.create(action.className, action);
				var selectedViewModel = this.getActiveRowViewModel(id);
				actionItem.bind(selectedViewModel);
				actionItem.setEnabled(this.enabled);
				this.actionItems.push(actionItem);
			}
		},

		/**
		 * Уничтожает контейнер с элементами редактирования активной строки.
		 * @private
		 * @param {String} id Идентификатор записи.
		 */
		removeRowControls: function(id) {
			var controlsRow = Ext.get(this.id + this.controlsRowPrefix + id);
			if (controlsRow) {
				this.destroyKeyMap();
				this.destroyActiveRowControls();
				controlsRow.un("click", this.onControlsContainerClick, this);
				controlsRow.destroy();
			}
		},

		/**
		 * Выполняет отрисовку элементов редактирования активной строки.
		 * @private
		 * @param renderTo
		 * @param {String} id Идентификатор строки.
		 */
		renderRowControls: function(renderTo, id) {
			var rowControls = this.getRowControls(id);
			Terrasoft.each(rowControls, function(controlConfig) {
				var control = Ext.create(controlConfig.className, Ext.apply({}, controlConfig, {
					renderTo: renderTo
				}));
				var viewModel = this.getActiveRowViewModel(id);
				control.bind(viewModel);
				this.activeRowControls.push(control);
			}, this);
		},

		/**
		 * @inheritdoc Terrasoft.Grid#setActiveRow
		 * @overridden
		 */
		setActiveRow: function(newId) {
			var oldId = this.activeRow;
			if (!oldId && !newId) {
				return;
			}
			if (oldId && !this.collection.contains(oldId)) {
				oldId = this.activeRow = null;
			}
			if (newId !== oldId) {
				var changeRow = this.changeRow(oldId, newId);
				if (changeRow) {
					this.deactivateRow(oldId);
					this.fireEvent("unSelectRow", oldId);
					this.activateRow(newId);
					this.activeRow = newId;
					this.fireEvent("selectRow", newId);
				}
			}
		},

		/**
		 * Метод указания необходимости обработки нажатия кнопок в активной строке.
		 * @param value {Boolean}
		 */
		setKeyMapEnabled: function(value) {
			var keyMapEnabled = this.keyMapEnabled;
			if (keyMapEnabled === value || !Ext.isBoolean(value)) {
				return;
			}
			var keyMap = this.keyMap;
			if (keyMap) {
				keyMap.setDisabled(!value);
			}
			this.keyMapEnabled = value;
		},

		/**
		 * Проверяет значения элементов редактирования активной строки.
		 * @private
		 * @param {String} id Идентификатор записи.
		 * @return {Object} True, если значения элементов управления корректны.
		 */
		validateRow: function(id) {
			var result = {success: true};
			this.fireEvent("validateRow", id, result);
			return result.success;
		}
	});

	return Terrasoft.ConfigurationGrid;
});
