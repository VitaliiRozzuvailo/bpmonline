define("Rights", ["ext-base", "RightsResources", "LookupUtilities", "RightUtilities",
		"MaskHelper", "ViewGeneratorV2"], function(Ext, resources, LookupUtilities, RightUtilities, MaskHelper) {

	/**
	 * @class Terrasoft.configuration.RightsViewConfig
	 * Класс генерурующий конфигурацию представления модуля прав.
	 */
	Ext.define("Terrasoft.configuration.RightsViewConfig", {
		extend: "Terrasoft.BaseObject",
		alternateClassName: "Terrasoft.RightsViewConfig",

		/**
		 * Генерирует конфигурацию представления списка для модуля прав.
		 * @protected
		 * @virtual
		 * @return {Object[]} Возвращает конфигурацию представления списка для модуля прав.
		 */
		getGridConfig: function(gridName) {
			var result = {
				"itemType": Terrasoft.ViewItemType.GRID,
				"name": gridName + "Grid",
				"type": "listed",
				"primaryColumnName": "Id",
				"markerValue": "RightsGrid",
				"primaryDisplayColumnName": "SysAdminUnit",
				"columnsConfig": [{
					"cols": 12,
					"key": [{
						"name": {"bindTo": "SysAdminUnitType"},
						"type": Terrasoft.GridKeyType.ICON16LISTED
					}, {
						"name": {"bindTo": "SysAdminUnit"}
					}]
				}, {
					"cols": 12,
					"key": [{
						"name": {
							"bindTo": "getRecordRightLevel"
						}
					}]
				}],
				"collection": {"bindTo": gridName + "GridData"},
				"activeRow": {"bindTo": gridName + "ActiveRow"},
				"isEmpty": {"bindTo": gridName + "GridEmpty"},
				"tag": gridName,
				"isEmptyCaption": resources.localizableStrings.GridEmptyCaption,
				"isLoading": {"bindTo": gridName + "GridLoading"},
				"selectRow": {"bindTo": "activeRowChanged"},
				"useListedLookupImages": true,
				"activeRowAction": {"bindTo": "onActiveRowAction"},
				"activeRowActions": [{
					"className": "Terrasoft.Button",
					"style": Terrasoft.controls.ButtonEnums.style.BLUE,
					"tag": "accessLevel-" + gridName,
					"visible": {
						"bindTo": "CurrentRecordRightLevel",
						"bindConfig": {"converter": "canChangeCurrentRightConverter"}
					},
					"caption": resources.localizableStrings.AccessLevelButtonCaption,
					"menu": {
						"items": [{
							"caption": resources.localizableStrings.AllowRightCaption,
							"tag": "change-" + gridName + "-allow"
						}, {
							"caption": resources.localizableStrings.AllowAndGrantRightCaption,
							"tag": "change-" + gridName + "-allowAndGrant"
						}, {
							"caption": resources.localizableStrings.DenyRightCaption,
							"tag": "change-" + gridName + "-deny",
							"visible": {"bindTo": "useDenyRights"}
						}]
					}
				}, {
					"className": "Terrasoft.Button",
					"visible": {
						"bindTo": "CurrentRecordRightLevel",
						"bindConfig": {"converter": "canChangeCurrentRightConverter"}
					},
					"tag": "delete-" + gridName,
					"caption": resources.localizableStrings.DeleteButtonCaption,
					"style": Terrasoft.controls.ButtonEnums.style.GREY
				}]
			};
			return result;
		},

		/**
		 * Генерирует конфигурацию представления модуля прав.
		 * @return {Object[]} Возвращает конфигурацию представления модуля прав.
		 */
		generate: function() {
			return {
				"name": "rights",
				"itemType": Terrasoft.ViewItemType.CONTAINER,
				"wrapClass": ["rights-page", "schema-wrap"],
				"items": [{
					"name": "serviceContainer",
					"itemType": Terrasoft.ViewItemType.CONTAINER,
					"wrapClass": ["rights-service-cntnr"],
					"items": [{
						"name": "AddButton",
						"itemType": Terrasoft.ViewItemType.BUTTON,
						"caption": {"bindTo": "Resources.Strings.AddButtonCaption"},
						"style": Terrasoft.controls.ButtonEnums.style.GREEN,
						"classes": {"wrapperClass": ["rights-service-btn", "rights-add-btn"]},
						"menu": [{
							"caption": {"bindTo": "Resources.Strings.AddReadRightCaption"},
							"click": {"bindTo": "addClick"},
							"enabled": {
								"bindTo": "CurrentRecordRightLevel",
								"bindConfig": {"converter": "isSchemaRecordCanChangeReadRightConverter"}
							},
							"tag": "read"
						}, {
							"caption": {"bindTo": "Resources.Strings.AddEditRightCaption"},
							"click": {"bindTo": "addClick"},
							"enabled": {
								"bindTo": "CurrentRecordRightLevel",
								"bindConfig": {"converter": "isSchemaRecordCanChangeEditRightConverter"}
							},
							"tag": "edit"
						}, {
							"caption": {"bindTo": "Resources.Strings.AddDeleteRightCaption"},
							"click": {"bindTo": "addClick"},
							"enabled": {
								"bindTo": "CurrentRecordRightLevel",
								"bindConfig": {"converter": "isSchemaRecordCanChangeDeleteRightConverter"}
							},
							"tag": "delete"
						}]
					}, {
						"itemType": Terrasoft.ViewItemType.BUTTON,
						"name": "SaveButton",
						"caption": {"bindTo": "Resources.Strings.SaveButtonCaption"},
						"click": {"bindTo": "saveClick"},
						"enabled": {
							"bindTo": "CurrentRecordRightLevel",
							"bindConfig": {"converter": "isSchemaRecordCanChangeAnyRightConverter"}
						},
						"classes": {"textClass": ["rights-service-btn", "rights-save-btn"]}
					}, {
						"itemType": Terrasoft.ViewItemType.BUTTON,
						"name": "CancelButton",
						"caption": {"bindTo": "Resources.Strings.CancelButtonCaption"},
						"click": {"bindTo": "cancelClick"},
						"classes": {"textClass": ["rights-service-btn", "rights-cancel-btn"]}
					}, {
						"itemType": Terrasoft.ViewItemType.BUTTON,
						"name": "DownButton",
						"caption": {"bindTo": "Resources.Strings.DownButtonCaption"},
						"click": {"bindTo": "downClick"},
						"enabled": {"bindTo": "canManagePosition"},
						"classes": {"textClass": ["rights-move-btn"]}
					}, {
						"itemType": Terrasoft.ViewItemType.BUTTON,
						"name": "UpButton",
						"caption": {"bindTo": "Resources.Strings.UpButtonCaption"},
						"click": {"bindTo": "upClick"},
						"enabled": {"bindTo": "canManagePosition"},
						"classes": {"textClass": ["rights-service-btn", "rights-move-btn"]}
					}]
				}, {
					"itemType": Terrasoft.ViewItemType.CONTROL_GROUP,
					"name": "ReadGroup",
					"collapsed": false,
					"caption": {"bindTo": "Resources.Strings.ReadLabel"},
					"classes": {"wrapContainerClass": "rights-unit-cntnr"},
					"items": [this.getGridConfig("read")]
				}, {
					"itemType": Terrasoft.ViewItemType.CONTROL_GROUP,
					"name": "EditGroup",
					"collapsed": false,
					"caption": {"bindTo": "Resources.Strings.EditLabel"},
					"classes": {"wrapContainerClass": "rights-unit-cntnr"},
					"items": [this.getGridConfig("edit")]
				}, {
					"itemType": Terrasoft.ViewItemType.CONTROL_GROUP,
					"name": "DeleteGroup",
					"collapsed": false,
					"caption": {"bindTo": "Resources.Strings.DeleteLabel"},
					"classes": {"wrapContainerClass": "rights-unit-cntnr"},
					"items": [this.getGridConfig("delete")]
				}]
			};
		}
	});

	/**
	 * @class Terrasoft.configuration.EntityRecordRight
	 * Класс представляющий собой запись в таблице прав объектв.
	 */
	Ext.define("Terrasoft.configuration.EntityRecordRight", {
		alternateClassName: "Terrasoft.EntityRecordRight",
		extend: "Terrasoft.BaseViewModel",

		/**
		 * @type {String}
		 */
		id: null,

		/**
		 * Название схемы объекта для модели представления.
		 * @type {String}
		 */
		entitySchemaName: "Terrasoft.RecordRightEntitySchema",

		/**
		 * @inheritDoс Terrasoft.model.BaseModel#columns
		 */
		columns: {
			SysAdminUnitType: {
				name: "SysAdminUnitType",
				columnPath: "SysAdminUnitType",
				dataValueType: Terrasoft.DataValueType.LOOKUP,
				isLookup: true,
				referenceSchemaName: "SysAdminUnitType"
			},
			getRecordRightLevel: {
				name: "getRecordRightLevel",
				dataValueType: Terrasoft.DataValueType.LOOKUP,
				type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN
			}

		},

		mixins: {
			rightsUtilities: "Terrasoft.RightUtilitiesMixin"
		},

		/**
		 * Инициализирует схему модели представления.
		 * @inheritDoс Terrasoft.model.BaseViewModel#constructor
		 * @overridden
		 */
		constructor: function() {
			this.callParent(arguments);
			this.entitySchema = this.entitySchema || Ext.create(this.entitySchemaName);
			Ext.apply(this.columns, this.entitySchema.columns);
		},

		/**
		 * Проверяет, можно ли изменять права на запись с текущими правами доступа на.
		 * @protected
		 * @virtual
		 * @param {Number} value права доступа на запись для пользователя.
		 * @return {Boolean} Возвращает true, если есть права ня модификацию прав для текущей записи,
		 * false в обратном случае.
		 */
		canChangeCurrentRightConverter: function(value) {
			var currentOperation = this.get("Operation");
			switch (currentOperation) {
				case Terrasoft.RightsEnums.operationTypes.read:
					return this.isSchemaRecordCanChangeReadRightConverter(value);
				case Terrasoft.RightsEnums.operationTypes.edit:
					return this.isSchemaRecordCanChangeEditRightConverter(value);
				case Terrasoft.RightsEnums.operationTypes["delete"]:
					return this.isSchemaRecordCanChangeDeleteRightConverter(value);
				default:
					return false;
			}
		},

		/**
		 * Находит название для текущего уровня доступа.
		 * @protected
		 * @virtual
		 * @return {String} Возвращает название для текущего уровня доступа.
		 */
		getRecordRightLevel: function() {
			var rightLevelValue = this.get("RightLevel");
			var rightLevels = Terrasoft.RightsEnums.rightLevels;
			var result = null;
			Terrasoft.each(rightLevels, function(rightLevel) {
				if (rightLevel.Value === rightLevelValue) {
					result = rightLevel;
					return false;
				}
			}, this);
			return result && result.Name;
		}
	});

	/**
	 * @class Terrasoft.configuration.RecordRightEntitySchema
	 * Класс представляющий собой схему объекта права.
	 */
	Ext.define("Terrasoft.configuration.RecordRightEntitySchema", {
		alternateClassName: "Terrasoft.RecordRightEntitySchema",
		extend: "Terrasoft.BaseEntitySchema",
		columns: {
			Id: {
				name: "Id",
				columnPath: "Id",
				dataValueType: Terrasoft.DataValueType.GUID,
				visible: false
			},
			SysAdminUnit: {
				name: "SysAdminUnit",
				columnPath: "SysAdminUnit",
				dataValueType: Terrasoft.DataValueType.LOOKUP
			},
			RightLevel: {
				name: "RightLevel",
				columnPath: "RightLevel",
				dataValueType: Terrasoft.DataValueType.INTEGER
			},
			Operation: {
				name: "Operation",
				columnPath: "Operation",
				dataValueType: Terrasoft.DataValueType.INTEGER
			},
			Position: {
				name: "Position",
				columnPath: "Position",
				dataValueType: Terrasoft.DataValueType.INTEGER
			}
		}
	});

	/**
	 * @class Terrasoft.configuration.EntityRecordRightsViewModel
	 * Класс представляющий собой модель представления модуля прав.
	 */
	Ext.define("Terrasoft.configuration.EntityRecordRightsViewModel", {
		alternateClassName: "Terrasoft.EntityRecordRightsViewModel",
		extend: "Terrasoft.BaseViewModel",

		Ext: null,
		sandbox: null,
		Terrasoft: null,

		mixins: {
			rightsUtilities: "Terrasoft.RightUtilitiesMixin"
		},

		columns: {
			readActiveRow: {
				type: Terrasoft.core.enums.ViewModelSchemaItem.ATTRIBUTE,
				name: "readActiveRow",
				dataValueType: Terrasoft.DataValueType.LOOKUP
			},
			editActiveRow: {
				type: Terrasoft.core.enums.ViewModelSchemaItem.ATTRIBUTE,
				name: "editActiveRow",
				dataValueType: Terrasoft.DataValueType.LOOKUP
			},
			deleteActiveRow: {
				type: Terrasoft.core.enums.ViewModelSchemaItem.ATTRIBUTE,
				name: "deleteActiveRow",
				dataValueType: Terrasoft.DataValueType.LOOKUP
			},
			readGridData: {
				type: Terrasoft.core.enums.ViewModelSchemaItem.ATTRIBUTE,
				name: "readGridData",
				dataValueType: Terrasoft.DataValueType.LOOKUP,
				isCollection: true
			},
			editGridData: {
				type: Terrasoft.core.enums.ViewModelSchemaItem.ATTRIBUTE,
				name: "editGridData",
				dataValueType: Terrasoft.DataValueType.LOOKUP,
				isCollection: true
			},
			deleteGridData: {
				type: Terrasoft.core.enums.ViewModelSchemaItem.ATTRIBUTE,
				name: "deleteGridData",
				dataValueType: Terrasoft.DataValueType.LOOKUP,
				isCollection: true
			}
		},

		/**
		 * Проверяет, можно ли с текущими правами изменять права доступа на объект.
		 * @protected
		 * @virtual
		 * @param {Number} value Текущие права доступа.
		 * @return {Boolean} Возвращает true если можно изменить хоть что-то,
		 * false в обратном случае.
		 */
		isSchemaRecordCanChangeAnyRightConverter: function(value) {
			return this.isSchemaRecordCanChangeReadRightConverter(value) ||
				this.isSchemaRecordCanChangeEditRightConverter(value) ||
				this.isSchemaRecordCanChangeDeleteRightConverter(value);
		},

		/**
		 * Обработчик нажатия кнопки уровня доступа. Изменяет уровень доступа для записи.
		 * @protected
		 * @virtual
		 * @param {String} operation Название операции.
		 * @param {String} newRight Название нового уровня доступа.
		 * @param {String} activeRecordId Уникальный идентификатор записи.
		 */
		accessLevelClick: function(operation, newRight, activeRecordId) {
			var viewModelItems = this.get(operation + "GridData");
			var item = viewModelItems.get(activeRecordId);
			item.set("RightLevel", Terrasoft.RightsEnums.rightLevels[newRight].Value);
		},

		/**
		 * Обработчик нажатия на кнопку добавления новой записи.
		 * @protected
		 * @virtual
		 * @param {String} operation Название операции.
		 */
		addClick: function(operation) {
			var lookUpConfig = {
				columns: ["SysAdminUnitTypeValue"],
				entitySchemaName: "SysAdminUnit",
				columnName: operation
			};
			LookupUtilities.Open(this.sandbox, lookUpConfig, this.onAddRecordSelected, this);
		},

		/**
		 * Обработчик выбора новой записи из справочника.
		 * @protected
		 * @virtual
		 * @param {Object} args Результат работы модуля справочника.
		 */
		onAddRecordSelected: function(args) {
			var operation = args.columnName;
			var selectedUnit = args.selectedRows.getByIndex(0);
			if (!selectedUnit) {
				return;
			}
			var item = {
				Id: Terrasoft.utils.generateGUID(),
				Operation: Terrasoft.RightsEnums.operationTypes[operation],
				Position: 0,
				RightLevel: Terrasoft.RightsEnums.rightLevels.allow.Value,
				SysAdminUnit: selectedUnit,
				SysAdminUnitType: Terrasoft.RightsEnums.sysAdminUnitType[selectedUnit.SysAdminUnitTypeValue]
			};
			var viewModelItems = this.get(operation + "GridData");
			viewModelItems.each(function(item) {
				var position = item.get("Position") + 1;
				item.set("Position", position);
			});
			var viewModelItem = this.createViewModelItem(item, true);
			viewModelItems.insert(0, viewModelItem.get("Id"), viewModelItem);
			this.refreshGridData(viewModelItems, operation);
		},

		/**
		 * Обработчик нажатия на кнопку сохранения.
		 * @protected
		 * @virtual
		 */
		saveClick: function() {
			var resultCollection = this.Ext.create("Terrasoft.BaseViewModelCollection");
			resultCollection.loadAll(this.get("deletedItems"));
			resultCollection.loadAll(this.get("readGridData"));
			resultCollection.loadAll(this.get("editGridData"));
			resultCollection.loadAll(this.get("deleteGridData"));
			var changedRights = [];
			resultCollection.each(function(item) {
				var changedValues = item.changedValues || (item.isNew && item.values) || {};
				if (!Ext.Object.isEmpty(changedValues) || item.isDeleted) {
					var saveConfig = Terrasoft.deepClone(changedValues);
					Ext.apply(saveConfig, {
						isNew: item.isNew,
						isDeleted: item.isDeleted,
						Id: item.get("Id"),
						SysAdminUnit: item.get("SysAdminUnit"),
						Operation: item.get("Operation")
					});
					if (item.isNew) {
						Ext.apply(saveConfig, {
							RightLevel: item.get("RightLevel"),
							Position: item.get("Position")
						});
					}
					changedRights.push(saveConfig);
				}
			}, this);
			if (changedRights.length) {
				RightUtilities.applyChanges({
					"recordRights": changedRights,
					"record": {
						entitySchemaName: this.get("entitySchemaName"),
						primaryColumnValue: this.get("primaryColumnValue")
					}
				}, this.cancelClick, this);
			} else {
				this.cancelClick();
			}
		},

		/**
		 * Обработчик нажатия на кнопку удаления записи.
		 * @protected
		 * @virtual
		 * @param {String} rightType Название операции.
		 * @param {String} activeRecordId Уникальный идентификатор записи.
		 */
		deleteClick: function(rightType, activeRecordId) {
			var viewModelItems = this.get(rightType + "GridData");
			var item = viewModelItems.get(activeRecordId);
			viewModelItems.removeByKey(activeRecordId);
			this.set(rightType + "GridEmpty", viewModelItems.isEmpty());
			var startPosition = item.get("Position");
			var changedItems = viewModelItems.filterByFn(function(filteredItem) {
				return filteredItem.get("Position") > startPosition;
			}, this);
			changedItems.each(function(changedItem) {
				var newPosition = (changedItem.get("Position")) - 1;
				changedItem.set("Position", newPosition);
			}, this);
			if (!item.isNew) {
				var deletedItems = this.get("deletedItems");
				item.isDeleted = true;
				deletedItems.add(item.get("Id"), item);
			}
		},

		/**
		 * Обработчик нажатия на кнопку удаления отмены.
		 * @protected
		 * @virtual
		 */
		cancelClick: function() {
			this.sandbox.publish("BackHistoryState");
		},

		/**
		 * Находит выбранный реестр и возвращает операцию, к которой он относится.
		 * @protected
		 * @virtual
		 * @return {Terrasoft.RightsEnums.operationTypes} Возвращает операцию, к которой он относится выбранный реест.
		 */
		getActiveOperation: function() {
			var readActiveRow = this.get("readActiveRow");
			var editActiveRow = this.get("editActiveRow");
			var deleteActiveRow = this.get("deleteActiveRow");
			return (editActiveRow && Terrasoft.RightsEnums.operationTypes.edit) ||
				(deleteActiveRow && Terrasoft.RightsEnums.operationTypes["delete"]) ||
				(readActiveRow && Terrasoft.RightsEnums.operationTypes.read);
		},

		/**
		 * Находит, можно ли изменять выбранную операцию с текущими правами на запись.
		 * @protected
		 * @virtual
		 * @param {Number} value Права на запись.
		 * @return {Boolean} Возвращает true если можно менять права в выбранной операции,
		 * false в противном слечае.
		 */
		canChangeCurrentRightConverter: function(value) {
			var currentOperation = this.getActiveOperation();
			switch (currentOperation) {
				case Terrasoft.RightsEnums.operationTypes.read:
					return this.isSchemaRecordCanChangeReadRightConverter(value);
				case Terrasoft.RightsEnums.operationTypes.edit:
					return this.isSchemaRecordCanChangeEditRightConverter(value);
				case Terrasoft.RightsEnums.operationTypes["delete"]:
					return this.isSchemaRecordCanChangeDeleteRightConverter(value);
				default:
					return false;
			}
		},

		/**
		 * Находит, можно ли изменять позицию выбранного права.
		 * @protected
		 * @virtual
		 * @return {Boolean} Возвращает true если можно менять позицию выбранного права,
		 * false в противном слечае.
		 */
		canManagePosition: function() {
			var currentRecordRightLevel = this.get("CurrentRecordRightLevel");
			return this.canChangeCurrentRightConverter(currentRecordRightLevel) && this.get("useDenyRights");
		},

		/**
		 * Функция сортировки элементов по позиции.
		 * @protected
		 * @virtual
		 */
		sortByPositionFn: function(o1, o2) {
			var property1 = o1.get("Position");
			var property2 = o2.get("Position");
			if (property1 === property2) {
				return 0;
			}
			return (property1 < property2) ? -1 : 1;
		},

		/**
		 * Обработчик нажатия на кнопку "Вверх".
		 * @protected
		 * @virtual
		 */
		upClick: function() {
			var activeOperation = this.getActiveOperation();
			var operationName = Ext.Object.getKey(Terrasoft.RightsEnums.operationTypes, activeOperation);
			var activeRow = this.get(operationName + "ActiveRow");
			var viewModelItems = this.get(operationName + "GridData");
			var item = viewModelItems.get(activeRow);
			var currentItemPosition = item.get("Position");
			if (currentItemPosition === 0) {
				return;
			}
			currentItemPosition--;
			viewModelItems.each(function(item) {
				var position = item.get("Position");
				if (position === currentItemPosition) {
					item.set("Position", ++position);
					return false;
				}
			}, this);
			item.set("Position", currentItemPosition);
			viewModelItems.sortByFn(this.sortByPositionFn);
			this.refreshGridData(viewModelItems);
		},

		/**
		 * Обработчик нажатия на кнопку "Вниз".
		 * @protected
		 * @virtual
		 */
		downClick: function() {
			var activeOperation = this.getActiveOperation();
			var operationName = Ext.Object.getKey(Terrasoft.RightsEnums.operationTypes, activeOperation);
			var activeRow = this.get(operationName + "ActiveRow");
			var viewModelItems = this.get(operationName + "GridData");
			var item = viewModelItems.get(activeRow);
			var currentItemPosition = item.get("Position");
			if (currentItemPosition === (viewModelItems.getCount() - 1)) {
				return;
			}
			currentItemPosition++;
			viewModelItems.each(function(item) {
				var position = item.get("Position");
				if (position === currentItemPosition) {
					item.set("Position", --position);
					return false;
				}
			}, this);
			item.set("Position", currentItemPosition);
			viewModelItems.sortByFn(this.sortByPositionFn);
			this.refreshGridData(viewModelItems);
		},

		/**
		 * Обработчик нажатия кнопки в реестре.
		 * @protected
		 * @virtual
		 * @param {String} tag Тэг нажатой кнопки.
		 * @param {String} activeRecordId Идетнификатор выбранной записи.
		 */
		onActiveRowAction: function(tag, activeRecordId) {
			if (!tag) {
				return;
			}
			var actionConfig = tag.split("-");
			var method = actionConfig[0];
			var rightType = actionConfig[1];
			switch (method) {
				case "change":
					var operation = actionConfig[2];
					this.accessLevelClick(rightType, operation, activeRecordId);
					break;
				case "delete":
					this.deleteClick(rightType, activeRecordId);
					break;
			}
		},

		/**
		 * Обработчик сворачаваний\разворачивание группы.
		 * @protected
		 * @virtual
		 */
		onCollapsedChanged: Terrasoft.emptyFn,

		/**
		 * Обработчик изменения выделенной записи.
		 * @protected
		 * @virtual
		 * @param {String} id Идентификатор новой выбранной записи.
		 * @param {String} operation Название операции выбранной записи.
		 */
		activeRowChanged: function(id, operation) {
			var rights = ["read", "edit", "delete"];
			Ext.Array.remove(rights, operation);
			rights.forEach(function(right) {
				this.set(right + "ActiveRow", null);
			}, this);
		},

		/**
		 * Создает экземпляр объекта прав.
		 * @protected
		 * @virtual
		 * @param {Object} item Объект значений.
		 * @param {Boolean} isNew Признак, является ли запись новой или уже созданной.
		 * @return {Terrasoft.EntityRecordRight} Возвращает экземпляр объекта прав.
		 */
		createViewModelItem: function(item, isNew) {
			if (!item.IsNew && !Terrasoft.isGUID(item.Id)) {
				item.Id = item.Id.substring(item.Id.indexOf("{") + 1, item.Id.lastIndexOf("}"));
			}
			var rightLevel = this.get("CurrentRecordRightLevel");
			var useDenyRights = this.get("useDenyRights");
			Ext.apply(item, {
				CurrentRecordRightLevel: rightLevel,
				useDenyRights: useDenyRights
			});
			var viewModelItem = this.Ext.create("Terrasoft.EntityRecordRight", {
				id: item.Id,
				isNew: isNew,
				values: item
			});
			return viewModelItem;
		},

		/**
		 * Генерирует заголовок страницы.
		 * @protected
		 * @virtual
		 * @return {String} Возвращает заголовок страницы.
		 */
		getPageCaption: function() {
			var value = this.get("primaryDisplayColumnValue") || this.get("PrimaryColumnValue");
			if (value) {
				this.set("PrimaryColumnValue", value);
			} else {
				var entitySchemaName = this.get("entitySchemaName");
				var primaryColumnValue = this.get("primaryColumnValue");
				var esq = Ext.create("Terrasoft.EntitySchemaQuery", {rootSchemaName: entitySchemaName});
				esq.addMacrosColumn(Terrasoft.QueryMacrosType.PRIMARY_DISPLAY_COLUMN, "displayValue");
				esq.getEntity(primaryColumnValue, function(result) {
					var entity = result.entity;
					if (result.success && entity) {
						this.set("PrimaryColumnValue", entity.get("displayValue"));
					}
				}, this);
			}
			return this.get("Resources.Strings.RightsCaption") + value;
		},

		/**
		 * Производит перегенерацию реестра.
		 * @protected
		 * @virtual
		 * @param {Terrasoft.Collection} gridData Коллекция элементов реестра.
		 * @param {String} operation Название операции списка.
		 */
		refreshGridData: function(gridData, operation) {
			var tempCollection = this.Ext.create("Terrasoft.BaseViewModelCollection");
			tempCollection.loadAll(gridData);
			if (!gridData.isEmpty()) {
				gridData.clear();
			}
			if (operation) {
				this.set(operation + "GridEmpty", tempCollection.isEmpty());
			}
			gridData.loadAll(tempCollection);
		},

		/**
		 * Производит Загрузку данных в модель представлнеия.
		 * @protected
		 * @virtual
		 * param {Function} callback Функция обратного вызова.
		 * param {Terrasoft.BaseModel} scope Контекст выполнения функции обратного вызова.
		 */
		loadData: function(callback, scope) {
			var entitySchemaName = this.get("entitySchemaName");
			var primaryColumnValue = this.get("primaryColumnValue");
			RightUtilities.getRecordRights({
				"tableName": this.getRightsEntitySchemaName(),
				"recordId": primaryColumnValue
			}, function(recordRightsResponse) {
				RightUtilities.getUseDenyRecordRights({
					"schemaName": entitySchemaName
				}, function(useDenyRecord) {
					this.set("useDenyRights", useDenyRecord);
					RightUtilities.getSchemaRecordRightLevel(entitySchemaName, primaryColumnValue,
						function(rightLevel) {
						this.set("CurrentRecordRightLevel", rightLevel);
						var readRights = this.get("readGridData");
						var editRights = this.get("editGridData");
						var deleteRights = this.get("deleteGridData");
						Terrasoft.each(recordRightsResponse, function(recordRight) {
							var viewModelItem = this.createViewModelItem(recordRight, false);
							var primaryValue = viewModelItem.get("Id");
							switch (recordRight.Operation) {
								case Terrasoft.RightsEnums.operationTypes.read:
									readRights.add(primaryValue, viewModelItem);
									break;
								case Terrasoft.RightsEnums.operationTypes.edit:
									editRights.add(primaryValue, viewModelItem);
									break;
								case Terrasoft.RightsEnums.operationTypes["delete"]:
									deleteRights.add(primaryValue, viewModelItem);
									break;
							}
						}, this);
						this.set("readGridEmpty", readRights.isEmpty());
						this.set("editGridEmpty", editRights.isEmpty());
						this.set("deleteGridEmpty", deleteRights.isEmpty());
						callback.call(scope);
					}, this);
				}, this);
			}, this);
		},

		/**
		 * Генерирует имя схемы прав для текущей схемы.
		 * @protected
		 * @virtual
		 * @return {String} Возвращает имя схемы прав для текущей схемы.
		 */
		getRightsEntitySchemaName: function() {
			var entitySchemaName = this.get("entitySchemaName");
			return (entitySchemaName.indexOf("Sys") === 0) ?
				entitySchemaName + "Right" :
				"Sys" + entitySchemaName + "Right";
		},

		/**
		 * Инициализирует начальные значения модели.
		 * @protected
		 * @virtual
		 * param {Function} callback Функция обратного вызова.
		 * param {Terrasoft.BaseModel} scope Контекст выполнения функции обратного вызова.
		 */
		init: function(callback, scope) {
			this.initResourcesValues(resources);
			this.set("readGridData", this.Ext.create("Terrasoft.BaseViewModelCollection"));
			this.set("editGridData", this.Ext.create("Terrasoft.BaseViewModelCollection"));
			this.set("deleteGridData", this.Ext.create("Terrasoft.BaseViewModelCollection"));
			this.set("deletedItems", this.Ext.create("Terrasoft.BaseViewModelCollection"));
			this.loadData(function() {
				this.initPageCaption();
				callback.call(scope || this);
			}, this);
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
		 * Инициализирует подпись заголовка страницы
		 * @protected
		 * @virtual
		 */
		initPageCaption: function() {
			this.sandbox.publish("InitDataViews", {
				caption: this.getPageCaption()
			});
		},

		onRender: Terrasoft.emptyFn
	});

	/**
	 * @class Terrasoft.configuration.Rights
	 * Класс представляющий собой модуль прав.
	 */
	Ext.define("Terrasoft.configuration.Rights", {
		alternateClassName: "Terrasoft.Rights",
		extend: "Terrasoft.BaseModule",
		Ext: null,
		sandbox: null,
		Terrasoft: null,

		/**
		 * Признак асинхронности модуля.
		 * @type {Boolean}
		 */
		isAsync: true,

		/**
		 * Объект представления модуля.
		 * @type {Terrasoft.Component}
		 */
		view: null,

		/**
		 * Класс модели представления.
		 * @type {Terrasoft.BaseModel}
		 */
		viewModelClass: null,

		/**
		 * Объект модели представления модуля.
		 * @type {Terrasoft.BaseModel}
		 */
		viewModel: null,

		/**
		 * Объект конфигурации представления модуля.
		 * @type {Object}
		 */
		viewConfig: null,

		/**
		 * Объект конфигурации модуля.
		 * @type {Object}
		 */
		moduleConfig: null,

		/**
		 * Имя класа генератога представления.
		 * @type {String}
		 */
		viewGeneratorClass: "Terrasoft.ViewGenerator",

		/**
		 * Имя класа генератога конфигурации представления модуля.
		 * @type {String}
		 */
		viewConfigClassName: "Terrasoft.RightsViewConfig",

		/**
		 * Имя класса модели представления для модуля.
		 * @type {String}
		 */
		viewModelClassName: "Terrasoft.EntityRecordRightsViewModel",

		/**
		 * Создает экземпляр класса Terrasoft.ViewGenerator.
		 * @return {Terrasoft.ViewGenerator} Возвращает объект Terrasoft.ViewGenerator.
		 */
		createViewGenerator: function() {
			return this.Ext.create(this.viewGeneratorClass);
		},

		/**
		 * Создает конфигурацию представления модуля.
		 * @protected
		 * @virtual
		 * param {Object} config Объект конфигурации.
		 * param {Function} callback Функция обратного вызова.
		 * param {Terrasoft.BaseModel} scope Контекст выполнения функции обратного вызова.
		 * @return {Object[]} Возвращает конфигурацию представления модуля.
		 */
		buildView: function(config, callback, scope) {
			var viewGenerator = this.createViewGenerator();
			var viewClass = this.Ext.create(this.viewConfigClassName);
			var schema = {
				viewConfig: [viewClass.generate(config)]
			};
			var viewConfig = Ext.apply({
				schema: schema
			}, config);
			viewGenerator.generate(viewConfig, callback, scope);
		},

		/**
		 * Инициализирует объект конфигурации представления модуля.
		 * @protected
		 * @abstract
		 * @param {Function} callback Функция, которая будет вызвана по завершению.
		 * @param {Object} scope Контекст, в котором будет вызвана функция callback.
		 */
		initViewConfig: function(callback, scope) {
			var generatorConfig = Terrasoft.deepClone(this.moduleConfig);
			generatorConfig.viewModelClass = this.viewModelClass;
			this.buildView(generatorConfig, function(view) {
				this.viewConfig = view[0];
				callback.call(scope);
			}, this);
		},

		/**
		 * Заменяет последний элемент в цепочке состояний, если его идентификатор модуля отличается от текущего.
		 * @protected
		 * @virtual
		 */
		initHistoryState: function() {
			var state = this.sandbox.publish("GetHistoryState");
			var currentHash = state.hash;
			var currentState = state.state || {};
			if (currentState.moduleId !== this.sandbox.id) {
				var newState = this.Terrasoft.deepClone(currentState);
				newState.moduleId = this.sandbox.id;
				this.sandbox.publish("PushHistoryState", {
					stateObj: newState,
					pageTitle: null,
					hash: currentHash.historyState,
					silent: true
				});
			}
		},

		/**
		 * Инициализирует класс модели представления модуля.
		 * @protected
		 * @abstract
		 * @param {Function} callback Функция, которая будет вызвана по завершению.
		 * @param {Object} scope Контекст, в котором будет вызвана функция callback.
		 */
		initViewModelClass: function(callback, scope) {
			this.viewModelClass = Ext.ClassManager.get(this.viewModelClassName);
			callback.call(scope);
		},

		/**
		 * Инициализирует объект конфигурации модуля.
		 * @protected
		 * @virtual
		 */
		initConfig: function() {
			var sandbox = this.sandbox;
			this.moduleConfig = sandbox.publish("GetRecordInfo", null, [sandbox.id]);
		},

		/**
		 * Создает представление для вложенного модуля.
		 * @protected
		 * @virtual
		 * @return {Terrasoft.Component} Возвращает созданное представление для вложенного модуля.
		 */
		createView: function() {
			var viewConfig = Terrasoft.deepClone(this.viewConfig);
			var containerClassName = viewConfig.className || "Terrasoft.Container";
			return this.Ext.create(containerClassName, viewConfig);
		},

		/**
		 * Создает модель представления для вложенного модуля.
		 * @protected
		 * @virtual
		 * @return {Terrasoft.BaseModel} Возвращает созданную модель представления для вложенного модуля.
		 */
		createViewModel: function() {
			return this.Ext.create(this.viewModelClass, this.getViewModelConfig());
		},

		/**
		 * Генерирует параметры для сознания модели представления модуля.
		 * @protected
		 * @virtual
		 * @return {Object} Возвращает параметры для сознания модели представления модуля.
		 */
		getViewModelConfig: function() {
			return {
				Ext: this.Ext,
				sandbox: this.sandbox,
				Terrasoft: this.Terrasoft,
				values: Ext.apply({}, this.moduleConfig)
			};
		},

		/**
		 * Инициализирует начальные значения модели.
		 * @protected
		 * @virtual
		 * @param {Function} callback Функция, которая будет вызвана по завершению.
		 * @param {Object} scope Контекст, в котором будет вызвана функция callback.
		 */
		init: function(callback, scope) {
			callback = callback || Ext.emptyFn;
			if (this.viewModel) {
				callback.call(scope);
				return;
			}
			this.initHistoryState();
			this.initConfig();
			this.initViewModelClass(function() {
				if (this.destroyed) {
					return;
				}
				this.initViewConfig(function() {
					if (this.destroyed) {
						return;
					}
					var viewModel = this.viewModel = this.createViewModel();
					viewModel.init(function() {
						if (!this.destroyed) {
							callback.call(scope);
						}
					}, this);
				}, this);
			}, this);
		},

		/**
		 * Выполняет отрисовку модуля.
		 * @protected
		 * @virtual
		 * @param {Object} renderTo Указывает ссылку на Ext.Element в который будет рендериться элемент управления.
		 */
		render: function(renderTo) {
			var viewModel = this.viewModel;
			var view = this.view;
			if (!view || view.destroyed) {
				view = this.view = this.createView();
				view.bind(viewModel);
				view.render(renderTo);
			} else {
				view.reRender(0, renderTo);
			}
			viewModel.renderTo = renderTo.id;
			viewModel.onRender();
			MaskHelper.HideBodyMask();
		},

		/**
		 * Очищает все подписки на события и уничтожает объект.
		 * @overridden
		 * @param {Object} config Параметры уничтожения модуля.
		 */
		destroy: function(config) {
			if (config.keepAlive !== true) {
				this.callParent(arguments);
			}
		}

	});

	return Terrasoft.Rights;
});
