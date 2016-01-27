define("UsersSectionV2", [
		"ConfigurationConstants", "ConfigurationEnums", "PortalRoleFilterUtilities", "UsersSectionV2Resources",
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
						"wrapClass": ["UsersSectionV2", "section-wrap"]
					}
				},
				{
					"operation": "insert",
					"parentName": "CombinedModeActionButtonsSectionContainer",
					"propertyName": "items",
					"name": "CombinedModeAddOnlyEmployeeButton",
					"values": {
						"itemType": Terrasoft.ViewItemType.BUTTON,
						"style": Terrasoft.controls.ButtonEnums.style.GREEN,
						"caption": {"bindTo": "Resources.Strings.AddRecordButtonCaption"},
						"classes": {
							"textClass": ["actions-button-margin-right"],
							"wrapperClass": ["actions-button-margin-right"]
						},
						"visible": {"bindTo": "ShowAddOnlyEmployee"},
						"click": {"bindTo": "onAddOurCompanyUser"}
					}
				},
				{
					"operation": "merge",
					"parentName": "CombinedModeActionButtonsSectionContainer",
					"propertyName": "items",
					"name": "CombinedModeAddRecordButton",
					"values": {
						"itemType": Terrasoft.ViewItemType.BUTTON,
						"style": Terrasoft.controls.ButtonEnums.style.GREEN,
						"caption": {"bindTo": "Resources.Strings.AddRecordButtonCaption"},
						"classes": {
							"textClass": ["actions-button-margin-right"],
							"wrapperClass": ["actions-button-margin-right"]
						},
						"menu": [],
						"controlConfig": {},
						"visible": {"bindTo": "ShowAddPortalUser"}
					}
				},
				{
					"operation": "insert",
					"name": "CombinedModeAddPortalUser",
					"parentName": "CombinedModeAddRecordButton",
					"propertyName": "menu",
					"values": {
						"caption": {"bindTo": "Resources.Strings.AddPortalUserButtonCaption"},
						"click": {"bindTo": "onAddPortalUser"}
					}
				},
				{
					"operation": "insert",
					"name": "CombinedModeAddOurCompanyUser",
					"parentName": "CombinedModeAddRecordButton",
					"propertyName": "menu",
					"values": {
						"caption": {"bindTo": "Resources.Strings.AddOurCompanyUserButtonCaption"},
						"click": {"bindTo": "onAddOurCompanyUser"}
					}
				},
				{
					"operation": "insert",
					"parentName": "SeparateModeActionButtonsLeftContainer",
					"propertyName": "items",
					"name": "SeparateModeAddOnlyEmployeeButton",
					"index": 0,
					"values": {
						"itemType": Terrasoft.ViewItemType.BUTTON,
						"style": Terrasoft.controls.ButtonEnums.style.GREEN,
						"caption": {"bindTo": "Resources.Strings.AddRecordButtonCaption"},
						"classes": {
							"textClass": ["actions-button-margin-right"],
							"wrapperClass": ["actions-button-margin-right"]
						},
						"visible": {"bindTo": "ShowAddOnlyEmployee"},
						"click": {"bindTo": "onAddOurCompanyUser"}
					}
				},
				{
					"operation": "merge",
					"parentName": "CombinedModeActionButtonsSectionContainer",
					"propertyName": "items",
					"name": "SeparateModeAddRecordButton",
					"values": {
						"itemType": Terrasoft.ViewItemType.BUTTON,
						"style": Terrasoft.controls.ButtonEnums.style.GREEN,
						"caption": {"bindTo": "Resources.Strings.AddRecordButtonCaption"},
						"classes": {
							"textClass": ["actions-button-margin-right"],
							"wrapperClass": ["actions-button-margin-right"]
						},
						"menu": [],
						"controlConfig": {},
						"visible": {"bindTo": "ShowAddPortalUser"}
					}
				},
				{
					"operation": "insert",
					"name": "SeparateModeAddPortalUser",
					"parentName": "SeparateModeAddRecordButton",
					"propertyName": "menu",
					"values": {
						"caption": {"bindTo": "Resources.Strings.AddPortalUserButtonCaption"},
						"click": {"bindTo": "onAddPortalUser"}
					}
				},
				{
					"operation": "insert",
					"name": "SeparateModeAddOurCompanyUser",
					"parentName": "SeparateModeAddRecordButton",
					"propertyName": "menu",
					"values": {
						"caption": {"bindTo": "Resources.Strings.AddOurCompanyUserButtonCaption"},
						"click": {"bindTo": "onAddOurCompanyUser"}
					}
				},
				{
					"operation": "remove",
					"name": "DataGridActiveRowCopyAction"
				},
				{
					"operation": "remove",
					"name": "CombinedModeActionsButton"
				},
				{
					"operation": "remove",
					"name": "CombinedModeViewOptionsButton"
				},
				{
					"operation": "insert",
					"parentName": "CombinedModeActionButtonsSectionContainer",
					"propertyName": "items",
					"name": "ActionsButtonCombinedMode",
					"values": {
						"itemType": Terrasoft.ViewItemType.BUTTON,
						"caption": {"bindTo": "Resources.Strings.ActionsButtonCaption"},
						"classes": {
							"textClass": ["actions-button-margin-right"],
							"wrapperClass": ["actions-button-margin-right"]
						},
						"menu": [],
						"controlConfig": {},
						"visible": {
							"bindTo": "CombinedModeActionsButtonVisible"
						}
					}
				},
				{
					"operation": "insert",
					"name": "CombinedModeActualize",
					"parentName": "ActionsButtonCombinedMode",
					"propertyName": "menu",
					"values": {
						"caption": {"bindTo": "Resources.Strings.ActualizeOrgStructureButtonCaption"},
						"click": {"bindTo": "onActualizeAdminUnitInRole"}
					}
				},
				{
					"operation": "insert",
					"parentName": "CombinedModeActionButtonsSectionContainer",
					"propertyName": "items",
					"name": "CombinedInformationTooltipButton",
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
					"parentName": "SeparateModeActionButtonsLeftContainer",
					"propertyName": "items",
					"name": "SeparateInformationTooltipButton",
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
				}
			],
			attributes: {
				/**
				 * Признак необходимости показа пользователю кнопки с меню для добавления пользователей.
				 */
				"ShowAddPortalUser": {
					"dataValueType": this.Terrasoft.DataValueType.BOOLEAN,
					"value": false
				},

				/**
				 * Признак необходимости показа пользователю кнопки только для добавления сотрудников компании.
				 */
				"ShowAddOnlyEmployee": {
					"dataValueType": this.Terrasoft.DataValueType.BOOLEAN,
					"value": false
				},

				/**
				 * Признак необходимости показа пользователю сообщения об актуализации ролей.
				 */
				"ShowActualizeMessage": {
					"dataValueType": this.Terrasoft.DataValueType.BOOLEAN
				}
			},
			messages: {
				/**
				 * Сообщает разделу о необходимости вывода сообщения об актуализации ролей.
				 */
				"NeedActualizeRoles": {
					mode: this.Terrasoft.MessageMode.BROADCAST,
					direction: this.Terrasoft.MessageDirectionType.SUBSCRIBE
				},

				/**
				 * Передает информацию о родителе и типе для записи.
				 */
				"SetRecordInformation": {
					mode: this.Terrasoft.MessageMode.PTP,
					direction: this.Terrasoft.MessageDirectionType.SUBSCRIBE
				}
			},
			mixins: {
				ActualizationUtilities: "Terrasoft.ActualizationUtilities"
			},
			methods: {
				/**
				* @inheritDoc Terrasoft.BaseSectionV2#init
				* @overridden
				*/
				init: function() {
					this.callParent(arguments);
					this.subscribeEvents();
					this.updateAddButtonVisibility();
					this.initCustomUserProfileData(this.setShowActualizeMessageFromProfile, this);
				},

				/**
				 * Выполняет проверку на активность записи Пользователи портала. Если запись активна, то стоит
				 * отобразить кнопку для добавления пользователей портала и сотрудников компании. Если нет, то будет
				 * показана только кнопка для добавления сотрудника компании.
				 * @protected
				 */
				updateAddButtonVisibility: function() {
					var esq = this.Ext.create("Terrasoft.EntitySchemaQuery", {
						rootSchemaName: "VwSysAdminUnit"
					});
					esq.addColumn("Id");
					esq.filters.add("PortalFilter", PortalRoleFilterUtilities.getPortalFilterGroup());
					esq.getEntityCollection(this.handleUpdateAddButtonVisibilityResponse, this);
				},

				/**
				 * Выполняет обработу ответа сервера. Если запись была найдена, то стоит отобразить кнопку для
				 * добавления пользователей портала и сотрудников компании. Если нет, то будет показана только кнопка
				 * для добавления сотрудника компании.
				 * @param {Object} response Объект, содержащий ответ сервера.
				 * @protected
				 */
				handleUpdateAddButtonVisibilityResponse: function(response) {
					if (response && response.success) {
						var propertyName = response.collection.isEmpty() ? "ShowAddOnlyEmployee" : "ShowAddPortalUser";
						this.set(propertyName, true);
					}
				},

				/**
				 * @inheritdoc GridUtilitiesV2#getGridDataColumns
				 * @overridden
				 */
				getGridDataColumns: function() {
					var config = this.callParent(arguments);
					config.ConnectionType = {path: "ConnectionType"};
					return config;
				},

				/**
				 * Выполняет подписки на сообщения.
				 * @private
				 */
				subscribeEvents: function() {
					this.sandbox.subscribe("SetRecordInformation", function() {
						var targetParent = this.get("TargetParent");
						if (this.Ext.isEmpty(targetParent)) {
							return;
						}
						return {
							parent: targetParent,
							defaultValues: this.get("defaultValues")
						};
					}, this, [
						this.getChainCardModuleSandboxId(this.Terrasoft.GUID_EMPTY),
						this.getCardModuleSandboxId()
					]);
					this.sandbox.subscribe("NeedActualizeRoles", function() {
						this.saveShowActualizeMessageInProfile(true);
					}, this);
				},

				/**
				 * @inheritDoc Terrasoft.GridUtilitiesV2#addItemsToGridData
				 * @overridden
				 */
				addItemsToGridData: function() {
					this.callParent(arguments);
					this.setActiveRowsForViewFromHistoryState();
				},

				/**
				 * Получает из истории активные записи в реестрах представлений и проставляет их для текущего раздела.
				 * @protected
				 */
				setActiveRowsForViewFromHistoryState: function() {
					var state = this.sandbox.publish("GetHistoryState").state;
					this.set("ActiveRow", state.UsersActiveRow);
					this.set("FuncRolesActiveRow", state.FuncRolesActiveRow);
					this.set("OrganizationalRolesActiveRow", state.OrgRolesActiveRow);
				},

				/**
				 * @inheritDoc Terrasoft.BaseSectionV2#getDefaultDataViews
				 * @overridden
				 */
				getDefaultDataViews: function() {
					var baseDataViews = this.callParent(arguments);
					baseDataViews = {
						GridDataView: {
							index: 0,
							name: "GridDataView",
							caption: this.get("Resources.Strings.UsersHeader"),
							icon: this.get("Resources.Images.UsersDataViewIcon")
						},
						OrganizationalRolesDataView: {
							index: 1,
							name: "OrganizationalRolesDataView",
							caption: this.get("Resources.Strings.OrganizationalRolesHeader"),
							icon: this.get("Resources.Images.OrgRolesIcon")
						},
						FuncRolesDataView: {
							index: 2,
							name: "FuncRolesDataView",
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
					if (view.tag !== "GridDataView") {
						this.moveToRolesSection(view.tag);
					} else {
						this.callParent(arguments);
					}
				},

				/**
				 * Выполняет переход в раздел функциональных ролей или организационной структуры, в зависимости от
				 * выбранного представления.
				 * @param {String} viewName Имя представления.
				 * @protected
				 */
				moveToRolesSection: function(viewName) {
					var pageName = this.getPageNameForRoles(viewName);
					var primaryColumnValue = this.getPrimaryColumnValueForRoles(viewName);
					this.sandbox.publish("PushHistoryState", {
						hash: this.Terrasoft.combinePath("SectionModuleV2", "SysAdminUnitSectionV2",
							pageName, "edit", primaryColumnValue),
						stateObj: {
							module: "SectionModuleV2",
							operation: "edit",
							primaryColumnValue: primaryColumnValue,
							schemas: [
								"SysAdminUnitSectionV2",
								pageName
							],
							workAreaMode: ConfigurationEnums.WorkAreaMode.COMBINED,
							moduleId: this.sandbox.id,
							UsersActiveRow: this.get("ActiveRow"),
							FuncRolesActiveRow: this.get("FuncRolesActiveRow"),
							OrgRolesActiveRow: this.get("OrganizationalRolesActiveRow")
						}
					});
				},

				/**
				 * Возвращает имя карточки редактирования для активного представления.
				 * @param {String} viewName Имя представления.
				 * @return {String} Имя карточки редактирования.
				 * @protected
				 */
				getPageNameForRoles: function(viewName) {
					return viewName === "OrganizationalRolesDataView"
						? "SysAdminUnitPageV2"
						: "SysAdminUnitFuncRolePageV2";
				},

				/**
				 * Возвращает идентификатор роли, которая была выбрана в представлении ролей.
				 * @param {String} viewName Имя представления.
				 * @return {String} Идентификатор выбранной роли. Если ранее не была выбрана какая-либо роль, тогда
				 * по умолчанию будет выбрана роль "Все сотрудники компании".
				 * @protected
				 */
				getPrimaryColumnValueForRoles: function(viewName) {
					var id;
					if (viewName === "OrganizationalRolesDataView") {
						id = this.get("OrganizationalRolesActiveRow");
					} else {
						id = this.get("FuncRolesActiveRow");
					}
					return id || ConfigurationConstants.SysAdminUnit.Id.AllEmployees;
				},

				/**
				 * @inheritDoc Terrasoft.BaseSectionV2#getFilters
				 * @overridden
				 */
				getFilters: function() {
					var filters = this.callParent(arguments);
					filters.add("UsersFilter", this.Terrasoft.createColumnFilterWithParameter(
						this.Terrasoft.ComparisonType.EQUAL, "SysAdminUnitTypeValue", ConfigurationConstants.SysAdminUnit.Type.User));
					return filters;
				},

				/**
				* @inheritDoc Terrasoft.BaseSectionV2#getEditPageSchemaName
				* @overridden
				*/
				getEditPageSchemaName: function() {
					return "UserPageV2";
				},

				/**
				 * @inheritDoc Terrasoft.BaseSectionV2#addRecord
				 * @overridden
				 */
				addRecord: function() {
					return false;
				},

				/**
				 * Открывает страницу добавления нового пользователя портала.
				 * @protected
				 */
				onAddPortalUser: function() {
					this.addNewRecord(ConfigurationConstants.SysAdminUnit.Id.PortalUsers,
						ConfigurationConstants.SysAdminUnit.ConnectionType.PortalUsers);
				},

				/**
				 * Открывает страницу добавления нового сотрудника компании.
				 * @protected
				 */
				onAddOurCompanyUser: function() {
					this.addNewRecord(ConfigurationConstants.SysAdminUnit.Id.AllEmployees,
						ConfigurationConstants.SysAdminUnit.ConnectionType.AllEmployees);
				},

				/**
				 * Открывает страницу добавления нового пользователя.
				 * @param {String} parentId Идентификатор записи, в которую мы будем добавлять пользователя.
				 * @param {Number} connectionType Тип подключения пользователя.
				 * @protected
				 */
				addNewRecord: function(parentId, connectionType) {
					this.set("TargetParent", parentId);
					var defaultValues = [{
						name: "ConnectionType",
						value: connectionType
					}];
					this.set("defaultValues", defaultValues);
					this.openCardInChain({
						schemaName: "UserPageV2",
						operation: ConfigurationEnums.CardStateV2.ADD,
						moduleId: this.getChainCardModuleSandboxId(this.Terrasoft.GUID_EMPTY),
						defaultValues: defaultValues
					});
				},

				/**
				 * @inheritDoc Terrasoft.GridUtilitiesV2#onDeleteAccept
				 * @overridden
				 */
				onDeleteAccept: function() {
					var activeRow = this.get("ActiveRow");
					var dataSend = {userId: activeRow};
					var config = {
						serviceName: "AdministrationService",
						methodName: "DeleteUser",
						data: dataSend
					};
					this.showBodyMask();
					this.callService(config, this.onDeleteUserResponseHandler.bind(this, activeRow), this);
				},

				/**
				 * Оповещает о результате удаления пользователя в случае ошибки, в случае удачного выполнения операции
				 * удаляет элемент из реестра.
				 * @param {String} activeRow Идентификатор столбца, для которого выполняется удаление.
				 * @param {Object} response ответ сервиса.
				 * @protected
				 */
				onDeleteUserResponseHandler: function(activeRow, response) {
					var message = this.get("Resources.Strings.DeleteErrorMessage");
					this.validateServiceResponse(response.DeleteUserResult, message,
						this.afterUserDeleted.bind(this, activeRow), this);
				},

				/**
				 * Проверяет ответ сервиса и оповещает пользователя в случае наличия ошибок.
				 * @param {string} response валидируемый ответ сервиса.
				 * @param {string} message сообщение в случае ошибки.
				 * @param {Function} callback Функция обратного вызова в случае отсутствия ошиибок.
				 * @param {Object} scope  Контекст функции обратного вызова.
				 * @protected
				 */
				validateServiceResponse: function(response, message, callback, scope) {
					this.hideBodyMask();
					var result = this.Ext.decode(response);
					var isSuccess = result && result.Success;
					if (isSuccess) {
						callback.call(scope);
					} else if (result.IsSecurityException) {
						this.showInformationDialog(result.ExceptionMessage);
					} else {
						this.showInformationDialog(message);
					}
				},

				/**
				 * Действия, необходимые после удаления пользователя.
				 * @param {String} activeRow Идентификатор столбца, для которого выполняется удаление.
				 * @protected
				 */
				afterUserDeleted: function(activeRow) {
					this.removeGridRecords([activeRow]);
					this.hideBodyMask();
				},

				/**
				 * @inheritDoc Terrasoft.BaseSectionV2#getSectionActions
				 * @overridden
				 */
				getSectionActions: function() {
					var actionMenuItems = this.Ext.create("Terrasoft.BaseViewModelCollection");
					actionMenuItems.addItem(this.getButtonMenuItem({
						"Caption": {"bindTo": "Resources.Strings.ExportListToFileButtonCaption"},
						"Click": {"bindTo": "exportToFile"}
					}));
					actionMenuItems.addItem(this.getActualizeAdminUnitInRoleButton());
					return actionMenuItems;
				},

				/**
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
						"Caption": {"bindTo": "Resources.Strings.OpenSummarySettingsModuleButtonCaption"},
						"Click": {"bindTo": "openSummarySettings"},
						"Visible": {"bindTo": "IsSummarySettingsVisible"}
					}));
					viewOptions.addItem(this.getButtonMenuItem({
						"Caption": {"bindTo": "Resources.Strings.OpenGridSettingsCaption"},
						"Click": {"bindTo": "openGridSettings"}
					}));
					return viewOptions;
				}
			}
		};
	});