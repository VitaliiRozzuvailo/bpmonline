define("ProcessEntryPointUtilities", ["ModalBox", "ProcessModuleUtilities", "ProcessEntryPointModule"],
	function(ModalBox, ProcessModuleUtilities) {
		/**
		 * @class Terrasoft.configuration.mixins.ProcessEntryPointUtilities
		 * Миксин, реализующий работу с модулем ProcessEntryPointModule
		 */
		Ext.define("Terrasoft.configuration.mixins.ProcessEntryPointUtilities", {
			alternateClassName: "Terrasoft.ProcessEntryPointUtilities",

			/**
			 * Ширина (в пикселях) окна выбора точек входа
			 */
			processEntryPointModuleWidth: 400,

			/**
			 * Высота (в пикселях) окна выбора точек входа
			 * @type {Number}
			 */
			processEntryPointModuleHeight: 205,

			/**
			 * Название первичной колонки
			 * @type {String}
			 */
			primaryColumnName: "",

			/**
			 * Получает значение свойства "Видимость" для кнопки "Продолжить по процессу"
			 * @param entryPointsCount
			 * @return {Boolean} Возвращает значение свойства "Видимость" для кнопки "Продолжить по процессу"
			 */
			getProcessEntryPointButtonVisible: function(entryPointsCount) {
				return (entryPointsCount > 0);
			},

			/**
			 * Получает список возможных точек входа для сущности.
			 * Если точка входа одна - открывает процесс. Иначе - открывает окно выбора точек входа
			 */
			handle: function() {
				this.initAvailableProcessEntryPointsList(function(processList) {
					var primaryColumnValue = this.get(this.primaryColumnName);
					var processListCount = processList.getCount();
					if (processListCount > 1) {
						this.openProcessEntryPointModule(processList, primaryColumnValue);
					} else if (processListCount === 1) {
						var process = processList.getByIndex(0);
						var processElementUId = process.value;
						this.openProcess(processElementUId, primaryColumnValue);
					}
				});
			},

			/**
			 * Инициирует продолжение работы по процессу для записи в разделе
			 */
			onProcessEntryPointGridRowButtonClick: function() {
				this.primaryColumnName = "ActiveRow";
				this.handle();
			},

			/**
			 * Инициирует продолжение работы по процессу для карточки
			 */
			onProcessEntryPointButtonClick: function() {
				this.primaryColumnName = "Id";
				this.handle();
			},

			/**
			 * Получает список доступных точек входа для сущности.
			 * @private
			 * @param {Function} callback callback-функция
			 */
			initAvailableProcessEntryPointsList: function(callback) {
				if (!this.entitySchema) {
					callback.call(this);
					return;
				}
				var info = {
					primaryColumnValue: this.get(this.primaryColumnName),
					entitySchemaUId: this.entitySchema.uId
				};
				this.sandbox.publish("GetProcessEntryPointsData", {
					entitySchemaUId: info.entitySchemaUId,
					recordId: info.primaryColumnValue,
					callback: function(processes) {
						var collection = this.Ext.create("Terrasoft.Collection");
						this.Terrasoft.each(processes, function(process) {
							collection.add(process.id, {
								value: process.id,
								displayValue: process.caption
							});
						}, this);
						callback.call(this, collection);
					},
					scope: this
				});
			},

			/**
			 * Получает список доступных процессов в разделе
			 * @private
			 * @param {Terrasoft.Collection} availableProcessEntryPoints список доступных точек входа для сущности.
			 */
			initSectionAvailableProcessList: function(availableProcessEntryPoints) {
				var sectionAvailableProcesses = this.Ext.create("Terrasoft.Collection");
				if (!availableProcessEntryPoints) {
					availableProcessEntryPoints = this.Ext.create("Terrasoft.Collection");
				}
				if (this.Ext.isEmpty(this.entitySchemaName)) {
					this.fillRunProcessButtonMenu(availableProcessEntryPoints, sectionAvailableProcesses);
					return;
				}
				var moduleStructure = this.Terrasoft.configuration.ModuleStructure[this.entitySchemaName];
				if (!moduleStructure || !moduleStructure.moduleId) {
					this.fillRunProcessButtonMenu(availableProcessEntryPoints, sectionAvailableProcesses);
					return;
				}
				var moduleId = moduleStructure.moduleId;
				var filters = [];
				filters.push(Terrasoft.createExistsFilter("[ProcessInModules:SysSchemaUId:UId].Id"));
				filters.push(Terrasoft.createColumnFilterWithParameter(
					Terrasoft.ComparisonType.EQUAL, "[ProcessInModules:SysSchemaUId:UId].SysModule", moduleId));
				var select = ProcessModuleUtilities.createRunProcessSelect(filters);
				select.getEntityCollection(function(result) {
					if (this.destroyed) {
						return;
					}
					if (result.success) {
						var entities = result.collection;
						var idColumnName = "Id";
						var captionColumnName = "Caption";
						entities.each(function(entity) {
							var id = entity.get(idColumnName);
							var caption = entity.get(captionColumnName);
							sectionAvailableProcesses.add(id, {
								value: id,
								displayValue: caption
							});
						}, this);
						this.fillRunProcessButtonMenu(availableProcessEntryPoints, sectionAvailableProcesses);
					} else {
						throw new this.Terrasoft.QueryExecutionException();
					}
				}, this);
			},

			/**
			 * Открывает страницу выбора точек входа
			 * @param {Terrasoft.Collection} processList Список точек входа
			 * @param {String} primaryColumnValue Значение первичной колонки
			 */
			openProcessEntryPointModule: function(processList, primaryColumnValue) {
				var moduleId = this.sandbox.id + "_ProcessEntryPointModule";
				var container = ModalBox.show({
					widthPixels: this.processEntryPointModuleWidth,
					heightPixels: this.processEntryPointModuleHeight
				});
				this.sandbox.subscribe("GetProcessEntryPointInfo", function() {
					return {
						processList: processList,
						primaryColumnValue: primaryColumnValue
					};
				}, this, [moduleId]);
				this.sandbox.subscribe("CloseProcessEntryPointModule", function() {
					ModalBox.close();
					this.sandbox.unloadModule(moduleId);
				}, this, [moduleId]);
				this.sandbox.loadModule("ProcessEntryPointModule", {renderTo: container});
			},

			/**
			 * Открывает процесс
			 * @param processElementUId
			 * @param {String} primaryColumnValue Значение первичной колонки
			 */
			openProcess: function(processElementUId, primaryColumnValue) {
				this.sandbox.publish("ProcessExecDataChanged", {
					procElUId: processElementUId,
					recordId: primaryColumnValue,
					scope: this,
					parentMethodArguments: {id: primaryColumnValue},
					parentMethod: function(args) {
						/*window.console.log(this.Ext.String.format("Process {0} Error", args.id));*/
					}
				});
			},

			/**
			 * Устанавливает количество точек входа для сущности
			 * @param {Terrasoft.BaseViewModel} entity Источник
			 */
			setEntryPointsCount: function(entity) {
				this.set("EntryPointsCount", entity.get("EntryPointsCount"));
			},

			/**
			 * Инициализирует пункты меню кнопки "Запустить процесс".
			 * @protected
			 * @param {Boolean} isCardOpened Признак того, что открыта страница редактирования сущности.
			 */
			initRunProcessButtonMenu: function(isCardOpened) {
				this.set("IsCardOpened", isCardOpened);
				if (isCardOpened) {
					this.initAvailableProcessEntryPointsList(this.initSectionAvailableProcessList);
				} else {
					this.initSectionAvailableProcessList();
				}
			},

			/**
			 * Добавить пункт меню-разделить кнопки "Процесс".
			 * @private
			 * @param {Object} config Настройки пункта меню-разделителя.
			 */
			fillProcessButtonMenuSeparator: function(config) {
				if (!config.isCardOpened) {
					return;
				}
				var buttonMenuSeparatorConfig = {
					"values": {
						"Id": config.value,
						"Caption": config.displayValue,
						"Type": "Terrasoft.MenuSeparator"
					}
				};
				var buttonMenuSeparator = this.Ext.create("Terrasoft.BaseViewModel", buttonMenuSeparatorConfig);
				config.buttonMenuItems.add(config.value, buttonMenuSeparator);
			},

			/**
			 * Создает пункт меню кнопки "Запустить процесс".
			 * @private
			 * @param {Object} config Настройки пункта меню.
			 * @return {Terrasoft.BaseViewModel} Возвращает объект модели пункта меню кнопки.
			 */
			createRunProcessButtonMenuItem: function(config) {
				var buttonMenuItemConfig = {
					"values": {
						"Id": config.value,
						"Caption": config.displayValue,
						"Click": {"bindTo": config.methodName},
						"Tag": config.value,
						"MarkerValue": config.displayValue
					}
				};
				return this.Ext.create("Terrasoft.BaseViewModel", buttonMenuItemConfig);
			},

			/**
			 * Заполнить список пунктов меню кнопки "Запустить процесс".
			 * @private
			 * @param {Object} config Объект, содержащий значения настроек.
			 */
			fillRunProcessButtonMenuItems: function(config) {
				config.availableProcesses.each(function(availableProcess) {
					availableProcess.methodName = config.methodName;
					var buttonMenuItem = this.createRunProcessButtonMenuItem(availableProcess);
					config.buttonMenuItems.add(availableProcess.value, buttonMenuItem);
				}, this);
			},

			/**
			 * Заполнить список пунктов меню кнопки "Запустить процесс".
			 * @private
			 * @param {Terrasoft.Collection} availableProcessEntryPoints Список доступных "Точек входа" для сущности.
			 * @param {Terrasoft.Collection} sectionAvailableProcesses Список доступных в разделе процессов для запуска.
			 */
			fillRunProcessButtonMenu: function(availableProcessEntryPoints, sectionAvailableProcesses) {
				var buttonMenuItems = this.get("ProcessButtonMenuItems");
				if (buttonMenuItems) {
					buttonMenuItems.clear();
				} else {
					buttonMenuItems = this.Ext.create("Terrasoft.BaseViewModelCollection");
				}
				var isRunProcessButtonVisible = false;
				var isCardOpened = this.get("IsCardOpened");
				var availableProcessEntryPointsCount = availableProcessEntryPoints.getCount();
				if (availableProcessEntryPointsCount > 0) {
					this.fillProcessButtonMenuSeparator({
						"buttonMenuItems": buttonMenuItems,
						"isCardOpened": isCardOpened,
						"value": "separator-continueprocess-menu-item",
						"displayValue": this.get("Resources.Strings.ContinueProcessButtonMenuItemCaption")
					});
					this.fillRunProcessButtonMenuItems({
						"buttonMenuItems": buttonMenuItems,
						"availableProcesses": availableProcessEntryPoints,
						"methodName": "openProcess"
					});
					isRunProcessButtonVisible = true;
				}
				var sectionAvailableProcessesCount = sectionAvailableProcesses.getCount();
				if (sectionAvailableProcessesCount > 0) {
					this.fillProcessButtonMenuSeparator({
						"buttonMenuItems": buttonMenuItems,
						"isCardOpened": isCardOpened,
						"value": "separator-beginprocess-menu-item",
						"displayValue": this.get("Resources.Strings.BeginProcessButtonMenuItemCaption")
					});
					this.fillRunProcessButtonMenuItems({
						"buttonMenuItems": buttonMenuItems,
						"availableProcesses": sectionAvailableProcesses,
						"methodName": "runProcess"
					});
					isRunProcessButtonVisible = true;
				}
				if (isCardOpened) {
					this.set("ProcessButtonMenuItems", buttonMenuItems);
					this.set("IsProcessButtonVisible", isRunProcessButtonVisible);
					if (!((this.isAddMode && this.isAddMode()) ||
							(this.isCopyMode && this.isCopyMode()))) {
						var properties = [{
							"key": "ProcessButtonMenuItems",
							"value": buttonMenuItems
						}, {
							"key": "IsProcessButtonVisible",
							"value": isRunProcessButtonVisible
						}];
						this.sandbox.publish("GetRunProcessesProperties", properties);
					}
					return;
				}
				this.set("RunProcessButtonMenuItems", buttonMenuItems);
				this.set("IsRunProcessButtonVisible", isRunProcessButtonVisible);
			}

		});
		return Terrasoft.ProcessEntryPointUtilities;
	});
