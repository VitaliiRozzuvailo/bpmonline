define("SysAdminOperationGranteeDetailV2",
	["LocalizableHelper", "ConfigurationEnums", "SysAdminOperationGranteeDetailV2Resources",
		"ConfigurationGrid", "ConfigurationGridGenerator", "ConfigurationGridUtilities"],
	function(LocalizableHelper, enums) {
		return {
			entitySchemaName: "SysAdminOperationGrantee",
			attributes: {
				IsEditable: {
					"type": this.Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					"value": true,
					"dataValueType": this.Terrasoft.DataValueType.BOOLEAN
				}
			},
			mixins: {
				ConfigurationGridUtilites: "Terrasoft.ConfigurationGridUtilities"
			},
			diff: /**SCHEMA_DIFF*/[
				{
					"operation": "insert",
					"name": "MoveUpButton",
					"index": 0,
					"parentName": "Detail",
					"propertyName": "tools",
					"values": {
						"tag": "up",
						"click": {"bindTo": "onUpDownButtonClick"},
						"visible": {"bindTo": "getToolsVisible"},
						"itemType": this.Terrasoft.ViewItemType.BUTTON,
						"className": this.Terrasoft.controls.Button,
						"markerValue": "buttonUp",
						"imageConfig": LocalizableHelper.localizableImages.ButtonUp
					}
				},
				{
					"operation": "insert",
					"name": "MoveDownButton",
					"index": 1,
					"parentName": "Detail",
					"propertyName": "tools",
					"values": {
						"tag": "down",
						"click": {"bindTo": "onUpDownButtonClick"},
						"visible": {"bindTo": "getToolsVisible"},
						"itemType": this.Terrasoft.ViewItemType.BUTTON,
						"className": this.Terrasoft.controls.Button,
						"markerValue": "buttonDown",
						"imageConfig": LocalizableHelper.localizableImages.ButtonDown
					}
				},
				{
					"operation": "merge",
					"name": "DataGrid",
					"values": {
						"type": "listed",
						"className": "Terrasoft.ConfigurationGrid",
						"generator": "ConfigurationGridGenerator.generatePartial",
						"generateControlsConfig": {"bindTo": "generatActiveRowControlsConfig"},
						"changeRow": {"bindTo": "changeRow"},
						"unSelectRow": {"bindTo": "unSelectRow"},
						"onGridClick": {"bindTo": "onGridClick"},
						"listedZebra": true,
						"activeRowAction": {"bindTo": "onActiveRowAction"},
						"activeRowActions": [
							{
								"tag": "save",
								"style": this.Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
								"className": this.Terrasoft.controls.Button,
								"markerValue": "buttonSave",
								"imageConfig": {"bindTo": "Resources.Images.SaveIcon"}
							},
							{
								"tag": "cancel",
								"style": this.Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
								"className": this.Terrasoft.controls.Button,
								"markerValue": "buttonCancel",
								"imageConfig": {"bindTo": "Resources.Images.CancelIcon"}
							},
							{
								"tag": "remove",
								"style": this.Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
								"className": this.Terrasoft.controls.Button,
								"markerValue": "buttonRemove",
								"imageConfig": {"bindTo": "Resources.Images.RemoveIcon"}
							}
						],
						"initActiveRowKeyMap": {"bindTo": "initActiveRowKeyMap"}
					}
				}
			]/**SCHEMA_DIFF*/,
			methods: {
				/**
				 * @inheritdoc Terrasoft.BaseGridDetailV2#getGridSettingsMenuItem
				 * @overridden
				 */
				getGridSettingsMenuItem: this.Terrasoft.emptyFn,

				/**
				 * @inheritdoc Terrasoft.BaseGridDetailV2#sortColumn
				 * @overridden
				 */
				sortColumn: this.Terrasoft.emptyFn,

				/**
				 * @inheritdoc Terrasoft.BaseGridDetailV2#getGridSortMenuItem
				 * @overridden
				 */
				getGridSortMenuItem: this.Terrasoft.emptyFn,

				/**
				 * @inheritdoc Terrasoft.BaseGridDetailV2#getCopyRecordMenuItem
				 * @overridden
				 */
				getCopyRecordMenuItem: this.Terrasoft.emptyFn,

				/**
				 * @inheritdoc Terrasoft.BaseGridDetailV2#getEditRecordMenuItem
				 * @overridden
				 */
				getEditRecordMenuItem: this.Terrasoft.emptyFn,

				/**
				 * @inheritdoc Terrasoft.BaseGridDetailV2#getSwitchGridModeMenuItem
				 * @overridden
				 */
				getSwitchGridModeMenuItem: this.Terrasoft.emptyFn,

				/**
				 * @inheritdoc Terrasoft.BaseGridDetailV2#addDetailWizardMenuItems
				 * @overridden
				 */
				addDetailWizardMenuItems: this.Terrasoft.emptyFn,

				/**
				 * Возвращает настройки колонок реестра.
				 * Устанавливает направление сортировки для столбца Позиция.
				 * @inheritdoc GridUtilitiesV2#getGridDataColumns
				 * @overridden
				 */
				getGridDataColumns: function() {
					var configs = this.callParent(arguments);
					if (!configs.Position) {
						configs.Position = {
							"path": "Position",
							"orderPosition": 0,
							"orderDirection": this.Terrasoft.OrderDirection.ASC
						};
					}
					return configs;
				},

				/**
				 * Обработчик события успешного сохранения в фоновом режиме.
				 * @inheritdoc BaseGridDetailV2#onCardSaved
				 * @overridden
				 */
				onCardSaved: function() {
					this.openAdminUnitLookup(null);
				},

				/**
				 * Проверяет, находится ли страница редактирования, в режиме создания опреации.
				 * @return {Boolean} Результат проверки.
				 * @private
				 */
				isPageInAddState: function() {
					var state = this.sandbox.publish("GetCardState", null, [this.sandbox.id]);
					return state.state === enums.CardStateV2.ADD;
				},

				/**
				 * Сохраняет новую операцию в фоновом режиме.
				 * @private
				 */
				silentSaveOperation: function() {
					var args = {
						"isSilent": true,
						"messageTags": [this.sandbox.id]
					};
					this.sandbox.publish("SaveRecord", args, [this.sandbox.id]);
				},

				/**
				 * Обработчик нажатия кнопок Вверх/вниз.
				 * @param a1 {Object} ignore
				 * @param a2 {Object} ignore
				 * @param a3 {Object} ignore
				 * @param tag {String} Tag нажатой кнопки.
				 * @private
				 */
				onUpDownButtonClick: function(a1, a2, a3, tag) {
					var count = this.getGridData().getCount();
					if (count < 2) {
						return;
					}
					var activeRow = this.getActiveRow();
					if (activeRow) {
						var position = activeRow.get("Position");
						switch (tag) {
							case "up":
								if (position === 0) {
									return;
								}
								position--;
								break;
							case "down":
								position++;
								break;
						}
						this.setAdminOperationGranteePosition(activeRow.get("Id"), position);
					}
				},

				/**
				 * Возвращает видимость кнопки Добавить.
				 * @inheritdoc BaseGridDetailV2#getAddRecordButtonVisible
				 * @overridden
				 */
				getAddRecordButtonVisible: function() {
					return this.getToolsVisible();
				},

				/**
				 * Добавление записи.
				 * @inheritdoc BaseGridDetailV2#addRecord
				 * @overridden
				 */
				addRecord: function() {
					this.checkCanChangeGrantee(function() {
						if (this.isPageInAddState()) {
							this.showConfirmSaveOperationDialog(function() {
									this.silentSaveOperation();
								});
						}
						else {
							this.openAdminUnitLookup(null);
						}
					}, null);
				},

				/**
				 * Удаление записей.
				 * @inheritdoc GridUtilitiesV2#deleteRecords
				 * @overridden
				 */
				deleteRecords: function() {
					var items = this.getSelectedItems();
					if (items && items.length > 0) {
						this.showConfirmationDialog(this.get("Resources.Strings.DeleteConfirmationMessage"),
							function(result) {
								if (result === this.Terrasoft.MessageBoxButtons.YES.returnCode) {
									this.deleteGrantees(items);
								}
							}, [this.Terrasoft.MessageBoxButtons.YES.returnCode,
								this.Terrasoft.MessageBoxButtons.NO.returnCode], null);
					}
				},

				/**
				 * Открывает справочник Пользователи/роли.
				 * @param config {Object} Настройки справочника.
				 * Если настройки отсутствуют, будут применены стандартные настройки (см. getAdminUnitLookupConfig).
				 * @private
				 */
				openAdminUnitLookup: function(config) {
					var query = this.Ext.create("Terrasoft.EntitySchemaQuery", {
						"rootSchemaName": "SysAdminUnit"
					});
					this.showBodyMask();
					query.getEntityCollection(function(response) {
						if (response && response.success) {
							if (!config) {
								config = this.getAdminUnitLookupConfig();
							}
							this.openLookup(config, this.onAdminUnitLookupClosed);
						}
					}, this);
				},

				/**
				 * Устанавливает значение поля Позиция в БД.
				 * @param itemId {String} Идентификатор права доступа.
				 * @param position {Number} Новое значение поля Позиция.
				 * @private
				 */
				setAdminOperationGranteePosition: function(itemId, position) {
					var config = {
						"serviceName": "RightsService",
						"methodName": "SetAdminOperationGranteePosition",
						"data": {
							"granteeId": itemId,
							"position": position
						}
					};
					this.callService(config, function(response) {
						if (response && response.SetAdminOperationGranteePositionResult) {
							var result = this.Ext.decode(response.SetAdminOperationGranteePositionResult);
							if (result && !this.Ext.isEmpty(result)) {
								if (result.Success) {
									this.reloadGridData();
								} else {
									this.showInformationDialog(result.ExMessage);
								}
							}
						}
					}, this);
				},

				/**
				 * Создает или изменяет права доступа к операции в БД
				 * для выбранного пользователя или группы пользователей.
				 * @param itemIds {Array} Массив идентификаторов пользователей/ролей.
				 * @param canExecute {Boolean} Разрешен ли доступ пользователя к операции.
				 * По умолчанию — true.
				 * @private
				 */
				insertGrantees: function(itemIds, canExecute) {
					var config = {
						"serviceName": "RightsService",
						"methodName": "SetAdminOperationGrantee",
						"data": {
							"adminOperationId": this.get("MasterRecordId"),
							"adminUnitIds": itemIds,
							"canExecute": this.Ext.isEmpty(canExecute) ? true : canExecute
						}
					};
					this.callService(config, function(response) {
						if (response && response.SetAdminOperationGranteeResult) {
							var result = this.Ext.decode(response.SetAdminOperationGranteeResult);
							if (result && !this.Ext.isEmpty(result)) {
								if (result.Success) {
									this.onInsertComplete();
								} else {
									this.showInformationDialog(result.ExMessage);
								}
							}
						}
					}, this);
				},

				/**
				 * Удаляет права доступа к операции в БД.
				 * @param itemIds {Array} Массив идентификаторов прав доступа.
				 * @private
				 */
				deleteGrantees: function(itemIds) {
					var config = {
						"serviceName": "RightsService",
						"methodName": "DeleteAdminOperationGrantee",
						"data": {
							"recordIds": itemIds
						}
					};
					this.callService(config, function(response) {
						if (response && response.DeleteAdminOperationGranteeResult) {
							var result = this.Ext.decode(response.DeleteAdminOperationGranteeResult);
							if (result && !this.Ext.isEmpty(result)) {
								if (result.Success) {
									this.onDeleteComplete(itemIds);
								} else {
									this.showInformationDialog(result.ExMessage);
								}
							}
						}
					}, this);
				},

				/**
				 * Обновляет данные реестра.
				 * Выполняется после добавления записей в БД.
				 * @private
				 */
				onInsertComplete: function() {
					this.hideBodyMask();
					this.reloadGridData();
				},

				/**
				 * Удаляет данные из реестра.
				 * Выполняется после удаления записей из БД.
				 * @private
				 */
				onDeleteComplete: function() {
					this.hideBodyMask();
					this.reloadGridData();
				},

				/**
				 * Выполняется после закрытия справочника Пользователи/роли.
				 * @param args {Object} Содержит коллекцию записей выбранных в справочнике Пользователи/роли.
				 * @private
				 */
				onAdminUnitLookupClosed: function(args) {
					this.hideBodyMask();
					if (args) {
						var items = args.selectedRows.getItems();
						if (items.length > 0) {
							var itemIds = [];
							this.Terrasoft.each(items, function(item) {
								itemIds.push(item.value);
							}, this);
							this.insertGrantees(itemIds);
						}
					}
				},

				/**
				 * Возвращает настройки для справочника Пользователи/роли.
				 * @param multi {Boolean} Разрешить ли множественный выбор. По умолчанию — да.
				 * @param actions {Boolean} Показывать ли кнопки действий. По умолчанию — нет.
				 * @param filtersGroup {Terrasoft.FilterGroup} Коллекция фильтров.
				 * Если коллекция отсутствует, будет применен стандартный фильтр (см. getAdminUnitLookupFilters).
				 * @return {Object} Настройки справочника Пользователи/роли.
				 * @private
				 */
				getAdminUnitLookupConfig: function(multi, actions, filtersGroup) {
					return {
						"multiSelect": this.Ext.isEmpty(multi) ? true : multi,
						"hideActions": this.Ext.isEmpty(actions) ? true : actions,
						"filters": !filtersGroup ? this.getAdminUnitLookupFilters() : filtersGroup,
						"entitySchemaName": "SysAdminUnit"
					};
				},

				/**
				 * Возвращает фильтр для справочника Пользователи/роли.
				 * @return {Terrasoft.FilterGroup} Коллекция фильтров.
				 * @private
				 */
				getAdminUnitLookupFilters: function() {
					var filtersGroup = this.Terrasoft.createFilterGroup();
					var operationFilter = this.Terrasoft.createColumnFilterWithParameter(
						this.Terrasoft.ComparisonType.EQUAL, "SysAdminOperation", this.get("MasterRecordId"));
					var notExistsFilter = this.Terrasoft.createNotExistsFilter("[SysAdminOperationGrantee:SysAdminUnit:Id].Id");
					notExistsFilter.subFilters.addItem(operationFilter);
					return filtersGroup.addItem(notExistsFilter);
				},

				/**
				 * Проверяет, для текущего пользователя,
				 * возможность изменения прав доступа к операции.
				 * @param callbackAllow {Function} Функция обратного вызова.
				 * Выполняется, если возможность изменения прав разрешена.
				 * @param callbackDenied {Function} Функция обратного вызова.
				 * Выполняется, если возможность изменения прав запрещена.
				 * @private
				 */
				checkCanChangeGrantee: function(callbackAllow, callbackDenied) {
					var config = {
						"serviceName": "RightsService",
						"methodName": "CheckCanChangeAdminOperationGrantee"
					};
					this.callService(config, function(response) {
						if (response && response.CheckCanChangeAdminOperationGranteeResult) {
							var result = this.Ext.decode(response.CheckCanChangeAdminOperationGranteeResult);
							if (result && !this.Ext.isEmpty(result)) {
								if (result.Success) {
									if (this.Ext.isFunction(callbackAllow)) {
										callbackAllow.call(this);
									}
								} else {
									this.showInformationDialog(result.ExMessage, function() {
										if (this.Ext.isFunction(callbackDenied)) {
											callbackDenied.call(this);
										}
									});
								}
							}
						}
					}, this);
				},

				/**
				 * Показывает диалоговое окно с предложением сохранить опреацию.
				 * @param callback {Function} Функция обратного вызова.
				 * Выполняется, если нажата кнопка Да.
				 * @private
				 */
				showConfirmSaveOperationDialog: function(callback) {
					var caption = this.get("Resources.Strings.SaveConfirmationMessage");
					var configs = {
						"buttons":
							[this.Terrasoft.MessageBoxButtons.YES.returnCode,
								this.Terrasoft.MessageBoxButtons.NO.returnCode],
						"defaultButton": 0
					};
					this.showInformationDialog(caption, function(result) {
						if (result === this.Terrasoft.MessageBoxButtons.YES.returnCode) {
							if (this.Ext.isFunction(callback)) {
								callback.call(this);
							}
						}
					}, configs);
				}
			}
		};
	});