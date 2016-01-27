define("WizardHeaderModule", ["WizardHeaderModuleResources", "BaseNestedModule", "ViewGeneratorV2", "ContainerList",
			"ContainerListGenerator"],
	function(resources) {

		/**
		 * @class Terrasoft.configuration.WizardStep
		 * Класс модели представления шага.
		 */
		Ext.define("Terrasoft.configuration.WizardStep", {
			extend: "Terrasoft.BaseViewModel",
			alternateClassName: "Terrasoft.WizardStep",

			/**
			 * Имя признака выделенного шага.
			 * @type {String}
			 */
			selectedPropertyName: "Selected",

			constructor: function() {
				this.callParent(arguments);
				this.addEvents(
					"click",
					"select"
				);
				this.set(this.selectedPropertyName, false);
			},

			/**
			 * Обрабатывает нажатие на шаг.
			 */
			click: function(tag) {
				var stepCollection = this.get("StepCollection");
				var stepName;
				if (tag && !stepCollection.isEmpty()) {
					var item = stepCollection.get(tag);
					stepName = item.get("name");
					this.fireEvent("click", stepName);
				} else if (!stepCollection || stepCollection.isEmpty()) {
					stepName = this.get("name");
					this.fireEvent("click", stepName);
				} else {
					return false;
				}
			},

			/**
			 * Обрабатывает выделение шага.
			 */
			select: function() {
				if (!this.get(this.selectedPropertyName)) {
					this.set(this.selectedPropertyName, true);
					var stepName = this.get("name");
					this.fireEvent("select", stepName);
				}
			},

			/**
			 * Обрабатывает снятие выделение шага.
			 */
			unSelect: function() {
				this.set(this.selectedPropertyName, false);
			},

			/**
			 * Возвращает признак выделен ли шага.
			 * @return Возвращает признак выделен ли шага.
			 */
			isSelected: function() {
				return this.get(this.selectedPropertyName);
			}

		});

		/**
		 * @class Terrasoft.configuration.WizardStepCollection
		 * Класс модели представления коллекции шагов мастера.
		 */
		Ext.define("Terrasoft.configuration.WizardStepCollection", {
			extend: "Terrasoft.BaseViewModelCollection",
			alternateClassName: "Terrasoft.WizardStepCollection",

			/**
			 * Имя модели представления шага.
			 */
			itemViewModelName: "Terrasoft.WizardStep",

			constructor: function() {
				this.callParent(arguments);
				this.addEvents(
					"itemClick",
					"itemSelect"
				);
			},

			/**
			 * Подписывает событие изменения элемента коллекции.
			 * @param {Terrasoft.WizardStep} item Элемент коллекции.
			 */
			subscribeItemEvent: function(item) {
				this.callParent(arguments);
				item.on("click", this.onItemClick, this);
				item.on("select", this.onItemSelect, this);
			},

			/**
			 * Отписывает событие изменения элемента коллекции.
			 * @protected
			 * @virtual
			 * @param {Terrasoft.WizardStep} item Элемент коллекции.
			 */
			unsubscribeItemEvent: function(item) {
				this.callParent(arguments);
				item.un("click", this.onItemClick, this);
				item.un("select", this.onItemSelect, this);
			},

			/**
			 * Обрабатывает нажатие на кнопку шага.
			 * @protected
			 * @virtual
			 * @param {String} clickedItemName Имя шага.
			 */
			onItemClick: function(clickedItemName) {
				this.fireEvent("itemClick", clickedItemName);
			},

			/**
			 * Обрабатывает выделение шага.
			 * @protected
			 * @virtual
			 * @param {String} selectedItemName Имя выделенного шага.
			 */
			onItemSelect: function(selectedItemName) {
				this.fireEvent("itemSelect", selectedItemName);
			},

			/**
			 * Функция фильтрации выделенного шага.
			 * @protected
			 * @virtual
			 * @param {Terrasoft.WizardStep} item Элемент коллекции.
			 * @return {Terrasoft.WizardStep} Выделенный шаг.
			 */
			selectedFilterFn: function(item) {
				return item.isSelected();
			},

			/**
			 * Возвращает индекс текущего шага.
			 * @protected
			 * @virtual
			 * @return {Number} Индекс текущего шага.
			 */
			getCurrentItemIndex: function() {
				var currentItem = this.getCurrentItem();
				return this.indexOf(currentItem);
			},

			/**
			 * Возвращает текущий шаг.
			 * @protected
			 * @virtual
			 * @return {Terrasoft.WizardStep} Текущий шаг.
			 */
			getCurrentItem: function() {
				var currentItem = null;
				this.each(function(item, key) {
					var result = this.selectedFilterFn(item, key);
					if (result) {
						currentItem = item;
					}
					return !result;
				}, this);
				return currentItem;
			},

			/**
			 * Определяет предыдущий шаг из коллекции шагов и нажимает.
			 * @protected
			 * @virtual
			 */
			previous: function() {
				var index = this.getCurrentItemIndex();
				if (index > 0) {
					var item = this.getByIndex(index - 1);
					item.click();
				}
			},

			/**
			 * Определяет следующий шаг из коллекции шагов и нажимает.
			 * @protected
			 * @virtual
			 */
			next: function() {
				var index = this.getCurrentItemIndex();
				if (index < (this.getCount() - 1)) {
					var item = this.getByIndex(index + 1);
					item.click();
				}
			},

			/**
			 * Создает модель представления шага.
			 * @protected
			 * @virtual
			 * @param {Object} columnValues Конфигурационный объект шага.
			 */
			createItem: function(columnValues) {
				return Ext.create(this.itemViewModelName, {
					values: columnValues,
					rowConfig: this.rowConfig
				});
			}
		});

		/**
		 * @class Terrasoft.configuration.BaseDashboardsViewModel
		 * Класс модели представления модуля верхней панели мастера.
		 */
		Ext.define("Terrasoft.configuration.WizardHeaderViewModel", {
			extend: "Terrasoft.BaseViewModel",
			alternateClassName: "Terrasoft.WizardHeaderViewModel",

			Ext: null,
			sandbox: null,
			Terrasoft: null,

			messages: {

				/**
				 * Подписка на сообщения для обновление верхней панели.
				 */
				"UpdateConfig": {
					mode: Terrasoft.MessageMode.PTP,
					direction: Terrasoft.MessageDirectionType.SUBSCRIBE
				},

				/**
				 * Публикация сообщения для отправки текущего шага.
				 */
				"CurrentStepChange": {
					mode: Terrasoft.MessageMode.PTP,
					direction: Terrasoft.MessageDirectionType.PUBLISH
				},

				/**
				 * Публикация сообщения для получение конфигурационной информации верхней панели.
				 */
				"GetConfig": {
					mode: Terrasoft.MessageMode.PTP,
					direction: Terrasoft.MessageDirectionType.PUBLISH
				},

				/**
				 * Публикация сообщения сохранения мастера.
				 */
				"SaveWizard": {
					mode: Terrasoft.MessageMode.PTP,
					direction: Terrasoft.MessageDirectionType.PUBLISH
				},

				/**
				 * Публикация сообщения отмены настроек мастера.
				 *
				 */
				"CancelWizard": {
					mode: Terrasoft.MessageMode.PTP,
					direction: Terrasoft.MessageDirectionType.PUBLISH
				}
			},

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
			 * Расширяет конфигурацию сообщений модуля, сообщениями описанными в схеме
			 * @protected
			 * @virtual
			 */
			registerMessages: function() {
				this.sandbox.registerMessages(this.messages);
			},

			/**
			 * Инициализирует начальные значения модели.
			 * @protected
			 * @virtual
			 * @param {Function} callback Функция, которая будет вызвана по завершению.
			 * @param {Object} scope Контекст, в котором будет вызвана функция callback.
			 */
			init: function(callback, scope) {
				this.registerMessages();
				this.subscribeMessages();
				this.initStepCollection();
				this.on("change:currentStep", this.selectStep, this);
				var sandbox = this.sandbox;
				var config = sandbox.publish("GetConfig", null, [this.sandbox.id]);
				if (config) {
					this.onUpdateHeader(config);
				}
				callback.call(scope);
			},

			/**
			 * Подписывается на сообщения.
			 * @protected
			 * @virtual
			 */
			subscribeMessages: function() {
				var sandbox = this.sandbox;
				sandbox.subscribe("UpdateConfig", function(headerConfig) {
					if (headerConfig) {
						this.onUpdateHeader(headerConfig);
					}
				}, this, [sandbox.id]);
			},

			/**
			 * Обрабатывает получение конфигурационной информации от мастера.
			 * @protected
			 * @virtual
			 * @param {Object} config Конфигурационный объект мастера.
			 */
			onUpdateHeader: function(config) {
				if (!config) {
					return;
				}
				config = Terrasoft.deepClone(config);
				if (config.steps) {
					this.loadSteps(config.steps);
				}
				delete config.steps;
				this.updateHeader(config);
				this.selectStep();
			},

			/**
			 * Обновляет шаги.
			 * @protected
			 * @virtual
			 * @param {Object} config Конфигурационный объект мастера.
			 */
			updateHeader: function(config) {
				Terrasoft.each(config, function(value, name) {
					this.set(name, value);
				}, this);
			},

			/**
			 * Загружает шаги в коллекцию.
			 * @protected
			 * @virtual
			 * @param {Array} steps Массив шагов.
			 */
			loadSteps: function(steps) {
				var stepCollection = this.get("StepCollection");
				stepCollection.clear();
				var tempCollection = this.getStepCollection(steps);
				stepCollection.loadAll(tempCollection);
			},

			/**
			 * Создает шаг как элемент коллекции.
			 * @protected
			 * @virtual
			 * @param {Object} config Конфигурационный объект шага.
			 */
			createCollectionItem: function(config) {
				var stepCollection = this.get("StepCollection");
				return stepCollection.createItem(config);
			},

			/**
			 * Возвращает коллекцию шагов.
			 * @protected
			 * @virtual
			 * @param {Object[]} steps Массив шагов.
			 * @param {String} groupName Имя группы.
			 */
			getStepCollection: function(steps, groupName) {
				var tempCollection = Ext.isEmpty(groupName)
					? this.Ext.create("Terrasoft.Collection")
					: this.Ext.create("Terrasoft.WizardStepCollection");
				var filteredArray = Ext.Array.filter(steps, function(item) {
					return (item.groupName === groupName) ||
						(Ext.isEmpty(item.groupName) && Ext.isEmpty(groupName));
				}, this);
				filteredArray.forEach(function(item) {
					var itemKey = item.name;
					item = Ext.apply({}, item, {
						"Id": itemKey,
						"Caption": item.caption,
						"ImageConfig": item.imageConfig,
						"Tag": itemKey,
						"Click": {bindTo: "click"}
					});
					var subItems = this.getStepCollection(steps, itemKey);
					Ext.apply(item, {
						StepCollection: subItems
					});
					var collectionItem = this.createCollectionItem(item);
					collectionItem.sandbox = this.sandbox;
					tempCollection.add(itemKey, collectionItem);
				}, this);
				return tempCollection;
			},

			/**
			 * Иницилизирует коллекцию шагов.
			 * @protected
			 * @virtual
			 */
			initStepCollection: function() {
				var stepCollection = this.Ext.create("Terrasoft.WizardStepCollection");
				stepCollection.on("itemClick", this.itemClick, this);
				stepCollection.on("itemSelect", this.onItemSelect, this);
				this.set("StepCollection", stepCollection);
			},

			/**
			 * Иницилизирует выбранный шаг.
			 * @protected
			 * @virtual
			 */
			selectStep: function() {
				var stepCollection = this.get("StepCollection");
				var selectedItemName = this.get("currentStep");
				var selectedItem = null;
				if (selectedItemName) {
					if (stepCollection.contains(selectedItemName)) {
						selectedItem = stepCollection.get(selectedItemName);
					} else {
						stepCollection.each(function(item) {
							var stepCollection = item.get("StepCollection");
							if (stepCollection &&
								!stepCollection.isEmpty() &&
								stepCollection.contains(selectedItemName)) {
								selectedItem = item;
								return false;
							}
						}, this);
					}
				} else {
					selectedItem = stepCollection.getByIndex(0);
				}
				if (selectedItem) {
					selectedItem.select();
				}
			},

			/**
			 * Обрабатывает нажатие на кнопку предыдущий.
			 * @protected
			 * @virtual
			 */
			previous: function() {
				var stepCollection = this.get("StepCollection");
				stepCollection.previous();
			},

			/**
			 * Обрабатывает нажатие на кнопку следующий.
			 * @protected
			 * @virtual
			 */
			next: function() {
				var stepCollection = this.get("StepCollection");
				stepCollection.next();
			},

			/**
			 * Обрабатывает нажатие на кнопку шага.
			 * @protected
			 * @virtual
			 * @param {String} clickedStep Имя нажатого шага.
			 */
			itemClick: function(clickedStep) {
				var currentStep = this.get("currentStep");
				if ((currentStep !== clickedStep)) {
					this.sandbox.publish("CurrentStepChange", clickedStep, [this.sandbox.id]);
				}
			},

			/**
			 * Обрабатывает событие выделения шага.
			 * @protected
			 * @virtual
			 * @param {String} selectedItemName Имя выбранного шага.
			 */
			onItemSelect: function(selectedItemName) {
				var stepCollection = this.get("StepCollection");
				stepCollection.each(function(step) {
					if (step.get("name") !== selectedItemName) {
						step.unSelect();
					}
				}, this);
				this.setArrowsState();
			},

			/**
			 * Устанавливает состояние кнопок предыдущий и следующий.
			 * @protected
			 * @virtual
			 */
			setArrowsState: function() {
				var stepCollection = this.get("StepCollection");
				var index = stepCollection.getCurrentItemIndex();
				this.set("arrowLeftEnabled", index !== 0);
				var length = stepCollection.getCount();
				this.set("arrowRightEnabled", length - 1 !== index);
			},

			/**
			 * Обрабатывает нажатие на кнопку Сохранить. Публикует сообщение.
			 * @protected
			 * @virtual
			 */
			saveButtonClick: function() {
				this.sandbox.publish("SaveWizard", null, [this.sandbox.id]);
			},

			/**
			 * Обрабатывает нажатие на кнопку Отменить. Публикует сообщение.
			 * @protected
			 * @virtual
			 */
			cancelButtonClick: function() {
				this.sandbox.publish("CancelWizard", null, [this.sandbox.id]);
			},

			/**
			 * Возвращает текущий шаг.
			 * @protected
			 * @virtual
			 * @return {Object} Конфигурационный объект шага.
			 */
			getCurrentStep: function() {
				var stepCollection = this.get("StepCollection");
				var currentItemId = this.get("currentStep");
				var currentItem = null;
				if (currentItemId) {
					if (stepCollection.contains(currentItemId)) {
						currentItem = stepCollection.get(currentItemId);
					} else {
						stepCollection.each(function(item) {
							var stepCollection = item.get("StepCollection");
							if (stepCollection && !stepCollection.isEmpty() &&
								stepCollection.contains(currentItemId)) {
								currentItem = item;
								return false;
							}
						}, this);
					}
				}
				return currentItem;
			},

			/**
			 * Выполняет необходимые операции после отображениея представления.
			 * @protected
			 * @virtual
			 */
			onRender: function() {
			},

			/**
			 * Деструктор класса.
			 * @private
			 */
			destroy: function() {
				if (this.messages) {
					var messages = Terrasoft.keys(this.messages);
					this.sandbox.unRegisterMessages(messages);
				}
				this.callParent(arguments);
			}
		});

		/**
		 * @class Terrasoft.configuration.WizardHeaderViewConfig
		 * Класс генерирующий конфигурацию представления верхней панели мастера.
		 */
		Ext.define("Terrasoft.configuration.WizardHeaderViewConfig", {
			extend: "Terrasoft.BaseObject",
			alternateClassName: "Terrasoft.WizardHeaderViewConfig",

			/**
			 * Генерирует конфигурацию верхней панели мастера.
			 * @returns {Object[]} Возвращает конфигурацию представления верхней панели мастера.
			 */
			generate: function() {
				var itemsConfig = [];
				itemsConfig.push({
					"name": "WizardContainer",
					"wrapClass": ["wizard-container"],
					"itemType": Terrasoft.ViewItemType.CONTAINER,
					"items": [{
						"name": "HeaderCaptionContainer",
						"itemType": Terrasoft.ViewItemType.CONTAINER,
						"wrapClass": ["header"],
						"items": [{
							"itemType": Terrasoft.ViewItemType.LABEL,
							"name": "HeaderCaption",
							"labelConfig": {
								classes: ["header-label", "header-section-caption-class"]
							},
							"caption": {bindTo: "caption"}
						}]
					}, {
						"name": "UtilsContainer",
						"itemType": Terrasoft.ViewItemType.CONTAINER,
						"wrapClass": ["utils"],
						"items": [{
							"name": "utilsLeftContainer",
							"itemType": Terrasoft.ViewItemType.CONTAINER,
							"wrapClass": ["utils-left"],
							"items": [{
								itemType: Terrasoft.ViewItemType.BUTTON,
								style: Terrasoft.controls.ButtonEnums.style.GREEN,
								name: "SaveButton",
								caption: {bindTo: "Resources.Strings.SaveButtonCaption"},
								classes: {
									textClass: ["utils-button"],
									wrapperClass: ["utils-button"]
								},
								click: {bindTo: "saveButtonClick"}
							}, {
								itemType: Terrasoft.ViewItemType.BUTTON,
								name: "CancelButton",
								caption: {bindTo: "Resources.Strings.CancelButtonCaption"},
								classes: {
									textClass: ["utils-button"],
									wrapperClass: ["utils-button"]
								},
								click: {bindTo: "cancelButtonClick"}
							}]
						}, {
							"name": "utilsRightContainer",
							"itemType": Terrasoft.ViewItemType.CONTAINER,
							"wrapClass": ["utils-right"],
							"items": [{
								itemType: Terrasoft.ViewItemType.BUTTON,
								name: "PreviousButton",
								imageConfig: {bindTo: "Resources.Images.ArrowLeft"},
								classes: {
									textClass: ["utils-button"],
									wrapperClass: ["utils-button"]
								},
								click: {bindTo: "previous"},
								enabled: {bindTo: "arrowLeftEnabled"}
							}, {
								"name": "DataGrid",
								"idProperty": "Id",
								"collection": {"bindTo": "StepCollection"},
								"classes": {wrapClassName: ["wizard-steps-collection"]},
								"generator": "ContainerListGenerator.generatePartial",
								"itemType": Terrasoft.ViewItemType.GRID,
								"itemConfig": [{
									itemType: Terrasoft.ViewItemType.BUTTON,
									name: "StepButton",
									caption: {bindTo: "caption"},
									imageConfig: {bindTo: "imageConfig"},
									click: {bindTo: "click"},
									classes: {
										textClass: ["utils-button"],
										wrapperClass: ["utils-button"]
									},
									pressed: {bindTo: "isSelected"},
									controlConfig: {"menu": {"items": {"bindTo": "StepCollection"}}}
								}]
							}, {
								itemType: Terrasoft.ViewItemType.BUTTON,
								name: "NextButton",
								imageConfig: {bindTo: "Resources.Images.ArrowRight"},
								classes: {
									textClass: ["utils-button"],
									wrapperClass: ["utils-button"]
								},
								click: {bindTo: "next"},
								enabled: {bindTo: "arrowRightEnabled"}
							}]
						}]
					}]

				});
				return itemsConfig;
			}
		});

		/**
		 * @class Terrasoft.configuration.WizardHeaderModule
		 * Класс визуального модуля верхней панели мастера.
		 */
		var WizardHeaderModule = Ext.define("Terrasoft.configuration.WizardHeaderModule", {
			extend: "Terrasoft.BaseNestedModule",
			alternateClassName: "Terrasoft.WizardHeaderModule",

			Ext: null,

			sandbox: null,

			Terrasoft: null,

			showMask: true,

			/**
			 * Корневой элемент представления верхней панели мастера.
			 * @private
			 * @type {Ext.Element}
			 */
			renderContainer: null,

			/**
			 * Объект конфигурации модуля.
			 * @type {Object}
			 */
			moduleConfig: null,

			/**
			 * Имя класса модели представления верхней панели.
			 * @type {String}
			 */
			viewModelClassName: "Terrasoft.WizardHeaderViewModel",

			/**
			 * Имя класа генератога конфигурации представления верхней панели.
			 * @type {String}
			 */
			viewConfigClassName: "Terrasoft.WizardHeaderViewConfig",

			/**
			 * Имя класа генератога представления.
			 * @type {String}
			 */
			viewGeneratorClass: "Terrasoft.ViewGenerator",

			/**
			 * @inheritDoc Terrasoft.configuration.BaseSchemaModule#render
			 * @overridden
			 */
			render: function(renderTo) {
				this.callParent(arguments);
				this.renderContainer = renderTo;
			},

			/**
			 * Создает экземпляр класса Terrasoft.ViewGenerator.
			 * @return {Terrasoft.ViewGenerator} Возвращает объект Terrasoft.ViewGenerator.
			 */
			createViewGenerator: function() {
				return this.Ext.create(this.viewGeneratorClass);
			},

			/**
			 * Создает конфигурацию представления верхней панели.
			 * @protected
			 * @virtual
			 * param {Object} config Объект конфигурации.
			 * param {Function} callback Функция обратного вызова.
			 * param {Terrasoft.BaseModel} scope Контекст выполнения функции обратного вызова.
			 * @return {Object[]} Возвращает конфигурацию представления верхней панели.
			 */
			buildView: function(config, callback, scope) {
				var viewGenerator = this.createViewGenerator();
				var viewClass = this.Ext.create(this.viewConfigClassName);
				var schema = {
					viewConfig: viewClass.generate()
				};
				var viewConfig = Ext.apply({
					schema: schema
				}, config);
				viewGenerator.generate(viewConfig, callback, scope);
			},

			/**
			 * @inheritDoc Terrasoft.configuration.BaseNestedModule#initViewConfig
			 * @overridden
			 */
			initViewConfig: function(callback, scope) {
				var generatorConfig = {};
				generatorConfig.viewModelClass = this.viewModelClass;
				this.buildView(generatorConfig, function(view) {
					this.viewConfig = view[0];
					callback.call(scope);
				}, this);
			},

			/**
			 * @inheritDoc Terrasoft.configuration.BaseNestedModule#initViewModelClass
			 * @overridden
			 */
			initViewModelClass: function(callback, scope) {
				this.viewModelClass = Ext.ClassManager.get(this.viewModelClassName);
				callback.call(scope);
			},

			/**
			 * @inheritDoc Terrasoft.configuration.BaseNestedModule#getViewModelConfig
			 * @overridden
			 */
			getViewModelConfig: function() {
				var config = this.callParent(arguments);
				config.values = Ext.apply({}, this.moduleConfig);
				return config;
			}
		});
		return WizardHeaderModule;
	});
