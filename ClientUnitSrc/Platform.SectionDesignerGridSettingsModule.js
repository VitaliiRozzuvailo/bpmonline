define("SectionDesignerGridSettingsModule", ["ext-base", "terrasoft", "sandbox",
		"SectionDesignerGridSettingsModuleResources", "SectionDesignerUtils", "SectionDesignDataModule",
		"ConfigurationEnums", "SectionDesignerEnums", "GridSettingsV2"],
	function(Ext, Terrasoft, sandbox, resources, SectionDesignerUtils, SectionDesignDataModule, ConfigurationEnums,
		SectionDesignerEnums) {
		var view,
			viewModel,
			entityName,
			entitySchema,
			sectionSchemaName,
			gridSettingsData;

		/**
		 * Локализированные строки ресурсов.
		 * @private
		 * @type {Object}
		 */
		var localizableStrings = resources.localizableStrings;

		/**
		 * Инициирует переход к определенному шагу.
		 * @private
		 * @param {StepType} step
		 */
		function goToStep(step) {
			sandbox.publish("GoToStep", {
				stepCompleteResult: step
			});
		}

		/**
		 * Функция создания модели представления.
		 * @private
		 * @return (Terrasoft.BaseViewModel) Модель представления.
		 */
		function getViewModel() {
			var config = {
				values: {
					header: localizableStrings.PageCaption
				},
				methods: {
					onPreviousButtonClick: function() {
						goToStep(SectionDesignerEnums.StepType.PREV);
					},
					onNextButtonClick: function() {
						goToStep(SectionDesignerEnums.StepType.NEXT);
					},
					onApplyButtonClick: function() {
						goToStep(SectionDesignerEnums.StepType.FINISH);
					},
					onSaveButtonClick: function() {
						goToStep(SectionDesignerEnums.StepType.FINISH);
					},
					saveProfile: function(profile) {
						gridSettingsData.modifiedData = profile;
						var designData = {
							gridSettings: gridSettingsData
						};
						SectionDesignDataModule.setDesignData(designData);
					},
					onCancelButtonClick: function() {
						goToStep(SectionDesignerEnums.StepType.EXIT);
					},
					onViewRendered: function() {
						sandbox.publish("ModuleLoaded");
					}
				}
			};
			return Ext.create("Terrasoft.BaseViewModel", config);
		}

		/**
		 * Функция создания представления.
		 * @private
		 * @return {Terrasoft.Container} Представление.
		 */
		function getView() {
			var config = {
				id: "sectionDesignerGridSettings",
				selectors: {
					wrapEl: "#sectionDesignerGridSettings"
				},
				items: [
					{
						className: "Terrasoft.Container",
						id: "sectionDesignerGridSettingsContainer",
						selectors: {
							wrapEl: "#sectionDesignerGridSettingsContainer"
						},
						classes: {
							wrapClassName: ["grid-settings-main-container"]
						},
						afterrender: {
							bindTo: "onViewRendered"
						}
					}
				]
			};
			return Ext.create("Terrasoft.Container", config);
		}

		/**
		 * Функция загрузки модуля настройки реестра.
		 * @private
		 */
		function loadGridSettingsModule() {
			var sandboxId = sandbox.id;
			var gridSettingsId = sandboxId + "_GridSettings";
			var profile = gridSettingsData.modifiedData;
			sandbox.subscribe("GetGridSettingsInfo", function() {
				var gridSettingsInfo = {
					entitySchemaName: entityName,
					hideButtons: true,
					hideCaption: true,
					propertyName: "DataGrid",
					baseGridType: profile.isTiled
						? ConfigurationEnums.GridType.TILED
						: ConfigurationEnums.GridType.LISTED,
					profile: profile,
					profileKey: profile.key,
					isNested: true
				};
				return gridSettingsInfo;
			}, [gridSettingsId]);
			var callback = function(schema) {
				entitySchema = schema;
				sandbox.loadModule("GridSettingsV2", {
					renderTo: "sectionDesignerGridSettingsContainer",
					id: gridSettingsId,
					keepAlive: true
				});
			};
			SectionDesignDataModule.getEntitySchemaByName({
				name: entityName,
				callback: callback,
				scope: this,
				isOriginal: false
			});
		}

		/**
		 * Возвращает конфигурационный объект верхней панели.
		 * @return{Object} Конфигурационный объект верхней панели.
		 */
		function getHeaderConfig() {
			var mainModuleName = SectionDesignDataModule.getMainModuleName();
			var moduleConfig = SectionDesignDataModule.getModuleStructure(mainModuleName);
			return {
				header: Ext.String.format(localizableStrings.PageCaption, moduleConfig.caption),
				buttons: {
					Next: {
						enabled: false
					}
				}
			};
		}

		/**
		 * Функция отрисовки модуля.
		 * @param {Ext.Element} renderTo Контейнер для отрисовки модуля.
		 */
		var render = function(renderTo) {
			var viewModelEmpty = Ext.isEmpty(viewModel);
			if (viewModelEmpty) {
				viewModel = getViewModel();
				sandbox.subscribe("IsStepReady", function() {
					var profile = sandbox.publish("GetProfileData");
					viewModel.saveProfile(profile);
					return true;
				});
			}
			view = getView();
			view.bind(viewModel);
			view.render(renderTo);
			if (viewModelEmpty) {
				var profileKey = sectionSchemaName + "GridSettingsGridDataView";
				if (Ext.Object.isEmpty(gridSettingsData.modifiedData) ||
						(gridSettingsData.modifiedData.key !== profileKey)) {
					require(["profile!" + profileKey], function(profile) {
						profile.key = profileKey;
						profile.isTiled = profile.isTiled || true;
						gridSettingsData.originalData = Terrasoft.deepClone(profile);
						gridSettingsData.modifiedData = Terrasoft.deepClone(profile);
						loadGridSettingsModule();
					});
				} else {
					loadGridSettingsModule();
				}
			}
		};

		/**
		 * Функция инициализации модуля.
		 */
		var init = function() {
			if (!entityName) {
				sandbox.subscribe("GetEntitySchema", function(schemaName) {
					if (entityName === schemaName) {
						return entitySchema;
					}
					return null;
				});
				var config = sandbox.publish("GetStepConfig");
				entityName = config.sectionCode;
				SectionDesignDataModule.getDesignData(function(data) {
					gridSettingsData = Terrasoft.deepClone(data.gridSettings);
					var moduleData = data.module;
					sectionSchemaName = moduleData[entityName].sectionSchemaName;
				});
			}
			sandbox.publish("SetPageHeaderInfo", getHeaderConfig());
			sandbox.subscribe("GetHeaderConfig", getHeaderConfig);
		};

		return {
			render: render,
			init: init
		};
	}
);
