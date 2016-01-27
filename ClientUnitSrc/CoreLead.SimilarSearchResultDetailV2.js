define("SimilarSearchResultDetailV2", ["SimilarSearchResultDetailV2Resources", "ConfigurationEnums", "LookupUtilities",
	"ConfigurationConstants", "GridUtilitiesV2"],
		function() {
			return {
				attributes: {
					"IsDetailEnabled": {
						dataValueType: Terrasoft.DataValueType.BOOLEAN,
						value: true
					},
					"IsSearchButtonEnabled": {
						dataValueType: Terrasoft.DataValueType.BOOLEAN,
						value: true
					},
					"QuantityFoundLabel": {
						dataValueType: Terrasoft.DataValueType.TEXT,
						value: "0"
					}
				},
				messages: {
					/**
					 * @message DetailActiveRowChanged
					 * Нотифицирует об изменении активной записи на детали
					 * @param {Object} Конфигурация открываемой карточки
					 */
					"DetailActiveRowChanged": {
						mode: Terrasoft.MessageMode.PTP,
						direction: Terrasoft.MessageDirectionType.PUBLISH
					},
					/**
					 * @message SetGridEnabled
					 * Нотифицирует о необходимости изменения свойства enabled детали
					 * @param {Object} Объект с свойством value
					 */
					"SetAccountsSearchResultDetailEnabled": {
						mode: Terrasoft.MessageMode.PTP,
						direction: Terrasoft.MessageDirectionType.SUBSCRIBE
					},
					/**
					 * @message SetGridEnabled
					 * Нотифицирует о необходимости изменения свойства enabled кнопки поиска
					 * @param {Object} Объект с свойством value
					 */
					"SetSearchButtonEnabled": {
						mode: Terrasoft.MessageMode.PTP,
						direction: Terrasoft.MessageDirectionType.SUBSCRIBE
					}
				},
				methods: {
					/**
					 * Инициализирует деталь
					 * @protected
					 * @overridden
					 */
					initDetailOptions: function() {
						this.callParent();
						this.set("IsDetailCollapsed", false);
					},

					/**
					 * @inheritDoc Terrasoft.BaseGridDetailV2#getFilters
					 * @overriden
					 */
					getFilters: function() {
						return this.get("Filter");
					},

					/**
					 * Обработчик изменения выбранной записи в реестре
					 * @protected
					 * @param {String} rowId Идентификатор выбранной записи
					 */
					onActiveRowChanged: function(rowId) {
						if (!this.get("IsSearchButtonEnabled")) {
							return;
						}
						if (rowId === this.get("activeRow")) {
							return;
						}
						if (!rowId) {
							rowId = this.get("activeRow");
						}
						if (!rowId) {
							return;
						}
						var gridData = this.getGridData();
						var config = {
							activeRow: gridData.get(rowId),
							entitySchemaName: this.entitySchemaName
						};
						this.sandbox.publish("DetailActiveRowChanged", config, [this.sandbox.id]);
					},

					/**
					 * @inheritDoc Terrasoft.BasePageV2#subscribeSandboxEvents
					 * @overriden
					 */
					subscribeSandboxEvents: function() {
						this.callParent(arguments);
						this.sandbox.subscribe("SetAccountsSearchResultDetailEnabled", function(config) {
							if (this.get("IsDetailEnabled") === config.value) {
								return;
							}
							this.set("IsDetailEnabled", config.value);
						}, this, [this.sandbox.id]);
						this.sandbox.subscribe("SetSearchButtonEnabled", function(config) {
							if (this.get("IsSearchButtonEnabled") === config.value) {
								return;
							}
							this.set("IsSearchButtonEnabled", config.value);
						}, this, [this.sandbox.id]);
						this.searchButtonClick();
					},

					/**
					 * Выполняет загрузку представления списка
					 * @protected
					 * @virtual
					 */
					loadGridData: function() {
						var filters = this.getFilters();
						if (!Ext.isEmpty(filters) && !filters.isEmpty()) {
							this.callParent(arguments);
							this.setQuantityFound();
						} else {
							this.set("QuantityFoundLabel", 0);
							var gridData = this.getGridData();
							gridData.clear();
							var emptyCollection = Ext.create("Terrasoft.Collection");
							this.initIsGridEmpty(emptyCollection);
						}
					},

					/**
					 * Обработчик конопи поиска
					 */
					searchButtonClick: function() {
						var config = {reloadAll: true};
						this.updateDetail(config);
					},

					/**
					 * Устанавливает количество найденных записей.
					 */
					setQuantityFound: function() {
						var filters = this.getFilters();
						if (filters.isEmpty()) {
							this.set("QuantityFoundLabel", 0);
							return;
						}
						var esq = Ext.create("Terrasoft.EntitySchemaQuery", {
							rootSchemaName: this.entitySchemaName
						});
						esq.addAggregationSchemaColumn("Id", this.Terrasoft.AggregationType.COUNT, "Count");
						esq.filters.addItem(filters);
						esq.getEntityCollection(function(response) {
							if (response && response.success) {
								var collection = response.collection;
								if (collection && collection.getCount() > 0) {
									var count = collection.getByIndex(0).get("Count");
									this.set("QuantityFoundLabel", count);
								}
							}
						}, this);
					}
				},
				diff: [
					{
						"operation": "merge",
						"name": "Detail",
						"values": {
							"classes": {
								wrapClass: ["search-deatail"]
							}
						}
					},
					{
						"operation": "insert",
						"name": "SearchContainer",
						"parentName": "Detail",
						"propertyName": "tools",
						"values": {
							"itemType": Terrasoft.ViewItemType.CONTAINER,
							"items": [],
							"classes": {
								wrapClassName: ["search-container"]
							}
						},
						"index": 0
					},
					{
						"operation": "insert",
						"name": "SearchButton",
						"parentName": "SearchContainer",
						"propertyName": "items",
						"values": {
							"itemType": Terrasoft.ViewItemType.BUTTON,
							"caption": {"bindTo": "Resources.Strings.SearchButtonCaption"},
							"style": Terrasoft.controls.ButtonEnums.style.BLUE,
							"click": {"bindTo": "searchButtonClick"},
							"enabled": {"bindTo": "IsSearchButtonEnabled"},
							"classes": {
								"textClass": ["actions-button-margin-right"]
							}
						},
						"index": 0
					},
					{
						"operation": "insert",
						"name": "FoundLabel",
						"parentName": "SearchContainer",
						"propertyName": "items",
						"values": {
							"itemType": Terrasoft.ViewItemType.LABEL,
							"classes": {
								"labelClass": ["ts-label-found"]
							},
							"caption": {"bindTo": "Resources.Strings.FoundLabelCaption"}
						},
						"index": 1
					},
					{
						"operation": "insert",
						"name": "CountLabel",
						"parentName": "SearchContainer",
						"propertyName": "items",
						"values": {
							"itemType": Terrasoft.ViewItemType.LABEL,
							"classes": {
								"labelClass": ["ts-label-green ts-label-bold ts-label-found"]
							},
							"caption": {"bindTo": "QuantityFoundLabel"}
						},
						"index": 2
					},
					{
						"operation": "merge",
						"name": "DataGrid",
						"values": {
							"selectRow": {"bindTo": "onActiveRowChanged"},
							"enabled": {"bindTo": "IsDetailEnabled"}
						}
					},
					{
						"operation": "merge",
						"name": "loadMore",
						"values": {
							"enabled": {"bindTo": "IsDetailEnabled"}
						}
					},
					{
						"operation": "merge",
						"name": "AddRecordButton",
						"values": {
							"visible": false
						}
					},
					{
						"operation": "merge",
						"name": "ToolsButton",
						"values": {
							"visible": false
						}
					},
					{
						"operation": "merge",
						"name": "ViewButton",
						"values": {
							"enabled": {"bindTo": "IsDetailEnabled"},
							"classes": {
								"wrapperClass": ["search-tools-container"]
							}
						}
					}
				]
			};
		}
);
