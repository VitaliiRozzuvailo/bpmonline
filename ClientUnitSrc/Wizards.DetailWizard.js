define("DetailWizard", ["ext-base", "terrasoft", "DetailWizardResources", "BaseWizardModule",
		"SysModuleEntityManager", "SysModuleEditManager", "DetailManager", "WizardUtilities", "PackageUtilities"],
	function(Ext, Terrasoft, resources) {

		var localizableStrings = resources.localizableStrings;

		/**
		 * @class Terrasoft.configuration.ViewModule
		 * Класс визуального модуля представления для мастера детали.
		 */
		Ext.define("Terrasoft.configuration.DetailWizard", {
			extend: "Terrasoft.BaseWizardModule",
			alternateClassName: "Terrasoft.DetailWizard",

			mixins: {

				WizardUtilities: "Terrasoft.WizardUtilities",

				PackageUtilities: "Terrasoft.PackageUtilities"

			},

			//region Properties: Private

			/**
			 * Уникальный идентификатор детали.
			 * @private
			 * @type {String}
			 */
			detailId: null,

			/**
			 * Элемент менеджера деталей.
			 * @private
			 * @type {Terrasoft.DetailManagerItem}
			 */
			detailManagerItem: null,

			/**
			 * Нажатый шаг.
			 * @private
			 * @type {String}
			 */
			clickedStep: null,

			/**
			 * Список шагов по настройке страниц.
			 * @private
			 * @type {Array}
			 */
			pagesSteps: [],

			//endregion

			//region Methods: Protected

			/**
			 * @inheritdoc Terrasoft.BaseWizardModule#init
			 * @overridden
			 */
			init: function(callback, scope) {
				this.callParent([function() {
					Terrasoft.chain(
						this.canUseWizard,
						function(next, canUseWizard) {
							if (canUseWizard) {
								next();
							} else {
								var message = localizableStrings.RightsErrorMessage;
								this.showWizardError(message);
							}
						},
						this.initPackageUtilities,
						function() {
							Terrasoft.DetailManager.initialize(null, callback, scope);
						},
						this
					);
				}, this]);
			},

			getMessages: function() {
				var parentMessages = this.callParent(arguments);
				return Ext.apply(parentMessages, {
					"ReplaceHistoryState": {
						mode: Terrasoft.MessageMode.BROADCAST,
						direction: Terrasoft.MessageDirectionType.PUBLISH
					},
					"GetModuleConfig": {
						mode: Terrasoft.MessageMode.PTP,
						direction: Terrasoft.MessageDirectionType.SUBSCRIBE
					},
					"GetModuleConfigResult": {
						mode: Terrasoft.MessageMode.PTP,
						direction: Terrasoft.MessageDirectionType.PUBLISH
					},
					"Validate": {
						mode: Terrasoft.MessageMode.PTP,
						direction: Terrasoft.MessageDirectionType.PUBLISH
					},
					"ValidationResult": {
						mode: Terrasoft.MessageMode.PTP,
						direction: Terrasoft.MessageDirectionType.SUBSCRIBE
					},
					"Save": {
						mode: Terrasoft.MessageMode.PTP,
						direction: Terrasoft.MessageDirectionType.PUBLISH
					},
					"SavingResult": {
						mode: Terrasoft.MessageMode.PTP,
						direction: Terrasoft.MessageDirectionType.SUBSCRIBE
					},
					"GetPackageUId": {
						mode: Terrasoft.MessageMode.PTP,
						direction: Terrasoft.MessageDirectionType.SUBSCRIBE
					},
					"UpdateWizardConfig": {
						mode: Terrasoft.MessageMode.PTP,
						direction: Terrasoft.MessageDirectionType.SUBSCRIBE
					}
				});
			},
			/**
			 * Инициавлизирует миксин работы с пакетами.
			 * @protected
			 * @overridden
			 * @param {Function} callback Функция, которая будет вызвана по завершению.
			 * @param {Object} scope Контекст, в котором будет вызвана функция callback.
			 */
			initPackageUtilities: function(callback, scope) {
				Terrasoft.chain(
					this.mixins.PackageUtilities.init.bind(this),
					function(next, result) {
						if (!result.success) {
							this.showWizardError(result.message);
						} else {
							if (result.message) {
								Terrasoft.utils.showMessage({
									caption: result.message,
									buttons: ["ok"],
									defaultButton: 0
								});
							}
							next();
						}
					},
					function() {
						callback.call(scope);
					},
					this
				);
			},

			/**
			 * Подписывается на сообщения.
			 * @protected
			 * @virtual
			 */
			subscribeMessages: function() {
				this.callParent(arguments);
				var sandbox = this.sandbox;
				var mainPageHeaderId = this.getModuleIdByStepName("MainSettings");
				sandbox.subscribe("UpdateWizardConfig", this.onUpdateWizardConfig, this, [mainPageHeaderId]);
			},

			/**
			 * Модифицирует конфигурационный объект шагов. Публикует сообщение для верхней панели.
			 * @protected
			 * @virtual
			 */
			onUpdateWizardConfig: function() {
				this.initEntitySchemaPages(function() {
					var config = this.onGetConfig();
					delete config.caption;
					this.sandbox.publish("UpdateConfig", config, [this.getWizardHeaderId()]);
				}, this);
			},

			/**
			 * @inheritdoc Terrasoft.BaseWizardModule#onGetConfig
			 * @overridden
			 */
			onGetConfig: function() {
				var config = {
					caption: this.getCaption() || this.getNewDetailWizardCaption(),
					currentStep: this.currentStep,
					steps: this.getSteps()
				};
				return config;
			},

			/**
			 * Возвращает массив конфигурационных объектов шагов.
			 * @abstract
			 * @return {Array}  Массив конфигурационных объектов шагов.
			 */
			getSteps: function() {
				var baseSteps = [{
					name: "MainSettings",
					caption: localizableStrings.MainSettingsStepCaption,
					imageConfig: null,
					moduleName: "ConfigurationModuleV2",
					schemaName: "DetailMainSettings"
				}, {
					name: "PageDesigner",
					caption: localizableStrings.PageDesignerStepCaption,
					imageConfig: null,
					moduleName: "ViewModelSchemaDesignerModule"
				}];
				return baseSteps.concat(this.pagesSteps);
			},

			/**
			 * Возвращает заголовок новой детали.
			 * @protected
			 * @virtual
			 * @return {String} Заголовок новой детали.
			 */
			getNewDetailWizardCaption: function() {
				return localizableStrings.NewDetailWizardCaption;
			},

			/**
			 * Возвращает заголовок детали.
			 * @protected
			 * @virtual
			 * @return {String} Заголовок детали.
			 */
			getCaption: function() {
				var wizardCaption = (this.detailManagerItem && this.detailManagerItem.getCaption()) ?
					this.detailManagerItem.getCaption() :
					this.getNewDetailWizardCaption();
				var stepCaption = this.generateStepCaption();
				return Ext.String.format("{0}: {1}", wizardCaption, stepCaption);
			},

			/**
			 * Генерирует заголовок шага.
			 * @protected
			 * @virtual
			 * @return {String} Заголовок шага.
			 */
			generateStepCaption: function() {
				var currentStepName = this.currentStep;
				var caption = Ext.emptyString;
				var currentStep = this.getStepConfigByName(currentStepName);
				if (!currentStep) {
					return caption;
				}
				if (currentStep.name && currentStep.name === "MainSettings") {
					caption = localizableStrings.MainSettingsCaption;
				} else if (currentStep.name && currentStep.name === "PageDesigner") {
					caption = currentStep.caption;
				} else if (currentStep.groupName && currentStep.groupName === "PageDesigner") {
					var currentGroup = this.getStepConfigByName(currentStep.groupName);
					caption = Ext.String.format("{0} {1}", currentGroup.caption, currentStep.caption);
				}
				return caption;
			},

			/**
			 * @inheritdoc Terrasoft.BaseWizardModule#onCurrentStepChange
			 * @overridden
			 */
			onCurrentStepChange: function(stepName) {
				var moduleId = this.getModuleIdByStepName(this.currentStep);
				this.clickedStep = stepName;
				this.sandbox.publish("Validate", null, [moduleId]);
				return true;
			},

			/**
			 * Подписывается на сообщения текущего модуля.
			 * @protected
			 * @virtual
			 */
			subscribeModuleMessages: function() {
				var sandbox = this.sandbox;
				var step = this.currentStep;
				var moduleId = this.getModuleIdByStepName(step);
				sandbox.subscribe("SavingResult", this.onSavingResult, this, [moduleId]);
				sandbox.subscribe("ValidationResult", this.onValidationResult, this, [moduleId]);
				sandbox.subscribe("GetPackageUId", this.getPackageUId, this, [moduleId]);
				sandbox.subscribe("GetModuleConfig", this.getModuleConfig, this, [moduleId]);
			},

			/**
			 * Публикует конфигурационный объект модуля.
			 * @protected
			 * @virtual
			 */
			getModuleConfig: function() {
				switch (this.currentStep) {
					case "MainSettings":
						this.getMainSettingsConfig(this.publishModuleConfig, this);
						break;
					case "PageDesigner":
						this.getPageDesignerConfig(this.publishModuleConfig, this);
						break;
					default:
						break;
				}
				var curentStep = this.getStepConfigByName(this.currentStep);
				if (curentStep.groupName === "PageDesigner") {
					this.getPageDesignerConfig(this.publishModuleConfig, this);
				}
			},

			/**
			 * Публикует конфигурационный объект модуля.
			 * @protected
			 * @virtual
			 * @param {Object} config Конфигурационный объект модуля.
			 */
			publishModuleConfig: function(config) {
				var moduleId = this.getModuleIdByStepName(this.currentStep);
				this.sandbox.publish("GetModuleConfigResult", config, [moduleId]);
			},

			/**
			 * Обрабатывает изменение шага.
			 * @protected
			 * @virtual
			 * @param {String} step Имя шага.
			 * @return Конфигурационный объект шапки.
			 */
			onStepChanged: function(step) {
				this.currentStep = step;
				var detailId = this.detailId;
				var newHash = this.Terrasoft.combinePath(this.currentStep, detailId);
				this.sandbox.publish("PushHistoryState", {
					hash: newHash,
					state: {
						moduleId: this.getModuleIdByStepName(step)
					}
				});
			},

			/**
			 * Генерирует идентификатор мадуля.
			 * @protected
			 * @virtual
			 * @param {String} moduleName Имя модуля.
			 * @param {Object} currentState Текущее состояние.
			 */
			generateModuleId: function(moduleName, currentState) {
				var stepName = currentState.hash && currentState.hash.moduleName;
				return this.getModuleIdByStepName(stepName);
			},

			/**
			 * Возвращает уникальный идентификатор модуля по имени шага.
			 * @protected
			 * @virtual
			 * @param {String} stepName Имя шага.
			 */
			getModuleIdByStepName: function(stepName) {
				var stepConfig = this.getStepConfigByName(stepName);
				var moduleName = (stepConfig.schemaName) ? stepConfig.schemaName : stepConfig.moduleName;
				var result = moduleName + "_" + stepConfig.name;
				return result;
			},

			/**
			 * Обрабатывает изменение состояния. Модифицирует URL, при необходимости. Подменяет состояние,
			 * подставляя необходимый модуль для загрузки.
			 * @protected
			 * @overriden
			 * @param {Object} token Объект нового состояния браузера.
			 */
			loadModuleFromHistoryState: function(token) {
				if (this.needUrlModification(token)) {
					this.modifyUrl();
					return;
				}
				this.setStep(token);
				this.subscribeModuleMessages();
				this.callParent([this.modifyStateToDefault(token)]);
			},

			/**
			 * Устанавливает шаг мастера.
			 * @protected
			 * @virtual
			 * @param {Object} state Текущее состояние.
			 */
			setStep: function(state) {
				var currentStateHash = state.hash;
				var moduleName = currentStateHash.moduleName;
				var entityName = currentStateHash.entityName;
				if (moduleName && this.isStepName(moduleName) && Terrasoft.isGUID(entityName)) {
					this.currentStep = moduleName;
					this.detailId = entityName.toLowerCase();
					this.updateHeader({
						currentStep: this.currentStep,
						caption: this.getCaption()
					});
					this.setDetailManagerItem();
				}
			},

			/**
			 * Обрабатывает сообщение о сохранении модуля.
			 * @protected
			 * @virtual
			 */
			onSavingResult: function() {
				if (this.isSavingWizard) {
					this.saveWizard();
				} else {
					this.onStepChanged(this.clickedStep);
				}
			},

			/**
			 * Обрабатывает сообщение о результате валидации модуля.
			 * @protected
			 * @virtual
			 * @param {Boolean} result Результате валидации модуля.
			 */
			onValidationResult: function(result) {
				var step = this.currentStep;
				var moduleId = this.getModuleIdByStepName(step);
				if (result) {
					this.sandbox.publish("Save", null, [moduleId]);
				}
			},

			/**
			 * Проверяет необходимость модифицировать хеш.
			 * @protected
			 * @virtual
			 */
			needUrlModification: function(currentState) {
				var currentStateHash = currentState.hash;
				var moduleName = currentStateHash.moduleName;
				return (!moduleName || Terrasoft.isGUID(moduleName) || moduleName === "New");
			},

			/**
			 * Модифицирует хеш и преходит.
			 * @protected
			 * @virtual
			 */
			modifyUrl: function() {
				var detailId = this.getDetailIdFromHistoryState() || Terrasoft.generateGUID();
				var currentStep = this.getStepFromHistoryState();
				if (detailId && currentStep) {
					var newHash = this.Terrasoft.combinePath(currentStep, detailId);
					this.sandbox.publish("PushHistoryState", {
						hash: newHash,
						state: {
							moduleId: this.getModuleIdByStepName(currentStep)
						}
					});
				}
			},

			/**
			 * Модифицирует HistoryState и изменяет.
			 * @protected
			 * @virtual
			 */
			modifyStateToDefault: function(currentState) {
				var currentStateHash = currentState.hash;
				var stepName = currentStateHash.moduleName;
				var stepConfig = this.getStepConfigByName(stepName);
				if (!stepConfig) {
					return currentState;
				}
				var schemaName = stepConfig.schemaName;
				var moduleName = stepConfig.moduleName;
				var stateObj = {
					schemaName: schemaName,
					moduleId: this.getModuleIdByStepName(stepName)
				};
				var historyState = (schemaName)
					? this.Terrasoft.combinePath(moduleName, schemaName)
					: this.Terrasoft.combinePath(moduleName);
				var replacedToken = {
					hash: currentStateHash.historyState,
					stateObj: {
						designerSchemaName: schemaName
					},
					silent: true,
					state: null
				};
				this.sandbox.publish("ReplaceHistoryState", replacedToken);
				var modifiedToken = {
					hash: {
						entityName: schemaName,
						moduleName: moduleName,
						historyState: historyState
					},
					stateObj: stateObj,
					state: {
						designerSchemaName: stepConfig.schemaName || null
					}
				};
				return modifiedToken;
			},

			/**
			 * Возвращает идентификатор детали из HistoryState.
			 * @protected
			 * @virtual
			 * @return {String} Идентификатор детали.
			 */
			getDetailIdFromHistoryState: function() {
				var state = this.sandbox.publish("GetHistoryState");
				var stateHash = state.hash;
				var detailId = null;
				if (Terrasoft.isGUID(stateHash.moduleName)) {
					detailId = stateHash.moduleName;
				} else if (Terrasoft.isGUID(stateHash.schemaName)) {
					detailId = stateHash.schemaName;
				}
				return detailId;
			},

			/**
			 * Возвращает шаг из HistoryState.
			 * @protected
			 * @virtual
			 * @return {String} Имя шага.
			 */
			getStepFromHistoryState: function() {
				var currentState = this.sandbox.publish("GetHistoryState");
				var currentStateHash = currentState.hash;
				var moduleName = currentStateHash.moduleName;
				var entityName = currentStateHash.entityName;
				var currentStep;
				if (!moduleName || Terrasoft.isGUID(moduleName) || moduleName === "New") {
					currentStep = this.getDefaultStepName();
				} else if (moduleName && this.isStepName(moduleName) && Terrasoft.isGUID(entityName)) {
					currentStep = moduleName;
				}
				return currentStep;
			},

			/**
			 * Возвращает имя шага по-умолчанию.
			 * @protected
			 * @virtual
			 * @return {String} Имя шага по-умолчанию.
			 */
			getDefaultStepName: function() {
				return "MainSettings";
			},

			/**
			 * Возвращает конфигурационный объект по имени шага.
			 * @protected
			 * @virtual
			 * @return {Object} Конфигурационный объект шага.
			 */
			getStepConfigByName: function(stepName) {
				var steps = this.getSteps();
				var result = null;
				Terrasoft.each(steps, function(step) {
					if (step.name === stepName) {
						result = step;
						return false;
					}
				}, this);
				return result;
			},

			/**
			 * Публикует сообщение верхней панели, для изменения текущего шага.
			 * @protected
			 * @virtual
			 * @param {Object} config Конфигурационный объект шага.
			 */
			updateHeader: function(config) {
				this.sandbox.publish("UpdateConfig", config, [this.getWizardHeaderId()]);
			},

			/**
			 * Устанавливает элемент менеджера деталей.
			 * @protected
			 * @virtual
			 */
			setDetailManagerItem: function() {
				var detail = Terrasoft.DetailManager.findItem(this.detailId);
				if (!detail) {
					var config = {
						propertyValues: {
							id: this.detailId,
							caption: null,
							entitySchemaUId: null
						}
					};
					Terrasoft.DetailManager.createItem(config, function(item) {
						this.detailManagerItem = Terrasoft.DetailManager.addItem(item);
					}, this);
				} else {
					this.detailManagerItem = detail;
				}
				this.initEntitySchemaPages();
			},

			/**
			 * Возвращает элемент менеджера страниц схем раздела для текущего шага.
			 * @public
			 * @param {Terrasoft.SysModuleEntityManagerItem} sysModuleEntityManagerItem Функция обратного вызова.
			 * @param {Function} callback Функция обратного вызова.
			 * @param {Object} scope Контекст вызова callback-функции.
			 * @return {Terrasoft.SysModuleEditManagerItem} Схема страницы.
			 */
			getActiveStepSysModuleEditItem: function(sysModuleEntityManagerItem, callback, scope) {
				Terrasoft.chain(
					function(next) {
						sysModuleEntityManagerItem.getSysModuleEditManagerItems(next, this);
					},
					function(next, sysModuleEditManagerItems) {
						var curentStep = this.getStepConfigByName(this.currentStep);
						var editManagerItem = null;
						var currentPageId = curentStep.id;
						if (currentPageId) {
							editManagerItem = sysModuleEditManagerItems.get(currentPageId);
						}
						if (!editManagerItem) {
							editManagerItem = sysModuleEditManagerItems.getByIndex(0);
						}
						callback.call(scope, editManagerItem);
					},
					this
				);
			},

			/**
			 * Возвращает объект содержащий экземпляр DetailManagerItem.
			 * @public
			 * @param {Function} callback Функция обратного вызова.
			 * @param {Object} scope Контекст вызова callback-функции.
			 * @return {Object} result Объект содержащий экземпляры DetailManagerItem.
			 * @return {Terrasoft.DetailManagerItem} result.detailManagerItem Объект класса DetailManagerItem.
			 */
			getMainSettingsConfig: function(callback, scope) {
				var result = {detailManagerItem: this.detailManagerItem};
				callback.call(scope, result);
			},

			/**
			 * Получает страницы объекта. Устанавливает конфигурационные объекты для каждой из страниц в массив шагов.
			 * @protected
			 * @virtual
			 * @param {Function} callback Функция обратного вызова.
			 * @param {Object} scope Контекст вызова callback-функции.
			 */
			initEntitySchemaPages: function(callback, scope) {
				Terrasoft.chain(
					function(next) {
						if (this.detailManagerItem) {
							this.detailManagerItem.getSysModuleEntityManagerItem(next, this);
						} else {
							next();
						}
					},
					function(next, sysModuleEntityManagerItem) {
						if (sysModuleEntityManagerItem) {
							sysModuleEntityManagerItem.getSysModuleEditManagerItems(next, this);
						} else {
							next();
						}
					},
					function(next, sysModuleEditManagerItems) {
						var pagesSteps = this.pagesSteps = [];
						if (sysModuleEditManagerItems && sysModuleEditManagerItems.getCount() >= 2) {
							sysModuleEditManagerItems.each(function(sysModuleEditManagerItem) {
								pagesSteps.push({
									id: sysModuleEditManagerItem.getId(),
									name: sysModuleEditManagerItem.getActionKindName() + "Page",
									caption: sysModuleEditManagerItem.getPageCaption(),
									groupName: "PageDesigner",
									moduleName: "ViewModelSchemaDesignerModule"
								});
							}, this);
						}
						if (callback) {
							callback.call(scope);
						}
					},
					this
				);
			},

			/**
			 * Добавляет схему в менеджеры.
			 * @protected
			 * @virtual
			 * @param {Object} changes Объект изменений.
			 * @param {Terrasoft.EntitySchemaManagerItem} managerItem Элемент менеджера.
			 */
			addEntitySchemaToManager: function(changes, managerItem) {
				Terrasoft.EntitySchemaManager.addSchema(managerItem);
				managerItem.un("changed", this.addEntitySchemaToManager, this);
			},

			/**
			 * Генерирует и возвращает тело страницы детали.
			 * @protected
			 * @virtual
			 * @param {String} pageSchemaName Имя страницы схемы.
			 * @param {String} entitySchemaName Имя объекта.
			 * @return {String} Тело страницы детали.
			 */
			generateDetailPageBody: function(pageSchemaName, entitySchemaName) {
				var bodyTemplate =
					Terrasoft.ClientUnitSchemaBodyTemplate[Terrasoft.SchemaType.EDIT_VIEW_MODEL_SCHEMA];
				return Ext.String.format(bodyTemplate, pageSchemaName, entitySchemaName);
			},

			/**
			 * Возвращает объект содержащий экземпляры entity и клиентских схем для инициализации дизайнера страницы.
			 * @public
			 * @param {Function} callback Функция обратного вызова.
			 * @param {Object} scope Контекст вызова callback-функции.
			 * @return {Object} result Объект содержащий экземпляры entity и клиентских схем для инициализации дизайнера
			 * @return {Terrasoft.EntitySchema} result.entitySchema Объект класса entity-схемы.
			 * @return {Terrasoft.ClientUnitSchema} result.clientUnitSchema Объект класса клиентской схемы.
			 */
			getPageDesignerConfig: function(callback, scope) {
				var result = {};
				Terrasoft.chain(
					function(next) {
						this.detailManagerItem.getSysModuleEntityManagerItem(next, this);
					},
					function(next, sysModuleEntityManagerItem) {
						this.sysModuleEntityManagerItem = sysModuleEntityManagerItem;
						var getPackageSchemaConfig = {
							packageUId: this.packageUId,
							schemaUId: sysModuleEntityManagerItem.getEntitySchemaUId()
						};
						Terrasoft.EntitySchemaManager.forceGetPackageSchema(getPackageSchemaConfig,
							next, this);
					},
					function(next, entitySchema) {
						var entitySchemaUId = entitySchema.getPropertyValue("uId");
						if (!Terrasoft.EntitySchemaManager.contains(entitySchemaUId)) {
							if (entitySchema.extendParent) {
								entitySchema.on("changed", this.addEntitySchemaToManager, this);
							} else {
								Terrasoft.EntitySchemaManager.addSchema(entitySchema);
							}
						}
						next(entitySchema);
					},
					function(next, entitySchema) {
						result.entitySchema = entitySchema;
						next(result);
					},
					function(next) {
						var sysModuleEntityManagerItem = this.sysModuleEntityManagerItem;
						this.getActiveStepSysModuleEditItem(sysModuleEntityManagerItem, next, this);
					},
					function(next, sysModuleEditManagerItem) {
						var getPackageSchemaConfig = {
							packageUId: this.packageUId,
							schemaUId: sysModuleEditManagerItem.getCardSchemaUId()
						};
						Terrasoft.ClientUnitSchemaManager.forceGetPackageSchema(getPackageSchemaConfig,
							next, this);
					},
					function(next, clientUnitSchema) {
						var clientUnitSchemaUId = clientUnitSchema.getPropertyValue("uId");
						if (!Terrasoft.ClientUnitSchemaManager.contains(clientUnitSchemaUId)) {
							var pageSchemaName = clientUnitSchema.getSchemaDefinitionName();
							var entitySchemaName = result.entitySchema.getPropertyValue("name");
							var defaultSchemaBody = this.generateDetailPageBody(pageSchemaName, entitySchemaName);
							clientUnitSchema.setPropertyValue("body", defaultSchemaBody);
							Terrasoft.ClientUnitSchemaManager.addSchema(clientUnitSchema);
							clientUnitSchema.define(function() {
								next(clientUnitSchema);
							}, this);
						} else {
							next(clientUnitSchema);
						}
					},
					function(next, clientUnitSchema) {
						result.clientUnitSchema = clientUnitSchema;
						delete this.sysModuleEntityManagerItem;
						callback.call(scope, result);
					},
					this
				);
			},

			/**
			 * Проверяет, является ли именем шага.
			 * @protected
			 * @virtual
			 * @param {String} name Имя.
			 */
			isStepName: function(name) {
				var steps = this.getSteps();
				var result = false;
				Terrasoft.each(steps, function(step) {
					if (step.name === name) {
						result = true;
						return false;
					}
				}, this);
				return result;
			},

			/**
			 * Функция обработки ответа шага сохранения мастера детали.
			 * @param {Terrasoft.BaseResponse} response Ответ сохранения шага мастера детали.
			 * @param {Function} next Функция следующего шага.
			 * @param {Function} scope Контекст вызова callback-функции.
			 */
			processSaveWizardResponse: function(response, next, scope) {
				if (response && response.success) {
					next.call(scope, response);
				} else {
					var errorMessage = response.failedItem
						? this.getSaveSchemaManagerErrorMessage(response)
						: response.errorInfo.toString();
					this.showWizardError(errorMessage);
				}
			},

			/**
			 * Возвращает сообщение ошибки сохранения менеджера схем.
			 * @param {Terrasoft.BaseResponse} managerSaveResponse Ответ сохранения менеджера схем.
			 * @return {String} Сообщение ошибки сохранения менеджера схем.
			 */
			getSaveSchemaManagerErrorMessage: function(managerSaveResponse) {
				var faildItem = managerSaveResponse.failedItem;
				var errorMessage = Ext.String.format(
					Terrasoft.Resources.Managers.Exceptions.SaveSchemaErrorTemplate, faildItem.getName(),
						faildItem.getCaption(), managerSaveResponse.errorInfo.toString());
				return errorMessage;
			},

			/**
			 * Сохраняет схемы объектов детали.
			 * @protected
			 * @virtual
			 * @param {Function} callback Функция обратного вызова.
			 * @param {Object} scope Контекст вызова callback-функции.
			 */
			saveEntitySchemesProcess: function(callback, scope) {
				var maskId;
				Terrasoft.chain(
					function(next) {
						maskId = Terrasoft.Mask.show({
							caption: localizableStrings.SavingEntitySchemasMessage
						});
						Terrasoft.EntitySchemaManager.save(function(response) {
							Terrasoft.Mask.hide(maskId);
							this.processSaveWizardResponse(response, next, this);
						}, this);
					},
					function() {
						maskId = Terrasoft.Mask.show({
							caption: localizableStrings.UpdatingDBStructureMessage
						});
						var updateDBStructureConfig = {
							packageUId: this.packageUId
						};
						Terrasoft.EntitySchemaManager.updateDBStructure(updateDBStructureConfig,
								function(updateDBStructureResponse) {
							Terrasoft.Mask.hide(maskId);
							if (updateDBStructureResponse) {
								this.processSaveWizardResponse(updateDBStructureResponse, function() {
									maskId = Terrasoft.Mask.show({
										caption: localizableStrings.CompilingMessage
									});
									Terrasoft.SchemaDesignerUtilities.buildWorkspace(
											function(response) {
										Terrasoft.Mask.hide(maskId);
										this.processSaveWizardResponse(response, callback, scope);
									}, this);
								}, this);
							} else {
								callback.call(scope);
							}
						}, this);
					},
					this
				);
			},

			/**
			 * Сохраняет клиентские схемы детали.
			 * @protected
			 * @virtual
			 * @param {Function} callback Функция обратного вызова.
			 * @param {Object} scope Контекст вызова callback-функции.
			 */
			saveClientUnitSchemesProcess: function(callback, scope) {
				var maskId;
				Terrasoft.chain(
					function(next) {
						maskId = Terrasoft.Mask.show({
							caption: localizableStrings.SavingClientUnitSchemasMessage
						});
						Terrasoft.ClientUnitSchemaManager.save(function(response) {
							Terrasoft.Mask.hide(maskId);
							this.processSaveWizardResponse(response, next, this);
						}, this);
					},
					function(next, response) {
						var savedSchemaUIds = response.items.getKeys();
						if (savedSchemaUIds.length > 0) {
							maskId = Terrasoft.Mask.show({
								caption: localizableStrings.UpdateClientUnitSchemaModuleFiles
							});
							Terrasoft.SchemaDesignerUtilities.updateClienUnitSchemasFileContent(savedSchemaUIds,
									function(response) {
								Terrasoft.Mask.hide(maskId);
								this.processSaveWizardResponse(response, callback, scope);
							}, this);
						} else {
							callback.call(scope);
						}
					},
					this
				);
			},

			/**
			 * Сохраняет регистрационные данные детали.
			 * @protected
			 * @virtual
			 * @param {String} packageUId Идентификатор пакета.
			 * @param {Function} callback Функция обратного вызова.
			 * @param {Object} scope Контекст вызова callback-функции.
			 */
			saveRegistrationDataProcess: function(packageUId, callback, scope) {
				var steps = [
					{
						manager: Terrasoft.SysModuleEntityManager,
						processMessage: localizableStrings.SchemaRegistrationMessage
					},
					{
						manager: Terrasoft.SysModuleEditManager,
						processMessage: localizableStrings.PageRegistrationMessage
					},
					{
						manager: Terrasoft.DetailManager,
						processMessage: localizableStrings.DetailRegistrationMessage
					}
				];
				var chain = [];
				Terrasoft.each(steps, function(step) {
					chain.push(function(next) {
						var maskId = Terrasoft.Mask.show({
							caption: step.processMessage
						});
						step.manager.saveAndUpdateSchemaData(packageUId, function() {
							Terrasoft.Mask.hide(maskId);
							next();
						}, this);
					});
				}, this);
				chain.push(function() {
					callback.call(scope);
				});
				chain.push(this);
				Terrasoft.chain.apply(this, chain);
			},

			/**
			 * Сохраняет деталь.
			 * @protected
			 * @virtual
			 * @param {Function} callback Функция обратного вызова.
			 * @param {Object} scope Контекст вызова callback-функции.
			 */
			saveWizard: function(callback, scope) {
				Terrasoft.chain(
					function(next) {
						this.saveEntitySchemesProcess(next, this);
					},
					function(next) {
						this.saveClientUnitSchemesProcess(next, this);
					},
					function(next) {
						this.saveRegistrationDataProcess(this.packageUId, next, this);
					},
					function() {
						this.showWizardError(localizableStrings.SavingSuccessMessage);
						if (callback) {
							callback.call(scope);
						}
					},
					this
				);
			}

			//endregion

		});

		return Terrasoft.DetailWizard;
	});
