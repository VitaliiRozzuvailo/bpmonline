define("DashboardBuilder", ["ext-base", "DashboardBuilderResources", "RightUtilities", "MaskHelper", "DashboardManager",
	"DashboardManagerItem"],
function(Ext, resources, RightUtilities, MaskHelper) {

	/**
	 * @class Terrasoft.configuration.DashboardViewsConfig
	 * Класс генерурующий конфигурацию представления модуля итогов.
	 */
	Ext.define("Terrasoft.configuration.DashboardsViewConfig", {
		extend: "Terrasoft.BaseObject",
		alternateClassName: "Terrasoft.DashboardsViewConfig",

		/**
		 * Генерирует конфигурацию представления модуля итогов.
		 * @returns {Object[]} Возвращает конфигурацию представления модуля итогов.
		 */
		generate: function() {
			return [{
				"name": "Tabs",
				"itemType": Terrasoft.ViewItemType.TAB_PANEL,
				"activeTabChange": {"bindTo": "onActiveTabChange"},
				"activeTabName": {"bindTo": "ActiveTabName"},
				"classes": {"wrapClass": ["tab-panel-margin-bottom"]},
				"collection": {"bindTo": "TabsCollection"},
				"markerValue": "mainDashboardPage",
				"defaultMarkerValueColumnName": "Caption",
				"controlConfig": {
					"items": [{
						"className": "Terrasoft.Button",
						"style": Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
						"imageConfig": {"bindTo": "Resources.Images.Settings"},
						"markerValue": "SettingsButton",
						"menu": {
							items: [{
								"caption": {"bindTo": "Resources.Strings.AddButtonCaption"},
								"click": {"bindTo": "addDashboard"},
								"markerValue": "SettingsButtonAdd",
								"enabled": {
									"bindTo": "SysDashboardRightLevel",
									"bindConfig": {"converter": "isSchemaCanAppendRightConverter"}
								}
							}, {
								"caption": {"bindTo": "Resources.Strings.EditButtonCaption"},
								"click": {"bindTo": "editCurrentDashboard"},
								"markerValue": "SettingsButtonEdit",
								"enabled": {"bindTo": "canEdit"}
							}, {
								"caption": {"bindTo": "Resources.Strings.CopyButtonCaption"},
								"click": {"bindTo": "copyCurrentDashboard"},
								"markerValue": "SettingsButtonCopy",
								"enabled": {"bindTo": "canCopy"}
							}, {
								"caption": {"bindTo": "Resources.Strings.DeleteButtonCaption"},
								"click": {"bindTo": "deleteCurrentDashboard"},
								"markerValue": "SettingsButtonDelete",
								"enabled": {"bindTo": "canDelete"}
							}, {
								"caption": "",
								"className": "Terrasoft.MenuSeparator"
							}, {
								"caption": {"bindTo": "Resources.Strings.RightsButtonCaption"},
								"click": {"bindTo": "manageCurrentDashboardRights"},
								"markerValue": "ManageRights",
								"enabled": {"bindTo": "canManageRights"}
							}]
						}
					}]
				}
			}, {
				"name": "NoDashboardLabel",
				"itemType": Terrasoft.ViewItemType.LABEL,
				"caption": {"bindTo": "Resources.Strings.NoDashboardsAvailable"},
				"labelConfig": {
					"classes": ["dashboard-message-empty"],
					"visible": {
						"bindTo": "isTabsEmpty"
					}
				}
			}, {
				"name": "DashboardModule",
				"itemType": Terrasoft.ViewItemType.CONTAINER
			}];
		}
	});

	/**
	 * @class Terrasoft.configuration.BaseDashboardsViewModel
	 * Класс модели представления модуля итога.
	 */
	Ext.define("Terrasoft.configuration.BaseDashboardsViewModel", {
		extend: "Terrasoft.BaseModel",
		alternateClassName: "Terrasoft.BaseDashboardsViewModel",
		mixins: {
			rightsUtilities: "Terrasoft.RightUtilitiesMixin"
		},

		Ext: null,
		sandbox: null,
		Terrasoft: null,

		constructor: function() {
			this.callParent(arguments);
			this.initResourcesValues(resources);
		},

		/**
		 * Инициализирует модель значениями ресурсов из объекта ресурсов.
		 * @protected
		 * @virtual
		 * @param {Object} resourcesObj Объект ресурсов.
		 */
		initResourcesValues: function(resourcesObj) {
			var resourcesSuffix = "Resources";
			Terrasoft.each(resourcesObj, function(resourceGroup, resourceGroupName) {
				resourceGroupName = resourceGroupName.replace("localizable", "");
				Terrasoft.each(resourceGroup, function(resourceValue, resourceName) {
					var viewModelResourceName = [resourcesSuffix, resourceGroupName, resourceName].join(".");
					this.set(viewModelResourceName, resourceValue);
				}, this);
			}, this);
		},

		/**
		 * Инициализирует начальные значения модели для Tabs.
		 * @protected
		 * @virtual
		 */
		initTabs: function() {
			var defaultTabName = this.getDefaultTabName();
			if (!defaultTabName) {
				this.set("ActiveTabName", defaultTabName);
				this.reloadRecordRights();
				var dashboardModuleId = this.getDashboardModuleId();
				this.sandbox.unloadModule(dashboardModuleId);
				return;
			}
			var activeTabName = this.get("ActiveTabName");
			var tabName = activeTabName && Terrasoft.DashboardManager.findItem(activeTabName)
				? activeTabName
				: defaultTabName;
			this.setActiveTab(tabName);
			this.reloadRecordRights();
		},

		/**
		 * Получает таб по умолчанию.
		 * @protected
		 * @virtual
		 * @return {String} Возвращает таб по умолчанию.
		 */
		getDefaultTabName: function() {
			var tabsCollection = this.get("TabsCollection");
			if (tabsCollection.isEmpty()) {
				return "";
			}
			var defaultTab = tabsCollection.getByIndex(0);
			return defaultTab.get("Name");
		},

		/**
		 * Устанавливает активную вкладку.
		 * @protected
		 * @virtual
		 * @param {String} tabName Имя вкладки.
		 */
		setActiveTab: function(tabName) {
			this.set("ActiveTabName", tabName);
		},

		/**
		 * Обрабатывает событие изменение вкладки.
		 * @protected
		 * @virtual
		 * @param {Terrasoft.BaseViewModel} activeTab Выбранная вкладка.
		 */
		onActiveTabChange: function(activeTab) {
			var currentDashboardName = activeTab.get("Name");
			this.set("ActiveTabName", currentDashboardName);
			this.saveActiveTabNameToProfile(currentDashboardName);
			this.reloadRecordRights();
			this.loadDashboardModule();
		},

		/**
		 * Возвращает значение из профиля по ключу.
		 * @private
		 * @param {Function} callback Функция обратного вызова.
		 * @param {Object} scope Контекст выполнения функции обратного вызова.
		 */
		getActiveTabNameFromProfile: function(callback, scope) {
			var key = this.getProfileKey();
			Terrasoft.require(["profile!" + key], function(profile) {
				this.set("ActiveTabName", profile.activeTabName);
				if (callback) {
					callback.call(scope);
				}
			}, this);
		},

		/**
		 * Сохраняет идентификатор выбранной вкладки в профиль.
		 * @private
		 * @param {String} activeTabName Идентификатор текущего Итога.
		 */
		saveActiveTabNameToProfile: function(activeTabName) {
			var key = this.getProfileKey();
			this.Terrasoft.utils.saveUserProfile(key, {
				activeTabName: activeTabName
			}, false);
		},

		/**
		 * Возвращает ключ для сохранения\получения данных из профиля.
		 * @protected
		 * @virtual
		 * @returns {String} key Уникальный ключ для модуля итогов каждого раздела.
		 */
		getProfileKey: function() {
			var historyState = this.sandbox.publish("GetHistoryState");
			var keyTpl = "Dashboards_{0}_{1}";
			var key = Ext.String.format(keyTpl, historyState.hash.moduleName, historyState.hash.entityName);
			return key;
		},

		/**
		 * Выполняет обновление прав доступа для текущего Итога.
		 */
		reloadRecordRights: function() {
			var currentDashboardName = this.get("ActiveTabName");
			this.set("CurrentRecordRightLevel", 0);
			if (currentDashboardName) {
				RightUtilities.getSchemaRecordRightLevel(
						"SysDashboard",
						currentDashboardName,
						function(rightLevel) {
							this.set("CurrentRecordRightLevel", rightLevel);
						}, this);
			}
		},

		/**
		 * Удаляет вкладку по имени.
		 * @param {String} tabName Имя вкладки для удаления.
		 */
		removeTab: function(tabName) {
			var tabsCollection = this.get("TabsCollection");
			tabsCollection.removeByKey(tabName);
		},

		/**
		 * Инициализирует заголовок страницы.
		 * @protected
		 * @virtual
		 */
		initHeader: function() {
			var pageCaption = this.get("Resources.Strings.Caption");
			this.sandbox.publish("InitDataViews", {caption: pageCaption});
			this.initContextHelp();
		},

		/**
		 * Инициализирует контекстную справку.
		 * @protected
		 * @virtual
		 */
		initContextHelp: function() {
			var contextHelpId = 1013;
			this.sandbox.publish("InitContextHelp", contextHelpId);
		},

		/**
		 * Обновляет или загружает модуль итога.
		 * @protected
		 * @virtual
		 */
		loadDashboardModule: function() {
			var dashboardModuleId = this.getDashboardModuleId();
			if (!this.sandbox.publish("ReloadDashboard", null, [dashboardModuleId])) {
				this.sandbox.loadModule("DashboardModule", {
					renderTo: "DashboardModuleContainer",
					id: dashboardModuleId
				});
			}
		},

		/**
		 * Генерирует уникальный идентификатор для модуля итога.
		 * @protected
		 * @virtual
		 * @return {String} Возвращает уникальный идентификатор для модуля итога.
		 */
		getDashboardModuleId: function() {
			return this.sandbox.id + "DashboardModule";
		},

		/**
		 * Инициализирует модель представления согласно достапным пользователю итогам.
		 * @protected
		 * @virtual
		 */
		initData: function() {
			var dashboards = this.getDashboards();
			var tabsValues = [];
			dashboards.each(function(dashboard) {
				tabsValues.push({
					Caption: dashboard.getCaption(),
					Name: dashboard.getId()
				});
			}, this);
			var tabsCollection = Ext.create("Terrasoft.BaseViewModelCollection", {
				entitySchema: Ext.create("Terrasoft.BaseEntitySchema", {
					columns: {},
					primaryColumnName: "Name"
				})
			});
			tabsCollection.loadFromColumnValues(tabsValues);
			this.set("TabsCollection", tabsCollection);
		},

		/**
		 * Подписывается на сообщения от дизайнера итога.
		 * @protected
		 * @virtual
		 */
		subscribeDesignerMessage: function() {
			var designerModuleId = this.getDesignerModuleId();
			var addDesignerModuleId = this.getAddDesignerModuleId();
			var copyDesignerModuleId = this.getCopyDesignerModuleId();
			var dashboardModuleId = this.getDashboardModuleId();
			this.sandbox.subscribe("GetDashboardInfo", this.onGetDashboardInfo, this,
					[designerModuleId, dashboardModuleId]);
			this.sandbox.subscribe("GetDashboardInfo", this.onGetDashboardAddInfo, this,
					[addDesignerModuleId]);
			this.sandbox.subscribe("GetDashboardInfo", this.onGetDashboardCopyInfo, this,
					[copyDesignerModuleId]);
			this.sandbox.subscribe("SetDesignerResult", this.onSetDesignerResult, this,
					[designerModuleId, addDesignerModuleId, copyDesignerModuleId]);
		},

		/**
		 * Сравнивает заголовки двух итогов для сортировки.
		 * @param {Terrasoft.DashboardManagerItem} a Объект, представляющий итог.
		 * @param {Terrasoft.DashboardManagerItem} b Объект, представляющий итог.
		 * @returns {Number} Возвращает
		 * 0 если объекты равны,
		 * 1 если первый больше второго
		 * -1 если второй больше первого.
		 */
		defaultDashboardsSortFn: function(a, b) {
			var valueA = a.getCaption();
			var valueB = b.getCaption();
			return valueA.localeCompare(valueB);
		},

		/**
		 * Обрабатывает результат работы дизайнера итога.
		 * @protected
		 * @virtual
		 * @param {Object} result Результат работы модуля дизайнера.
		 */
		onSetDesignerResult: function(result) {
			var config = {
				useFilterFn: true
			};
			var dashboards = Terrasoft.DashboardManager.getItems(config);
			dashboards.sortByFn(this.defaultDashboardsSortFn);
			this.set("Dashboards", dashboards);
			this.unloadNestedModules();
			this.set("ReloadNestedModules", true);
			this.saveActiveTabNameToProfile(result.dashboardId);
			this.setActiveTab(result.dashboardId);
			this.initData();
			this.reloadRecordRights();
		},

		/**
		 * Выгружает все дочерние модули.
		 * @protected
		 * @virtual
		 */
		unloadNestedModules: function() {
			var moduleId = this.getDashboardModuleId();
			this.sandbox.unloadModule(moduleId);
		},

		/**
		 * Обработчик события получения параметров для дизайнера итога при создании новой записи.
		 * @protected
		 * @virtual
		 * @return {Object} Возвращает информацию об итоге.
		 */
		onGetDashboardAddInfo: function() {
			return {
				"createNew": true
			};
		},

		/**
		 * Обработчик события получения параметров для дизайнера итога при копировании существующей записи.
		 * @protected
		 * @virtual
		 * @return {Object} Возвращает информацию об итоге.
		 */
		onGetDashboardCopyInfo: function() {
			return {
				"copyItem": true,
				"dashboardId": this.get("ActiveTabName")
			};
		},

		/**
		 * Обработчик события получения параметров для дизайнера итога.
		 * @protected
		 * @virtual
		 * @return {Object} Возвращает информацию об итог.
		 */
		onGetDashboardInfo: function() {
			return {
				"dashboardId": this.get("ActiveTabName")
			};
		},

		/**
		 * Генерирует идентификтор дизайнера итога.
		 * @protected
		 * @virtual
		 * @returns {String} Возвращает идентификтор дизайнера итога.
		 */
		getDesignerModuleId: function() {
			return this.sandbox.id + "_Designer";
		},

		/**
		 * Генерирует идентификтор дизайнера итога при добавлении нового итога.
		 * @protected
		 * @virtual
		 * @returns {String} Возвращает идентификтор дизайнера итога.
		 */
		getAddDesignerModuleId: function() {
			return this.sandbox.id + "_Designer_Add";
		},

		/**
		 * Генерирует идентификтор дизайнера итога при копировании существующего итога.
		 * @protected
		 * @virtual
		 * @returns {String} Возвращает идентификтор дизайнера итога.
		 */
		getCopyDesignerModuleId: function() {
			return this.sandbox.id + "_Designer_Copy";
		},

		/**
		 * Загружает модуль дизайнера итога.
		 * @protected
		 * @virtual
		 * @param {string} moduleId Уникакльный идентификатор модуля.
		 */
		openDesigner: function(moduleId) {
			var historyState = this.sandbox.publish("GetHistoryState");
			this.sandbox.publish("PushHistoryState", {hash: historyState.hash.historyState});
			this.sandbox.loadModule("DashboardDesigner", {
				renderTo: "centerPanel",
				id: moduleId || this.getDesignerModuleId(),
				keepAlive: true
			});
		},

		/**
		 * Проверяет может ли текущий пользователь редактировать итог.
		 * @protected
		 * @virtual
		 * @return {Boolean} Возвращает true если может и false в обратном случае.
		 */
		canEdit: function() {
			var rightLevel = this.get("SysDashboardRightLevel");
			var dashboardId = this.get("ActiveTabName");
			var result = this.isSchemaCanEditRightConverter(rightLevel) && dashboardId;
			if (dashboardId) {
				var dashboard = this.getDashboard(dashboardId);
				result = result && dashboard.isValid;
			}
			return result;
		},

		/**
		 * Проверяет может ли текущий пользователь копировать итог.
		 * @protected
		 * @virtual
		 * @return {Boolean} Возвращает true если может и false в обратном случае.
		 */
		canCopy: function() {
			var rightLevel = this.get("SysDashboardRightLevel");
			var dashboardId = this.get("ActiveTabName");
			var result = this.isSchemaCanAppendRightConverter(rightLevel) && dashboardId;
			if (dashboardId) {
				var dashboard = this.getDashboard(dashboardId);
				result = result && dashboard.isValid;
			}
			return result;
		},

		/**
		 * Проверяет может ли текущий пользователь удалять итог.
		 * @protected
		 * @virtual
		 * @return {Boolean} Возвращает true если может и false в обратном случае.
		 */
		canDelete: function() {
			var rightLevel = this.get("SysDashboardRightLevel");
			return this.isSchemaCanDeleteRightConverter(rightLevel) && this.get("ActiveTabName");
		},

		/**
		 * Проверяет пустая ли переданная коллекция.
		 * @protected
		 * @virtual
		 * @param {Terrasoft.Collection} value Коллекция.
		 * @return {Boolean} Возвращает true если пустая и false в обратном случае.
		 */
		isCollectionEmptyConverter: function(value) {
			return !value || value.isEmpty();
		},

		/**
		 * Проверяет пустая ли коллекция итогов.
		 * @protected
		 * @virtual
		 * @return {Boolean} Возвращает true если пустая и false в обратном случае.
		 */
		isTabsEmpty: function() {
			return this.isCollectionEmptyConverter(this.get("TabsCollection"));
		},

		/**
		 * Проверяет права на операцию для текущей записи.
		 * @protected
		 * @virtual
		 * @param {String} operation Операция.
		 * @return {Boolean} Возвращает true если есть права, false в обратном случае.
		 */
		checkRecordOperationRights: function(operation) {
			var rights = this.get("CurrentRecordRightLevel");
			var result =
					(operation === Terrasoft.RightsEnums.operationTypes.read &&
							this.isSchemaRecordCanReadRightConverter(rights)) ||
					(operation === Terrasoft.RightsEnums.operationTypes.edit &&
							this.isSchemaRecordCanEditRightConverter(rights)) ||
					(operation === Terrasoft.RightsEnums.operationTypes["delete"] &&
							this.isSchemaRecordCanDeleteRightConverter(rights));
			if (!result) {
				Terrasoft.utils.showInformation(this.get("Resources.Strings.NotEnoughRightsMessage"));
			}
			return result;
		},

		/**
		 * Проверяет, может ли текущий пользователь администрировать права текущей записи.
		 * @protected
		 * @virtual
		 * @return {Boolean} Возвращает true если есть права, false в обратном случае.
		 */
		canManageRights: function() {
			var currentRecordRightLevel = this.get("CurrentRecordRightLevel");
			return this.isSchemaRecordCanChangeReadRightConverter(currentRecordRightLevel) ||
					this.isSchemaRecordCanChangeEditRightConverter(currentRecordRightLevel) ||
					this.isSchemaRecordCanChangeDeleteRightConverter(currentRecordRightLevel);
		},

		/**
		 * Открывает страницу редактирования текущего итога.
		 * @protected
		 * @virtual
		 */
		editCurrentDashboard: function() {
			if (!this.checkRecordOperationRights(Terrasoft.RightsEnums.operationTypes.edit)) {
				return;
			}
			this.openDesigner();
		},

		/**
		 * Выполняет копирование текущего итога.
		 * @protected
		 * @virtual
		 */
		copyCurrentDashboard: function() {
			var moduleId = this.getCopyDesignerModuleId();
			this.openDesigner(moduleId);
		},

		/**
		 * Открывает страницу добавления итога.
		 * @protected
		 * @virtual
		 */
		addDashboard: function() {
			var moduleId = this.getAddDesignerModuleId();
			this.openDesigner(moduleId);
		},

		/**
		 * Удаляет текущий итог.
		 * @protected
		 * @virtual
		 */
		deleteCurrentDashboard: function() {
			if (!this.checkRecordOperationRights(Terrasoft.RightsEnums.operationTypes["delete"])) {
				return;
			}
			Terrasoft.utils.showConfirmation(this.get("Resources.Strings.DeleteConfirmationMessage"),
				function(returnCode) {
					if (returnCode === this.Terrasoft.MessageBoxButtons.YES.returnCode) {
						this.onDeleteAccept();
					}
				},
				[
					this.Terrasoft.MessageBoxButtons.YES.returnCode,
					this.Terrasoft.MessageBoxButtons.NO.returnCode
				],
				this
			);
		},

		/**
		 * Обработка согласия потльзователем на удаление итога.
		 * @protected
		 * @virtual
		 */
		onDeleteAccept: function() {
			var currentTab = this.get("ActiveTabName");
			Terrasoft.DashboardManager.remove(currentTab);
			Terrasoft.DashboardManager.save(function(response) {
				if (response.success) {
					this.removeTab(currentTab);
					this.set("ActiveTabName", null);
					this.initTabs();
				}
			}, this);
		},

		/**
		 * Открывает страницу настройки прав текущего итога.
		 * @protected
		 * @virtual
		 */
		manageCurrentDashboardRights: function() {
			this.openRightsModule();
		},

		/**
		 * Генерирует идентификатор для модуля прав.
		 * @protected
		 * @virtual
		 * @return {String} Возвращает идентификатор для модуля прав.
		 */
		getRightsModuleId: function() {
			return this.sandbox.id + "_Rights";
		},

		/**
		 * Открывает страницу настройки прав.
		 * @protected
		 * @virtual
		 */
		openRightsModule: function() {
			MaskHelper.ShowBodyMask();
			this.sandbox.loadModule("Rights", {
				renderTo: "centerPanel",
				id: this.getRightsModuleId(),
				keepAlive: true
			});
		},

		/**
		 * Подписывается на сообщения отправляемые модулю.
		 * @protected
		 * @virtual
		 */
		subscribeSandboxMessages: function() {
			this.subscribeDesignerMessage();
			var rightsModuleId = this.getRightsModuleId();
			this.sandbox.subscribe("GetRecordInfo", function() {
				var dashboards = this.getDashboards();
				var currentDashboardName = this.get("ActiveTabName");
				var currentDashboard = dashboards.get(currentDashboardName);
				var dashboardManagerItem = currentDashboard.getDataManagerItem();
				var result = {
					entitySchemaName: dashboardManagerItem.getEntitySchemaName(),
					entitySchemaCaption: dashboardManagerItem.getEntitySchemaCaption(),
					primaryColumnValue: currentDashboard.getId(),
					primaryDisplayColumnValue: currentDashboard.getCaption()
				};
				return result;
			}, this, [rightsModuleId]);
		},

		/**
		 * Инициализирует начальные значения модели.
		 * @protected
		 * @virtual
		 */
		init: function(callback, scope) {
			this.Terrasoft.chain(
				this.getActiveTabNameFromProfile,
				function() {
					this.initData();
					this.subscribeSandboxMessages();
					this.initHeader();
					this.initTabs();
					RightUtilities.getSchemaOperationRightLevel("SysDashboard", function(rightLevel) {
						this.set("SysDashboardRightLevel", rightLevel);
						callback.call(scope || this);
					}, this);
				},
				this
			);
		},

		/**
		 * Выполняет необходимые операции после отображениея представления.
		 * @protected
		 * @virtual
		 */
		onRender: function() {
			MaskHelper.HideBodyMask();
			if (this.get("Restored")) {
				this.initHeader();
			}
			if (!this.get("Restored") || this.get("ReloadNestedModules")) {
				this.loadDashboardModule();
				this.set("ReloadNestedModules", false);
			}
		}
	});

	/**
	 * @class Terrasoft.configuration.DashboardBuilder
	 * Класс инкапсулирующий в себе логику генерации представления и класса модели представления для модуля итогов.
	 */
	var dashboardBuilder = Ext.define("Terrasoft.configuration.DashboardBuilder", {
		extend: "Terrasoft.BaseObject",
		alternateClassName: "Terrasoft.DashboardBuilder",

		/**
		 * Имя базовой модели представления для модуля итогов.
		 * @type {String}
		 */
		viewModelClass: "Terrasoft.BaseDashboardsViewModel",

		/**
		 * Имя базового класа генератога конфигурации представления итогов.
		 * @type {String}
		 */
		viewConfigClass: "Terrasoft.DashboardViewConfig",

		/**
		 * Имя класа генератога представления.
		 * @type {String}
		 */
		viewGeneratorClass: "Terrasoft.ViewGenerator",

		/**
		 * Конфигурация генератора.
		 * @type {Object}
		 */
		generatorConfig: null,

		/**
		 * Запрашивает доступные итоги у менеджера.
		 * @protected
		 * @virtual
		 * @param {Object} config Объект конфигурации получения итогов.
		 * @param {String} config.dashboardId Уникальный идентификатор используемой записи.
		 * @param {Boolean} config.createNew Признак создания нового итога.
		 * @param {Function} config.sortFn Функция сортировки элементов.
		 * @param {Function} callback Функция обратного вызова.
		 * @param {Terrasoft.BaseModel} scope Контекст выполнения функции обратного вызова.
		 * @return {Terrasoft.Collection} Возвращает доступные итоги.
		 */
		requireDashboards: function(config, callback, scope) {
			Terrasoft.DashboardManager.initialize(config, function() {
				if (config && config.dashboardId) {
					var dashboard = Terrasoft.DashboardManager.getItem(config.dashboardId);
					var dashboardCollection = Ext.create("Terrasoft.Collection");
					dashboardCollection.add(dashboard.getId(), dashboard);
					callback.call(scope, dashboardCollection);
					return;
				}
				if (config && config.createNew) {
					Terrasoft.DashboardManager.createItem(null, function(dashboard) {
						var dashboardCollection = Ext.create("Terrasoft.Collection");
						dashboardCollection.add(dashboard.getId(), dashboard);
						callback.call(scope, dashboardCollection);
					}, this);
					return;
				}
				Terrasoft.DashboardManager.filterFn = function(item) {
					var result = false;
					if (config.sectionId) {
						if (item.sectionId) {
							result = item.sectionId.value === config.sectionId;
						}
					} else {
						result = !item.sectionId;
					}
					return result;
				};
				var getItemsConfig = {
					useFilterFn: true
				};
				var dashboards = Terrasoft.DashboardManager.getItems(getItemsConfig);
				if (Ext.isFunction(config.sortFn)) {
					dashboards.sortByFn(config.sortFn);
				}
				callback.call(scope, dashboards);
			}, this);
		},

		/**
		 * Сравнивает заголовки двух итогов для сортировки.
		 * @param {Terrasoft.DashboardManagerItem} a Объект, представляющий итог.
		 * @param {Terrasoft.DashboardManagerItem} b Объект, представляющий итог.
		 * @returns {Number} Возвращает
		 * 0 если объекты равны,
		 * 1 если первый больше второго
		 * -1 если второй больше первого.
		 */
		defaultDashboardsSortFn: function(a, b) {
			var valueA = a.getCaption();
			var valueB = b.getCaption();
			return valueA.localeCompare(valueB);
		},

		/**
		 * Создает экземпляр класса Terrasoft.ViewGenerator.
		 * @return {Terrasoft.ViewGenerator} Возвращает объект Terrasoft.ViewGenerator.
		 */
		createViewGenerator: function() {
			return Ext.create(this.viewGeneratorClass);
		},

		/**
		 * Создает класс модели представление для модуля итогов.
		 * @protected
		 * @virtual
		 * @param {Object} config Объект конфигурации.
		 * @param {Function} callback Функция обратного вызова.
		 * @param {Terrasoft.BaseModel} scope Контекст выполнения функции обратного вызова.
		 * @return {Terrasoft.BaseModel} Возвращает класс модели представление для модуля итогов.
		 */
		buildViewModel: function(config, callback, scope) {
			var viewModelColumns = {
				"Dashboards": {
					dataValueType: Terrasoft.DataValueType.COLLECTION,
					type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					value: config.dashboards
				}
			};
			var viewModelClass = Ext.define("Terrasoft.configuration.DashboardViewModel", {
				extend: this.viewModelClass,
				alternateClassName: "Terrasoft.DashboardViewModel",
				columns: viewModelColumns,
				getDashboards: function() {
					return this.get("Dashboards");
				},
				getDashboard: function(dashboardId) {
					var dashboards = this.getDashboards();
					return dashboards.get(dashboardId);
				}
			});
			callback.call(scope, viewModelClass);
		},

		/**
		 * Создает конфигурацию представления модуля итогов.
		 * @protected
		 * @virtual
		 * @param {Object} config Объект конфигурации.
		 * @param {Terrasoft.Collection} config.dashboards Коллекция итогов.
		 * @param {Function} callback Функция обратного вызова.
		 * @param {Terrasoft.BaseModel} scope Контекст выполнения функции обратного вызова.
		 * @return {Object[]} Возвращает конфигурацию представления модуля итогов.
		 */
		buildView: function(config, callback, scope) {
			if (Ext.isFunction(config)) {
				scope = callback;
				callback = config;
				config = this.generatorConfig;
			} else {
				Ext.apply(config, this.generatorConfig);
			}
			var viewGenerator = this.createViewGenerator();
			var viewClass = Ext.create(this.viewConfigClass);
			var schema = {
				viewConfig: viewClass.generate(config.dashboards)
			};
			var viewConfig = Ext.apply({
				schema: schema
			}, config);
			viewGenerator.generate(viewConfig, function(viewConfig) {
				callback.call(scope, viewConfig);
				viewGenerator.destroy();
				viewGenerator = null;
			});
		},

		/**
		 * Генерирует модель и модель представления для модуля итогов.
		 * @param {Object} config Конфигурация сборки схемы.
		 * @param {Function} callback Функция обратного вызова.
		 * @param {Object} scope Контекст выполнения функции обратного вызова.
		 */
		build: function(config, callback, scope) {
			var defaultConfig = {
				sortFn: this.defaultDashboardsSortFn
			};
			var generatorConfig = this.generatorConfig = Ext.apply({}, config, defaultConfig);
			this.requireDashboards(generatorConfig, function(dashboardCollection) {
				Ext.apply(generatorConfig, {
					dashboards: dashboardCollection
				});
				this.buildViewModel(generatorConfig, function(viewModelClass) {
					generatorConfig.viewModelClass = viewModelClass;
					this.buildView(generatorConfig, function(view) {
						callback.call(scope, viewModelClass, view);
					}, this);
				}, this);
			}, this);
		},

		/**
		 * Очищает внутрение параметры.
		 * @overridden
		 */
		destroy: function() {
			this.generatorConfig = null;
			this.callParent(arguments);
		}
	});

	return dashboardBuilder;

});
