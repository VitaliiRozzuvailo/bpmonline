define("FolderManager", ["FolderManagerResources", "ConfigurationConstants", "MaskHelper", "BaseSchemaModuleV2"],
	function(resources, ConfigurationConstants, MaskHelper) {
		/**
		 * @class Terrasoft.configuration.FolderManager
		 * Класс FolderManager предназначен для создания модуля групп
		 */
		Ext.define("Terrasoft.configuration.FolderManager", {
			alternateClassName: "Terrasoft.FolderManager",
			extend: "Terrasoft.BaseSchemaModule",

			Ext: null,
			sandbox: null,
			Terrasoft: null,

			/**
			 * Настройки для менеджера групп
			 * @private
			 * @type {Object}
			 */
			config: null,

			/**
			 * Содержит контейнер для отрисовки
			 * @private
			 * @type {Object}
			 */
			container: null,

			/**
			 * Модель представления менеджера групп
			 * @private
			 * @type {Object}
			 */
			viewModel: null,

			/**
			 * Представление модели менеджера групп
			 * @private
			 * @type {Object}
			 */
			view: null,

			/**
			 * Конфигурация представления менеджера групп
			 * @private
			 * @type {Object}
			 */
			FolderManagerView: null,

			/**
			 * Конфигурация модели пердставления менеджера групп
			 * @private
			 * @type {Object}
			 */
			FolderManagerViewModel: null,

			/**
			 * Сообщения модуля
			 */
			messages: {
				/**
				 * @message FolderInfo
				 * Запрашивает конфигурацию для инициализации модуля групп
				 */
				"FolderInfo": {
					mode: Terrasoft.MessageMode.PTP,
					direction: Terrasoft.MessageDirectionType.PUBLISH
				},

				/**
				 * @message AddFolderActionFired
				 * Сообщение добавления новой группы
				 */

				"AddFolderActionFired": {
					mode: Terrasoft.MessageMode.BROADCAST,
					direction: Terrasoft.MessageDirectionType.SUBSCRIBE
				},

				/**
				 * @message UpdateFavoritesMenu
				 * Сообщение обновления меню Избранное
				 */
				"UpdateFavoritesMenu": {
					mode: Terrasoft.MessageMode.BROADCAST,
					direction: Terrasoft.MessageDirectionType.PUBLISH
				},

				/**
				 * @message ResultSelectedFolders
				 * Сообщение запрос на выбранные группы
				 */
				"ResultSelectedFolders": {
					mode: Terrasoft.MessageMode.BROADCAST,
					direction: Terrasoft.MessageDirectionType.PUBLISH
				},

				/**
				 * @message BackHistoryState
				 * Сообщение возврата по цепочке состояний
				 */
				"BackHistoryState": {
					mode: Terrasoft.MessageMode.BROADCAST,
					direction: Terrasoft.MessageDirectionType.PUBLISH
				},

				/**
				 * @message PushHistoryState
				 * Сообщение изменения в цепочке состояний
				 */
				"PushHistoryState": {
					mode: Terrasoft.MessageMode.BROADCAST,
					direction: Terrasoft.MessageDirectionType.PUBLISH
				},

				/**
				 * @message CustomFilterExtendedMode
				 * Сообщение переключения вида пользовательской фильтрации
				 */
				"CustomFilterExtendedMode": {
					mode: Terrasoft.MessageMode.BROADCAST,
					direction: Terrasoft.MessageDirectionType.PUBLISH
				},

				/**
				 * @message UpdateCustomFilterMenu
				 * Сообщение обновления меню пользовательской фильтрации
				 */
				"UpdateCustomFilterMenu": {
					mode: Terrasoft.MessageMode.BROADCAST,
					direction: Terrasoft.MessageDirectionType.PUBLISH
				},

				/**
				 * @message GetRecordInfo
				 * Сообщение запрашивает конфигурацию записи
				 */
				"GetRecordInfo": {
					mode: Terrasoft.MessageMode.PTP,
					direction: Terrasoft.MessageDirectionType.SUBSCRIBE
				},

				/**
				 * @message GetHistoryState
				 * Сообщение запрашивает текущую конфигурацию цепочки состояний содуля
				 */
				"GetHistoryState": {
					mode: Terrasoft.MessageMode.PTP,
					direction: Terrasoft.MessageDirectionType.PUBLISH
				},

				/**
				 * @message HideFolderTree
				 * Сообщение закрытия модуля групп
				 */
				"HideFolderTree": {
					mode: Terrasoft.MessageMode.BROADCAST,
					direction: Terrasoft.MessageDirectionType.PUBLISH
				},

				/**
				 * @message ResultFolderFilter
				 * Сообщение запрашивает результирующую коллекцию фильтров
				 */
				"ResultFolderFilter": {
					mode: Terrasoft.MessageMode.BROADCAST,
					direction: Terrasoft.MessageDirectionType.PUBLISH
				},

				/**
				 * @message UpdateFilter
				 * Сообщение применяет фильтры групп
				 */
				"UpdateFilter": {
					mode: Terrasoft.MessageMode.BROADCAST,
					direction: Terrasoft.MessageDirectionType.PUBLISH
				},

				/**
				 * @message LookupInfo
				 * Для работы LookupUtilities
				 */
				"LookupInfo": {
					mode: Terrasoft.MessageMode.PTP,
					direction: Terrasoft.MessageDirectionType.SUBSCRIBE
				},

				/**
				 * @message ResultSelectedRows
				 * Сообщение возвращает выбранные группы
				 */
				"ResultSelectedRows": {
					mode: Terrasoft.MessageMode.PTP,
					direction: Terrasoft.MessageDirectionType.SUBSCRIBE
				},

				/**
				 * @message UpdateCatalogueFilter
				 * Сообщение применяет фильтры каталога
				 */
				"UpdateCatalogueFilter": {
					mode: Terrasoft.MessageMode.BROADCAST,
					direction: Terrasoft.MessageDirectionType.PUBLISH
				},

				/**
				 * @message CloseExtendCatalogueFilter
				 * Сообщение закрытия модуля расширенной фильтрации атрибутов
				 */
				"CloseExtendCatalogueFilter": {
					mode: Terrasoft.MessageMode.PTP,
					direction: Terrasoft.MessageDirectionType.SUBSCRIBE
				},

				/**
				 * @message GetExtendCatalogueFilterInfo
				 * Сообщение возвращает конфигурацию для модуля расширенной фильтрации атрибутов
				 */
				"GetExtendCatalogueFilterInfo": {
					mode: Terrasoft.MessageMode.PTP,
					direction: Terrasoft.MessageDirectionType.SUBSCRIBE
				},

				/**
				 * @message UpdateExtendCatalogueFilter
				 * Сообщение применяет фильтры модуля расширенной фильтрации атрибутов
				 */
				"UpdateExtendCatalogueFilter": {
					mode: Terrasoft.MessageMode.PTP,
					direction: Terrasoft.MessageDirectionType.SUBSCRIBE
				}
			},

			/**
			 * Регистрация сообщений
			 * @protected
			 */
			registerMessages: function() {
				this.sandbox.registerMessages(this.messages);
			},

			/**
			 * Инициализирует модуль менеджера групп
			 * @param callback
			 * @param scope
			 */
			init: function(callback, scope) {
				this.registerMessages();
				this.config = this.sandbox.publish("FolderInfo", null, [this.sandbox.id]);
				this.config.enableMultiSelect = true;
				if (this.config.currentFilter) {
					this.config.enableMultiSelect = true;
					this.config.selectedFolders = [this.config.currentFilter];
					this.config.currentFilter = null;
					this.config.multiSelect = true;
				}
				if (!this.config.folderFilterViewId) {
					this.config.folderFilterViewId = "FolderManagerView";
				}
				if (!this.config.folderFilterViewModelId) {
					this.config.folderFilterViewModelId = "FolderManagerViewModel";
				}
				this.config.allFoldersRecordItem = {
					value: Terrasoft.GUID_EMPTY,
					displayValue: resources.localizableStrings.AllFoldersCaptionV2
				};
				this.config.favoriteRootRecordItem = {
					value: Terrasoft.generateGUID(),
					displayValue: resources.localizableStrings.FavoriteFoldersCaptionV2
				};
				if (callback) {
					callback.call(scope || this);
				}
			},

			/**
			 * Отрисовывает представление модуля менеджера групп
			 * @param renderTo
			 */
			render: function(renderTo) {
				this.container = renderTo;
				if (this.config.entitySchema) {
					this.initializeModule();
				} else {
					this.sandbox.requireModuleDescriptors([this.config.entitySchemaName], function() {
						this.Terrasoft.require([this.config.entitySchemaName], function(schema) {
							this.config.entitySchema = schema;
							this.initializeModule();
						}, this);
					}, this);
				}
			},

			/**
			 * Инициализирует модель представления модуля менеджера групп
			 * @protected
			 */
			initializeModule: function() {
				this.Terrasoft.require([this.config.folderFilterViewId, this.config.folderFilterViewModelId],
					function(filterView, filterViewModel) {
						this.FolderManagerView = filterView;
						this.FolderManagerView.sandbox = this.sandbox;
						this.FolderManagerViewModel = filterViewModel;
						this.FolderManagerViewModel.sandbox = this.sandbox;
						this.FolderManagerViewModel.renderTo = this.container;
						if (!this.viewModel) {
							var viewModelConfig = this.FolderManagerViewModel.generate(this.sandbox, this.config);
							this.viewModel = this.Ext.create("Terrasoft.BaseViewModel", viewModelConfig);
							this.viewModel.init(this.config);
						} else {
							this.viewModel.resetFolderView();
						}
						var viewConfig = this.FolderManagerView.generate(this.sandbox);
						this.view = this.Ext.create("Terrasoft.Container", viewConfig);
						this.view.bind(this.viewModel);
						var sectionSchema = this.config.sectionEntitySchema;
						if (sectionSchema) {
							var currentModule = this.Terrasoft.configuration.ModuleStructure[sectionSchema.name];
							if (currentModule) {
								var headerName = this.Ext.String.format("{0} {1}",
									resources.localizableStrings.StaticCaptionPartHeaderGroupV2, currentModule.moduleCaption);
								this.viewModel.set("GroupPageCaption", headerName);
							}
						}
						this.view.render(this.container);
						MaskHelper.HideBodyMask();
						var activeRow = this.config.activeFolderId;
						this.viewModel.setActiveRow(activeRow);
						this.sandbox.subscribe("AddFolderActionFired", function(config) {
							switch (config.type) {
								case "generalFolder":
									this.viewModel.addGeneralFolderButton();
									break;
								case "searchFolder":
									this.viewModel.addSearchFolderButton();
									break;
							}
						}, this);
					}, this);
			},

			/**
			 * Очищает все подписки на события и уничтожает объект.
			 * @overridden
			 * @param {Object} config Параметры уничтожения модуля
			 */
			destroy: function(config) {
				if (config.keepAlive !== true) {
					if (this.viewModel) {
						this.viewModel.destroy();
						this.viewModel = null;
					}
					this.callParent(arguments);
				}
			}
		});
		return Terrasoft.FolderManager;
	});