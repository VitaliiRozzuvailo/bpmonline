define("AccountOrganizationChartDetailV2", ["terrasoft"],
	function(Terrasoft) {
		return {
			entitySchemaName: "AccountOrganizationChart",
			methods: {

				/**
				 * Открывает страницу добавления детали
				 * @protected
				 * @overridden
				 * @param {String} editPageUId Значение колонки типа
				 * @param {Boolean} keepParentId (optional) Не удалять из DefaultValues элемент с ключем Parent
				 */
				addRecord: function(editPageUId, keepParentId) {
					if (!keepParentId) {
						var defaultValues = this.get("DefaultValues");
						var result = this.Ext.Array.filter(defaultValues, function(item) {
							return (item.name !== "Parent");
						}, this);
						this.set("DefaultValues", result);
					}
					this.callParent(editPageUId);
				},

				/**
				 *Получает колонки, которые всегда выбираются запросом
				 *@protected
				 *@overridden
				 *@return {Object} Возвращает колонки, которые всегда выбираются запросом
				 */
				getGridDataColumns: function() {
					var gridDataColumns = this.callParent(arguments);
					if (!gridDataColumns.Parent) {
						gridDataColumns.Parent = {
							path: "Parent"
						};
					}
					return gridDataColumns;
				},

				/**
				 * Модификация коллекции данных перед загрузкой в реестр
				 * @protected
				 * @overridden
				 * @param {Terrasoft.collection} collection Коллекция элементов реестра
				 */
				prepareResponseCollection: function(collection) {
					collection.each(function(item) {
						var parent = item.get("Parent");
						var parentId = parent && parent.value;
						if (parentId) {
							item.set("ParentId", parentId);
						}
						Terrasoft.each(item.columns, function(column) {
							this.addColumnLink(item, column);
							this.applyColumnDefaults(column);
						}, this);
					}, this);
				},

				/**
				 * @inheritDoc Terrasoft.BaseGridDetail#hideQuickFilterButton
				 * @overridden
				 */
				getHideQuickFilterButton: function() {
					return false;
				},

				/**
				 * @inheritDoc Terrasoft.BaseGridDetail#getQuickFilterButton
				 * @overridden
				 */
				getShowQuickFilterButton: function() {
					return false;
				},

				/**
				 * Обновляет деталь согласно переданным параметрам
				 * @protected
				 * @overridden
				 * @param {Object} config конфигурация обновления детали
				 */
				updateDetail: function(config) {
					config.reloadAll = true;
					this.callParent([config]);

				},

				/**
				 * Проверка доступности кнопки "Добавить подчиненный элемент"
				 * @protected
				 * @returns {Boolean} Возвращает true, если выделен элемент структуры организации
				 */
				getAddChildElementButtonEnabled: function() {
					return !this.Ext.isEmpty(this.getSelectedItems());
				},

				/**
				 * Добавляет в коллекцию DefaultValues элемент Parent и вызывает функцию addRecord
				 * @protected
				 */
				addChildElementRecord: function() {
					var selectedItems = this.getSelectedItems();
					if (this.Ext.isEmpty(selectedItems)) {
						return;
					}
					var parentId = selectedItems[0];
					var defaultValues = this.get("DefaultValues");
					var result = this.Ext.Array.filter(defaultValues, function(item) {
						return (item.name !== "Parent");
					}, this);
					result.push({
							name: "Parent",
							value: parentId
						});
					this.set("DefaultValues", result);
					this.addRecord(null, true);
				},

				/**
				 * Очистка выделения
				 * @protected
				 */
				clearSelection: function() {
					this.set("activeRow", null);
					this.set("selectedRows", null);
				},

				/**
				 * Обработчик события подтверждения удаления. Удаляет вложенные элементы оргструктуры
				 * @protected
				 * @overridden
				 */
				onDeleteAccept: function() {
					var selectedRows = this.getSelectedItems();
					var batch = this.Ext.create("Terrasoft.BatchQuery");
					Terrasoft.each(selectedRows, function(recordId) {
						this.deleteItem(recordId, batch, this);
					}, this);
					if (batch.queries.length > 0) {
						batch.execute(this.onDeleted, this);
					}
				},

				/**
				 * Обработчик выполнения пакетного запроса на удаление
				 * @protected
				 * @param {Object} response (optional) - ответ с сервера
				 */
				onDeleted: function(response) {
					if (response && response.success) {
						this.clearSelection();
					} else {
						this.showConfirmationDialog(
							this.get("Resources.Strings.OnDeleteError"));
					}
				},

				/**
				 * Добавляет в пакетный запрос, запрос на удаление конкретного элемента
				 * @protected
				 * @param {Guid} recordId - идентификатор записи
				 * @param {Terrasoft.BatchQuery} batch - Пакетный запрос, который модифицируется
				 * @param {Object} scope Контекст функции, в котором она будет вызвана
				 */
				deleteItem: function(recordId, batch, scope) {
					var grid = scope.getGridData();
					var toDelete = new Terrasoft.Collection();
					grid.each(function(item) {
						var parent = item.get("Parent");
						if (parent && parent.value === recordId) {
							toDelete.add(item);
						}
					}, grid);

					Terrasoft.each(toDelete.getItems(), function(item) {
						this.deleteItem(item.get("Id"), batch, this);
					}, scope);
					if (grid.find(recordId)) {
						var selfDelete = grid.get(recordId);
						grid.remove(selfDelete);
						var query = this.Ext.create("Terrasoft.DeleteQuery", {
							rootSchema: scope.entitySchema
						});
						var filter = Terrasoft.createColumnFilterWithParameter(
							Terrasoft.ComparisonType.EQUAL, "Id", recordId);
						query.filters.addItem(filter);
						batch.add(query);
					}
				}
			},
			diff: /**SCHEMA_DIFF*/[
				{
					"operation": "merge",
					"name": "DataGrid",
					"values": {
						"type": "listed",
						"listedConfig": {
							"name": "DataGridListedConfig",
							"items": [
								{
									"name": "CustomDepartmentNameListedGridColumn",
									"bindTo": "CustomDepartmentName",
									"position": {
										"column": 0,
										"colSpan": 24
									},
									"type": Terrasoft.GridCellType.TITLE
								}
							]
						},
						"tiledConfig": {
							"name": "DataGridTiledConfig",
							"grid": {
								"columns": 24,
								"rows": 3
							},
							"items": [
								{
									"name": "CustomDepartmentNameTiledGridColumn",
									"bindTo": "CustomDepartmentName",
									"position": {
										"row": 0,
										"column": 0,
										"colSpan": 24
									},
									"type": Terrasoft.GridCellType.TITLE
								},
								{
									"name": "DepartmentTiledGridColumn",
									"bindTo": "Department",
									"position": {
										"row": 1,
										"column": 0,
										"colSpan": 12
									}
								},
								{
									"name": "ManagerTiledGridColumn",
									"bindTo": "Manager",
									"position": {
										"row": 1,
										"column": 12,
										"colSpan": 12
									}
								}
							]
						},
						"hierarchical": true,
						"hierarchicalColumnName": "ParentId"
					}
				},
				{
					"operation": "merge",
					"name": "AddRecordButton",
					"values": {
						visible: false
					}
				},
				{
					"operation": "insert",
					"name": "AddRecord",
					"parentName": "Detail",
					"propertyName": "tools",
					"index": 1,
					"values": {
						itemType: Terrasoft.ViewItemType.BUTTON,
						menu: [],
						"caption": {"bindTo": "Resources.Strings.AddRecordButtonCaption"},
						"visible": {"bindTo": "getToolsVisible"}
					}
				},
				{
					"operation": "insert",
					"name": "AddParentRecordButton",
					"parentName": "AddRecord",
					"propertyName": "menu",
					"values": {
						"caption": {"bindTo": "Resources.Strings.AddRootElementButtonCaption"},
						"click": {"bindTo": "addRecord"}
					}
				},
				{
					"operation": "insert",
					"name": "AddChildElementButton",
					"parentName": "AddRecord",
					"propertyName": "menu",
					"values": {
						"caption": {"bindTo": "Resources.Strings.AddChildElementButtonCaption"},
						"click": {"bindTo": "addChildElementRecord"},
						"enabled": {"bindTo": "getAddChildElementButtonEnabled"}
					}
				},
				{
					"operation": "remove",
					"name": "FiltersContainer"
				}
			]/**SCHEMA_DIFF*/
		};
	}
);
