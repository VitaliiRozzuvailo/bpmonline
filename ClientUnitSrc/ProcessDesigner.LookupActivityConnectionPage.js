define("LookupActivityConnectionPage", ["LookupActivityConnectionPageResources", "ModalBox", "GridUtilitiesV2"],
		function(resources, ModalBox) {
			/**
			 * Конфигурация схемы сущности модуля.
			 */
			var entitySchemaColumnsConfig = {
				Id: {
					columnPath: "Id",
					dataValueType: Terrasoft.DataValueType.GUID,
					type: Terrasoft.ViewModelColumnType.ENTITY_COLUMN
				},
				Caption: {
					columnPath: "Caption",
					dataValueType: Terrasoft.DataValueType.TEXT,
					type: Terrasoft.ViewModelColumnType.ENTITY_COLUMN,
					caption: "Caption"
				}
			};
			return {
				mixins: {
					GridUtilities: "Terrasoft.GridUtilities"
				},
				attributes: {
					/**
					 * Колонки для коллекции таблицы
					 */
					"Id": entitySchemaColumnsConfig.Id,
					"Caption": entitySchemaColumnsConfig.Caption,
					/**
					 * Коллекция данных для представления таблицы
					 */
					GridData: {
						dataValueType: this.Terrasoft.DataValueType.COLLECTION
					},
					/**
					 * Коллекция выбранных записей в реестре
					 */
					SelectedRows: {dataValueType: Terrasoft.DataValueType.COLLECTION}
				},
				/**
				 * Название entity схемы.
				 * @private
				 * @type {String}
				 */
				entitySchemaName: null,
				messages: {
					/**
					 * @message SetParametersInfo
					 * Указывает значения параметров
					 */
					"SetParametersInfo": {
						mode: Terrasoft.MessageMode.PTP,
						direction: Terrasoft.MessageDirectionType.PUBLISH
					}
				},
				details: /**SCHEMA_DETAILS*/{
				}/**SCHEMA_DETAILS*/,
				methods: {
					/**
					 * Инициализирует объекты на странице.
					 * @protected
					 * @overridden
					 */
					init: function(callback) {
						this.callParent([function() {
							this.initEntitySchema();
							this.initGridData();
							this.initGridRowViewModel(function() {
								this.getGridCollection(function(collection) {
									this.loadGridCollection(collection);
									callback.call(this);
								});
							}, this);
						}, this]);
					},
					/**
					 * Инициализирует схему сущности модуля.
					 * @protected
					 * @virtual
					 */
					initEntitySchema: function() {
						this.entitySchema = this.Ext.create("Terrasoft.BaseEntitySchema", {
							columns: entitySchemaColumnsConfig,
							primaryDisplayColumnName: "Caption"
						});
					},
					/**
					 * Закрывает модальное окно.
					 * @private
					 */
					close: function() {
						ModalBox.close();
					},
					/**
					 * Инициализирует коллекцию строк реестра.
					 * @protected
					 * @virtual
					 */
					initGridData: function() {
						this.set("GridData", this.Ext.create("Terrasoft.BaseViewModelCollection"));
					},
					/**
					 * Получает коллекцию строк реестра.
					 * @protected
					 * @virtual
					 * @return {Terrasoft.BaseViewModelCollection} Возвращает коллекцию моделей представления.
					 */
					getGridData: function() {
						return this.get("GridData");
					},
					/**
					 * Получает коллекцию реестра.
					 * @protected
					 * @virtual
					 * @param {Function} callback Функция обратного вызова
					 */
					getGridCollection: function(callback) {
						var collection = this.get("EntityConnectionList");
						var selectedRows = [];
						collection.each(function(entityConnection) {
							if (entityConnection.selected) {
								selectedRows.push(entityConnection.id);
							}
						}, this);
						this.set("SelectedRows", selectedRows);
						callback.call(this, collection);
					},
					/**
					 * Загружает коллекцию данных в реестр.
					 * @protected
					 * @param {Object} dataCollection Коллекция данных реестра.
					 */
					loadGridCollection: function(dataCollection) {
						var collection = this.getGridData();
						collection.clear();
						var gridRowCollection = this.getGridRowCollection(dataCollection);
						collection.loadAll(gridRowCollection);
					},
					/**
					 * Получает коллекцию моделей представления строк реестра.
					 * @protected
					 * @param {Object} dataCollection Коллекция данных реестра.
					 * @return {Object} Коллекция моделей представления строк реестра.
					 */
					getGridRowCollection: function(dataCollection) {
						var collection = {};
						var gridRowViewModelName = this.getGridRowViewModelClassName();
						dataCollection.each(function(dataItem) {
							var viewModel = this.Ext.create(gridRowViewModelName, {
								rowConfig: entitySchemaColumnsConfig,
								values: {
									Id: dataItem.id,
									Caption: dataItem.caption
								}
							});
							collection[dataItem.id] = viewModel;
						}, this);
						return collection;
					},
					/**
					 * Обработчик события нажатия на кнопку "Сохранить"
					 */
					onSaveClick: function() {
						var selectedRows = this.get("SelectedRows");
						var parameters = {
							"selectedRows": selectedRows
						};
						this.sandbox.publish("SetParametersInfo", parameters, [this.sandbox.id]);
					}
				},
				diff: /**SCHEMA_DIFF*/[
					{
						"operation": "insert",
						"name": "fixed-area-container",
						"values": {
							"itemType": Terrasoft.ViewItemType.CONTAINER,
							"wrapClass": ["modal-page-container", "modal-page-fixed-container"],
							"items": []
						}
					},
					{
						"operation": "insert",
						"parentName": "fixed-area-container",
						"propertyName": "items",
						"name": "headContainer",
						"values": {
							"itemType": Terrasoft.ViewItemType.CONTAINER,
							"wrapClass": ["header"],
							"items": []
						}
					},
					{
						"operation": "insert",
						"parentName": "headContainer",
						"propertyName": "items",
						"name": "header-name-container",
						"values": {
							"itemType": Terrasoft.ViewItemType.CONTAINER,
							"wrapClass": ["header-name-container", "header-name-container-full"],
							"items": []
						}
					},
					{
						"operation": "insert",
						"parentName": "header-name-container",
						"propertyName": "items",
						"name": "ModalBoxCaption",
						"values": {
							"itemType": Terrasoft.ViewItemType.LABEL,
							"caption": {"bindTo": "modalBoxCaption"}
						}
					},
					{
						"operation": "insert",
						"parentName": "headContainer",
						"propertyName": "items",
						"name": "close-icon-container",
						"values": {
							"itemType": Terrasoft.ViewItemType.CONTAINER,
							"wrapClass": ["header-name-container", "header-name-container-full"],
							"items": []
						}
					},
					{
						"operation": "insert",
						"parentName": "close-icon-container",
						"propertyName": "items",
						"name": "close-icon",
						"values": {
							"itemType": Terrasoft.ViewItemType.BUTTON,
							"style": Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
							"imageConfig": {"bindTo": "Resources.Images.CloseIcon"},
							"classes": {"wrapperClass": ["close-btn-user-class"]},
							"click": {"bindTo": "close"}
						}
					},
					{
						"operation": "insert",
						"parentName": "fixed-area-container",
						"propertyName": "items",
						"name": "utils-area-editPage",
						"values": {
							"itemType": Terrasoft.ViewItemType.CONTAINER,
							"wrapClass": ["controls-container-modal-page"],
							"items": []
						}
					},
					{
						"operation": "insert",
						"parentName": "utils-area-editPage",
						"propertyName": "items",
						"name": "SaveButton",
						"values": {
							"itemType": Terrasoft.ViewItemType.BUTTON,
							"style": Terrasoft.controls.ButtonEnums.style.GREEN,
							"caption": {"bindTo": "Resources.Strings.SaveButtonCaption"},
							"click": {"bindTo": "onSaveClick"},
							"classes": {"textClass": ["utils-buttons"]}
						}
					},
					{
						"operation": "insert",
						"parentName": "utils-area-editPage",
						"propertyName": "items",
						"name": "CancelButton",
						"values": {
							"itemType": Terrasoft.ViewItemType.BUTTON,
							"caption": {"bindTo": "Resources.Strings.CancelButtonCaption"},
							"click": {"bindTo": "close"},
							"classes": {"textClass": ["utils-buttons"]}
						}
					},
					{
						"operation": "insert",
						"parentName": "fixed-area-container",
						"propertyName": "items",
						"name": "center-area-editPage",
						"values": {
							"itemType": Terrasoft.ViewItemType.CONTAINER,
							"wrapClass": ["controls-container-modal-page"],
							"items": []
						}
					},
					{
						"operation": "insert",
						"name": "center-area-grid-container",
						"parentName": "center-area-editPage",
						"propertyName": "items",
						"values": {
							"itemType": Terrasoft.ViewItemType.CONTAINER,
							"wrapClass": ["center-area-grid-container"],
							"items": []
						}
					},
					{
						"operation": "insert",
						"name": "DataGrid",
						"parentName": "center-area-grid-container",
						"propertyName": "items",
						"values": {
							"primaryDisplayColumnName": "Caption",
							"primaryColumnName": "Id",
							"itemType": Terrasoft.ViewItemType.GRID,
							"listedZebra": true,
							"collection": {"bindTo": "GridData"},
							"type": "listed",
							"multiSelect": true,
							"selectedRows": {"bindTo": "SelectedRows"},
							"columnsConfig": [
								{
									cols: 24,
									key: [{
										name: {
											bindTo: "Caption"
										}
									}]
								}
							],
							"captionsConfig": [
								{
									"visible": false
								}
							]
						}
					}
				]/**SCHEMA_DIFF*/
			};
		});
