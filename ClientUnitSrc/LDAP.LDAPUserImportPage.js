define("LDAPUserImportPage", ["terrasoft", "LDAPUserImportPageResources", "ConfigurationConstants", "ServiceHelper",
		"StorageUtilities", "BusinessRuleModule", "LookupUtilities", "GridUtilitiesV2", "ConfigurationGrid",
		"ConfigurationGridGenerator", "ConfigurationGridUtilities"],
	function(Terrasoft, resources, ConfigurationConstants, ServiceHelper, StorageUtilities, BusinessRuleModule) {
		var localizableStrings = resources.localizableStrings;
		/**
		 * Конфиг схемы сущности модуля.
		 */
		var entitySchemaColumnsConfig = {
			Id: {
				columnPath: "Id",
				dataValueType: this.Terrasoft.DataValueType.LOOKUP.GUID,
				isRequired: true,
				type: this.Terrasoft.ViewModelColumnType.ENTITY_COLUMN
			},
			Name: {
				columnPath: "Name",
				dataValueType: this.Terrasoft.DataValueType.TEXT,
				caption: localizableStrings.NameCaption,
				type: this.Terrasoft.ViewModelColumnType.ENTITY_COLUMN
			},
			LDAPEntryId: {
				columnPath: "LDAPEntryId",
				dataValueType: this.Terrasoft.DataValueType.TEXT,
				type: this.Terrasoft.ViewModelColumnType.ENTITY_COLUMN
			},
			SysAdminUnit: {
				columnPath: "SysAdminUnit",
				dataValueType: this.Terrasoft.DataValueType.LOOKUP,
				isLookup: true,
				isSimpleLookup: true,
				caption: localizableStrings.SysAdminUnitCaption,
				isRequired: false,
				type: this.Terrasoft.ViewModelColumnType.ENTITY_COLUMN
			},
			FullName: {
				columnPath: "FullName",
				dataValueType: this.Terrasoft.DataValueType.TEXT,
				type: this.Terrasoft.ViewModelColumnType.ENTITY_COLUMN
			},
			Company: {
				columnPath: "Company",
				dataValueType: this.Terrasoft.DataValueType.TEXT,
				type: this.Terrasoft.ViewModelColumnType.ENTITY_COLUMN
			},
			Email: {
				columnPath: "Email",
				dataValueType: this.Terrasoft.DataValueType.TEXT,
				type: this.Terrasoft.ViewModelColumnType.ENTITY_COLUMN
			},
			Phone: {
				columnPath: "Phone",
				dataValueType: this.Terrasoft.DataValueType.TEXT,
				type: this.Terrasoft.ViewModelColumnType.ENTITY_COLUMN
			},
			JobTitle: {
				columnPath: "JobTitle",
				dataValueType: this.Terrasoft.DataValueType.TEXT,
				type: this.Terrasoft.ViewModelColumnType.ENTITY_COLUMN
			},
			IsActive: {
				columnPath: "IsActive",
				dataValueType: this.Terrasoft.DataValueType.BOOLEAN,
				type: this.Terrasoft.ViewModelColumnType.ENTITY_COLUMN
			}
		};
		return {
			entitySchemaName: null,
			mixins: {
				GridUtilities: "Terrasoft.GridUtilities",
				ConfigurationGridUtilites: "Terrasoft.ConfigurationGridUtilities"
			},
			details: /**SCHEMA_DETAILS*/{}/**SCHEMA_DETAILS*/,
			attributes: {
				/**
				 * Коллекция данных для представления таблицы
				 */
				"GridData": {
					dataValueType: this.Terrasoft.DataValueType.COLLECTION
				},

				/**
				 * Коллекция выбранных записей из представления таблицы
				 */
				"SelectedRows": {
					dataValueType: this.Terrasoft.DataValueType.COLLECTION
				},

				/**
				 * Признак множественного выбора
				 */
				"IsMultiSelect": {dataValueType: Terrasoft.DataValueType.BOOLEAN},

				/**
				 * Признак выбора всех записей
				 */
				"IsSelectAllRecords": {dataValueType: Terrasoft.DataValueType.BOOLEAN},

				/**
				 *  Название коллекции меню выпадающего списка в функциональной кнопке.
				 */
				"CustomActionsButtonMenuItems": {
					"dataValueType": this.Terrasoft.DataValueType.COLLECTION
				},

				/**
				 * Заголовок кнопки "Выбрать всех"
				 */
				"SelectAllButtonCaption": {
					dataValueType: Terrasoft.DataValueType.TEXT,
					dependencies: [
						{
							columns: ["IsSelectAllRecords"],
							methodName: "onIsSelectAllRecordsChanged"
						}
					]
				},

				/**
				 * Заголовок кнопки "Режим множественного выбора"
				 */
				"SwitchMultiSelectModeButtonCaption": {
					dataValueType: Terrasoft.DataValueType.TEXT,
					dependencies: [
						{
							columns: ["IsMultiSelect"],
							methodName: "onIsMultiSelectChanged"
						}
					]
				},

				/**
				 * Колонки для коллекции таблицы
				 */
				"Id": entitySchemaColumnsConfig.Id,
				"Name": entitySchemaColumnsConfig.Name,
				"LDAPEntryId": entitySchemaColumnsConfig.LDAPEntryId,
				"SysAdminUnit": entitySchemaColumnsConfig.SysAdminUnit
			},
			messages: {
				/**
				 * Публикация сообщения изменения заголовка
				 */
				"ChangeHeaderCaption": {
					mode: this.Terrasoft.MessageMode.PTP,
					direction: this.Terrasoft.MessageDirectionType.PUBLISH
				},

				/**
				 * Публикация сообщения для возвращения предидущего состояния.
				 */
				"BackHistoryState": {
					mode: this.Terrasoft.MessageMode.BROADCAST,
					direction: this.Terrasoft.MessageDirectionType.PUBLISH
				},

				/**
				 * @message LookupInfo
				 * Для работы LookupUtilities. Получение настроек лукапа.
				 */
				"LookupInfo": {
					mode: this.Terrasoft.MessageMode.PTP,
					direction: this.Terrasoft.MessageDirectionType.SUBSCRIBE
				},

				/**
				 * @message ResultSelectedRows
				 * Возвращает выбранные строки в справочнике
				 */
				"ResultSelectedRows": {
					mode: this.Terrasoft.MessageMode.PTP,
					direction: this.Terrasoft.MessageDirectionType.SUBSCRIBE
				}

			},
			methods: {
				/**
				 * Инициализирует объекты на странице.
				 * @protected
				 * @overridden
				 */
				init: function(callback) {
					this.callParent([function() {
						this.initHeader();
						this.initEntitySchema();
						this.setGridData();
						this.setIsEditable(true);
						this.initButtonCaptions();
						this.initCustomActionsButtonMenuItems();
						this.initGridRowViewModel(function() {
							this.getGridCollection(function(collection) {
								this.loadGridCollection(collection);
								callback.call(this);
							});
						}, this);
					}, this]);
				},

				/**
				 * Устанавливает заголовок страницы.
				 * @overridden
				 */
				initHeader: function() {
					this.sandbox.publish("ChangeHeaderCaption", {
						caption: this.get("Resources.Strings.LDAPUserImportPageCaption")
					});
				},

				/**
				 * Инициализирует схему сущности модуля.
				 * @protected
				 * @virtual
				 */
				initEntitySchema: function() {
					this.entitySchema = this.Ext.create("Terrasoft.BaseEntitySchema", {
						columns: entitySchemaColumnsConfig,
						primaryDisplayColumnName: "Name"
					});
				},

				/**
				 * Устанавливает коллекцию строк реестра.
				 * @protected
				 * @virtual
				 */
				setGridData: function() {
					this.set("GridData", this.Ext.create("Terrasoft.BaseViewModelCollection"));
				},

				/**
				 * Возвращает выбранные записb в реестре.
				 * @protected
				 * @return {Terrasoft.Collection|null} Список записей
				 */
				getRowsForImport: function() {
					var isMultiSelect = this.get("IsMultiSelect");
					var gridData = this.getGridData();
					if (!isMultiSelect) {
						return gridData;
					}
					var result = this.get("SelectedRows");
					if (!result) {
						return result;
					}
					var collection = this.Ext.create("Terrasoft.Collection");
					result.forEach(function(record) {
						collection.add(record, gridData.collection.getByKey(record));
					});
					return collection;
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
				 * Запускает процессы иморта и синхронизации пользователей LDAP.
				 * @protected
				 * @overridden
				 */
				save: function() {
					var selectedUsersForImport = this.getRowsForImport();
					if (!selectedUsersForImport.collection || selectedUsersForImport.collection.length === 0) {
						return;
					}
					this.syncLDAPUsers(this.getPreparedUserCollection(selectedUsersForImport, true),
						this.getModuleCallerGroup(), this);
					this.importLDAPUsers(this.getPreparedUserCollection(selectedUsersForImport, false),
						this.getPreparedGroup(this.getModuleCallerLDAPGroup()));
				},

				/**
				 * Получает коллекцию пользователей из реестра.
				 * @protected
				 * @param collection Коллекция данных реестра.
				 * @param withSysAdminUnit Признак необходимости в синхронизации с внутренним пользователем.
				 * @return {Array} Типизированная коллекция <LDAPUser>.
				 */
				getPreparedUserCollection: function(collection, withSysAdminUnit) {
					var userConfig = this.getLDAPUserConfig();
					var preparedUserCollection = [];
					var items = collection.getItems();
					items.forEach(function(item) {
						var user = this.Terrasoft.deepClone(userConfig);
						var values = item.values;
						if (!values) {
							return;
						}
						var sysAdminUnit = values.SysAdminUnit;
						var userValue = sysAdminUnit ? sysAdminUnit.value : null;
						if (withSysAdminUnit ? userValue !== null : userValue === null) {
							user.Id = values.LDAPEntryId;
							user.Name = values.Name;
							user.FullName = values.FullName;
							user.Company = values.Company;
							user.Email = values.Email;
							user.Phone = values.Phone;
							user.JobTitle = values.JobTitle;
							user.IsActive = values.IsActive;
							if (withSysAdminUnit) {
								user.SysAdminUnit = userValue;
								user.LDAPElement = values.Id;
							}
							preparedUserCollection.push(user);
						}
					});
					return preparedUserCollection;
				},

				/**
				 * Получает группу LDAP.
				 * @protected
				 * @param group Идентификатор группы LDAP.
				 * @return {object} Объект типа LDAPGroup.
				 */
				getPreparedGroup: function(group) {
					var groupConfig = this.getLDAPGroupConfig();
					var groups = this.get("LDAPGroups");
					var preparedGroup = groupConfig;
					groups.each(function(item) {
						if (item.Id === group) {
							preparedGroup.Id = item.LDAPEntryId;
							preparedGroup.Name = item.Name;
							preparedGroup.Dn = item.LDAPEntryDN;
						}
					}, this);
					return preparedGroup;
				},

				/**
				 * Запускает процесс импорта пользователей LDAP.
				 * @private
				 * @param users Коллекция пользователей для импорта.
				 * @param ldapGroup Идентификатор группы LDAP.
				 */
				importLDAPUsers: function(users, ldapGroup) {
					this.showBodyMask();
					var backgroundMessage = this.get("Resources.Strings.ImportProcessIsInBackground");
					this.Terrasoft.utils.showInformation(backgroundMessage, null, null, {buttons: ["ok"]});
					if (!users) {
						users = this.getLDAPUserConfig();
					}
					if (!ldapGroup) {
						ldapGroup = this.getLDAPGroupConfig();
					}
					var dataSend = {
						ldapUsers: users,
						ldapGroup: ldapGroup
					};
					var config = {
						scope: this,
						serviceName: "LDAPSysSettingsService",
						methodName: "ImportLDAPUsers",
						data: dataSend,
						callback: this.Terrasoft.emptyFn
					};
					ServiceHelper.callService(config);
					this.hideBodyMask();
					this.sandbox.publish("BackHistoryState");
				},

				/**
				 * Запускает процесс синхронизации пользователей LDAP с внутренними пользователями.
				 * @private
				 * @param users Коллекция пользователей для синхронизации.
				 * @param group Идентификатор внутренней группы.
				 * @param scope Область видимости модели представления.
				 */
				syncLDAPUsers: function(users, group, scope) {
					if (!group) {
						group = ConfigurationConstants.SysAdminUnit.Id.AllEmployees;
					}
					users.forEach(function(item) {
						var values = {
							Id: item.SysAdminUnit,
							Name: item.Name,
							LDAPEntryId: item.Id,
							LDAPEntry: item.Name,
							LDAPElement: item.LDAPElement,
							SynchronizeWithLDAP: true
						};
						var dataSend = {
							jsonObject: this.Ext.encode(values),
							roleId: group
						};
						var config = {
							scope: this,
							serviceName: "AdministrationService",
							methodName: "UpdateOrCreateUser",
							data: dataSend,
							callback: scope.addSysUserInRole(users, group)
						};
						ServiceHelper.callService(config);
					});
				},

				/**
				 * Запускает процесс добавления синхронизированных пользователей в выбранную группу.
				 * @private
				 * @param users Коллекция пользователей для синхронизации.
				 * @param group Идентификатор внутренней группы.
				 */
				addSysUserInRole: function(users, group) {
					if (!group || group === ConfigurationConstants.SysAdminUnit.Id.AllEmployees) {
						return;
					}
					var userIds = [];
					users.forEach(function(item) {
						userIds.push(item.SysAdminUnit);
					});
					var dataSend = {
						userIds: this.Ext.encode(userIds),
						roleId: group
					};
					var config = {
						scope: this,
						serviceName: "AdministrationService",
						methodName: "AddUsersInRole",
						data: dataSend,
						callback: this.Terrasoft.emptyFn
					};
					ServiceHelper.callService(config);
				},

				/**
				 * Получает конфиг объекта типа LDAPUser.
				 * @private
				 * @return {object} Конфиг.
				 */
				getLDAPUserConfig: function() {
					return {
						Id: "",
						Name: "",
						FullName: "",
						Company: "",
						Email: "",
						Phone: "",
						JobTitle: "",
						IsActive: true
					};
				},

				/**
				 * Получает конфиг объекта типа LDAPGroup.
				 * @private
				 * @return {object} Конфиг
				 */
				getLDAPGroupConfig: function() {
					return {
						Id: "",
						Name: "",
						Dn: ""
					};
				},

				/**
				 * Получает идентификатор внутренней группы.
				 * @protected
				 * @virtual
				 * @return {*} Идентификатор группы.
				 */
				getModuleCallerGroup: function() {
					return StorageUtilities.getItem("GroupId");
				},

				/**
				 * Получает идентификатор группы LDAP.
				 * @protected
				 * @virtual
				 * @return {*} Идентификатор группы LDAP.
				 */
				getModuleCallerLDAPGroup: function() {
					return StorageUtilities.getItem("LdapGroupId");
				},

				/**
				 * Возвращает на предыдущий модуль.
				 * @protected
				 * @virtual
				 */
				cancel: function() {
					this.sandbox.publish("BackHistoryState");
				},

				/**
				 * Получает коллекцию реестра.
				 * @protected
				 * @virtual
				 * @param callback
				 */
				getGridCollection: function(callback) {
					this.loadLDAPGroupCollection(this.setLDAPGroups);
					this.loadLDAPUserCollection(callback);
				},

				/**
				 * Загружает коллекцию пользователей LDAP.
				 * @protected
				 * @param callback Постобработчик коллекции LDAP.
				 */
				loadLDAPUserCollection: function(callback) {
					var esq = this.Ext.create("Terrasoft.EntitySchemaQuery", {
						rootSchemaName: "LDAPElement"
					});
					esq.addColumn("Id");
					esq.addColumn("Name");
					esq.addColumn("LDAPEntryId");
					esq.addColumn("FullName");
					esq.addColumn("Company");
					esq.addColumn("Email");
					esq.addColumn("Phone");
					esq.addColumn("JobTitle");
					esq.addColumn("IsActive");
					esq.filters.add("IsUser", this.Terrasoft.createColumnFilterWithParameter(
						this.Terrasoft.ComparisonType.EQUAL, "Type", ConfigurationConstants.SysAdminUnit.Type.User));
					esq.filters.add("BindingNotExists", this.Terrasoft.createNotExistsFilter("[SysAdminUnit:LDAPElement].Id"));
					esq.filters.add("LdapGroup", this.Terrasoft.createColumnFilterWithParameter(
						this.Terrasoft.ComparisonType.EQUAL, "[LDAPUserInLDAPGroup:LDAPUser].LDAPGroup", StorageUtilities.getItem("LdapGroupId")));
					esq.getEntityCollection(function(result) {
						var ldapUserCollection = this.Ext.create("Terrasoft.Collection");
						if (result.success) {
							result.collection.each(function(item) {
								var ldapUser = {
									Id: item.get("Id"),
									Name: item.get("Name"),
									LDAPEntryId: item.get("LDAPEntryId"),
									FullName: item.get("FullName"),
									Company: item.get("Company"),
									Email: item.get("Email"),
									Phone: item.get("Phone"),
									JobTitle: item.get("JobTitle"),
									IsActive: item.get("IsActive")
								};
								ldapUserCollection.add(ldapUser.Id, ldapUser);
							});
						}
						callback.call(this, ldapUserCollection);
					}, this);
				},

				/**
				 * Загружает коллекцию групп LDAP.
				 * @protected
				 * @param callback Постобаботчик коллекции групп LDAP.
				 */
				loadLDAPGroupCollection: function(callback) {
					var esq = this.Ext.create("Terrasoft.EntitySchemaQuery", {
						rootSchemaName: "LDAPElement"
					});
					esq.addColumn("Id");
					esq.addColumn("Name");
					esq.addColumn("LDAPEntryId");
					esq.addColumn("LDAPEntryDN");
					esq.filters.add("IsGroup", this.Terrasoft.createColumnFilterWithParameter(
						this.Terrasoft.ComparisonType.EQUAL, "Type", ConfigurationConstants.SysAdminUnit.Type.Team));
					esq.getEntityCollection(function(result) {
						var ldapGroupCollection = this.Ext.create("Terrasoft.Collection");
						if (result.success) {
							result.collection.each(function(item) {
								var ldapGroup = {
									Id: item.get("Id"),
									Name: item.get("Name"),
									LDAPEntryId: item.get("LDAPEntryId"),
									LDAPEntryDN: item.get("LDAPEntryDN")
								};
								ldapGroupCollection.add(ldapGroup.Id, ldapGroup);
							});
						}
						callback.call(this, ldapGroupCollection);
					}, this);
				},

				/**
				 * Устанавливает группы LDAP.
				 * @protected
				 * @virtual
				 * @param collection Коллекция групп LDAP.
				 */
				setLDAPGroups: function(collection) {
					this.set("LDAPGroups", collection);
				},

				/**
				 * Получает конфиг строчки реестра.
				 * @protected
				 * @virtual
				 * @return {object} Конфиг строчки реестра.
				 */
				getGridRowColumnsConfig: function() {
					return this.Terrasoft.deepClone(entitySchemaColumnsConfig);
				},

				/**
				 * Получает название модели представления строчки реестра.
				 * @protected
				 * @virtual
				 * @return {string} Название модели представления.
				 */
				getGridRowViewModelName: function() {
					return "Terrasoft.BasePageV2ConfigurationGridRowViewModel";
				},

				/**
				 * Загружает коллекцию данных в реестр.
				 * @protected
				 * @param dataCollection Коллекция данных реестра.
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
				 * @param dataCollection Коллекция данных реестра.
				 * @return {object} Коллекция моделей представления строк реестра.
				 */
				getGridRowCollection: function(dataCollection) {
					var collection = {};
					var scope = this;
					var loadLookupData = function() {
						scope.loadLookupData.apply(scope, arguments);
					};
					var rowConfig = this.getGridRowColumnsConfig();
					var gridRowviewModelName = this.getGridRowViewModelName();
					dataCollection.each(function(dataItem) {
						var viewModel = this.Ext.create(gridRowviewModelName, {
							Ext: this.Ext,
							Terrasoft: this.Terrasoft,
							entitySchema: this.entitySchema,
							sandbox: this.sandbox,
							rowConfig: rowConfig,
							loadLookupData: loadLookupData,
							values: {
								Id: dataItem.Id,
								Name: dataItem.Name,
								LDAPEntryId: dataItem.LDAPEntryId,
								SysAdminUnit: {
									value: null,
									displayValue: null
								},
								SysAdminUnitList: this.Ext.create("Terrasoft.Collection"),
								FullName: dataItem.FullName,
								Company: dataItem.Company,
								Email: dataItem.Email,
								Phone: dataItem.Phone,
								JobTitle: dataItem.JobTitle,
								IsActive: dataItem.IsActive
							},
							rules: {
								"Name": {
									"DisableName": {
										ruleType: BusinessRuleModule.enums.RuleType.BINDPARAMETER,
										property: BusinessRuleModule.enums.Property.ENABLED,
										conditions: [{
											leftExpression: {
												type: BusinessRuleModule.enums.ValueType.CONSTANT,
												value: true
											},
											comparisonType: this.Terrasoft.ComparisonType.NOT_EQUAL,
											rightExpression: {
												type: BusinessRuleModule.enums.ValueType.CONSTANT,
												value: true
											}
										}]
									}
								}
							}
						});
						collection[dataItem.Id] = viewModel;
					}, this);
					return collection;
				},

				/**
				 * Загружает набор данных по lookup колонке.
				 * @protected
				 * @overridden
				 * @param {String} filterValue Фильтр для primaryDisplayColumn.
				 * @param {Terrasoft.Collection} list Коллекция, в которую будут загружены данные.
				 * @param {String} columnName Имя колонки ViewModel.
				 */
				loadLookupData: function(filterValue, list, columnName) {
					if (columnName !== "SysAdminUnit") {
						this.callParent(filterValue, list, columnName);
					}
					if (!list) {
						list = this.Ext.create("Terrasoft.Collection");
					}
					list.clear();
					var collection = {};
					this.set("PrepareListColumnName", columnName);
					var esq = this.Ext.create("Terrasoft.EntitySchemaQuery", {
						rootSchemaName: "SysAdminUnit"
					});
					esq.addColumn("Id");
					esq.addColumn("Name");
					esq.filters.add("ContactExistsFilter", this.Terrasoft.createColumnIsNotNullFilter("Contact"));
					esq.filters.add("NotSynchronizedFilter", this.Terrasoft.createColumnFilterWithParameter(
						this.Terrasoft.ComparisonType.EQUAL, "SynchronizeWithLDAP", false));
					var sysAdminUnitNotInFilter = this.getSysAdminUnitNotInFilter(this.getPreparedUserCollection(
						this.getGridData(), true));
					if (sysAdminUnitNotInFilter) {
						esq.filters.add(sysAdminUnitNotInFilter);
					}
					esq.getEntityCollection(function(result) {
						if (result.success) {
							result.collection.each(function(item) {
								var Id = item.get("Id");
								var Name = item.get("Name");
								collection[Id] = {
									value: Id,
									displayValue: Name
								};
							});
						}
						var filtersCollection = this.Terrasoft.createFilterGroup();
						if (collection.length > 0) {
							filtersCollection.add("existsFilter", this.Terrasoft.createColumnInFilterWithParameters(
								"Id", collection));
						}
						else {
							filtersCollection.add("emptyFilter", this.Terrasoft.createColumnIsNullFilter("Id"));
						}
						this.set(columnName + "Filters", filtersCollection);
						list.loadAll(collection);
					}, this);
				},

				/**
				 * Получает фильтр для коллекции SysAdminUnit на отсутсвие вхождений.
				 * @param collection Типизированная коллекция <LDAPUser>.
				 * @return {Terrasoft.FilterGroup} Созданный фильтр.
				 */
				getSysAdminUnitNotInFilter: function(collection) {
					var filter = null;
					var sysAdminUnitCollection = [];
					collection.forEach(function(item) {
						sysAdminUnitCollection.push(item.SysAdminUnit);
					});
					if (sysAdminUnitCollection.length) {
						filter = Terrasoft.createColumnInFilterWithParameters("Id", sysAdminUnitCollection);
						filter.comparisonType = Terrasoft.ComparisonType.NOT_EQUAL;
					}
					return filter;
				},

				/**
				 * Формирует фильтры, которые накладываются на справочные поля.
				 * @overridden
				 * @private
				 * @param {String} columnName Название колонки.
				 * @return {Terrasoft.FilterGroup} Возвращает группу фильтров.
				 */
				getLookupQueryFilters: function(columnName) {
					var prepareListColumnName = this.get("PrepareListColumnName");
					var prepareListFilters = this.get(prepareListColumnName + "Filters");
					var filterGroup = this.callParent([columnName]);
					if (columnName === prepareListColumnName && prepareListFilters) {
						filterGroup.add(prepareListFilters);
					}
					return filterGroup;
				},

				/**
				 * Возвращает экземпляр EntitySchemaQuery для получения данных lookup колонки.
				 * Накладывает дополнительную фильтрацию на данные lookup колонки.
				 * @overridden
				 * @private
				 * @param {String} filterValue Фильтр для primaryDisplayColumn.
				 * @param {String} columnName Имя колонки ViewModel.
				 * @param {Boolean} isLookup Признак справочного поля.
				 * @return {Terrasoft.EntitySchemaQuery} Экземпляр EntitySchemaQuery по lookup колонке.
				 */
				getLookupQuery: function(filterValue, columnName, isLookup) {
					var prepareListColumnName = this.get("PrepareListColumnName");
					var prepareListFilters = this.get(prepareListColumnName + "Filters");
					var entitySchemaQuery = this.callParent([filterValue, columnName, isLookup]);
					if (columnName === prepareListColumnName && prepareListFilters) {
						entitySchemaQuery.filters.add(prepareListColumnName + "Filter", prepareListFilters);
					}
					return entitySchemaQuery;
				},

				/**
				 * Возвращает активную строку.
				 * @protected
				 * @return {Terrasoft.BaseViewModel} Активная строка.
				 */
				getActiveRow: function() {
					var selectedItems = this.getSelectedItems();
					if (this.Ext.isEmpty(selectedItems)) {
						return null;
					}
					var primaryColumnValue = selectedItems[0];
					if (primaryColumnValue) {
						var gridData = this.getGridData();
						return gridData.get(primaryColumnValue);
					}
				},

				/**
				 * Сохраняет изменения строки реестра.
				 * @overridden
				 * @param {Object} (row) Cтрока
				 * @param {Function} (callback) callback-функция.
				 * @param {Object} (scope) Контекст выполнения callback-функции.
				 */
				saveRowChanges: function(row, callback, scope) {
					row = this.Terrasoft.isGUID(row) ? this.getGridData().get(row) : row;
					var isValidRow = row.validate();
					scope = scope || this;
					callback = callback || this.Terrasoft.emptyFn;
					if (this.getIsRowChanged(row)) {
						var changedValues = row.changedValues;
						var columnsConfig = this.getGridRowColumnsConfig();
						this.Terrasoft.each(changedValues, function(value, columnName) {
							var column = columnsConfig[columnName];
							var columnValidationInfo = row.validationInfo.get(columnName) || {};
							var isValidColumn = columnValidationInfo.isValid;
							if (isValidColumn && column &&
								(column.type === this.Terrasoft.ViewModelColumnType.ENTITY_COLUMN) &&
								(column.isCollection !== true)) {
								row.values[columnName] = value;
							}
						}, this);
						row.changedValues = {};
						if (!isValidRow) {
							return;
						}
						callback.call(scope);
					}
					callback.call(scope);
				},

				/**
				 * Отменяет изменения активной строки реестра.
				 * @overridden
				 * @param {String} id Идентификатор записи.
				 */
				discardChanges: function(id) {
					if (!id) {
						return;
					}
					var activeRow = this.getActiveRow();
					var values = activeRow.values;
					var options = {preventValidation: true};
					var columnsConfig = this.getGridRowColumnsConfig();
					this.Terrasoft.each(columnsConfig, function(column) {
						if ((column.type === this.Terrasoft.ViewModelColumnType.ENTITY_COLUMN) &&
							(column.isCollection !== true)) {
							var columnName = column.columnPath;
							activeRow.set(columnName, values[columnName], options);
						}
					}, this);
					activeRow.changedValues = {};
				},

				/**
				 * Удаляет запись активной строки реестра.
				 * @protected
				 * @overridden
				 */
				deleteRecords: function() {
					var activeRow = this.getActiveRow();
					this.removeGridRecords([activeRow.get("Id")]);
				},

				/**
				 * Включить/выключить множественный режим.
				 * @protected
				 */
				switchMultiSelectMode: function() {
					var multiSelect = this.get("IsMultiSelect");
					if (multiSelect) {
						this.set("SelectedRows", null);
					}
					this.set("IsMultiSelect", !multiSelect);
				},

				/**
				 * Выбрать все строки реестра.
				 * @protected
				 */
				selectAllUsers: function() {
					var IsSelectAllRecords = this.get("IsSelectAllRecords");
					this.set("IsSelectAllRecords", !IsSelectAllRecords);
					if (!IsSelectAllRecords) {
						this.set("SelectedRows", this.getGridData().collection.keys);
						return;
					}
					this.set("SelectedRows", []);
				},

				/**
				 * Инициализирует коллекцию действий раздела.
				 * @protected
				 */
				initCustomActionsButtonMenuItems: function() {
					this.set("CustomActionsButtonMenuItems", this.getCustomSectionActions());
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
					actionMenuItems.addItem(this.getSelectAllButton());
					return actionMenuItems;
				},

				/**
				 * Возвращает кнопку "Актуализировать роли".
				 * @protected
				 * @return {Terrasoft.Button} Возвращает кнопку.
				 */
				getActualizeAdminUnitInRoleButton: function() {
					return this.getButtonMenuItem({
						"Caption": {"bindTo": "SwitchMultiSelectModeButtonCaption"},
						"Click": {"bindTo": "switchMultiSelectMode"}
					});
				},

				getSelectAllButton: function() {
					/**
					 * Возвращает кнопку "Выбрать всех".
					 * @protected
					 * @return {Terrasoft.Button} Возвращает кнопку.
					 */
					return this.getButtonMenuItem({
						"Caption": {"bindTo": "SelectAllButtonCaption"},
						"Click": {"bindTo": "selectAllUsers"},
						"Enabled": {"bindTo": "IsMultiSelect"}
					});
				},

				/**
				 * Инициализирует заголовки кнопок действий.
				 * @protected
				 */
				initButtonCaptions: function() {
					this.set("SelectAllButtonCaption", resources.localizableStrings.SelectAllCaption);
					this.set("SwitchMultiSelectModeButtonCaption", resources.localizableStrings.TurnOnMultiSelectMode);
				},

				/**
				 *Установить заголовок кнопки "Множественный режим" "Выбрать/снять всех".
				 * @private
				 */
				onIsSelectAllRecordsChanged: function() {
					var buttonCaption = this.get("IsSelectAllRecords")
						? resources.localizableStrings.DisselectAllCaption
						: resources.localizableStrings.SelectAllCaption;
					this.set("SelectAllButtonCaption", buttonCaption);
				},

				/**
				 * Установить заголовок кнопки "Множественный режим"
				 * @private
				 */
				onIsMultiSelectChanged: function() {
					var buttonCaption = this.get("IsMultiSelect")
						? resources.localizableStrings.TurnOffMultiSelectMode
						: resources.localizableStrings.TurnOnMultiSelectMode;
					this.set("SwitchMultiSelectModeButtonCaption", buttonCaption);
				}

			},
			diff: [
				{
					"operation": "insert",
					"name": "CenterPanelGridLayout",
					"values": {
						"id": "CenterPanelGridLayout",
						"selectors": {
							"wrapEl": "#CenterPanelGridLayout"
						},
						"classes": {
							"textClass": "center-panel"
						},
						"itemType": this.Terrasoft.ViewItemType.GRID_LAYOUT,
						"items": []
					}
				},
				{
					"operation": "insert",
					"name": "HeaderContainer",
					"parentName": "CenterPanelGridLayout",
					"propertyName": "items",
					"values": {
						"id": "HeaderContainer",
						"selectors": {
							"wrapEl": "#HeaderContainer"
						},
						"itemType": this.Terrasoft.ViewItemType.CONTAINER,
						"layout": {
							"column": 0,
							"row": 0,
							"colSpan": 24
						},
						"items": []
					}
				},
				{
					"operation": "insert",
					"parentName": "HeaderContainer",
					"propertyName": "items",
					"name": "SaveButton",
					"values": {
						"itemType": this.Terrasoft.ViewItemType.BUTTON,
						"caption": {
							"bindTo": "Resources.Strings.SaveButtonCaption"
						},
						"classes": {
							"textClass": "actions-button-margin-right"
						},
						"click": {
							"bindTo": "save"
						},
						"style": "green",
						"layout": {
							"column": 0,
							"row": 0,
							"colSpan": 2
						}
					}
				},
				{
					"operation": "insert",
					"parentName": "HeaderContainer",
					"propertyName": "items",
					"name": "CancelButton",
					"values": {
						"itemType": this.Terrasoft.ViewItemType.BUTTON,
						"caption": {
							"bindTo": "Resources.Strings.CancelButtonCaption"
						},
						"classes": {
							"textClass": "actions-button-margin-right"
						},
						"click": {
							"bindTo": "cancel"
						},
						"style": "default",
						"layout": {
							"column": 6,
							"row": 0,
							"colSpan": 2
						}
					}
				},
				{
					"operation": "insert",
					"name": "ToolsButton",
					"parentName": "HeaderContainer",
					"propertyName": "items",
					"index": 10,
					"values": {
						"itemType": Terrasoft.ViewItemType.BUTTON,
						//"imageConfig": {"bindTo": "Resources.Images.ToolsButtonImage"},
						"caption": {
							"bindTo": "Resources.Strings.ActionsButtonCaption"
						},
						"style": "default",
						"menu": {
							"items": {"bindTo": "CustomActionsButtonMenuItems"}
						}
					}
				},
				{
					"operation": "insert",
					"name": "MainContainer",
					"parentName": "CenterPanelGridLayout",
					"propertyName": "items",
					"values": {
						"id": "MainContainer",
						"selectors": {
							"wrapEl": "#MainContainer"
						},
						"itemType": this.Terrasoft.ViewItemType.CONTAINER,
						"layout": {
							"column": 0,
							"row": 2,
							"colSpan": 24
						},
						"items": []
					}
				},
				{
					"operation": "insert",
					"name": "DataGrid",
					"parentName": "MainContainer",
					"propertyName": "items",
					"values": {
						"className": "Terrasoft.ConfigurationGrid",
						"primaryColumnName": "Id",
						"primaryDisplayColumnName": "Name",
						"itemType": this.Terrasoft.ViewItemType.GRID,
						"type": "listed",
						"generator": "ConfigurationGridGenerator.generatePartial",
						"generateControlsConfig": {bindTo: "generateActiveRowControlsConfig"},
						"collection": {"bindTo": "GridData"},
						"selectedRows": {"bindTo": "SelectedRows"},
						"activeRow": {"bindTo": "ActiveRow"},
						"unSelectRow": {"bindTo": "unSelectRow"},
						"isEmpty": {"bindTo": "IsGridEmpty"},
						"multiSelect": {"bindTo": "IsMultiSelect"},
						"isLoading": {"bindTo": "IsGridLoading"},
						"initActiveRowKeyMap": {bindTo: "initActiveRowKeyMap"},
						"activeRowAction": {bindTo: "onActiveRowAction"},
						"activeRowActions": [
							{
								"className": "Terrasoft.Button",
								"style": this.Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
								"tag": "save",
								"markerValue": "save",
								"imageConfig": {"bindTo": "Resources.Images.SaveIcon"}
							},
							{
								"className": "Terrasoft.Button",
								"style": this.Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
								"tag": "cancel",
								"markerValue": "cancel",
								"imageConfig": {"bindTo": "Resources.Images.CancelIcon"}
							},
							{
								"className": "Terrasoft.Button",
								"style": this.Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
								"tag": "remove",
								"markerValue": "remove",
								"imageConfig": {"bindTo": "Resources.Images.RemoveIcon"}
							}
						],
						"columnsConfig": [
							{
								cols: 12,
								key: [{
									name: {
										bindTo: "Name"
									}
								}]
							},
							{
								cols: 12,
								key: [{
									name: {
										bindTo: "SysAdminUnit"
									}
								}]
							}
						],
						"captionsConfig": [
							{
								cols: 12,
								name: localizableStrings.NameCaption
							},
							{
								cols: 12,
								name: localizableStrings.SysAdminUnitCaption
							}
						]
					}
				}
			]
		};
	});