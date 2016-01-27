define("SysAdminUnitSectionV2", [
		"ConfigurationConstants", "ConfigurationEnums", "PortalRoleFilterUtilities", "SysAdminUnitSectionV2Resources",
		"GridUtilitiesV2", "css!AdministrationCSSV2", "ActualizationUtilities"
	],
	function(ConfigurationConstants, ConfigurationEnums, PortalRoleFilterUtilities) {
		return {
			entitySchemaName: "SysAdminUnit",
			contextHelpId: "259",
			diff: [
				{
					"operation": "merge",
					"name": "SectionWrapContainer",
					"values": {
						"wrapClass": ["SysAdminUnitSectionV2", "section-wrap"]
					}
				},
				{
					"operation": "remove",
					"name": "SeparateModeAddRecordButton"
				},
				{
					"operation": "remove",
					"name": "DataGridActiveRowCopyAction"
				},
				{
					"operation": "remove",
					"name": "CombinedModeAddRecordButton"
				},
				{
					"operation": "insert",
					"parentName": "CombinedModeActionButtonsSectionContainer",
					"propertyName": "items",
					"name": "CombinedModeAddButtons",
					"values": {
						"itemType": this.Terrasoft.ViewItemType.BUTTON,
						"style": this.Terrasoft.controls.ButtonEnums.style.GREEN,
						"caption": {"bindTo": "Resources.Strings.ActionButtonCaption"},
						"classes": {
							"textClass": ["actions-button-margin-right"],
							"wrapperClass": ["actions-button-margin-right"]
						},
						"visible": {"bindTo": "IsAddOrgRoleShowed"},
						"menu": []
					}
				},
				{
					"operation": "insert",
					"name": "CombinedModeAddOrganisation",
					"parentName": "CombinedModeAddButtons",
					"propertyName": "menu",
					"values": {
						"caption": {"bindTo": "Resources.Strings.AddOrganisationButtonCaption"},
						"click": {"bindTo": "onAddOrganisation"},
						"enabled": {"bindTo": "IsOrganisationShowed"}
					}
				},
				{
					"operation": "insert",
					"name": "CombinedModeAddDepartment",
					"parentName": "CombinedModeAddButtons",
					"propertyName": "menu",
					"values": {
						"caption": {"bindTo": "Resources.Strings.AddDepartmentButtonCaption"},
						"click": {"bindTo": "onAddDepartment"},
						"enabled": {"bindTo": "IsDepartmentShowed"}
					}
				},
				{
					"operation": "insert",
					"name": "CombinedModeAddCommand",
					"parentName": "CombinedModeAddButtons",
					"propertyName": "menu",
					"values": {
						"caption": {"bindTo": "Resources.Strings.AddCommandButtonCaption"},
						"click": {"bindTo": "onAddCommand"},
						"enabled": {"bindTo": "IsCommandShowed"},
						"visible": false
					}
				},
				{
					"operation": "insert",
					"name": "CombinedModeAddFuncRole",
					"parentName": "CombinedModeActionButtonsSectionContainer",
					"propertyName": "items",
					"index": 0,
					"values": {
						"itemType": this.Terrasoft.ViewItemType.BUTTON,
						"style": this.Terrasoft.controls.ButtonEnums.style.GREEN,
						"caption": {"bindTo": "Resources.Strings.ActionButtonCaption"},
						"click": {"bindTo": "onAddFuncRole"},
						"classes": {
							"textClass": ["actions-button-margin-right"],
							"wrapperClass": ["actions-button-margin-right"]
						},
						"visible": {"bindTo": "IsFuncRoleShowed"},
						"enabled": {"bindTo": "IsFuncRoleEnabled"}
					}
				},
				{
					"operation": "insert",
					"parentName": "SeparateModeActionButtonsLeftContainer",
					"propertyName": "items",
					"index": 0,
					"name": "ActionsButton",
					"values": {
						"itemType": this.Terrasoft.ViewItemType.BUTTON,
						"style": this.Terrasoft.controls.ButtonEnums.style.GREEN,
						"caption": {"bindTo": "Resources.Strings.ActionButtonCaption"},
						"visible": {"bindTo": "IsAddOrgRoleShowed"},
						"classes": {
							"textClass": ["actions-button-margin-right"],
							"wrapperClass": ["actions-button-margin-right"]
						},
						"menu": []
					}
				},
				{
					"operation": "insert",
					"name": "AddOrganisation",
					"parentName": "ActionsButton",
					"propertyName": "menu",
					"values": {
						"caption": {"bindTo": "Resources.Strings.AddOrganisationButtonCaption"},
						"click": {"bindTo": "onAddOrganisation"},
						"enabled": {"bindTo": "IsOrganisationShowed"}
					}
				},
				{
					"operation": "insert",
					"name": "AddDepartment",
					"parentName": "ActionsButton",
					"propertyName": "menu",
					"values": {
						"caption": {"bindTo": "Resources.Strings.AddDepartmentButtonCaption"},
						"click": {"bindTo": "onAddDepartment"},
						"enabled": {"bindTo": "IsDepartmentShowed"}
					}
				},
				{
					"operation": "insert",
					"name": "AddCommand",
					"parentName": "ActionsButton",
					"propertyName": "menu",
					"values": {
						"caption": {"bindTo": "Resources.Strings.AddCommandButtonCaption"},
						"click": {"bindTo": "onAddCommand"},
						"enabled": {"bindTo": "IsCommandShowed"},
						"visible": false
					}
				},
				{
					"operation": "insert",
					"name": "AddFuncRole",
					"parentName": "SeparateModeActionButtonsLeftContainer",
					"propertyName": "items",
					"index": 0,
					"values": {
						"itemType": this.Terrasoft.ViewItemType.BUTTON,
						"style": this.Terrasoft.controls.ButtonEnums.style.GREEN,
						"classes": {
							"textClass": ["actions-button-margin-right"],
							"wrapperClass": ["actions-button-margin-right"]
						},
						"caption": {"bindTo": "Resources.Strings.ActionButtonCaption"},
						"click": {"bindTo": "onAddFuncRole"},
						"visible": {"bindTo": "IsFuncRoleShowed"},
						"enabled": {"bindTo": "IsFuncRoleEnabled"}
					}
				},
				{
					"operation": "insert",
					"name": "OrganizationalRolesDataView",
					"parentName": "DataViewsContainer",
					"propertyName": "items",
					"values": {
						"itemType": this.Terrasoft.ViewItemType.SECTION_VIEW,
						"items": []
					}
				},
				{
					"operation": "insert",
					"name": "OrganizationalRolesDataGridContainer",
					"parentName": "OrganizationalRolesDataView",
					"propertyName": "items",
					"values": {
						"markerValue": "OrganizationalRolesDataGrid",
						"itemType": this.Terrasoft.ViewItemType.CONTAINER,
						"wrapClass": ["grid-dataview-container-wrapClass"],
						"items": []
					}
				},
				{
					"operation": "merge",
					"name": "DataGridContainer",
					"values": {
						"markerValue": "FuncRolesDataGrid"
					}
				},
				{
					"operation": "merge",
					"name": "DataGrid",
					"parentName": "DataGridContainer",
					"propertyName": "items",
					"values": {
						"baseOffset": 5,
						"hierarchical": true,
						"hierarchicalColumnName": "ParentRoleId",
						"expandHierarchyLevels": {"bindTo": "ExpandHierarchyLevels"},
						"updateExpandHierarchyLevels": {"bindTo": "onExpandHierarchyLevels"},
						"columnsConfig": [
							{
								"cols": 24,
								"key": [
									{
										"name": {"bindTo": "Name"}
									}
								]
							}
						]
					}
				},
				{
					"operation": "insert",
					"name": "OrganizationalRolesGrid",
					"parentName": "OrganizationalRolesDataGridContainer",
					"propertyName": "items",
					"values": {
						"id": "OrganizationalRolesGridId",
						"itemType": this.Terrasoft.ViewItemType.GRID,
						"type": {"bindTo": "GridType"},
						"listedZebra": true,
						"activeRow": {"bindTo": "OrganizationalRolesActiveRow"},
						"collection": {"bindTo": "OrganizationalRolesGridData"},
						"isEmpty": {"bindTo": "IsGridEmpty"},
						"isLoading": {"bindTo": "IsGridLoading"},
						"multiSelect": {"bindTo": "MultiSelect"},
						"primaryColumnName": "Id",
						"selectedRows": {"bindTo": "OrganizationalRolesSelectedRows"},
						"sortColumn": {"bindTo": "sortColumn"},
						"sortColumnDirection": {"bindTo": "GridSortDirection"},
						"sortColumnIndex": {"bindTo": "SortColumnIndex"},
						"selectRow": {"bindTo": "rowSelected"},
						"linkClick": {"bindTo": "linkClicked"},
						"needLoadData": {"bindTo": "needLoadData"},
						"activeRowAction": {"bindTo": "onOrganizationalRolesActiveRowAction"},
						"activeRowActions": [],
						"getEmptyMessageConfig": {"bindTo": "prepareEmptyGridMessageConfig"},
						"baseOffset": 5,
						"hierarchical": true,
						"hierarchicalColumnName": "ParentRoleId",
						"expandHierarchyLevels": {"bindTo": "ExpandHierarchyLevels"},
						"updateExpandHierarchyLevels": {"bindTo": "onExpandHierarchyLevels"},
						"columnsConfig": [
							{
								"cols": 24,
								"key": [
									{
										"name": {"bindTo": "Name"}
									}
								]
							}
						]
					}
				},
				{
					"operation": "insert",
					"name": "OrganizationalRolesGridActiveRowOpenAction",
					"parentName": "OrganizationalRolesGrid",
					"propertyName": "activeRowActions",
					"values": {
						"className": "Terrasoft.Button",
						"style": this.Terrasoft.controls.ButtonEnums.style.BLUE,
						"caption": {"bindTo": "Resources.Strings.OpenRecordGridRowButtonCaption"},
						"tag": "edit"
					}
				},
				{
					"operation": "remove",
					"name": "DataGridActiveRowDeleteAction"
				},
				{
					"operation": "remove",
					"name": "CombinedModeViewOptionsButton"
				},
				{
					"operation": "remove",
					"name": "CloseButton"
				},
				{
					"operation": "remove",
					"name": "CloseSectionButton"
				},
				{
					"operation": "merge",
					"name": "CombinedModeActionsButton",
					"values": {
						"visible": {
							"bindTo": "ShowCloseButton"
						}
					}
				},
				{
					"operation": "insert",
					"name": "CombinedModeCustomActionsButton",
					"parentName": "CombinedModeActionButtonsSectionContainer",
					"propertyName": "items",
					"index": 10,
					"values": {
						hint: {
							bindTo: "Resources.Strings.ActionButtonHint"
						},
						"itemType": this.Terrasoft.ViewItemType.BUTTON,
						"imageConfig": {"bindTo": "Resources.Images.ToolsButtonImage"},
						"style": this.Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
						"classes": {
							"wrapperClass": ["custom-tools-button-wrapper", "custom-t-btn-wrapper"],
							"menuClass": ["custom-tools-button-menu"]
						},
						"menu": {
							"items": {"bindTo": "CustomActionsButtonMenuItems"}
						}
					}
				},
				{
					"operation": "insert",
					"parentName": "CombinedModeActionButtonsSectionContainer",
					"propertyName": "items",
					"name": "InformationTooltipButton",
					"values": {
						"itemType": this.Terrasoft.ViewItemType.BUTTON,
						"style": this.Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
						"imageConfig": {"bindTo": "Resources.Images.InfoSpriteImage"},
						"classes": {
							"wrapperClass": "info-button",
							"imageClass": "info-button-image"
						},
						"visible": {"bindTo": "ShowActualizeMessage"},
						"showTooltip": true,
						"tooltipText": {"bindTo": "Resources.Strings.NeedActualizeRolesTooltip"}
					}
				},
				{
					"operation": "insert",
					"name": "SeparateModeCustomActionsButton",
					"parentName": "SeparateModeActionButtonsLeftContainer",
					"propertyName": "items",
					"index": 10,
					"values": {
						"itemType": this.Terrasoft.ViewItemType.BUTTON,
						"imageConfig": {"bindTo": "Resources.Images.ToolsButtonImage"},
						"style": this.Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
						"classes": {
							"wrapperClass": ["custom-tools-button-wrapper", "custom-t-btn-wrapper"],
							"menuClass": ["custom-tools-button-menu"]
						},
						"menu": {
							"items": {"bindTo": "CustomActionsButtonMenuItems"}
						}
					}
				},
				{
					"operation": "remove",
					"name": "SeparateModeActionsButton"
				},
				{
					"operation": "remove",
					"name": "GridUtilsContainer"
				}
			],
			messages: {
				/**
				 * Передает информацию о родителе и типе для записи.
				 */
				"SetRecordInformation": {
					mode: this.Terrasoft.MessageMode.PTP,
					direction: this.Terrasoft.MessageDirectionType.SUBSCRIBE
				},

				/**
				 * Сообщает о необходимости удалить элементы из реестра и перейти к родительскому элементу.
				 */
				"RemoveRecordAndGoToParent": {
					mode: this.Terrasoft.MessageMode.PTP,
					direction: this.Terrasoft.MessageDirectionType.SUBSCRIBE
				},

				/**
				 * Сообщает разделу о необходимости вывода сообщения об актуализации ролей.
				 */
				"NeedActualizeRoles": {
					mode: this.Terrasoft.MessageMode.BROADCAST,
					direction: this.Terrasoft.MessageDirectionType.SUBSCRIBE
				},

				/**
				 * Сообщает разделу о необходимости перезагрузить иерархический реестр.
				 */
				"UpdateSectionGrid": {
					mode: this.Terrasoft.MessageMode.BROADCAST,
					direction: this.Terrasoft.MessageDirectionType.SUBSCRIBE
				}
			},
			attributes: {

				/**
				 * Признак необходимости показа пользователю сообщения об актуализации ролей.
				 */
				"ShowActualizeMessage": {
					"dataValueType": this.Terrasoft.DataValueType.BOOLEAN
				},

				/**
				 * Название операции, доступ на которую должен быть у пользователя для использования страницы.
				 */
				"SecurityOperationName": {
					"dataValueType": this.Terrasoft.DataValueType.STRING,
					"value": "CanManageUsers"
				},

				/**
				 * Признак загрузки данных представления "Организационные роли".
				 */
				"OrganizationalRolesDataLoaded": {"dataValueType": this.Terrasoft.DataValueType.BOOLEAN},

				/**
				 * Признак загрузки данных представления "Функциональные роли".
				 */
				"FuncRolesDataLoaded": {"dataValueType": this.Terrasoft.DataValueType.BOOLEAN},

				/**
				 * Массив раскрытых элементов
				 * @type {Array}
				 */
				"ExpandHierarchyLevels": [],

				/**
				 * Массив раскрытых элементов до перезагрузки
				 * @type {Array}
				 */
				"ExpandHierarchyLevelsBeforeReload": [],

				/**
				 * Название коллекции меню выпадающего списка в функциональной кнопке.
				 */
				"CustomActionsButtonMenuItems": {
					"dataValueType": this.Terrasoft.DataValueType.COLLECTION
				},

				/**
				 * Коллекция элементов реестра представления "Организационные роли".
				 */
				"OrganizationalRolesGridData": {"dataValueType": this.Terrasoft.DataValueType.COLLECTION},

				/**
				 * Название представления "Организационные роли".
				 */
				"OrgRolesDataViewName": {
					"dataValueType": this.Terrasoft.DataValueType.TEXT,
					"value": "OrganizationalRolesDataView"
				},

				/**
				 * Флаг, показывать ли кнопку "Организацию" в меню кнопки "Добавить".
				 */
				"IsOrganisationShowed": {"dataValueType": this.Terrasoft.DataValueType.BOOLEAN},

				/**
				 * Флаг, показывать ли кнопку "Добавить" в представлении "Функциональные роли".
				 */
				"IsFuncRoleShowed": {"dataValueType": this.Terrasoft.DataValueType.BOOLEAN},

				/**
				 * Флаг, показывать ли кнопку "Подразделение" в меню кнопки "Добавить".
				 */
				"IsDepartmentShowed": {"dataValueType": this.Terrasoft.DataValueType.BOOLEAN},

				/**
				 * Флаг, показывать ли кнопку "Команду" в меню кнопки "Добавить".
				 */
				"IsCommandShowed": {"dataValueType": this.Terrasoft.DataValueType.BOOLEAN},

				/**
				 * Флаг, показывать ли кнопку "Добавить" в представлении "Организационные роли".
				 */
				"IsAddOrgRoleShowed": {"dataValueType": this.Terrasoft.DataValueType.BOOLEAN},

				/**
				 * Флаг, делать ли активной кнопку "Добавить" в представлении "Функциональные роли".
				 */
				"IsFuncRoleEnabled": {"dataValueType": this.Terrasoft.DataValueType.BOOLEAN}

			},
			mixins: {
				ActualizationUtilities: "Terrasoft.ActualizationUtilities"
			},
			methods: {

				/*
				 * Проверяет возможность удаления текущей записи (делать ли активной кнопку "Удалить" в меню кнопки
				 * "Действия").
				 * @return {boolean} возвращает true, если стоит сделать кнопку активной.
				 */
				checkOpportunityForDelete: function() {
					var row = this.getActiveRow();
					if (this.Ext.isEmpty(row)) {
						return false;
					}
					var id = row.get("Id");
					var parent = row.get("ParentRoleId");
					return !this.Ext.isEmpty(parent) && id !== ConfigurationConstants.SysAdminUnit.Id.SysAdministrators;
				},

				/**
				 * @inheritDoc GridUtilitiesV2#addItemsToGridData
				 * @overridden
				 */
				addItemsToGridData: function(dataCollection, options) {
					if (options && options.mode === "top") {
						options.mode = "child";
						options.target = this.getLastGroupId();
						this.Terrasoft.each(dataCollection.getItems(), function(item) {
							item.set("HasNesting", 1);
						}, this);
					}
					var gridData = this.getGridData();
					gridData.loadAll(dataCollection, options);
				},

				/**
				 * @inheritDoc BaseSectionV2#loadFiltersModule
				 * @overridden
				 */
				loadFiltersModule: this.Terrasoft.emptyFn,

				/**
				 * @inheritDoc GridUtilitiesV2#initQueryColumns
				 * @overridden
				 */
				initQueryColumns: function(esq) {
					this.callParent(arguments);
					this.addHierarchicalColumns(esq);
				},

				/**
				 * Возвращает имя страницы редактирования для текущего представления.
				 * @return {String} Имя страницы редактирования.
				 */
				getEditPageName: function() {
					return this.isOrganizationalRolesDataView() ? "SysAdminUnitPageV2" : "SysAdminUnitFuncRolePageV2";
				},

				/**
				 * Возвращает идентификатор последней просматриваемой группы. Если ранее никакая группа не была
				 * просмотрена, то по умолчанию откроет Все сотрудники компании.
				 * @return {String} Идентификатор группы.
				 */
				getLastGroupId: function() {
					var result = this.isOrganizationalRolesDataView()
						? this.getActiveOrgRoleId()
						: this.getActiveFuncRoleId();
					return result || ConfigurationConstants.SysAdminUnit.Id.AllEmployees;
				},

				/**
				 * Возвращает идентификатор организационной роли, которая сейчас должна быть активной.
				 * @protected
				 */
				getActiveOrgRoleId: function() {
					return this.get("OrganizationalRolesActiveRow") || this.get("OrgRolesActiveRow");
				},

				/**
				 * Возвращает идентификатор функциональной роли, которая сейчас должна быть активной.
				 * @protected
				 */
				getActiveFuncRoleId: function() {
					return this.get("ActiveRow") || this.get("FuncRolesActiveRow");
				},

				/**
				 * Загружает вложенные элементы выделенного элемента реестра.
				 * @protected
				 * @param {String} itemKey ID - выбранной группы.
				 * @param {Object} response Ответ сервера на запрос.
				 * @param {Object} callback callback - функция.
				 * @param {Boolean} isSilentMode
				 */
				loadChildItems: function(itemKey, response, callback, isSilentMode) {
					var gridData = this.getGridData();
					this.set("IsClearGridData", false);
					var collection = this.Ext.create("Terrasoft.BaseViewModelCollection");
					this.Terrasoft.each(response.collection.getItems(), function(item) {
						if (!gridData.contains(item.get("Id"))) {
							item.set("HasNesting", 1);
							collection.add(item.get("Id"), item);
						}
					}, this);
					if (collection.getCount()) {
						response.collection = collection;
						var options = {
							mode: "child",
							target: itemKey
						};
						this.onGridDataLoaded(response, options);
					} else {
						var grid = this.getCurrentGrid();
						if (this.Ext.isEmpty(grid)) {
							return;
						}
						var children = [];
						grid.getAllItemChildren(children, itemKey);
						if (children.length === 0 && !isSilentMode) {
							this.setActiveRow(itemKey);
							this.openCard(this.getEditPageName(), ConfigurationEnums.CardStateV2.EDIT,
								this.getLastGroupId());
						}
					}
					if (this.Ext.isFunction(callback)) {
						callback.call(this);
					}
				},

				/**
				 * Обрабатывает открытие иерархической группы.
				 * @protected
				 * @param {String} itemKey ID - выбранной группы.
				 * @param {Boolean} expanded Признак развернутой группы.
				 * @param {Object} callback callback - функция.
				 * @param {Boolean} isSilentMode
				 */
				onExpandHierarchyLevels: function(itemKey, expanded, callback, isSilentMode) {
					var gridData = this.getGridData();
					if (gridData.contains(itemKey) && expanded) {
						var esq = this.getGridDataESQ();
						this.initQueryColumns(esq);
						this.initQuerySorting(esq);
						this.initQueryFilters(esq);
						esq.filters.addItem(this.Terrasoft.createColumnFilterWithParameter(
							this.Terrasoft.ComparisonType.EQUAL,
							"ParentRole.Id", itemKey));
						this.initQueryEvents(esq);
						esq.execute(function(response) {
							this.destroyQueryEvents(esq);
							this.prepareResponseCollection(response.collection);
							this.toggleHierarchyFolding(itemKey, expanded);
							this.loadChildItems(itemKey, response, callback, isSilentMode);
						}, this);
					}
				},

				/**
				 * Добавляет выбранной группе реестра класс hierarchicalMinusCss/hierarchicalPlusCss,
				 * если были загружены/свернуты ее дочерние элементы.
				 * @param {String} rowId ID группы в реестре.
				 * @param {Boolean} expanded Признак, что были загружены дочерние элементы.
				 */
				toggleHierarchyFolding: function(rowId, expanded) {
					var grid = this.getCurrentGrid();
					var toggle = this.Ext.get(grid.id + grid.hierarchicalTogglePrefix + rowId);
					if (this.Ext.isEmpty(toggle)) {
						return;
					}
					if (expanded) {
						if (toggle.hasCls(grid.hierarchicalPlusCss)) {
							toggle.removeCls(grid.hierarchicalPlusCss);
						}
						toggle.addCls(grid.hierarchicalMinusCss);
					} else {
						if (toggle.hasCls(grid.hierarchicalMinusCss)) {
							toggle.removeCls(grid.hierarchicalMinusCss);
						}
						toggle.addCls(grid.hierarchicalPlusCss);
					}
				},

				/**
				 * Рекурсивно открывает все родительские группы иерархической группы.
				 * @protected
				 * @param {String} itemKey ID - выбранной группы.
				 * @param {Function} callback callback - функция.
				 */
				expandItemWithParents: function(itemKey, callback) {
					var gridData = this.getGridData();
					if (gridData.contains(itemKey)) {
						this.set("ExpandHierarchyLevels", [itemKey]);
						this.onExpandHierarchyLevels(itemKey, true, null, true);
						if (this.Ext.isFunction(callback)) {
							callback.call(this);
						}
					} else {
						var esq = this.getGridDataESQ();
						this.initQueryColumns(esq);
						this.initQuerySorting(esq);
						this.initQueryFilters(esq);
						esq.filters.addItem(this.Terrasoft.createColumnFilterWithParameter(
							this.Terrasoft.ComparisonType.EQUAL,
							"Id", itemKey));
						this.initQueryEvents(esq);
						esq.execute(function(response) {
							this.destroyQueryEvents(esq);
							this.Terrasoft.each(response.collection.getItems(), function(item) {
								var parentId = item.get("ParentRoleId");
								if (parentId && !this.Ext.isEmpty(parentId)) {
									this.expandItemWithParents(parentId, function() {
										this.expandItemWithParents(itemKey, callback);
									});
								} else if (this.Ext.isEmpty(this.getActiveRowId())) {
									var gridData = this.getGridData();
									if (gridData.contains(itemKey)) {
										this.setActiveRow(itemKey);
									}
								}
							}, this);
						}, this);
					}
				},

				/**
				 * @inheritDoc Terrasoft.GridUtilitiesV2#reloadGridColumnsConfig
				 * @overridden
				 */
				reloadGridColumnsConfig: function(doReRender) {
					var performanceManagerLabel = this.sandbox.id + "_reloadGridColumnsConfig";
					performanceManager.start(performanceManagerLabel);
					var listedConfig = {
						"type": "listed",
						"isTiled": false,
						"listedConfig": {
							"items": [
								{
									"bindTo": this.entitySchema.primaryDisplayColumn.columnPath,
									"caption": this.entitySchema.primaryDisplayColumn.caption,
									"position": {
										"column": 0,
										"colSpan": 24,
										"row": 1
									},
									"dataValueType": 1,
									"metaCaptionPath": this.entitySchema.primaryDisplayColumn.caption,
									"metaPath": this.entitySchema.primaryDisplayColumn.columnPath,
									"path": this.entitySchema.primaryDisplayColumn.columnPath
								}
							]
						}
					};
					var grid = this.getCurrentGrid();
					if (!grid) {
						performanceManager.stop(performanceManagerLabel);
						return;
					}
					grid.type = this.Terrasoft.GridType.LISTED;
					var viewGenerator = this.Ext.create("Terrasoft.ViewGenerator");
					viewGenerator.viewModelClass = this;
					var gridConfig;
					var bindings = this.Terrasoft.deepClone(grid.bindings);
					gridConfig = {
						listedConfig: listedConfig.listedConfig,
						type: listedConfig.type
					};
					viewGenerator.actualizeListedGridConfig(gridConfig);
					grid.captionsConfig = gridConfig.listedConfig.captionsConfig;
					grid.columnsConfig = gridConfig.listedConfig.columnsConfig;
					grid.listedConfig = gridConfig.listedConfig;
					grid.initBindings(gridConfig.listedConfig);
					grid.bindings = bindings;
					if (doReRender) {
						grid.clear();
						grid.prepareCollectionData();
						if (grid.rendered) {
							grid.reRender();
						}
					}
					var gridData = this.getGridData();
					if (gridData.getCount() > 0 && !this.Ext.isEmpty(grid) && grid.rendered) {
						this.expandParentGridItem(this.getActiveRowId());
					}
					performanceManager.stop(performanceManagerLabel);
				},

				/**
				 * @inheritDoc BaseSectionV2#onRender
				 * @overridden
				 */
				onRender: function() {
					var historyState = this.getHistoryStateInfo();
					var primaryId = this.getActiveRowId();
					if (historyState.operation !== "edit" || this.Ext.isEmpty(historyState.schemas[1])) {
						this.replaceHistoryForOpeningCard(ConfigurationConstants.SysAdminUnit.Id.AllEmployees, true);
					} else if (!this.Ext.isEmpty(primaryId) && historyState.primaryColumnValue !== primaryId) {
						this.openCard(this.getEditPageName(), ConfigurationEnums.CardStateV2.EDIT, primaryId);
					}
					this.callParent(arguments);
				},

				/**
				 * Выполняет замену historyState с учетом указанных параметров.
				 * @param {String} primaryId Идентификатор записи, для которой нужно открыть карточку редактирования.
				 * @param {Boolean} isSilent Указывает на то, нужно ли выполнить переход по указанному адресу.
				 * @protected
				 */
				replaceHistoryForOpeningCard: function(primaryId, isSilent) {
					var pageName = this.getCurrentPageName();
					this.sandbox.publish("ReplaceHistoryState", {
						hash: this.Terrasoft.combinePath("SectionModuleV2", this.name,
							pageName, "edit", primaryId),
						silent: isSilent,
						stateObj: {
							module: "SectionModuleV2",
							operation: "edit",
							primaryColumnValue: primaryId,
							schemas: [
								this.name,
								pageName
							],
							workAreaMode: ConfigurationEnums.WorkAreaMode.COMBINED,
							moduleId: this.sandbox.id
						}
					});
				},

				/**
				 * Вовзращает имя карточки редактирования для активного представления.
				 * @return {String} Имя карточки редактирования.
				 */
				getCurrentPageName: function() {
					return this.isOrganizationalRolesDataView() ? "SysAdminUnitPageV2" : "SysAdminUnitFuncRolePageV2";
				},

				/**
				 * @inheritDoc BaseSectionV2#onCardModuleResponse
				 * @overridden
				 * @param {Object} response
				 */
				onCardModuleResponse: function(response) {
					if (this.get("targetType") !== ConfigurationConstants.SysAdminUnit.TypeGuid.User) {
						response.action === "edit"
							? this.reloadGridData()
							: this.loadGridDataRecord(response.primaryColumnValue);
					}
				},

				/**
				 * Получает пункты меню кнопки "Вид"
				 * @inheritDoc Terrasoft.BaseSectionV2#getViewOptions
				 * @overridden
				 */
				getViewOptions: function() {
					var viewOptions = this.Ext.create("Terrasoft.BaseViewModelCollection");
					viewOptions.addItem(this.getButtonMenuItem({
						"Caption": {"bindTo": "Resources.Strings.SortMenuCaption"},
						"Items": this.get("SortColumns")
					}));
					viewOptions.addItem(this.getButtonMenuItem({
						"Caption": {"bindTo": "Resources.Strings.OpenGridSettingsCaption"},
						"Click": {"bindTo": "openGridSettings"}
					}));
					return viewOptions;
				},

				/**
				 * Обрабатывает нажатие на кнопки выделенной записи.
				 * @protected
				 * @param {String} buttonTag
				 * @param {String} primaryColumnValue
				 */
				onOrganizationalRolesActiveRowAction: function(buttonTag, primaryColumnValue) {
					switch (buttonTag) {
						case "edit":
							this.editRecord(primaryColumnValue);
							break;
						case "copy":
							this.copyRecord(primaryColumnValue);
							break;
					}
				},

				/**
				 * @inheritDoc Terrasoft.GridUtilitiesV2#onDeleted
				 * @overridden
				 */
				onDeleted: function(returnCode) {
					this.callParent(returnCode);
					if (returnCode.Success) {
						var deletedItems = this.get("deletedItems");
						if (deletedItems.length) {
							this.removeGridRecords(deletedItems);
						}
						var parent = this.get("parentRow");
						this.setActiveRow(parent);
						this.editRecord(parent);
					}
				},

				/**
				 * @inheritDoc Terrasoft.BaseSectionV2#getActiveRow
				 * @overridden
				 */
				getActiveRow: function() {
					var activeRow = null;
					var primaryColumnValue = this.getActiveRowId();
					if (primaryColumnValue) {
						var gridData = this.getGridData();
						activeRow = gridData.find(primaryColumnValue) ? gridData.get(primaryColumnValue) : null;
					}
					return activeRow;
				},

				/**
				 * Получает название страницы редактирования сущности
				 * @inheritDoc Terrasoft.BaseSectionV2#getEditPageSchemaName
				 * @overridden
				 */
				getEditPageSchemaName: function() {
					var orgRoleEditPage = "SysAdminUnitPageV2";
					var funcRoleEditPage = "SysAdminUnitFuncRolePageV2";
					if (this.isOrganizationalRolesDataView()) {
						return orgRoleEditPage;
					} else {
						return funcRoleEditPage;
					}
				},

				/**
				 * Получает представления по умолчанию.
				 * @inheritDoc Terrasoft.BaseSectionV2#getDefaultDataViews
				 * @overridden
				 */
				getDefaultDataViews: function() {
					var baseDataViews = this.callParent(arguments);
					baseDataViews = {
						UsersDataView: {
							index: 0,
							name: "UsersDataView",
							caption: this.get("Resources.Strings.UsersHeader"),
							icon: this.get("Resources.Images.UsersDataViewIcon")
						},
						OrganizationalRolesDataView: {
							index: 1,
							name: "OrganizationalRolesDataView",
							caption: this.get("Resources.Strings.OrganizationalRolesHeader"),
							icon: this.get("Resources.Images.OrgRolesIcon")
						},
						GridDataView: {
							index: 2,
							name: "GridDataView",
							caption: this.get("Resources.Strings.FunctionalRolesHeader"),
							icon: this.get("Resources.Images.FuncRolesIcon")
						}
					};
					return baseDataViews;
				},

				/**
				 * @inheritDoc Terrasoft.BaseSectionV2#changeDataView
				 * @overridden
				 */
				changeDataView: function(view) {
					if (view.tag === "UsersDataView") {
						this.moveToUsersSection();
					} else {
						this.callParent(arguments);
					}
				},

				/**
				 * Выполняет переход в раздел пользователей.
				 * @protected
				 */
				moveToUsersSection: function() {
					this.sandbox.publish("PushHistoryState", {
						hash: this.Terrasoft.combinePath("SectionModuleV2", "UsersSectionV2"),
						stateObj: {
							module: "SectionModuleV2",
							schemas: ["UsersSectionV2"],
							UsersActiveRow: this.get("UsersActiveRow"),
							FuncRolesActiveRow: this.getActiveFuncRoleId(),
							OrgRolesActiveRow: this.getActiveOrgRoleId()
						}
					});
				},

				/**
				 * @inheritDoc Terrasoft.GridUtilitiesV2#reloadGridData
				 * @overridden
				 */
				reloadGridData: function() {
					if (!this.get("IsGridLoading")) {
						var activeRow = this.getActiveRow();
						var expandedItems = this.get("ExpandHierarchyLevels");
						this.set("ActiveRowBeforeReload", activeRow);
						this.set("ExpandHierarchyLevelsBeforeReload", expandedItems);
						this.set("IsClearGridData", true);
						this.loadGridData();
					}
				},

				/**
				 * Возвращает заголовок представления реестра по умолчанию
				 * @inheritDoc Terrasoft.BaseSectionV2#getDefaultGridDataViewCaption
				 * @overridden
				 */
				getDefaultGridDataViewCaption: function() {
					var caption = this.isOrganizationalRolesDataView()
						? this.get("Resources.Strings.OrganizationalRolesHeader")
						: this.get("Resources.Strings.FunctionalRolesHeader");
					return caption;
				},

				/**
				 * Получает признак, что активное представление это "Организационные роли".
				 * @protected
				 * @return {boolean} Возвращает true, если сейчас активно представление "Организационные роли", false
				 * в противном случае.
				 */
				isOrganizationalRolesDataView: function() {
					if (this.Ext.isEmpty(this.get("ActiveViewName"))) {
						this.makeAllViewsNotActive();
						var historyState = this.getHistoryStateInfo();
						return historyState.schemas[1] !== "SysAdminUnitFuncRolePageV2";
					}
					return (this.get("ActiveViewName") === this.get("OrgRolesDataViewName"));
				},

				/**
				 * Получает список представлений раздела и делает их не активными.
				 * @protected
				 */
				makeAllViewsNotActive: function() {
					var dataViews = this.get("DataViews");
					if (dataViews) {
						dataViews.each(function(dataView) {
							dataView.active = false;
						}, this);
					}
				},

				/**
				 * @inheritDoc Terrasoft.BaseSectionV2#getActiveViewName
				 * @overridden
				 */
				getActiveViewName: function() {
					var activeViewName = this.isOrganizationalRolesDataView()
							? this.get("OrgRolesDataViewName")
							: this.get("GridDataViewName");
					var dataViews = this.get("DataViews");
					if (dataViews) {
						dataViews.each(function(dataView) {
							if (dataView.active) {
								activeViewName = dataView.name;
							}
						}, this);
					}
					return activeViewName;
				},

				/**
				 * @inheritDoc Terrasoft.GridUtilitiesV2#onGridDataLoaded
				 * @overridden
				 */
				onGridDataLoaded: function(response, options) {
					var gridData = this.getGridData();
					var recordsCount = gridData.getCount();
					var isClearGridData = this.get("IsClearGridData");
					if ((recordsCount > 0) && isClearGridData) {
						gridData.clear();
						this.set("IsClearGridData", false);
					}
					var performanceManagerLabel = this.sandbox.id + "_onGridDataLoaded";
					performanceManager.start(performanceManagerLabel);
					this.afterLoadGridData();
					if (!response.success) {
						performanceManager.stop(performanceManagerLabel);
						return;
					}
					var dataCollection = response.collection;
					this.prepareResponseCollection(dataCollection);
					this.Terrasoft.each(dataCollection.getItems(), function(item) {
						item.set("HasNesting", 1);
					}, this);
					this.initIsGridEmpty(dataCollection);
					this.addItemsToGridData(dataCollection, options);
					performanceManager.stop(performanceManagerLabel);
				},

				/**
				 * Добавляет в экземпляр запроса колонки для построения иерархии.
				 * @protected
				 * @param {Terrasoft.EntitySchemaQuery} esq Запрос, в который будут добавлены колонки.
				 */
				addHierarchicalColumns: function(esq) {
					if (!esq.columns.contains("ParentRoleId")) {
						esq.addColumn("ParentRole.Id", "ParentRoleId");
					}
					if (!esq.columns.contains("ParentRole")) {
						esq.addColumn("ParentRole");
					}
				},

				/**
				 * @inheritDoc Terrasoft.BaseSectionV2#initQuerySorting
				 * @overridden
				 */
				initQuerySorting: function(esq) {
					var gridDataColumns = this.getGridDataColumns();
					var primaryDisplayColumnName = this.entitySchema.primaryDisplayColumnName;
					this.Terrasoft.each(gridDataColumns, function(column) {
						if (primaryDisplayColumnName === column.path) {
							var sortedColumn = esq.columns.collection.get(column.path);
							sortedColumn.orderPosition = 1;
							sortedColumn.orderDirection = this.Terrasoft.OrderDirection.ASC;
						}
					}, this);
				},

				/**
				 * @inheritDoc Terrasoft.BaseSectionV2#loadGridData
				 * @overridden
				 */
				loadGridData: function() {
					if (this.get("IsGridLoading") === true) {
						return;
					}
					var performanceManagerLabel = this.sandbox.id + "_loadGridData";
					performanceManager.start(performanceManagerLabel);
					this.beforeLoadGridData();
					var esq = this.getGridDataESQ();
					this.initQueryColumns(esq);
					this.initQuerySorting(esq);
					this.initQueryFilters(esq);
					esq.filters.addItem(this.Terrasoft.createColumnIsNullFilter("ParentRole"));
					this.initQueryOptions(esq);
					this.initQueryEvents(esq);
					this.setGridDataLoaded();
					esq.getEntityCollection(function(response) {
						this.destroyQueryEvents(esq);
						performanceManager.stop(performanceManagerLabel);
						this.onGridDataLoaded(response);
						var rootIds = response.collection.getKeys();
						this.Terrasoft.each(rootIds, function(item) {
							this.set("ExpandHierarchyLevels", [item]);
							this.onExpandHierarchyLevels(item, true, null, true);
						}, this);
						var itemsToExpand = this.get("ExpandHierarchyLevelsBeforeReload");
						if (itemsToExpand) {
							itemsToExpand = itemsToExpand.reverse();
							this.Terrasoft.each(itemsToExpand, function(item) {
								this.expandItemWithParents(item);
							}, this);
						}
					}, this);
				},

				/**
				 * Устанавливает признак загразки данных реестра.
				 * @protected
				 */
				setGridDataLoaded: function() {
					if (this.isOrganizationalRolesDataView()) {
						this.set("OrganizationalRolesDataLoaded", true);
					} else {
						this.set("FuncRolesDataLoaded", true);
					}
				},

				/**
				 * Возвращает список типов ролей для фильтрации.
				 * @private
				 * @return {Array} Возвращает список типов ролей.
				 */
				getSysAdminUnitTypeList: function() {
					return [
						ConfigurationConstants.SysAdminUnit.Type.Organisation,
						ConfigurationConstants.SysAdminUnit.Type.Department,
						ConfigurationConstants.SysAdminUnit.Type.Team
					];
				},

				/**
				 * Возвращает группу фильтров для получения функциональных ролей.
				 * @return {Terrasoft.FilterGroup} Группа фильтров.
				 */
				getFunctionalRolesFilter: function() {
					var filterGroup = this.Terrasoft.createFilterGroup();
					filterGroup.logicalOperation = this.Terrasoft.LogicalOperatorType.OR;
					filterGroup.addItem(this.Terrasoft.createColumnFilterWithParameter(
						this.Terrasoft.ComparisonType.EQUAL,
						"SysAdminUnitTypeValue",
						ConfigurationConstants.SysAdminUnit.Type.FuncRole));
					filterGroup.addItem(this.Terrasoft.createColumnFilterWithParameter(
						this.Terrasoft.ComparisonType.EQUAL,
						"Id",
						ConfigurationConstants.SysAdminUnit.Id.AllEmployees));
					return filterGroup;
				},

				/**
				 * Проверяет по ключу наличие фильтра и если он найден, то удаляет этот фильтр.
				 * @param {Object} filters Набор фильтров.
				 * @param {String} key Имя фильтра.
				 */
				tryRemoveFilter: function(filters, key) {
					if (filters.contains(key)) {
						filters.removeByKey(key);
					}
				},

				/**
				 * Возвращает список фильтров, примененных в разделе.
				 * @inheritDoc Terrasoft.BaseSectionV2#getFilters
				 * @overridden
				 */
				getFilters: function() {
					var filters = this.callParent(arguments);
					if (this.isOrganizationalRolesDataView()) {
						this.tryRemoveFilter(filters, "FunctionalRolesFilter");
						if (!filters.contains("OrganizationalRolesFilter")) {
							var roles = this.getSysAdminUnitTypeList();
							var orgRolesFilter = PortalRoleFilterUtilities.getSysAdminUnitFilterGroup(roles);
							filters.add("OrganizationalRolesFilter", orgRolesFilter);
						}
					} else {
						this.tryRemoveFilter(filters, "OrganizationalRolesFilter");
						if (!filters.contains("FunctionalRolesFilter")) {
							var functionalRolesFilter = this.getFunctionalRolesFilter();
							filters.add("FunctionalRolesFilter", functionalRolesFilter);
						}
					}
					return filters;
				},

				/**
				 * @inheritDoc Terrasoft.BaseSectionV2#rowSelected
				 * @overridden
				 */
				rowSelected: function(primaryColumnValue) {
					this.filtrateAdditionButtons(primaryColumnValue);
					var gridData = this.getGridData();
					var currentGrid = this.getCurrentGrid();
					if (gridData.getCount() === 0 || this.Ext.isEmpty(currentGrid) || currentGrid.rendered === false) {
						return;
					}
					this.callParent(arguments);
				},

				/**
				 * @inheritdoc GridUtilitiesV2#getGridDataColumns
				 * @overridden
				 */
				getGridDataColumns: function() {
					var config = this.callParent(arguments);
					config.SysAdminUnitTypeValue = {path: "SysAdminUnitTypeValue"};
					config.ConnectionType = {path: "ConnectionType"};
					return config;
				},

				/**
				 * Устанавливает значения по умолчанию для аттрибутов, использующихся для определения активности
				 * кнопок добавления.
				 * @private
				 */
				prepareAdditionButtons: function(isOrgRoleView) {
					this.set("IsAddOrgRoleShowed", isOrgRoleView);
					this.set("IsFuncRoleShowed", !isOrgRoleView);
					this.set("IsOrganisationShowed", false);
					this.set("IsDepartmentShowed", false);
					this.set("IsCommandShowed", false);
					this.set("IsFuncRoleEnabled", false);
				},

				/**
				 * По id записи узнает ее тип и отображает только нужные кнопки добавления.
				 * @protected
				 */
				filtrateAdditionButtons: function(primaryColumnValue) {
					var isOrgRoleView = this.isOrganizationalRolesDataView();
					if (this.Ext.isEmpty(primaryColumnValue)) {
						return;
					}
					if (this.getGridData().contains(primaryColumnValue)) {
						this.prepareAdditionButtons(isOrgRoleView);
						if (primaryColumnValue === ConfigurationConstants.SysAdminUnit.Id.PortalUsers) {
							return;
						}
						var row = this.getGridData().get(primaryColumnValue);
						var type = !isOrgRoleView
							? ConfigurationConstants.SysAdminUnit.Type.FuncRole
							: row.get("SysAdminUnitTypeValue");
						switch (type) {
							case ConfigurationConstants.SysAdminUnit.Type.Organisation:
								this.set("IsOrganisationShowed", true);
								this.set("IsDepartmentShowed", true);
								this.set("IsCommandShowed", true);
								break;
							case ConfigurationConstants.SysAdminUnit.Type.Department:
								this.set("IsDepartmentShowed", true);
								this.set("IsCommandShowed", true);
								break;
							case ConfigurationConstants.SysAdminUnit.Type.FuncRole:
								this.set("IsFuncRoleEnabled", true);
								break;
						}
					}
				},

				/**
				 * Обработчик события нажатия на кнопку "Добавить Организацию".
				 * @protected
				 */
				onAddOrganisation: function() {
					this.createRecord(ConfigurationConstants.SysAdminUnit.TypeGuid.Organisation,
						"SysAdminUnitPageV2");
				},

				/**
				 * Обработчик события нажатия на кнопку "Добавить Подразделение".
				 * @protected
				 */
				onAddDepartment: function() {
					this.createRecord(ConfigurationConstants.SysAdminUnit.TypeGuid.Department,
						"SysAdminUnitPageV2");
				},

				/**
				 * Обработчик события нажатия на кнопку "Добавить Команду".
				 * @protected
				 */
				onAddCommand: function() {
					this.createRecord(ConfigurationConstants.SysAdminUnit.TypeGuid.Team,
						"SysAdminUnitPageV2");
				},

				/**
				 * Обработчик события нажатия на кнопку "Добавить Функциональную роль".
				 * @protected
				 */
				onAddFuncRole: function() {
					this.createRecord(ConfigurationConstants.SysAdminUnit.TypeGuid.FuncRole,
						"SysAdminUnitFuncRolePageV2");
				},

				/**
				 * Открывает нужную страницу редактирования для создания новой роли.
				 * @param {String} type id из таблицы SysAdminUnitType, указывает тип для создаваемой записи.
				 * @param {String} schemaName Имя страницы редактирования для создаваемого объекта.
				 */
				createRecord: function(type, schemaName) {
					this.set("targetType", type);
					this.openCardInChain({
						schemaName: schemaName,
						operation: ConfigurationEnums.CardStateV2.ADD,
						moduleId: this.getChainCardModuleSandboxId(this.Terrasoft.GUID_EMPTY)
					});
				},

				/**
				 * @inheritDoc Terrasoft.BaseSectionV2#onCardRendered
				 * @overridden
				 */
				onCardRendered: function() {
					this.set("ShowGridMask", false);
					var activeRow = this.getActiveRow();
					if (!activeRow) {
						var gridData = this.getGridData();
						var historyStateInfo = this.getHistoryStateInfo();
						var primaryColumnValue = historyStateInfo.primaryColumnValue;
						if (gridData.contains(primaryColumnValue)) {
							this.setActiveRow(primaryColumnValue);
						} else {
							this.expandItemWithParents(primaryColumnValue, function() {
								this.setActiveRow(primaryColumnValue);
							});
						}
					}
					this.ensureActiveRowVisible();
					var cardScrollTop = this.get("CardScrollTop");
					if (cardScrollTop !== null) {
						this.Ext.getBody().dom.scrollTop = cardScrollTop;
						this.Ext.getDoc().dom.documentElement.scrollTop = cardScrollTop;
					}
					var deleteButtonEnable = this.checkOpportunityForDelete();
					this.set("DeleteButtonEnable", deleteButtonEnable);
				},

				/**
				 * @inheritDoc Terrasoft.BaseSectionV2#getPrimaryColumnValue
				 * @overridden
				 */
				getPrimaryColumnValue: function() {
					return this.getActiveRow();
				},

				/**
				 * @inheritDoc Terrasoft.GridUtilitiesV2#setActiveRow
				 * @overridden
				 */
				setActiveRow: function(value) {
					if (this.isOrganizationalRolesDataView()) {
						this.set("OrganizationalRolesActiveRow", value);
					} else {
						this.set("ActiveRow", value);
					}
				},

				/**
				 * @inheritDoc Terrasoft.GridUtilitiesV2#unSelectRecords
				 * @overridden
				 */
				unSelectRecords: function() {
					if (this.isOrganizationalRolesDataView()) {
						this.set("OrganizationalRolesSelectedRows", []);
					} else {
						this.set("SelectedRows", []);
					}
				},

				/**
				 * @inheritDoc Terrasoft.GridUtilitiesV2#deselectRows
				 * @overridden
				 */
				deselectRows: function() {
					if (this.isOrganizationalRolesDataView()) {
						this.set("OrganizationalRolesActiveRow", null);
						this.set("OrganizationalRolesSelectedRows", []);
					} else {
						this.set("ActiveRow", null);
						this.set("SelectedRows", []);
					}
				},

				/**
				 * @inheritDoc Terrasoft.GridUtilitiesV2#getSelectedItems
				 * @overridden
				 */
				getSelectedItems: function() {
					var isMultiSelect = this.get("MultiSelect");
					var result = null;
					if (isMultiSelect) {
						result = this.getSelectedRows();
					} else {
						var activeRow = this.getActiveRowId();
						if (activeRow) {
							result = [activeRow];
						}
					}
					return result;
				},

				/**
				 * Возвращает id выбранного элемента
				 * @protected
				 * @return {String} Возвращает id выбранного элемента
				 */
				getActiveRowId: function() {
					return this.isOrganizationalRolesDataView()
						? this.get("OrganizationalRolesActiveRow")
						: this.get("ActiveRow");
				},

				/**
				 * Возвращает коллекцию выбранных элементов
				 * @protected
				 * @return {Array} Возвращает массив выбранных элементов
				 */
				getSelectedRows: function() {
					return this.isOrganizationalRolesDataView()
						? this.get("OrganizationalRolesSelectedRows")
						: this.get("SelectedRows");
				},

				/**
				 * @inheritDoc Terrasoft.BaseSectionV2#afterLoadGridDataUserFunction
				 * @overridden
				 */
				afterLoadGridDataUserFunction: function(primaryColumnValue) {
					this.rowSelected(primaryColumnValue);
					this.setActiveRow(primaryColumnValue);
					this.expandParentGridItem(primaryColumnValue);
				},

				/**
				 * Выполняет раскрытие родительского элемента иерархичесого реестра для целевого элемента.
				 * @param {String} primaryColumnValue Идентификатор записи в иерархическом реестре, родительский
				 * элемент которой нужно расхлопнуть.
				 * @protected
				 */
				expandParentGridItem: function(primaryColumnValue) {
					var grid = this.getCurrentGrid();
					if (this.Ext.isEmpty(grid)) {
						return;
					}
					var gridData = this.getGridData();
					var row = gridData.collection.getByKey(primaryColumnValue);
					var parentId = row.get("ParentRoleId");
					var toggle = this.Ext.get(grid.id + grid.hierarchicalTogglePrefix + parentId);
					if (toggle && toggle.hasCls(grid.hierarchicalPlusCss)) {
						grid.toggleHierarchyFolding(parentId);
					}
				},

				/**
				 * Загружает данные в реестр текущего представления.
				 * @inheritDoc Terrasoft.BaseSectionV2#loadActiveViewData
				 * @overridden
				 */
				loadActiveViewData: function() {
					this.loadGridData();
				},

				/**
				 * Возвращает признак загрузки данных реестра.
				 * @return {Boolean} Признак загрузки данных реестра.
				 */
				getNeedLoadData: function() {
					var needLoadData = true;
					if (this.isOrganizationalRolesDataView()) {
						needLoadData = !this.get("OrganizationalRolesDataLoaded");
					} else {
						needLoadData = !this.get("FuncRolesDataLoaded");
					}
					return needLoadData;
				},

				/**
				 * @inheritDoc BaseSectionV2#loadView
				 * @overridden
				 */
				loadView: function(dataViewName, loadData) {
					this.set("ActiveViewName", dataViewName);
					this.saveActiveViewNameToProfile(dataViewName);
					if (this.Ext.get("SysAdminUnitSectionV2Container")) {
						this.openCard(this.getEditPageName(), ConfigurationEnums.CardStateV2.EDIT,
							this.getLastGroupId());
					}
					this.getActiveViewGridSettingsProfile(function() {
						this["load" + dataViewName](this.getNeedLoadData());
					}, this);
				},

				/**
				 * @inheritDoc Terrasoft.BaseSectionV2#loadGridDataView
				 * @overridden
				 */
				loadGridDataView: function() {
					this.set("IsClearGridData", true);
					this.callParent(arguments);
				},

				/**
				 * Загружает представление Организационные роли.
				 * @protected
				 * @param {Boolean} loadData Флаг загрузки данных.
				 */
				loadOrganizationalRolesDataView: function(loadData) {
					this.set("IsClearGridData", true);
					if (loadData) {
						this.loadGridData();
					}
				},

				/**
				 * Получает коллекцию реестра.
				 * @inheritDoc Terrasoft.BaseSectionV2#getGridData
				 * @overridden
				 */
				getGridData: function() {
					if (!this.isOrganizationalRolesDataView()) {
						return this.get("GridData");
					} else {
						return this.get("OrganizationalRolesGridData");
					}
				},

				/**
				 * Получает имя реестра
				 * @inheritDoc Terrasoft.BaseSectionV2#getDataGridName
				 * @overridden
				 */
				getDataGridName: function(gridType) {
					var dataGridName = this.callParent(arguments);
					if (this.isOrganizationalRolesDataView()) {
						dataGridName = "OrganizationalRolesGridData";
					}
					if (gridType) {
						if (gridType === "vertical") {
							dataGridName += "VerticalProfile";
						}
					} else {
						var isCardVisible = this.get("IsCardVisible");
						if (isCardVisible === true) {
							dataGridName += "VerticalProfile";
						}
					}
					return dataGridName;
				},

				/**
				 * Возвращает реестр раздела, в соответствии с текущим представлением.
				 * @inheritDoc Terrasoft.BaseSectionV2#getCurrentGrid
				 * @overridden
				 */
				getCurrentGrid: function() {
					return this.isOrganizationalRolesDataView()
						? this.Ext.getCmp("OrganizationalRolesGridId")
						: this.Ext.getCmp(this.name + "DataGridGrid");
				},

				/**
				 * Делает активным указанное представление. Инициирует его загрузку.
				 * Инициализирует дополнительную загрузку настроек реестра
				 * @inheritDoc Terrasoft.BaseSectionV2#setActiveView
				 * @overridden
				 */
				setActiveView: function(activeViewName, loadData) {
					this.initSortActionItems();
					this.showBodyMask();
					if (!this.get("IsCardVisible")) {
						this.hideCard();
					}
					var dataViews = this.get("DataViews");
					dataViews.each(function(dataView) {
						var isViewActive = (dataView.name === activeViewName);
						this.setViewVisible(dataView, isViewActive);
					}, this);
					this.loadView(activeViewName, loadData);
					this.filtrateAdditionButtons(this.getActiveRowId());
				},

				/**
				 * Инициализирует коллекцию данных представления рееестра.
				 * @protected
				 */
				initOrganizationalRolesGridData: function() {
					this.set("OrganizationalRolesGridData", this.Ext.create("Terrasoft.BaseViewModelCollection"));
					var gridData = this.get("OrganizationalRolesGridData");
					gridData.on("dataLoaded", this.onGridLoaded, this);

				},

				/**
				 * Выполняет подписки на сообщения.
				 * @private
				 */
				subscribeEvents: function() {
					this.sandbox.subscribe("SetRecordInformation", function() {
						var activeRow = this.getActiveRow();
						return {
							parent: this.getActiveRowId(),
							type: this.get("targetType"),
							connectionType: activeRow.get("ConnectionType")
						};
					}, this, [
						this.getChainCardModuleSandboxId(this.Terrasoft.GUID_EMPTY),
						this.getCardModuleSandboxId()
					]);

					this.sandbox.subscribe("RemoveRecordAndGoToParent", function(data) {
						this.set("deletedItems", data.deletedItems);
						this.set("parentRow", data.parent);
						this.set("IsConfirmedDelete", data.IsConfirmedDelete);
						this.deleteRecords();
					}, this, [
						this.getChainCardModuleSandboxId(this.Terrasoft.GUID_EMPTY),
						this.getCardModuleSandboxId()
					]);

					this.sandbox.subscribe("NeedActualizeRoles", function() {
						this.saveShowActualizeMessageInProfile(true);
					}, this);

					this.sandbox.subscribe("UpdateSectionGrid", function() {
						this.reloadGridData();
					}, this);
				},

				/**
				 * @inheritDoc Terrasoft.GridUtilitiesV2#checkCanDeleteCallback
				 * @overridden
				 */
				checkCanDeleteCallback: function(result) {
					if (result) {
						this.showInformationDialog(resources.localizableStrings[result]);
						return;
					}
					if (this.get("IsConfirmedDelete") === true) {
						this.onDelete(this.Terrasoft.MessageBoxButtons.YES.returnCode);
						return;
					}
					this.showConfirmationDialog(this.get("Resources.Strings.DeleteConfirmationMessage"),
						function(returnCode) {
							this.onDelete(returnCode);
						},
						[
							this.Terrasoft.MessageBoxButtons.YES.returnCode,
							this.Terrasoft.MessageBoxButtons.NO.returnCode
						],
						null);
				},

				/**
				 * @inheritDoc Terrasoft.BaseSectionV2#init
				 * @overridden
				 */
				init: function() {
					this.subscribeEvents();
					this.initOrganizationalRolesGridData();
					this.callParent(arguments);
					this.initCustomActionsButtonMenuItems();
					this.initCustomUserProfileData(this.setShowActualizeMessageFromProfile, this);
					this.setActiveRowsForViewFromHistoryState();
				},

				/**
				 * @inheritDoc Terrasoft.GridUtilitiesV2#getIsLinkColumn
				 * @overridden
				 */
				getIsLinkColumn: function() {
					return false;
				},

				/**
				 * Получает из истории активные записи в реестрах представлений и проставляет их для текущего раздела.
				 * @protected
				 */
				setActiveRowsForViewFromHistoryState: function() {
					var state = this.sandbox.publish("GetHistoryState").state;
					this.set("UsersActiveRow", state.UsersActiveRow);
					this.set("FuncRolesActiveRow", state.FuncRolesActiveRow);
					this.set("OrgRolesActiveRow", state.OrgRolesActiveRow);
				},

				/**
				 * Устанавливает идентификатор контекстной справки.
				 * @protected
				 */
				initContextHelp: function() {
					this.set("ContextHelpId", 259);
					this.callParent(arguments);
				},

				/**
				 * Возвращает коллекцию действий раздела.
				 * @protected
				 * @return {Terrasoft.BaseViewModelCollection} Возвращает коллекцию действий раздела в режиме.
				 * отображения реестра
				 */
				getCustomSectionActions: function() {
					var actionMenuItems = this.Ext.create("Terrasoft.BaseViewModelCollection");
					actionMenuItems.addItem(this.getActualizeAdminUnitInRoleButton());
					return actionMenuItems;
				},

				/**
				 * Инициализирует коллекцию действий раздела.
				 * @protected
				 */
				initCustomActionsButtonMenuItems: function() {
					this.set("CustomActionsButtonMenuItems", this.getCustomSectionActions());
				}
			}
		};
	});
