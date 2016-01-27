define("LDAPServerSettings", ["terrasoft", "LDAPServerSettingsResources", "ServiceHelper", "SecurityUtilities",
		"ContextHelpMixin"],
	function(Terrasoft, resources, ServiceHelper) {
		return {
			messages: {
				/**
				 * Публикация сообщения изменения заголовка
				 */
				"ChangeHeaderCaption": {
					mode: Terrasoft.MessageMode.PTP,
					direction: Terrasoft.MessageDirectionType.PUBLISH
				},

				/**
				 * Публикация сообщения для возвращения предидущего состояния.
				 */
				"BackHistoryState": {
					mode: Terrasoft.MessageMode.BROADCAST,
					direction: Terrasoft.MessageDirectionType.PUBLISH
				}

			},
			mixins: {

				/**
				 * @class SecurityUtilitiesMixin реализует проверку прав доступа по операциям.
				 */
				SecurityUtilitiesMixin: "Terrasoft.SecurityUtilitiesMixin",

				/**
				 * @class ContextHelpMixin Реализует возможность работы с модулем открытия справки.
				 */
				ContextHelpMixin: "Terrasoft.ContextHelpMixin"
			},
			attributes: {
				LDAPServer: {
					dataValueType: Terrasoft.DataValueType.TEXT,
					type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					isRequired: true,
					value: ""
				},
				LDAPUsersEntry: {
					dataValueType: Terrasoft.DataValueType.TEXT,
					type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					isRequired: true,
					value: ""
				},
				LDAPGroupsEntry: {
					dataValueType: Terrasoft.DataValueType.TEXT,
					type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					isRequired: true,
					value: ""
				},
				LDAPUserCompanyAttribute: {
					dataValueType: Terrasoft.DataValueType.TEXT,
					type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					value: ""
				},
				LDAPAuthType: {
					dataValueType: Terrasoft.DataValueType.LOOKUP,
					type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					isRequired: true,
					value: ""
				},
				LDAPServerLogin: {
					dataValueType: Terrasoft.DataValueType.TEXT,
					type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					isRequired: true,
					value: ""
				},
				LDAPServerPassword: {
					dataValueType: Terrasoft.DataValueType.TEXT,
					type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					isRequired: true,
					value: ""
				},
				LDAPEntryModifiedOnAttribute: {
					dataValueType: Terrasoft.DataValueType.TEXT,
					type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					value: ""
				},
				LDAPSynchInterval: {
					dataValueType: Terrasoft.DataValueType.INTEGER,
					type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					isRequired: true,
					value: ""
				},
				LDAPLastSynchDate: {
					dataValueType: Terrasoft.DataValueType.DATE_TIME,
					type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					value: ""
				},
				LDAPUserFullNameAttribute: {
					dataValueType: Terrasoft.DataValueType.TEXT,
					type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					isRequired: true,
					value: ""
				},
				LDAPUserLoginAttribute: {
					dataValueType: Terrasoft.DataValueType.TEXT,
					type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					isRequired: true,
					value: ""
				},
				LDAPUserIdentityAttribute: {
					dataValueType: Terrasoft.DataValueType.TEXT,
					type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					isRequired: true,
					value: ""
				},
				LDAPUserEmailAttribute: {
					dataValueType: Terrasoft.DataValueType.TEXT,
					type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					value: ""
				},
				LDAPUserPhoneAttribute: {
					dataValueType: Terrasoft.DataValueType.TEXT,
					type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					value: ""
				},
				LDAPUserJobTitleAttribute: {
					dataValueType: Terrasoft.DataValueType.TEXT,
					type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					value: ""
				},
				LDAPGroupNameAttribute: {
					dataValueType: Terrasoft.DataValueType.TEXT,
					type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					isRequired: true,
					value: ""
				},
				LDAPGroupIdentityAttribute: {
					dataValueType: Terrasoft.DataValueType.TEXT,
					type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					isRequired: true,
					value: ""
				},
				LDAPUsersFilter: {
					dataValueType: Terrasoft.DataValueType.TEXT,
					type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					isRequired: true,
					value: ""
				},
				LDAPGroupsFilter: {
					dataValueType: Terrasoft.DataValueType.TEXT,
					type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					isRequired: true,
					value: ""
				},
				LDAPUsersInGroupFilter: {
					dataValueType: Terrasoft.DataValueType.TEXT,
					type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					isRequired: true,
					value: ""
				},

				/**
				 * Название операции, доступ на которую должен быть у пользователя для использования страницы.
				 */
				"SecurityOperationName": {
					"dataValueType": this.Terrasoft.DataValueType.STRING,
					"value": "CanManageAdministration"
				}
			},
			methods: {
				/**
				 * Возвращает на предыдущий модуль.
				 * @protected
				 * @virtual
				 */
				cancel: function() {
					this.sandbox.publish("BackHistoryState");
				},

				/**
				 * Устанавливает заголовок страницы настройки LDAP сервера.
				 * @protected
				 * @overridden
				 */
				init: function(callback, scope) {
					this.callParent([function() {
						this.checkAvailability(function() {
							this.set("LDAPEnumFieldName", "LDAPAuthType");
							this.set("LDAPLastSynchDateName", "LDAPLastSynchDate");
							this.sandbox.publish("ChangeHeaderCaption", {
								caption: resources.localizableStrings.CaptionLDAPServerSettings
							});
							this.callLDAPService("GetSysSettingValues", this.onGetSysSettingValues);
							callback.call(scope);
						});
						this.initContextHelp();
					}, this]);
				},

				/**
				 * @inheritdoc Terrasoft.ContextHelpMixin#getContextHelpCode
				 * @overriden
				 */
				getContextHelpCode: function() {
					return this.name;
				},

				/**
				 * Устанавливает значения контролов на странице
				 * @param response Коллекция ключей-значений
				 */
				onGetSysSettingValues: function(response) {
					var sysSettingsCollection = response.GetSysSettingValuesResult;
					if (!sysSettingsCollection) {
						return;
					}
					var ldapLastSynchDateName = this.get("LDAPLastSynchDateName");
					this.Terrasoft.SysSettings.querySysSettingsItem(ldapLastSynchDateName, function(date) {
						this.set(ldapLastSynchDateName, date);
						var lDAPEnumFieldName = this.get("LDAPEnumFieldName");
						sysSettingsCollection.forEach(function(item) {
							var key = item.Key;
							var value = item.Value;
							if (key !== lDAPEnumFieldName) {
								if(key === "LDAPServerPassword") {
									value = null;
								}
								this.set(key, value);
							}
							else {
								this.getColumnByName(key).referenceSchemaName = key;
								var esq = this.getLookupQuery(null, key, false);
								esq.enablePrimaryColumnFilter(value);
								esq.getEntityCollection(function(result) {
									if (result.success && result.collection.getCount()) {
										var entity = result.collection.getByIndex(0);
										var enumConfig = {
											value: entity.values.value,
											displayValue: entity.values.displayValue
										};
										this.set(key, enumConfig);
									}
								}, this);
							}
						}, this);
					}, this);
				},

				/**
				 * Вызывает сервис установки настроек LDAP
				 * @param methodName Вызываемый метод сервиса
				 * @param callback Постобработчик сервиса
				 */
				callLDAPService: function(methodName, callback) {
					ServiceHelper.callService({
						serviceName: "LDAPSysSettingsService",
						methodName: methodName,
						data: {
							request: this.collectValuesOfLDAPSettings()
						},
						callback: callback,
						scope: this
					});
				},

				/**
				 * Передает настройки LDAP сервера сервису.
				 * @protected
				 * @overridden
				 */
				save: function() {
					if (this.validate()) {
						var message = resources.localizableStrings.StartImportMessage;
						this.Terrasoft.utils.showInformation(message, null, null, {buttons: ["ok"]});
						this.sandbox.publish("BackHistoryState");
						this.callLDAPService("SetSysSettingValues", this.onSaved);
					}
				},

				/**
				 * Собирает значения колонок и формирует коллекцию JSON объектов.
				 * @protected
				 * @virtual
				 */
				collectValuesOfLDAPSettings: function() {
					var columnsCollection = this.columns;
					var filteredColumnsCollection = this.filterForColumns(columnsCollection);
					var prepareListColumnName = this.get("LDAPEnumFieldName");
					var ldapLastSynchDateName = this.get("LDAPLastSynchDateName");
					var LDAPSettingsCollection = [];
					for (var item in filteredColumnsCollection) {
						var key = filteredColumnsCollection[item].name;
						var value = this.get(filteredColumnsCollection[item].name);
						if (key === prepareListColumnName) {
							value = value.value ? value.value : value;
						}
						var KeyValuePairs = {
							"Key": key,
							"Value": value
						};
						if (key !== ldapLastSynchDateName && key !== prepareListColumnName + "List") {
							LDAPSettingsCollection.push(KeyValuePairs);
						}
					}
					return LDAPSettingsCollection;
				},

				/**
				 * Фильтрует название колонок по необходимому критерию.
				 * @protected
				 * @virtual
				 */
				filterForColumns: function(element) {
					var filter = "LDAP";
					var filteredCollection = [];
					for (var el in element) {
						if (el.substring(0, 4) === filter) {
							filteredCollection.push(element[el]);
						}
					}
					return (filteredCollection);
				},

				/**
				 * Получает список значений для выпадающего списка
				 * @param filter Фильтр выпадающего списка
				 */
				onPrepareLDAPAuthType: function(filter) {
					var prepareListColumnName = this.get("LDAPEnumFieldName");
					this.getColumnByName(prepareListColumnName).referenceSchemaName = prepareListColumnName;
					this.set("PrepareListColumnName", prepareListColumnName);
					var esq = this.Ext.create("Terrasoft.EntitySchemaQuery", {
						rootSchemaName: prepareListColumnName
					});
					esq.addColumn("Id");
					esq.getEntityCollection(function(result) {
						var existsCollection = [];
						if (result.success) {
							result.collection.each(function(item) {
								existsCollection.push(item.get("Id"));
							});
						}
						var filtersCollection = this.Terrasoft.createFilterGroup();
						if (existsCollection.length > 0) {
							filtersCollection.add("existsFilter", this.Terrasoft.createColumnInFilterWithParameters(
								"Id", existsCollection));
						}
						else {
							filtersCollection.add("emptyFilter", this.Terrasoft.createColumnIsNullFilter("Id"));
						}
						this.set(prepareListColumnName + "Filters", filtersCollection);
						this.loadLookupData(filter, this.get(prepareListColumnName + "List"),
							prepareListColumnName, true);
					}, this);
				},

				/**
				 * Возвращает экземпляр EntitySchemaQuery для получения данных lookup колонки
				 * @overridden
				 * @private
				 * @param {String} filterValue Фильтр для primaryDisplayColumn
				 * @param {String} columnName Имя колонки ViewModel
				 * @param {Boolean} isLookup Признак справочного поля
				 * @return {Terrasoft.EntitySchemaQuery}
				 */
				getLookupQuery: function(filterValue, columnName, isLookup) {
					var prepareListColumnName = this.get("PrepareListColumnName");
					var prepareListFilters = this.get(prepareListColumnName + "Filters");
					var entitySchemaQuery = this.callParent([filterValue, columnName, isLookup]);
					if (columnName === prepareListColumnName && prepareListFilters) {
						entitySchemaQuery.filters.add(prepareListColumnName + "Filter", prepareListFilters);
					}
					return entitySchemaQuery;
				}
			},
			diff: [{
				"operation": "insert",
				"name": "ServerSettingsContainerLDAP",
				"values": {
					"id": "ServerSettingsContainerLDAP",
					"selectors": {
						"wrapEl": "#ServerSettingsContainerLDAP"
					},
					"classes": {
						"textClass": "center-panel"
					},
					"itemType": Terrasoft.ViewItemType.GRID_LAYOUT,
					"items": []
				}
			}, {
				"operation": "insert",
				"name": "HeaderContainer",
				"parentName": "ServerSettingsContainerLDAP",
				"propertyName": "items",
				"values": {
					"id": "HeaderContainer",
					"selectors": {
						"wrapEl": "#HeaderContainer"
					},
					"itemType": Terrasoft.ViewItemType.CONTAINER,
					"layout": {
						"column": 0,
						"row": 0,
						"colSpan": 24
					},
					"items": []
				}
			}, {
				"operation": "insert",
				"parentName": "HeaderContainer",
				"propertyName": "items",
				"name": "SaveButton",
				"values": {
					"itemType": Terrasoft.ViewItemType.BUTTON,
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
			}, {
				"operation": "insert",
				"parentName": "HeaderContainer",
				"propertyName": "items",
				"name": "CancelButton",
				"values": {
					"itemType": Terrasoft.ViewItemType.BUTTON,
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
						"column": 4,
						"row": 0,
						"colSpan": 2
					}
				}
			}, {
				"operation": "insert",
				"name": "CommonServerSettings",
				"parentName": "LDAPProperties",
				"propertyName": "items",
				"values": {
					"id": "CommonServerSettings",
					"selectors": {
						"wrapEl": "#CommonServerSettings"
					},
					"itemType": Terrasoft.ViewItemType.CONTROL_GROUP,
					"layout": {
						"column": 0,
						"row": 0,
						"colSpan": 24
					},
					"controlConfig": {
						"collapsed": false,
						"caption": {
							"bindTo": "Resources.Strings.QueryPropertiesLabel"
						}
					},
					"items": []
				}
			}, {
				"operation": "insert",
				"name": "CommonServerSettings_GridLayout",
				"values": {
					"itemType": this.Terrasoft.ViewItemType.GRID_LAYOUT,
					"items": []
				},
				"parentName": "CommonServerSettings",
				"propertyName": "items",
				"index": 0
			}, {
				"operation": "insert",
				"name": "LDAPServer",
				"parentName": "CommonServerSettings_GridLayout",
				"propertyName": "items",
				"index": 0,
				"values": {
					"layout": {
						"column": 0,
						"row": 0,
						"colSpan": 8
					},
					"bindTo": "LDAPServer",
					"labelConfig": {
						"visible": true,
						"caption": {
							"bindTo": "Resources.Strings.LDAPServer"
						}
					}
				}
			}, {
				"operation": "insert",
				"name": "LDAPAuthType",
				"parentName": "CommonServerSettings_GridLayout",
				"propertyName": "items",
				"values": {
					"layout": {
						"column": 0,
						"row": 1,
						"colSpan": 8
					},
					"bindTo": "LDAPAuthType",
					"contentType": Terrasoft.ContentType.ENUM,
					"labelConfig": {
						"visible": true,
						"caption": {
							"bindTo": "Resources.Strings.LDAPAuthType"
						}
					},
					"controlConfig": {
						"prepareList": {"bindTo": "onPrepareLDAPAuthType"}
					}
				}
			}, {
				"operation": "insert",
				"name": "LDAPServerLogin",
				"parentName": "CommonServerSettings_GridLayout",
				"propertyName": "items",
				"values": {
					"layout": {
						"column": 10,
						"row": 0,
						"colSpan": 8
					},
					"bindTo": "LDAPServerLogin",
					"labelConfig": {
						"visible": true,
						"caption": {
							"bindTo": "Resources.Strings.LDAPServerLogin"
						}
					}
				}
			}, {
				"operation": "insert",
				"name": "LDAPServerPassword",
				"parentName": "CommonServerSettings_GridLayout",
				"propertyName": "items",
				"values": {
					"layout": {
						"column": 10,
						"row": 1,
						"colSpan": 8
					},
					"bindTo": "LDAPServerPassword",
					"labelConfig": {
						"visible": true,
						"caption": {
							"bindTo": "Resources.Strings.LDAPServerPassword"
						}
					},
					"controlConfig": {
						"protect": true
					}
				}
			}, {
				"operation": "insert",
				"name": "LDAPLastSynchDate",
				"parentName": "CommonServerSettings_GridLayout",
				"propertyName": "items",
				"values": {
					"layout": {
						"column": 10,
						"row": 2,
						"colSpan": 8
					},
					"bindTo": "LDAPLastSynchDate",
					"labelConfig": {
						"visible": true,
						"caption": {
							"bindTo": "Resources.Strings.LDAPLastSynchDateCaption"
						}
					},
					"enabled": false
				}
			}, {
				"operation": "insert",
				"name": "LDAPSynchInterval",
				"parentName": "CommonServerSettings_GridLayout",
				"propertyName": "items",
				"values": {
					"layout": {
						"column": 0,
						"row": 2,
						"colSpan": 8
					},
					"bindTo": "LDAPSynchInterval",
					"labelConfig": {
						"visible": true,
						"caption": {
							"bindTo": "Resources.Strings.LDAPSynchInterval"
						}
					}
				}
			}, {
				"operation": "insert",
				"name": "UserAttributes",
				"parentName": "LDAPProperties",
				"propertyName": "items",
				"values": {
					"id": "UserAttributes",
					"selectors": {
						"wrapEl": "#UserAttributes"
					},
					"itemType": Terrasoft.ViewItemType.CONTROL_GROUP,
					"controlConfig": {
						"collapsed": false,
						"caption": {
							"bindTo": "Resources.Strings.UserAttributesLabel"
						}
					},
					"items": []
				}
			}, {
				"operation": "insert",
				"name": "UserAttributes_GridLayout",
				"values": {
					"itemType": this.Terrasoft.ViewItemType.GRID_LAYOUT,
					"items": []
				},
				"parentName": "UserAttributes",
				"propertyName": "items",
				"index": 0
			}, {
				"operation": "insert",
				"name": "LDAPUsersEntry",
				"parentName": "UserAttributes_GridLayout",
				"propertyName": "items",
				"values": {
					"layout": {
						"column": 0,
						"row": 0,
						"colSpan": 8
					},
					"bindTo": "LDAPUsersEntry",
					"labelConfig": {
						"visible": true,
						"caption": {
							"bindTo": "Resources.Strings.LDAPUsersEntry"
						}
					}
				}
			}, {
				"operation": "insert",
				"name": "LDAPUserFullNameAttribute",
				"parentName": "UserAttributes_GridLayout",
				"propertyName": "items",
				"values": {
					"layout": {
						"column": 0,
						"row": 1,
						"colSpan": 8
					},
					"bindTo": "LDAPUserFullNameAttribute",
					"labelConfig": {
						"visible": true,
						"caption": {
							"bindTo": "Resources.Strings.LDAPUserFullNameAttribute"
						}
					}
				}
			}, {
				"operation": "insert",
				"name": "LDAPUserLoginAttribute",
				"parentName": "UserAttributes_GridLayout",
				"propertyName": "items",
				"values": {
					"layout": {
						"column": 0,
						"row": 2,
						"colSpan": 8
					},
					"bindTo": "LDAPUserLoginAttribute",
					"labelConfig": {
						"visible": true,
						"caption": {
							"bindTo": "Resources.Strings.LDAPUserLoginAttribute"
						}
					}
				}
			}, {
				"operation": "insert",
				"name": "LDAPUserCompanyAttribute",
				"parentName": "UserAttributes_GridLayout",
				"propertyName": "items",
				"values": {
					"layout": {
						"column": 10,
						"row": 0,
						"colSpan": 8
					},
					"bindTo": "LDAPUserCompanyAttribute",
					"labelConfig": {
						"visible": true,
						"caption": {
							"bindTo": "Resources.Strings.LDAPUserCompanyAttribute"
						}
					}
				}
			}, {
				"operation": "insert",
				"name": "LDAPUserIdentityAttribute",
				"parentName": "UserAttributes_GridLayout",
				"propertyName": "items",
				"values": {
					"layout": {
						"column": 10,
						"row": 1,
						"colSpan": 8
					},
					"bindTo": "LDAPUserIdentityAttribute",
					"labelConfig": {
						"visible": true,
						"caption": {
							"bindTo": "Resources.Strings.LDAPUserIdentityAttribute"
						}
					}
				}
			}, {
				"operation": "insert",
				"name": "LDAPUserEmailAttribute",
				"parentName": "UserAttributes_GridLayout",
				"propertyName": "items",
				"values": {
					"layout": {
						"column": 0,
						"row": 3,
						"colSpan": 8
					},
					"bindTo": "LDAPUserEmailAttribute",
					"labelConfig": {
						"visible": true,
						"caption": {
							"bindTo": "Resources.Strings.LDAPUserEmailAttribute"
						}
					}
				}
			}, {
				"operation": "insert",
				"name": "LDAPUserPhoneAttribute",
				"parentName": "UserAttributes_GridLayout",
				"propertyName": "items",
				"values": {
					"layout": {
						"column": 10,
						"row": 2,
						"colSpan": 8
					},
					"bindTo": "LDAPUserPhoneAttribute",
					"labelConfig": {
						"visible": true,
						"caption": {
							"bindTo": "Resources.Strings.LDAPUserPhoneAttribute"
						}
					}
				}
			}, {
				"operation": "insert",
				"name": "LDAPUserJobTitleAttribute",
				"parentName": "UserAttributes_GridLayout",
				"propertyName": "items",
				"values": {
					"layout": {
						"column": 10,
						"row": 3,
						"colSpan": 8
					},
					"bindTo": "LDAPUserJobTitleAttribute",
					"labelConfig": {
						"visible": true,
						"caption": {
							"bindTo": "Resources.Strings.LDAPUserJobTitleAttribute"
						}
					}
				}
			}, {
				"operation": "insert",
				"name": "AttributesGroupOfUsers",
				"parentName": "LDAPProperties",
				"propertyName": "items",
				"values": {
					"id": "AttributesGroupOfUsers",
					"selectors": {
						"wrapEl": "#AttributesGroupOfUsers"
					},
					"itemType": Terrasoft.ViewItemType.CONTROL_GROUP,
					"controlConfig": {
						"collapsed": false,
						"caption": {
							"bindTo": "Resources.Strings.AttributesGroupOfUsersLabel"
						}
					},
					"items": []
				}
			}, {
				"operation": "insert",
				"name": "AttributesGroupOfUsers_GridLayout",
				"values": {
					"itemType": this.Terrasoft.ViewItemType.GRID_LAYOUT,
					"items": []
				},
				"parentName": "AttributesGroupOfUsers",
				"propertyName": "items",
				"index": 0
			}, {
				"operation": "insert",
				"name": "LDAPGroupNameAttribute",
				"parentName": "AttributesGroupOfUsers_GridLayout",
				"propertyName": "items",
				"values": {
					"layout": {
						"column": 0,
						"row": 0,
						"colSpan": 8
					},
					"bindTo": "LDAPGroupNameAttribute",
					"labelConfig": {
						"visible": true,
						"caption": {
							"bindTo": "Resources.Strings.LDAPGroupNameAttribute"
						}
					}
				}
			}, {
				"operation": "insert",
				"name": "LDAPGroupsEntry",
				"parentName": "AttributesGroupOfUsers_GridLayout",
				"propertyName": "items",
				"values": {
					"layout": {
						"column": 0,
						"row": 1,
						"colSpan": 8
					},
					"bindTo": "LDAPGroupsEntry",
					"labelConfig": {
						"visible": true,
						"caption": {
							"bindTo": "Resources.Strings.LDAPGroupsEntry"
						}
					}
				}
			}, {
				"operation": "insert",
				"name": "LDAPGroupIdentityAttribute",
				"parentName": "AttributesGroupOfUsers_GridLayout",
				"propertyName": "items",
				"values": {
					"layout": {
						"column": 10,
						"row": 0,
						"colSpan": 8
					},
					"bindTo": "LDAPGroupIdentityAttribute",
					"labelConfig": {
						"visible": true,
						"caption": {
							"bindTo": "Resources.Strings.LDAPGroupIdentityAttribute"
						}
					}
				}
			}, {
				"operation": "insert",
				"name": "FilteringCondition",
				"parentName": "LDAPProperties",
				"propertyName": "items",
				"values": {
					"id": "FilteringCondition",
					"selectors": {
						"wrapEl": "#FilteringCondition"
					},
					"itemType": Terrasoft.ViewItemType.CONTROL_GROUP,
					"controlConfig": {
						"collapsed": false,
						"caption": {
							"bindTo": "Resources.Strings.FilteringConditionLabel"
						}
					},
					"items": []
				}
			}, {
				"operation": "insert",
				"name": "FilteringCondition_GridLayout",
				"values": {
					"itemType": this.Terrasoft.ViewItemType.GRID_LAYOUT,
					"items": []
				},
				"parentName": "FilteringCondition",
				"propertyName": "items",
				"index": 0
			}, {
				"operation": "insert",
				"name": "LDAPUsersFilter",
				"parentName": "FilteringCondition_GridLayout",
				"propertyName": "items",
				"values": {
					"layout": {
						"column": 0,
						"row": 0,
						"colSpan": 18
					},
					"bindTo": "LDAPUsersFilter",
					"labelConfig": {
						"visible": true,
						"caption": {
							"bindTo": "Resources.Strings.LDAPUsersFilter"
						}
					}
				}
			}, {
				"operation": "insert",
				"name": "LDAPGroupsFilter",
				"parentName": "FilteringCondition_GridLayout",
				"propertyName": "items",
				"values": {
					"layout": {
						"column": 0,
						"row": 1,
						"colSpan": 18
					},
					"bindTo": "LDAPGroupsFilter",
					"labelConfig": {
						"visible": true,
						"caption": {
							"bindTo": "Resources.Strings.LDAPGroupsFilter"
						}
					}
				}
			}, {
				"operation": "insert",
				"name": "LDAPUsersInGroupFilter",
				"parentName": "FilteringCondition_GridLayout",
				"propertyName": "items",
				"values": {
					"layout": {
						"column": 0,
						"row": 2,
						"colSpan": 18
					},
					"bindTo": "LDAPUsersInGroupFilter",
					"labelConfig": {
						"visible": true,
						"caption": {
							"bindTo": "Resources.Strings.LDAPUsersInGroupFilter"
						}
					}
				}
			}]
		};
	});