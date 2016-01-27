/**
 * @class MobileSectionDesignerModule
 * @public
 * Модуль дизайнера разделов мобильного приложения.
 */
define("MobileSectionDesignerModule", ["terrasoft", "MobileSectionDesignerModuleResources",
	"ProcessModuleUtilities", "SectionDesignerUtils", "LookupUtilities", "MobileDesignerUtils", "LocalizableHelper",
	"EntityStructureHelperMixin", "MobileRecordDesignerSettings", "MobileGridDesignerSettings",
	"MobileActionsDesignerSettings", "css!MobileDesignerUtils"],
	function(Terrasoft, resources, ProcessModuleUtilities, SectionDesignerUtils, LookupUtilities, MobileDesignerUtils,
			LocalizableHelper) {

		/**
		 * @private
		 */
		var modelsOnInit = null;

		/**
		 * @private
		 */
		var defaultManifestModules = ["Contact", "Account", "Activity"];

		/**
		 * @private
		 */
		var maxSaveAttemptsCount = 3;

		/**
		 * @private
		 * Некоторые разделы настраиваются только через sdk, например "Итоги"
		 */
		var notConfigurableModels = ["SysDashboard"];

		return {
			attributes: {

				GridData: {
					type: Terrasoft.ViewModelColumnType.CALCULATED_COLUMN,
					dataValueType: Terrasoft.DataValueType.COLLECTION
				},

				ActiveRow: {
					type: Terrasoft.ViewModelColumnType.CALCULATED_COLUMN,
					dataValueType: Terrasoft.DataValueType.INTEGER
				},

				Workplace: {
					type: Terrasoft.ViewModelColumnType.CALCULATED_COLUMN,
					dataValueType: Terrasoft.DataValueType.TEXT
				}

			},
			messages: {

				"PushHistoryState": {
					mode: Terrasoft.MessageMode.BROADCAST,
					direction: Terrasoft.MessageDirectionType.PUBLISH
				},

				"OnDesignerSaved": {
					mode: Terrasoft.MessageMode.PTP,
					direction: Terrasoft.MessageDirectionType.SUBSCRIBE
				},

				"LookupInfo": {
					mode: Terrasoft.MessageMode.PTP,
					direction: Terrasoft.MessageDirectionType.SUBSCRIBE
				},

				"BackHistoryState": {
					"mode": Terrasoft.MessageMode.BROADCAST,
					"direction": Terrasoft.MessageDirectionType.SUBSCRIBE
				},

				"ResultSelectedRows": {
					mode: Terrasoft.MessageMode.PTP,
					direction: Terrasoft.MessageDirectionType.SUBSCRIBE
				},

				"GetDesignerManifest": {
					mode: Terrasoft.MessageMode.PTP,
					direction: Terrasoft.MessageDirectionType.SUBSCRIBE
				},

				"ChangeHeaderCaption": {
					mode: Terrasoft.MessageMode.PTP,
					direction: Terrasoft.MessageDirectionType.PUBLISH
				}

			},
			mixins: {

				EntityStructureHelper: "Terrasoft.EntityStructureHelperMixin"

			},
			methods: {

				/**
				 * @private
				 */
				saveAttemptsNumber: null,

				/**
				 * @private
				 */
				saveSchemasFromManifest: function(maskId) {
					var manifest = MobileDesignerUtils.manifest;
					manifest.resolveManifest({
						callback: function() {
							var currentManifest = manifest.getCurrentManifest();
							var currentManifestLocalizableStrings = manifest.getCurrentManifestLocalizableStrings();
							MobileDesignerUtils.schemaManager.updateCurrentPackageManifest(
									JSON.stringify(currentManifest, null, "\t"), currentManifestLocalizableStrings);
							this.saveSchemas(maskId);
						},
						scope: this
					});
				},

				/**
				 * @private
				 */
				saveSchemas: function(maskId) {
					this.saveAttemptsNumber++;
					MobileDesignerUtils.schemaManager.saveSchemas({
						callback: function(managerSaveResponse) {
							this.mobileDesignerSaveSchemasCallback(maskId, managerSaveResponse);
						},
						scope: this
					});
				},

				/**
				 * @private
				 */
				getCurrentPackageUId: function() {
					var storage = Terrasoft.DomainCache;
					return storage.getItem("SectionDesigner_CurrentPackageUId");
				},

				/**
				 * @private
				 */
				mobileDesignerSaveSchemasCallback: function(maskId, managerSaveResponse) {
					var infoMessage = resources.localizableStrings.SaveCompletionInformationMessage;
					if (managerSaveResponse && !managerSaveResponse.success) {
						infoMessage = resources.localizableStrings.SaveErrorInformationMessage;
						if (managerSaveResponse.errorInfo) {
							core.writeErrorMessage(managerSaveResponse.errorInfo);
							/* HACK #CRM-11717
							При сохранении схем, иногда возникает ошибка "New transaction is not allowed".
							причины ее пока не ясны.
							*/
							if (this.saveAttemptsNumber < maxSaveAttemptsCount &&
								managerSaveResponse.errorInfo.errorCode === "SqlException") {
								this.saveSchemas(maskId);
								return;
							}
							infoMessage = Ext.String.format("{0}:\n'{1}'", infoMessage,
								managerSaveResponse.errorInfo.message);
						}
					}
					Terrasoft.Mask.hide(maskId);
					Terrasoft.showInformation(infoMessage);
				},

				/**
				 * @private
				 */
				executeProcess: function(sysProcessName, callback) {
					if (Ext.isFunction(callback)) {
						ProcessModuleUtilities.responseCallback = callback;
					}
					ProcessModuleUtilities.executeProcess({
						sysProcessName: sysProcessName
					});
				},

				/**
				 * @private
				 */
				updateManifestModulesPosition: function(sectionViewModelCollection) {
					var manifest = MobileDesignerUtils.manifest;
					sectionViewModelCollection.each(function(item) {
						manifest.changeModulePosition(item.get("Model"), item.get("Position"));
					});
				},

				/**
				 * @private
				 */
				onDefaultSectionsBatchQueryExecuted: function(response, callback) {
					if (!response || !response.success) {
						Ext.callback(callback, this);
						return;
					}
					var queryResults = response.queryResults;
					var sections = [];
					for (var i = 0, ln = queryResults.length; i < ln; i++) {
						var queryResult = queryResults[i];
						var sectionResult = queryResult.rows[0];
						sections.push({
							entitySchemaName: defaultManifestModules[i],
							title: sectionResult.Caption,
							position: i
						});
					}
					this.addSections({
						sections: sections,
						callback: callback
					});
				},

				/**
				 * @private
				 */
				getDefaultSectionsSelectQuery: function(entityName) {
					var select = Ext.create("Terrasoft.EntitySchemaQuery", {
						rootSchemaName: "SysModule"
					});
					select.addColumn("Caption");
					select.filters.addItem(Terrasoft.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL,
						"[SysModuleEntity:Id:SysModuleEntityId].[SysSchema:UId:SysEntitySchemaUId].Name",
						entityName));
					return select;
				},

				/**
				 * Инициализация дизайнера реестра.
				 * @protected
				 * @virtual
				 * @param {Function} callback Функция обратного вызова.
				 * @param {Object} scope Контекст функции обратного вызова.
				 */
				init: function(callback, scope) {
					this.subscribeSandboxEvents();
					this.updateHeaderCaption();
					var maskId = Terrasoft.Mask.show();
					this.callParent([
						function() {
							var sectionViewModelCollection = this.createSectionViewModelCollection([]);
							this.set("GridData", sectionViewModelCollection);
							this.initializeMobileDesignerUtils(function() {
								this.createDefaultSectionsIfNotExist(function() {
									this.loadGridData();
									Terrasoft.Mask.hide(maskId);
									callback.call(scope);
								});
							});
						},
						this
					]);
				},

				/**
				 * Выполняет подписки на сообщения, которые понадобятся странице.
				 * @protected
				 * @virtual
				 */
				subscribeSandboxEvents: function() {
					this.sandbox.subscribe("OnDesignerSaved", this.onDesignerSaved, this);
					this.sandbox.subscribe("BackHistoryState", this.onBackHistoryState, this);
					this.sandbox.subscribe("GetDesignerManifest", function() {
						return MobileDesignerUtils.manifest;
					}, this);
				},

				/**
				 * Устанавливает заголовок.
				 * @protected
				 * @virtual
				 */
				updateHeaderCaption: function() {
					var caption = this.get("Resources.Strings.DesignerCaption");
					this.sandbox.publish("ChangeHeaderCaption", {
						caption: caption,
						moduleName: this.name
					});
				},

				/**
				 * Загружает список раделов.
				 * @protected
				 * @virtual
				 */
				loadGridData: function() {
					var sectionList = MobileDesignerUtils.manifest.getModuleList();
					for (var i = (sectionList.length - 1); i >= 0; i--) {
						var sectionConfig = sectionList[i];
						if (notConfigurableModels.indexOf(sectionConfig.Model) >= 0) {
							sectionList.splice(i, 1);
						}
					}
					var sectionViewModelCollection = this.createSectionViewModelCollection(sectionList);
					var gridData = this.get("GridData");
					gridData.clear();
					gridData.loadAll(sectionViewModelCollection);
				},

				/**
				 * Инициализирует класс утилит мобильного дизайнера.
				 * @protected
				 * @virtual
				 * @param {Function} callback Функция обратного вызова.
				 */
				initializeMobileDesignerUtils: function(callback) {
					var packageUId = this.getCurrentPackageUId();
					var workplaceCode = this.get("Workplace");
					MobileDesignerUtils.initialize({
						packageUId: packageUId,
						workplaceCode: workplaceCode,
						callback: function() {
							var currentManifestModels = MobileDesignerUtils.manifest.getCurrentManifestModels();
							modelsOnInit = Object.keys(currentManifestModels);
							Ext.callback(callback, this);
						},
						scope: this
					});
				},

				/**
				 * Создает коллекцию разделов.
				 * @protected
				 * @virtual
				 * @param {Object} sectionList Список разделов.
				 * @returns {Terrasoft.BaseViewModelCollection} Коллекция разделов.
				 */
				createSectionViewModelCollection: function(sectionList) {
					var viewModelCollection = Ext.create("Terrasoft.BaseViewModelCollection");
					for (var i = 0, ln = sectionList.length; i < ln; i++) {
						var sectionConfig = sectionList[i];
						var viewModel = this.createSectionViewModel(sectionConfig);
						var key = viewModel.get(viewModel.primaryColumnName);
						viewModelCollection.add(key, viewModel);
					}
					return viewModelCollection;
				},

				/**
				 * Создает модель представления раздела.
				 * @protected
				 * @virtual
				 * @param {Object} sectionConfig Значения колонок раздела.
				 * @returns {Terrasoft.BaseViewModel} Модель представления раздела.
				 */
				createSectionViewModel: function(sectionConfig) {
					var viewModelConfig = {
						rowConfig: {
							Title: {
								columnPath: "Title",
								dataValueType: Terrasoft.DataValueType.TEXT
							},
							Model: {
								columnPath: "Model",
								dataValueType: Terrasoft.DataValueType.TEXT
							},
							Position: {
								columnPath: "Position",
								dataValueType: Terrasoft.DataValueType.NUMBER
							}
						},
						primaryColumnName: "Model",
						primaryDisplayColumnName: "Title",
						values: sectionConfig,
						methods: {
							isModuleEditable: function() {
								var model = this.get("Model");
								return (notConfigurableModels.indexOf(model) === -1);
							}
						}
					};
					return Ext.create("Terrasoft.BaseViewModel", viewModelConfig);
				},

				/**
				 * Обрабатывает нажатие на элемент упрваления выбора раздела.
				 * @protected
				 * @virtual
				 */
				onAddSectionButtonClick: function() {
					var filters = this.Terrasoft.createFilterGroup();
					var gridData = this.get("GridData");
					var moduleEntityNames = [];
					gridData.each(function(sectionViewModel) {
						moduleEntityNames.push(sectionViewModel.get("Model"));
					}, this);
					var notInFilter = Terrasoft.createColumnInFilterWithParameters(
						"[SysModuleEntity:Id:SysModuleEntityId].[SysSchema:UId:SysEntitySchemaUId].Name",
						moduleEntityNames);
					notInFilter.comparisonType = Terrasoft.ComparisonType.NOT_EQUAL;
					filters.addItem(notInFilter);
					filters.addItem(Terrasoft.createExistsFilter("[SysModuleInWorkplace:SysModule].Id"));
					filters.addItem(Terrasoft.createIsNotNullFilter(
						Ext.create("Terrasoft.ColumnExpression", {
							columnPath: "SectionSchemaUId"
						})
					));
					var lookupConfig = {
						entitySchemaName: "SysModule",
						multiSelect: false,
						columns: ["SysModuleEntity.SysEntitySchemaUId"],
						filters: filters
					};
					LookupUtilities.Open(this.sandbox, lookupConfig, this.addSectionLookupUtilitiesOpenCallback, this);
				},

				/**
				 * Обрабатывает результат из окна выбора из справочника.
				 * @protected
				 * @virtual
				 * @param {Object} config Конфигурация выбора из справочника.
				 */
				addSectionLookupUtilitiesOpenCallback: function(config) {
					var selectedRows = config.selectedRows;
					var selectedRow = selectedRows.getItems()[0];
					var sectionViewModelCollection = this.get("GridData");
					var maxPosition = sectionViewModelCollection.getCount();
					var entitySchemaUId = selectedRow["SysModuleEntity.SysEntitySchemaUId"];
					var maskId = Terrasoft.Mask.show();
					SectionDesignerUtils.getSchemaInfo({
						schemaId: entitySchemaUId,
						callback: function(schemaInfo) {
							if (schemaInfo) {
								this.addSections({
									sections: [{
										entitySchemaName: schemaInfo.name,
										title: selectedRow.Caption,
										position: maxPosition++
									}],
									callback: function() {
										this.loadGridData();
										Terrasoft.Mask.hide(maskId);
									}
								});
							} else {
								this.loadGridData();
								Terrasoft.Mask.hide(maskId);
							}
						},
						scope: this
					});
				},

				/**
				 * Создает разделы по умолчанию.
				 * @protected
				 * @virtual
				 * @param callback Функция обратного вызова.
				 */
				createDefaultSectionsIfNotExist: function(callback) {
					var schemaManager = MobileDesignerUtils.schemaManager;
					var schemaInstance = schemaManager.getManifestSchemaInstance();
					var isNewSchemaInstance = schemaManager.self.isNewSchemaInstance(schemaInstance);
					if (!isNewSchemaInstance || schemaInstance.parentSchemaUId) {
						Ext.callback(callback, this);
						return;
					}
					var batchQuery = Ext.create("Terrasoft.BatchQuery");
					for (var i = 0, ln = defaultManifestModules.length; i < ln; i++) {
						var moduleName = defaultManifestModules[i];
						var select = this.getDefaultSectionsSelectQuery(moduleName);
						batchQuery.add(select);
					}
					var batchQueryCallback = Ext.bind(this.onDefaultSectionsBatchQueryExecuted, this, [callback], true);
					batchQuery.execute(batchQueryCallback);
				},

				/**
				 * Добавляет разделы.
				 * @protected
				 * @virtual
				 * @param {Object} config Конфигурационный объект.
				 * @param {String[]} config.sections Массив разделов.
				 * @param {Function} config.callback Функция обратного вызова.
				 */
				addSections: function(config) {
					var sections = config.sections;
					var entities = [];
					var manifest = MobileDesignerUtils.manifest;
					for (var i = 0, ln = sections.length; i < ln; i++) {
						var section = sections[i];
						var entitySchemaName = section.entitySchemaName;
						manifest.addModule(entitySchemaName, {
							title: section.title,
							position: section.position
						});
						entities.push(entitySchemaName);
					}
					this.saveEntitiesDefaultSettingsIfNotExist({
						entities: entities,
						callback: config.callback
					});
				},

				/**
				 * Сохраняет все изменения.
				 * @protected
				 * @virtual
				 */
				onSaveSectionButtonClick: function() {
					var maskId = Terrasoft.Mask.show();
					this.saveAttemptsNumber = 0;
					this.saveSchemasFromManifest(maskId);
				},

				/**
				 * Удаляет раздел из манифеста.
				 * @param {String} id Идентификатор элемента коллекции разделов.
				 */
				removeSection: function(id) {
					var confirmationMessage = resources.localizableStrings.RemoveSectionConfirmationDialogMessage;
					Terrasoft.showConfirmation(confirmationMessage, function getSelectedButton(returnCode) {
						if (returnCode === Terrasoft.MessageBoxButtons.YES.returnCode) {
							var sectionViewModelCollection = this.get("GridData");
							var sectionViewModel = sectionViewModelCollection.get(id);
							var modelName = sectionViewModel.get("Model");
							this.set("ActiveRow", null);
							MobileDesignerUtils.manifest.hideModule(modelName);
							this.loadGridData();
						}
					}, ["yes", "no"], this);
				},

				/**
				 * Изменяет позиции разделов в манифесте.
				 * @param {String} id Идентификатор элемента коллекции разделов.
				 * @param {Number} position Значение измененной позиции (-1 - вверх, 1 - вниз).
				 */
				changeSectionPosition: function(id, position) {
					var sectionViewModelCollection = this.get("GridData");
					var activeSectionViewModel = sectionViewModelCollection.get(id);
					var activeSectionPosition = sectionViewModelCollection.indexOf(activeSectionViewModel);
					var newActiveSectionPosition = activeSectionPosition + position;
					var maxPosition = sectionViewModelCollection.getCount() - 1;
					var minPosition = 0;
					if (newActiveSectionPosition < minPosition || newActiveSectionPosition > maxPosition) {
						return;
					}
					var modifiedMaxPosition = (newActiveSectionPosition > activeSectionPosition) ?
						newActiveSectionPosition : activeSectionPosition;
					for (var i = modifiedMaxPosition; i >= 0; i--) {
						var sectionItem = sectionViewModelCollection.getByIndex(i);
						if (i === newActiveSectionPosition) {
							sectionItem.set("Position", activeSectionPosition);
						} else if (i === activeSectionPosition) {
							sectionItem.set("Position", newActiveSectionPosition);
						} else {
							sectionItem.set("Position", i);
						}
					}
					this.updateManifestModulesPosition(sectionViewModelCollection);
					this.loadGridData();
				},

				/**
				 * Открывает страницу дизайнера реестра.
				 * @param {String} id Идентификатор элемента коллекции разделов.
				 */
				openGridDesigner: function(id) {
					var designerCaption = resources.localizableStrings.GridDesignerCaption;
					this.openDesigner(id, Terrasoft.MobileDesignerEnums.SettingsType.GridPage,
						"MobileGridDesignerModule", designerCaption);
				},

				/**
				 * Открывает страницу дизайнера страницы.
				 * @param {String} id Идентификатор элемента коллекции разделов.
				 */
				openPageDesigner: function(id) {
					var designerCaption = resources.localizableStrings.PageDesignerCaption;
					this.openDesigner(id, Terrasoft.MobileDesignerEnums.SettingsType.RecordPage,
						"MobilePageDesignerModule", designerCaption);
				},

				/**
				 * Открывает страницу дизайнера детали.
				 * @param {String} id Идентификатор элемента коллекции разделов.
				 */
				openDetailDesigner: function(id) {
					var designerCaption = resources.localizableStrings.DetailsDesignerCaption;
					this.openDesigner(id, Terrasoft.MobileDesignerEnums.SettingsType.RecordPage,
						"MobileDetailDesignerModule", designerCaption);
				},

				/**
				 * Обработчик события сохранения настроек.
				 * @protected
				 * @virtual
				 * @param {Object} settingsConfig Конфигурация настройки дизайнера.
				 */
				onDesignerSaved: function(settingsConfig) {
					if (settingsConfig.settingsType === Terrasoft.MobileDesignerEnums.SettingsType.RecordPage) {
						this.saveRecordSettings(settingsConfig);
					} else {
						this.saveGridSettings(settingsConfig);
					}
				},

				/**
				 * Обработчик возврата из предыдущего модуля
				 * @protected
				 * @virtual
				 */
				onBackHistoryState: function() {
					this.updateHeaderCaption();
				},

				/**
				 * Метод выполняет действия над выделенной строкой в завистимости от tag
				 * @protected
				 * @virtual
				 */
				onActiveRowAction: function(tag, id) {
					switch (tag) {
						case "delete":
							this.removeSection(id);
							break;
						case "up":
						case "down":
							var position = (tag === "up") ? -1 : 1;
							this.changeSectionPosition(id, position);
							break;
						case "editGrid":
							this.openGridDesigner(id);
							break;
						case "editPage":
							this.openPageDesigner(id);
							break;
						case "editDetail":
							this.openDetailDesigner(id);
							break;
					}
				},

				/**
				 * Загружает настройки и открывает модуль дизайнера.
				 * @protected
				 * @virtual
				 * @param {String} id Идентификатор элемента коллекции разделов.
				 * @param {String} settingsType Тип настроек мобильной страницы.
				 * @param {String} designerModuleSchemaName Имя схемы модуля дизайнера.
				 */
				openDesigner: function(id, settingsType, designerModuleSchemaName, designerCaption) {
					var maskId = Terrasoft.Mask.show();
					var sectionViewModelCollection = this.get("GridData");
					var sectionViewModel = sectionViewModelCollection.get(id);
					var entitySchemaName = sectionViewModel.get("Model");
					MobileDesignerUtils.loadSettings({
						entitySchemaName: entitySchemaName,
						settingsType: settingsType,
						callback: function(designerSettings) {
							if (!designerSettings) {
								designerSettings = {
									entitySchemaName: entitySchemaName,
									settingsType: settingsType
								};
							}
							var sectionTitle = sectionViewModel.get("Title");
							var title = Ext.String.format('{0} "{1}"', designerCaption, sectionTitle);
							var moduleConfig = {
								designerSettings: designerSettings,
								designerModuleSchemaName: designerModuleSchemaName,
								title: title
							};
							this.openDesignerModulePage(moduleConfig);
							Terrasoft.Mask.hide(maskId);
						},
						scope: this
					});
				},

				/**
				 * Открывает модуль дизайнера.
				 * @protected
				 * @virtual
				 * @param {Object} moduleConfig Параметры настройки дизайнера.
				 */
				openDesignerModulePage: function(moduleConfig) {
					var designerPageSchemaName = "MobileDesignerModulePage";
					var designerId = this.sandbox.id + designerPageSchemaName;
					var params = this.sandbox.publish("GetHistoryState");
					var stateObj = {
						designerSchemaName: designerPageSchemaName,
						moduleConfig: moduleConfig
					};
					this.sandbox.publish("PushHistoryState", {
						hash: params.hash.historyState,
						stateObj: stateObj,
						silent: true
					});
					this.sandbox.loadModule("ConfigurationModuleV2", {
						renderTo: "centerPanel",
						id: designerId,
						keepAlive: true
					});
				},

				/**
				 * Сохраняет настройки карточки.
				 * @protected
				 * @virtual
				 * @param {Object} settingsConfig Конфигурация настройки дизайнера.
				 */
				saveRecordSettings: function(settingsConfig) {
					var maskId = Terrasoft.Mask.show();
					this.processStandartDetails({
						details: settingsConfig.details,
						callback: function() {
							this.saveSettings({
								settingsConfig: settingsConfig,
								callback: function() {
									Terrasoft.Mask.hide(maskId);
								}
							});
						}
					});
				},

				/**
				 * Сохраняет настройки реестра.
				 * @protected
				 * @virtual
				 * @param {Object} settingsConfig Конфигурация настройки дизайнера.
				 */
				saveGridSettings: function(settingsConfig) {
					var maskId = Terrasoft.Mask.show();
					this.saveSettings({
						settingsConfig: settingsConfig,
						callback: function() {
							Terrasoft.Mask.hide(maskId);
						}
					});
				},

				/**
				 * Сохраняет настройки.
				 * @protected
				 * @virtual
				 * @param {Object} config Конфигурационный объект.
				 * @param {Object} config.settingsConfig Конфигурация настройки дизайнера.
				 * @param {Function} config.callback Функция обратного вызова.
				 */
				saveSettings: function(config) {
					var settingsConfig = config.settingsConfig;
					MobileDesignerUtils.saveSettings({
						entitySchemaName: settingsConfig.entitySchemaName,
						settings: settingsConfig,
						settingsType: settingsConfig.settingsType,
						callback: config.callback,
						scope: this
					});
				},

				/**
				 * Сохраняет настройки по умолчанию в схему, которая не была создана ни в одном из пакетов.
				 * @protected
				 * @virtual
				 * @param {Object} config Конфигурационный объект.
				 * @param {Object} config.entitySchemaName Имя схемы.
				 * @param {Terrasoft.MobileDesignerEnums.SettingsType} config.settingsType Тип настроек.
				 * @param {Function} config.callback Функция обратного вызова.
				 */
				saveDefaultSettingsIfNotExist: function(config) {
					var schemaManager = MobileDesignerUtils.schemaManager;
					var entitySchemaName = config.entitySchemaName;
					var settingsType = config.settingsType;
					schemaManager.readSettingsSchema({
						settingsType: settingsType,
						entitySchemaName: entitySchemaName,
						searchInAllPackages: true,
						callback: function(schemaInstance) {
							var isNewSchemaInstance = schemaManager.self.isNewSchemaInstance(schemaInstance);
							if (!isNewSchemaInstance) {
								Ext.callback(config.callback, this);
								return;
							}
							this.getDefaultSettingsConfig({
								entitySchemaName: entitySchemaName,
								settingsType: settingsType,
								callback: function(settingsConfig) {
									settingsConfig.settingsType = settingsType;
									this.saveSettings({
										settingsConfig: settingsConfig,
										callback: config.callback
									});
								}
							});
						},
						scope: this
					});
				},

				/**
				 * Сохраняет настройки по массиву схем.
				 * @param {Object} config Конфигурационный объект.
				 * @param {String[]} config.entities Массив имен схем.
				 * @param {Function} config.callback Функция обратного вызова.
				 */
				saveEntitiesDefaultSettingsIfNotExist: function(config) {
					var recordSettingsType = Terrasoft.MobileDesignerEnums.SettingsType.RecordPage;
					var gridSettingsType = Terrasoft.MobileDesignerEnums.SettingsType.GridPage;
					var actionsSettingsType = Terrasoft.MobileDesignerEnums.SettingsType.Actions;
					var chainArguments = [];
					var generateSaveSettingsChainFn = function(entitySchemaName, settingsType) {
						return function(next) {
							this.saveDefaultSettingsIfNotExist({
								settingsType: settingsType,
								entitySchemaName: entitySchemaName,
								callback: function() {
									next();
								}
							});
						};
					};
					var entities = config.entities;
					for (var i = 0, ln = entities.length; i < ln; i++) {
						var entitySchemaName = entities[i];
						chainArguments.push(generateSaveSettingsChainFn(entitySchemaName, recordSettingsType));
						chainArguments.push(generateSaveSettingsChainFn(entitySchemaName, gridSettingsType));
						chainArguments.push(generateSaveSettingsChainFn(entitySchemaName, actionsSettingsType));
					}
					chainArguments.push(function(next) {
						Ext.callback(config.callback, this);
						next();
					});
					chainArguments.push(this);
					Ext.callback(Terrasoft.chain, this, chainArguments);
				},

				/**
				 * Обрабатывает сохранение стандартных деталей.
				 * @protected
				 * @virtual
				 * @param {Object} config Конфигурационный объект.
				 * @param {Object[]} config.details Массив настроек деталей.
				 * @param {Function} config.callback Функция обратного вызова.
				 */
				processStandartDetails: function(config) {
					var details = config.details;
					var entities = [];
					for (var i = 0, ln = details.length; i < ln; i++) {
						var detail = details[i];
						entities.push(detail.entitySchemaName);
					}
					this.saveEntitiesDefaultSettingsIfNotExist({
						entities: entities,
						callback: config.callback
					});
				},

				/**
				 * Получает конфигурацию настройки по типу.
				 * @protected
				 * @virtual
				 * @param {Object} config Конфигурационный объект.
				 * @param {Object} config.entitySchemaName Имя схемы.
				 * @param {Terrasoft.MobileDesignerEnums.SettingsType} config.settingsType Тип настроек.
				 * @param {Function} config.callback Функция обратного вызова.
				 */
				getDefaultSettingsConfig: function(config) {
					var designerSettingsClassName;
					var settingsType = config.settingsType;
					if (settingsType === Terrasoft.MobileDesignerEnums.SettingsType.RecordPage) {
						designerSettingsClassName = "Terrasoft.MobileRecordDesignerSettings";
					} else if (settingsType === Terrasoft.MobileDesignerEnums.SettingsType.GridPage) {
						designerSettingsClassName = "Terrasoft.MobileGridDesignerSettings";
					} else if (settingsType === Terrasoft.MobileDesignerEnums.SettingsType.Actions) {
						designerSettingsClassName = "Terrasoft.MobileActionsDesignerSettings";
					}
					var recordDesignerSettings = Ext.create(designerSettingsClassName, {
						sandbox: this.sandbox,
						settingsConfig: {
							entitySchemaName: config.entitySchemaName
						}
					});
					recordDesignerSettings.initialize(function() {
						var settingsConfig = recordDesignerSettings.getSettingsConfig();
						Ext.callback(config.callback, this, [settingsConfig]);
					}, this);
				}

			},
			diff: [
				{
					"operation": "insert",
					"name": "SectionDesignerSaveButton",
					"values": {
						"itemType": Terrasoft.ViewItemType.BUTTON,
						"style": Terrasoft.controls.ButtonEnums.style.GREEN,
						"caption": {
							"bindTo": "Resources.Strings.SaveButtonCaption"
						},
						"classes": {
							"textClass": "actions-button-margin-right"
						},
						"click": {
							"bindTo": "onSaveSectionButtonClick"
						}
					}
				},
				{
					"operation": "insert",
					"name": "SectionDesignerAddButton",
					"values": {
						"itemType": Terrasoft.ViewItemType.BUTTON,
						"style": Terrasoft.controls.ButtonEnums.style.DEFAULT,
						"caption": {
							"bindTo": "Resources.Strings.AddSectionButtonCaption"
						},
						"click": {
							"bindTo": "onAddSectionButtonClick"
						}
					}
				},
				{
					"operation": "insert",
					"name": "SectionDesignerModuleGrid",
					"values": {
						"id": "SectionDesignerModuleGrid",
						"selectors": {
							"wrapEl": "#SectionDesignerModuleGrid"
						},
						type: "listed",
						columnsConfig: [
							{
								cols: 24,
								key: [
									{ name: { bindTo: "Title" } }
								]
							}
						],
						captionsConfig: [
							{
								cols: 24,
								name: resources.localizableStrings.GridTitleColumnCaption
							}
						],
						"activeRow": { "bindTo": "ActiveRow" },
						"activeRowAction": {"bindTo": "onActiveRowAction"},
						"activeRowActions": [],
						"listedZebra": true,
						"collection": { "bindTo": "GridData" },
						"itemType": Terrasoft.ViewItemType.GRID,
						"items": [],
						"primaryColumnName": "Model"
					}
				},
				{
					"operation": "insert",
					"name": "DataGridActiveRowMoveUpAction",
					"parentName": "SectionDesignerModuleGrid",
					"propertyName": "activeRowActions",
					"values": {
						"className": "Terrasoft.Button",
						"style": Terrasoft.controls.ButtonEnums.style.BLUE,
						"imageConfig": LocalizableHelper.localizableImages.Up,
						"classes": {
							"textClass": ["mobile-section-designer-arrow-button"],
							"wrapperClass": ["mobile-section-designer-arrow-button"]
						},
						"tag": "up"
					}
				},
				{
					"operation": "insert",
					"name": "DataGridActiveRowMoveDownAction",
					"parentName": "SectionDesignerModuleGrid",
					"propertyName": "activeRowActions",
					"values": {
						"className": "Terrasoft.Button",
						"style": Terrasoft.controls.ButtonEnums.style.BLUE,
						"imageConfig": LocalizableHelper.localizableImages.Down,
						"classes": {
							"textClass": ["mobile-section-designer-arrow-button"],
							"wrapperClass": ["mobile-section-designer-arrow-button"]
						},
						"tag": "down"
					}
				},
				{
					"operation": "insert",
					"name": "DataGridActiveRowEditGridAction",
					"parentName": "SectionDesignerModuleGrid",
					"propertyName": "activeRowActions",
					"values": {
						"className": "Terrasoft.Button",
						"style": Terrasoft.controls.ButtonEnums.style.GREY,
						"caption": resources.localizableStrings.OpenGridDesignerGridRowButtonCaption,
						"classes": {
							"textClass": ["mobile-section-designer-button"]
						},
						"tag": "editGrid",
						"visible": {
							"bindTo": "isModuleEditable"
						}
					}
				},
				{
					"operation": "insert",
					"name": "DataGridActiveRowEditPageAction",
					"parentName": "SectionDesignerModuleGrid",
					"propertyName": "activeRowActions",
					"values": {
						"className": "Terrasoft.Button",
						"style": Terrasoft.controls.ButtonEnums.style.GREY,
						"caption": resources.localizableStrings.OpenPageDesignerGridRowButtonCaption,
						"classes": {
							"textClass": ["mobile-section-designer-button"]
						},
						"tag": "editPage",
						"visible": {
							"bindTo": "isModuleEditable"
						}
					}
				},
				{
					"operation": "insert",
					"name": "DataGridActiveRowEditDeatilAction",
					"parentName": "SectionDesignerModuleGrid",
					"propertyName": "activeRowActions",
					"values": {
						"className": "Terrasoft.Button",
						"style": Terrasoft.controls.ButtonEnums.style.GREY,
						"caption": resources.localizableStrings.OpenDetailDesignerGridRowButtonCaption,
						"classes": {
							"textClass": ["mobile-section-designer-button"]
						},
						"tag": "editDetail",
						"visible": {
							"bindTo": "isModuleEditable"
						}
					}
				},
				{
					"operation": "insert",
					"name": "DataGridActiveRowDeleteAction",
					"parentName": "SectionDesignerModuleGrid",
					"propertyName": "activeRowActions",
					"values": {
						"className": "Terrasoft.Button",
						"style": Terrasoft.controls.ButtonEnums.style.GREY,
						"caption": resources.localizableStrings.DeleteRecordGridRowButtonCaption,
						"classes": {
							"textClass": ["mobile-section-designer-button"]
						},
						"tag": "delete",
						"visible": {
							"bindTo": "isModuleEditable"
						}
					}
				}
			]
		};
	});