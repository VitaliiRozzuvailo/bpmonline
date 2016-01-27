/**
 * Parent: BaseProcessSchemaElementPropertiesPage
 */

define("BaseUserTaskPropertiesPage", ["terrasoft", "Activity", "BaseUserTaskPropertiesPageResources", "ModalBox",
	"ConfigurationItemGenerator"],
	function(Terrasoft, Activity, resources, ModalBox, ConfigurationItemGenerator) {

		Ext.define("Terrasoft.configuration.ParameterViewModel", {
			alternateClassName: "Terrasoft.ParameterViewModel",
			extend: "Terrasoft.BaseModel",

			parentModule: null
		});

		return {
			messages: {
				/**
				 * @message GetParametersInfo
				 * Передаёт значения параметров
				 */
				"GetParametersInfo": {
					mode: Terrasoft.MessageMode.PTP,
					direction: Terrasoft.MessageDirectionType.SUBSCRIBE
				},
				/**
				 * @message SetParametersInfo
				 * Указывает значения параметров
				 */
				"SetParametersInfo": {
					mode: Terrasoft.MessageMode.PTP,
					direction: Terrasoft.MessageDirectionType.SUBSCRIBE
				}
			},
			mixins: {},
			attributes: {
				"Recommendation": {
					dataValueType: this.Terrasoft.DataValueType.TEXT,
					type: this.Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN
				},
				"ActivityCategory": {
					dataValueType: this.Terrasoft.DataValueType.TEXT,
					type: this.Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					referenceSchemaName: "ActivityCategory"
				},
				"Owner": {
					dataValueType: this.Terrasoft.DataValueType.TEXT,
					type: this.Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					referenceSchemaName: "Contact"
				},
				"Duration": {
					dataValueType: this.Terrasoft.DataValueType.INTEGER,
					type: this.Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN
				},
				"DurationPeriod": {
					dataValueType: this.Terrasoft.DataValueType.INTEGER,
					type: this.Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN
				},
				"StartIn": {
					dataValueType: this.Terrasoft.DataValueType.INTEGER,
					type: this.Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN
				},
				"StartInPeriod": {
					dataValueType: this.Terrasoft.DataValueType.INTEGER,
					type: this.Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN
				},
				"RemindBefore": {
					dataValueType: this.Terrasoft.DataValueType.INTEGER,
					type: this.Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN
				},
				"RemindBeforePeriod": {
					dataValueType: this.Terrasoft.DataValueType.INTEGER,
					type: this.Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN
				},
				"ShowInScheduler": {
					dataValueType: this.Terrasoft.DataValueType.BOOLEAN,
					type: this.Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					caption: resources.localizableStrings.ShowInSchedulerCaption
				},
				"ShowExecutionPage": {
					dataValueType: this.Terrasoft.DataValueType.BOOLEAN,
					type: this.Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					caption: resources.localizableStrings.ShowExecutionPageCaption
				},
				"ActivityResult": {
					dataValueType: this.Terrasoft.DataValueType.GUID,
					type: this.Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN
				},
				"CurrentActivityId": {
					dataValueType: this.Terrasoft.DataValueType.GUID,
					type: this.Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN
				},
				"IsActivityCompleted": {
					dataValueType: this.Terrasoft.DataValueType.BOOLEAN,
					type: this.Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN
				},
				"ExecutionContext": {
					dataValueType: this.Terrasoft.DataValueType.TEXT,
					type: this.Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN
				},
				"InformationOnStep": {
					dataValueType: this.Terrasoft.DataValueType.TEXT,
					type: this.Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN
				},
				/**
				 * Коллекция возможных связей сущности.
				 * @Type {Terrasoft.Collection}
				 */
				"EntityConnectionColumnList": {
					dataValueType: this.Terrasoft.DataValueType.COLLECTION
				},
				/**
				 * Коллекция viewModel's контролов для редактирования связей сущности.
				 */
				"ActivityConnectionControls": {
					dataValueType: Terrasoft.DataValueType.COLLECTION,
					type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					isCollection: true,
					value: this.Ext.create("Terrasoft.ObjectCollection")
				},
				/**
				 * Конфигурация представления элемента связей сущности.
				 */
				"ItemViewConfig": {
					dataValueType: Terrasoft.DataValueType.CUSTOM_OBJECT
				}
			},
			methods: {
				/**
				 * @inheritdoc Terrasoft.BaseProcessSchemaElementPropertiesPage#onPageInitialized
				 * @overridden
				 */
				onPageInitialized: function(callback, scope) {
					this.loadEntityConnectionColumns(function() {
						this.onInitActivityConnectionControls();
						callback.call(scope || this);
					});
				},
				/**
				 * Создание контролов для редактирования параметров связей сущности.
				 * @protected
				 */
				onInitActivityConnectionControls: function() {
					var entityConnections = this.get("EntityConnectionColumnList");
					var processElement = this.get("ProcessElement");
					var controlList = this.get("ActivityConnectionControls");
					controlList.clear();
					Terrasoft.each(processElement.parameters, function(item) {
						if (item.referenceSchemaUId && entityConnections.contains(item.name) &&
							item.SourceValue && item.SourceValue.DisplayValue) {
							var entityConnection = entityConnections.get(item.name);
							var config = Ext.apply(entityConnection, {
								displayValue: item.SourceValue.DisplayValue,
								value: item.SourceValue.Value
							});
							var viewModel = this.getConnectionParameterViewModel(config);
							controlList.add(entityConnection.name, viewModel);
							entityConnection.selected = true;
						}
					}, this);
				},
				/**
				 * @inheritdoc BaseProcessSchemaElementPropertiesPage#getTabs
				 * @overridden
				 */
				getTabs: function() {
					var builder = Terrasoft.ImageUrlBuilder;
					return [
						{
							Name: "MainTab",
							DefaultTabImage: builder.getUrl(resources.localizableImages.Main),
							ActiveTabImage: builder.getUrl(resources.localizableImages.MainSelected),
							IsRequired: false,
							ProcessInformationText: resources.localizableStrings.MainTabInformationText,
							MarkerValue: "MainTab"
						},
						{
							Name: "TaskParametersTab",
							DefaultTabImage: builder.getUrl(resources.localizableImages.TaskParameters),
							ActiveTabImage: builder.getUrl(resources.localizableImages.TaskParameterssSelected),
							IsRequired: false,
							ProcessInformationText: resources.localizableStrings.TaskParametersTabInformationText,
							MarkerValue: "TaskParametersTab"
						}
					];
				},
				/**
				 * Обработчик события нажатия на кнопку "Настроить"
				 */
				onSettingsClick: function() {
					this.showLookupActivityConnection();
				},
				/**
				 * Возвращает EntitySchemaQuery схемы EntityConnection
				 * @protected
				 * @returns {Terrasoft.EntitySchemaQuery}
				 */
				getEntityConnectionSchemaQuery: function() {
					var entitySchemaUId = Activity.uId;
					var cacheItemName = entitySchemaUId + "_" + this.name;
					var esq = this.Ext.create("Terrasoft.EntitySchemaQuery", {
						rootSchemaName: "EntityConnection",
						serverESQCacheParameters: {
							cacheLevel: Terrasoft.ESQServerCacheLevels.SESSION,
							cacheGroup: this.name,
							cacheItemName: cacheItemName
						}
					});
					esq.addColumn("ColumnUId");
					esq.filters.addItem(esq.createColumnFilterWithParameter(
						this.Terrasoft.ComparisonType.EQUAL, "SysEntitySchemaUId", entitySchemaUId));
					return esq;
				},
				/**
				 * Загружает колонки связей сущности.
				 * @param {Function} callback Функция обратного вызова.
				 */
				loadEntityConnectionColumns: function(callback) {
					var entityConnectionList = this.get("EntityConnectionColumnList");
					if (entityConnectionList) {
						callback.call(this, entityConnectionList);
						return;
					}
					entityConnectionList = this.Ext.create("Terrasoft.Collection");
					var esq = this.getEntityConnectionSchemaQuery();
					esq.getEntityCollection(function(result) {
						if (result.success) {
							var entities = result.collection;
							entities.each(function(item) {
								var entityColumn = Activity.getColumnByUId(item.get("ColumnUId"));
								entityConnectionList.add(entityColumn.name,
									{
										id: entityColumn.uId,
										name: entityColumn.name,
										caption: entityColumn.caption,
										selected: false
									});
							}, this);
							entityConnectionList.sort(null, null, function(item1, item2) {
								var caption1 = item1.caption;
								var caption2 = item2.caption;
								return caption1.localeCompare(caption2);
							});
						}
						this.set("EntityConnectionColumnList", entityConnectionList);
						callback.call(this);
					}, this);
				},
				/**
				 * Открывает модальное окно выбора связи активности
				 * @overridden
				 * @private
				 */
				showLookupActivityConnection: function() {
					var entityList = this.get("EntityConnectionColumnList");
					var boxSize = {
						minHeight: "1",
						minWidth: "1",
						maxHeight: "100",
						maxWidth: "100"
					};
					var innerBoxContainer = ModalBox.show(boxSize, Ext.emptyFn, this);
					var schemaName = "LookupActivityConnectionPage";
					var pageId = this.sandbox.id + schemaName;
					var modalBoxParameters = {
						"EntityConnectionList": entityList
					};
					ModalBox.setSize(685, 460);
					var captionModalBox = this.get("Resources.Strings.LookupActivityConnectionPageCaption");
					this.sandbox.subscribe("GetParametersInfo", function() {
						return {
							schemaName: schemaName,
							modalBoxCaption: captionModalBox,
							parameters: modalBoxParameters
						};
					}, this, [pageId]);
					this.sandbox.loadModule("LookupActivityConnectionModule", {
						renderTo: innerBoxContainer,
						id: pageId
					});
					this.sandbox.subscribe("SetParametersInfo", function(parameters) {
						if (parameters) {
							this.showActivityConnectionControls(parameters.selectedRows);
						}
						ModalBox.close();
						this.onItemFocused();
					}, this, [pageId]);
				},
				/**
				 * Добавляет или удаляет контролы для редактирования параметров связи активности.
				 * @private
				 * @param {Array} items Массив идентификаторов выбранных связей активности.
				 */
				showActivityConnectionControls: function(items) {
					var entityList = this.get("EntityConnectionColumnList");
					var controlList = this.get("ActivityConnectionControls");
					entityList.each(function(entityConnection) {
						entityConnection.selected = Ext.Array.contains(items, entityConnection.id);
						if (entityConnection.selected && !controlList.contains(entityConnection.name)) {
							var viewModelConfig = Ext.apply(entityConnection, {
								displayValue: "",
								value: ""
							});
							var viewModel = this.getConnectionParameterViewModel(viewModelConfig);
							controlList.add(entityConnection.name, viewModel);
						}
						if (!entityConnection.selected && controlList.contains(entityConnection.name)) {
							controlList.removeByKey(entityConnection.name);
						}
					}, this);
				},
				/**
				 * Возвращает ViewModel элемента связей сущности.
				 * @private
				 * @param {Object} itemConfig Конфигурация элемента.
				 * return {Terrasoft.ParameterViewModel} ViewModel.
				 */
				getConnectionParameterViewModel: function(itemConfig) {
					var viewModel = Ext.create("Terrasoft.ParameterViewModel", {
						columns: {
							Id: {dataValueType: Terrasoft.DataValueType.TEXT},
							Caption: {dataValueType: Terrasoft.DataValueType.TEXT},
							DisplayValue: {dataValueType: Terrasoft.DataValueType.TEXT},
							Value: {dataValueType: Terrasoft.DataValueType.TEXT}
						},
						values: {
							Id: itemConfig.name,
							Caption: itemConfig.caption,
							DisplayValue: itemConfig.displayValue,
							Value: itemConfig.Value
						}
					});
					viewModel.sandbox = this.sandbox;
					viewModel.parentModule = this;
					return viewModel;
				},
				/**
				 * Формирует конфигурацию представления элемента.
				 * @private
				 * @param {Object} itemConfig Ссылка на конфигурацию элемента в ContainerList.
				 */
				getItemViewConfig: function(itemConfig) {
					var itemViewConfig = this.get("ItemViewConfig");
					if (itemViewConfig) {
						itemConfig.config = itemViewConfig;
						return;
					}
					var getConfig = function(id, wrapClassName, items) {
						var container = {
							className: "Terrasoft.Container",
							id: id,
							selectors: {wrapEl: "#" + id},
							items: items
						};
						if (!Ext.isEmpty(wrapClassName)) {
							container.classes = {
								wrapClassName: wrapClassName
							};
						}
						return container;
					};
					itemConfig.config = getConfig("item-view", ["grid-listed-row", "grid-active-selectable"], [
						getConfig("connection-parameters-container", [], [
							{
								inputId: "connection-parameter-caption",
								className: "Terrasoft.Label",
								caption: {bindTo: "Caption"},
								classes: {wrapperClass: "control-width-15"}
							},
							{
								id:  "connection-parameter-text-edit",
								className: "Terrasoft.TextEdit",
								value: {bindTo: "DisplayValue"},
								classes: {wrapperClass: "control-width-15"}
							},
							{
								id: "connection-parameter-button",
								className: "Terrasoft.Button",
								style: Terrasoft.controls.ButtonEnums.style.DEFAULT,
								caption: "...",
								classes: {wrapperClass: "t-btn-wrapper"}
							}
						])
					]);
					this.set("ItemViewConfig", itemConfig.config);
				}
			},
			diff: /**SCHEMA_DIFF*/[
			/**
			 * MainTab
			 * Закладка с основными параметрами активности
			 */
				{
					"operation": "insert",
					"name": "MainTab",
					"parentName": "Tabs",
					"propertyName": "tabs",
					"values": {
						"wrapClass": ["tabs"],
						"items": []
					}
				},
				{
					"operation": "insert",
					"name": "MainTabContainer",
					"parentName": "MainTab",
					"propertyName": "items",
					"values": {
						"itemType": Terrasoft.ViewItemType.CONTAINER,
						"items": []
					}
				},
				{
					"operation": "insert",
					"name": "ActivityCategory",
					"parentName": "MainTabContainer",
					"propertyName": "items",
					"values": {
						"labelConfig": {
							"caption": {
								"bindTo": "Resources.Strings.ActivityCategoryCaption"
							}
						},
						"classes": {
							"labelClass": ["t-label-proc"]
						}
					}
				},
				{
					"operation": "insert",
					"name": "Owner",
					"parentName": "MainTabContainer",
					"propertyName": "items",
					"values": {
						"labelConfig": {
							"caption": {
								"bindTo": "Resources.Strings.OwnerCaption"
							}
						},
						"classes": {
							"labelClass": ["t-label-proc"]
						}
					}
				},
				{
					"operation": "insert",
					"name": "Recommendation",
					"parentName": "MainTabContainer",
					"propertyName": "items",
					"values": {
						"labelConfig": {
							"caption": {
								"bindTo": "Resources.Strings.RecommendationCaption"
							}
						},
						"classes": {
							"labelClass": ["t-label-proc"]
						}
					}
				},
				{
					"operation": "insert",
					"name": "InformationOnStepGrid",
					"parentName": "MainTabContainer",
					"propertyName": "items",
					"values": {
						"itemType": Terrasoft.ViewItemType.GRID_LAYOUT,
						"items": []
					}
				},
				{
					"operation": "insert",
					"name": "InformationOnStep",
					"parentName": "InformationOnStepGrid",
					"propertyName": "items",
					"values": {
						"contentType": Terrasoft.ContentType.LONG_TEXT,
						"labelConfig": {
							"caption": {
								"bindTo": "Resources.Strings.InformationOnStepCaption"
							}
						},
						"layout": {
							"column": 0,
							"row": 0,
							"colSpan": 24,
							"rowSpan": 2
						},
						"classes": {
							"labelClass": ["t-label-proc"]
						}
					}
				},
				{
					"operation": "insert",
					"name": "ShowExecutionPage",
					"parentName": "MainTabContainer",
					"propertyName": "items",
					"values": {
						"labelWrapConfig": {
							"classes": {
								"wrapClassName": ["t-checkbox-label-proc"]
							}
						},
						"controlWrapConfig": {
							"classes": {
								"wrapClassName": ["t-checkbox-proc"]
							}
						}
					}
				},
				{
					"operation": "insert",
					"name": "UserTaskContainer",
					"parentName": "MainTabContainer",
					"propertyName": "items",
					"values": {
						"itemType": Terrasoft.ViewItemType.CONTROL_GROUP,
						"items": []
					}
				},
				{
					"operation": "insert",
					"name": "UserTaskLinksContainer",
					"parentName": "UserTaskContainer",
					"propertyName": "items",
					"values": {
						"itemType": Terrasoft.ViewItemType.CONTROL_GROUP,
						"items": [],
						"caption": {
							"bindTo": "Resources.Strings.ActivityLinksCaption"
						}
					}
				},
				{
					"operation": "insert",
					"name": "ParametersContainer",
					"parentName": "UserTaskLinksContainer",
					"propertyName": "items",
					"values": {
						"generator": "ConfigurationItemGenerator.generateContainerList",
						"idProperty": "Id",
						"collection": "ActivityConnectionControls",
						"onGetItemConfig": "getItemViewConfig"
					}
				},
				{
					"operation": "insert",
					"parentName": "UserTaskContainer",
					"propertyName": "items",
					"name": "SettingsButton",
					"values": {
						"itemType": Terrasoft.ViewItemType.BUTTON,
						"caption": {
							"bindTo": "Resources.Strings.SettingsButtonCaption"
						},
						"click": {
							"bindTo": "onSettingsClick"
						},
						"markerValue": "SettingsButton",
						"classes": {"textClass": "settings-button"}
					}
				},
				{
					"operation": "insert",
					"parentName": "MainTabContainer",
					"propertyName": "items",
					"name": "MainTabNextButton",
					"values": {
						"itemType": Terrasoft.ViewItemType.BUTTON,
						"caption": {
							"bindTo": "Resources.Strings.NextTabButtonCaption"
						},
						"click": {
							"bindTo": "onNextClick"
						},
						"markerValue": "MainTabNextButton"
					}
				},
				/**
				 * TaskParametersTab
				 * Вкладка с параметрами связей активности
				 */
				{
					"operation": "insert",
					"name": "TaskParametersTab",
					"parentName": "Tabs",
					"propertyName": "tabs",
					"values": {
						"wrapClass": ["tabs"],
						"items": []
					}
				},
				{
					"operation": "insert",
					"name": "UserTaskParametersContainer",
					"parentName": "TaskParametersTab",
					"propertyName": "items",
					"values": {
						"itemType": Terrasoft.ViewItemType.CONTROL_GROUP,
						"items": []
					}
				},
				{
					"operation": "insert",
					"name": "UserTaskParametersGridContainer",
					"parentName": "UserTaskParametersContainer",
					"propertyName": "items",
					"values": {
						"itemType": Terrasoft.ViewItemType.GRID_LAYOUT,
						"items": []
					}
				},
				{
					"operation": "insert",
					"name": "StartIn",
					"parentName": "UserTaskParametersGridContainer",
					"propertyName": "items",
					"values": {
						"labelConfig": {
							"caption": {
								"bindTo": "Resources.Strings.StartInCaption"
							}
						},
						"layout": {
							"column": 0,
							"row": 0,
							"colSpan": 12
						},
						"classes": {
							"labelClass": ["t-label-proc"]
						}
					}
				},
				{
					"operation": "insert",
					"name": "StartInPeriod",
					"parentName": "UserTaskParametersGridContainer",
					"propertyName": "items",
					"values": {
						"labelConfig": {
							"visible": false
						},
						"layout": {
							"column": 14,
							"row": 0,
							"colSpan": 10
						}
					}
				},
				{
					"operation": "insert",
					"name": "Duration",
					"parentName": "UserTaskParametersGridContainer",
					"propertyName": "items",
					"values": {
						"labelConfig": {
							"caption": {
								"bindTo": "Resources.Strings.DurationCaption"
							}
						},
						"layout": {
							"column": 0,
							"row": 1,
							"colSpan": 12
						},
						"classes": {
							"labelClass": ["t-label-proc"]
						}
					}
				},
				{
					"operation": "insert",
					"name": "DurationPeriod",
					"parentName": "UserTaskParametersGridContainer",
					"propertyName": "items",
					"values": {
						"labelConfig": {
							"visible": false
						},
						"layout": {
							"column": 14,
							"row": 1,
							"colSpan": 10
						}
					}
				},
				{
					"operation": "insert",
					"name": "RemindBefore",
					"parentName": "UserTaskParametersGridContainer",
					"propertyName": "items",
					"values": {
						"labelConfig": {
							"caption": {
								"bindTo": "Resources.Strings.RemindBeforeCaption"
							}
						},
						"layout": {
							"column": 0,
							"row": 2,
							"colSpan": 12
						},
						"classes": {
							"labelClass": ["t-label-proc"]
						}
					}
				},
				{
					"operation": "insert",
					"name": "RemindBeforePeriod",
					"parentName": "UserTaskParametersGridContainer",
					"propertyName": "items",
					"values": {
						"labelConfig": {
							"visible": false
						},
						"layout": {
							"column": 14,
							"row": 2,
							"colSpan": 10
						}
					}
				},
				{
					"operation": "insert",
					"name": "ShowInScheduler",
					"parentName": "UserTaskParametersGridContainer",
					"propertyName": "items",
					"values": {
						"layout": {
							"column": 0,
							"row": 3,
							"colSpan": 24
						},
						"labelWrapConfig": {
							"classes": {
								"wrapClassName": ["t-checkbox-label-proc"]
							}
						},
						"controlWrapConfig": {
							"classes": {
								"wrapClassName": ["t-checkbox-proc"]
							}
						}
					}
				}
			]/**SCHEMA_DIFF*/
		};
	}
);
