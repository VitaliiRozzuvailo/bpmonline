define("GridSettingsV2", ["GridSettingsV2Resources", "ConfigurationConstants",
	"MaskHelper", "StructureExplorerUtilities", "GridSettingsViewGeneratorV2",
	"GridSettingsViewModelGeneratorV2", "RightUtilities", "BaseSchemaModuleV2"],
	function(resources, ConfigurationConstants, MaskHelper, StructureExplorerUtilities, viewGenerator,
		viewModelGenerator, RightUtilities) {
		/**
		 * @class Terrasoft.configuration.GridSettings
		 * Класс GridSettings предназначен для настройки профилей колонок реестров
		 */
		Ext.define("Terrasoft.configuration.GridSettings", {
			alternateClassName: "Terrasoft.GridSettings",
			extend: "Terrasoft.BaseSchemaModule",

			Ext: null,
			sandbox: null,
			Terrasoft: null,

			/**
			 * Модель представления модуля настройки колонок
			 * @private
			 * @type {Object}
			 */
			viewModel: null,

			/**
			 * Флаг, который указывает проинициализирована ли уже модель
			 * @private
			 * @type {Boolean}
			 */
			inited: false,

			/**
			 * Флаг, который указывает загружалась ли уже схема
			 * @private
			 * @type {Boolean}
			 */
			localEntitySchemaLoaded: false,

			/**
			 * Схема на основе котторой строится настройка колонок
			 * @private
			 * @type {Object}
			 */
			localEntitySchema: null,

			/**
			 * Имя схемы
			 * @private
			 * @type {String}
			 */
			schemaName: null,

			/**
			 * Флаг, который указывает ...
			 * @private
			 * @type {Boolean}
			 */
			isSingleTypeMode: false,

			/**
			 * Тип грида по умолчанию {@link Terrasoft.core.enums.GridKeyType}
			 * @private
			 * @type {String}
			 */
			baseGridType: null,

			/**
			 * Загруженный профиль
			 * @private
			 * @type {Object}
			 */
			profile: null,

			/**
			 * Ключ профиля
			 * @private
			 * @type {String}
			 */
			profileKey: null,

			/**
			 * Поключ, наименование грида
			 * @private
			 * @type {String}
			 */
			propertyName: null,

			/**
			 * Флаг, показывает скрывать ли элементы управления
			 * @private
			 * @type {Boolean}
			 */
			hideButtons: false,

			/**
			 * Флаг, показывает скрывать ли элементы управления
			 * @private
			 * @type {Boolean}
			 */
			hideGridType: false,

			/**
			 * Флаг, ...
			 * @private
			 * @type {Boolean}
			 */
			isNested: false,

			/**
			 * Признак получение данных профиля из свойства profile.
			 * @private
			 * @type {Boolean}
			 */
			useProfileField: false,

			/**
			 * Признак отображения кнопки сохранения для всех пользователей.
			 * @private
			 * @type {Boolean}
			 */
			hideAllUsersSaveButton: false,

			/**
			 * Признак, указывающий на видимость карточки редактирования сущности.
			 * @private
			 * @type {Boolean}
			 */
			isCardVisible: false,

			/**
			 * Признак, указывающий на возможность выбора колонок по обратным связям сущности.
			 * @private
			 * @type {Boolean}
			 */
			useBackwards: true,

			/**
			 * Признак, указывающий на возможность разворачивания дерева связанных объектов.
			 * @private
			 * @type {Boolean}
			 */
			firstColumnsOnly: false,

			/**
			 * Коллекция колонок реестра (Тип Tiled)
			 * @private
			 * @type {Array}
			 */
			dataCollection: [],

			/**
			 * Коллекция колонок реестра (Тип Listed)
			 * @private
			 * @type {Array}
			 */
			listedDataCollection: [],

			/**
			 * Отображаемая коллекция колонок реестра (Тип Tiled)
			 * @private
			 * @type {Array}
			 */
			viewCollection: [],

			/**
			 * Отображаемая коллекция колонок реестра (Тип Listed)
			 * @private
			 * @type {Array}
			 */
			listedViewCollection: [],

			/**
			 * DragAndDrop
			 * @private
			 * @type {Object}
			 */
			ddTargetEmptyOverride: {},

			/**
			 * Префикс класса для элемента
			 * @private
			 * @type {String}
			 */
			elementPrefix: "element",

			/**
			 * Префикс класса для элемента с плюсом
			 * @private
			 * @type {String}
			 */
			plusPrefix: "plus",

			/**
			 * Префикс класса для элемента колонки
			 * @private
			 * @type {String}
			 */
			columnPrefix: "column",

			/**
			 * Префикс класса для пустого элемента
			 * @private
			 * @type {String}
			 */
			emptyPrefix: "empty",

			/**
			 * Количество колонок в строке по умолчанию
			 * @private
			 * @type {Integer}
			 */
			rowSize: 24,

			/**
			 * Класс для выбранного элемента
			 * @private
			 * @type {String}
			 */
			selectedCellCss: "selected-column",

			/**
			 * Класс для не выбранного элемента
			 * @private
			 * @type {String}
			 */
			unselectedCellCss: "unchosen-column",

			/**
			 * Класс для заголовка реестра
			 * @private
			 * @type {String}
			 */
			titleCellCss: "grid-header",

			/**
			 * Класс для колонки с типом LINK
			 * @private
			 * @type {String}
			 */
			urlCellCss: "column-url",

			/**
			 * Иденитификатор выбранной колонки строки
			 * @private
			 * @type {String}
			 */
			selectedCellId: "",

			/**
			 * Инициализирует заголовок страницы в верхней панели
			 */
			initHeaderCaption: function() {
				this.sandbox.publish("InitDataViews", {
					caption: resources.localizableStrings.PageCaption,
					dataViews: false
				});
			},

			/**
			 * Иницализирует начальные значения модуля настройки колонок
			 * @param {Function} callback
			 */
			init: function(callback) {
				this.initHeaderCaption();
				if (this.Ext.isEmpty(this.schemaName)) {
					var gridSettingsInfo = this.sandbox.publish("GetGridSettingsInfo", null, [this.sandbox.id]);
					this.schemaName = gridSettingsInfo.entitySchemaName;
					this.isSingleTypeMode = gridSettingsInfo.isSingleTypeMode;
					this.baseGridType = gridSettingsInfo.baseGridType;
					this.profileKey = gridSettingsInfo.profileKey;
					this.propertyName = gridSettingsInfo.propertyName;
					this.hideButtons = (gridSettingsInfo.hideButtons === true);
					this.hideGridType = (gridSettingsInfo.hideGridType === true);
					this.profile = gridSettingsInfo.profile || {};
					this.isNested = (gridSettingsInfo.isNested === true);
					this.useProfileField = (gridSettingsInfo.useProfileField === true);
					this.hideAllUsersSaveButton = (gridSettingsInfo.hideAllUsersSaveButton === true);
					this.isCardVisible = gridSettingsInfo.isCardVisible;
					if (Ext.isBoolean(gridSettingsInfo.useBackwards)) {
						this.useBackwards = gridSettingsInfo.useBackwards;
					}
					if (Ext.isBoolean(gridSettingsInfo.firstColumnsOnly)) {
						this.firstColumnsOnly = gridSettingsInfo.firstColumnsOnly;
					}
					if (!this.isNested) {
						var state = this.sandbox.publish("GetHistoryState");
						var currentHash = state.hash;
						var currentState = state.state || {};
						if (currentState.moduleId !== this.sandbox.id) {
							var newState = this.Terrasoft.deepClone(currentState);
							newState.moduleId = this.sandbox.id;
							this.sandbox.publish("ReplaceHistoryState", {
								stateObj: newState,
								pageTitle: null,
								hash: currentHash.historyState,
								silent: true
							});
						}
					}
				}
				this.sandbox.subscribe("GetProfileData", function() {
					return this.viewModel.getNewProfileData();
				}, this);
				if (callback) {
					callback.call(this);
				}
			},

			/**
			 * Отображает представление в контейнер renderTo
			 * @param {Ext.Element} renderTo Ссылка на контейнер, в котором будет отображаться представление
			 */
			render: function(renderTo) {
				this.getUserSaveRights(this.finalRender, renderTo);
			},

			/**
			 * Проверяет права пользователя на изменение настроек колонок
			 * @private
			 * @param {Function} callback
			 * @param {Object} renderTo
			 */
			getUserSaveRights: function(callback, renderTo) {
				RightUtilities.checkCanExecuteOperation({
						operation: "CanCreateDefaultGridSettings"
					}, function(result) {
						callback.call(this, renderTo, result);
					}, this);
			},

			/**
			 * Загружает схему, и передает ее в функцию обратного вызова
			 * @private
			 * @param {String} entityName Наименование схемы
			 * @param {Function} callback
			 */
			getEntitySchemaWithDescriptor: function(entityName, callback) {
				if (!this.localEntitySchemaLoaded) {
					this.localEntitySchema = this.sandbox.publish("GetEntitySchema", entityName);
					this.localEntitySchemaLoaded = true;
				}
				if (this.localEntitySchema) {
					callback.call(this, this.localEntitySchema);
				} else {
					this.sandbox.requireModuleDescriptors([entityName], function() {
						require([entityName], callback);
					}, this);
				}
			},

			/**
			 * Дополнительная инициализация после отображения
			 * @private
			 */
			pageAfterRender: function() {
				var columnsSettings = this.Ext.get("columnsSettings");
				columnsSettings.on("click", this.columnsSettingsClick, this);
				this.initDd(this);
			},

			/**
			 * Инициализирует элемент DragAndDrop
			 * @private
			 * @param {Object} ddElement
			 */
			initDd: function(ddElement) {
				this.clearDDGroup("empty");
				this.Ext.dd.DragDropManager.notifyOccluded = true;
				var columnsSettings = this.Ext.get("columnsSettings");
				var empties = this.Ext.select("[id*=\"element-empty\"]", false, columnsSettings.dom);
				empties.each(function(element) {
					element.initDDTarget("empty", {}, this.ddTargetEmptyOverride);
				}, ddElement);
				var pluses = this.Ext.select("[id*=\"element-plus\"]", false, columnsSettings.dom);
				pluses.each(function(element) {
					element.initDDTarget("empty", {}, this.ddTargetEmptyOverride);
				}, ddElement);
				var columns = this.Ext.select("[id*=\"element-column\"]", false, columnsSettings.dom);
				var me = this;
				columns.each(function(element) {
					me.clearDDCache(element);
					element.initDD("empty", {isTarget: false}, this.ddEmptyOverride);
				}, ddElement);
			},

			/**
			 * Очищает элемент группа DragAndDrop
			 * @private
			 * @param {String} group
			 */
			clearDDGroup: function(group) {
				if (group && typeof group === "string") {
					this.Ext.dd.DragDropManager.ids[group] = {};
				}
			},

			/**
			 * Очищает кеш сообщений для элемента DragAndDrop
			 * @private
			 * @param {Object} el
			 */
			clearDDCache: function(el) {
				if (el && el.dom && el.dom.id) {
					try {
						this.Ext.cache[el.dom.id].events.mousedown = [];
					} catch (e) {
					}
				}
			},

			/**
			 * Обрабатывает нажатие мышки на колонку
			 * @private
			 * @param {Object} event
			 */
			columnsSettingsClick: function(event) {
				var columnsSettings = this.Ext.get("columnsSettings");
				var root = columnsSettings.dom;
				var toggleRows = this.Ext.dom.Query.select("[id*=\"" + this.elementPrefix + "\"]", root);
				for (var i = 0, c = toggleRows.length; i < c; i += 1) {
					var toggle = toggleRows[i];
					if (!event.within(toggle)) {
						continue;
					}
					var toggleId = toggle.id;
					var toggleIdParts = toggleId.split("-");
					if (toggleIdParts[1] === this.plusPrefix) {
						if (toggleIdParts.length === 4) {
							this.createNewElement(toggleId);
						} else {
							this.createNewRow(toggleId);
						}
					} else if (toggleIdParts[1] === this.columnPrefix) {
						this.selectElement(toggleId);
					}
				}
			},

			/**
			 * Создает новую колонку
			 * @private
			 * @param {String} toggleId
			 */
			createNewElement: function(toggleId) {
				var config = {
					schemaName: this.schemaName,
					excludeDataValueTypes: [this.Terrasoft.DataValueType.IMAGELOOKUP],
					useBackwards: this.useBackwards,
					firstColumnsOnly: this.firstColumnsOnly
				};
				this.toggleId = toggleId;
				this.openStructureExplorer(config, this.structureExplorerCallback, this.viewModel.renderTo, this);
			},

			/**
			 * Устанавливает значения для колонки измененные в модуле настройки колонок
			 * @private
			 * @param {Object} args
			 */
			structureExplorerCallback: function(args) {
				var dataCollection = this.isTiled ? this.dataCollection : this.listedDataCollection;
				this.viewModel.deactivateCells(dataCollection);
				var toggleId = this.toggleId;
				var toggleIdParts = toggleId.split("-");
				var currentRowIndex = parseInt(toggleIdParts[2], 10);
				var currentColumnIndex = parseInt(toggleIdParts[3], 10);
				if (!dataCollection.length) {
					var newRow = {
						cells: [],
						row: 0
					};
					dataCollection.push(newRow);
				}
				var row = dataCollection[currentRowIndex];
				var cells = row.cells;
				var width = this.rowSize - currentColumnIndex;
				for (var i = 0; i < cells.length; i++) {
					var cell = cells[i];
					if (cell.column > currentColumnIndex) {
						width = cell.column - currentColumnIndex;
						break;
					}
				}
				if (width > 4) {
					width = 4;
				}
				var schema = this.schema;
				var primaryDisplayColumnName = schema.primaryDisplayColumnName;
				var newCell = {
					caption: args.caption.join("."),
					column: currentColumnIndex,
					dataValueType: args.dataValueType,
					isCaptionHidden: (primaryDisplayColumnName === args.leftExpressionColumnPath),
					isCurrent: true,
					isTitleText: (primaryDisplayColumnName === args.leftExpressionColumnPath),
					metaPath: args.leftExpressionColumnPath,
					referenceSchemaName: args.referenceSchemaName,
					width: width
				};
				var previousCell = this.Ext.get(this.selectedCellId);
				if (previousCell) {
					previousCell.removeCls(this.selectedCellCss);
					previousCell.addCls(this.unselectedCellCss);
				} else {
					this.selectedCellId = "";
				}
				cells.push(newCell);
				row.cells = cells;
				this.viewModel.refreshRow(row);
				this.selectedCellId = "element-column-" + currentRowIndex + "-" + currentColumnIndex;
				this.removeEmptyRows(dataCollection);
				args.column = currentColumnIndex;
				args.isTiled = this.isTiled;
				args.metaCaptionPath = args.leftExpressionCaption;
				args.row = currentRowIndex;
				args.width = width;
				this.isObjectColumn = !(args.aggregationFunction || args.metaPath.length > 1);
				this.args = args;
				if (!this.isObjectColumn) {
					this.viewModel.openColumnSettings();
				}
			},

			/**
			 * Выбирает элемент
			 * @private
			 * @param {String} toggleId
			 */
			selectElement: function(toggleId) {
				if (this.selectedCellId !== "") {
					var previousCell = this.Ext.get(this.selectedCellId);
					if (previousCell) {
						previousCell.removeCls(this.selectedCellCss);
						previousCell.addCls(this.unselectedCellCss);
					} else {
						this.selectedCellId = "";
					}
				}
				var toggleEl = this.Ext.get(toggleId);
				toggleEl.removeCls(this.unselectedCellCss);
				toggleEl.addCls(this.selectedCellCss);
				this.selectedCellId = toggleId;
			},

			/**
			 * Открывает модуль выбоора колонки
			 * @private
			 * @param {Object} config
			 * @param {Function} callback
			 * @param {Object} renderTo
			 */
			openStructureExplorer: function(config, callback, renderTo) {
				StructureExplorerUtilities.Open(this.sandbox, config, callback, renderTo, this);
			},

			/**
			 * Создает новую строку
			 * @private
			 * @param {String} toggleId
			 */
			createNewRow: function(toggleId) {
				var config = {
					schemaName: this.schemaName,
					excludeDataValueTypes: [this.Terrasoft.DataValueType.IMAGELOOKUP],
					useBackwards: this.useBackwards,
					firstColumnsOnly: this.firstColumnsOnly
				};
				this.toggleId = toggleId;
				this.openStructureExplorer(config, this.createNewRowCallback, this.viewModel.renderTo);
			},

			/**
			 * Создает новую строку и устанавливает значения
			 * для колонки измененные в модуле настройки колонок
			 * @private
			 * @param {Object} args
			 */
			createNewRowCallback: function(args) {
				var dataCollection = this.isTiled ? this.dataCollection : this.listedDataCollection;
				this.viewModel.deactivateCells(dataCollection);
				var toggleIdParts = this.toggleId.split("-");
				var currentRowIndex = parseInt(toggleIdParts[2], 10);
				var schema = this.schema;
				var primaryDisplayColumnName = schema.primaryDisplayColumnName;
				var newRow = {
					row: currentRowIndex,
					cells: [
						{
							caption: args.caption.join("."),
							column: 0,
							dataValueType: args.dataValueType,
							isCaptionHidden: (primaryDisplayColumnName === args.leftExpressionColumnPath),
							isCurrent: true,
							isTitleText: (primaryDisplayColumnName === args.leftExpressionColumnPath),
							metaPath: args.leftExpressionColumnPath,
							referenceSchemaName: args.referenceSchemaName,
							width: 4
						}
					]
				};
				var previousCell = this.Ext.get(this.selectedCellId);
				if (previousCell) {
					previousCell.removeCls(this.selectedCellCss);
					previousCell.addCls(this.unselectedCellCss);
				} else {
					this.selectedCellId = "";
				}
				dataCollection.push(newRow);
				this.viewModel.refreshRow(newRow);
				if (this.isTiled) {
					this.viewModel.addRow(newRow);
					this.initDd(this);
				}
				this.removeEmptyRows(dataCollection);
				this.selectedCellId = "element-column-" + (dataCollection.length - 1) + "-0";
				this.isObjectColumn = (args.aggregationFunction || args.metaPath.length > 1) ? false : true;
				args.row = currentRowIndex;
				args.column = 0;
				args.width = 4;
				args.isTiled = this.isTiled;
				args.metaCaptionPath = args.leftExpressionCaption;
				this.args = args;
				if (!this.isObjectColumn) {
					this.viewModel.openColumnSettings();
				}
			},

			/**
			 * Удаляет пустые строки из коллекции строк
			 * @private
			 * @param {Object} collection
			 */
			removeEmptyRows: function(collection) {
				for (var i = 0; i < collection.length; i++) {
					var row = collection[i];
					if (row.cells.length === 0) {
						collection.splice(i, 1);
						i--;
					} else {
						row.row = i;
					}
				}
			},

			/**
			 * Перемещает элемент
			 * @private
			 * @param {Object} collection
			 * @param {Object} el
			 * @param {Object} ddTarget
			 */
			dragElement: function(collection, el, ddTarget) {
				var targetIdParts = ddTarget.dom.id.split("-");
				var newRowIndex = parseInt(targetIdParts[2], 10);
				var newCellIndex = parseInt(targetIdParts[3], 10);
				if (!newCellIndex) {
					newCellIndex = 0;
				}
				var elIdParts = el.dom.id.split("-");
				var oldRowIndex = parseInt(elIdParts[2], 10);
				var oldCellIndex = parseInt(elIdParts[3], 10);

				if (newRowIndex >= collection.length) {
					var currentRowIndex = newRowIndex + 1;
					collection.push({
						row: collection.length,
						cells: []
					});
					var lastRow = this.Ext.get("row-" + newRowIndex);
					var lastPlus = this.Ext.get("element-plus-" + newRowIndex);
					lastPlus.dom.id = "element-plus-" + newRowIndex + "-0";
					this.Ext.DomHelper.insertAfter(lastRow,
						"<div id=\"row-" + currentRowIndex + "\" class=\"grid-row grid-module\">" +
							"<div id=\"element-plus-" + currentRowIndex +
							"\" class=\"grid-cols-2\">" +
							"<div class=\"empty-inner-div\">" +
							"+" +
							"</div>" +
							"</div>" +
							"</div>",
						true);
					var lastEl = this.Ext.get("element-plus-" + currentRowIndex);

					for (var p = 2; p < this.rowSize; p++) {
						lastEl = Ext.DomHelper.insertAfter(lastEl,
								"<div id=\"element-empty-" + currentRowIndex + "-" + p +
								"\" class=\"grid-cols-1\">" +
								"<div class=\"empty-inner-div\">" +
								"" +
								"</div>" +
								"</div>",
							true);
						lastEl.initDDTarget("empty", {}, this.ddTargetEmptyOverride);
					}
					lastEl = this.Ext.get("element-plus-" + currentRowIndex);
					lastEl.initDDTarget("empty", {}, this.ddTargetEmptyOverride);
				}

				this.viewModel.deactivateCells(collection);
				var oldRow = collection[oldRowIndex];
				var newRow = {};
				if (newRowIndex >= collection.length) {
					newRow = collection[collection.length - 1];
				} else {
					newRow = collection[newRowIndex];
				}
				var oldCells = oldRow.cells;
				var newCells = newRow.cells;

				var width = 0;
				for (var i = 0; i < oldCells.length; i++) {
					var oldCell = oldCells[i];
					var oldColumn = oldCell.column;
					var oldWidth = oldCell.width;
					if (oldColumn + oldWidth > oldCellIndex) {
						width = oldWidth;
						var newCell;
						for (var j = 0; j < newCells.length; j++) {
							newCell = newCells[j];
							var newColumn = newCell.column;
							if (oldRow.row === newRow.row && oldColumn === newColumn) {
								continue;
							}
							if (newColumn > newCellIndex && (width > (newColumn - newCellIndex))) {
								width = newColumn - newCellIndex;
								break;
							}
						}
						oldCells.splice(i, 1);
						if (newCellIndex + width > this.rowSize) {
							width = this.rowSize - newCellIndex;
						}
						newCell = this.copyCellItem(oldCell, {
							width: width,
							isCurrent: true,
							column: newCellIndex
						});
						newCells.push(newCell);
						this.selectedCellId = "element-column-" +
							newRowIndex +
							"-" +
							newCellIndex;
						break;
					}
				}
				this.viewModel.sortByKey(oldCells, "column");
				this.viewModel.sortByKey(newCells, "column");

				this.viewModel.refreshRow(oldRow);
				if (oldRow.row !== newRow.row) {
					this.viewModel.refreshRow(newRow);
				}
			},

			/**
			 * Копирует элемент реестра.
			 * @private
			 * @param {Object} sourceItem Элемент который необходимо скопировать.
			 * @param {Object} defaultValues Значения свойств по умолчанию.
			 * @return {Object} Копия элемента реестра.
			 */
			copyCellItem: function(sourceItem, defaultValues) {
				return Ext.apply({}, defaultValues, sourceItem);
			},

			/**
			 * Генерирует представление и отрисовывает его
			 * @private
			 * @param {Object} renderTo
			 * @param {Boolean} isSysAdmin
			 */
			finalRender: function(renderTo, isSysAdmin) {
				var currentObject = this;
				currentObject.isSysAdmin = isSysAdmin;
				if (this.inited) {
					if (typeof this.isObjectColumn !== "undefined" && !this.isObjectColumn) {
						this.isObjectColumn = true;
					}
					var viewConfig = viewGenerator.generate.call(this.viewModel.currentObject);
					var newView = this.Ext.create(viewConfig.className, viewConfig);
					newView.bind(this.viewModel);
					newView.render(renderTo);
					this.changeGridType();
					this.pageAfterRender.call(this);
					return;
				}

				this.inited = true;

				if (!this.ddEmptyOverride) {
					this.ddEmptyOverride = {
						b4StartDrag: function() {
							if (!this.el) {
								this.el = currentObject.Ext.get(this.getEl());
								this.el.setStyle("z-index", "11");
							}
							this.el.setStyle("border-right-style", "hidden");
							if (currentObject.selectedCellId !== "") {
								var previousCell = currentObject.Ext.get(currentObject.selectedCellId);
								if (previousCell) {
									previousCell.removeCls(currentObject.selectedCellCss);
									previousCell.addCls(currentObject.unselectedCellCss);
								} else {
									currentObject.selectedCellId = "";
								}
							}
							this.el.removeCls(currentObject.unselectedCellCss);
							this.el.addCls(currentObject.selectedCellCss);
							currentObject.selectedCellId = this.el.dom.id;
						},
						onDrag: function(event) {
							var coords = [event.getX() - this.deltaX, event.getY() - this.deltaY];
							this.el.setXY(coords);
						},
						endDrag: function() {
							if (this.invalidDrop === true) {
								var coords = [this.startPageX, this.startPageY];
								this.el.setXY(coords);
								this.el.setStyle("z-index", "10");
								this.el.setStyle("border-right-style", "solid");
								delete this.invalidDrop;
							}
						},
						onDragDrop: function(event, target) {
							var ddTarget = currentObject.Ext.get(target);
							var collection = currentObject.viewModel.getActiveDataCollection();
							currentObject.dragElement(collection, this.el, ddTarget);
							this.el.remove();
							ddTarget.remove();
						},
						onInvalidDrop: function() {
							this.invalidDrop = true;
							this.el.removeCls(currentObject.selectedCellCss);
							this.el.addCls(currentObject.unselectedCellCss);
						}
					};
				}
				var self = this;
				this.getEntitySchemaWithDescriptor(this.schemaName, function(schema) {
					if (!self.schema) {
						self.schema = schema;
					}
				});

				this.renderContainer = renderTo;
				if (this.isNested || this.useProfileField) {
					this.loadProfile.call(this, this.profile);
				} else {
					this.Terrasoft.require(["profile!" + this.profileKey], function(profile) {
						this.loadProfile(profile);
					}, this);
				}

			},

			/**
			 * Загружает профиль.
			 * @protected
			 * @param {Object} profile
			 */
			loadProfile: function(profile) {
				var gridProfile = this.propertyName ? profile[this.propertyName] : profile;
				var isTiled = true;
				var gridType = this.Terrasoft.GridType.TILED;
				var baseGridType = this.baseGridType;
				if (this.Ext.Object.isEmpty(gridProfile) && baseGridType) {
					isTiled = (baseGridType === this.Terrasoft.GridType.TILED);
					gridType = baseGridType;
				}
				this.isTiled = isTiled;
				this.gridType = gridType;
				this.profile = profile;
				var viewModelConfig = viewModelGenerator.generate({
					isSingleTypeMode: this.Ext.isEmpty(this.isSingleTypeMode) ? false : this.isSingleTypeMode,
					GridType: this.isTiled ? this.Terrasoft.GridType.TILED : this.Terrasoft.GridType.LISTED
				});
				this.viewModel = this.Ext.create("Terrasoft.BaseViewModel", viewModelConfig);
				this.viewModel.currentObject = this;
				this.viewModel.sandbox = this.sandbox;
				this.viewModel.renderTo = this.renderContainer;
				this.viewModel.on("change:GridType", this.changeGridType, this);
				if (gridProfile && gridProfile.listedConfig && gridProfile.tiledConfig) {
					this.dataCollection = this.viewModel.getColumnsConfigFromProfileV2(gridProfile, true);
					this.listedDataCollection = this.viewModel.getColumnsConfigFromProfileV2(gridProfile, false);
					this.isTiled = gridProfile.isTiled;
					this.gridType = gridProfile.type;
				} else {
					this.dataCollection = this.viewModel.getColumnsConfigFromProfile(profile, true);
					this.listedDataCollection = this.viewModel.getColumnsConfigFromProfile(profile, false);
				}
				this.updateItemsViewCollection();
				var viewConfig = viewGenerator.generate.call(this);
				var view = this.Ext.create(viewConfig.className, viewConfig);
				var page = this.Ext.getCmp("gridSettings");
				page.on("afterrender", this.pageAfterRender, this);
				view.bind(this.viewModel);
				view.render(this.renderContainer);
				this.viewModel.set("GridType", this.gridType);
				MaskHelper.HideBodyMask();
			},

			/**
			 * Обновляет отображаемую коллекцию
			 * @private
			 */
			updateItemsViewCollection: function() {
				this.removeEmptyRows(this.dataCollection);
				this.viewCollection =
					this.viewModel.generateViewCollection(this.dataCollection, this.rowSize);
				this.viewCollection.isTiled = this.isTiled;

				this.listedViewCollection =
					this.viewModel.generateViewCollection(this.listedDataCollection, this.rowSize);
			},

			/**
			 * Изменяет тип реестра
			 * @private
			 */
			changeGridType: function() {
				this.isTiled = (this.viewModel.get("GridType") === this.Terrasoft.GridType.TILED);
				var container = this.Ext.getCmp("columnsSettings");
				container.tpl = this.isTiled ? viewGenerator.tiledTpl : viewGenerator.listedTpl;
				this.updateItemsViewCollection();
				container.reRender();
				this.pageAfterRender();
			}
		});
		return Terrasoft.GridSettings;
	});
