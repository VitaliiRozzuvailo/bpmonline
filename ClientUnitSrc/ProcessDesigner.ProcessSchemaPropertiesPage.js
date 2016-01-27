/**
 * Схема страницы редактирования свойств процесса
 * Parent: BaseProcessSchemaElementPropertiesPage
 */
define("ProcessSchemaPropertiesPage", ["terrasoft", "ProcessSchemaPropertiesPageResources", "ProcessModuleUtilities",
	"ConfigurationItemGenerator"],
	function(Terrasoft, resources, ProcessModuleUtilities, ConfigurationItemGenerator) {

	Ext.define("Terrasoft.configuration.ParameterViewModel", {
		alternateClassName: "Terrasoft.ParameterViewModel",
		extend: "Terrasoft.BaseModel",

		parentModule: null,

		onEditClick: function () {
			var rowId = this.values.Id;
			var lookup = Ext.get("edit-module-lookup-container-" + rowId + "-" + this.sandbox.id);
			var dataValueType = this.values.DataValueType;
			if (dataValueType == "Справочник") { // TODO
				lookup.removeCls("grid-row-hidden");
			} else {
				lookup.addCls("grid-row-hidden");
			}
			var rowItem = Ext.get("row-item-" + rowId + "-" + this.sandbox.id);
			rowItem.addCls("grid-row-hidden");
			var editModule = Ext.get("edit-module-" + rowId + "-" + this.sandbox.id);
			editModule.removeCls("grid-row-hidden");
		},
		onDeleteClick: function () {
			// TODO
		},
		onSaveClick: function() {
			// TODO
			var rowId = this.values.Id;
			var rowItem = Ext.get("row-item-" + rowId + "-" + this.sandbox.id);
			rowItem.removeCls("grid-row-hidden");
			var module = Ext.get("edit-module-" + rowId + "-" + this.sandbox.id);
			module.addCls("grid-row-hidden");
		},
		onCancelClick: function() {
			// TODO
			var rowId = this.values.Id;
			var rowItem = Ext.get("row-item-" + rowId + "-" + this.sandbox.id);
			rowItem.removeCls("grid-row-hidden");
			var module = Ext.get("edit-module-" + rowId + "-" + this.sandbox.id);
			module.addCls("grid-row-hidden");
		}
	});

	return {
		messages: {},
		mixins: {
			editable: "Terrasoft.ProcessSchemaElementEditable"
		},
		attributes: {
			/**
			 * Заголовок страницы
			 */
			"Caption": {
				dataValueType: this.Terrasoft.DataValueType.TEXT,
				type: this.Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN
			},
			/**
			 * Название
			 */
			"name": {
				dataValueType: this.Terrasoft.DataValueType.TEXT,
				type: this.Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
				isProcessSchemaParameter: true
			},
			/**
			 * Описание
			 */
			"description": {
				dataValueType: this.Terrasoft.DataValueType.TEXT,
				type: this.Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
				caption: resources.localizableStrings.DescriptionCaption,
				isProcessSchemaParameter: true
			},
			/**
			 * Версия
			 */
			"version": {
				dataValueType: this.Terrasoft.DataValueType.INTEGER,
				type: this.Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
				caption: resources.localizableStrings.VersionCaption,
				isProcessSchemaParameter: true
			},
			/**
			 * Признак активного процесса
			 */
			"enabled": {
				dataValueType: Terrasoft.DataValueType.BOOLEAN,
				type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
				caption: resources.localizableStrings.EnabledCaption,
				isProcessSchemaParameter: true
			},
			/**
			 * Признак журналирования
			 */
			"isLogging": {
				dataValueType: Terrasoft.DataValueType.BOOLEAN,
				type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
				caption: resources.localizableStrings.IsLoggingCaption,
				isProcessSchemaParameter: true
			},
			/**
			 * Пакет
			 */
			"SysPackage": {
				dataValueType: Terrasoft.DataValueType.ENUM,
				type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
				isRequired: true,
				caption: resources.localizableStrings.SysPackageCaption
			},
			/**
			 * Список пакетов, отображаемый при выборе значения из справочника
			 */
			"SysPackageList": {
				dataValueType: Terrasoft.DataValueType.ENUM,
				type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
				isCollection: true,
				value: Ext.create("Terrasoft.Collection")
			},
			/**
			 * Параметры процесса
			 */
			"Parameters": {
				dataValueType: Terrasoft.DataValueType.COLLECTION,
				type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
				isCollection: true,
				value: this.Ext.create("Terrasoft.ObjectCollection")
			}
		},
		methods: {
			/**
			 * Возвращает значение типа данных параметра для отображения
			 */
			getDataValueTypeCaption: function(dataValueType) {
				var dataValueTypeString = dataValueType.toString();
				var dataValueTypeCaption = "Объект";
				switch (dataValueTypeString) {
					case "Terrasoft.Core.MediumTextDataValueType":
						dataValueTypeCaption = "Строка";
						break;
					case "Terrasoft.Core.IntegerDataValueType":
						dataValueTypeCaption = "Целое число";
						break;
					case "Terrasoft.Core.LookupDataValueType":
						dataValueTypeCaption = "Справочник";
						break;
					// TODO Описать остальные типы
				}
				return dataValueTypeCaption;
			},
			/**
			 * @inheritDoc ProcessSchemaElementEditable#onElementDataLoad
			 * @protected
			 * @overridden
			 */
			onElementDataLoad: function(processElement) {
				this.callParent(arguments);
				var packageUId = processElement.packageUId;
				this.initSysPackage(packageUId);
				var parameters = this.get("Parameters");
				parameters.clear();
				Terrasoft.each(processElement.parameters, function(item) {
					var viewModel = Ext.create("Terrasoft.ParameterViewModel", {
						columns: {
							Id: {dataValueType: Terrasoft.DataValueType.TEXT},
							Caption: {dataValueType: Terrasoft.DataValueType.TEXT},
							DataValueType: {dataValueType: Terrasoft.DataValueType.TEXT},
							IsRequired: {dataValueType: Terrasoft.DataValueType.BOOLEAN},
							ReferenceSchemaUId: {dataValueType: Terrasoft.DataValueType.LOOKUP}
						},
						values: {
							Id: item.name,
							Caption: item.caption,
							DataValueType: this.getDataValueTypeCaption(item.dataValueType),
							IsRequired: item.isRequired,
							ReferenceSchemaUId: item.referenceSchemaUId
						}
					});
					viewModel.sandbox = this.sandbox;
					viewModel.parentModule = this;
					parameters.add(item.name, viewModel);
				}, this);
				this.set("Parameters", parameters);
			},
			/**
			 * Формирует конфигурацию представления элемента.
			 * @private
			 * @param {Object} itemConfig Ссылка на конфигурацию элемента в ContainerList.
			 */
			getItemViewConfig: function(itemConfig) {
				var itemViewConfig = this.get("itemViewConfig");
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
					getConfig("row-item", ["paramContainer", "grid-row"], [
						getConfig("row-data", [], [
							{
								id: "captionColumn",
								className: "Terrasoft.Label",
								caption: {bindTo: "Caption"},
								classes: {labelClass: ["grid-cols-12"]}
							},
							{
								id: "dataValueTypeColumn",
								className: "Terrasoft.Label",
								caption: {bindTo: "DataValueType"},
								classes: {labelClass: ["grid-cols-12"]}
							}
						]),
						getConfig("row-actions", ["grid-row-hidden"], [
							{
								id: "row-action-edit",
								className: "Terrasoft.Button",
								style: Terrasoft.controls.ButtonEnums.style.BLUE,
								selectors: {wrapEl: "#edit"},
								click: {bindTo: "onEditClick"},
								caption: resources.localizableStrings.EditButtonCaption,
								classes: {wrapperClass: "t-btn-wrapper"}
							},
							{
								id: "row-action-delete",
								className: "Terrasoft.Button",
								style: Terrasoft.controls.ButtonEnums.style.GREY,
								selectors: {wrapEl: "#delete"},
								click: {bindTo: "onDeleteClick"},
								caption: resources.localizableStrings.DeleteButtonCaption,
								classes: {wrapperClass: "t-btn-wrapper"}
							}
						])
					]),
					getConfig("edit-module", ["grid-row-hidden"], [
						getConfig("edit-module-data", [], [
							getConfig("edit-module-caption-container", [], [
								{
									className: "Terrasoft.Label",
									caption: resources.localizableStrings.ParameterNameCaption,
									inputId: "edit-module-caption"
								},
								{
									id: "edit-module-caption",
									className: "Terrasoft.TextEdit",
									value: {bindTo: "Caption"},
									classes: {wrapperClass: "control-width-15"}
								}
							]),
							getConfig("edit-module-lookup-container", [], [
								{
									className: "Terrasoft.Label",
									caption: resources.localizableStrings.ParameterLookupCaption,
									inputId: "edit-module-lookup"
								},
								{
									id: "edit-module-lookup",
									className: "Terrasoft.LookupEdit",
									value: {bindTo: "ReferenceSchemaUId"},
									classes: {wrapperClass: "control-width-15"}
								}
							]),
							getConfig("edit-module-require-container", [], [
								{
									className: "Terrasoft.Label",
									caption: resources.localizableStrings.IsRequiredCaption,
									inputId: "edit-module-require"
								},
								{
									id: "edit-module-require",
									className: "Terrasoft.CheckBoxEdit",
									checked: {bindTo: "IsRequired"}
								}
							])
						]),
						getConfig("edit-module-actions", [], [
							{
								id: "edit-module-save",
								className: "Terrasoft.Button",
								style: Terrasoft.controls.ButtonEnums.style.BLUE,
								selectors: {wrapEl: "#save"},
								click: {bindTo: "onSaveClick"},
								caption: resources.localizableStrings.SaveModuleButtonCaption,
								classes: {wrapperClass: "t-btn-wrapper"}
							},
							{
								id: "edit-module-cancel",
								className: "Terrasoft.Button",
								style: Terrasoft.controls.ButtonEnums.style.GREY,
								selectors: {wrapEl: "#cancel"},
								click: {bindTo: "onCancelClick"},
								caption: resources.localizableStrings.CancelModuleButtonCaption,
								classes: {wrapperClass: "t-btn-wrapper"}
							}
						])
					])
				]);
				this.set("itemViewConfig", itemConfig.config);
			},
			/**
			 * Обработчик нажатия на элементе списка параметров
			 */
			onItemClick: function(rowId) {
				var lastActiveRowId, rowItem, rowActions, editModule;
				lastActiveRowId = this.get("ActiveRowId");
				if (lastActiveRowId != rowId) {
					if (lastActiveRowId) {
						rowItem = Ext.get("item-view-" + lastActiveRowId + "-" + this.sandbox.id);
						rowItem.removeCls("grid-row-selected");
						rowItem = Ext.get("row-item-" + lastActiveRowId + "-" + this.sandbox.id);
						rowItem.removeCls("grid-row-hidden");
						rowActions = Ext.get("row-actions-" + lastActiveRowId + "-" + this.sandbox.id);
						rowActions.addCls("grid-row-hidden");
						editModule = Ext.get("edit-module-" + lastActiveRowId + "-" + this.sandbox.id);
						editModule.addCls("grid-row-hidden");
					}
					rowItem = Ext.get("item-view-" + rowId + "-" + this.sandbox.id);
					rowItem.addCls("grid-row-selected");
					rowActions = Ext.get("row-actions-" + rowId + "-" + this.sandbox.id);
					rowActions.removeCls("grid-row-hidden");
					this.set("ActiveRowId", rowId);
				}
			},
			/**
			 * @inheritDoc BaseProcessSchemaElementPropertiesPage#getPropertiesValues
			 * @protected
			 * @overridden
			 */
			getPropertiesValues: function() {
				var propertiesValues = this.callParent();
				var sysPackage = this.get("SysPackage");
				propertiesValues.packageUId = sysPackage.UId;
				return propertiesValues;
			},
			/**
			 * Иницилизация SysPackage
			 * @param {Guid} packageUId Идентификатор пакета
			 */
			initSysPackage: function(packageUId) {
				var esq = Ext.create("Terrasoft.EntitySchemaQuery", {
					rootSchemaName: "SysPackage"
				});
				esq.addColumn("UId");
				esq.addColumn("Id");
				esq.addColumn("Name");
				esq.filters.add("UId", Terrasoft.createColumnFilterWithParameter(
						Terrasoft.ComparisonType.EQUAL, "UId", packageUId));
				esq.filters.add("SysWorkspace", Terrasoft.createColumnFilterWithParameter(
						Terrasoft.ComparisonType.EQUAL, "SysWorkspace",
						Terrasoft.SysValue.CURRENT_WORKSPACE.value));
				esq.getEntityCollection(function(response) {
					var collection = response.collection;
					if (collection && collection.collection.length > 0) {
						var item = collection.collection.items[0];
						var listValue = {
							UId: item.values.UId,
							value: item.values.Id,
							displayValue: item.values.Name
						};
						this.set("SysPackage", listValue);
					}
				}, this);
			},
			/**
			 * Обработчик события подготовки данных для выпадающего списка пакетов
			 * @filter {Object} Фильры для подготовки данных
			 * @list {Terrasoft.Collection} Данные для выпадающего списка
			 * @protected
			 */
			onPrepareSysPackageList: function(filter, list) {
				ProcessModuleUtilities.onPrepareSysPackageList(filter, list);
			},
			/**
			 * Возвращает массив закладок, со структурой описанной в методе getTabsColumns
			 * @overridden
			 */
			getTabs: function() {
				var builder = Terrasoft.ImageUrlBuilder;
				return [
					{
						Name: "InputParametersTab",
						DefaultTabImage: builder.getUrl(resources.localizableImages.InputParameters),
						ActiveTabImage: builder.getUrl(resources.localizableImages.InputParametersSelected),
						IsRequired: false,
						ProcessInformationText: resources.localizableStrings.InputParametersTabInformationText,
						MarkerValue: "InputParametersTab"
					},
					{
						Name: "OutputParametersTab",
						DefaultTabImage: builder.getUrl(resources.localizableImages.OutputParameters),
						ActiveTabImage: builder.getUrl(resources.localizableImages.OutputParametersSelected),
						IsRequired: false,
						ProcessInformationText: resources.localizableStrings.OutputParametersTabInformationText,
						MarkerValue: "OutputParametersTab"
					},
					{
						Name: "InternalParametersTab",
						DefaultTabImage: builder.getUrl(resources.localizableImages.InternalParameters),
						ActiveTabImage: builder.getUrl(resources.localizableImages.InternalParametersSelected),
						IsRequired: false,
						ProcessInformationText: resources.localizableStrings.InternalParametersTabInformationText,
						MarkerValue: "InternalParametersTab"
					},
					{
						Name: "SettingsTab",
						DefaultTabImage: builder.getUrl(resources.localizableImages.Settings),
						ActiveTabImage: builder.getUrl(resources.localizableImages.SettingsSelected),
						IsRequired: false,
						ProcessInformationText: resources.localizableStrings.SettingsTabInformationText,
						MarkerValue: "SettingsTab"
					}
				];
			}
		},
		diff: /**SCHEMA_DIFF*/[
			{
				"operation": "remove",
				"name": "TitleContainer"
			},
			{
				"operation": "insert",
				"name": "CaptionContainer",
				"parentName": "HeaderContainer",
				"propertyName": "items",
				"values": {
					"itemType": Terrasoft.ViewItemType.CONTAINER,
					"classes": {
						"wrapClassName": ["caption"]
					},
					"items": []
				}
			},
			{
				"operation": "insert",
				"parentName": "CaptionContainer",
				"propertyName": "items",
				"name": "Caption",
				"values": {
					"itemType": Terrasoft.ViewItemType.LABEL,
					"caption": {"bindTo": "Resources.Strings.CaptionCaption"},
					"classes": {
						"labelClass": ["control-caption"]
					}
				}
			},
			{
				"operation": "insert",
				"name": "InputParametersTab",
				"parentName": "Tabs",
				"propertyName": "tabs",
				"values": {
					"wrapClass": ["tabs"],
					"items": []
				}
			},
			{
				"operation": "insert",
				"name": "OutputParametersTab",
				"parentName": "Tabs",
				"propertyName": "tabs",
				"values": {
					"wrapClass": ["tabs"],
					"items": []
				}
			},
			{
				"operation": "insert",
				"name": "InternalParametersTab",
				"parentName": "Tabs",
				"propertyName": "tabs",
				"values": {
					"wrapClass": ["tabs"],
					"items": []
				}
			},
			{
				"operation": "insert",
				"name": "AddParameterButton",
				"parentName": "InputParametersTab",
				"propertyName": "items",
				"values": {
					"itemType": Terrasoft.ViewItemType.BUTTON,
					"style": Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
					"caption": "Добавить параметр" // TODO Поменять на икноку "+"
				}
			},
			{
				"operation": "insert",
				"name": "Parameters",
				"parentName": "InputParametersTab",
				"propertyName": "items",
				"values": {
					"itemType": Terrasoft.ViewItemType.CONTROL_GROUP,
					"items": [],
					"classes": {"wrapClass": ["grid-listed-zebra", "ts-params-grid"]},
					"bottomLine": true
				}
			},
			{
				"operation": "insert",
				"name": "ParatemersHeader",
				"parentName": "Parameters",
				"propertyName": "items",
				"values": {
					"itemType": Terrasoft.ViewItemType.GRID_LAYOUT,
					"items": [],
					"classes": {
						"wrapClass": ["grid-captions"]
					}
				}
			},
			{
				"operation": "insert",
				"name": "ParameterName",
				"parentName": "ParatemersHeader",
				"propertyName": "items",
				"values": {
					"itemType": Terrasoft.ViewItemType.LABEL,
					"caption": {"bindTo": "Resources.Strings.ParameterNameCaption"},
					"layout": {
						"column": 0,
						"row": 0,
						"colSpan": 12,
						"rowSpan": 1
					},
					"classes": {
						"labelClass": ["t-label-proc"]
					}
				}
			},
			{
				"operation": "insert",
				"name": "ParameterType",
				"parentName": "ParatemersHeader",
				"propertyName": "items",
				"values": {
					"itemType": Terrasoft.ViewItemType.LABEL,
					"caption": {"bindTo": "Resources.Strings.ParameterTypeCaption"},
					"layout": {
						"column": 12,
						"row": 0,
						"colSpan": 12,
						"rowSpan": 1
					},
					"classes": {
						"labelClass": ["t-label-proc"]
					}
				}
			},
			{
				"operation": "insert",
				"name": "ParametersContainer",
				"parentName": "Parameters",
				"propertyName": "items",
				"values": {
					"generator": "ConfigurationItemGenerator.generateContainerList",
					"idProperty": "Id",
					"onItemClick": {"bindTo": "onItemClick"},
					"collection": "Parameters",
					"onGetItemConfig": "getItemViewConfig",
					"rowCssSelector": ".paramContainer"
				}
			},
			{
				"operation": "insert",
				"name": "SettingsTab",
				"parentName": "Tabs",
				"propertyName": "tabs",
				"values": {
					"wrapClass": ["tabs"],
					"items": []
				}
			},
			{
				"operation": "insert",
				"name": "ControlGroup",
				"parentName": "SettingsTab",
				"propertyName": "items",
				"values": {
					"itemType": Terrasoft.ViewItemType.GRID_LAYOUT,
					"items": []
				}
			},
			{
				"operation": "insert",
				"parentName": "ControlGroup",
				"propertyName": "items",
				"name": "name",
				"values": {
					"caption": {"bindTo": "Resources.Strings.NameCaption"},
					"layout": {
						"column": 0,
						"row": 0,
						"colSpan": 24,
						"rowSpan": 1
					},
					"isRequired": true,
					"classes": {
						"labelClass": ["t-label-proc"]
					}
				}
			},
			{
				"operation": "insert",
				"parentName": "ControlGroup",
				"propertyName": "items",
				"name": "description",
				"values": {
					"contentType": Terrasoft.ContentType.LONG_TEXT,
					"layout": {
						"column": 0,
						"row": 1,
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
				"parentName": "ControlGroup",
				"propertyName": "items",
				"name": "SysPackage",
				"values": {
					"controlConfig": {
						"prepareList": {
							"bindTo": "onPrepareSysPackageList"
						}
					},
					"layout": {
						"column": 0,
						"row": 3,
						"colSpan": 24,
						"rowSpan": 1
					},
					"classes": {
						"labelClass": ["t-label-proc"]
					}
				}
			},
			{
				"operation": "insert",
				"parentName": "ControlGroup",
				"propertyName": "items",
				"name": "version",
				"values": {
					"layout": {
						"column": 0,
						"row": 4,
						"colSpan": 24,
						"rowSpan": 1
					},
					"classes": {
						"labelClass": ["t-label-proc"]
					}
				}
			},
			{
				"operation": "insert",
				"parentName": "ControlGroup",
				"propertyName": "items",
				"name": "enabled",
				"values": {
					"layout": {
						"column": 0,
						"row": 5,
						"colSpan": 24,
						"rowSpan": 1
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
			},
			{
				"operation": "insert",
				"parentName": "ControlGroup",
				"propertyName": "items",
				"name": "isLogging",
				"values": {
					"layout": {
						"column": 0,
						"row": 6,
						"colSpan": 24,
						"rowSpan": 1
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
});
