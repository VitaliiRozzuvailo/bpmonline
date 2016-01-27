define("FlowElementsEditModule", ["ext-base", "terrasoft", "sandbox", "FlowElementsEditModuleResources",
		"LookupUtilities", "ProcessLibraryConstants", "ProcessModuleUtilities", "ModalBox"],
	function(Ext, Terrasoft, sandbox, resources, LookupUtilities, ProcessLibraryConstants, ProcessModuleUtilities,
			ModalBox) {
		// TODO CRM-3294 Рефакторинг модуля реестра шагов. Разнести реализацию модуля на классы
		function flowElementsEditModule(context) {
			var Ext = context.Ext;
			var Terrasoft = context.Terrasoft;
			var sandbox = context.sandbox;
			var localizableStrings = resources.localizableStrings;
			var loadedLookupValues = [];

			/**
			 * Функция инициализации модуля
			 */
			function init() {
				sandbox.subscribe("GetFlowElements", onGetFlowElements, this, [sandbox.id]);
				sandbox.subscribe("UpdateFlowElements", onUpdateFlowElements, this, [sandbox.id]);
				sandbox.subscribe("ValidateQuickModelSteps", onValidateQuickModelSteps, this, [sandbox.id]);
				sandbox.subscribe("SetHasNoRunningProcess", onSetHasNoRunningProcess, this, [sandbox.id]);
			}

			/**
			 * Функция отрисовки модуля.
			 * @param {Ext.Element} renderTo контейнер для отрисовки модуля.
			 */
			function render(renderTo) {
				var config = sandbox.publish("FlowElementsEditModuleLoading", null, [sandbox.id]);
				showEditTabsWindow(this, config.flowElements, renderTo);
				this.onUpdateFlowElementsRenderTo = renderTo;
			}

			function destroy() {
				if (this.view) {
					this.view.destroy();
					delete this.view;
				}
			}

			/**
			 * Возвращает конфиг шагов процесса для хранения в схеме процесса
			 * @private
			 * @returns {Array|*}
			 */
			function onGetFlowElements() {
				return this.getFlowElements(this.rows);
			}

			/**
			 * Выполняет проверку корректности указанных данных о шагах процесса
			 * и показывает информационное окно пользователю, если проверка прошла не успешно
			 * @private
			 * @return {Boolean} Возвращает true при корректном заполнении полей всех шагов
			 */
			function onValidateQuickModelSteps() {
				var steps = this.rows;
				var isValidStep = true;
				if (steps && steps.collection && steps.collection.length) {
					steps.each(function(step) {
						isValidStep = step.validate();
						if (!isValidStep) {
							var validationMessage = step.getValidationMessage();
							step.showInformationDialog(validationMessage);
							return false;
						}
					});
				}
				return isValidStep;
			}

			/**
			 * Проставляет признак доступности редактирования элементов управления,
			 * в зависимости от наличия запущенных процессов
			 * @private
			 */
			function onSetHasNoRunningProcess(hasNoRunningProcess) {
				this.flowElementsViewModel.set("hasNoRunningProcess", hasNoRunningProcess);
				var steps = this.rows;
				if (!steps || !steps.collection || steps.collection.length === 0) {
					return;
				}
				steps.each(function(step) {
					step.set("hasNoRunningProcess", hasNoRunningProcess);
				});
			}

			/**
			 * Очищает и перерисовывает реестр шагов процесса
			 * @private
			 */
			function onUpdateFlowElements() {
				var config = sandbox.publish("FlowElementsEditModuleLoading", null, [sandbox.id]);
				this.rows.clear();
				if (this.view) {
					this.view.destroy();
				}
				showEditTabsWindow(this, config.flowElements, this.onUpdateFlowElementsRenderTo);
			}

			/**
			 * Функция создания модального окна редактирования вкладок
			 * @param {Terrasoft.BaseViewModel} scope Модель представления дизайнера страницы
			 * @param {Array} flowElements Массив элементов
			 * @param {Ext.Element} renderTo контейнер для отрисовки модуля
			 */
			function showEditTabsWindow(scope, flowElements, renderTo) {
				var hasNoRunningProcess = sandbox.publish("GetHasNoRunningProcess", null, [sandbox.id]);
				var vm = createFlowElementsViewModel(flowElements, hasNoRunningProcess);
				vm.set("hasNoRunningProcess", hasNoRunningProcess);
				vm.set("designerViewModel", scope);
				var view = createFlowElementsWindowView();
				view.bind(vm);
				scope.rows = vm.get("rows");
				scope.getFlowElements = vm.getFlowElements;
				scope.view = view;
				scope.flowElementsViewModel = vm;
				view.render(renderTo);
			}

			/**
			 * Функция создания модели представления окна добавления или редактирования вкладок
			 * @param {Array} elementsConf Массив закладок
			 * @param {Boolean} hasNoRunningProcess Признак, указывает на то, что по текущей схеме нет запущенных БП
			 * @returns {Terrasoft.BaseViewModel} Сгенерированная модель представления
			 */
			function createFlowElementsViewModel(elementsConf, hasNoRunningProcess) {
				var viewModel;
				var tabCaption;
				var currentObjectName;
				var cfg = {
					values: {
						headerCaption: tabCaption || localizableStrings.TabsHeaderCaption,
						rows: new Terrasoft.Collection(),
						rowsView: new Terrasoft.Collection(),
						editRowViewModel: null,
						tabListContainer: null,
						currentObjectName: currentObjectName || null,
						activePosition: null
					},
					methods: {
						/**
						 * Функция заполнения коллекции данных
						 * @private
						 */
						fillRowsCollection: function() {
							var rows = this.get("rows");
							Terrasoft.each(elementsConf, function(item) {
								var elementViewModel = this.getRowViewModel(item);
								elementViewModel.set("hasNoRunningProcess", hasNoRunningProcess);
								rows.add(item.uid, elementViewModel);
							}, this);
						},
						/**
						 * Формирует запрос для загрузки отображаемого значение справочника
						 * @protected
						 * @param {Object} scope Контекст выполнения функции
						 * @param {Object} config Имя справочного поля и значение его первичной для отображения колонки
						 * @returns {Terrasoft.EntitySchemaQuery}
						 */
						getLookupDisplayValueQuery: function(scope, config) {
							var esq = scope.getLookupQuery(null, config.name);
							esq.enablePrimaryColumnFilter(config.value);
							return esq;
						},
						/**
						 * Загружает отображаемое значение справочника
						 * @protected
						 * @param {Object} config Объект, содержащий аргументы функции
						 * {Object} scope Контекст выполнения функции
						 * {String} name Имя справочной колонки
						 * {String} value Значение первичного ключа справочной колонки
						 */
						loadLookupDisplayValue: function(config) {
							var scope = config.scope;
							var name = config.name;
							var value = config.value;
							var columnsConfig = config.columnsConfig;
							var callback = config.callback;
							var loadedValue = loadedLookupValues[name + "_" + value];
							if (loadedValue) {
								scope.set(name, loadedValue);
								if (callback) {
									callback.call(scope);
								}
								return;
							}
							var esq = this.getLookupDisplayValueQuery(scope, {
								name: name,
								value: value
							});
							Terrasoft.each(columnsConfig, function(column) {
								esq.addColumn(column);
							}, this);
							esq.getEntityCollection(function(result) {
								if (result.success && result.collection.getCount()) {
									var entity = result.collection.getByIndex(0);
									scope.set(name, entity.values);
									loadedLookupValues[name + "_" + value] = entity.values;
									if (callback) {
										callback.call(scope);
									}
								}
							}, this);
						},
						/**
						 * Возвращает результат выполнения шага
						 * @private
						 * @param {Array} results Список результатов выполнения шага
						 * @param {String} resultUId Идентификатор результата выполнения шага
						 * @returns {Object} Объект результата выполнения шага
						 */
						findStepResultByUId: function(results, resultUId) {
							return Ext.Array.findBy(results, function(item) {
								return (item.uid === resultUId);
							});
						},
						/**
						 * Загружает отображаемое значение для результата шага
						 * @private
						 * @param {Object} config Объект, содержащий аргументы функции
						 * {Object} flowElement Объект шага
						 * {Object} condition Условие перехода к следующему шагу
						 * {String} completedWithResultValue Идентификатор результата выполнения шага
						 * @param {Function} next Функция обратного вызова
						 */
						specifyStepResultDisplayValue: function(config, next) {
							var condition = config.condition;
							var resultValue = config.completedWithResultValue;
							var flowElement = config.flowElement;
							var flowElementType = flowElement.type.value;
							var loadedLookupKey = "StepResult" + "_" + flowElementType;
							var loadedValue = loadedLookupValues[loadedLookupKey];
							if (loadedValue) {
								var result = this.findStepResultByUId(loadedValue, resultValue);
								condition.CompletedWithResult = {
									"value": result.uid,
									"displayValue": result.caption
								};
								next();
								return;
							}
							flowElement = Ext.clone(flowElement);
							var esq = Ext.create("Terrasoft.EntitySchemaQuery", {
								"rootSchemaName": "SysProcessUserTask"
							});
							esq.addColumn("SysUserTaskSchemaUId", "SchemaUId");
							esq.getEntity(flowElementType, function(esqResult) {
								if (Ext.isEmpty(esqResult.entity)) {
									next();
									return;
								}
								flowElement = {
									"uid": flowElement.uid,
									"schemaUId": esqResult.entity.get("SchemaUId")
								};
								ProcessModuleUtilities.getProcessActivityResultsLookupGridData(this, flowElement,
									function(resultsLookupGridData) {
										loadedLookupValues[loadedLookupKey] = resultsLookupGridData;
										var result = this.findStepResultByUId(resultsLookupGridData, resultValue);
										condition.CompletedWithResult = {
											"value": result.uid,
											"displayValue": result.caption
										};
										next();
									});
							}, this);
						},
						/**
						 * Загружает отображаемык значения для результата шагов
						 * @private
						 * @param {Object} config Объект, содержащий аргументы функции
						 * {Array} conditions Список условий перехода к следующим шагам
						 * {Function} callback Функция обратного вызова
						 */
						specifyStepResultDisplayValues: function(config) {
							var conditions = config.conditions;
							var callback = config.callback;
							var rows = this.get("rows");
							var flowElements = this.getFlowElements(rows);
							var chainArguments = [];
							Terrasoft.each(conditions, function(condition) {
								if (condition.CompletedWithResult.displayValue) {
									return true;
								}
								var findItemConfig = {
									"uid": condition.IfFlowElementCompleted
								};
								var flowElement = Terrasoft.findItem(flowElements, findItemConfig).item;
								var chainFunction = function(next) {
									this.specifyStepResultDisplayValue({
										"condition": condition,
										"flowElement": flowElement,
										"completedWithResultValue": condition.CompletedWithResult
									}, next);
								};
								chainArguments.push(chainFunction);
							}, this);
							chainArguments.push(function() {
								callback.call(this);
							});
							Terrasoft.chain.apply(this, chainArguments);
						},
						/**
						 * Обработчик события нажатия на кнопку добавления
						 * @private
						 */
						onAddItemButtonClick: function() {
							var rows = this.get("rows");
							var hasNoRunningProcess = this.get("hasNoRunningProcess");
							var elementViewModel = this.getRowViewModel();
							elementViewModel.set("hasNoRunningProcess", hasNoRunningProcess);
							var prevElement = rows.collection.last();
							rows.add(elementViewModel.uid, elementViewModel);
							if (prevElement) {
								setItemEditUpButtonEnabled(prevElement);
								setItemEditDownButtonEnabled(prevElement);
							}
							var lastElement = rows.collection.last();
							setItemEditUpButtonEnabled(lastElement);
							setItemEditDownButtonEnabled(lastElement);
							sandbox.publish("FlowElementsFocused", null, [sandbox.id]);
						},
						/**
						 * Функция установки контейнера списка элемента
						 * @private
						 */
						setTabListContainer: function() {
							this.set("tabListContainer", Ext.getCmp("tabListContainer"));
							var rows = this.get("rows");
							if (rows && rows.collection && rows.collection.length) {
								rows.each(function(row) {
									row.visualize();
								});
							} else {
								sandbox.publish("FlowElementsEditModuleLoaded", this.getFlowElements(rows),
									[sandbox.id]);
							}
						},
						/**
						 * Функция очистки контейнера списка элемента
						 * @private
						 */
						clearTabListContainer: function() {
							this.set("tabListContainer", null);
						},
						/**
						 * Получение модели представления ряда
						 * @private
						 * @param {Object} config Значение ряда
						 */
						getRowViewModel: function(config) {
							config = config || {};
							config.methods = {
								/**
								 * Обработчик события нажатия на кнопку "Удалить"
								 * @private
								 */
								onItemDeleteButtonClick: function() {
									var currentStepUId = this.get("uid");
									var windowViewModel = this.get("windowViewModel");
									var rows = windowViewModel.get("rows");
									rows.remove(this);
									rows.collection.each(function(row) {
										var nextStep = row.get("nextStep");
										if (nextStep && nextStep.value === currentStepUId) {
											row.set("nextStep", null);
										}
										var conditions = row.get("conditions");
										var xorData = (conditions && conditions.xorConditions) ?
											conditions.xorConditions : null;
										if (!xorData) {
											return true;
										}
										if (xorData.elseExecuteFlowElement === currentStepUId) {
											xorData.elseExecuteFlowElement = null;
										}
										var actualConditions = [];
										Terrasoft.each(xorData.conditions, function(condition) {
											var ifFlowElementCompleted = condition.IfFlowElementCompleted;
											var thenExecuteFlowElement = condition.ThenExecuteFlowElement;
											if ((ifFlowElementCompleted === currentStepUId) ||
													(thenExecuteFlowElement === currentStepUId)) {
												return true;
											}
											actualConditions.push(condition);
										}, this);
										xorData.conditions = actualConditions;
									}, this);
									sandbox.publish("FlowElementsChanged", windowViewModel.getFlowElements(rows),
										[sandbox.id]);
								},
								/**
								 * Обработчик события изменения позиции
								 * @private
								 */
								changePosition: function(position) {
									this.set("position", position);
									var viewModel = this.get("windowViewModel");
									var rows = viewModel.get("rows");
									if (rows.indexOf(this) !== position) {
										rows.remove(this);
										this.set("changedPosition", true);
										rows.insert(position, this.get("uid"), this);
									}
									this.onItemFocused();
								}
							};
							return createRowViewModel(config, this);
						},
						/**
						 * Возвращает масив элементов для отрисовки диаграммы
						 * @private
						 * @param {Terrasoft.Collection} rows Коллекция строк
						 * @returns {Array} Масив элементов диаграммы
						 */
						getFlowElements: function(rows) {
							var flowElements = [];
							rows.collection.each(function(item, index) {
								flowElements.push({
									uid: item.get("uid"),
									name: "Element" + index,
									caption: item.get("caption"),
									type: item.get("type"),
									owner: item.get("owner") ? item.get("owner")
										: ProcessLibraryConstants.FlowElementOwnerEmpty,
									nextStep: item.get("nextStep"),
									position: item.get("position"),
									conditions: item.get("conditions")
								});
							}, this);
							return flowElements;
						},
						/**
						 * Подписывает на события
						 * @private
						 */
						subscribeEvents: function() {
							var rows = this.get("rows");
							var rowsView = this.get("rowsView");
							var onTabAdded = function(row) {
								row.visualize();
							};
							rows.on("add", onTabAdded);
							rows.on("remove", function(row) {
								if (!row.view.destroyed) {
									row.view.destroy();
								}
								delete row.view;
								rowsView.remove(row.view);
							});
							rows.on("clear", function() {
								rowsView.each(function(view) {
									view.destroy();
								});
								rowsView.clear();
							});
							rows.on("clear", function() {
								rows.each(onTabAdded);
							});
						}
					}
				};
				viewModel = Ext.create("Terrasoft.BaseViewModel", cfg);
				viewModel.subscribeEvents();
				viewModel.fillRowsCollection();
				return viewModel;
			}

			/**
			 * Функция определяющая включена ли кнопка вызова окна указания шагов шлюза
			 * @private
			 * @returns {Boolean} Включена ли кнопка
			 */
			function setItemGatewayEditButtonEnabled(scope) {
				var nextStep = scope.get("nextStep");
				var enabled = nextStep && nextStep.value === ProcessLibraryConstants.GatewayStepValue.value;
				scope.set("itemGatewayEditButtonEnabled", enabled);
			}

			/**
			 * Функция определяющая включена ли кнопка "Вверх"
			 * @private
			 * @returns {Boolean} Включена ли кнопка
			 */
			function setItemEditUpButtonEnabled(scope) {
				var windowViewModel = scope.get("windowViewModel");
				var rows = windowViewModel.get("rows");
				var enabled = rows.indexOf(scope) > 0;
				scope.set("itemEditUpButtonEnabled", enabled);
			}

			/**
			 * Функция определяющая включена ли кнопка "Вниз"
			 * @private
			 * @returns {Boolean} Включена ли кнопка
			 */
			function setItemEditDownButtonEnabled(scope) {
				var windowViewModel = scope.get("windowViewModel");
				var rows = windowViewModel.get("rows");
				var enabled = rows.indexOf(scope) + 1 < rows.getCount();
				scope.set("itemEditDownButtonEnabled", enabled);
			}

			/**
			 * Функция создания представления окна редактирования вкладок
			 * @returns {Terrasoft.Container} Сгенерированое представление окна
			 */
			function createFlowElementsWindowView() {
				var view;
				var cfg = {
					className: "Terrasoft.Container",
					id: "tabsMainContainer",
					selectors: {
						el: "#tabsMainContainer",
						wrapEl: "#tabsMainContainer"
					},
					classes: {
						wrapClassName: ["mainContainer"]
					},
					items: [
						{
							className: "Terrasoft.Container",
							id: "contentContainer",
							selectors: {
								wrapEl: "#contentContainer"
							},
							classes: {
								wrapClassName: ["contentContainer"]
							},
							items: [
								{
									className: "Terrasoft.Container",
									id: "captionRowContainer",
									selectors: {
										wrapEl: "#captionRowContainer"
									},
									classes: {
										wrapClassName: ["caption-row-container"]
									},
									items: [
										{
											className: "Terrasoft.Container",
											id: "captionCell1",
											selectors: {
												wrapEl: "#captionCell1"
											},
											classes: {
												wrapClassName: ["caption-cell"]
											},
											items: [
												{
													className: "Terrasoft.Label",
													classes: {
														labelClass: ["caption-row-flowType"]
													},
													markerValue: localizableStrings.FlowElementCaptionCaption,
													caption: localizableStrings.FlowElementCaptionCaption
												}
											]
										},
										{
											className: "Terrasoft.Container",
											id: "captionCell2",
											selectors: {
												wrapEl: "#captionCell2"
											},
											classes: {
												wrapClassName: ["caption-cell"]
											},
											items: [
												{
													className: "Terrasoft.Label",
													classes: {
														labelClass: ["caption-row-flowType"]
													},
													markerValue: localizableStrings.FlowElementTypeCaption,
													caption: localizableStrings.FlowElementTypeCaption
												}
											]
										},
										{
											className: "Terrasoft.Container",
											id: "captionCell3",
											selectors: {
												wrapEl: "#captionCell3"
											},
											classes: {
												wrapClassName: ["caption-cell"]
											},
											items: [
												{
													className: "Terrasoft.Label",
													classes: {
														labelClass: ["caption-row-owner"]
													},
													markerValue: localizableStrings.FlowElementOwnerCaption,
													caption: localizableStrings.FlowElementOwnerCaption
												}
											]
										},
										{
											className: "Terrasoft.Container",
											id: "captionCell4",
											selectors: {
												wrapEl: "#captionCell4"
											},
											classes: {
												wrapClassName: ["caption-cell"]
											},
											items: [
												{
													className: "Terrasoft.Label",
													classes: {
														labelClass: ["caption-row-nextStep"]
													},
													markerValue: localizableStrings.NextStepCaption,
													caption: localizableStrings.NextStepCaption
												}
											]
										},
										{
											className: "Terrasoft.Container",
											id: "captionCell5",
											selectors: {
												wrapEl: "#captionCell5"
											},
											classes: {
												wrapClassName: ["tab-item-right-container"]
											},
											items: [
												{
													className: "Terrasoft.Label",
													classes: {
														labelClass: ["caption-row-nextStep"]
													},
													caption: ""
												}
											]
										}
									]
								},
								{
									className: "Terrasoft.Container",
									id: "tabListContainer",
									selectors: {
										wrapEl: "#tabListContainer"
									},
									afterrender: {
										bindTo: "setTabListContainer"
									},
									destroy: {
										bindTo: "clearTabListContainer"
									},
									items: []
								},
								{
									className: "Terrasoft.Container",
									id: "addButtonContainer",
									selectors: {
										wrapEl: "#addButtonContainer"
									},
									classes: {
										wrapClassName: ["addButtonContainer"]
									},
									items: [
										{
											className: "Terrasoft.Button",
											style: Terrasoft.controls.ButtonEnums.style.BLUE,
											markerValue: localizableStrings.AddButtonCaption,
											caption: localizableStrings.AddButtonCaption,
											click: {
												bindTo: "onAddItemButtonClick"
											},
											classes: {
												wrapperClass: ["tab-add-button"]
											},
											enabled: {bindTo: "hasNoRunningProcess"}
										}
									]
								}
							]
						}
					]
				};
				view = Ext.create("Terrasoft.Container", cfg);
				return view;
			}

			/**
			 * Функция создания модели представления ряда
			 * @param {Object} item Конфигурационный объект элемента
			 * @param {String} item.caption Значение колонки заголовок
			 * @param {String} item.name Значение колонки имя
			 * @param {Number} item.position Позиция ряда
			 * @param {Terrasoft.BaseViewModel} scope Модель представления окна
			 * @returns {Terrasoft.BaseViewModel} resultViewModel Сгенерированная модель представления
			 */
			function createRowViewModel(item, scope) {
				var getOwnerLookupFilters = function() {
					var filters = Ext.create("Terrasoft.FilterGroup");
					filters.add("SysAdminUnitType", Terrasoft.createColumnFilterWithParameter(
						Terrasoft.ComparisonType.LESS, "SysAdminUnitTypeValue", 5));
					return filters;
				};
				var previousFlowElementOwner = ProcessLibraryConstants.FlowElementOwnerDefValue;
				var rows = scope.get("rows");
				var lastElement = rows.collection.last();
				var currentPosition = 0;
				if (lastElement) {
					previousFlowElementOwner = lastElement.get("owner");
					currentPosition = rows.indexOf(lastElement) + 1;
				}
				var config = {
					values: {
						uid: item.uid || Terrasoft.generateGUID(),
						caption: item.caption,
						name: item.name || null,
						type: item.type || ProcessLibraryConstants.FlowElementTypeDefValue,
						owner: item.owner || previousFlowElementOwner,
						typeList: new Terrasoft.Collection(),
						ownerList: new Terrasoft.Collection(),
						nextStepList: new Terrasoft.Collection(),
						position: currentPosition,
						nextStep: item.nextStep || null,
						conditions: item.conditions,
						visible: true,
						allowDelete: true,
						windowViewModel: scope
					},
					columns: {
						uid: {
							dataValueType: Terrasoft.DataValueType.GUID,
							type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
							isRequired: false
						},
						caption: {
							dataValueType: Terrasoft.DataValueType.TEXT,
							isRequired: true,
							caption: localizableStrings.FlowElementCaptionCaption
						},
						name: {
							dataValueType: Terrasoft.DataValueType.TEXT
						},
						type: {
							type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
							dataValueType: Terrasoft.DataValueType.ENUM,
							referenceSchemaName: "SysProcessUserTask",
							caption: localizableStrings.FlowElementTypeCaption,
							isLookup: true,
							isRequired: true
						},
						typeList: {
							type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
							isCollection: true
						},
						owner: {
							type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
							dataValueType: Terrasoft.DataValueType.LOOKUP,
							referenceSchemaName: "SysAdminUnit",
							isRequired: true,
							isLookup: true,
							caption: localizableStrings.FlowElementOwnerCaption,
							lookupFilters: getOwnerLookupFilters()
						},
						nextStep: {
							type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
							dataValueType: Terrasoft.DataValueType.ENUM,
							caption: localizableStrings.NextStepCaption,
							isLookup: true,
							isRequired: true
						},

						nextStepList: {
							type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
							isCollection: true
						},
						conditions: {
							type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN
						}
					},
					methods: {
						/**
						 * Обработчик события получения фокуса полями FlowElement
						 * @private
						 */
						onItemFocused: function() {
							sandbox.publish("FlowElementsFocused", null, [sandbox.id]);
						},
						/**
						 * Обработчик события нажатия на кнопку вызова окна указания шагов
						 * Обработчик события нажатия на кнопку "Вверх"
						 * @private
						 * @param {Object} config Дополнительные настройки окна редактирования условных переходов
						 */
						onItemGatewayEditButtonClick: function(config) {
							this.showXORProperties(config);
						},
						/**
						 * Обработчик события нажатия на кнопку "Вверх"
						 * @private
						 */
						onItemEditUpButtonClick: function() {
							var windowViewModel = this.get("windowViewModel");
							var rows = windowViewModel.get("rows");
							var position = rows.indexOf(this) - 1;
							this.changePosition(position);
						},
						/**
						 * Обработчик события нажатия на кнопку "Вниз"
						 * @private
						 */
						onItemEditDownButtonClick: function() {
							var windowViewModel = this.get("windowViewModel");
							var rows = windowViewModel.get("rows");
							var position = rows.indexOf(this) + 1;
							this.changePosition(position);
						},
						/**
						 * Функция получения значений имени и заголовка текущего ряда
						 * @private
						 * @returns {Object} Объект со значениями имени и заголовка
						 */
						getValue: function() {
							return {
								uid: this.get("uid"),
								caption: this.get("caption"),
								name: this.get("name"),
								type: this.get("type"),
								owner: this.get("owner"),
								nextStep: this.get("nextStep")
							};
						},
						/**
						 * Функция получения представления ряда
						 * @private
						 * @returns {Terrasoft.Container} Представление ряда
						 */
						getView: function() {
							var view;
							var uid = "i-" + Terrasoft.generateGUID();
							var config = {
								id: uid + "-ItemContainer",
								selectors: {wrapEl: "#" + uid + "-ItemContainer"},
								classes: {wrapClassName: ["tab-item-container"]},
								markerValue: {bindTo: "caption"},
								items: [
									{
										className: "Terrasoft.Container",
										id: uid + "rowCell1",
										selectors: {wrapEl: "#" + uid + "rowCell1"},
										classes: {wrapClassName: ["control-width-15", "caption-cell"]},
										items: [
											{
												className: "Terrasoft.TextEdit",
												classes: {labelClass: "cell-left"},
												markerValue: localizableStrings.FlowElementCaptionCaption,
												value: {bindTo: "caption"},
												focus: {bindTo: "onItemFocused"},
												tag: "caption",
												enabled: {bindTo: "hasNoRunningProcess"}
											}
										]
									},
									{
										className: "Terrasoft.Container",
										id: uid + "rowCell2",
										selectors: {wrapEl: "#" + uid + "rowCell2"},
										classes: {wrapClassName: ["control-width-15", "caption-cell"]},
										items: [
											{
												className: "Terrasoft.ComboBoxEdit",
												classes: {wrapClass: "flow-owner-control"},
												markerValue: {
													bindTo: "caption",
													bindConfig: {
														converter: function(value) {
															var markerValue = localizableStrings.FlowElementTypeCaption;
															if (value) {
																markerValue = markerValue + "_" + value;
															}
															return markerValue;
														}
													}
												},
												value: {bindTo: "type"},
												focus: {bindTo: "onItemFocused"},
												list: {bindTo: "typeList"},
												prepareList: {bindTo: "onPrepareFlowElementTypeList"},
												enabled: {bindTo: "hasNoRunningProcess"},
												tag: "type"
											}
										]
									},
									{
										className: "Terrasoft.Container",
										id: uid + "rowCell3",
										selectors: {wrapEl: "#" + uid + "rowCell3"},
										classes: {wrapClassName: ["control-width-15", "caption-cell"]},
										items: [
											{
												className: "Terrasoft.LookupEdit",
												classes: {wrapClass: "flow-owner-control"},
												markerValue: localizableStrings.FlowElementOwnerCaption,
												value: {bindTo: "owner"},
												focus: {bindTo: "onItemFocused"},
												loadVocabulary: {bindTo: "onLoadVocabulary"},
												list: {bindTo: "ownerList"},
												change: {bindTo: "getOwnerLookupQuery"},
												tag: "owner",
												enabled: {bindTo: "hasNoRunningProcess"}
											}
										]
									},
									{
										className: "Terrasoft.Container",
										id: uid + "rowCell4",
										selectors: {wrapEl: "#" + uid + "rowCell4"},
										classes: {wrapClassName: ["control-width-15", "caption-cell"]},
										items: [
											{
												className: "Terrasoft.ComboBoxEdit",
												classes: {wrapClass: "flow-owner-control"},
												markerValue: {
													bindTo: "caption",
													bindConfig: {
														converter: function(value) {
															var markerValue = localizableStrings.NextStepCaption;
															if (value) {
																markerValue = markerValue + "_" + value;
															}
															return markerValue;
														}
													}
												},
												value: {bindTo: "nextStep"},
												focus: {bindTo: "onItemFocused"},
												list: {bindTo: "nextStepList"},
												prepareList: {bindTo: "onPrepareFlowElementNextStepList"},
												tag: "nextStep",
												enabled: {bindTo: "hasNoRunningProcess"}
											}
										]
									},
									{
										id: uid + "-ItemButtonsContainer",
										className: "Terrasoft.Container",
										selectors: {wrapEl: "#" + uid + "-ItemButtonsContainer"},
										classes: {wrapClassName: ["tab-item-right-container"]},
										items: [
											{
												className: "Terrasoft.Container",
												id: uid + "GatewayEditButtonContainer",
												selectors: {wrapEl: "#" + uid + "GatewayEditButtonContainer"},
												classes: {wrapClassName: ["edit-button-wrap"]},
												items: [
													{
														className: "Terrasoft.Button",
														imageConfig: resources.localizableImages.GatewayEditIcon,
														style: Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
														classes: {wrapperClass: ["element-edit-button"]},
														markerValue: "GatewayEditFlowElement",
														click: {bindTo: "onItemGatewayEditButtonClick"},
														visible: {bindTo: "itemGatewayEditButtonEnabled"},
														enabled: {bindTo: "hasNoRunningProcess"}
													}
												]
											},
											{
												className: "Terrasoft.Container",
												id: uid + "UpButtonContainer",
												selectors: {wrapEl: "#" + uid + "UpButtonContainer"},
												classes: {wrapClassName: ["edit-button-wrap"]},
												items: [
													{
														className: "Terrasoft.Button",
														imageConfig: resources.localizableImages.UpIcon,
														style: Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
														classes: {wrapperClass: ["element-edit-button"]},
														markerValue: "UpFlowElement",
														click: {bindTo: "onItemEditUpButtonClick"},
														visible: {bindTo: "itemEditUpButtonEnabled"},
														enabled: {bindTo: "hasNoRunningProcess"}
													}
												]
											},
											{
												className: "Terrasoft.Container",
												id: uid + "DownButtonContainer",
												selectors: {wrapEl: "#" + uid + "DownButtonContainer"},
												classes: {wrapClassName: ["edit-button-wrap"]},
												items: [
													{
														className: "Terrasoft.Button",
														imageConfig: resources.localizableImages.DownIcon,
														style: Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
														classes: {wrapperClass: ["element-edit-button"]},
														markerValue: "DownFlowElement",
														click: {bindTo: "onItemEditDownButtonClick"},
														visible: {bindTo: "itemEditDownButtonEnabled"},
														enabled: {bindTo: "hasNoRunningProcess"}
													}
												]
											},
											{
												className: "Terrasoft.Container",
												id: uid + "DeleteButtonContainer",
												selectors: {wrapEl: "#" + uid + "DeleteButtonContainer"},
												classes: {wrapClassName: ["edit-button-wrap"]},
												items: [
													{
														className: "Terrasoft.Button",
														imageConfig: resources.localizableImages.CloseIcon,
														style: Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
														classes: {wrapperClass: ["element-edit-button"]},
														markerValue: "DeleteFlowElement",
														click: {bindTo: "onItemDeleteButtonClick"},
														enabled: {bindTo: "hasNoRunningProcess"}
													}
												]
											}
										]
									}
								],
								afterrender: {bindTo: "onVisualized"},
								afterrerender: {bindTo: "onVisualized"}
							};
							view = Ext.create("Terrasoft.Container", config);
							return view;
						},
						/**
						 * Анализирует информацию, полученную в результате проверки на корректность указанных значений
						 * и возвращает на ее основе сообщение для пользователя
						 * @overridden
						 * @return {*|String} Возвращает сообщения для пользователя
						 */
						getValidationMessage: function() {
							var messageTemplate = localizableStrings.FieldValidationError;
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
								var columnCaption = invalidColumn && invalidColumn.caption ?
									invalidColumn.caption : invalidColumnName;
								invalidMessage = Ext.String.format(messageTemplate, columnCaption, invalidMessage);
							}
							return invalidMessage;
						},
						/**
						 * Возвращает список шагов
						 * @returns {Terrasoft.Collection}
						 * @private
						 */
						getRows: function() {
							var windowViewModel = this.get("windowViewModel");
							return windowViewModel.get("rows");
						},
						/**
						 * Обработчик события изменения шага процесса
						 * @private
						 */
						onFlowElementsChanged: function(rows) {
							if (!rows) {
								rows = this.getRows();
							}
							sandbox.publish("FlowElementsChanged",
								this.get("windowViewModel").getFlowElements(rows), [sandbox.id]);
						},
						/**
						 * Указать значение по умолчанию для предыдущего шага
						 * @private
						 */
						setNextStepDefValue: function(rows) {
							var currentStepCaption = this.get("caption");
							if (!currentStepCaption) {
								return;
							}
							var currentStepIdx = rows.collection.indexOf(this);
							if (currentStepIdx === 0) {
								return;
							}
							var prevStep = rows.collection.get(currentStepIdx - 1);
							if (!prevStep.get("nextStep")) {
								prevStep.set("nextStep", {
									value: this.get("uid"),
									displayValue: currentStepCaption
								});
							}
						},
						/**
						 * Обновить значение заголовка для следующих шагов
						 * @private
						 */
						updateNextStepCaption: function(rows) {
							var currentStepCaption = this.get("caption");
							if (!currentStepCaption) {
								return;
							}
							if (rows.collection.length < 2) {
								return;
							}
							var currentStepUId = this.get("uid");
							rows.collection.each(function(row) {
								var nextStep = row.get("nextStep");
								if (nextStep && nextStep.value === currentStepUId &&
									nextStep.displayValue !== currentStepCaption) {
									row.set("nextStep", {
										value: currentStepUId,
										displayValue: currentStepCaption
									});
								}
							}, this);
						},
						/**
						 * Обработчик события нажатия кнопок влавиатуры
						 * @private
						 */
						onKeyDown: function(e) {
							var key = e.getKey();
							switch (key) {
								case e.ESC:
									// TODO #CRM-1637 Сделать отмену измененного значения
									//this.onItemEditCancelButtonClick();
									break;
								default:
									break;
							}
						},
						/**
						 * Добавляет фильтр по колонке Тип Объекта администрирования
						 * @param {String} filterValue Фильтр для primaryDisplayColumn
						 * @param {String} columnName Имя колонки ViewModel
						 * @returns {Terrasoft.EntitySchemaQuery}
						 */
						getOwnerLookupQuery: function(filterValue, columnName) {
							var esq = this.getLookupQuery(filterValue, columnName);
							if (columnName === "owner") {
								esq.filters.add("SysAdminUnitType", Terrasoft.createColumnFilterWithParameter(
									Terrasoft.ComparisonType.LESS, "SysAdminUnitTypeValue", 5));
							}
							return esq;
						},
						/**
						 * Открывает окно справочника по указанной колонке
						 * @param {Object} args Свойства спровочного эл. управления
						 * @param {String} tag Имя колонки
						 */
						onLoadVocabulary: function(args, tag) {
							var config = {
								entitySchemaName: this.columns[tag].referenceSchemaName,
								multiSelect: false,
								columnName: tag,
								columnValue: this.get(tag),
								filters: this.columns[tag].lookupfilters,
								searchValue: args.searchValue,
								hideActions: true
							};
							if (tag === "owner") {
								config.columns = ["SysAdminUnitTypeValue", "Contact"];
							}
							var handler = function(args) {
								if (args.selectedRows.getCount()) {
									this.set(args.columnName, args.selectedRows.getByIndex(0));
								}
							};
							LookupUtilities.Open(sandbox, config, handler, this, null, false, false);
						},
						/**
						 * Обработчик события подготовки данных для выпадающего списка типов FlowElement-ов
						 * @filter {Object} Фильры для подготовки данных
						 * @list {Terrasoft.Collection}Данные для выпадающего списка
						 * @protected
						 */
						onPrepareFlowElementTypeList: function(filter, list) {
							list.clear();
							var esq = Ext.create("Terrasoft.EntitySchemaQuery", {
								rootSchemaName: "SysProcessUserTask"
							});
							esq.addColumn("SysUserTaskSchemaUId");
							esq.addColumn("QuickModelEditPageSchemaUId");
							esq.addColumn("Caption");
							esq.addColumn("SysImage");
							var positionColumn = esq.addColumn("Position");
							positionColumn.orderDirection = Terrasoft.OrderDirection.ASC;
							esq.filters.add("IsQuickModel", Terrasoft.createColumnFilterWithParameter(
								Terrasoft.ComparisonType.EQUAL, "IsQuickModel", true));
							esq.filters.add("SysWorkspace", Terrasoft.createColumnFilterWithParameter(
								Terrasoft.ComparisonType.EQUAL,
								"[VwSysSchemaInWorkspace:UId:SysUserTaskSchemaUId].SysWorkspace",
								Terrasoft.SysValue.CURRENT_WORKSPACE.value));
							esq.getEntityCollection(function(response) {
								var collection = response.collection;
								var rows = {};
								var icons = ProcessLibraryConstants.FlowElementTypeIcons;
								if (collection && collection.collection.length > 0) {
									Terrasoft.each(collection.collection.items, function(item) {
										var listValue = {
											value: item.values.Id,
											displayValue: item.values.Caption,
											SysUserTaskSchemaUId: item.values.SysUserTaskSchemaUId,
											QuickModelEditPageSchemaUId: item.values.QuickModelEditPageSchemaUId,
											SysImage: item.values.SysImage,
											// TODO #CRM-1637 Сделать загрузку картинки из схемы ProcessUserTask
											imageConfig: resources.localizableImages[icons[item.values.Id]]
										};
										if (!list.contains(item.values.Id)) {
											rows[item.values.Id] = listValue;
										}
									}, this);
									list.loadAll(rows);
								}
							}, this);
						},
						/**
						 * Обработчик события подготовки данных для выпадающего списка шагов процесса
						 * @filter {Object} Фильры для подготовки данных
						 * @list {Terrasoft.Collection}Данные для выпадающего списка
						 * @protected
						 */
						onPrepareFlowElementNextStepList: function(filter, list) {
							list.clear();
							var windowViewModel = this.get("windowViewModel");
							var rows = windowViewModel.get("rows");
							var nextSteps = {};
							var currentStepUId = this.get("uid");
							rows.collection.each(function(row) {
								var caption = row.get("caption");
								if (!caption) {
									return true;
								}
								var stepUId = row.get("uid");
								if (currentStepUId === stepUId) {
									return true;
								}
								nextSteps[stepUId] = {
									"value": stepUId,
									"displayValue": caption
								};
							}, this);
							var endElementStepValue = ProcessLibraryConstants.EndElementStepValue;
							nextSteps[endElementStepValue.value] = {
								"value": endElementStepValue.value,
								"displayValue": endElementStepValue.displayValue
							};
							var gatewayStepValue = ProcessLibraryConstants.GatewayStepValue;
							nextSteps[gatewayStepValue.value] = {
								"value": gatewayStepValue.value,
								"displayValue": gatewayStepValue.displayValue
							};
							list.loadAll(nextSteps);
						},
						/**
						 * Устанавливает признак Активен кнопкам редактирования в зависимости от позиции
						 * @private
						 */
						setEditButtonsEnabled: function() {
							var windowViewModel = this.get("windowViewModel");
							var rows = windowViewModel.get("rows");
							setItemGatewayEditButtonEnabled(this);
							setItemEditUpButtonEnabled(this);
							setItemEditDownButtonEnabled(this);
							var position = rows.indexOf(this);
							var prevElementPosition = position - 1;
							if (prevElementPosition >= 0) {
								var prevElement = rows.getByIndex(prevElementPosition);
								setItemEditUpButtonEnabled(prevElement);
								setItemEditDownButtonEnabled(prevElement);
							}
							var nextElementPosition = position + 1;
							if (nextElementPosition < rows.getCount()) {
								var nextElement = rows.getByIndex(nextElementPosition);
								if (nextElement) {
									setItemEditUpButtonEnabled(nextElement);
									setItemEditDownButtonEnabled(nextElement);
								}
							}
						},
						/**
						 * Открывает модальное окно свойств XOR-гейтвея
						 * @overridden
						 * @private
						 * @param {Object} config Дополнительные настройки окна редактирования условных переходов
						 */
						showXORProperties: function(config) {
							var boxSize = {
								minHeight: "1",
								minWidth: "1",
								maxHeight: "100",
								maxWidth: "100"
							};
							var innerBoxContainer = ModalBox.show(boxSize, function() {}, this);
							var schemaName = "ProcessXORParametersEditPage";
							var pageId = sandbox.id + schemaName;
							var rows = this.get("windowViewModel").get("rows");
							var windowViewModel = this.get("windowViewModel");
							var flowElements = windowViewModel.getFlowElements(rows);
							var conditions = this.get("conditions");
							var xorConditions;
							if (conditions && conditions.xorConditions) {
								xorConditions = Ext.clone(conditions.xorConditions);
							} else {
								var currentFlowElement = this.get("caption") ? this.get("uid") : null;
								xorConditions = {
									"elseExecuteFlowElement": null,
									"conditions": [{
										"IfFlowElementCompleted": currentFlowElement
									}]
								};
							}
							var xorGatewayParameters = {
								"HasNoRunningProcess": this.get("hasNoRunningProcess"),
								"FlowElements": flowElements,
								"SourceRefUId": this.get("uid"),
								"XorConditions": xorConditions
							};
							if (config) {
								xorGatewayParameters = Ext.apply(xorGatewayParameters, config);
							}
							ModalBox.setSize(685, 416);
							sandbox.subscribe("GetParametersInfo", function() {
								return {
									modalBoxCaption: localizableStrings.XORPropertiesTitle,
									parameters: xorGatewayParameters
								};
							}, [pageId]);
							sandbox.loadModule("XORParametersEditModule", {
								renderTo: innerBoxContainer,
								id: pageId
							});
							sandbox.subscribe("SetParametersInfo", function(parameters) {
								if (parameters) {
									if (parameters.xorConditions) {
										var conditions = this.get("conditions");
										if (!conditions) {
											conditions = {};
										}
										conditions.xorConditions = parameters.xorConditions;
										this.set("conditions", conditions);
										delete parameters.xorConditions;
									}
									Terrasoft.each(parameters, function(value, name) {
										this.set(name, value);
									}, this);
								}
								ModalBox.close();
								setItemGatewayEditButtonEnabled(this);
								this.onFlowElementsChanged(rows);
								this.onItemFocused();
							}, this, [pageId]);
						},
						/**
						 * Функция отрисовки ряда
						 * @private
						 */
						visualize: function() {
							var windowViewModel = this.get("windowViewModel");
							var rows = windowViewModel.get("rows");
							var tabListContainer = windowViewModel.get("tabListContainer");
							if (tabListContainer) {
								var view = this.view;
								var position = rows.indexOf(this);
								if (!view || view.destroyed) {
									view = this.getView();
									this.view = view;
									view.bind(this);
									this.setEditButtonsEnabled();
									// TODO CRM-3293 Карточка QuickModel: При переходах по записям реестр шагов и
									// диаграмма загружаются с задержкой в несколько секунд
									var render = function() {
										this.set("changedPosition", false);
										if (view.rendered) {
											view.reRender(position, tabListContainer.getRenderToEl());
										} else {
											view.render(tabListContainer.getRenderToEl(), position);
										}
									}.bind(this);
									if (!this.get("changedPosition")) {
										this.loadLookupDisplayValues(render);
									} else {
										sandbox.publish("FlowElementsEditModuleLoaded",
											windowViewModel.getFlowElements(windowViewModel.get("rows")), [sandbox.id]);
										render();
									}

								}
							}
						},
						/**
						 * Загружает отображаемые значения полей "Тип действия" и "Ответственный"
						 * @private
						 */
						loadLookupDisplayValues: function(callback) {
							var type = this.get("type");
							var owner = this.get("owner");
							var xorData = this.get("conditions");
							xorData = xorData && xorData.xorConditions ? xorData.xorConditions : null;
							var windowViewModel = this.get("windowViewModel");
							Terrasoft.chain(
								function(next) {
									if (type && type.value && !type.displayValue && !type.sysImageId) {
										windowViewModel.loadLookupDisplayValue({
												scope: this,
												name: "type",
												value: type.value,
												columnsConfig: ["SysImage"],
												callback: next
											});
									} else {
										next();
									}
								},
								function(next) {
									if (owner && owner.value && !owner.displayValue &&
										owner.value !== ProcessLibraryConstants.FlowElementOwnerEmpty.value) {
										windowViewModel.loadLookupDisplayValue({
											scope: this,
											name: "owner",
											value: owner.value,
											columnsConfig: ["SysAdminUnitTypeValue", "Contact"],
											callback: next
										});
									} else {
										next();
									}
								},
								function(next) {
									if (!xorData) {
										next();
										return;
									}
									windowViewModel.specifyStepResultDisplayValues.call(windowViewModel, {
										"conditions": xorData.conditions,
										"callback": next
									});
								},
								function() {
									this.subscribeEvents();
									sandbox.publish("FlowElementsEditModuleLoaded",
										windowViewModel.getFlowElements(windowViewModel.get("rows")), [sandbox.id]);
									callback();
								}, this);
						},
						/**
						 * Обработчик события отрисовки
						 * @private
						 */
						onVisualized: function() {
							var windowViewModel = this.get("windowViewModel");
							var tabsView = windowViewModel.get("rowsView");
							var value = this.get("value");
							if (!tabsView.contains(value)) {
								tabsView.add(value, this.view);
							}
						},
						/**
						 * Подписывает на события
						 * @private
						 */
						subscribeEvents: function() {
							var subscribeOnAttributeChanged = function(attributeName, handler) {
								this.on("change:" + attributeName, function(model, value) {
									if (handler) {
										handler.call(this, value);
									} else {
										this.onFlowElementsChanged();
									}
								}, this);
							};
							subscribeOnAttributeChanged.call(this, "owner");
							subscribeOnAttributeChanged.call(this, "type");
							subscribeOnAttributeChanged.call(this, "nextStep", function(value) {
								if (value && value.value) {
									var enabled = (value.value === ProcessLibraryConstants.GatewayStepValue.value);
									this.set("itemGatewayEditButtonEnabled", enabled);
									if (enabled) {
										this.onItemGatewayEditButtonClick({
											"IsNewValue": true,
											"PreviousValueNextStep": null
										});
										return;
									}
									this.set("previousValueNextStep", value);
									var conditions = this.get("conditions");
									if (conditions && conditions.xorConditions) {
										this.set("conditions", null);
									}
								}
								this.onFlowElementsChanged();
							});
							subscribeOnAttributeChanged.call(this, "caption", function() {
								var rows = this.getRows();
								this.updateNextStepCaption(rows);
								this.setNextStepDefValue(rows);
								this.onFlowElementsChanged(rows);
							});
						},
						/**
						 * Функция валидации поля "Ответственный"
						 * Поле должно быть заполненно.
						 * @returns {{invalidMessage: string}} Возвращает результат валидации
						 */
						ownerValidator: function(value) {
							var invalidMessage = "";
							if (!value.displayValue) {
								invalidMessage = Terrasoft.Resources.BaseViewModel.columnRequiredValidationMessage;
							}
							return {
								invalidMessage: invalidMessage
							};
						},
						/**
						 * Добавляет валидатор для указанной колонки.
						 * @protected
						 * @virtual
						 * @param {String} columnName Имя колонки для валидации.
						 * @param {Function} validatorFn Функция валидации.
						 */
						addColumnValidator: function(columnName, validatorFn) {
							var columnValidationConfig = this.validationConfig[columnName] ||
								(this.validationConfig[columnName] = []);
							columnValidationConfig.push(validatorFn);
						},
						/**
						 * Инициализирует пользовательские валидаторы
						 * @protected
						 */
						setValidationConfig: function() {
							this.addColumnValidator("owner", this.ownerValidator);
						}
					}
				};
				Ext.apply(config.methods, item.methods);
				var viewModel = Ext.create("Terrasoft.BaseViewModel", config);
				viewModel.setValidationConfig();
				return viewModel;
			}

			return Ext.define("FlowElementsEditModule", {
				init: init,
				render: render,
				destroy: destroy
			});
		}

		return flowElementsEditModule;
	}
);
