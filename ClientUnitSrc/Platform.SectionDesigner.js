define("SectionDesigner", [
		"ext-base", "terrasoft", "sandbox", "SectionDesignerResources", "SectionDesignerEnums",
		"SectionDesignDataModule", "SectionDesignerUtils", "StructureExplorerUtilities", "ColumnSettingsUtilities"
	],
	function(Ext, Terrasoft, sandbox, resources, SectionDesignerEnums, SectionDesignDataModule, SectionDesignerUtils,
			 StructureExplorerUtilities, ColumnSettingsUtilities) {

		/**
		 * Локализированные строки ресурсов
		 * @private
		 * @type {Object}
		 */
		var localizableStrings = resources.localizableStrings;

		/**
		 * Контейнер для отрисовки отображения модуля
		 * @private
		 * @type {Object}
		 */
		var mainViewRenderTo;

		/**
		 * Признак, что модуль заголовка загружен
		 * @private
		 * @type {Boolean}
		 */
		var headerLoaded;

		/**
		 * Флаг инициализации модуля
		 * @private
		 * @type {boolean}
		 */
		var moduleInitialized = false;

		/**
		 * Текущая конфигурация дизайнера
		 * @private
		 * @type {Object}
		 */
		var designerConfig = {
			/**
			 * Код загружаемого модуля
			 * @public
			 * @type {String}
			 */
			moduleKey: "",
			/**
			 * Имя загружаемого модуля
			 * @public
			 * @type {String}
			 */
			moduleName: "",
			/**
			 * Текущий путь для отображения в адресной строке
			 * @public
			 * @type {String}
			 */
			historyState: "",
			/**
			 * Конфигурация для текущего шага
			 * @public
			 * @type {Object}
			 */
			stepConfig: {
				/**
				 * Код раздела
				 * @public
				 * @type {String}
				 */
				sectionCode: "",
				/**
				 * Параметр. Содержит тип страницы редактирования, или тип реестра раздела
				 * @public
				 * @type {String}
				 */
				parameter: ""
			}
		};

		/**
		 * Идентификатор стартовой страницы
		 * @private
		 * @type {String}
		 */
		var startModuleKey = "StartPage";

		/**
		 * Объект структуры боковой панели
		 * @private
		 * @type {Object}
		 */
		var sideBarConfig = {
			items: [{
				name: "SectionDesignerMenuModule",
				id: "SectionDesignerMenuModule"
			}]
		};

		/**
		 * Идентификатор маски загрузки
		 * @private
		 * @type {String}
		 */
		var maskId;

		/**
		 * Функция обработчика получения структуры боковой панели
		 * @private
		 * @return {Object} структура боковой панели
		 */
		function onGetSideBarConfig() {
			return sideBarConfig;
		}

		//TODO Восстановить элементы боковой панели.
		//#243791
		//UI: Мастер раздела. Реализовать навигацию по мастеру раздела (см. Описание)
		/**
		 * Колекция элементов боковой панели
		 * @private
		 * @type {Terrasoft.Collection}
		 */
		var designerStructureCollection = Ext.create("Terrasoft.Collection");
		designerStructureCollection.config = {
			StartPage: {
				caption: localizableStrings.StartPageMenuItemCaption,
				moduleName: "SectionDesignerStartPageModule"
			},
			Page: {
				caption: localizableStrings.PageDesignerMenuItemCaption,
				manyItemsCaption: localizableStrings.PageDesignerManyPagesMenuItemCaption,
				moduleName: "PageDesigner",
				subItems: new Terrasoft.Collection()
			},
			GridSettings: {
				caption: localizableStrings.GridMenuItemCaption,
				moduleName: "SectionDesignerGridSettingsModule"
			}/*,
			 FinishPage: {
			 caption: localizableStrings.finishMenuItemCaption,
			 moduleName: "SectionDesignerFinishPageModule"
			 }*/
		};
		designerStructureCollection.init = function() {
			this.clear();
			Terrasoft.each(this.config, function(item, key) {
				this.add(key, {
					key: key,
					name: key,
					caption: item.caption,
					manyItemsCaption: localizableStrings.PageDesignerManyPagesMenuItemCaption,
					moduleName: item.moduleName,
					subItems: item.subItems
				});
			}, this);
		};

		/**
		 * Функция скрывающая маску загрузки
		 * @private
		 */
		function hideMask() {
			setTimeout(function() {
				Terrasoft.Mask.hide(maskId);
			}, 500);
		}

		/**
		 /**
		 * Функция обработчика получения элементов боковой панели
		 * @private
		 * @return {Object} элементы боковой панели
		 */
		function onGetDesignerStructureConfig() {
			var config = [];
			designerStructureCollection.each(function(item) {
				config.push({
					caption: item.caption,
					manyItemsCaption: item.manyItemsCaption,
					tag: item.key,
					subItems: item.subItems
				});
			});
			return config;
		}

		/**
		 * Функция обработчика изменения активного элемента боковой панели
		 * @private
		 * @param {Object} config конфигурация
		 */
		function onDesignerStructureSelectedItemChange(config) {
			var callback = config.callback;
			var isStepReady = sandbox.publish("IsStepReady", function(stepReady) {
				var result = false;
				if (stepReady !== false) {
					goToStep(config.itemKey);
					result = true;
				}
				if (callback) {
					callback.call(config.scope || this, result);
				}
			});
			if (isStepReady !== false) {
				goToStep(config.itemKey);
				if (callback) {
					callback.call(config.scope || this, true);
				}
			}
		}

		/**
		 * Функция обработчика получения текущего статуса мастера разделов
		 * @private
		 * @return {String} ключ текущего состояния элемента
		 */
		function onGetSectionDesignerStructureItemKey() {
			return designerConfig.moduleKey;
		}

		/**
		 * Функция обработчика перехода к указанному шагу
		 * @private
		 * @param {Object} config конфигурация перехода
		 */
		function onGoToStep(config) {
			var stepCompleteResult = config.stepCompleteResult;
			if (stepCompleteResult === SectionDesignerEnums.StepType.EXIT) {
				exit();
			} else {
				var stepReady = sandbox.publish("IsStepReady", function(stepReady) {
					onStepReady(stepReady, stepCompleteResult);
				});
				onStepReady(stepReady, stepCompleteResult);
			}
		}

		function onStepReady(stepReady, stepCompleteResult) {
			if (stepReady !== false) {
				var stepName;
				switch (stepCompleteResult) {
					case SectionDesignerEnums.StepType.NEXT:
						stepName = getNextStepName();
						break;
					case SectionDesignerEnums.StepType.PREV:
						stepName = getPrevStepName();
						break;
					case SectionDesignerEnums.StepType.FINISH:
						//TODO Когда будет возвращена финишная страница - вернуть переход на неё.
						//stepName = finishModuleKey;
						Terrasoft.utils.showMessage({
							caption: localizableStrings.SaveMessage,
							buttons: ["yes", "no"],
							defaultButton: 0,
							style: Terrasoft.MessageBoxStyles.BLUE,
							handler: function(buttonCode) {
								if (buttonCode === "yes") {
									SectionDesignDataModule.save();
								}
							}
						});
						break;
					default:
						break;
				}
				if (stepName) {
					goToStep(stepName);
				}
			}
		}

		/**
		 * Получает код следующего шага
		 * @private
		 * @returns {String} код следующего шага
		 */
		function getNextStepName() {
			var currentModuleKey = designerConfig.moduleKey;
			var nextKey = null;
			var currentStep = designerStructureCollection.get(currentModuleKey);
			var subItems = currentStep.subItems;
			var subItemsKeys;
			if (subItems) {
				var currentSubItem = designerConfig.stepConfig.parameter;
				subItemsKeys = subItems.getKeys();
				var nextSubItemIndex = subItemsKeys.indexOf(currentSubItem) + 1;
				nextKey = (nextSubItemIndex < subItemsKeys.length) ?
					(currentModuleKey + "/" + subItemsKeys[nextSubItemIndex]) : null;
			}
			if (!nextKey) {
				var keys = designerStructureCollection.getKeys();
				var nextStepIndex = keys.indexOf(currentModuleKey) + 1;
				nextKey = (nextStepIndex < keys.length) ? keys[nextStepIndex] : null;
				if (nextKey) {
					var nextStep = designerStructureCollection.get(nextKey);
					subItems = nextStep.subItems;
					if (subItems) {
						subItemsKeys = subItems.getKeys();
						if (subItemsKeys.length > 0) {
							nextKey = nextKey + "/" + subItemsKeys[0];
						}
					}
				}
			}
			return nextKey;
		}

		/**
		 * Получает код предыдущего шага
		 * @private
		 * @returns {String} код предыдущего шага
		 */
		function getPrevStepName() {
			var currentModuleKey = designerConfig.moduleKey;
			var prevKey = null;
			var subItemsKeys;
			var currentStep = designerStructureCollection.get(currentModuleKey);
			var subItems = currentStep.subItems;
			if (subItems) {
				var currentSubItem = designerConfig.stepConfig.parameter;
				subItemsKeys = subItems.getKeys();
				var prevSubItemIndex = subItemsKeys.indexOf(currentSubItem) - 1;
				prevKey = (prevSubItemIndex >= 0) ?
					(currentModuleKey + "/" + subItemsKeys[prevSubItemIndex]) : null;
			}
			if (!prevKey) {
				var keys = designerStructureCollection.getKeys();
				var prevStepIndex = keys.indexOf(currentModuleKey) - 1;
				prevKey = (prevStepIndex >= 0) ? keys[prevStepIndex] : null;
				if (prevKey) {
					var prevStep = designerStructureCollection.get(prevKey);
					subItems = prevStep.subItems;
					if (subItems) {
						subItemsKeys = subItems.getKeys();
						if (subItemsKeys.length > 0) {
							prevKey = prevKey + "/" + subItemsKeys[subItemsKeys.length - 1];
						}
					}
				}
			}
			return prevKey;
		}

		/**
		 * Переход к указанному шагу
		 * @private
		 * @param {String} stepName имя шага
		 */
		function goToStep(stepName) {
			SectionDesignDataModule.getDesignData(function(data) {
				var historyState = sandbox.publish("GetHistoryState");
				var stateToPush =
					Ext.String.format("{0}/{1}/{2}", historyState.hash.moduleName, data.mainModuleName, stepName);
				sandbox.publish("PushHistoryState", { hash: stateToPush });
				SectionDesignDataModule.saveDesignDataToStorage();
			});
		}

		/**
		 * Инициирует закрытие мастера
		 * @private
		 */
		function exit() {
			Terrasoft.utils.showMessage({
				caption: localizableStrings.ExitMessage,
				buttons: ["yes", "no"],
				defaultButton: 0,
				style: Terrasoft.MessageBoxStyles.BLUE,
				handler: function(buttonCode) {
					if (buttonCode === "yes") {
						SectionDesignDataModule.clearStorageDesignData();
						window.close();
					}
				}
			});
		}

		/**
		 * Функция получения конфигурации дизайнера из текущего состояния
		 * @private
		 * @param {String} historyState текущее состояние
		 * @returns {Object}
		 */
		function getDesignerConfig(historyState) {
			var historyStateParts = historyState.split("/");
			var designerModuleName = historyStateParts[0];
			var sectionCode = historyStateParts[1];
			sectionCode = (startModuleKey === sectionCode) ? undefined : sectionCode;
			var pageCode = historyStateParts[2];
			var parameter = historyStateParts[3];
			var menuItemKey = pageCode || startModuleKey;
			var menuItem = designerStructureCollection.get(menuItemKey);
			var newHistoryState;
			if (sectionCode) {
				newHistoryState = historyState;
			} else {
				newHistoryState = designerModuleName + "/" + menuItemKey;
			}
			var config = {
				moduleKey: menuItemKey,
				moduleName: menuItem.moduleName,
				historyState: newHistoryState,
				stepConfig: {
					sectionCode: sectionCode,
					parameter: parameter
				}
			};
			return config;
		}

		/**
		 * Функция инициализации модуля
		 * @public
		 */
		function init(callback, scope) {
			sandbox.subscribe("ModuleLoaded", hideMask);
			if (!moduleInitialized) {
				SectionDesignerUtils.getCanUseSectionDesigner(function(resultObject) {
					if (resultObject.canUseSectionDesigner) {
						SectionDesignerUtils.setSectionDesignDataModule(SectionDesignDataModule);
						designerStructureCollection.init();
						sandbox.subscribe("GetDesignerStructureConfig", onGetDesignerStructureConfig);
						sandbox.subscribe("PostDesignerStructureSelectedItem", onDesignerStructureSelectedItemChange);
						sandbox.publish("SideBarLoadModule", sideBarConfig);
						sandbox.subscribe("GetSideBarConfig", onGetSideBarConfig);
						sandbox.subscribe("GetSectionDesignerStructureItemKey", onGetSectionDesignerStructureItemKey);
						sandbox.subscribe("GoToStep", onGoToStep);
						sandbox.subscribe("GetStepConfig", function() {
							return designerConfig.stepConfig;
						});
						sandbox.subscribe("OpenStructureExplorer", function(args) {
							StructureExplorerUtilities.Open(sandbox, args.config, args.handler, mainViewRenderTo, this);
						});
						sandbox.subscribe("OnSectionCodeChanged", function(config) {
							onSectionCodeChanged(config, function(data, result) {
								var newHash = generateHash(data.mainModuleName);
								replaceHistoryState(newHash);
								config.callback(data, result);
							});
						});
						sandbox.subscribe("OpenColumnSettings", function(args) {
							ColumnSettingsUtilities.Open(sandbox, args.config, args.handler, mainViewRenderTo, this);
						});
						sandbox.subscribe("RefreshPagesConfig", refreshPagesConfig);
						SectionDesignDataModule.init(sandbox, function() {
							replaceHistoryState();
							callback.call(scope);
						});
					} else {
						var buttonsConfig = {
							buttons: ["ok"],
							defaultButton: 0
						};
						Terrasoft.showInformation(localizableStrings.CanNotUseSectionDesigner, function() {
							window.close();
						}, this, buttonsConfig);
					}
				});
			} else {
				replaceHistoryState();
				callback.call(scope);
			}
		}

		/**
		 * Возвращает отображение модуля
		 * @private
		 * @returns {Ext.Element}
		 */
		function getView() {
			return Ext.create("Terrasoft.Container", {
				id: "sectionDesignerMainContainer",
				selectors: {
					wrapEl: "#sectionDesignerMainContainer"
				},
				items: [
					{
						className: "Terrasoft.Container",
						id: "sectionDesignerHeaderPanel",
						selectors: {
							wrapEl: "#sectionDesignerHeaderPanel"
						}
					},
					{
						className: "Terrasoft.Container",
						id: "sectionDesignerCenterPanel",
						selectors: {
							wrapEl: "#sectionDesignerCenterPanel"
						}
					}
				]
			});
		}

		/**
		 * Функция отрисовки модуля
		 * @public
		 * @param {Object} renderTo контейнер для отрисовки модуля
		 */
		function render(renderTo) {
			maskId = Terrasoft.Mask.show({ timeout : 0 });
			var view = getView();
			view.render(renderTo);
			if (!headerLoaded) {
				sandbox.loadModule("SectionDesignerHeaderModule", {
					renderTo: "sectionDesignerHeaderPanel"
				});
				headerLoaded = true;
			}
			Terrasoft.SysSettings.querySysSettingsItem("SchemaNamePrefix", function(value) {
				SectionDesignerUtils.initSchemaNamePrefix(value);
				mainViewRenderTo = renderTo;
				onSectionCodeChanged({ sectionCode: designerConfig.stepConfig.sectionCode }, onGetDesignerDataLoaded);
			});
		}

		/**
		 * Обработчик изменения кода раздела
		 * @private
		 * @param {Object} config конфигурация раздела
		 * @param {Function} callback
		 */
		function onSectionCodeChanged(config, callback) {
			function innerCallback() {
				refreshPagesConfig();
				callback.apply(this, arguments);
			}
			var code = config.sectionCode;
			if (Ext.isEmpty(code)) {
				SectionDesignDataModule.getDesignData(innerCallback);
			} else {
				SectionDesignDataModule.getDesignData(function(data) {
					var mainModuleName = data.mainModuleName;
					if (!mainModuleName) {
						loadSectionData(config, innerCallback);
					} else if (mainModuleName === code) {
						innerCallback.call(this, data);
					} else {
						Terrasoft.utils.showMessage({
							caption: Ext.String.format(localizableStrings.ChangeDesignedModule,
								mainModuleName, code),
							buttons: ["yes", "no"],
							defaultButton: 0,
							style: Terrasoft.MessageBoxStyles.BLUE,
							handler: function(buttonCode) {
								if (buttonCode === "yes") {
									loadSectionData(config, innerCallback);
								} else {
									innerCallback.call(this, data, false);
								}
							}
						});
					}
				});
			}
		}

		/**
		 * Замещает текущий HistoryState
		 * @private
		 * @param {String} newHash хеш
		 */
		function replaceHistoryState(newHash) {
			var state = sandbox.publish("GetHistoryState");
			designerConfig = getDesignerConfig(newHash || state.hash.historyState);
			var currentState = state.state || {};
			var newState = Terrasoft.deepClone(currentState);
			newState.moduleId = sandbox.id;
			sandbox.publish("ReplaceHistoryState", {
				stateObj: newState,
				pageTitle: null,
				hash: designerConfig.historyState,
				silent: true
			});
		}

		/**
		 * Формирует хеш на основании кода раздела и шага
		 * @private
		 * @param {String} sectionCode код раздела
		 * @returns {String} хеш
		 */
		function generateHash(sectionCode) {
			var newHash;
			var historyState = designerConfig.historyState;
			var historyStateParts = historyState.split("/");
			var designerModuleName = historyStateParts[0];
			if (sectionCode) {
				var pageCode = historyStateParts[2];
				var parameter = historyStateParts[3];
				newHash = designerModuleName + "/" + sectionCode;
				if (pageCode) {
					newHash = newHash + "/" + pageCode;
				}
				if (parameter) {
					newHash = newHash + "/" + parameter;
				}
			} else {
				newHash = designerModuleName;
			}
			return newHash;
		}

		/**
		 * Функция-callback которая отрабатывает после загрузки информации и разделе.
		 * Выполняет замещение текущего хеша и загрузку nested-модулей
		 * @private
		 * @param {Object} data данные дизайнера
		 */
		function onGetDesignerDataLoaded(data) {
			var newHash = generateHash(data.mainModuleName);
			replaceHistoryState(newHash);
			loadNestedModule();
		}

		/**
		 * Формирует контейнер для загрузки модуля текущего шага, и загружает в него можуль текущего шага
		 * @private
		 */
		function loadNestedModule() {
			if (!moduleInitialized && designerConfig.moduleName) {
				sandbox.loadModule(designerConfig.moduleName, {
					renderTo: "sectionDesignerCenterPanel"
				});
			}
			moduleInitialized = true;
		}

		/**
		 * Загружает информацию для раздела
		 * @private
		 * @param {Object} config конфигурация раздела
		 * @param {Function} callback
		 */
		function loadSectionData(config, callback) {
			var code = config.sectionCode;
			var stepSectionCode = designerConfig.stepConfig.sectionCode;
			SectionDesignerUtils.getModuleInfo({
				moduleCode: code,
				callback: function(existingModuleConfig) {
					if (existingModuleConfig) {
						if (stepSectionCode && stepSectionCode !== code) {
							Terrasoft.utils.showMessage({
								caption: Ext.String.format(localizableStrings.ModuleExistsMessage,
									existingModuleConfig.code),
								buttons: ["yes", "no"],
								defaultButton: 0,
								style: Terrasoft.MessageBoxStyles.BLUE,
								handler: function(buttonCode) {
									if (buttonCode === "yes") {
										loadExistingSection(existingModuleConfig, callback);
									} else {
										SectionDesignDataModule.getDesignData(function(data) {
											callback(data, false);
										});
									}
								}
							});
						} else {
							loadExistingSection(existingModuleConfig, callback);
						}
					} else {
						checkExistingEntitySchema(config, callback);
					}
				}
			});
		}

		/**
		 * Загружает информацию о существующем разделе
		 * @private
		 * @param {Object} existingModuleConfig конфигурация существующего раздела
		 * @param {Function} callback
		 */
		function loadExistingSection(existingModuleConfig, callback) {
			SectionDesignDataModule.resetDesignData();
			SectionDesignDataModule.setModuleStructureInfo(existingModuleConfig);
			var entitySchemeNames = [
				existingModuleConfig.entityName,
				existingModuleConfig.entityTagName,
				existingModuleConfig.entityInTagName,
				existingModuleConfig.entityFolderName,
				existingModuleConfig.entityInFolderName
			];
			var clientUnitSchemaNames = ["sectionSchemaName", "sectionDetailName"];
			var propertyValuesArray = Terrasoft.getPropertyValuesArray(clientUnitSchemaNames,
					existingModuleConfig);
			var clientUnitNames = Terrasoft.deleteEmptyItems(propertyValuesArray);
			for (var i = 0, pageCount = existingModuleConfig.pages.length; i < pageCount; i++) {
				var page = existingModuleConfig.pages[i];
				if (clientUnitNames.indexOf(page.name) === -1) {
					clientUnitNames.push(page.name);
				}
			}
			SectionDesignDataModule.getEntitySchemeByName(entitySchemeNames, function() {
				SectionDesignDataModule.getClientUnitSchemeByName(clientUnitNames, function() {
					SectionDesignDataModule.getDesignData(callback);
				}, this);
			}, this);
		}

		function refreshPagesConfig() {
			var mainModuleName = SectionDesignDataModule.getMainModuleName();
			var moduleConfig = SectionDesignDataModule.getModuleStructure(mainModuleName);
			if (!moduleConfig) {
				return;
			}
			var pages = moduleConfig.pages;
			if (!pages) {
				return;
			}
			var sortedPages = pages.sort(function(a, b) {
				if (a.position > b.position) { return 1; }
				else if (a.position < b.position) { return -1; }
				else { return 0; }
			});
			var collection = designerStructureCollection.collection;
			var pageItem = collection.get("Page");
			pageItem.subItems.clear();
			var subItems = new Terrasoft.Collection();
			Terrasoft.each(sortedPages, function(item) {
				if (!subItems.contains(item.name)) {
					subItems.add(item.name, {
						key: item.name,
						name: item.name,
						caption: Ext.String.format(localizableStrings.HeaderPageMenuItemCaption, moduleConfig.caption,
							item.pageCaption)
					});
				}
			});
			if (subItems.getCount() > 1) {
				pageItem.subItems = subItems;
			}
			sandbox.publish("RefreshSteps", onGetDesignerStructureConfig());
		}

		/**
		 * Проверяет существование объекта с соответствующим кодом и возможность его использования в качестве объекта
		 * раздела. если объект не существует - создает его
		 * @private
		 * @param {Object} config конфигурация раздела
		 * @param {Function} callback
		 */
		function checkExistingEntitySchema(config, callback) {
			var code = config.sectionCode;
			var icon = config.sectionIconId;
			var logo = config.sectionLogoId;
			SectionDesignDataModule.loadLikeSchemaNames(code, function(codeLikeSchema) {
				var requiredSchema = [
					code,
						code + "Folder",
						code + "InFolder",
						code + "Tag",
						code + "InTag",
						code + "File",
						code + "Type",
						code + "Detail"
				];
				var intersectedSchema = Ext.Array.intersect(requiredSchema, codeLikeSchema);
				var entitySchemaExisted = (intersectedSchema.indexOf(code) >= 0);
				var allowUse = true;
				if (entitySchemaExisted) {
					intersectedSchema.splice(0, 1);
					allowUse = (intersectedSchema.length === 0);
				}
				if (allowUse) {
					var sectionConfig = {
						code: code,
						caption: config.sectionCaption,
						sectionIconId: icon,
						sectionLogoId: logo,
						workplaceId: config.workplaceId
					};
					if (entitySchemaExisted) {
						Terrasoft.utils.showMessage({
							caption: Ext.String.format(localizableStrings.SchemaExistsMessage, code),
							buttons: ["yes", "no"],
							defaultButton: 0,
							style: Terrasoft.MessageBoxStyles.BLUE,
							handler: function(buttonCode) {
								if (buttonCode === "yes") {
									SectionDesignDataModule.resetDesignData();
									SectionDesignDataModule.getEntitySchemaByName({
										name: code,
										callback: function(sectionEntitySchema) {
											sectionConfig.sectionEntitySchema = sectionEntitySchema;
											var sectionDesignData =
												SectionDesignerUtils.createModuleScheme(sectionConfig);
											delete sectionDesignData.data;
											SectionDesignDataModule.setDesignData(sectionDesignData);
											SectionDesignDataModule.getDesignData(callback);
										}
									});
								} else {
									SectionDesignDataModule.getDesignData(function(data) {
										callback(data, false);
									});
								}
							}
						});
					} else {
						var isCodeValid = SectionDesignerUtils.validateNamePrefix(code);
						if (isCodeValid) {
							SectionDesignDataModule.resetDesignData();
							var sectionDesignData =
								SectionDesignerUtils.createModuleScheme(sectionConfig);
							sectionDesignData.needCreateTypeColumn = true;
							delete sectionDesignData.data;
							SectionDesignDataModule.setDesignData(sectionDesignData);
							SectionDesignDataModule.getDesignData(callback);
						} else {
							var invalidMessage = Ext.String.format(localizableStrings.WrongPrefixMessage,
								SectionDesignerUtils.getSchemaNamePrefix());
							Terrasoft.utils.showMessage({
									caption: invalidMessage,
									buttons: ["ok"],
									defaultButton: 0,
									style: Terrasoft.MessageBoxStyles.BLUE,
									handler: function() {
										SectionDesignDataModule.getDesignData(function(data) {
											callback(data, false);
										});
									}
								}
							);
						}
					}
				} else {
					Terrasoft.utils.showMessage({
							caption: Ext.String.format(localizableStrings.SysSchemaExists, code),
							buttons: ["ok"],
							defaultButton: 0,
							style: Terrasoft.MessageBoxStyles.BLUE,
							handler: function() {
								SectionDesignDataModule.getDesignData(function(data) {
									callback(data, false);
								});
							}
						}
					);
				}
			});
		}

		return {
			init: init,
			render: render,
			isAsync: true
		};
	}
);