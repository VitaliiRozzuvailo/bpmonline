define("QuickModelPageV2", ["QuickModelPageV2Resources", "ProcessModuleUtilities", "ProcessLibraryConstants",
		"ModalBox", "css!RecommendationModule"],
	function(resources, ProcessModuleUtilities, ProcessLibraryConstants, ModalBox) {
		return {
			entitySchemaName: "VwProcessLib",
			messages: {
				/**
				 * @message FlowElementsEditModuleLoading
				 * Передаёт конфиг элементов процесса в FlowElementsEditModule
				 */
				"FlowElementsEditModuleLoading": {
					mode: Terrasoft.MessageMode.PTP,
					direction: Terrasoft.MessageDirectionType.SUBSCRIBE
				},
				/**
				 * @message FlowElementsEditModuleLoaded
				 * Передаёт конфиг элементов процесса в FlowElementsEditModule
				 */
				"FlowElementsEditModuleLoaded": {
					mode: Terrasoft.MessageMode.PTP,
					direction: Terrasoft.MessageDirectionType.SUBSCRIBE
				},
				/**
				 * @message QuickModelDiagramModuleLoaded
				 * Передаёт конфиг элементов процесса в QuickModelDiagramModule
				 * @param {String} Идентификатор выбранной записи
				 */
				"QuickModelDiagramModuleLoaded": {
					mode: Terrasoft.MessageMode.PTP,
					direction: Terrasoft.MessageDirectionType.SUBSCRIBE
				},
				/**
				 * @message GetParametersInfo
				 * Передаёт значения параметров
				 */
				"GetParametersInfo": {
					mode: Terrasoft.MessageMode.PTP,
					direction: Terrasoft.MessageDirectionType.SUBSCRIBE
				},
				/**
				 * @message SetParametersInfo
				 * Указывает значения параметров
				 */
				"SetParametersInfo": {
					mode: Terrasoft.MessageMode.PTP,
					direction: Terrasoft.MessageDirectionType.SUBSCRIBE
				},
				/**
				 * @message GetFlowElements
				 * Получает конфиг элементов диаграммы
				 */
				"GetFlowElements": {
					mode: Terrasoft.MessageMode.PTP,
					direction: Terrasoft.MessageDirectionType.PUBLISH
				},
				/**
				 * @message UpdateDiagram
				 * Отправляет конфиг элементов на отрисовку диаграммы
				 */
				"UpdateDiagram": {
					mode: Terrasoft.MessageMode.PTP,
					direction: Terrasoft.MessageDirectionType.PUBLISH
				},
				/**
				 * @message FlowElementsFocused
				 * Cобытие получения фокуса полей редактирования реестра шагов процесса
				 */
				"FlowElementsFocused": {
					mode: Terrasoft.MessageMode.PTP,
					direction: Terrasoft.MessageDirectionType.SUBSCRIBE
				},
				/**
				 * @message FlowElementsChanged
				 * Получает обновлённый конфиг элементов диаграммы
				 */
				"FlowElementsChanged": {
					mode: Terrasoft.MessageMode.PTP,
					direction: Terrasoft.MessageDirectionType.SUBSCRIBE
				},
				/**
				 * @message UpdateFlowElements
				 * Отправляет конфиг элементов на отрисовку реестра шагов диаграммы
				 */
				"UpdateFlowElements": {
					mode: Terrasoft.MessageMode.PTP,
					direction: Terrasoft.MessageDirectionType.PUBLISH
				},
				/**
				 * @message ValidateQuickModelData
				 * Уведомляет, что необходимо выполнить проверку корректности указанных данных о шагах процесса
				 */
				"ValidateQuickModelSteps": {
					mode: Terrasoft.MessageMode.PTP,
					direction: Terrasoft.MessageDirectionType.PUBLISH
				},
				/**
				 * @message GetHasNoRunningProcess
				 * Возвращает значение атрибута HasNoRunningProcess в реестр шагов
				 * @param {String} Идентификатор выбранной записи
				 */
				"GetHasNoRunningProcess": {
					mode: Terrasoft.MessageMode.PTP,
					direction: Terrasoft.MessageDirectionType.SUBSCRIBE
				},
				/**
				 * @message GetHasNoRunningProcess
				 * Устанавливает значение атрибута HasNoRunningProcess в реестр шагов
				 * @param {String} Идентификатор выбранной записи
				 */
				"SetHasNoRunningProcess": {
					mode: Terrasoft.MessageMode.PTP,
					direction: Terrasoft.MessageDirectionType.PUBLISH
				},
				/**
				 * @message SectionVisibleChanged
				 * Сигнализирует об изменении видимости вертикального реестра раздела.
				 */
				"SectionVisibleChanged": {
					mode: this.Terrasoft.MessageMode.BROADCAST,
					direction: this.Terrasoft.MessageDirectionType.SUBSCRIBE
				},
				/**
				 * @message RerenderQuickModelDiagramModule
				 * Сигнализирует о необходимости генерации элементов диаграммы.
				 */
				"RerenderQuickModelDiagramModule": {
					mode: Terrasoft.MessageMode.PTP,
					direction: Terrasoft.MessageDirectionType.PUBLISH
				}
			},
			details: /**SCHEMA_DETAILS*/{}/**SCHEMA_DETAILS*/,
			diff: /**SCHEMA_DIFF*/[
				{
					"operation": "insert",
					"parentName": "RecommendationModuleContainer",
					"propertyName": "items",
					"name": "Recommendation",
					"values": {
						"itemType": Terrasoft.ViewItemType.LABEL,
						"caption": { "bindTo": "Resources.Strings.RunningProcessRecommendationMessage" },
						"visible": {
							"bindTo": "HasNoRunningProcess",
							"bindConfig": {
								"converter": function(value) {
									return value === false;
								}
							}
						},
						"classes": {
							"labelClass": ["information", "recommendation"]
						}
					}
				},
				{
					"operation": "remove",
					"name": "ViewOptionsButton"
				},
				{
					"operation": "merge",
					"name": "Caption",
					"values": {
						"enabled": { "bindTo": "HasNoRunningProcess" }
					}
				},
				{
					"operation": "remove",
					"name": "Name"
				},
				{
					"operation": "remove",
					"name": "Enabled"
				},
				{
					"operation": "remove",
					"name": "SysPackage"
				},
				{
					"operation": "insert",
					"name": "ProcessTab",
					"parentName": "Tabs",
					"propertyName": "tabs",
					"index": 0,
					"values": {
						"caption": { "bindTo": "Resources.Strings.ProcessTabCaption" },
						"items": []
					}
				},
				{
					"operation": "insert",
					"name": "FlowElementsEditContainer",
					"parentName": "ProcessTab",
					"propertyName": "items",
					"values": {
						"itemType": Terrasoft.ViewItemType.CONTAINER,
						"id": "FlowElementsEditContainer",
						"selectors": { "wrapEl": "#FlowElementsEdit"},
						"wrapClass": ["flow-elements-edit-container"],
						"items": []
					}
				},
				{
					"operation": "insert",
					"parentName": "FlowElementsEditContainer",
					"propertyName": "items",
					"name": "FlowElementsEdit",
					"values": {
						"itemType": Terrasoft.ViewItemType.MODULE,
						"moduleName": "FlowElementsEditModule",
						afterrender: { bindTo: "loadFlowElementsModule" },
						afterrerender: { bindTo: "loadFlowElementsModule" }
					}
				},
				{
					"operation": "insert",
					"name": "QuickModelDiagramContainer",
					"parentName": "ProcessTab",
					"propertyName": "items",
					"values": {
						"itemType": Terrasoft.ViewItemType.CONTAINER,
						"id": "QuickModelDiagramContainer",
						"selectors": { "wrapEl": "#QuickModelDiagram" },
						"wrapClass": ["quick-model-diagram-container"],
						"items": []
					}
				},
				{
					"operation": "insert",
					"parentName": "QuickModelDiagramContainer",
					"propertyName": "items",
					"name": "QuickModelDiagram",
					"values": {
						"itemType": Terrasoft.ViewItemType.MODULE,
						"moduleName": "FlowElementsEditModule",
						afterrender: { bindTo: "loadQuickModelDiagramModule" },
						afterrerender: { bindTo: "loadQuickModelDiagramModule" }
					}
				}
			]/**SCHEMA_DIFF*/,
			attributes: {
				"SysPackage": {
					lookupListConfig: {
						filters: {
							sysWorkspaceFilter: function() {
								var filter = Terrasoft.createColumnFilterWithParameter(
									Terrasoft.ComparisonType.EQUAL, "SysWorkspace",
									Terrasoft.SysValue.CURRENT_WORKSPACE.value);
								return filter;
							},
							maintainerFilter: function() {
								var filter = Terrasoft.createColumnFilterWithParameter(
									Terrasoft.ComparisonType.EQUAL, "Maintainer",
									Terrasoft.SysValue.CURRENT_MAINTAINER.value);
								return filter;
							}
						},
						columns: ["UId"]
					},
					isRequired: true
				},
				"Caption": {
					isRequired: true,
					dependencies: [{
						columns: ["Caption"],
						methodName: "onDiagramPropertyChanged"
					}]
				},
				"Name": {
					caption: resources.localizableStrings.NameCaption,
					isRequired: true
				},
				"Start": {
					caption: resources.localizableStrings.StartCaption,
					type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					dataValueType: Terrasoft.DataValueType.TEXT,
					dependencies: [{
						columns: ["Start"],
						methodName: "onDiagramPropertyChanged"
					}]
				},
				"End": {
					caption: resources.localizableStrings.EndCaption,
					type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					dataValueType: Terrasoft.DataValueType.TEXT,
					dependencies: [{
						columns: ["End"],
						methodName: "onDiagramPropertyChanged"
					}]
				},
				"HasNoRunningProcess": {
					type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					dataValueType: Terrasoft.DataValueType.BOOLEAN
				}
			},
			methods: {
				/**
				 * @inheritdoc Terrasoft.BasePageV2#reloadEntity
				 * @overridden
				 */
				reloadEntity: function(callback, scope, shouldCallParent) {
					if (shouldCallParent) {
						this.callParent(callback, scope);
						return;
					}
					this.loadSchema(function() {
						this.reloadEntity(callback, scope, true);
					});
				},
				/**
				 * Загружает модуль шагов процесса
				 * @protected
				 */
				loadFlowElementsModule: function() {
					var moduleId = this.getFlowElementsModuleId();
					this.sandbox.loadModule("FlowElementsEditModule", {
						renderTo: "FlowElementsEdit",
						id: moduleId
					});
				},
				/**
				 * Загружает модуль диаграммы
				 * @protected
				 */
				loadQuickModelDiagramModule: function() {
					var moduleId = this.getQuickModelDiagramModuleId();
					var rendered = this.sandbox.publish("RerenderQuickModelDiagramModule", {
						renderTo: "QuickModelDiagram"
					}, [moduleId]);
					if (!rendered) {
						this.sandbox.loadModule("QuickModelDiagramModule", {
							renderTo: "QuickModelDiagram",
							id: moduleId
						});
					}
				},
				/**
				 * Используется контекстная справка раздела.
				 * @overridden
				 */
				initContextHelp: Terrasoft.emptyFn,
				/**
				 * @overridden
				 */
				getHeader: function() {
					return this.get("Resources.Strings.NewRecordPageCaption");
				},
				/**
				 * Добавляет значения по умолчанию.
				 * @private
				 * @param {Array} defaultValues Список занчений по умолчанию.
				 */
				addDefaultValues: function(defaultValues) {
					ProcessModuleUtilities.getUniqueNameAndCaption(function(uniqueNameAndCaption) {
						this.set("Name", uniqueNameAndCaption.name);
						this.set("Caption", uniqueNameAndCaption.caption);
					}, this);
					defaultValues.push({
						name: "Enabled",
						value: true
					});
					var endElementStepValue = ProcessLibraryConstants.EndElementStepValue;
					var flowElements = [{
						"owner": ProcessLibraryConstants.FlowElementOwnerDefValue,
						"type": ProcessLibraryConstants.FlowElementTypeDefValue,
						"nextStep": {
							"value": endElementStepValue.value,
							"displayValue": endElementStepValue.displayValue
						},
						"name": "Element0"
					}];
					this.set("FlowElements", flowElements);
					this.set("DefaultValues", this.Terrasoft.deepClone(defaultValues));
				},
				/**
				 * @inheritdoc Terrasoft.BasePageV2#getDefaultValues
				 * @overridden
				 */
				getDefaultValues: function() {
					var defaultValues = this.callParent(arguments);
					if (this.isAddMode() || this.isCopyMode()) {
						this.addDefaultValues(defaultValues);
					}
					return defaultValues;
				},
				/**
				 * Проставляет Пакет значением по умолчанию
				 * @private
				 * @param {Function} callback Функция обратного вызова.
				 * @param {Object} scope Контекст выполнения метода.
				 */
				setSysPackageDefValue: function(callback, scope) {
					this.Terrasoft.SysSettings.querySysSettingsItem("CustomPackageUId",
						function(customPackageUId) {
							customPackageUId = (customPackageUId && customPackageUId.value) ?
								customPackageUId.value : this.Terrasoft.GUID_EMPTY;
							this.set("SysPackage", {
								"UId": this.Terrasoft.GUID_EMPTY,
								"value": customPackageUId,
								"displayValue": this.get("Resources.Strings.CustomPackageName")
							});
							if (this.Ext.isFunction(callback)) {
								callback.call(scope || this);
							}
						}, this);
				},
				/**
				 * @overridden
				 */
				loadLookupData: function(filterValue, list, columnName, isLookup) {
					if (columnName !== "SysPackage" || this.isEditMode()) {
						this.callParent(arguments);
						return;
					}
					var lookupQuery = this.getLookupQuery(filterValue, columnName, isLookup);
					lookupQuery.getEntityCollection(function(response) {
						list.clear();
						var sortedList = Ext.create("Terrasoft.Collection");
						var viewModelCollection = response.collection;
						viewModelCollection.each(function(item) {
							var key = item.get("value");
							sortedList.add(key, item.model.attributes);
						}, this);
						this.tryAddCustomPackage(list, sortedList);
					}, this);
				},
				/**
				 * @overridden
				 */
				setEntityLookupDefaultValues: function(callback, scope) {
					this.callParent([function() {
						this.setSysPackageDefValue(function() {
							callback.call(scope || this);
						}, this);
					}, this]);
				},
				/**
				 * @overridden
				 */
				init: function(callback) {
					this.callParent([function() {
						var flowElementsModuleId = this.getFlowElementsModuleId();
						this.sandbox.subscribe("FlowElementsEditModuleLoading", function() {
							return {
								flowElements: this.get("FlowElements") || []
							};
						}, this, [flowElementsModuleId]);
						this.sandbox.subscribe("FlowElementsEditModuleLoaded", this.onUpdateDiagram, this,
							[flowElementsModuleId]);
						this.sandbox.subscribe("QuickModelDiagramModuleLoaded", function() {
							var flowElements = this.get("FlowElements");
							flowElements = this.getUpdatedFlowElementsConfig(flowElements);
							return {
								flowElements: flowElements
							};
						}, this, [this.getQuickModelDiagramModuleId()]);
						this.sandbox.subscribe("FlowElementsChanged", this.onFlowElementsChanged, this,
							[flowElementsModuleId]);
						this.sandbox.subscribe("FlowElementsFocused", this.onItemFocused, this,
							[flowElementsModuleId]);
						this.sandbox.subscribe("GetHasNoRunningProcess", function() {
							return this.get("HasNoRunningProcess");
						}, this, [flowElementsModuleId]);
						this.sandbox.subscribe("SectionVisibleChanged", function() {
							this.onDiagramPropertyChanged();
						}, this);
						callback.call(this);
					}, this]);
				},
				/**
				 * @overridden
				 */
				onGridRowChanged: function() {
					this.set("isGridRowChanged", true);
					return this.callParent(arguments);
				},
				/**
				 * @inheritdoc Terrasoft.BasePageV2#onPageInitialized
				 * @overridden
				 */
				onPageInitialized: function(callback, scope) {
					this.loadSchema(callback.bind(scope || this));
				},
				/**
				 * @inheritdoc Terrasoft.BasePageV2#initEntity
				 * @overridden
				 */
				initEntity: function(callback, scope) {
					this.callParent([function() {
						this.setAsyncNoRunningProcess(function() {
							var hasNoRunningProcess = this.get("HasNoRunningProcess");
							this.sandbox.publish("SetHasNoRunningProcess", hasNoRunningProcess,
								[this.getFlowElementsModuleId()]);
						}, true);
						callback.call(scope || this);
					}, scope]);
				},
				onDiagramPropertyChanged: function() {
					if (this.get("IsEntityInitialized")) {
						var flowElements = this.sandbox.publish("GetFlowElements", null,
							[this.getFlowElementsModuleId()]);
						this.onUpdateDiagram(flowElements);
					}
				},
				/**
				 * Обработчик события изминения полей FlowElement (необходимости перерисовать диаграмму)
				 * @private
				 * @param flowElements {Array} Список шагов процесса
				 */
				onFlowElementsChanged: function(flowElements) {
					this.set("FlowElements", flowElements);
					this.onUpdateDiagram(flowElements);
					this.onItemFocused();
				},
				/**
				 * Дополняет конфиг шагов процесса начальным и завершающим событием
				 * @protected
				 * @param flowElements {Array} Список шагов процесса
				 * @returns {Array}
				 */
				getUpdatedFlowElementsConfig: function(flowElements) {
					flowElements = flowElements || [];
					var diagramConfig = [];
					diagramConfig.push({
						name: "LaneSet0",
						caption: this.get("Caption"),
						column: "Caption"
					});
					var firstFlowElement = flowElements[0] || {owner: { value: "Lane0" }};
					diagramConfig.push({
						name: "StartElement",
						caption: this.get("Start"),
						column: "Start",
						owner: firstFlowElement.owner
					});
					this.Terrasoft.each(flowElements, function(item) {
						diagramConfig.push(item);
					}, this);
					var lastFlowElement = diagramConfig[diagramConfig.length - 1];
					var endElementStepValue = ProcessLibraryConstants.EndElementStepValue;
					diagramConfig.push({
						uid: endElementStepValue.value,
						name: "EndElement",
						caption: this.get("End"),
						column: "End",
						owner: lastFlowElement.owner,
						offsetX: flowElements.length > 0 ? null : 400
					});
					return diagramConfig;
				},
				/**
				 * Модифицирует конфиг шагов и отправляет на отрисовку в модуль диаграммы
				 * @param flowElements
				 */
				onUpdateDiagram: function(flowElements) {
					this.set("FlowElements", flowElements);
					var diagramConfig = this.getUpdatedFlowElementsConfig(flowElements);
					this.sandbox.publish("UpdateDiagram", diagramConfig,
						[this.getQuickModelDiagramModuleId()]);
				},
				/**
				 * Обновляет модуль реестра шагов диаграммы
				 * @param flowElements
				 */
				updateFlowElements: function(flowElements) {
					this.sandbox.publish("UpdateFlowElements", flowElements, [this.getFlowElementsModuleId()]);
				},
				/**
				 * @overridden
				 */
				saveEntityInChain: function(next) {
					if (this.isNewMode()) {
						this.saveSchema(next);
						return;
					}
					var esq = Ext.create("Terrasoft.EntitySchemaQuery", {
						rootSchema: this.entitySchema
					});
					esq.addColumn("ProcessSchemaType");
					esq.getEntity(this.get("Id"), function(response) {
						if (response.success && response.entity) {
							var processSchemaType = response.entity.get("ProcessSchemaType");
							if (processSchemaType.value ===
									ProcessLibraryConstants.VwProcessLib.Type.BusinessProcess) {
								var informationMessage =
									this.get("Resources.Strings.SaveNotQuickModelSchemaMessage");
								this.hideBodyMask();
								this.showInformationDialog(informationMessage);
								return;
							}
						}
						if (this.get("HasNoRunningProcess")) {
							this.setAsyncNoRunningProcess(function(hasNoRunningProcess) {
								if (hasNoRunningProcess) {
									this.saveSchema(next);
									return;
								}
								this.showCancelProcessMessage(next);
							}, false);
						} else {
							this.showCancelProcessMessage(next);
						}
					}, this);
				},
				/**
				 * Показать сообщение об отмене запущенных процессов
				 * @param next Функция обратного вызова в цепочке
				 */
				showCancelProcessMessage: function(next) {
					this.hideBodyMask();
					if (this.get("CanCancelProcess")) {
						var message = this.get("Resources.Strings.HasRunningProcessMessage");
						message = Ext.String.format(message, this.get("RunningProcessCount"));
						var buttonsConfig = {
							buttons: [Terrasoft.MessageBoxButtons.YES.returnCode,
								Terrasoft.MessageBoxButtons.NO.returnCode],
							defaultButton: 1
						};
						this.showInformationDialog(message, function(result) {
							if (result === Terrasoft.MessageBoxButtons.YES.returnCode) {
								this.сancelProcessBySchemaId(next);
							}
						}, buttonsConfig);
					} else {
						this.showInformationDialog(
							this.get("Resources.Strings.RunningProcessRecommendationMessage"));
					}
				},
				/**
				 * Отменяет запущенные процессы по схеме
				 * @param next Функция обратного вызова в цепочке
				 */
				сancelProcessBySchemaId: function(next) {
					ProcessModuleUtilities.cancelExecutionBySchemaId(this, this.get("SysSchemaId"),
						function(responseObject) {
							if (responseObject && responseObject.success) {
								this.saveSchema(next);
							}
						}
					);
				},
				/**
				 * Возвращает идентификатор модуля FlowElementsEdit.
				 * @returns {string}
				 */
				getFlowElementsModuleId: function() {
					return this.sandbox.id + "_FlowElementsEditModule";
				},
				/**
				 * Возвращает идентификатор модуля QuickModelDiagramModule.
				 * @returns {string}
				 */
				getQuickModelDiagramModuleId: function() {
					return this.sandbox.id + "_QuickModelDiagramModule";
				},
				/**
				 * Выполнить проверку корректности указанных данных о шагах процесса
				 * @overridden
				 * @return {Boolean} Возвращает true при успешном выполнении всех валидаторов
				 */
				validate: function() {
					var isValid = this.callParent(arguments);
					if (!isValid) {
						return false;
					}
					isValid = this.sandbox.publish("ValidateQuickModelSteps", null, [this.getFlowElementsModuleId()]);
					return isValid;
				},
				/**
				 * Сохранить схему БП
				 * @param next {function}
				 */
				saveSchema: function(next) {
					var flowElements =
						this.sandbox.publish("GetFlowElements", null, [this.getFlowElementsModuleId()]) || [];
					this.set("FlowElements", flowElements);
					var sysPackage = this.get("SysPackage");
					var quickModelData = {
						"quickModelSteps": [],
						"startStep": {
							"caption" : this.get("Start") || ""
						},
						"endStep": {
							"caption" : this.get("End") || ""
						}
					};
					var activityResults = {};
					var quickModelSteps = quickModelData.quickModelSteps;
					this.Terrasoft.each(flowElements, function(flowElement) {
						var contactId = flowElement.owner.Contact
							? flowElement.owner.Contact.value : Terrasoft.GUID_EMPTY;
						var xorConditions = flowElement.conditions && flowElement.conditions.xorConditions ?
							flowElement.conditions.xorConditions :
							null;
						var quickModelStep = {
							"uid": flowElement.uid,
							"caption": flowElement.caption,
							"name": flowElement.name,
							"position": flowElement.position,
							"type": flowElement.type.value,
							"owner": flowElement.owner.value,
							"ownerName": flowElement.owner.displayValue,
							"sysAdminUnitType": flowElement.owner.SysAdminUnitTypeValue,
							"contactId": contactId,
							"nextStep": flowElement.nextStep ? flowElement.nextStep.value : null
						};
						if (xorConditions) {
							var xorConditionData = Ext.clone(xorConditions);
							this.Terrasoft.each(xorConditionData.conditions, function(condition) {
								var result = condition.CompletedWithResult.value;
								activityResults[result] = condition.CompletedWithResult.displayValue;
								condition.CompletedWithResult = result;
							}, this);
							quickModelStep.conditions = {
								"xorConditions": xorConditionData
							};
						}
						quickModelSteps.push(quickModelStep);
					}, this);
					var schema = {
						"uid": this.get("UId"),
						"name": this.get("Name"),
						"packageUId": sysPackage.UId,
						"caption": this.get("Caption"),
						"description": this.get("Description"),
						"enabled": this.get("Enabled"),
						"quickModelData": Ext.encode(quickModelData)
					};
					var data = {
						"options": {
							"shouldBePublished": this.get("shouldBePublished") || false
						},
						"uiData": {
							"activityResults": activityResults
						},
						"schema": schema
					};
					this.set("shouldBePublished", false);
					ProcessModuleUtilities.saveProcessSchema(this, data, function(response) {
						if (this.validateResponse(response)) {
							this.cardSaveResponse = response;
							this.isNew = false;
							this.changedValues = null;
							this.updateRunButtonProcessList(next);
						}
					});
				},
				/**
				 * Загрузить схему БП
				 * @private
				 */
				loadSchema: function(callback) {
					if (this.isAddMode()) {
						this.updateFlowElements(this.get("FlowElements"));
						if (callback) {
							callback.call(this);
						}
						return;
					}
					ProcessModuleUtilities.loadProcessSchema(this, this.get("PrimaryColumnValue"),
						function(quickModelData) {
							if (quickModelData.startStep) {
								this.set("Start", quickModelData.startStep.caption);
							}
							if (quickModelData.endStep) {
								this.set("End", quickModelData.endStep.caption);
							}
							var quickModelSteps = quickModelData.quickModelSteps || [];
							var flowElements = [];
							var endElementStepValue = ProcessLibraryConstants.EndElementStepValue;
							var gatewayStepValue = ProcessLibraryConstants.GatewayStepValue;
							this.Terrasoft.each(quickModelSteps, function(quickModelStep) {
								quickModelStep.owner = {
									value: quickModelStep.owner
								};
								quickModelStep.type = {
									value: quickModelStep.type
								};
								if (quickModelStep.nextStep) {
									quickModelStep.nextStep = {
										value: quickModelStep.nextStep
									};
									if (endElementStepValue.value === quickModelStep.nextStep.value) {
										quickModelStep.nextStep.displayValue = endElementStepValue.displayValue;
									} else if (gatewayStepValue.value === quickModelStep.nextStep.value) {
										quickModelStep.nextStep.displayValue = gatewayStepValue.displayValue;
									} else {
										var foundQuickModelStep =
											this.findQuickModelStep(quickModelSteps, quickModelStep.nextStep.value);
										if (foundQuickModelStep) {
											quickModelStep.nextStep.displayValue = foundQuickModelStep.caption;
										}
									}
								}
								flowElements.push(quickModelStep);
							}, this);
							this.set("FlowElements", flowElements);
							if (callback) {
								callback.call(this);
							}
							if (this.get("isGridRowChanged")) {
								this.updateFlowElements(this.get("FlowElements"));
							}
							this.set("isGridRowChanged", false);
						}
					);
				},
				/**
				 * Осуществляет поиск элемента шага с заданным уникальным идентификатором
				 * @private
				 * @param {Array} quickModelSteps шаги схемы
				 * @param {String} uid уникальный идентификатор
				 * @returns {Object}
				 */
				findQuickModelStep: function(quickModelSteps, uid) {
					var quickModelStep = null;
					this.Terrasoft.each(quickModelSteps, function(currentStep) {
						if (currentStep.uid === uid) {
							quickModelStep = currentStep;
							return false;
						}
					}, this);
					return quickModelStep;
				},
				/**
				 * Открывает модальное окно свойств схемы процесса
				 * @overridden
				 * @private
				 */
				showExtendedProperties: function() {
					var boxSize = {
						minHeight : "1",
						minWidth : "1",
						maxHeight : "100",
						maxWidth : "100"
					};
					var innerBoxContainer = ModalBox.show(boxSize, function() {}, this);
					var schemaName = "ProcessParametersEditPage";
					var pageId = this.sandbox.id + schemaName;
					var processProperties = {
						HasNoRunningProcess: this.get("HasNoRunningProcess"),
						Name: this.get("Name"),
						Description: this.get("Description"),
						SysPackage: this.get("SysPackage"),
						Enabled: this.get("Enabled"),
						Start: this.get("Start"),
						End: this.get("End"),
						AddToRunButton: this.get("AddToRunButton")
					};
					ModalBox.setSize(685, 460);
					this.sandbox.subscribe("GetParametersInfo", function() {
						return {
							schemaName: schemaName,
							modalBoxCaption: resources.localizableStrings.ProcessPropertiesTitle,
							parameters: processProperties
						};
					}, [pageId]);
					this.sandbox.loadModule("ProcessParametersEditModule", {
							renderTo: innerBoxContainer,
							id: pageId
						}
					);
					this.sandbox.subscribe("SetParametersInfo", function(parameters) {
						if (parameters) {
							Terrasoft.each(parameters, function(value, name) {
								this.set(name, value);
							}, this);
						}
						ModalBox.close();
						this.onItemFocused();
					}, this, [pageId]);
				},
				/**
				 * Получает значение атрибута SysSchemaId из БД
				 * @private
				 * @param callback Функция обратного вызова
				 */
				getSysSchemaIdFromDB: function(callback) {
					var esq = Ext.create("Terrasoft.EntitySchemaQuery", {
						rootSchemaName: "VwProcessLib"
					});
					esq.addColumn("SysSchemaId");
					esq.filters.addItem(Terrasoft.createColumnFilterWithParameter(
						Terrasoft.ComparisonType.EQUAL, "SysWorkspace", Terrasoft.SysValue.CURRENT_WORKSPACE.value));
					var primaryColumnValue = this.get("Id") || this.get("PrimaryColumnValue");
					esq.getEntity(primaryColumnValue, function(result) {
						var entity = result.entity;
						this.set("SysSchemaId", entity.values.SysSchemaId);
						callback.call(this);
					}, this);
				},
				/**
				 * Получает значение атрибута RunningProcessCount из БД
				 * @private
				 * @param callback {Function} Функция обратного вызова
				 * @param disableInput {Boolean} Признак заблокировать элементы ввода на стрнице
				 */
				getRunningProcessCountFromDB: function(callback, disableInput) {
					var esq = Ext.create("Terrasoft.EntitySchemaQuery", {
						rootSchemaName: "SysProcessData"
					});
					esq.addAggregationSchemaColumn("Id", Terrasoft.AggregationType.COUNT, "Count");
					esq.filters.addItem(esq.createColumnFilterWithParameter(this.Terrasoft.ComparisonType.EQUAL,
						"SysSchema", this.get("SysSchemaId")));
					esq.getEntityCollection(function(response) {
						var result = true;
						if (response.success) {
							var count = response.collection.getByIndex(0).get("Count");
							result = count === 0;
							this.set("RunningProcessCount", count);
							if (disableInput) {
								this.set("HasNoRunningProcess", result);
							}
						}
						this.updateIsVisibleCancelRunningProcessesAction();
						if (callback) {
							callback.call(this, result);
						}
					}, this);
				},
				/**
				 * Асинхронно устанавливает значение атрибута HasNoRunningProcess
				 * @private
				 * @param callback {Function} Функция обратного вызова
				 * @param disableInput {Boolean} Признак заблокировать элементы ввода на стрнице
				 */
				setAsyncNoRunningProcess: function(callback, disableInput) {
					if (this.isAddMode()) {
						this.set("HasNoRunningProcess", true);
						this.updateIsVisibleCancelRunningProcessesAction();
						if (callback) {
							callback.call(this);
						}
						return;
					}
					if (!this.get("SysSchemaId")) {
						this.Terrasoft.chain(
							function(next) { this.getSysSchemaIdFromDB(next); },
							function() { this.getRunningProcessCountFromDB(callback, disableInput); },
							this);
					} else {
						this.getRunningProcessCountFromDB(callback, disableInput);
					}
				},
				/**
				 * @overridden
				 */
				show5xProcessSchemaDesigner: function() {
					if (!this.isAddMode() && !this.isCopyMode()) {
						this.callParent(arguments);
						return;
					}
					var messageBoxButtons = this.Terrasoft.MessageBoxButtons;
					var messageBoxButtonYes = this.Ext.apply({}, messageBoxButtons.YES);
					messageBoxButtonYes.style = this.Terrasoft.controls.ButtonEnums.style.BLUE;
					var confirmationDialogButtons = [messageBoxButtonYes, messageBoxButtons.NO];
					var message = this.get("Resources.Strings.ShouldSaveSchemaConfirmationMessage");
					this.showConfirmationDialog(message, function(returnCode) {
						if (returnCode !== messageBoxButtons.YES.returnCode) {
							return;
						}
						this.save();
					}, confirmationDialogButtons);
				}
			},
			rules: {},
			userCode: {}
		};
	});
