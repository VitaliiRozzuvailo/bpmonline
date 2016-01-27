define("UsersDetailV2", ["ConfigurationConstants", "ConfigurationEnums"],
	function(ConfigurationConstants, enums) {
		return {
			entitySchemaName: "VwSysAdminUnit",
			diff: /**SCHEMA_DIFF*/[
				{
					"operation": "merge",
					"name": "DataGrid",
					"values": {
						"type": "listed",
						"openRecord": {"bindTo": "onGridDoubleClick"},
						"listedConfig": {
							"name": "DataGridListedConfig",
							"items": [
								{
									"name": "ContactNameListedGridColumn",
									"caption": {"bindTo": "Resources.Strings.ContactNameColumnCaption"},
									"bindTo": "Contact.Name",
									"type": "text",
									"position": {
										"column": 0,
										"colSpan": 6
									}
								},
								{
									"name": "JobTitleListedGridColumn",
									"caption": {"bindTo": "Resources.Strings.JobTitleColumnCaption"},
									"bindTo": "Contact.JobTitle",
									"type": "text",
									"position": {
										"column": 0,
										"colSpan": 6
									}
								},
								{
									"name": "MobilePhoneListedGridColumn",
									"caption": {"bindTo": "Resources.Strings.MobilePhoneColumnCaption"},
									"bindTo": "Contact.MobilePhone",
									"type": "text",
									"position": {
										"column": 0,
										"colSpan": 6
									}
								},
								{
									"name": "NameListedGridColumn",
									"caption": {"bindTo": "Resources.Strings.NameColumnCaption"},
									"bindTo": "Name",
									"type": "text",
									"position": {
										"column": 0,
										"colSpan": 6
									}
								}
							]
						},
						"tiledConfig": {
							"name": "DataGridTiledConfig",
							"grid": {
								"columns": 24,
								"rows": 1
							},
							"items": [
								{
									"name": "NameTiledGridColumn",
									"bindTo": "Name",
									"caption": {"bindTo": "Resources.Strings.NameColumnCaption"},
									"type": "text",
									"position": {
										"row": 1,
										"column": 0,
										"colSpan": 12
									},
									"captionConfig": {
										"visible": false
									}
								}
							]
						}
					}
				},
				{
					"operation": "merge",
					"name": "AddRecordButton",
					"values": {
						"click": {"bindTo": "onAddButtonClick"},
						"menu": []
					}
				},
				{
					"operation": "insert",
					"name": "AddExistingRecordButton",
					"parentName": "AddRecordButton",
					"propertyName": "menu",
					"values": {
						"caption": {"bindTo": "Resources.Strings.AddExistingUserButtonCaption"},
						"click": {"bindTo": "onAddExistingUser"}
					}
				},
				{
					"operation": "insert",
					"name": "AddNewRecordButton",
					"parentName": "AddRecordButton",
					"propertyName": "menu",
					"values": {
						"caption": {"bindTo": "Resources.Strings.AddNewUserButtonCaption"},
						"click": {"bindTo": "addRecord"}
					}
				}
			]/**SCHEMA_DIFF*/,
			messages: {
				/**
				 * Передает информацию о родителе и типе для записи.
				 */
				"SetRecordInformation": {
					mode: this.Terrasoft.MessageMode.PTP,
					direction: this.Terrasoft.MessageDirectionType.SUBSCRIBE
				},

				/**
				 * Сообщает разделу о необходимости вывода сообщения об актуализации ролей.
				 */
				"NeedActualizeRoles": {
					mode: this.Terrasoft.MessageMode.BROADCAST,
					direction: this.Terrasoft.MessageDirectionType.PUBLISH
				}

			},
			attributes: {
				/**
				 * Признак того, выполняем ли мы добавление существующего пользователя.
				 */
				"IsAddExistingUser": {
					"dataValueType": this.Terrasoft.DataValueType.BOOLEAN
				}
			},
			methods: {
				/**
				 * Обработчик двойного клика по строке в реестре детали.
				 * @protected
				 */
				onGridDoubleClick: function() {
					this.editRecord();
				},

				/**
				 * @inheritdoc Terrasoft.BaseGridDetailV2#getAddRecordButtonEnabled
				 * @overridden
				*/
				getAddRecordButtonEnabled: function() {
					return true;
				},

				/**
				 * Обработчик клика на кнопке "Добавить".
				 * @returns {boolean} Всегда возвращает false, т.к. эта кнопка используется для открытия меню.
				 */
				onAddButtonClick: function() {
					return false;
				},

				/**
				 * @inheritdoc Terrasoft.BaseGridDetailV2#addDetailWizardMenuItems
				 * @overridden
				 */
				addDetailWizardMenuItems: this.Terrasoft.emptyFn,

				/**
				 * @inheritdoc Terrasoft.BaseGridDetailV2#getCopyRecordMenuItem
				 * @overridden
				 */
				getCopyRecordMenuItem: this.Terrasoft.emptyFn,

				/**
				 * @inheritDoc BaseSchemaViewModel#initEditPages
				 * @protected
				 * @overridden
				 */
				initEditPages: function() {
					this.callParent(arguments);
					var editPages = this.get("EditPages");
					var typeUId = this.Terrasoft.GUID_EMPTY;
					if (this.Ext.isEmpty(editPages.find(typeUId))) {
						editPages.add(typeUId, this.Ext.create("Terrasoft.BaseViewModel", {
							values: {
								Id: typeUId,
								Caption: this.get("Resources.Strings.EditPageCaption"),
								Click: {bindTo: "addRecord"},
								Tag: typeUId,
								SchemaName: "UserPageV2"
							}
						}));
					}
				},

				/**
				 * Возвращает колонки, которые всегда выбираются запросом.
				 * @inheritdoc GridUtilitiesV2#getGridDataColumns
				 * @overridden
				 * @return {Object} Возвращает массив объектов-конфигураций колонок.
				 */
				getGridDataColumns: function() {
					var config = this.callParent(arguments);
					config["Contact.Name"] = {path: "Contact.Name"};
					config["Contact.JobTitle"] = {path: "Contact.JobTitle"};
					config["Contact.MobilePhone"] = {path: "Contact.MobilePhone"};
					return config;
				},

				/**
				 * Открывает окно выбора существующих пользователей.
				 * @protected
				 */
				getUsersList: function() {
					var config = this.prepareLookupConfig();
					this.openLookup(config, this.addCallback, this);
				},

				/**
				 * Подготовка параметров для открытия окна выбора из пользователей.
				 * @return {Object} Config настроек окна выбора из справочника.
				 */
				prepareLookupConfig: function() {
					var config = {
						entitySchemaName: "SysAdminUnit",
						multiSelect: true,
						columns: ["Contact", "Name"],
						hideActions: true,
						lookupPostfix: "_UsersDetail"
					};
					var filters = this.Ext.create("Terrasoft.FilterGroup");
					var existsFilter = this.Terrasoft.createNotExistsFilter("Id");
					var subFilter = this.Terrasoft.createColumnInFilterWithParameters(
						"[SysUserInRole:SysUser:Id].[SysAdminUnit:Id:SysRole].Id",
						this.get("SelectedNodesPrimaryColumnValues"));
					existsFilter.subFilters.addItem(subFilter);
					filters.addItem(existsFilter);

					var connectionType = this.getConnectionType();
					if (this.Ext.isEmpty(connectionType) ||
						connectionType.value === ConfigurationConstants.UserType.GENERAL) {
						var connectionFilter = this.Terrasoft.createColumnFilterWithParameter(
							this.Terrasoft.ComparisonType.EQUAL,
							"ConnectionType",
							ConfigurationConstants.UserType.GENERAL
						);
						filters.addItem(connectionFilter);
					}
					filters.addItem(this.Terrasoft.createColumnFilterWithParameter(
						this.Terrasoft.ComparisonType.EQUAL, "SysAdminUnitTypeValue",
						ConfigurationConstants.SysAdminUnit.Type.User));
					config.filters = filters;
					return config;
				},

				/**
				 * Из массива значений по умолчанию возвращает значение с именем "ConnectionType" или null.
				 * @return {Object} Тип пользователя или null, если тип пользователя не найден среди значений
				 * по умолчанию.
				 */
				getConnectionType: function() {
					var result = null;
					this.Terrasoft.each(this.get("DefaultValues"), function(value) {
						if (value.name === "ConnectionType") {
							result = value;
						}
					});
					return result;
				},

				/**
				 * Обработчик нажатия на кнопку Добавить нового.
				 * @inheritdoc BaseGridDetailV2#addRecord
				 * @overridden
				 */
				addRecord: function() {
					this.set("IsAddExistingUser", false);
					this.callParent([this.Terrasoft.GUID_EMPTY]);
				},

				/**
				 * Обработчик нажатия на кнопку Добавить существующего.
				 */
				onAddExistingUser: function() {
					this.set("IsAddExistingUser", true);
					var cardState = this.sandbox.publish("GetCardState", null, [this.sandbox.id]);
					var isNew = (cardState.state === enums.CardStateV2.ADD ||
					cardState.state === enums.CardStateV2.COPY);
					if (isNew) {
						var args = {
							isSilent: true,
							messageTags: [this.sandbox.id]
						};
						this.sandbox.publish("SaveRecord", args, [this.sandbox.id]);
						return;
					}
					this.getUsersList();
				},

				/**
				 * @overridden
				 */
				onCardSaved: function() {
					if (this.get("IsAddExistingUser")) {
						this.getUsersList();
					} else {
						this.callParent(arguments);
					}
				},

				/**
				 * Генерирует id для карточки UserPageV2, вызываемой из детали UsersDetailV2.
				 * @return {string} Сгенерированный id
				 */
				getUsersDetailSandboxId: function() {
					return this.sandbox.id + "UserPageV2" + this.Terrasoft.GUID_EMPTY;
				},

				/**
				 * @inheritDoc BaseGridDetail#getDeleteRecordMenuItem
				 * @overridden
				 */
				getDeleteRecordMenuItem: function() {
					return this.getButtonMenuItem({
						Caption: {"bindTo": "Resources.Strings.DeleteButtonCaption"},
						Click: {"bindTo": "deleteRecords"},
						Enabled: {"bindTo": "canDeleteUserInRole"}
					});
				},

				/**
				 * Проверяет, можно ли исключить пользователя из роли.
				 * @return {Boolean} True, если пользователь выбран и не входит в корневую роль,
				 * иначе False.
				 */
				canDeleteUserInRole: function() {
					var defaultValues = this.get("DefaultValues");
					return this.isAnySelected() && this.getIsParentRoleExist(defaultValues);
				},

				/**
				 * Обработчик нажатия на кнопку меню Удалить.
				 * @inheritdoc GridUtilitiesV2#deleteRecords
				 * @overridden
				 */
				deleteRecords: function() {
					this.showConfirmationDialog(this.get("Resources.Strings.DeleteConfirmationMessage"),
						function(returnCode) {
							if (returnCode !== this.Terrasoft.MessageBoxButtons.YES.returnCode) {
								return;
							}
							this.onDeleteRecords();
						},
						[this.Terrasoft.MessageBoxButtons.YES.returnCode,
							this.Terrasoft.MessageBoxButtons.NO.returnCode],
						null);
				},

				/**
				 * Выполняет проверку ответа сервера.
				 * @protected
				 * @virtual
				 * @param {Object} response
				 */
				validateResponse: function(response) {
					this.hideBodyMask();
					var isSuccess = response && response.success;
					if (!isSuccess) {
						var errorMessage = response.message;
						if (errorMessage) {
							this.showInformationDialog(errorMessage);
						}
					}
					return isSuccess;
				},

				/**
				 * Удаление записей о выбранных пользователях из таблицы SysUserInRole,
				 * для текущей и всех подчиненных ролей.
				 * @protected
				 */
				onDeleteRecords: function() {
					var selectedRows = this.getSelectedItems();
					var dataSend = {
						roleIds: this.Ext.encode(this.get("SelectedNodesPrimaryColumnValues")),
						userIds: this.Ext.encode(selectedRows),
						recordIds: ""
					};
					var config = {
						serviceName: "AdministrationService",
						methodName: "RemoveUsersInRoles",
						data: dataSend
					};
					this.showBodyMask();
					this.callService(config, this.afterDeleteRecords, this);
				},

				/**
				 * Выполняет постобработку удаления пользователей.
				 * @private
				 * @param {object} response Ответ сервера.
				 */
				afterDeleteRecords: function(response) {
					var result = this.Ext.decode(response.RemoveUsersInRolesResult);
					response.message = result.ExceptionMessage;
					response.success = result.Success;
					var deletedItems = result.DeletedItems;
					this.removeGridRecords(deletedItems);
					this.validateResponse(response);
				},

				/**
				 * Получает идентификатор для роли, с пользователями которой будет вестись работа.
				 * @returns {String} Идентификатор роли.
				 */
				getTargetRoleId: function() {
					return this.get("MasterRecordId");
				},

				/**
				 * Публикует сообщение о необходимости выполнить актуализацию ролей.
				 */
				publishNeedActualizeRolesMessage: function() {
					this.sandbox.publish("NeedActualizeRoles");
				},

				/**
				 * Callback-функция, которые вызывается после закрытия окна выбора из справочника пользователей.
				 * @virtual
				 * @param {Object} args Объект, содержащий коллекцию выбранных записей.
				 */
				addCallback: function(args) {
					var dataSend = {
						roleId: this.getTargetRoleId(),
						userIds: this.Ext.encode(args.selectedRows.getKeys())
					};
					var config = {
						serviceName: "AdministrationService",
						methodName: "AddUsersInRole",
						data: dataSend
					};
					this.showBodyMask();
					this.callService(config, function(response) {
						response.message = response.AddUsersInRoleResult;
						response.success = this.Ext.isEmpty(response.success);
						if (this.validateResponse(response)) {
							this.reloadGridData();
						}
					}, this);
				},

				/**
				 * Загружает данные в реестр детали.
				 * @protected
				 * @inheritdoc GridUtilitiesV2#loadGridData
				 * @overridden
				 */
				loadGridData: function() {
					if (this.get("ServiceDataLoaded")) {
						this.callParent(arguments);
						this.set("ServiceDataLoaded", false);
						return;
					}
					this.selectChildUnits(this.loadGridData);
				},

				/**
				 * Возвращает признак, есть или нет у записи, выбранной в вертикальном реестре,
				 * родительская роль.
				 * @param {Array} defaultValues Значения по умолчанию карточки.
				 * @return {boolean} True, если у выбранной записи в вертикальном реестре есть родитель,
				 * иначе False.
				 */
				getIsParentRoleExist: function(defaultValues) {
					var result = null;
					this.Terrasoft.each(defaultValues, function(value) {
						if (value.name === "IsParentRoleExist") {
							result = value;
						}
					});
					return this.Ext.isEmpty(result) ? false : result.value;
				},

				/**
				 * @inheritdoc BaseGridDetailV2#initData
				 * @overridden
				 */
				initData: function() {
					this.callParent(arguments);
					this.sandbox.subscribe("SetRecordInformation", function() {
						return {
							parent:  this.get("MasterRecordId"),
							defaultValues: this.get("DefaultValues"),
							type: ConfigurationConstants.SysAdminUnit.TypeGuid.User
						};
					}, this, [this.getUsersDetailSandboxId()]);
				},

				/**
				 * Метод вызывает сервис, который возвращает идентификаторы дочерних, по отношению к выбранному,
				 * подразделений.
				 * @protected
				 * @param {Function} callback Функция обратного вызова, которая вызывается после того, как выполнен запрос.
				 */
				selectChildUnits: function(callback) {
					var dataSend = {
						parentRoleId: this.get("MasterRecordId")
					};
					var config = {
						serviceName: "AdministrationService",
						methodName: "GetChildAdminUnits",
						data: dataSend
					};
					this.callService(config, function(response) {
						if (response && response.GetChildAdminUnitsResult) {
							this.set("SelectedNodesPrimaryColumnValues", response.GetChildAdminUnitsResult);
							this.set("ServiceDataLoaded", true);
							if (this.Ext.isFunction(callback)) {
								callback.call(this);
							}
						}
					}, this);
				},

				/**
				 * Возвращает фильтр для выполнения запроса.
				 * @protected
				 * @inheritdoc BaseGridDetailV2#getFilters
				 * @overridden
				 * @return {Terrasoft.FilterGroup} Группа фильтров filters.
				 **/
				getFilters: function() {
					var filters = this.Ext.create("Terrasoft.FilterGroup");
					var items = this.get("SelectedNodesPrimaryColumnValues");
					filters.addItem(this.Terrasoft.createColumnInFilterWithParameters(
						"[SysUserInRole:SysUser:Id].[SysAdminUnit:Id:SysRole].Id", items));
					filters.addItem(this.Terrasoft.createColumnFilterWithParameter(this.Terrasoft.ComparisonType.EQUAL,
						"SysAdminUnitType.Value", ConfigurationConstants.SysAdminUnit.Type.User));
					return filters;
				}
			}
		};
	});
