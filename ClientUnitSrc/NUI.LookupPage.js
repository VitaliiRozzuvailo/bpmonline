define("LookupPage", ["ext-base", "MaskHelper", "LookupPageViewGenerator", "LookupPageViewModelGenerator",
	"LookupUtilities"],
	function(Ext, MaskHelper, LookupPageViewGenerator, LookupPageViewModelGenerator, LookupUtilities) {

		return Ext.define("Terrasoft.configuration.LookupPage", {
			extend: "Terrasoft.BaseObject",
			alternateClassName: "Terrasoft.LookupPage",

			Ext: null,

			sandbox: null,

			Terrasoft: null,

			/**
			 * Признак того, что модуль инциализируется асинхронно
			 * @private
			 * @type {Boolean}
			 */
			isAsync: true,

			/**
			 * Конфиг Lookup-а
			 * @private
			 * @type {Object}
			 */
			lookupInfo: null,

			/**
			 * Ссылка на ViewModel LookupPage-а
			 * Инициализируется перед отрисовкой
			 * @private
			 * @type {Object}
			 */
			viewModel: null,

			/**
			 * Ссылка на контейнер в котором будет отрисован ModalBox.
			 * Инициализируется перед отрисовкой
			 * @private
			 * @type {Object}
			 */
			renderContainer: null,

			/**
			 * Флаг, который имеет значение если модуль был загружени из CardProcessModule
			 * @private
			 * @type {Boolean}
			 */
			processModuleFlag: false,

			/**
			 * Иницализирует начальные значения модуля,
			 * в зависимости от результата публикации сообщения 'CardProccessModuleInfo'
			 * модуль инициализируеться для работы в модальном окне или в centerPanel
			 * @private
			 */
			init: function(callback, scope) {
				callback = callback || function() {
				};
				if (this.viewModel) {
					callback.call(scope);
					return;
				}

				this.lookupInfo = this.sandbox.publish("LookupInfo", null, [this.sandbox.id]);
				this.processModuleFlag = this.sandbox.publish("CardProccessModuleInfo", null, [this.sandbox.id]);

				this.initHistoryState();

				this.getSchemaAndProfile(this.lookupInfo.lookupPostfix, function(entitySchema, profile) {
					if (this.isDestroyed) {
						return;
					}

					this.lookupInfo.searchColumn = {
						value: entitySchema.primaryDisplayColumn.name,
						displayValue: entitySchema.primaryDisplayColumn.caption
					};
					this.lookupInfo.entitySchema = entitySchema;
					this.lookupInfo.gridProfile = profile;

					var viewModel = this.viewModel = this.generateViewModel();
					viewModel.init();
					var entityStructure = Terrasoft.configuration.EntityStructure[viewModel.entitySchema.name];
					if (this.lookupInfo.selectedValues) {
						viewModel.set("RestoreSelectedData", this.lookupInfo.selectedValues);
					}
					if (profile && !((profile.captionsConfig && profile.listedColumnsConfig) || profile.tiledColumnsConfig)) {
						var newProfile = viewModel.getDefaultProfile();
						Terrasoft.utils.saveUserProfile(newProfile.key, newProfile, true, function(response) {
							if (!response.success) {
								return;
							}
							this.lookupInfo.gridProfile = newProfile;
							viewModel.set("gridProfile", newProfile);

							viewModel.updateSortColumnsCaptions();
							viewModel.load();
							callback.call(scope);
						}, this);
					} else {
						viewModel.updateSortColumnsCaptions();
						viewModel.load();
						callback.call(scope);
					}
					if (this.lookupInfo.isQuickAdd && entityStructure && entityStructure.pages) {
						var cardInfo = viewModel.getCurrentCardInfo();
						viewModel.actionButtonClick("add/" + cardInfo.cardSchemaName);
					}
				});
			},

			/**
			 * Выполняет отрисовку модуля в контейнер
			 * @protected
			 * @param {Object} renderTo контейнер в который будет отрисован модуль
			 */
			render: function(renderTo) {
				this.renderContainer = renderTo.id;
				this.renderLookupView(this.lookupInfo.entitySchema, this.lookupInfo.gridProfile);
			},

			generateViewModel: function() {
				var viewModelConfig = LookupPageViewModelGenerator.generate(this.lookupInfo);
				if (!this.lookupInfo.columnValue && this.lookupInfo.searchValue) {
					viewModelConfig.values.searchData = this.lookupInfo.searchValue;
					viewModelConfig.values.previousSearchData = this.lookupInfo.searchValue;
				}
				var viewModel = Ext.create("Terrasoft.BaseViewModel", viewModelConfig);
				viewModel.Ext = this.Ext;
				viewModel.sandbox = this.sandbox;
				viewModel.Terrasoft = this.Terrasoft;

				if (this.lookupInfo.updateViewModel) {
					this.lookupInfo.updateViewModel.call(viewModel);
				}
				viewModel.initCaptionLookup();
				viewModel.initHasActions();
				viewModel.initLoadedColumns();
				if (!Ext.isEmpty(this.lookupInfo.filterObjectPath)) {
					viewModel.updateFilterByFilterObjectPath(this.lookupInfo.filters, this.lookupInfo.filterObjectPath);
				}
				if (this.lookupInfo.hideActions) {
					viewModel.set("hasActions", false);
				}
				return viewModel;
			},

			initHistoryState: function() {
				if (!this.processModuleFlag) {
					return;
				}
				var state = this.sandbox.publish("GetHistoryState");
				var currentHash = state.hash;
				var currentState = state.state || {};
				if (currentState.moduleId === this.sandbox.id) {
					return;
				}
				this.sandbox.publish("ReplaceHistoryState", {
					stateObj: {
						moduleId: this.sandbox.id
					},
					pageTitle: null,
					hash: currentHash.historyState,
					silent: true
				});
			},

			/**
			 * Получает схему и настройки профиля для справочника
			 * @private
			 * @param {String} lookupPostfix строка, используемая для формирования ключа для поиска настройки колонок
			 * @param {Function} callback функция которая будет выполнена по окончании загрузки в контексте самого модуля
			 */
			getSchemaAndProfile: function(lookupPostfix, callback) {
				var entitySchemaName = this.lookupInfo.entitySchemaName;
				this.sandbox.requireModuleDescriptors([entitySchemaName], function() {
					var columnsSettingsProfileKey = "GridSettings_" + this.lookupInfo.entitySchemaName;
					var me = this;
					var profileKey = "profile!" + columnsSettingsProfileKey;
					if (!this.Ext.isEmpty(lookupPostfix)) {
						profileKey += lookupPostfix;
					}
					require([entitySchemaName, profileKey], function(entitySchema, profile) {
						var fixedProfile = me.actualizeProfile(entitySchema, profile);
						callback.call(me, entitySchema, fixedProfile);
					});
				}, this);
			},

			/**
			 * Выполняет отрисовку Lookup-а в соответствии со схемой и настройкой профиля
			 * Для процесов отрисовывается на все окно, для справочников в modalBox
			 * @private
			 * @param {Object} schema EntitySchema обьекта
			 * @param {Object} profile настройка профиля
			 */
			renderLookupView: function(schema, profile) {
				var configArgs = {};
				configArgs.actionsMenuConfig = LookupPageViewGenerator.getActionsMenuConfig(schema.name);
				configArgs.captionConfig = schema.columns[schema.primaryDisplayColumnName].caption;
				configArgs.entitySchema = schema;
				configArgs.isRunProcessPage = this.lookupInfo.isRunProcessPage;
				configArgs.columnsSettingsProfile = profile;
				Ext.apply(configArgs, this.lookupInfo);
				var fixedViewConfig = LookupPageViewGenerator.generateFixed(configArgs);
				var fixedView = Ext.create(fixedViewConfig.className || "Terrasoft.Container", fixedViewConfig);
				fixedView.bind(this.viewModel);
				fixedView.render(LookupUtilities.GetFixedHeaderContainer());
				var gridViewConfig = LookupPageViewGenerator.generateGrid(configArgs);
				var gridView = Ext.create(gridViewConfig.className || "Terrasoft.Container", gridViewConfig);
				gridView.bind(this.viewModel);
				gridView.render(LookupUtilities.GetGridContainer());
				if (this.processModuleFlag) {
					this.loadCommandLine();
				}
				MaskHelper.HideBodyMask();
			},

			/**
			 * Устанавливает фокус на строке поиска после отрисовки
			 * @private
			 */
			loadCommandLine: function() {
				var commandLineContainer = Ext.get("module-command-line");
				if (!this.lookupInfo.commandLineEnabled || Ext.isEmpty(commandLineContainer)) {
					return;
				}
				this.sandbox.loadModule("CommandLineModule", {
					renderTo: commandLineContainer
				});
			},

			actualizeProfile: function(entitySchema, profile) {
				if (profile.listedConfig) {
					var viewGenerator = Ext.create("Terrasoft.ViewGenerator");
					viewGenerator.viewModelClass = this;
					this.entitySchema = entitySchema;
					this.columns = entitySchema.columns;
					var newProfile = {
						listedConfig: Ext.decode(profile.listedConfig),
						tiledConfig: Ext.decode(profile.tiledConfig),
						isTiled: profile.type === "tiled",
						type: profile.type,
						key: profile.key
					};
					viewGenerator.actualizeGridConfig(newProfile);
					this.clearLinks(newProfile);
					return {
						isTiled: newProfile.isTiled,
						key: newProfile.key,
						listedColumnsConfig: Ext.encode(newProfile.listedConfig.columnsConfig),
						captionsConfig: Ext.encode(newProfile.listedConfig.captionsConfig),
						tiledColumnsConfig: Ext.encode(newProfile.tiledConfig.columnsConfig),
						type: newProfile.type
					};
				}
				return profile;
			},

			clearLinks: function(profile) {
				Terrasoft.each(profile.listedConfig.columnsConfig, function(item) {
					if (item.hasOwnProperty("link")) {
						delete item.link;
					}
				}, this);
				Terrasoft.each(profile.tiledConfig.columnsConfig, function(rowItem) {
					Terrasoft.each(rowItem, function(item) {
						if (item.hasOwnProperty("link")) {
							delete item.link;
						}
					}, this);
				}, this);
			}
		});
	});
