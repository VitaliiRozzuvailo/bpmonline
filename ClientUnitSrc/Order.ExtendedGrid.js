define("ExtendedGrid", ["css!ExtendedGrid"], function() {
	Ext.define("Terrasoft.controls.ExtendedGrid", {

		extend: "Terrasoft.Grid",

		alternateClassName: "Terrasoft.ExtendedGrid",

		/**
		 * Параметр хранящий в себе класс ViewGenerator
		 * @type{Object}
		 */
		viewGenerator: null,

		/**
		 * Параметр хранящий в себе класс ViewModel генератора
		 * @type{Object}
		 */
		viewModelClass: null,

		/**
		 * Css класс использующийся для скрытия редактируемой записи реестра
		 * @protected
		 */
		activeRowRemoveCss: "active-row-removed",

		/**
		 * @inheritDoc Terrasoft.Grid#init
		 * @overridden
		 */
		init: function() {
			this.callParent(arguments);
			this.addEvents(
				/**
				 * @event
				 * Какое-либо "событие действия" с активной записью реестра перед изменением
				 */
				"beforeChangedRow"
			);
		},

		/**
		 * Возвращает config активной записи в реестре
		 * @protected
		 * @param id идентификатор записи данных
		 * @return {object}
		 */
		getActiveRowViewConfig: function(id) {
			var col = 0;
			var gridLayoutItems = [];
			var columnsConfig = this.columnsConfig;
			var collection = this.collection;
			var viewModel = collection.get(id);
			Terrasoft.each(columnsConfig, function(item) {
				var colSpan = item.cols;
				var columnName = item.key[0].name.bindTo;
				var column = viewModel.columns[columnName];
				this.viewGenerator.viewModelClass = this.viewModelClass;
				var controlConfig = {
					bindTo: columnName,
					name: columnName,
					enabled: true,
					dataValueType: column.dataValueType
				};
				var control = this.viewGenerator.generateEditControl(controlConfig);
				gridLayoutItems.push({
					row: 0,
					column: col,
					colSpan: colSpan,
					item: control
				});
				col += colSpan;
			}, this);
			return {
				className: "Terrasoft.GridLayout",
				items: gridLayoutItems
			};
		},

		/**
		 * Метод указания активной записи реестра
		 * @protected
		 * @param newId идентификатор записи данных
		 */
		setActiveRow: function(newId) {
			var oldId = this.activeRow;
			if (!oldId && !newId) {
				return;
			}
			if (newId !== oldId) {
				if (oldId) {
					var item = this.collection.get(oldId);
					if (item) {
						this.onUpdateItem(item, true);
					}
				}
				this.fireEvent("beforeChangedRow", oldId);
				this.deactivateRow(oldId);
				this.activateRow(newId);
				this.activeRow = newId;
				this.fireEvent("selectRow", this.activeRow);
			}
		},

		/**
		 * Метод создает редактируемую строку с действиями
		 * @protected
		 * @param id идентификатор записи данных
		 */
		createActionsRow: function(id) {
			var renderTo = this.callParent(arguments);
			var viewConfig = this.getActiveRowViewConfig(id);
			var view = Ext.create("Terrasoft.GridLayout", viewConfig);
			var collection = this.collection;
			var viewModel = collection.get(id);
			view.bind(viewModel);
			view.render(renderTo);
			this.renderRowActions(renderTo, id);
		},

		/**
		 * По необходимости добавляет или отображает рядок с "действиями" для активной редактируемой записи реестра
		 * @protected
		 * @param id идентификатор записи данных
		 */
		addRowActions: function(id) {
			var actionsRow = Ext.get(this.id + this.actionsRowPrefix + id);
			if (!actionsRow) {
				var renderTo = this.createActionsRow(id);
				if (renderTo) {
					this.renderRowActions(renderTo, id);
				}
			} else {
				actionsRow.removeCls(this.hiddenCss);
			}
		},

		/**
		 * @protected
		 * @param id идентификатор записи данных
		 */
		activateRow: function(id) {
			if (!this.rendered || !id) {
				return;
			}
			var row = this.getDomRow(id);
			row.addCls(this.activeRowCss);
			row.addCls(this.activeRowRemoveCss);
			this.addRowActions(id);
		},

		/**
		 * @protected
		 * @param id идентификатор записи данных
		 */
		deactivateRow: function(id) {
			if (!this.rendered || !id) {
				return;
			}
			var row = this.getDomRow(id);
			row.removeCls(this.activeRowCss);
			row.removeCls(this.activeRowRemoveCss);
			this.removeRowActions(id);
		},

		/**
		 * Метод очистки реестра. Удаляются как DOM элементы так и данных сохраненные в реестре, но не в коллекции.
		 * @overridden
		 */
		clear: function() {
			this.callParent(arguments);
			this.activeRow = null;
		},

		/**
		 * Обработчик события обновления записи
		 * @overridden
		 * @param item Terrasoft.BaseViewModel
		 */
		onUpdateItem: function(item, callParent) {
			if (callParent === true) {
				this.callParent(arguments);
			}
		}
	});
	return Terrasoft.ExtendedGrid;
});
