define("MacrosPage", ["ModalBox"], function(ModalBox) {
	return {
		attributes: {
			"TabsCollection": {
				dataValueType: Terrasoft.DataValueType.COLLECTION
			},
			"MacrosCollection": {
				dataValueType: Terrasoft.DataValueType.COLLECTION
			},
			"MacrosGroupsCollection": {
				dataValueType: Terrasoft.DataValueType.COLLECTION
			}
		},
		messages: {
			"MacroSelected": {
				mode: Terrasoft.MessageMode.PTP,
				direction: Terrasoft.MessageDirectionType.PUBLISH
			}
		},
		methods: {

			/**
			 * @inheritdoc Terrasoft.BaseSchemaViewModel#init
			 * @overridden
			 */
			init: function(callback, scope) {
				this.callParent([function () {
					this.initCollections();
					this.initTabs();
					this.loadMacros();
					callback.call(scope);
				}, this]);
			},

			/**
			 * Инициализирует коллекции на странице.
			 * @private
			 */
			initCollections: function() {
				this.set("MacrosGroupsCollection", this.Ext.create("Terrasoft.BaseViewModelCollection"));
			},

			/**
			 * Инициализирует вкладки на странице.
			 * @private
			 */
			initTabs: function() {
				var activeTabName = "GeneralMacrosTab";
				this.set("ActiveTabName", activeTabName);
				this.set(activeTabName, true);
			},

			/**
			 * Обрабатывает нажатие кнопки Выбрать.
			 */
			onSelectButtonClick: function() {
				var selectedMacro = this.get("SelectedMacro");
				if (selectedMacro) {
					var formattedMacro = this.getFormattedMacro(selectedMacro);
					this.sandbox.publish("MacroSelected", formattedMacro, [this.sandbox.id]);
				}
				this.onCancelButtonClick();
			},

			/**
			 * Обрабатывает нажатие кнопки Закрыть.
			 */
			onCancelButtonClick: function() {
				ModalBox.close();
			},

			/**
			 * Возвращает отформатированное представления макроса.
			 * @private
			 * @param {Terrasoft.BaseViewModel} macro Макрос.
			 * @return {String} Отформатированное представления макроса.
			 */
			getFormattedMacro: function(macro) {
				var macroTemplate = this.get("Resources.Strings.MacroTemplate");
				var parent = macro.get("Parent");
				var parentMacroName = parent.displayValue;
				var macroName = macro.get("Name");
				var path = this.Ext.String.format("{0}.{1}", parentMacroName, macroName);
				return this.Ext.String.format(macroTemplate, path);
			},

			/**
			 * Загружает макросы.
			 * @private
			 */
			loadMacros: function() {
				var esq = this.Ext.create("Terrasoft.EntitySchemaQuery", {
					rootSchemaName: "EmailTemplateMacros"
				});
				esq.addColumn("Id");
				esq.addColumn("Name");
				esq.addColumn("ColumnPath");
				esq.addColumn("Code");
				var parentColumn = esq.addColumn("Parent");
				parentColumn.orderPosition = 0;
				parentColumn.orderDirection = Terrasoft.OrderDirection.ASC;
				var positionColumn = esq.addColumn("Position");
				positionColumn.orderPosition = 1;
				positionColumn.orderDirection = Terrasoft.OrderDirection.ASC;
				esq.filters.add("isActiveFilter", this.Terrasoft.createColumnFilterWithParameter(
						this.Terrasoft.ComparisonType.EQUAL, "IsInactive", false));
				esq.getEntityCollection(function(response) {
					if (!response.success) {
						throw new Terrasoft.UnknownException();
					}
					this.processMacros(response.collection);
				}, this);
			},

			/**
			 * Обрабатывает макросы.
			 * @private
			 * @param {Terrasoft.Collection} macrosCollection Коллекция макросов.
			 */
			processMacros: function(macrosCollection) {
				var macrosGroupsCollection = this.get("MacrosGroupsCollection");
				macrosCollection.each(function(macro) {
					var parent = macro.get("Parent");
					if (parent) {
						return;
					}
					var macroId = macro.get("Id");
					var children = macrosCollection.filter(function(item) {
						var parent = item.get("Parent");
						var itemParentId = parent.value;
						if (!itemParentId) {
							return false;
						}
						return (macroId === itemParentId);
					});
					var name = macro.get("Name");
					var macrosGroup = this.Ext.create("Terrasoft.BaseViewModel", {
						values: {
							ActiveRow: "",
							Name: name,
							ChildrenCollection: children
						}
					});
					macrosGroup.on("change:ActiveRow", this.rowSelected, this);
					macrosGroup.sandbox = this.sandbox;
					macrosGroupsCollection.addItem(macrosGroup);
				}, this);
				this.set("MacrosCollection", macrosCollection);
			},

			/**
			 * Обрабатывает событие изменения выбранного макроса.
			 * @param {Backbone.Model} model Модель группы макросов.
			 * @param {String} primaryColumnValue Значение первичной колонки выбранной записи.
			 */
			rowSelected: function(model, primaryColumnValue) {
				if (!primaryColumnValue) {
					return;
				}
				var macrosGroupsCollection = this.get("MacrosGroupsCollection");
				macrosGroupsCollection.each(function(macroGroup) {
					var activeRow = macroGroup.get("ActiveRow");
					if (!activeRow || (primaryColumnValue === activeRow)) {
						return;
					}
					macroGroup.set("ActiveRow", "");
				}, this);
				var macrosCollection = this.get("MacrosCollection");
				var selectedMacro = macrosCollection.get(primaryColumnValue);
				this.set("SelectedMacro", selectedMacro);
			},

			/**
			 * Подготавливает конфигурацию представления группы макросов.
			 * @param {Object} item Конфигурация группы макросов.
			 */
			prepareMacrosGroupViewConfig: function(item) {
				item.config = {
					className: "Terrasoft.Container",
					items: [
						{
							className: "Terrasoft.ControlGroup",
							caption: {
								bindTo: "Name"
							},
							collapsed: false,
							items: [
								{
									className: "Terrasoft.Grid",
									type: "listed",
									collection: {bindTo: "ChildrenCollection"},
									listedZebra: true,
									primaryDisplayColumnName: "Name",
									activeRow: {
										bindTo: "ActiveRow"
									},
									columnsConfig: [
										{
											cols: 24,
											key: {
												name: "Name",
												bindTo: "Name",
												type: "text"
											}
										}
									]
								}
							]
						}
					]
				};
			}
		},
		diff: /**SCHEMA_DIFF*/[
			{
				"operation": "insert",
				"name": "MacrosPageContainer",
				"values": {
					"generateId": false,
					"itemType": Terrasoft.ViewItemType.CONTAINER,
					"wrapClass": ["macros-page-container"],
					"items": []
				}
			},
			{
				"operation": "insert",
				"name": "Header",
				"parentName": "MacrosPageContainer",
				"propertyName": "items",
				"values": {
					"generateId": false,
					"itemType": Terrasoft.ViewItemType.CONTAINER,
					"wrapClass": ["header-container"],
					"items": []
				}
			},
			{
				"operation": "insert",
				"name": "HeaderLabelContainer",
				"parentName": "Header",
				"propertyName": "items",
				"values": {
					"generateId": false,
					"itemType": Terrasoft.ViewItemType.CONTAINER,
					"items": []
				}
			},
			{
				"operation": "insert",
				"name": "HeaderLabel",
				"parentName": "HeaderLabelContainer",
				"propertyName": "items",
				"values": {
					"generateId": false,
					"itemType": Terrasoft.ViewItemType.LABEL,
					"caption": {"bindTo": "Resources.Strings.MacrosPageCaption"},
					"labelClass": ["information"]
				}
			},
			{
				"operation": "insert",
				"name": "ActionButtonsContainer",
				"parentName": "Header",
				"propertyName": "items",
				"values": {
					"generateId": false,
					"itemType": Terrasoft.ViewItemType.CONTAINER,
					"visible": true,
					"wrapClass": ["actions-container"],
					"items": []
				}
			},
			{
				"operation": "insert",
				"parentName": "ActionButtonsContainer",
				"propertyName": "items",
				"name": "SelectButton",
				"values": {
					"generateId": false,
					"itemType": Terrasoft.ViewItemType.BUTTON,
					"style": Terrasoft.controls.ButtonEnums.style.GREEN,
					"caption": {"bindTo": "Resources.Strings.SelectButtonCaption"},
					"click": {"bindTo": "onSelectButtonClick"}
				}
			},
			{
				"operation": "insert",
				"parentName": "ActionButtonsContainer",
				"propertyName": "items",
				"name": "CancelButton",
				"values": {
					"generateId": false,
					"itemType": Terrasoft.ViewItemType.BUTTON,
					"caption": {"bindTo": "Resources.Strings.CancelButtonCaption"},
					"click": {"bindTo": "onCancelButtonClick"}
				}
			},
			{
				"operation": "insert",
				"name": "TabsContainer",
				"parentName": "MacrosPageContainer",
				"propertyName": "items",
				"values": {
					"generateId": false,
					"itemType": Terrasoft.ViewItemType.CONTAINER,
					"wrapClass": ["tabs-container"],
					"items": []
				}
			},
			{
				"operation": "insert",
				"name": "Tabs",
				"parentName": "TabsContainer",
				"propertyName": "items",
				"values": {
					"generateId": false,
					"itemType": Terrasoft.ViewItemType.TAB_PANEL,
					"activeTabName": {"bindTo": "ActiveTabName"},
					"classes": {
						"wrapClass": []
					},
					"visible": false,
					"collection": {"bindTo": "TabsCollection"},
					"tabs": []
				}
			},
			{
				"operation": "insert",
				"name": "GeneralMacrosTab",
				"parentName": "Tabs",
				"propertyName": "tabs",
				"values": {
					"generateId": false,
					"caption": {"bindTo": "Resources.Strings.GeneralMacrosTabCaption"},
					"wrapClass": ["general-tab-container"],
					"items": []
				}
			},
			{
				"operation": "insert",
				"name": "MacrosGroups",
				"parentName": "GeneralMacrosTab",
				"propertyName": "items",
				"values": {
					"generateId": false,
					"generator": "ConfigurationItemGenerator.generateContainerList",
					"idProperty": "Id",
					"collection": "MacrosGroupsCollection",
					"onGetItemConfig": "prepareMacrosGroupViewConfig",
					"classes": {
						wrapClassName: ["macros-groups"]
					},
					"isAsync": false
				}
			}
		]/**SCHEMA_DIFF*/
	};
});
