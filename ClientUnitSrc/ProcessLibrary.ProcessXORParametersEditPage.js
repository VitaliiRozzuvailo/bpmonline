define("ProcessXORParametersEditPage", ["ProcessXORParametersEditPageResources", "ModalBox", "ProcessLibraryConstants",
		"ProcessModuleUtilities", "ConfigurationConstants", "ConfigurationEnums", "LookupUtilities",
		"ConfigurationGrid", "ConfigurationGridGenerator", "ConfigurationGridUtilities"],
	function(resources, ModalBox, ProcessLibraryConstants, ProcessModuleUtilities) {
		var entitySchemaColumnsConfig = {
			Id: {
				columnPath: "Id",
				dataValueType: 0,
				isRequired: true,
				type: Terrasoft.ViewModelColumnType.ENTITY_COLUMN
			},
			IfFlowElementCompleted: {
				columnPath: "IfFlowElementCompleted",
				dataValueType: Terrasoft.DataValueType.LOOKUP,
				isLookup: true,
				isSimpleLookup: true,
				caption: resources.localizableStrings.IfFlowElementCompletedCaption,
				isRequired: false,
				type: Terrasoft.ViewModelColumnType.ENTITY_COLUMN
			},
			CompletedWithResult: {
				columnPath: "CompletedWithResult",
				dataValueType: Terrasoft.DataValueType.LOOKUP,
				isLookup: true,
				isSimpleLookup: true,
				referenceSchemaName: "SysProcessUserTask",
				caption: resources.localizableStrings.CompletedWithResultCaption,
				isRequired: false,
				type: Terrasoft.ViewModelColumnType.ENTITY_COLUMN
			},
			ThenExecuteFlowElement: {
				columnPath: "ThenExecuteFlowElement",
				dataValueType: Terrasoft.DataValueType.LOOKUP,
				isLookup: true,
				isSimpleLookup: true,
				caption: resources.localizableStrings.ThenExecuteFlowElementCaption,
				isRequired: false,
				type: Terrasoft.ViewModelColumnType.ENTITY_COLUMN
			}
		};
		return {
			mixins: {
				ConfigurationGridUtilites: "Terrasoft.ConfigurationGridUtilities"
			},
			attributes: {
				"Hint": {
					type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					dataValueType: Terrasoft.DataValueType.TEXT,
					caption: resources.localizableStrings.HintCaption
				},
				"IsEditable": {
					dataValueType: Terrasoft.DataValueType.BOOLEAN,
					type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					value: true
				},
				"IfFlowElementCompleted": entitySchemaColumnsConfig.IfFlowElementCompleted,
				"CompletedWithResult": entitySchemaColumnsConfig.CompletedWithResult,
				"ThenExecuteFlowElement": entitySchemaColumnsConfig.ThenExecuteFlowElement,
				"ElseExecuteFlowElement": {
					columnPath: "ElseExecuteFlowElement",
					dataValueType: Terrasoft.DataValueType.LOOKUP,
					isLookup: true,
					isSimpleLookup: true,
					caption: resources.localizableStrings.ElseExecuteFlowElementCaption,
					isRequired: true
				}
			},
			entitySchemaName: null,
			messages: {
				/**
				 * @message SetParametersInfo
				 * Указывает значения параметров
				 */
				"SetParametersInfo": {
					mode: Terrasoft.MessageMode.PTP,
					direction: Terrasoft.MessageDirectionType.PUBLISH
				}
			},
			details: /**SCHEMA_DETAILS*/{
			}/**SCHEMA_DETAILS*/,
			methods: {
				/**
				 * @overridden
				 */
				init: function() {
					this.callParent(arguments);
					this.set("Caption", this.get("modalBoxCaption"));
					var flowElements = this.get("FlowElements");
					var endElementConst = ProcessLibraryConstants.EndElementStepValue;
					var endElement = {
						uid: endElementConst.value,
						caption: endElementConst.displayValue
					};
					flowElements.push(endElement);
					this.set("ElseExecuteFlowElement", Ext.clone(endElementConst));
					this.set("FlowElements", flowElements);
					this.entitySchema = this.Ext.create("Terrasoft.BaseEntitySchema", {
						columns: entitySchemaColumnsConfig,
						primaryDisplayColumnName: "IfFlowElementCompleted"
					});
				},
				/**
				 * Просматривает информацию валидации и возвращает на ее основе сообщение для пользователя
				 * @private
				 * @return {String} Возвращает сообщения для пользователя
				 */
				getValidationMessage: function() {
					var messageTemplate = this.get("Resources.Strings.FieldValidationError");
					var invalidMessage = "";
					var invalidColumnName = null;
					Terrasoft.each(this.validationInfo.attributes, function(attribute, attributeName) {
						if (!attribute.isValid) {
							invalidColumnName = attributeName;
							invalidMessage = attribute.invalidMessage;
							return false;
						}
					});
					if (invalidColumnName) {
						var invalidColumn = this.getColumnByName(invalidColumnName);
						var columnCaption =
							invalidColumn && invalidColumn.caption ? invalidColumn.caption : invalidColumnName;
						invalidMessage = Ext.String.format(messageTemplate, columnCaption, invalidMessage);
					}
					return invalidMessage;
				},
				/**
				 * Отображает сообщение пользователю, если операция проверки на корректность указания значений
				 * выполнена не успешно
				 * @overridden
				 * @return {Boolean} Возвращает true при успешном выполнении всех валидаторов
				 */
				validate: function() {
					var isValid = this.callParent(arguments);
					var validationMessage = null;
					if (!isValid) {
						validationMessage = this.getValidationMessage();
						this.showInformationDialog(validationMessage);
						return false;
					}
					var gridData = this.getGridData();
					if (!gridData || gridData.getCount() === 0) {
						validationMessage = resources.localizableStrings.NotSpecifiedAnyXorConditionsMessage;
						this.showInformationDialog(validationMessage);
						return false;
					}
					var rows = gridData.getItems();
					var invalidStep = null;
					Terrasoft.each(rows, function(row) {
						if (!row.validate()) {
							invalidStep = row;
							return false;
						}
					});
					if (invalidStep) {
						this.setActiveRow(invalidStep.get("Id"));
						validationMessage = this.getValidationMessage.call(invalidStep);
						this.showInformationDialog(validationMessage);
						return false;
					}
					return true;
				},
				/**
				 * Инициализирует пользовательские валидаторы
				 * @protected
				 * @overridden
				 */
				setValidationConfig: function() {
					this.callParent(arguments);
					this.addColumnValidator("ElseExecuteFlowElement", this.elseExecuteFlowElementValidator);
				},
				/**
				 * Функция валидации поля "Иначе"
				 * Значения поля не должно совпадать со значением поля "То выполнить шаг"
				 * @returns {{invalidMessage: string}} Возвращает результат валидации
				 */
				elseExecuteFlowElementValidator: function(value) {
					var invalidMessage = "";
					if (value && value.displayValue) {
						var gridData = this.getGridData();
						if (gridData) {
							var rows = gridData.getItems();
							Terrasoft.each(rows, function(row) {
								var thenExecuteValue =  row.get("ThenExecuteFlowElement") ?
									row.get("ThenExecuteFlowElement").displayValue : null;
								if (thenExecuteValue && thenExecuteValue === value.displayValue) {
									invalidMessage = this.get("Resources.Strings.ThenExecuteEqualElseExecuteMessage");
									return false;
								}
							}, this);
						}
					}
					return {
						invalidMessage: invalidMessage
					};
				},
				/**
				 * Функция валидации поля "То выполнить шаг"
				 * Значения поля не должно совпадать со значением поля "Иначе"
				 * @returns {{invalidMessage: string}} Возвращает результат валидации
				 */
				thenExecuteFlowElementValidator: function(value) {
					var invalidMessage = "";
					var elseExecuteValue = this.pageViewModel.get("ElseExecuteFlowElement") ?
							this.pageViewModel.get("ElseExecuteFlowElement").displayValue : null;
					var thenExecuteValue = value ? value.displayValue : null;
					if (thenExecuteValue && elseExecuteValue && elseExecuteValue === thenExecuteValue) {
						invalidMessage = this.pageViewModel.get("Resources.Strings.ThenExecuteEqualElseExecuteMessage");
					}
					return {
						invalidMessage: invalidMessage
					};
				},
				/**
				 * Сохранить указанные значения свойств
				 * @private
				 */
				save: function() {
					if (!this.validate()) {
						return;
					}
					var gridData = this.getGridData();
					var rows = gridData.getItems();
					var conditions = [];
					Terrasoft.each(rows, function(row) {
						var condition = {
							"IfFlowElementCompleted": row.get("IfFlowElementCompleted").value,
							"ThenExecuteFlowElement": row.get("ThenExecuteFlowElement").value,
							"CompletedWithResult": row.get("CompletedWithResult")
						};
						conditions.push(condition);
					}, this);
					var elseExecuteFlowElement = this.get("ElseExecuteFlowElement");
					var parameters = {
						"xorConditions": {
							"elseExecuteFlowElement": elseExecuteFlowElement.value,
							"conditions": conditions
						}
					};
					this.sandbox.publish("SetParametersInfo", parameters, [this.sandbox.id]);
				},
				/**
				 * Закрыть модальное окно
				 * @private
				 */
				close: function() {
					var isNewValue = this.get("IsNewValue");
					if (isNewValue) {
						var previousValueNextStep = this.get("PreviousValueNextStep");
						var parameters = {
							"nextStep": previousValueNextStep || null
						};
						this.sandbox.publish("SetParametersInfo", parameters, [this.sandbox.id]);
						return;
					}
					ModalBox.close();
				},
				/**
				 * Возвращает объект с настройками колонок реестра
				 * @return {Object} Настройки колонок реестра
				 * @private
				 */
				getGridRowColumnsConfig: function() {
					var gridRowColumnsConfig = this.get("GridRowColumnsConfig");
					if (!gridRowColumnsConfig) {
						gridRowColumnsConfig = Ext.clone(entitySchemaColumnsConfig);
						Terrasoft.each(gridRowColumnsConfig, function(columnConfig) {
							columnConfig.isRequired = true;
						}, this);
						this.set("GridRowColumnsConfig", gridRowColumnsConfig);
					}
					return gridRowColumnsConfig;
				},
				/**
				 * Создаёт модель данных для записи реестра
				 * @private
				 * @param {Terrasoft.GUID} rowId Уникальный идентификатор записи
				 */
				createGridRowViewModel: function(values) {
					var rowViewModelValues = Ext.apply(values, {
						"IfFlowElementCompletedList": new Terrasoft.Collection(),
						"CompletedWithResultList": new Terrasoft.Collection(),
						"ThenExecuteFlowElementList": new Terrasoft.Collection()
					});
					var rowConfig = this.getGridRowColumnsConfig();
					var gridRowViewModel = Ext.create("Terrasoft.BasePageV2ConfigurationGridRowViewModel", {
						rowConfig: rowConfig,
						values: rowViewModelValues,
						isNew: false,
						isDeleted: false,
						sandbox: this.sandbox
					});
					var flowElements = this.get("FlowElements");
					gridRowViewModel.on("change:IfFlowElementCompleted", function() {
						var options = {preventValidation: true};
						this.set("CompletedWithResult", null, options);
						this.set("ThenExecuteFlowElement", null, options);
					}, gridRowViewModel);
					gridRowViewModel.on("change:ThenExecuteFlowElement", function() {
						this.validateColumn("ElseExecuteFlowElement");
					}, this);
					gridRowViewModel.addColumnValidator("ThenExecuteFlowElement", this.thenExecuteFlowElementValidator);
					this.on("change:ElseExecuteFlowElement", function() {
						this.validateColumn("ThenExecuteFlowElement");
					}, gridRowViewModel);
					gridRowViewModel.pageViewModel = this;
					gridRowViewModel.FilterComplitedWithResultLookupData = this.FilterComplitedWithResultLookupData;
					gridRowViewModel.loadFlowElementsLookupData = this.loadFlowElementsLookupData;
					gridRowViewModel.loadEntityLookupData = gridRowViewModel.loadLookupData;
					gridRowViewModel.loadLookupData = function(filterValue, list, columnName) {
						var notEqualsFilterValue = null;
						switch (columnName) {
							case "CompletedWithResult":
								var ifFlowElement =  this.get("IfFlowElementCompleted");
								if (!ifFlowElement || !ifFlowElement.value) {
									return;
								}
								var flowElement = Ext.clone(
									Terrasoft.findItem(flowElements, {uid: ifFlowElement.value}).item);
								var esq = Ext.create("Terrasoft.EntitySchemaQuery", {
									rootSchemaName: "SysProcessUserTask"
								});
								esq.addColumn("SysUserTaskSchemaUId", "SchemaUId");
								esq.getEntity(flowElement.type.value, function(result) {
									if (!Ext.isEmpty(result.entity)) {
										flowElement = {
											uid: flowElement.uid,
											schemaUId: result.entity.get("SchemaUId")
										};
										ProcessModuleUtilities.getProcessActivityResultsLookupGridData(this,
											flowElement, function(resultsLookupGridData) {
												this.FilterComplitedWithResultLookupData(resultsLookupGridData, list);
											});
									}
								}, this);
								return;
							case "IfFlowElementCompleted":
								notEqualsFilterValue = ProcessLibraryConstants.EndElementStepValue.value;
								break;
							case "ThenExecuteFlowElement":
							case "ElseExecuteFlowElement":
								notEqualsFilterValue = this.get("IfFlowElementCompleted") || {};
								notEqualsFilterValue = notEqualsFilterValue.value;
								break;
						}
						this.loadFlowElementsLookupData.call(this, notEqualsFilterValue, flowElements, list);
					};
					return gridRowViewModel;
				},
				/**
				 * Применить фильтр по уже выбранным результатам колонки ComplitedWithResult
				 * @param {Array} resultsLookupGridData Список результатов для загрузки в выпадающий список
				 * @param {Terrasoft.Collection} list Коллекция, в которую будут загружены данные
				 */
				FilterComplitedWithResultLookupData: function(resultsLookupGridData, list) {
					var gridData = this.pageViewModel.getGridData();
					var activeIfFlowElemt = this.get("IfFlowElementCompleted");
					gridData.each(function(item) {
						var ifFlowElemt = item.values.IfFlowElementCompleted;
						var result = item.values.CompletedWithResult;
						if (ifFlowElemt && result && result.value &&
							(ifFlowElemt.value === activeIfFlowElemt.value)) {
							var removeItem = Ext.Array.findBy(resultsLookupGridData,
								function(item) {
									return (result.value === item.uid);
								});
							Ext.Array.remove(resultsLookupGridData, removeItem);
						}
					}, this);
					this.loadFlowElementsLookupData.call(this, null,
						resultsLookupGridData, list);
				},
				/**
				 * Получить набор данных по lookup колонке
				 * @param {Array} flowElements Массив из элементов диаграммы процесса
				 * @param {Terrasoft.Collection} list Коллекция, в которую будут загружены данные
				 */
				loadFlowElementsLookupData: function(notEqualsFilterValue, flowElements, list) {
					list.clear();
					var values = {};
					notEqualsFilterValue = notEqualsFilterValue || Ext.emptyString;
					Terrasoft.each(flowElements, function(flowElement) {
						if (flowElement.uid === notEqualsFilterValue) {
							return;
						}
						values[flowElement.uid] = {
							value: flowElement.uid,
							displayValue: flowElement.caption
						};
					}, this);
					list.loadAll(values);
				},
				/**
				 * @overridden
				 */
				loadLookupData: function(filterValue, list, columnName) {
					var notEqualsFilterValue = null;
					switch (columnName) {
						case "CompletedWithResult":
							this.callParent(arguments);
							return;
						case "ThenExecuteFlowElement":
						case "ElseExecuteFlowElement":
							notEqualsFilterValue = this.get("SourceRefUId");
							break;
					}
					this.loadFlowElementsLookupData(notEqualsFilterValue, this.get("FlowElements"), list);
				},
				/**
				 * Возвращает заголовок шага
				 * @private
				 * @param {String} flowElementId Идентификатор шага
				 * @return {String} Заголовок шага
				 */
				getFlowElementCaption: function(flowElementId) {
					var displayValue = "";
					if (!flowElementId) {
						return displayValue;
					}
					var flowElements = this.get("FlowElements");
					Terrasoft.each(flowElements, function(flowElement) {
						if (flowElement.uid === flowElementId) {
							if (flowElement.caption) {
								displayValue = flowElement.caption;
							}
							return false;
						}
					}, this);
					return displayValue;
				},
				/**
				 * Проставляет заголовки шагам для корректного отображения в реестре
				 * @private
				 * @param {Object} xorConditions Объект с настройками условий шагов
				 */
				specifyFlowElementDisplayValues: function(xorConditions) {
					if (!xorConditions) {
						return;
					}
					var value = xorConditions.elseExecuteFlowElement;
					if (value) {
						xorConditions.elseExecuteFlowElement = {
							"value": value,
							"displayValue": this.getFlowElementCaption(value)
						};
					}
					var conditions = xorConditions.conditions;
					this.Terrasoft.each(conditions, function(condition) {
						value = condition.IfFlowElementCompleted;
						var displayValue = this.getFlowElementCaption(value);
						condition.IfFlowElementCompleted = {
							"value": value,
							"displayValue": displayValue
						};
						value = condition.ThenExecuteFlowElement;
						if (value) {
							displayValue = this.getFlowElementCaption(value);
							condition.ThenExecuteFlowElement = {
								"value": value,
								"displayValue": displayValue
							};
						}
					}, this);
				},
				/**
				 * @overridden
				 */
				loadGridData: function() {
					this.beforeLoadGridData();
					var rowConfig = this.getGridRowColumnsConfig();
					var viewModelCollection = this.Ext.create("Terrasoft.BaseViewModelCollection", {
						rowConfig: rowConfig
					});
					var xorConditions = this.get("XorConditions");
					this.set("XorConditions", null);
					this.specifyFlowElementDisplayValues(xorConditions);
					if (xorConditions.elseExecuteFlowElement) {
						this.set("ElseExecuteFlowElement", xorConditions.elseExecuteFlowElement);
					}
					var conditions = xorConditions.conditions;
					this.Terrasoft.each(conditions, function(condition) {
						var id = Terrasoft.generateGUID();
						condition.Id = id;
						var gridRowViewModel = this.createGridRowViewModel(condition);
						viewModelCollection.add(id, gridRowViewModel);
					}, this);
					var response = {
						success: true,
						collection: viewModelCollection
					};
					this.onGridDataLoaded(response);
					if (conditions.length === 1) {
						var firsRow = viewModelCollection.getByIndex(0);
						var firsRowId = firsRow.get("Id");
						this.setActiveRow(firsRowId);
					}
				},
				/**
				 * @overridden
				 */
				addRecord: function() {
					var gridData = this.getGridData();
					var ifFlowElementCompletedDefValue = null;
					var rowCount = gridData.getCount();
					if (rowCount !== 0) {
						var row = gridData.getByIndex(rowCount - 1);
						ifFlowElementCompletedDefValue = row.get("IfFlowElementCompleted");
					}
					if (!ifFlowElementCompletedDefValue) {
						var sourceRefUId = this.get("SourceRefUId");
						ifFlowElementCompletedDefValue = {
							"value": sourceRefUId,
							"displayValue": this.getFlowElementCaption(sourceRefUId)
						};
					}
					var emptyCondition = {
						"Id": Terrasoft.generateGUID(),
						"IfFlowElementCompletedList": new Terrasoft.Collection(),
						"CompletedWithResultList": new Terrasoft.Collection(),
						"ThenExecuteFlowElementList": new Terrasoft.Collection(),
						"IfFlowElementCompleted": ifFlowElementCompletedDefValue
					};
					var newRowId = emptyCondition.Id;
					var gridRowViewModel = this.createGridRowViewModel(emptyCondition);
					var rowConfig = this.getGridRowColumnsConfig();
					var collection = this.Ext.create("Terrasoft.BaseViewModelCollection", {
						"rowConfig": rowConfig
					});
					collection.add(newRowId, gridRowViewModel);
					var options = {"mode": "bottom"};
					this.initIsGridEmpty(collection);
					this.addItemsToGridData(collection, options);
					this.setActiveRow(newRowId);
					this.focusActiveRowControl(rowConfig.IfFlowElementCompleted.columnPath);
				},
				/**
				 * @overridden
				 */
				deleteRecords: function() {
					var activeRow = this.getActiveRow();
					this.removeGridRecords([activeRow.get("Id")]);
				},
				/**
				 * @overridden
				 * @param {String} id Идентификатор записи.
				 */
				discardChanges: function(id) {
					if (!id) {
						return;
					}
					var activeRow = this.getActiveRow();
					if (activeRow.isNew) {
						this.removeGridRecords([activeRow.get("Id")]);
					} else {
						var values = activeRow.values;
						var options = {preventValidation: true};
						var columnsConfig = this.getGridRowColumnsConfig();
						Terrasoft.each(columnsConfig, function(column) {
							if ((column.type === Terrasoft.ViewModelColumnType.ENTITY_COLUMN) &&
									(column.isCollection !== true)) {
								var columnName = column.columnPath;
								activeRow.set(columnName, values[columnName], options);
							}
						}, this);
						activeRow.changedValues = {};
					}
				},
				/**
				 * @overridden
				 */
				saveRowChanges: function(row, callback, scope) {
					row = Terrasoft.isGUID(row) ? this.getGridData().get(row) : row;
					var isValidRow = row.validate();
					scope = scope || this;
					callback = callback || this.Terrasoft.emptyFn;
					if (this.getIsRowChanged(row)) {
						var changedValues = row.changedValues;
						var columnsConfig = this.getGridRowColumnsConfig();
						Terrasoft.each(changedValues, function(value, columnName) {
							var column = columnsConfig[columnName];
							var columnValidationInfo = row.validationInfo.get(columnName) || {};
							var isValidColumn = columnValidationInfo.isValid;
							if (isValidColumn && column &&
								(column.type === Terrasoft.ViewModelColumnType.ENTITY_COLUMN) &&
								(column.isCollection !== true)) {
								row.values[columnName] = value;
							}
						}, this);
						row.changedValues = {};
						if (!isValidRow) {
							return;
						}
						callback.call(scope);
					} else {
						callback.call(scope);
					}
				}
			},
			diff: /**SCHEMA_DIFF*/[
				{
					"operation": "remove",
					"name": "Detail"
				},
				{
					"operation": "remove",
					"name": "AddRecordButton"
				},
				{
					"operation": "remove",
					"name": "ToolsButton"
				},
				{
					"operation": "remove",
					"name": "DataGrid"
				},
				{
					"operation": "insert",
					"name": "fixed-area-container",
					"values": {
						"itemType": Terrasoft.ViewItemType.CONTAINER,
						"wrapClass": ["container-modal-page", "container-modal-page-fixed"],
						"items": []
					}
				},
				{
					"operation": "insert",
					"parentName": "fixed-area-container",
					"propertyName": "items",
					"name": "headContainer",
					"values": {
						"itemType": Terrasoft.ViewItemType.CONTAINER,
						"wrapClass": ["header"],
						"items": []
					}
				},
				{
					"operation": "insert",
					"parentName": "headContainer",
					"propertyName": "items",
					"name": "header-name-container",
					"values": {
						"itemType": Terrasoft.ViewItemType.CONTAINER,
						"wrapClass": ["header-name-container", "header-name-container-full"],
						"items": []
					}
				},
				{
					"operation": "insert",
					"parentName": "header-name-container",
					"propertyName": "items",
					"name": "ModalBoxCaption",
					"values": {
						"itemType": Terrasoft.ViewItemType.LABEL,
						"caption": {"bindTo": "modalBoxCaption"}
					}
				},
				{
					"operation": "insert",
					"parentName": "headContainer",
					"propertyName": "items",
					"name": "close-icon-container",
					"values": {
						"itemType": Terrasoft.ViewItemType.CONTAINER,
						"wrapClass": ["header-name-container", "header-name-container-full"],
						"items": []
					}
				},
				{
					"operation": "insert",
					"parentName": "close-icon-container",
					"propertyName": "items",
					"name": "close-icon",
					"values": {
						"itemType": Terrasoft.ViewItemType.BUTTON,
						"style": Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
						"imageConfig": {"bindTo": "Resources.Images.CloseIcon"},
						"classes": {"wrapperClass": ["close-btn-user-class"]},
						"click": {"bindTo": "close"}
					}
				},
				{
					"operation": "insert",
					"parentName": "fixed-area-container",
					"propertyName": "items",
					"name": "center-area-editPage",
					"values": {
						"itemType": Terrasoft.ViewItemType.CONTAINER,
						"wrapClass": ["controls-container-modal-page"],
						"items": []
					}
				},
				{
					"operation": "insert",
					"name": "center-area-grid-container",
					"parentName": "center-area-editPage",
					"propertyName": "items",
					"values": {
						"itemType": Terrasoft.ViewItemType.CONTAINER,
						"wrapClass": ["center-area-grid-container"],
						"items": []
					}
				},
				{
					"operation": "insert",
					"parentName": "center-area-editPage",
					"propertyName": "items",
					"name": "NoConditionButton",
					"index": 0,
					"values": {
						"itemType": Terrasoft.ViewItemType.BUTTON,
						"style": Terrasoft.controls.ButtonEnums.style.BLUE,
						"caption": {"bindTo": "Resources.Strings.NoConditionButtonCaption"},
						"enabled": {"bindTo": "HasNoRunningProcess"},
						"visible": false
					}
				},
				{
					"operation": "insert",
					"parentName": "center-area-editPage",
					"propertyName": "items",
					"name": "Hint",
					"index": 1,
					"values": {
						"contentType": Terrasoft.ContentType.TEXT,
						"bindTo": "Hint",
						"enabled": {"bindTo": "HasNoRunningProcess"},
						"labelWrapConfig": {
							"classes": {
								"wrapClassName": ["hint-label-wrap"]
							}
						},
						"controlWrapConfig": {
							"classes": {
								"wrapClassName": ["hint-control-wrap"]
							}
						},
						"classes": {
							"labelClass": ["hint-label"]
						},
						"layout": {
							"column": 0,
							"row": 1,
							"colSpan": 24
						},
						"visible": false
					}
				},
				{
					"operation": "insert",
					"parentName": "center-area-grid-container",
					"propertyName": "items",
					"name": "DataGrid",
					"values": {
						"primaryDisplayColumnName": "IfFlowElementCompleted",
						"itemType": Terrasoft.ViewItemType.GRID,
						"collection": {"bindTo": "Collection"},
						"activeRow": {"bindTo": "ActiveRow"},
						"unSelectRow": {"bindTo": "unSelectRow"},
						"primaryColumnName": "Id",
						"isEmpty": {"bindTo": "IsGridEmpty"},
						"isLoading": {"bindTo": "IsGridLoading"},
						"className": "Terrasoft.ConfigurationGrid",
						"generator": "ConfigurationGridGenerator.generatePartial",
						"generateControlsConfig": {bindTo: "generateActiveRowControlsConfig"},
						"initActiveRowKeyMap": {bindTo: "initActiveRowKeyMap"},
						"activeRowAction": {bindTo: "onActiveRowAction"},
						"type": "listed",
						"listedZebra": true,
						"enabled": {"bindTo": "HasNoRunningProcess"},
						"activeRowActions": [
							{
								"className": "Terrasoft.Button",
								"style": Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
								"tag": "save",
								"markerValue": "save",
								"imageConfig": {"bindTo": "Resources.Images.SaveIcon"}
							},
							{
								"className": "Terrasoft.Button",
								"style": Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
								"tag": "cancel",
								"markerValue": "cancel",
								"imageConfig": {"bindTo": "Resources.Images.CancelIcon"}
							},
							{
								"className": "Terrasoft.Button",
								"style": Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
								"tag": "remove",
								"markerValue": "remove",
								"imageConfig": {"bindTo": "Resources.Images.RemoveIcon"}
							}
						],
						"listedConfig": {
							"name": "DataGridListedConfig",
							"items": [
								{
									"name": "IfFlowElementCompletedListedGridColumn",
									"caption": resources.localizableStrings.IfFlowElementCompletedCaption,
									"bindTo": "IfFlowElementCompleted",
									"type": "text",
									"position": {
										"column": 0,
										"colSpan": 9
									}
								},
								{
									"name": "CompletedWithResultListedGridColumn",
									"caption": resources.localizableStrings.CompletedWithResultCaption,
									"bindTo": "CompletedWithResult",
									"type": "text",
									"position": {
										"column": 9,
										"colSpan": 6
									}
								},
								{
									"name": "ThenExecuteFlowElementListedGridColumn",
									"caption": resources.localizableStrings.ThenExecuteFlowElementCaption,
									"bindTo": "ThenExecuteFlowElement",
									"type": "text",
									"position": {
										"column": 15,
										"colSpan": 9
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
									"name": "IfFlowElementCompletedTiledGridColumn",
									"caption": resources.localizableStrings.IfFlowElementCompletedCaption,
									"bindTo": "IfFlowElementCompleted",
									"type": "text",
									"position": {
										"row": 1,
										"column": 0,
										"colSpan": 24
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
					"operation": "insert",
					"name": "after-grid-actions-container",
					"parentName": "center-area-editPage",
					"propertyName": "items",
					"values": {
						"itemType": Terrasoft.ViewItemType.CONTAINER,
						wrapClass: ["after-grid-actions-container"],
						"items": []
					}
				},
				{
					"operation": "insert",
					"name": "after-grid-actions-else-container",
					"parentName": "after-grid-actions-container",
					"propertyName": "items",
					"values": {
						"itemType": Terrasoft.ViewItemType.CONTAINER,
						wrapClass: ["after-grid-actions-else-container"],
						"items": []
					}
				},
				{
					"operation": "insert",
					"name": "AddRecordButton",
					"parentName": "after-grid-actions-container",
					"propertyName": "items",
					"values": {
						"itemType": Terrasoft.ViewItemType.BUTTON,
						"caption": {"bindTo": "Resources.Strings.AddButtonCaption"},
						"enabled": {"bindTo": "HasNoRunningProcess"},
						"click": {"bindTo": "addRecord"}
					}
				},
				{
					"operation": "insert",
					"parentName": "after-grid-actions-else-container",
					"propertyName": "items",
					"name": "ElseExecuteFlowElement",
					"values": {
						"bindTo": "ElseExecuteFlowElement",
						"enabled": {"bindTo": "HasNoRunningProcess"}
					}
				},
				{
					"operation": "insert",
					"parentName": "fixed-area-container",
					"propertyName": "items",
					"name": "utils-area-editPage",
					"values": {
						"itemType": Terrasoft.ViewItemType.CONTAINER,
						"wrapClass": ["controls-container-modal-page"],
						"items": []
					}
				},
				{
					"operation": "insert",
					"parentName": "utils-area-editPage",
					"propertyName": "items",
					"name": "SaveButton",
					"values": {
						"itemType": Terrasoft.ViewItemType.BUTTON,
						"style": Terrasoft.controls.ButtonEnums.style.GREEN,
						"caption": {"bindTo": "Resources.Strings.SaveButtonCaption"},
						"click": {"bindTo": "save"},
						"enabled": {"bindTo": "HasNoRunningProcess"},
						"classes": {"textClass": ["utils-buttons"]}
					}
				},
				{
					"operation": "insert",
					"parentName": "utils-area-editPage",
					"propertyName": "items",
					"name": "CancelButton",
					"values": {
						"itemType": Terrasoft.ViewItemType.BUTTON,
						"caption": {"bindTo": "Resources.Strings.CancelButtonCaption"},
						"click": {"bindTo": "close"},
						"classes": {"textClass": ["utils-buttons"]}
					}
				}
			]/**SCHEMA_DIFF*/,
			userCode: {}
		};
	});
