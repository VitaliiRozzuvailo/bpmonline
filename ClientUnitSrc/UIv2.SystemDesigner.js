define("SystemDesigner", ["SystemDesignerResources", "RightUtilities", "PackageHelper",
	"ConfigurationConstants", "ConfigurationEnums", "ServiceHelper", "WizardUtilities"],
	function(resources, RightUtilities, PackageHelper, ConfigurationConstants, ConfigurationEnums, ServiceHelper) {
	return {

		mixins: {
			WizardUtilities: "Terrasoft.WizardUtilities"
		},

		attributes: {
			"CanManageProcessDesign": {dataValueType: Terrasoft.DataValueType.BOOLEAN},

			"CanViewSysOperationAudit": {dataValueType: Terrasoft.DataValueType.BOOLEAN},

			"CanImportFromExcel": {dataValueType: Terrasoft.DataValueType.BOOLEAN},

			"WindowHeight": {
				dataValueType: Terrasoft.DataValueType.INTEGER,
				value: 300
			},

			"WindowWidth": {
				dataValueType: Terrasoft.DataValueType.INTEGER,
				value: 600
			},

			"IsSectionDesignerAvailable": {dataValueType: Terrasoft.DataValueType.BOOLEAN},

			"CanAccessConfigurationSettings": {dataValueType: Terrasoft.DataValueType.BOOLEAN},

			"CanManageWorkplaces": {dataValueType: Terrasoft.DataValueType.BOOLEAN},

			"CanManageLogo": {dataValueType: Terrasoft.DataValueType.BOOLEAN},

			"CanManageSectionPanelColorSettings": {dataValueType: Terrasoft.DataValueType.BOOLEAN},

			/**
			 * Параметр, содержащий информацию о доступности раздела справочников текущему пользователю.
			 */
			"CanManageAdministration": {dataValueType: Terrasoft.DataValueType.BOOLEAN},

			"CanManageMobileApplication": {dataValueType: Terrasoft.DataValueType.BOOLEAN},

			/**
			 * Признак доступа к настройке системы.
			 */
			"CanManageSolution": {dataValueType: Terrasoft.DataValueType.BOOLEAN},

			/**
			 * Параметр, содержащий информацию о доступности раздела справочников текущему пользователю.
			 */
			"CanManageLookup": {dataValueType: Terrasoft.DataValueType.BOOLEAN}
		},
		methods: {

			/**
			 * Возвращает объект развязки операций и названия прав.
			 * @protected
			 * @virtual
			 * @return {Object} Объект развязки.
			 */
			getOperationRightsDecoupling: function() {
				return {
					"navigateToProcessLibSection": "CanManageProcessDesign",
					"navigateToProcessLogSection": "CanManageProcessLogSection",
					"navigateToOrgRoles": "CanManageAdministration",
					"navigateToFuncRoles": "CanManageAdministration",
					"navigateToUsers": "CanManageAdministration",
					"navigateToSysOperationAuditSection": "CanViewSysOperationAudit",
					"navigateToImportFromExcel": "CanImportFromExcel",
					"navigateToSysWorkPlaceSection": "CanManageWorkplaceSettings",
					"navigateToSysLogoSettings": "CanManageLogo",
					"startDetailWizard": "CanManageSolution",
					"navigateToObjectRightsManagement": "CanManageAdministration",
					"navigateToSysAdminOperationSection": "CanManageAdministration",
					"navigateToMobileAppDesignerSection": "CanManageMobileApplication",
					"navigateToSectionPanelSettingsSection": "CanManageSectionPanelColorSettings",
					"navigateToSysSettings": "CanManageAdministration",
					"navigateToLookupSection": "CanManageLookups"
				};
			},

			/**
			 * Инициализирует доступ текущеного пользователя на все успользуемые операции.
			 * @protected
			 * @virtual
			 * @param {Function} callback Функция обратного выхова.
			 * @param {Object} scope Объект окружения фукнции обратного вызова.
			 */
			initUserOperationsRights: function(callback, scope) {
				var getOperationRigthsDecoupling = this.getOperationRightsDecoupling();
				var operationRightsNames = Ext.Object.getValues(getOperationRigthsDecoupling);
				var uniqueOperationNames = [];
				Terrasoft.each(operationRightsNames, function(operationName) {
					if (uniqueOperationNames.indexOf(operationName) < 0) {
						uniqueOperationNames.push(operationName);
					}
				}, this);
				RightUtilities.checkCanExecuteOperations(uniqueOperationNames, function(result) {
					Terrasoft.each(result, function(operationRight, operationName) {
						this.set(operationName, operationRight);
					}, this);
					if (callback) {
						callback.call(scope);
					}
				}, this);
			},

			/**
			 * Выполняет переданную операцию с проверкой прав на нее. Если прав нет, выводит сообщение.
			 * @protected
			 * @virtual
			 * @return {boolean} Возвращает false для прекращения бамблинга события нажатия на ссылку.
			 */
			invokeOperation: function() {
				var operationName = arguments[1] || arguments[0];
				var operationRightsDecoupling = this.getOperationRightsDecoupling();
				var rightsName = operationRightsDecoupling[operationName];
				if (!Ext.isEmpty(rightsName) && !this.get(rightsName)) {
					var message = this.get("Resources.Strings.RightsErrorMessage");
					this.Terrasoft.utils.showInformation(message);
					this.hideBodyMask();
				} else {
					var operation = this[operationName];
					if (!Ext.isEmpty(operation) && Ext.isFunction(operation)) {
						operation.call(this);
					}
				}
				return false;
			},

			/**
			* Инициализирает права на мастер разделов.
			* @private
			*/
			onStartSectionDesignerClick: function() {
				if (this.get("IsSectionDesignerAvailable") != null) {
					this.startSectionDesigner();
				} else {
					this.getIsSectionDesignerAvailable(function() {
						this.startSectionDesigner();
					}, this);
				}
				return false;
			},

			/**
			 * Инициализирает права на Управление конфигурацией.
			 * @private
			 */
			onNavigateToConfigurationSettingsClick: function() {
				if (this.get("CanAccessConfigurationSettings") != null) {
					this.navigateToConfigurationSettings();
				} else {
					ServiceHelper.callService("MainMenuService", "GetCanAccessConfigurationSettings",
						function(response) {
							if (response) {
								var result = response.GetCanAccessConfigurationSettingsResult;
								var value = false;
								if (result && Ext.isBoolean(result)) {
									value = true;
								}
								this.set("CanAccessConfigurationSettings", value);
								this.navigateToConfigurationSettings();
							}
						}, {}, this);
				}
				return false;
			},

			/**
			 * Проверяет наличие прав на операцию изменения настроек.
			 * @private
			 * @param {Object} options Параметры проверки права.
			 * @param {String} options.operationName Код операции чьи права мы проверяем.
			 * @param {Function} options.callback Функция обратного вызова после получения значения права.
			 */
			checkRights: function(options) {
				var operationName = options.operationName;
				var callback = options.callback;
				var currentRights = this.get(operationName);
				if (currentRights != null) {
					callback.call(this, currentRights);
				}
				RightUtilities.checkCanExecuteOperation({
					operation: operationName
				}, function(result) {
					this.set(operationName, result);
					callback.call(this, result);
				}, this);
			},

			/**
			 * Открывает раздел настройки.
			 * @private
			 */
			navigateToSectionPanelSettingsSection: function() {
				this.sandbox.requireModuleDescriptors(["SysSectionPanelSettingsModule"], function() {
					this.sandbox.publish("PushHistoryState", {hash: "SysSectionPanelSettingsModule"});
				}, this);
			},

			/**
			 * Выполняет переход в раздел справочников.
			 * @protected
			 * @virtual
			 */
			navigateToSysSettings: function() {
				var newHash = Terrasoft.combinePath("SectionModuleV2", "SysSettingsSection");
				this.sandbox.publish("PushHistoryState", {hash: newHash});
			},

			/**
			 * Выполняет переход в раздел справочников.
			 * @protected
			 * @virtual
			 */
			navigateToLookupSection: function() {
				var lookupModuleStructure = Terrasoft.configuration.ModuleStructure.Lookup;
				if (lookupModuleStructure) {
					var newHash = Terrasoft.combinePath(lookupModuleStructure.sectionModule,
							lookupModuleStructure.sectionSchema);
					this.sandbox.publish("PushHistoryState", {hash: newHash});
				}
			},

			/**
			 * Открывает раздел "Библиотека процесов" или показывает сообщение о ошибке.
			 * @private
			 */
			navigateToProcessLibSection: function() {
				this.sandbox.publish("PushHistoryState", {hash: "SectionModuleV2/VwProcessLibSection/"});
			},

			/**
			 * Открывает раздел "Журнал процесов" или показывает сообщение о ошибке.
			 * @private
			 */
			navigateToProcessLogSection: function() {
				this.sandbox.publish("PushHistoryState", {hash: "SectionModuleV2/SysProcessLogSectionV2/"});
			},

			/**
			 * Открывает раздел "Журнал аудита" или показывает сообщение о ошибке.
			 * @private
			 */
			navigateToSysOperationAuditSection: function() {
				this.sandbox.publish("PushHistoryState", {hash: "SectionModuleV2/SysOperationAuditSectionV2/"});
			},

			/**
			 * Открывает окно импорта данных из Excel.
			 * @private
			 */
			navigateToImportFromExcel: function() {
				var url = this.Terrasoft.workspaceBaseUrl + "/ViewPage.aspx?Id=c2af7f54-07df-4670-9c2b-af2497d3231f";
				window.open(url, "_blank", "height=" + this.get("WindowHeight") + ",width=" + this.get("WindowWidth"));
			},

			/**
			 * Открывает дизайнер мобильного приложения.
			 * @private
			 */
			navigateToMobileAppDesignerSection: function() {
				Terrasoft.chain(
					function(next) {
						require(["SectionDesignerUtils"], next);
					},
					function(next, module) {
						module.getCurrentPackageUId(next);
					},
					function(next, result) {
						if (result) {
							this.showBodyMask();
							next();
						}
					},
					function() {
						var newHash = Terrasoft.combinePath("SectionModuleV2", "SysMobileWorkplaceSection");
						this.sandbox.publish("PushHistoryState", {hash: newHash});
					},
					this
				);
			},

			/**
			 * Открывает мастер разделов или показывает сообщение о ошибке.
			 * @private
			 */
			startSectionDesigner: function() {
				if (this.get("IsSectionDesignerAvailable") === true) {
					var location = window.location;
					var origin = location.origin || location.protocol + "//" + location.host;
					var url = origin + location.pathname + "#SectionDesigner/";
					require(["SectionDesignerUtils"], function(module) {
						module.start(url, true);
					});
				} else {
					var message = this.get("Resources.Strings.RightsErrorMessage");
					this.Terrasoft.utils.showInformation(message);
					this.hideBodyMask();
				}
			},

			/**
			 * Открывает мастер деталей или показывает сообщение о ошибке.
			 * @private
			 */
			startDetailWizard: function() {
				this.mixins.WizardUtilities.openDetailWindow("New");
			},

			/**
			 * Проверяет наличие пакета Platform и наличие прав для доступа к нему.
			 * @private
			 * @param {Function} callback Функция обратного вызова.
			 * @param {Object} scope Контекст.
			 */
			getIsSectionDesignerAvailable: function(callback, scope) {
				PackageHelper.getIsPackageInstalled(ConfigurationConstants.PackageUId.Platform,
					function(isPackageInstalled) {
						if (isPackageInstalled) {
							require(["SectionDesignerUtils"], function(module) {
								module.getCanUseSectionDesigner(function(result) {
									this.set("IsSectionDesignerAvailable", result.canUseSectionDesigner);
									callback.call(scope);
								}.bind(this));
							}.bind(this));
						} else {
							this.set("IsSectionDesignerAvailable", false);
							callback.call(scope);
						}
					}, this);
			},

			/**
			 * Открывает Управление конфигурацией или показывает сообщение о ошибке.
			 * @private
			 */
			navigateToConfigurationSettings: function() {
				if (this.get("CanAccessConfigurationSettings") === true) {
					window.open("../ViewPage.aspx?Id=5e5f9a9e-aa7d-407d-9e1e-1c24c3f9b59a");
				} else {
					var message = this.get("Resources.Strings.RightsErrorMessage");
					this.Terrasoft.utils.showInformation(message);
					this.hideBodyMask();
				}
			},

			/**
			 * Открывает раздел Настройка рабочих мест или показывает сообщение о ошибке.
			 * @private
			 */
			navigateToSysWorkPlaceSection: function() {
				this.showBodyMask();
				this.sandbox.publish("PushHistoryState", {
					hash: "SectionModuleV2/SysWorkplaceSectionV2/"
				});
			},

			/**
			 * Открывает раздел Настройка корпоративной символики или показывает сообщение об ошибке.
			 * @private
			 */
			navigateToSysLogoSettings: function() {
				this.sandbox.publish("PushHistoryState", {
					hash: "SysLogoSettingsModule"
				});
			},

			/**
			 * Открывает окно администрирования прав объектов.
			 * @private
			 */
			navigateToObjectRightsManagement: function() {
				var url = this.Terrasoft.workspaceBaseUrl +
					"/ViewPage.aspx?Id=5e5f9a9e-aa7d-407d-9e1e-1c24c3f9b59a&" +
					"ActiveTabId=PageContainer_34d8ed7df8e8e011837600155d04c01d_fe571096f36b14102781485b39b2edcc_" +
					"99ea5ea6447249a39dfa660296bb4674";
				window.open(url, "_blank");
			},

			/**
			 * Открывает представление Организационные роли в разделе администрирования пользователей.
			 * @private
			 */
			navigateToOrgRoles: function() {
				this.goToSysAdminUnitSection("SysAdminUnitPageV2");
			},

			/**
			 * Открывает представление Функциональные роли в разделе администрирования пользователей.
			 * @private
			 */
			navigateToFuncRoles: function() {
				this.goToSysAdminUnitSection("SysAdminUnitFuncRolePageV2");
			},

			/**
			 * Выполняет переход в раздел SysAdminUnitSection.
			 * @param {String} pageName Название страницы редактирования, которая будет открыта при переходе в раздел.
			 * @private
			 */
			goToSysAdminUnitSection: function(pageName) {
				var primaryId = ConfigurationConstants.SysAdminUnit.Id.AllEmployees;
				this.sandbox.publish("PushHistoryState", {
					hash: this.Terrasoft.combinePath("SectionModuleV2", "SysAdminUnitSectionV2",
						pageName, ConfigurationEnums.CardState.Edit, primaryId),
					stateObj: {
						module: "SectionModuleV2",
						operation: ConfigurationEnums.CardState.Edit,
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
			 * Открывает представление Пользователи в разделе администрирования пользователей.
			 * @private
			 */
			navigateToUsers: function() {
				this.sandbox.publish("PushHistoryState", {
					hash: this.Terrasoft.combinePath("SectionModuleV2", "UsersSectionV2")
				});
			},

			/**
			 * Открывает раздел управлением правами операций.
			 * @private
			 */
			navigateToSysAdminOperationSection: function() {
				this.sandbox.publish("PushHistoryState", {
					hash: "SectionModuleV2/SysAdminOperationSectionV2/"
				});
			},

			/**
			 * Инициализует модель представления.
			 * @protected
			 * @overridden
			 * @param {Function} callback Функция обратного выхова.
			 * @param {Object} scope Объект окружения фукнции обратного вызова.
			 */
			init: function(callback, scope) {
				this.callParent([function() {
					this.initUserOperationsRights(function() {
						this.set("ProductEdition", "BPMS");
						this.set("IsMobilePannerVisible", false);
						var currentCultureId = this.Terrasoft.Resources.CultureSettings.currentCultureId;
						var russianCultureId = "1a778e3f-0a8e-e111-84a3-00155d054c03";
						var showSdk = this.get("UseLMSDocumentation") && (currentCultureId === russianCultureId);
						this.set("IsSdkPanelVisible", showSdk);
						var showCommunity = (currentCultureId === russianCultureId);
						this.set("IsComunityPanelVisible", showCommunity);
						this.set("IsSocialAccountsPanelVisible", false);
						if (callback) {
							callback.call(scope);
						}
					}, this);

				}, this]);
			},

			/**
			 * Обработчик завершения отображения представления.
			 * @protected
			 * @overridden
			 */
			onRender: function() {
				this.callParent(arguments);
				this.hideBodyMask();
			}
		},
		diff: [
			{
				"operation": "merge",
				"name": "MainContainer",
				"values": {
					"markerValue": "system-designer-page"
				}
			},
			{
				"operation": "insert",
				"name": "ProcessTile",
				"propertyName": "items",
				"parentName": "LeftContainer",
				"values": {
					"itemType": Terrasoft.ViewItemType.CONTAINER,
					"generator": "MainMenuTileGenerator.generateMainMenuTile",
					"caption": {"bindTo": "Resources.Strings.ProcessCaption"},
					"cls": ["process", "designer-tile"],
					"icon": resources.localizableImages.ProcessIcon,
					"items": []
				}
			},
			{
				"operation": "insert",
				"propertyName": "items",
				"parentName": "ProcessTile",
				"name": "ProcessLibrary",
				"values": {
					"itemType": Terrasoft.ViewItemType.LINK,
					"caption": {"bindTo": "Resources.Strings.ProcessLibraryLinkCaption"},
					"tag": "navigateToProcessLibSection",
					"click": {"bindTo": "invokeOperation"}
				}
			},
			{
				"operation": "insert",
				"propertyName": "items",
				"parentName": "ProcessTile",
				"name": "ProcessLog",
				"values": {
					"itemType": Terrasoft.ViewItemType.LINK,
					"caption": {"bindTo": "Resources.Strings.ProcessLogLinkCaption"},
					"tag": "navigateToProcessLogSection",
					"click": {"bindTo": "invokeOperation"}
				}
			},
			{
				"operation": "insert",
				"name": "UsersTile",
				"propertyName": "items",
				"parentName": "LeftContainer",
				"values": {
					"itemType": Terrasoft.ViewItemType.CONTAINER,
					"generator": "MainMenuTileGenerator.generateMainMenuTile",
					"caption": {"bindTo": "Resources.Strings.UsersCaption"},
					"cls": ["sales-tile", "designer-tile"],
					"icon": resources.localizableImages.UsersIcon,
					"items": []
				}
			},
			{
				"operation": "insert",
				"propertyName": "items",
				"parentName": "UsersTile",
				"name": "Users",
				"values": {
					"itemType": Terrasoft.ViewItemType.LINK,
					"caption": {"bindTo": "Resources.Strings.UsersLinkCaption"},
					"tag": "navigateToUsers",
					"click": {"bindTo": "invokeOperation"}
				}
			},
			{
				"operation": "insert",
				"propertyName": "items",
				"parentName": "UsersTile",
				"name": "OrgRoles",
				"values": {
					"itemType": Terrasoft.ViewItemType.LINK,
					"caption": {"bindTo": "Resources.Strings.OrgRolesLinkCaption"},
					"tag": "navigateToOrgRoles",
					"click": {"bindTo": "invokeOperation"}
				}
			},
			{
				"operation": "insert",
				"propertyName": "items",
				"parentName": "UsersTile",
				"name": "FuncRoles",
				"values": {
					"itemType": Terrasoft.ViewItemType.LINK,
					"caption": {"bindTo": "Resources.Strings.FuncRolesLinkCaption"},
					"tag": "navigateToFuncRoles",
					"click": {"bindTo": "invokeOperation"}
				}
			},
			{
				"operation": "insert",
				"propertyName": "items",
				"parentName": "UsersTile",
				"name": "ObjectRightsManagement",
				"values": {
					"itemType": Terrasoft.ViewItemType.LINK,
					"caption": {"bindTo": "Resources.Strings.ObjectRightsManagementLinkCaption"},
					"tag": "navigateToObjectRightsManagement",
					"click": {"bindTo": "invokeOperation"}
				}
			},
			{
				"operation": "insert",
				"propertyName": "items",
				"parentName": "UsersTile",
				"name": "OperationRightsManagement",
				"values": {
					"itemType": Terrasoft.ViewItemType.LINK,
					"caption": {"bindTo": "Resources.Strings.OperationRightsManagementLinkCaption"},
					"tag": "navigateToSysAdminOperationSection",
					"click": {"bindTo": "invokeOperation"}
				}
			},
			{
				"operation": "insert",
				"propertyName": "items",
				"parentName": "UsersTile",
				"name": "AuditLog",
				"values": {
					"itemType": Terrasoft.ViewItemType.LINK,
					"caption": {"bindTo": "Resources.Strings.AuditLogLinkCaption"},
					"tag": "navigateToSysOperationAuditSection",
					"click": {"bindTo": "invokeOperation"}
				}
			},
			{
				"operation": "insert",
				"name": "IntegrationTile",
				"propertyName": "items",
				"parentName": "LeftContainer",
				"values": {
					"itemType": Terrasoft.ViewItemType.CONTAINER,
					"generator": "MainMenuTileGenerator.generateMainMenuTile",
					"caption": {"bindTo": "Resources.Strings.IntegrationCaption"},
					"cls": ["settings", "designer-tile"],
					"icon": resources.localizableImages.IntegrationIcon,
					"items": []
				}
			},
			{
				"operation": "insert",
				"propertyName": "items",
				"parentName": "IntegrationTile",
				"name": "ExcelImport",
				"index": 0,
				"values": {
					"itemType": Terrasoft.ViewItemType.LINK,
					"caption": {"bindTo": "Resources.Strings.ExcelImportLinkCaption"},
					"tag": "navigateToImportFromExcel",
					"click": {"bindTo": "invokeOperation"}
				}
			},
			{
				"operation": "insert",
				"name": "SystemSettingsTile",
				"propertyName": "items",
				"parentName": "LeftContainer",
				"values": {
					"itemType": Terrasoft.ViewItemType.CONTAINER,
					"generator": "MainMenuTileGenerator.generateMainMenuTile",
					"caption": {"bindTo": "Resources.Strings.SystemSettingsCaption"},
					"cls": ["analytics", "designer-tile"],
					"icon": resources.localizableImages.SystemSettingsIcon,
					"items": []
				}
			},
			{
				"operation": "insert",
				"propertyName": "items",
				"parentName": "SystemSettingsTile",
				"name": "LookupSection",
				"values": {
					"itemType": Terrasoft.ViewItemType.LINK,
					"caption": {"bindTo": "Resources.Strings.LookupsLinkCaption"},
					"tag": "navigateToLookupSection",
					"click": {"bindTo": "invokeOperation"}
				}
			},
			{
				"operation": "insert",
				"propertyName": "items",
				"parentName": "SystemSettingsTile",
				"name": "SysSettingsSection",
				"values": {
					"itemType": Terrasoft.ViewItemType.LINK,
					"caption": {"bindTo": "Resources.Strings.SysSettingsLinkCaption"},
					"tag": "navigateToSysSettings",
					"click": {"bindTo": "invokeOperation"}
				}
			},
			{
				"operation": "insert",
				"propertyName": "items",
				"parentName": "SystemSettingsTile",
				"name": "SectionDesigner",
				"values": {
					"itemType": Terrasoft.ViewItemType.LINK,
					"caption": {"bindTo": "Resources.Strings.SectionDesignerLinkCaption"},
					"click": {"bindTo": "onStartSectionDesignerClick"}
				}
			},
			{
				"operation": "insert",
				"propertyName": "items",
				"parentName": "SystemSettingsTile",
				"name": "DetailWizard",
				"values": {
					"itemType": Terrasoft.ViewItemType.LINK,
					"caption": {"bindTo": "Resources.Strings.DetailWizardLinkCaption"},
					"tag": "startDetailWizard",
					"click": {"bindTo": "invokeOperation"}
				}
			},
			{
				"operation": "insert",
				"propertyName": "items",
				"parentName": "SystemSettingsTile",
				"name": "MobileAppDesignerLink",
				"values": {
					"itemType": Terrasoft.ViewItemType.LINK,
					"caption": {"bindTo": "Resources.Strings.MobileAppDesignerLinkCaption"},
					"tag": "navigateToMobileAppDesignerSection",
					"click": {"bindTo": "invokeOperation"}
				}
			},
			{
				"operation": "insert",
				"name": "SystemViewTile",
				"propertyName": "items",
				"parentName": "LeftContainer",
				"values": {
					"itemType": Terrasoft.ViewItemType.CONTAINER,
					"generator": "MainMenuTileGenerator.generateMainMenuTile",
					"caption": {"bindTo": "Resources.Strings.SystemViewCaption"},
					"cls": ["basis", "designer-tile"],
					"icon": resources.localizableImages.SystemViewIcon,
					"items": []
				}
			},
			{
				"operation": "insert",
				"propertyName": "items",
				"parentName": "SystemViewTile",
				"name": "SysWorkplace",
				"values": {
					"itemType": Terrasoft.ViewItemType.LINK,
					"caption": {"bindTo": "Resources.Strings.SysWorkplaceLinkCaption"},
					"tag": "navigateToSysWorkPlaceSection",
					"click": {"bindTo": "invokeOperation"}
				}
			},
			{
				"operation": "insert",
				"propertyName": "items",
				"parentName": "SystemViewTile",
				"name": "SysLogoManagement",
				"values": {
					"itemType": Terrasoft.ViewItemType.LINK,
					"caption": {"bindTo": "Resources.Strings.SysLogoManagementLinkCaption"},
					"tag": "navigateToSysLogoSettings",
					"click": {"bindTo": "invokeOperation"}
				}
			},
			{
				"operation": "insert",
				"propertyName": "items",
				"parentName": "SystemViewTile",
				"name": "SysColorManagement",
				"values": {
					"itemType": Terrasoft.ViewItemType.LINK,
					"caption": {"bindTo": "Resources.Strings.SysColorManagementLinkCaption"},
					"tag": "navigateToSectionPanelSettingsSection",
					"click": {"bindTo": "invokeOperation"}
				}
			},
			{
				"operation": "insert",
				"name": "ConfigurationTile",
				"propertyName": "items",
				"parentName": "LeftContainer",
				"values": {
					"itemType": Terrasoft.ViewItemType.CONTAINER,
					"generator": "MainMenuTileGenerator.generateMainMenuTile",
					"caption": {"bindTo": "Resources.Strings.ConfigurationCaption"},
					"cls": ["configuration", "designer-tile"],
					"icon": resources.localizableImages.ConfigurationIcon,
					"items": []
				}
			},
			{
				"operation": "insert",
				"propertyName": "items",
				"parentName": "ConfigurationTile",
				"name": "ConfigurationLink",
				"values": {
					"itemType": Terrasoft.ViewItemType.LINK,
					"caption": {"bindTo": "Resources.Strings.ConfigurationLinkCaption"},
					"click": {"bindTo": "onNavigateToConfigurationSettingsClick"}
				}
			},
			{
				"operation": "merge",
				"name": "AcademyPanel",
				"propertyName": "items",
				"parentName": "RightContainer",
				"values": {
					"bannerImage": resources.localizableImages.BPMSbanner,
					"wrapClassName": "bpms-banner"
				}
			},
			{
				"operation": "merge",
				"name": "TerrasoftAccountsLinksPanel",
				"values": {
					"wrapClassName": "system-designer"
				}
			},
			{
				"operation": "insert",
				"name": "SystemDesignerVideo",
				"parentName": "VideoPanel",
				"propertyName": "playlist",
				"values": {
					"videoUrl": resources.localizableStrings.SystemDesignerVideoUrl,
					"caption":  {"bindTo": "Resources.Strings.SystemDesignerVideoCaption"}
				}
			}
		]
	};
});
