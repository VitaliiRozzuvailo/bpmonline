define("FolderManagerViewModel", ["FolderManagerViewModelResources",
		"ConfigurationConstants", "LookupUtilities", "ResponseExceptionHelper", "MaskHelper"],
	function(resources, ConfigurationConstants, LookupUtilities, ResponseExceptionHelper, MaskHelper) {

		/**
		 * Генерирует конфигурацию модели представления менеджера групп
		 * @returns {Object}
		 */
		function generate(parentSandbox, config) {
			var sandbox = parentSandbox;
			var viewModelConfig = {
				entitySchema: config.entitySchema,
				columns: {
					/**
					 * Флаг, включает множественный выбор в реестре
					 * @type {BOOLEAN}
					 */
					EnableMultiSelect: {
						type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
						name: "EnableMultiSelect"
					},

					/**
					 * Множественный выбор в реестре
					 * @type {BOOLEAN}
					 */
					MultiSelect: {
						type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
						name: "MultiSelect"
					},

					/**
					 * Идентификатор активной выбранной группы
					 */
					ActualFolderId: {
						type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
						name: "ActualFolderId"
					}
				},
				values: {
					/**
					 * Коллекция элементов реестра
					 * @type {Terrasoft.BaseViewModelCollection}
					 */
					GridData: new Terrasoft.BaseViewModelCollection(),

					/**
					 * Множественный выбор в реестре
					 * @type {Boolean}
					 */
					MultiSelect: config.multiSelect,

					/**
					 * Текущий фильтр
					 * @type {Terrasoft.BaseFilter}
					 */
					CurrentFilter: config.currentFilter,

					/**
					 * Флаг, включает множественный выбор в реестре
					 * @type {Boolean}
					 */
					EnableMultiSelect: config.enableMultiSelect,

					/**
					 * Массив выбранных элементов
					 * @type {Array}
					 */
					SelectedRows: config.selectedFolders,

					/**
					 * Идентификатор выбранного элемента в реестре
					 * @type {GUID}
					 */
					ActiveRow: config.currentFilter,

					/**
					 * Идентификатор группы "Избранные"
					 * @type {GUID}
					 */
					FavoriteGeneratedId: config.favoriteGeneratedId,

					/**
					 * Флаг, можно ли переименовывать группу
					 * @type {Boolean}
					 */
					CanRename: !Ext.isEmpty(config.currentFilter),

					/**
					 * Флаг, есть ли выбранная запись
					 * @type {Boolean}
					 */
					SelectEnabled: (config.currentFilter || config.multiSelect),

					/**
					 * Массив раскрытых элементов
					 * @type {Array}
					 */
					ExpandHierarchyLevels: [],

					/**
					 * Флаг, отображать ли кнопки настройки
					 * @type {Boolean}
					 */
					AdministratedButtonVisible: config.entitySchema.administratedByRecords && !config.multiSelect,

					/**
					 * Схема раздела
					 * @type {Object}
					 */
					SectionModule: config.sectionEntitySchema,

					/**
					 * Флаг, разрешена ли обработка двойного нажатия на запись реестра
					 * @type {Boolean}
					 */
					IsGridDoubleClickAllowed: true,

					/**
					 * Флаг, выбрана ли группа избранное
					 * @type {Boolean}
					 */
					IsFavoriteSelected: false,

					/**
					 * Максимальная позиция в каталоге
					 * @type {Integer}
					 */
					MaxPosition: 0,

					/**
					 * Флаг, видна ли кнопка закрытия
					 * @type {Boolean}
					 */
					CloseVisible: true,

					/**
					 * Флаг, виден ли модуль групп
					 * @type {Boolean}
					 */
					IsFoldersContainerVisible: true,

					/**
					 * Флаг, виден ли модуль расширенной фильтрации
					 * @type {Boolean}
					 */
					IsExtendCatalogueFilterContainerVisible: false,

					/**
					 * Флаг, отображаются ли статические группы
					 * @type {Boolean}
					 */
					UseStaticFolders: false
				},

				methods: {
					/**
					 * Инициализация менеджера групп
					 * @param {object} config
					 */
					init: function(config) {
						MaskHelper.ShowBodyMask();
						this.set("IsFoldersContainerVisible", true);
						this.set("IsExtendCatalogueFilterContainerVisible", false);
						if (config.hasOwnProperty("useStaticFolders")) {
							this.set("UseStaticFolders", config.useStaticFolders);
						}
						this.on("change:ExpandHierarchyLevels", this.onExpandHierarchyLevels, this);
						this.allFoldersRecordItem = config.allFoldersRecordItem;
						this.favoriteRootRecordItem = config.favoriteRootRecordItem;
						this.currentEditElement =
							this.getFolderEditViewModel(ConfigurationConstants.Folder.Type.General);
						this.renderTo = this.container;
						this.set("AdministratedButtonVisible", false);
						if (config.hasOwnProperty("closeVisible")) {
							this.set("CloseVisible", config.closeVisible);
						}
						if (config.catalogueRootRecordItem) {
							this.catalogueRootRecordItem = config.catalogueRootRecordItem;
							this.isProductSelectMode = config.isProductSelectMode;
							if (config.catalogAdditionalFiltersValues) {
								this.catalogAdditionalFiltersValues = config.catalogAdditionalFiltersValues;
							}
							var esq = this.getCatalogueFolderSelect();
							esq.execute(function(response) {
								this.catalogueFolders = response.collection;
								this.set("TypeCatalogueLevelPosition",
									this.getTypeCatalogueLevelPosition(this.catalogueFolders));
								this.load(true);
							}, this);
						} else {
							this.load(true);
						}
					},

					/**
					 * Определяет позицию элемента каталога, который представляет тип продукта.
					 * @param {Terrasoft.Collection} catalogueFolders Список уровней каталога.
					 * @returns {Number} Позиция верхнего элемента представляющего тип продукта в структутре каталога
					 * или null, если таковой не был найден.
					 */
					getTypeCatalogueLevelPosition: function(catalogueFolders) {
						var count = catalogueFolders.getCount();
						if (!count) {
							return null;
						}
						for (var i = 0; i < count; i++) {
							var folder = catalogueFolders.getByIndex(i);
							if (folder.get("ColumnPath") === "Type") {
								return i;
							}
						}
						return null;
					},

					/**
					 * Обрабатывает нажатие на кнопку Отмена.
					 * @protected
					 */
					cancelButton: function() {
						this.cancelSelecting();
					},

					/**
					 * Изменяет возможность множественного выбора в реестре
					 * @protected
					 */
					changeMultiSelectMode: function() {
						if (this.get("EnableMultiSelect")) {
							var multiSelect = !this.get("MultiSelect");
							this.set("ActiveRow", null);
							this.changeGridMode(multiSelect);
						}
					},

					/**
					 * Очищает коллекцию элементов менеджера групп
					 * @protected
					 */
					clear: function() {
						this.set("ActiveRow", null);
						var collection = this.get("GridData");
						collection.clear();
						this.pageNumber = 0;
					},

					/**
					 * Обрабатиывает двойное нажатие на элемент реестра
					 * @protected
					 * @param {string} id
					 */
					dblClickGrid: function(id) {
						if (!this.get("IsGridDoubleClickAllowed")) {
							this.set("IsGridDoubleClickAllowed", true);
							return;
						}
						if (this.getGridColumnValue(id, "IsInCatalogue")) {
							return;
						}
						if (id && this.getIsFolderSelected() && !this.get("MultiSelect")) {
							this.set("ActiveRow", id);
							this.currentEditElement.loadEntity(id, function() {
								this.renameFolder();
							}, this);
						}
					},

					/**
					 * Обрабатывает нажатие на кнопку Удалить
					 * @protected
					 */
					deleteButton: function() {
						var multiSelect = this.get("MultiSelect");
						var selectedRows = this.get("SelectedRows");
						var activeRow = this.get("ActiveRow");
						if (multiSelect && selectedRows && selectedRows.length > 0 || !multiSelect && activeRow) {
							this.showConfirmationDialog(resources.localizableStrings.OnDeleteWarningV2, function(returnCode) {
								if (returnCode === Terrasoft.MessageBoxButtons.YES.returnCode) {
									this.onDeleteAccept();
								}
							}, ["yes", "no"]);
						}
					},

					/**
					 * Инициализирует выборку элементов группы Все
					 * @protected
					 * @param {object} scope
					 * @returns {EntitySchemaQuery|*}
					 */
					initAllFoldersSelect: function(scope) {
						var select = Ext.create("Terrasoft.EntitySchemaQuery", {
							rootSchema: scope.entitySchema
						});
						select.addMacrosColumn(Terrasoft.QueryMacrosType.PRIMARY_COLUMN, "Id");
						var column = select.addMacrosColumn(Terrasoft.QueryMacrosType.PRIMARY_DISPLAY_COLUMN, "Name");
						column.orderDirection = Terrasoft.OrderDirection.ASC;
						column.orderPosition = 0;
						select.addColumn("Parent");
						select.addColumn("FolderType");
						if (!scope.get("UseStaticFolders")) {
							select.filters.addItem(select.createColumnFilterWithParameter(
								Terrasoft.ComparisonType.NOT_EQUAL, "FolderType",
								ConfigurationConstants.Folder.Type.General));
						}
						select.filters.addItem(select.createColumnFilterWithParameter(
							Terrasoft.ComparisonType.NOT_EQUAL, "FolderType",
							ConfigurationConstants.Folder.Type.RootEmail));

						select.skipRowCount = scope.pageNumber * scope.pageRowsCount;
						select.rowCount = -1;
						return select;
					},

					/**
					 * Инициализирует выборку элементов группы Избранное
					 * @protected
					 * @param {object} scope
					 * @returns {EntitySchemaQuery|*}
					 */
					initFavoriteFoldersSelect: function(scope) {
						var select = Ext.create("Terrasoft.EntitySchemaQuery", {
							rootSchemaName: "FolderFavorite"
						});
						select.addMacrosColumn(Terrasoft.QueryMacrosType.PRIMARY_COLUMN, "Id");
						select.addColumn("FolderId");
						var filters = Ext.create("Terrasoft.FilterGroup");
						filters.addItem(select.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL, "SysAdminUnit",
							Terrasoft.SysValue.CURRENT_USER.value));
						filters.addItem(select.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL,
							"FolderEntitySchemaUId", scope.entitySchema.uId));
						select.filters = filters;
						return select;
					},

					/**
					 * Инициализирует выборку типов групп
					 * @protected
					 * @param {object} scope
					 * @returns {EntitySchemaQuery|*}
					 */
					initFolderTypesSelect: function(scope) {
						var select = Ext.create("Terrasoft.EntitySchemaQuery", {
							rootSchemaName: "FolderType"
						});
						select.addMacrosColumn(Terrasoft.QueryMacrosType.PRIMARY_COLUMN, "Id");
						select.addColumn("Name");
						select.addColumn("Image");
						var filters = Ext.create("Terrasoft.FilterGroup");
						filters.logicalOperation = Terrasoft.LogicalOperatorType.OR;
						filters.addItem(select.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL,
							"Id", ConfigurationConstants.Folder.Type.General));
						filters.addItem(select.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL,
							"Id", ConfigurationConstants.Folder.Type.Favorite));
						if (scope.catalogueRootRecordItem) {
							filters.addItem(select.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL,
								"Id", scope.catalogueRootRecordItem.value));
						}
						select.filters.addItem(filters);
						return select;
					},

					/**
					 * Добавляет запрос на выборку элементов каталога
					 * @protected
					 * @param {Terrasoft.BatchQuery} batch
					 * @param {object} scope
					 */
					addCatalogueFolderValuesSelect: function(batch, scope) {
						var rowItem = scope.catalogueFolders.getByIndex(0);
						if (rowItem) {
							batch.add(this.getCatalogueLevelItemsSelect(rowItem));
						}
					},

					/**
					 * Получает фильтрацию родителей группы каталога
					 * @protected
					 * @param {object} row
					 * @returns {createFilterGroup|*}
					 */
					getParentRowsFilters: function(row, rowItem) {
						var filtersGroup = Terrasoft.createFilterGroup();
						var position = row.get("Position");
						var parentData = this.getGridColumn(row.get("Parent"));
						var currentID = row.get("ActualCatalogueFolderId");
						var columnPath = rowItem.get("ColumnPath");
						filtersGroup.addItem(Terrasoft.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL,
							"[Product:" + columnPath + ":Id]." + row.get("ColumnPath") + ".Id", currentID));
						if (parentData) {
							for (var i = position - 1; i >= 0; i--) {
								var catalogueFolder = this.catalogueFolders.getByIndex(i);
								if (catalogueFolder) {
									var currentParentID = parentData.get("ActualCatalogueFolderId");
									filtersGroup.addItem(Terrasoft.createColumnFilterWithParameter(
										Terrasoft.ComparisonType.EQUAL,
										"[Product:" + columnPath + ":Id]." + catalogueFolder.get("ColumnPath") + ".Id",
										currentParentID));
									parentData = this.getGridColumn(parentData.get("Parent"));
								}
							}
						}
						return filtersGroup;
					},

					/**
					 * Возвращает запрос на выборку уровней каталога
					 * @protected
					 * @param {object} rowItem
					 * @param {object} subRow
					 * @returns {EntitySchemaQuery|*}
					 */
					getCatalogueLevelItemsSelect: function(rowItem, subRow) {
						var select = Ext.create("Terrasoft.EntitySchemaQuery", {
							rootSchemaName: rowItem.get("ReferenceSchemaName")
						});
						select.addColumn("Id", "ColumnPathValueId");
						var column = select.addColumn("Name", "ColumnPathValueName");
						column.orderDirection = Terrasoft.OrderDirection.ASC;
						column.orderPosition = 0;
						var columnPath = rowItem.get("ColumnPath");
						select.addParameterColumn(columnPath, Terrasoft.DataValueType.TEXT, "ColumnPath");
						select.addParameterColumn(rowItem.get("Id"), Terrasoft.DataValueType.GUID, "ParentId");
						select.addParameterColumn(rowItem.get("Name"), Terrasoft.DataValueType.TEXT, "ParentName");
						select.addParameterColumn(rowItem.get("Position"), Terrasoft.DataValueType.INTEGER, "Position");
						select.addParameterColumn(rowItem.get("ReferenceSchemaName"), Terrasoft.DataValueType.TEXT,
							"ReferenceSchemaName");
						select.rowCount = -1;
						select.filters.addItem(
							Terrasoft.createColumnIsNotNullFilter(
								"[Product:" + columnPath + ":Id]." + columnPath + ".Id"
							)
						);
						if (subRow) {
							select.filters.addItem(this.getParentRowsFilters(subRow, rowItem));
						}
						if (this.catalogAdditionalFiltersValues) {
							var filterGroup = Terrasoft.createFilterGroup();
							Terrasoft.each(this.catalogAdditionalFiltersValues, function(filterValue) {
								var filter = Terrasoft.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL,
									"[Product:" + columnPath + ":Id]." + filterValue.columnPath, filterValue.value);
								filterGroup.addItem(filter);
							}, this);
							select.filters.addItem(filterGroup);
						}
						return select;
					},

					/**
					 * Подготавливает выборку групп каталога
					 * @protected
					 * @param {Terrasoft.Collection} catalogueFolderValues
					 * @param {object} rowConfig
					 * @param {object} scope
					 * @param {Terrasoft.Collection} resultItems
					 */
					prepareCatalogueFoldersAndGetSelected: function(catalogueFolderValues, rowConfig, scope, resultItems) {
						var parent = scope.catalogueRootRecordItem;
						if (catalogueFolderValues.length) {
							Terrasoft.each(catalogueFolderValues[0].rows, function(item) {
								this.addCatalogItem(item, rowConfig, parent.value, resultItems, scope);
							}, scope);
						}
					},

					/**
					 * Добавляет элемент каталога
					 * @protected
					 * @param {object} item
					 * @param {object} rowConfig
					 * @param {string} parent
					 * @param {Terrasoft.Collection} resultItems
					 * @param {object} scope
					 */
					addCatalogItem: function(item, rowConfig, parent, resultItems, scope) {
						var gridItem = scope.getGridRecordByItemValues(rowConfig, item);
						gridItem.set("FolderType", scope.catalogueRootRecordValues.FolderType);
						var actualFolderId = gridItem.get("ColumnPathValueId");
						gridItem.set("Name", gridItem.get("ColumnPathValueName"));
						var compositeKey = actualFolderId + "_" + parent;
						if (!gridItem.get("Parent")) {
							gridItem.set("Parent", parent);
						}
						gridItem.set("HasNesting", item.Position === this.MaxPosition ? 0 : 1);
						gridItem.set("Id", compositeKey);
						gridItem.set("FolderId", compositeKey);
						gridItem.set("ActualCatalogueFolderId", actualFolderId);
						gridItem.set("IsInFavorites", false);
						gridItem.set("IsInCatalogue", true);
						gridItem.set("IsOpenFilterButtonVisible",
							this.getIsOpenFilterButtonVisible(item));
						if (!resultItems.contains(compositeKey)) {
							resultItems.add(compositeKey, gridItem);
						}
					},

					/**
					 * Определяет возможность настрйоки фильтров для элемента каталога
					 * @param {object} item Элемент каталога
					 * @returns {boolean} Возвращает true, если доступна настройка фильтра
					 */
					getIsOpenFilterButtonVisible: function(item) {
						var catalogueLevelPos = item.Position;
						var typeLevelPos = this.get("TypeCatalogueLevelPosition");
						typeLevelPos = Ext.isEmpty(typeLevelPos) ? Number.MAX_VALUE : typeLevelPos;
						return (catalogueLevelPos >= typeLevelPos);
					},

					/**
					 * Получает максимальную позицию группы каталога
					 * @protected
					 * @returns {*}
					 */
					getMaxPosition: function() {
						var positions = [];
						this.catalogueFolders.each(function(item) {
							positions.push(item.get("Position"));
						}, this);
						var maxPosition = positions.sort(function(a, b) {
							return b - a;
						})[0];
						return maxPosition;
					},

					/**
					 * Инициализирует корневые группы
					 * @protected
					 * @param {Terrasoft.Collection} rows
					 * @param {Terrasoft.BaseViewModel} viewModel
					 */
					initializeRootFolders: function(rows, viewModel) {
						Terrasoft.each(rows, function(folderTypeItem) {
							var itemValues = {
								value: folderTypeItem.Id,
								displayValue: folderTypeItem.Name,
								primaryImageValue: folderTypeItem.Image.value
							};
							if (folderTypeItem.Id === ConfigurationConstants.Folder.Type.General) {
								viewModel.allFoldersRecordValues = {
									Id: viewModel.allFoldersRecordItem.value,
									Name: viewModel.allFoldersRecordItem.displayValue,
									Parent: "",
									FolderType: itemValues
								};
							} else if (viewModel.catalogueRootRecordItem &&
								folderTypeItem.Id === viewModel.catalogueRootRecordItem.value) {
								viewModel.catalogueRootRecordValues = {
									Id: viewModel.catalogueRootRecordItem.value,
									Name: viewModel.catalogueRootRecordItem.displayValue,
									Parent: "",
									FolderType: itemValues
								};
							} else {
								viewModel.favoriteRootRecordValues = {
									Id: viewModel.favoriteRootRecordItem.value,
									Name: viewModel.favoriteRootRecordItem.displayValue,
									Parent: "",
									FolderType: itemValues
								};
							}
						}, this);
					},

					/**
					 * Подготавливает выборку элементов группы Все
					 * @protected
					 * @param {Terrasoft.Collection} rows
					 * @param {object} rowConfig
					 * @param {object} scope
					 * @param {Terrasoft.Collection} resultItems
					 */
					prepareAllFolders: function(rows, rowConfig, scope, resultItems) {
						Terrasoft.each(rows, function(rowItem) {
							var gridItem = scope.getGridRecordByItemValues(rowConfig, rowItem);
							var actualFolderId = gridItem.get("Id");
							if (!gridItem.get("Parent")) {
								gridItem.set("Parent", scope.allFoldersRecordItem);
							}
							gridItem.set("ActualFolderId", actualFolderId);
							gridItem.set("IsInFavorites", false);
							gridItem.set("administratedByRecords", gridItem.entitySchema.administratedByRecords);
							resultItems.add(actualFolderId, gridItem);
						}, scope);
					},

					/**
					 * Подготавливает выборку элементов группы Избранное
					 * @protected
					 * @param {Terrasoft.Collection} rows
					 * @param {object} rowConfig
					 * @param {object} scope
					 * @param {Terrasoft.Collection} resultItems
					 * @returns {*}
					 */
					prepareFavoriteFoldersAndGetSelected: function(rows, rowConfig, scope, resultItems) {
						var currentFavoriteRecordId = null;
						Terrasoft.each(rows, function(rowItem) {
							var folderId = rowItem.FolderId;
							if (resultItems.contains(folderId)) {
								var folderItem = resultItems.get(folderId);
								var newId = Terrasoft.generateGUID();
								var newItem = scope.getGridRecordByItemValues(rowConfig, folderItem.values);
								newItem.set("ActualFolderId", folderId);
								newItem.set("IsInFavorites", true);
								folderItem.set("IsInFavorites", true);
								newItem.set("Id", newId);
								newItem.set("Parent", scope.favoriteRootRecordItem);
								resultItems.add(newId, newItem);
								if ((scope.currentEditElement.get("Id") === folderId) && scope.get("IsFavoriteSelected")) {
									scope.set("ActiveRow", null);
									currentFavoriteRecordId = newId;
								}
							}
						}, scope);
						return currentFavoriteRecordId;
					},

					/**
					 * Загружает группы
					 * @protected
					 * @param {Boolean} setExpandedLevels
					 * @param {Function} callback
					 * @param {object} scope
					 */
					load: function(setExpandedLevels, callback, scope) {
						MaskHelper.ShowBodyMask();
						if (!this.pageNumber) {
							this.pageNumber = 0;
						}
						if (!this.pageRowsCount) {
							this.pageRowsCount = 15;
						}
						scope = scope || this;
						var batch = Ext.create("Terrasoft.BatchQuery");
						var mainSelect = this.initAllFoldersSelect(this);
						batch.add(mainSelect);
						var favoritesSelect = this.initFavoriteFoldersSelect(this);
						batch.add(favoritesSelect);
						if (this.catalogueRootRecordItem) {
							this.addCatalogueFolderValuesSelect(batch, this);
						}
						if (!this.allFoldersRecordValues || !this.favoriteRootRecordValues ||
							(!this.catalogueRootRecordValues && this.catalogueRootRecordItem)) {
							var folderTypesSelect = this.initFolderTypesSelect(this);
							batch.add(folderTypesSelect);
						}
						batch.execute(function(response) {
							if (response && response.success) {
								var items = new Terrasoft.Collection();
								var allFolders = null;
								var rowConfig = null;
								var favoriteFolders = null;
								var catalogueFolderValues = [];
								if (!response.queryResults) {
									return;
								}
								Terrasoft.each(response.queryResults, function(item) {
									if (!Ext.isEmpty(item.rowConfig.FolderId)) {
										favoriteFolders = item;
									} else if (!Ext.isEmpty(item.rowConfig.ColumnPath)) {
										catalogueFolderValues.push(item);
									} else if (!Ext.isEmpty(item.rowConfig.Image)) {
										this.initializeRootFolders(item.rows, this);
									} else {
										allFolders = item;
										rowConfig = item.rowConfig;
									}
								}, this);
								this.prepareAllFolders(allFolders.rows, rowConfig, this, items);
								var currentFavoriteRecordId =
									this.prepareFavoriteFoldersAndGetSelected(favoriteFolders.rows, rowConfig,
										this, items);
								if (this.catalogueFolders) {
									this.MaxPosition = this.getMaxPosition();
									this.prepareCatalogueFoldersAndGetSelected(catalogueFolderValues, rowConfig,
										this, items);
									this.catalogueRootRecordValues.IsInCatalogue = true;
									var catalogueRootItem = this.getGridRecordByItemValues(rowConfig,
										this.catalogueRootRecordValues);
									if (catalogueFolderValues && catalogueFolderValues.length) {
										items.add(catalogueRootItem.get("Id"), catalogueRootItem);
									}
								}
								var allFoldersItem = this.getGridRecordByItemValues(rowConfig,
									this.allFoldersRecordValues);
								var favoriteRootItem = this.getGridRecordByItemValues(rowConfig,
									this.favoriteRootRecordValues);
								this.allFoldersItem = allFoldersItem;
								items.add(favoriteRootItem.get("Id"), favoriteRootItem);
								items.add(allFoldersItem.get("Id"), allFoldersItem);
								this.set("ExpandHierarchyLevels", [favoriteRootItem.get("Id")]);
								this.set("ExpandHierarchyLevels", [allFoldersItem.get("Id")]);
								if (setExpandedLevels) {
									var selectedRows = this.get("currentFolders");
									if (Ext.isEmpty(selectedRows)) {
										var currentFilter = this.get("ActiveRow");
										selectedRows = currentFilter ? [currentFilter] : this.get("SelectedRows");
									}
								}
								this.set("ActiveRow", null);
								var collection = this.get("GridData");
								collection.clear();
								var activeRow = currentFavoriteRecordId || this.get("ActiveRowToSet");
								var expLevels = null;
								if (activeRow) {
									var itemsCollection = new Terrasoft.Collection();
									itemsCollection.loadAll(items);
									expLevels = this.expandToSelectedItems([activeRow], itemsCollection);
								}
								collection.loadAll(items);
								this.restoreExpandedCatalogueAsync(expLevels, function() {
									var gridData = this.get("GridData");
									if (gridData.contains(activeRow)) {
										this.set("ActiveRow", activeRow);
									}
								});
								if (collection.contains(activeRow)) {
									this.set("ActiveRow", activeRow);
								}
								if (Ext.isFunction(callback)) {
									callback.call(scope);
								}
								MaskHelper.HideBodyMask();
							}
						}, this);
					},

					/**
					 * Загружает следующую порцию групп
					 * @protected
					 */
					loadNext: function() {
						this.pageNumber++;
						this.load();
					},

					/**
					 * Обрабатывает перемещение группы
					 * @protected
					 */
					moveFolder: function() {
						var activeRow = this.get("ActiveRow");
						if (activeRow) {
							activeRow = this.getActualFolderId(activeRow);
						}
						var selectedRows = this.get("SelectedRows");
						if (activeRow || (selectedRows && selectedRows.length > 0)) {
							this.set("currentFolders",
								(selectedRows && selectedRows.length) ? selectedRows : [activeRow]);
							this.previousModeMultiSelect = this.get("MultiSelect");
						}
						var folders = this.get("currentFolders") || [];
						this.processMoveFolders(folders, function() {
							this.load(false);
						});
					},

					/**
					 * Обрабатывает изменение активной записи
					 * @protected
					 * @param {string} rowId
					 */
					onActiveRowChanged: function(rowId) {
						this.showFolderInfo(rowId);
					},

					/**
					 * Обработчик удаления элементов
					 * @protected
					 */
					onDeleted: function() {
						this.setActiveRow(this.allFoldersRecordValues.Id);
						this.set("SelectedRows", []);
						this.clear();
						this.load(true);
						this.showFolderInfo();
					},

					/**
					 * Обрабатывает выбор элемента
					 * @protected
					 */
					selectButton: function() {
						this.renameFolder();
					},

					/**
					 * Обрабатывает настройку отображения реестра менеджера групп
					 * @protected
					 * @param {string} rowId
					 */
					showFolderInfo: function(rowId) {
						if (!rowId) {
							rowId = this.get("ActiveRow");
						}
						if (rowId === this.favoriteRootRecordItem.value) {
							this.set("ActiveRow", null);
						}
						if (!this.get("IsGridDoubleClickAllowed")) {
							this.set("IsGridDoubleClickAllowed", true);
						}
						var parentRow = null;
						if (!Ext.isEmpty(rowId)) {
							parentRow = this.getGridColumnValue(rowId, "Parent");
							this.set("IsFavoriteSelected", (parentRow === this.favoriteRootRecordItem));
							if (this.catalogueRootRecordItem) {
								this.set("IsCatalogueSelected", (parentRow === this.catalogueRootRecordItem.value));
							}
						}
						this.set("AdministratedButtonVisible",
							this.entitySchema.administratedByRecords && !Ext.isEmpty(parentRow) && !this.get("MultiSelect"));
						if (rowId && !this.get("MultiSelect")) {
							var isCatalogueItem = false;
							if (this.currentEditElement) {
								var actualFolderId = this.getActualFolderId(rowId);
								var actualCatalogueFolderId = this.getActualCatalogueFolderId(rowId);
								this.currentEditElement.set("IsInCatalogue", false);
								if (actualFolderId) {
									isCatalogueItem = false;
									this.currentEditElement.loadEntity(actualFolderId, function() {
										this.applyFolderFilters(this.currentEditElement.get("Id"), true);
									}, this);
								} else if (actualCatalogueFolderId ||
									(this.catalogueRootRecordItem && rowId === this.catalogueRootRecordItem.value)) {
									isCatalogueItem = true;
									this.currentEditElement.set("IsInCatalogue", isCatalogueItem);
									this.currentEditElement.set("Id", null);
									this.applyCatalogueFilters(rowId, true);
								} else if ((rowId === this.favoriteRootRecordItem.value) ||
									(rowId === this.allFoldersRecordItem.value)) {
									isCatalogueItem = false;
									this.currentEditElement.set("Id", null);
									this.currentEditElement.set("Name", null);
									this.currentEditElement.set("FolderType", null);
									this.applyFolderFilters(rowId, true);
								}
							}
							this.set("CanRename", !Ext.isEmpty(parentRow));
							this.set("SelectEnabled", !Ext.isEmpty(parentRow));
						} else {
							this.set("CanRename", false);
							this.set("SelectEnabled", (rowId && !Ext.isEmpty(parentRow)));
						}
					},

					/**
					 * Заполняет коллекцию раскрытых групп
					 * @protected
					 * @param {object} selectedRow
					 * @param {Terrasoft.Collection} items
					 * @param {Array} expandedLevels
					 */
					fillExpandedLevels: function(selectedRow, items, expandedLevels) {
						if (items.contains(selectedRow)) {
							var parent = items.get(selectedRow).get("Parent");
							if (parent && !Terrasoft.contains(expandedLevels, parent.value)) {
								expandedLevels.push(parent.value);
								this.fillExpandedLevels(parent.value, items, expandedLevels);
							}
						}
					},

					/**
					 * Открывает иерархические группы до определенного элемента
					 * @protected
					 * @param {Array} selectedRows
					 * @param {Terrasoft.Collection} items
					 * @returns {Array}
					 */
					expandToSelectedItems: function(selectedRows, items) {
						MaskHelper.ShowBodyMask();
						var expandLevels = [];
						if (!items) {
							items = this.get("GridData");
						}
						if (selectedRows.length === 1 && selectedRows[0].indexOf("_") > 0) {
							expandLevels = this.restoreExpandedLevels(selectedRows[0]);

						} else if (selectedRows) {
							Terrasoft.each(selectedRows, function(selectedRow) {
								this.fillExpandedLevels(selectedRow, items, expandLevels);
							}, this);
						}
						this.set("ExpandHierarchyLevels", expandLevels);
						MaskHelper.HideBodyMask();
						return expandLevels;
					},

					/**
					 * Восстанавливает развернутые группы по сборному идентификатору
					 * @param {string} folderId
					 * @returns {Array}
					 */
					restoreExpandedLevels: function(folderId) {
						var expandLevels = [];
						var idCollection = folderId.split("_");
						var nId = "";
						for (var i = idCollection.length - 1; i > 0; i--) {
							var z = idCollection[i];
							if (!Ext.isEmpty(nId)) {
								nId = z + "_" + nId;
							} else {
								nId = z;
							}
							expandLevels.push(nId);
						}
						return expandLevels;
					},

					/**
					 * обрабатывает открытие иерархической группы
					 * @protected
					 * @param {string} itemKey
					 * @param {boolean} expanded
					 */
					onExpandHierarchyLevels: function(itemKey, expanded, callback) {
						this.set("IsGridDoubleClickAllowed", false);
						var waitSelect = false;
						var gridData = this.get("GridData");
						if (gridData.contains(itemKey)) {
							var row = gridData.get(itemKey);
							var parent = row.get("Parent");
							var isInCatalogue = row.get("IsInCatalogue");
							if (!Ext.isEmpty(parent) && isInCatalogue) {
								if (expanded) {
									var rowItem = this.catalogueFolders.getByIndex(row.get("Position") + 1);
									if (rowItem) {
										waitSelect = true;
										MaskHelper.ShowBodyMask();
										var select = this.getCatalogueLevelItemsSelect(rowItem, row);
										select.execute(function(response) {
											var items = new Terrasoft.Collection();
											var grid = Ext.getCmp("foldersGrid");
											response.collection.each(function(item) {
												var currentId = item.get("ColumnPathValueId");
												var compositeKey = currentId + "_" + itemKey;
												if (!gridData.contains(compositeKey)) {
													this.addCatalogItem(item.values, row.rowConfig, itemKey, items, this);
												}
											}, this);
											if (items.getCount() > 0) {
												gridData.loadAll(items, {mode: "child", target: itemKey});
											} else {
												var childrens = [];
												grid.getAllItemChilds(childrens, itemKey);
												if (childrens.length === 0) {
													var toggle = Ext.get(grid.id + grid.hierarchicalTogglePrefix + itemKey);
													toggle.removeCls(grid.hierarchicalMinusCss);
													toggle.removeCls(grid.hierarchicalPlusCss);
												}
											}
											MaskHelper.HideBodyMask();
											if (callback && Ext.isFunction(callback)) {
												callback.call(this);
											}
										}, this);
									}
								}
							}
						}
						if (callback && Ext.isFunction(callback) && !waitSelect) {
							callback.call(this);
						}
					},

					/**
					 * Обрабатывает действия менеджера групп
					 * @protected
					 * @param {string} tag
					 */
					onActiveRowAction: function(tag) {
						switch (tag) {
							case "extendFilter":
								this.showExtendCatalogueFilter();
								break;
							case "favorite":
								this.doFavoriteFolderAction();
								break;
							case "editFilter":
								this.editFolderFilters();
								break;
							case "moveFolder":
								this.moveFolder();
								break;
							case "renameFolder":
								this.renameFolder();
								break;
							case "deleteButton":
								this.deleteButton();
								break;
							case "editRights":
								this.editRights();
								break;
						}
					},

					/**
					 * Устанавливает активную группу
					 * @protected
					 * @param {string} rowId
					 */
					setActiveRow: function(rowId) {
						this.set("ActiveRowToSet", rowId);
					},

					/**
					 * Получает запрос на выборку уровней групп каталога
					 * @protected
					 * @returns {EntitySchemaQuery|*}
					 */
					getCatalogueFolderSelect: function() {
						var select = Ext.create("Terrasoft.EntitySchemaQuery", {
							rootSchemaName: "ProductCatalogueLevel"
						});
						select.addMacrosColumn(Terrasoft.QueryMacrosType.PRIMARY_COLUMN, "Id");
						select.addMacrosColumn(Terrasoft.QueryMacrosType.PRIMARY_DISPLAY_COLUMN, "Name");
						select.addColumn("ColumnCaption");
						select.addColumn("ColumnPath");
						select.addColumn("ReferenceSchemaName");
						var column = select.addColumn("Position");
						column.orderDirection = Terrasoft.OrderDirection.ASC;
						column.orderPosition = 0;
						select.skipRowCount = this.pageNumber * this.pageRowsCount;
						select.rowCount = -1;
						return select;
					},

					/**
					 * Посылает сообщение Обновить меню избранное
					 * @protected
					 * @param {string} folderEntitySchemaName
					 * @param {string} folderSchemaUId
					 * @constructor
					 */
					sendUpdateFavoritesMenu: function(folderEntitySchemaName, folderSchemaUId) {
						var sectionFilterModuleId = sandbox.publish("GetSectionFilterModuleId");
						sandbox.publish("UpdateFavoritesMenu", {
							folderEntitySchemaName: folderEntitySchemaName,
							folderSchemaUId: folderSchemaUId
						}, [sectionFilterModuleId]);
					},

					/**
					 * Загружает раздел
					 * @protected
					 * @param {Array} selectedFolders
					 */
					loadSection: function(selectedFolders) {
						var newState = {
							filterState: {
								folderFilterState: selectedFolders || []
							}
						};
						var url = "SectionModule/" + config.loadSection + "/";
						sandbox.publish("PushHistoryState", {hash: url, stateObj: newState});
					},

					/**
					 * Загружает фильтры групп
					 * @protected
					 * @param {array} selectedFolders
					 */
					resultSelectedFolders: function(selectedFolders) {
						if (config.loadSection) {
							this.loadSection(selectedFolders);
						} else {
							sandbox.publish("ResultSelectedFolders", {
								folders: selectedFolders
							}, [sandbox.id]);
							sandbox.publish("BackHistoryState");
						}
					},

					/**
					 * Отменяет выбор записи группы
					 * @protected
					 */
					cancelSelecting: function() {
						if (config.loadSection) {
							this.loadSection();
						} else {
							sandbox.publish("BackHistoryState");
						}
					},

					/**
					 * Получает родителя колонки
					 * @param {string} rowId
					 * @returns {*}
					 */
					getBaseParentFolderIfRowFromCatalogue: function(rowId) {
						if (rowId) {
							var row = this.getGridColumn(rowId);
							if (row.get("IsInCatalogue")) {
								return this.allFoldersRecordItem.value;
							} else if (row.get("IsInFavorites")) {
								return this.get("ActiveRowToSet");
							} else {
								return rowId;
							}
						}
						return rowId;
					},

					/**
					 * Добавляет группу
					 * @protected
					 */
					addGeneralFolderButton: function() {
						var activeRow = this.getBaseParentFolderIfRowFromCatalogue(this.getActiveRow());
						this.currentEditElement.createNewFolder(ConfigurationConstants.Folder.Type.General, activeRow);
						this.renameFolder();
					},

					/**
					 * Добавляет группу
					 * @protected
					 */
					addSearchFolderButton: function() {
						var activeRow = this.getBaseParentFolderIfRowFromCatalogue(this.getActiveRow());
						this.currentEditElement.createNewFolder(ConfigurationConstants.Folder.Type.Search, activeRow);
						this.renameFolder();
					},

					/**
					 * Получает модель представления элемента редактирования группы
					 * @protected
					 * @param {string} folderType
					 * @returns {BaseViewModel|*}
					 */
					getFolderEditViewModel: function(folderType) {
						var viewModelConfig = getFolderViewModelConfig(this.entitySchema, this);
						viewModelConfig.methods.getActiveRow = this.getActiveRow();
						var folderViewModel = Ext.create("Terrasoft.BaseViewModel", viewModelConfig);
						folderViewModel.set("FolderType", {value: folderType});
						if (config && config.sectionEntitySchema) {
							folderViewModel.set("sectionEntitySchemaName", config.sectionEntitySchema.name);
						}
						return folderViewModel;
					},

					/**
					 * Возвращает заголовок действия поместить в Избранное
					 * @protected
					 * @returns {*}
					 */
					getFavoriteFolderActionCaption: function() {
						var parentRow = this.getActiveRowParent();
						var caption = (parentRow === config.favoriteRootRecordItem) ?
							resources.localizableStrings.RemoveFromFavoriteMenuItemCaptionV2 :
							resources.localizableStrings.AddToFavoriteMenuItemCaptionV2;
						return caption;
					},

					/**
					 * Возвращает признак видимости действия поместить в Избранное
					 * @protected
					 * @returns {boolean}
					 */
					getFavoriteActionVisible: function() {
						var parentRow = this.getActiveRowParent();
						return !Ext.isEmpty(parentRow);
					},

					/**
					 * Возвращает признак, что выбрана какая-либо группа
					 * @protected
					 * @returns {boolean}
					 */
					getIsFolderSelected: function() {
						var parentRow = this.getActiveRowParent();
						return !Ext.isEmpty(parentRow) || this.get("MultiSelect");
					},

					/**
					 * Обрабатывает удаление группы из Избранного
					 * @protected
					 * @param {string} selectedId
					 * @param {object} scope
					 * @param {boolean} keepActive
					 */
					deleteFromFavorites: function(selectedId, scope, keepActive) {
						var del = Ext.create("Terrasoft.DeleteQuery", {
							rootSchemaName: "FolderFavorite"
						});
						var filters = Ext.create("Terrasoft.FilterGroup");
						filters.addItem(del.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL, "SysAdminUnit",
							Terrasoft.SysValue.CURRENT_USER.value));
						filters.addItem(del.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL, "FolderId",
							selectedId));
						filters.addItem(del.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL,
							"FolderEntitySchemaUId", scope.entitySchema.uId));
						del.filters = filters;
						del.execute(function(response) {
							if (response && response.success) {
								if (!keepActive) {
									scope.set("ActiveRow", null);
								}
								scope.clear();
								scope.load(true);
								scope.sendUpdateFavoritesMenu(scope.entitySchema.name, scope.entitySchema.uId);
							}
						}, this);
					},

					/**
					 * Восстанавливает раскрытые элементы каталога
					 * @protected
					 */
					restoreExpandedCatalogue: function() {
						var expandedLevels = this.get("ExpandHierarchyLevels");
						var gridData = this.get("GridData");
						Terrasoft.each(expandedLevels, function(itemKey) {
							if (gridData.contains(itemKey)) {
								var row = gridData.get(itemKey);
								var isCatalogue = row.get("IsInCatalogue");
								if (isCatalogue && !Ext.isEmpty(row.get("Parent"))) {
									var childrens = gridData.filterByFn(function(item) {
										return item.get("Parent") === itemKey;
									});
									childrens.each(function(child) {
										gridData.removeByKey(child.get("Id"));
									}, this);
									if (childrens.getCount()) {
										gridData.loadAll(childrens, {mode: "child", target: itemKey});
									}
								}
							}
						}, this);
					},

					/**
					 * Восстанавливает раскрытые элементы каталога с запросом в БД
					 * @protected
					 * @param {Array} expandHierarchyLevels
					 * @param {Function} callback
					 */
					restoreExpandedCatalogueAsync: function(expandHierarchyLevels, callback) {
						var expandedLevels = expandHierarchyLevels;
						if (expandedLevels && expandedLevels.length) {
							var me = this;
							var recursionCallback = function() {
								expandedLevels = expandedLevels.slice(1);
								if (expandedLevels.length) {
									me.onExpandHierarchyLevels.call(me, expandedLevels[0], true, recursionCallback);
								} else {
									if (callback) {
										callback.call(this);
									}
								}
							};
							this.onExpandHierarchyLevels.call(this, expandedLevels[0], true, recursionCallback);
						} else {
							if (callback) {
								callback.call(this);
							}
						}
					},
					/**
					 * Получает массив Названий пути каталогов
					 * @protected
					 * @param {string} itemKey
					 * @param {Array} nameArray
					 * @returns {*}
					 */
					getCatalogueFilterFullNameParts: function(itemKey, nameArray) {
						if (!nameArray) {
							nameArray = [];
						}
						var gridData = this.get("GridData");
						var row = gridData.get(itemKey);
						var parentKey = row.get("Parent");
						if (Ext.isEmpty(parentKey)) {
							return nameArray;
						}
						nameArray.push(row.get("Name"));
						this.getCatalogueFilterFullNameParts(parentKey, nameArray);
					},

					/**
					 * Получает полное Название пути каталога
					 * @protected
					 * @param {object} activeRow
					 * @returns {string}
					 */
					getCatalogueFilterFullName: function(activeRow) {
						var names = [];
						this.getCatalogueFilterFullNameParts(activeRow, names);
						names.reverse();
						return names.join(" / ");
					},

					/**
					 * Выделяет идентификатор типа продукта из составного идентификатора элемента каталога.
					 * @param {object} compositeId Составной идентификатор элемента каталога.
					 * @returns {String} Идентификатор типа продукта или null,
					 * если TypeCatalogueLevelPosition неопределен.
					 */
					extractProductTypeIdFromComposite: function(compositeId) {
						var typeCatalogueLevelPos = this.get("TypeCatalogueLevelPosition");
						if (Ext.isEmpty(typeCatalogueLevelPos) || Ext.isEmpty(compositeId)) {
							return null;
						}
						var ids = compositeId.split("_").reverse();
						var productTypeId = ids[typeCatalogueLevelPos + 1];
						return productTypeId;
					},

					/**
					 * Обрабатывает нажатие на иконку расширенной фильтрации в каталоге
					 * @protected
					 */
					showExtendCatalogueFilter: function() {
						var activeRow = this.getActiveRow();
						var productTypeId = this.extractProductTypeIdFromComposite(activeRow);
						var idModule = sandbox.id + "_SpecificationFilterModule";
						this.set("ExtFilterId", idModule);
						sandbox.subscribe("CloseExtendCatalogueFilter", function() {
							this.resetFolderView();
							sandbox.unloadModule(idModule);
						}, this, [idModule]);
						sandbox.subscribe("GetExtendCatalogueFilterInfo", function() {
							var name = this.getCatalogueFilterFullName(activeRow);
							return {
								activeRow: activeRow,
								displayValue: name,
								productType: productTypeId
							};
						}, this, [idModule]);

						sandbox.subscribe("UpdateExtendCatalogueFilter", function(args) {
							this.set("ExtendedCatalogueFilters", args.filters);
							this.applyCatalogueFilters(args.rowId, true);
						}, this, [idModule]);
						this.set("OldActiveRow", activeRow);
						this.set("ActiveRow", null);
						this.set("IsFoldersContainerVisible", false);
						this.set("IsExtendCatalogueFilterContainerVisible", true);
						sandbox.loadModule("SpecificationFilterModule", {
							renderTo: "extendCatalogueFilterContainer_" + sandbox.id,
							id: idModule
						});
					},

					/**
					 * Очищает все подписки на события и уничтожает объект.
					 * @overridden
					 * @param {Object} config Параметры уничтожения модуля
					 */
					destroy: function() {
						if (this.get("IsExtendCatalogueFilterContainerVisible")) {
							this.resetFolderView();
						}
						sandbox.unloadModule(this.get("ExtFilterId"));
					},

					/**
					 * Восстанавливает состояние отображения модуля выбора групп
					 * @protected
					 */
					resetFolderView: function() {
						this.set("IsFoldersContainerVisible", true);
						this.set("IsExtendCatalogueFilterContainerVisible", false);
						this.set("ExtendedCatalogueFilters", null);
						this.restoreExpandedCatalogue();
						var oldActiveRow = this.get("OldActiveRow");
						this.set("ActiveRow", oldActiveRow || this.get("ActiveRow") || null);
						this.set("OldActiveRow", null);
					},

					/**
					 * Обрабатывает помещение группы в Избранные
					 * @protected
					 */
					doFavoriteFolderAction: function() {
						var activeRow = this.getActiveRow();
						if (!activeRow) {
							return;
						}
						var isInFavorites = this.get("GridData").get(activeRow).get("IsInFavorites");
						this.setActiveRow(this.getActualFolderId(activeRow));
						var filters;
						if (isInFavorites) {
							var selectedId = this.getActualFolderId(activeRow);
							var parentRow = this.getActiveRowParent();
							var keepActive = parentRow !== config.favoriteRootRecordItem;
							this.deleteFromFavorites(selectedId, this, keepActive);
						} else {
							var select = Ext.create("Terrasoft.EntitySchemaQuery", {
								rootSchemaName: "FolderFavorite"
							});
							select.addMacrosColumn(Terrasoft.QueryMacrosType.PRIMARY_COLUMN, "Id");
							filters = Ext.create("Terrasoft.FilterGroup");
							filters.addItem(select.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL,
								"SysAdminUnit", Terrasoft.SysValue.CURRENT_USER.value));
							filters.addItem(select.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL,
								"FolderEntitySchemaUId", this.entitySchema.uId));
							filters.addItem(select.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL,
								"FolderId", activeRow));
							select.filters = filters;
							select.getEntityCollection(function(response) {
								if (response && response.success) {
									if (response.collection.getItems().length > 0) {
										return;
									}
									var insert = Ext.create("Terrasoft.InsertQuery", {
										rootSchemaName: "FolderFavorite"
									});
									insert.setParameterValue("SysAdminUnit", Terrasoft.SysValue.CURRENT_USER.value,
										Terrasoft.DataValueType.GUID);
									insert.setParameterValue("FolderId", activeRow, Terrasoft.DataValueType.GUID);
									insert.setParameterValue("FolderEntitySchemaUId", config.entitySchema.uId,
										Terrasoft.DataValueType.GUID);
									insert.execute(function(response) {
										if (response && response.success) {
											this.clear();
											this.load(true);
											this.sendUpdateFavoritesMenu(config.entitySchema.name,
												config.entitySchema.uId);
										}
									}, this);
								}
							}, this);
						}
					},

					/**
					 * Изменяет фильтры групп
					 * @protected
					 */
					editFolderFilters: function() {
						var activeRow = this.getActiveRow();
						if (!activeRow || !this.currentEditElement) {
							return;
						}
						var sectionFilterModuleId = sandbox.publish("GetSectionFilterModuleId");
						var folder = this.currentEditElement;
						var searchData = folder.get("SearchData");
						var deserializeData = null;
						if (Ext.isEmpty(searchData)) {
							deserializeData = Terrasoft.createFilterGroup();
						} else {
							deserializeData = Terrasoft.deserialize(searchData);
						}

						sandbox.publish("UpdateCustomFilterMenu", {
							"isExtendedModeHidden": false,
							"isFoldersHidden": true,
							"clearActiveFolder": true
						}, [sectionFilterModuleId]);
						sandbox.publish("CustomFilterExtendedMode", {
							folder: folder,
							filter: deserializeData
						}, [sandbox.id]);
					},

					/**
					 * Обрабатывает редактирование прав на запись
					 * @protected
					 */
					editRights: function() {
						var recordInfo = {
							entitySchemaName: this.entitySchema.name,
							entitySchemaCaption: this.entitySchema.caption,
							primaryColumnValue: this.currentEditElement.get(this.entitySchema.primaryColumnName),
							primaryDisplayColumnValue: this.currentEditElement.get(this.entitySchema.primaryDisplayColumnName)
						};
						var id = sandbox.id + "_Rights";
						sandbox.subscribe("GetRecordInfo", function() {
							return recordInfo;
						}, this, [id]);
						var params = sandbox.publish("GetHistoryState");
						params.state.foldersManagerOpened = true;
						sandbox.publish("PushHistoryState", {
							stateObj: params.state,
							hash: params.hash.historyState,
							silent: true
						});
						sandbox.loadModule("Rights", {
							renderTo: "centerPanel",
							id: id,
							keepAlive: true
						});
					},

					/**
					 * Изменяет вид реестра
					 * @protected
					 * @param {boolean} multiSelect
					 * @param {function} callback
					 */
					changeGridMode: function(multiSelect, callback) {
						this.set("AdministratedButtonVisible", this.entitySchema.administratedByRecords && !multiSelect);
						this.set("MultiSelect", multiSelect);
						this.set("SelectEnabled", multiSelect);
						this.clear();
						this.load(true, callback);
						this.showFolderInfo();
					},

					/**
					 * Обрабатывает перемещение группы
					 * @protected
					 * @param {Array} folders
					 * @param {Function} callback
					 */
					processMoveFolders: function(folders, callback) {
						var filters = Ext.create("Terrasoft.FilterGroup");
						var primaryDisplayColumn = this.entitySchema.primaryDisplayColumn;
						var moveFilter = Terrasoft.createColumnInFilterWithParameters(this.entitySchema.primaryColumnName,
							folders);
						moveFilter.comparisonType = Terrasoft.ComparisonType.NOT_EQUAL;
						filters.addItem(moveFilter);

						var rootEmailFilter = Terrasoft.createColumnFilterWithParameter(Terrasoft.ComparisonType.NOT_EQUAL,
								"FolderType", ConfigurationConstants.Folder.Type.RootEmail);
						filters.addItem(rootEmailFilter);

						if (!this.get("UseStaticFolders")) {
							var typeFilter = Terrasoft.createColumnFilterWithParameter(Terrasoft.ComparisonType.NOT_EQUAL,
									"FolderType", ConfigurationConstants.Folder.Type.General);
							filters.addItem(typeFilter);
						}

						var handler = function(args) {
							var collection = args.selectedRows.collection;
							var parentId = null;
							if (collection.length > 0) {
								var parent = collection.items[0];
								parentId = parent.value;
							}
							this.changeFolderParent(folders, parentId, callback);
						};
						var columnsConfig = [{
							cols: 24,
							key: [{
								name: {bindTo: "FolderType"},
								type: Terrasoft.GridKeyType.ICON16LISTED
							}, {
								name: {bindTo: "Name"}
							}]
						}];
						var captionsConfig = [{
							cols: 24,
							columnName: primaryDisplayColumn.name,
							name: primaryDisplayColumn.caption,
							sortColumnDirection: Terrasoft.core.enums.OrderDirection.ASC
						}];
						var config = {
							entitySchemaName: this.entitySchema.name,
							type: "listed",
							useListedLookupImages: true,
							multiSelect: false,
							columnName: this.entitySchema.primaryDisplayColumnName,
							searchValue: null,
							filters: filters,
							columns: ["Name", "FolderType", "Parent"],
							hierarchical: true,
							hierarchicalColumnName: "Parent",
							actionsButtonVisible: false,
							columnsConfig: [{
								cols: 24,
								key: [{
									name: {bindTo: "FolderType"},
									type: Terrasoft.GridKeyType.ICON16LISTED
								}, {
									name: {bindTo: "Name"}
								}]
							}],
							columnsSettingsProfile: {
								isTiled: false,
								listedColumnsConfig: Ext.encode(columnsConfig),
								captionsConfig: Ext.encode(captionsConfig)
							},
							virtualRootItem: this.allFoldersItem,
							virtualRootItemValues: this.allFoldersRecordItem
						};
						LookupUtilities.Open(sandbox, config, handler, this);
					},

					/**
					 * Изменяет родителя группы
					 * @protected
					 * @param {Array} folders
					 * @param {string} parentId
					 * @param {Function} callback
					 */
					changeFolderParent: function(folders, parentId, callback) {
						var mainViewModel = this;
						var folderId = folders.pop();
						var allFoldersId = config.allFoldersRecordItem.value;
						var favoriteRootFolderId = config.favoriteRootRecordItem.value;
						if (folderId === parentId || !parentId || parentId.value === allFoldersId ||
							parentId.value === favoriteRootFolderId) {
							parentId = null;
						}
						var folder = Ext.create("Terrasoft.BaseViewModel", getFolderViewModelConfig(this.entitySchema));
						folder.loadEntity(folderId, function() {
							this.set("Parent", {value: parentId});
							if (folders.length) {
								this.saveEntity(function(result) {
									if (result.success) {
										this.changeFolderParent(folders, parentId, callback);
									} else {
										this.showInformationDialog(result.errorInfo.message);
									}
								}, mainViewModel);
							} else {
								this.saveEntity(function(result) {
									if (result.success) {
										this.set("ActiveRow", null);
										if (callback) {
											callback.call(mainViewModel);
										}
									} else {
										this.showInformationDialog(result.errorInfo.message);
									}
								}, mainViewModel);
							}
						});
					},

					/**
					 * Применяет удаление записей
					 * @protected
					 */
					onDeleteAccept: function onDeleteAccept() {
						var activeRow = this.get("ActiveRow");
						var selectedRows = this.get("SelectedRows") || [];
						if (selectedRows.length || activeRow) {
							var selectedValues = selectedRows.length ? selectedRows : [activeRow];
							var actualSelectedValues = [];
							Terrasoft.each(selectedValues, function(currentRecordId) {
								var actualFolderId = this.getActualFolderId(currentRecordId);
								actualSelectedValues.push(actualFolderId);
								this.deleteFromFavorites(actualFolderId, this);
							}, this);
							var query = Ext.create("Terrasoft.DeleteQuery", {
								rootSchema: this.entitySchema
							});
							var filter = query.createColumnInFilterWithParameters(this.entitySchema.primaryColumnName,
								actualSelectedValues);
							query.filters.addItem(filter);
							query.execute(function(response) {
								if (response.success) {
									this.onDeleted();
								} else {
									this.showInformationDialog(ResponseExceptionHelper.GetExceptionMessage(response.errorInfo));
								}
							}, this);
						}
					},

					/**
					 * Получает стандартную конфигурацию строки реестра
					 * @protected
					 * @param {object} rowConfig
					 * @param {Terrasoft.Collection} itemValues
					 * @returns {BaseViewModel|*}
					 */
					getGridRecordByItemValues: function(rowConfig, itemValues) {
						var gridRecord = Ext.create("Terrasoft.BaseViewModel", {
							entitySchema: config.entitySchema,
							rowConfig: rowConfig,
							values: itemValues,
							isNew: false,
							isDeleted: false,
							methods: {}
						});
						return gridRecord;
					},

					/**
					 * Обработчик колонки Наименование
					 * @protected
					 * @param {string} returnCode
					 * @param {object} controlData
					 */
					nameInputBoxHandler: function(returnCode, controlData) {
						var modifyFolderFunc = config.modifyFolderFunc;
						if (returnCode === "ok" && controlData.name.value) {
							this.currentEditElement.set(this.entitySchema.primaryDisplayColumnName,
								controlData.name.value);
							if (modifyFolderFunc != null && typeof(modifyFolderFunc) === "function") {
								var modifyColumn = config.modifyFolderFunc.call(viewModelConfig, "set", controlData);
								if ((modifyColumn != null) && (modifyColumn.columnName != null)) {
									this.currentEditElement.set(modifyColumn.columnName, modifyColumn.columnValue);
								}
							}
							this.setActiveRow(this.currentEditElement.get(this.entitySchema.primaryColumnName));
							this.currentEditElement.saveButton();
						} else {
							this.currentEditElement.cancelButton();
						}
					},

					/**
					 * Переименовывает группу
					 * @protected
					 */
					renameFolder: function() {
						var caption = null;
						var modifyFolderFunc = config.modifyFolderFunc;
						var controls = {
							name: {
								dataValueType: Terrasoft.DataValueType.TEXT,
								caption: this.entitySchema.primaryDisplayColumn.caption,
								value: this.currentEditElement.get(this.entitySchema.primaryDisplayColumnName)
							}
						};
						if (Ext.isFunction(modifyFolderFunc)) {
							controls = modifyFolderFunc.call(this, "get");
						}
						var currentEditElement = this.currentEditElement;
						if (currentEditElement.isNew) {
							caption = (currentEditElement.get("FolderType").value ===
							ConfigurationConstants.Folder.Type.Search) ?
								resources.localizableStrings.NewSearchFolderInputBoxCaptionV2 :
								resources.localizableStrings.NewGeneralFolderInputBoxCaptionV2;
						} else {
							caption = (currentEditElement.get("FolderType").value ===
							ConfigurationConstants.Folder.Type.Search) ?
								resources.localizableStrings.SearchFolderInputBoxCaptionV2 :
								resources.localizableStrings.GeneralFolderInputBoxCaptionV2;
						}
						Terrasoft.utils.inputBox(
							caption,
							this.nameInputBoxHandler,
							["ok", "cancel"],
							this,
							controls,
							{
								defaultButton: 0,
								classes: {
									coverClass: ["cover-calss1", "cover-calss2"],
									captionClass: ["caption-calss1", "caption-calss2"]
								}
							}
						);
					},

					/**
					 * Закрывает менеджер групп
					 * @protected
					 */
					closeFolderManager: function() {
						if (!Ext.isEmpty(this.currentEditElement)) {
							if (this.currentEditElement.get("IsInCatalogue")) {
								this.applyCatalogueFilters(this.get("ActiveRow"), true);
							} else {
								this.applyFolderFilters(this.currentEditElement.get("Id"), true);
							}
						}
						var sectionFilterModuleId = sandbox.publish("GetSectionFilterModuleId");
						var activeRow = this.get("ActiveRow");
						this.set("OldActiveRow", activeRow);
						this.set("ActiveRow", null);
						sandbox.publish("HideFolderTree", null, [sectionFilterModuleId]);
					},

					/**
					 * Получает колонку реестра
					 * @protected
					 * @param {string} rowId
					 * @returns {*}
					 */
					getGridColumn: function(rowId) {
						var gridData = this.get("GridData");
						if (!Ext.isEmpty(gridData) && rowId && gridData.contains(rowId)) {
							return gridData.get(rowId);
						}
						return null;
					},

					/**
					 * Получает значение колонки реестра
					 * @protected
					 * @param {string} rowId
					 * @param {string} columnName
					 * @returns {*}
					 */
					getGridColumnValue: function(rowId, columnName) {
						var result = null;
						var rowData = this.getGridColumn(rowId);
						if (!Ext.isEmpty(rowData)) {
							result = rowData.get(columnName);
						}
						return result;
					},

					/**
					 * Получает реальный идентификатор группы
					 * @protected
					 * @param {string} rowId
					 * @returns {*}
					 */
					getActualFolderId: function(rowId) {
						return this.getGridColumnValue(rowId, "ActualFolderId");
					},

					/**
					 * Получает реальный идентификатор группы каталога
					 * @protected
					 * @param {string} rowId
					 * @returns {*}
					 */
					getActualCatalogueFolderId: function(rowId) {
						return this.getGridColumnValue(rowId, "ActualCatalogueFolderId");
					},

					/**
					 * Получает активную запись
					 * @protected
					 * @returns {Mixed|String|Number|Date|Boolean|Object|*|get|get|get}
					 */
					getActiveRow: function() {
						return this.get("ActiveRow");
					},

					/**
					 * Получает родителя активной записи
					 * @protected
					 * @returns {*}
					 */
					getActiveRowParent: function() {
						var activeRow = this.getActiveRow();
						return this.getGridColumnValue(activeRow, "Parent");
					},

					/**
					 * Применяет фильтры группы каталога
					 * @protected
					 * @param {string} rowId
					 */
					applyCatalogueFilters: function(rowId, addToQuickFilter) {
						var filtersGroup = Terrasoft.createFilterGroup();
						var extendedCatalogueFilters = this.get("ExtendedCatalogueFilters");
						if (extendedCatalogueFilters) {
							filtersGroup.addItem(extendedCatalogueFilters);
						}
						var filtersGroupResult = Terrasoft.createFilterGroup();
						var resultFiltersObject = null;
						if (rowId && rowId !== this.catalogueRootRecordItem.value) {
							var rowData = this.getGridColumn(rowId);
							var position = rowData.get("Position");
							var parentData = this.getGridColumn(rowData.get("Parent"));
							var currentID = rowData.get("ActualCatalogueFolderId");
							filtersGroup.addItem(Terrasoft.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL,
								rowData.get("ColumnPath"), currentID));
							for (var i = position - 1; i >= 0; i--) {
								var rowItem = this.catalogueFolders.getByIndex(i);
								if (rowItem) {
									var currentParentID = parentData.get("ActualCatalogueFolderId");
									filtersGroup.addItem(Terrasoft.createColumnFilterWithParameter(
										Terrasoft.ComparisonType.EQUAL, rowItem.get("ColumnPath"), currentParentID));
									parentData = this.getGridColumn(parentData.get("Parent"));
								}
							}
							var serializationInfo = filtersGroup.getDefSerializationInfo();
							serializationInfo.serializeFilterManagerInfo = true;
							resultFiltersObject = {
								value: rowData.get("ActualCatalogueFolderId"),
								displayValue: this.getCatalogueFilterFullName(rowData.get("Id")),
								filter: filtersGroup.serialize(serializationInfo),
								folder: rowData,
								folderType: rowData.get("FolderType"),
								sectionEntitySchemaName: config.sectionEntitySchema.name
							};
						}

						filtersGroupResult.add("FolderFilters", filtersGroup);

						var filterItem = {
							filters: filtersGroupResult
						};

						if (this.isProductSelectMode) {
							sandbox.publish("UpdateCatalogueFilter", filterItem);
							return;
						}
						if (addToQuickFilter) {
							sandbox.publish("ResultFolderFilter", resultFiltersObject, [sandbox.id]);
						}

					},

					/**
					 * Применяет фильтры группы
					 * @protected
					 * @param {string} rowId
					 * @param {boolean} addToQuickFilter
					 */
					applyFolderFilters: function(rowId, addToQuickFilter) {
						var allFoldersId = config.allFoldersRecordItem.value;
						var favoriteRootFolderId = config.favoriteRootRecordItem.value;
						var filtersGroup = Terrasoft.createFilterGroup();
						var currentItem = this.currentEditElement;
						var sectionFilterModuleId = sandbox.publish("GetSectionFilterModuleId");
						var currentItemType = currentItem.get("FolderType");
						var resultFiltersObject = null;
						if (!this.currentEditElement) {
							return;
						}
						var searchData = currentItem.get("SearchData");
						if (!Ext.isEmpty(rowId) && (rowId !== allFoldersId) && (rowId !== favoriteRootFolderId)) {
							var folderTypeId = currentItemType.value;
							var isGeneralFolder = (folderTypeId === ConfigurationConstants.Folder.Type.General);
							var isMailBoxFolder = (folderTypeId === ConfigurationConstants.Folder.Type.MailBox);
							var isSubEmailFolder = (folderTypeId === ConfigurationConstants.Folder.Type.SubEmail);
							if (isGeneralFolder || isMailBoxFolder || isSubEmailFolder) {
								var sectionSchemaName = config.entityColumnNameInFolderEntity;
								var inFolderSchemaName = config.inFolderEntitySchemaName;
								filtersGroup.add("filterStaticFolder", Terrasoft.createColumnInFilterWithParameters(
									Ext.String.format("[{0}:{1}:Id].Folder", inFolderSchemaName, sectionSchemaName),
									[rowId]));
							} else {
								if (!Ext.isEmpty(searchData)) {
									filtersGroup.add("filterDynamicFolder", Terrasoft.deserialize(searchData));
								}
							}
							var serializationInfo = filtersGroup.getDefSerializationInfo();
							serializationInfo.serializeFilterManagerInfo = true;
							resultFiltersObject = {
								value: currentItem.get("Id"),
								displayValue: currentItem.get("Name"),
								filter: filtersGroup.serialize(serializationInfo),
								folder: currentItem,
								folderType: currentItem.get("FolderType"),
								sectionEntitySchemaName: config.sectionEntitySchema.name
							};
						}
						var folderMenuItemConfig = null;
						if (currentItemType && currentItemType.value === ConfigurationConstants.Folder.Type.Search) {
							folderMenuItemConfig = {
								value: currentItem.get("Id"),
								displayValue: currentItem.get("Name"),
								folderType: currentItemType,
								folder: currentItem,
								filter: !Ext.isEmpty(searchData) ?
									Terrasoft.deserialize(currentItem.get("SearchData")) : null,
								sectionEntityScheamName: config.sectionEntitySchema.name
							};
						}
						if (this.isProductSelectMode) {
							var filtersGroupResult = Terrasoft.createFilterGroup();
							filtersGroupResult.add("FolderFilters", filtersGroup);
							var filterItem = {
								filters: filtersGroupResult
							};
							sandbox.publish("UpdateCatalogueFilter", filterItem);
							return;
						}
						sandbox.publish("UpdateCustomFilterMenu", folderMenuItemConfig, [sectionFilterModuleId]);
						if (addToQuickFilter) {
							sandbox.publish("ResultFolderFilter", resultFiltersObject, [sandbox.id]);
						}
					}
				}
			};
			return viewModelConfig;
		}

		/**
		 * Получает конфигурацию представления модели группы
		 * @param {object} entitySchema
		 * @param {object} mainViewModel
		 * @returns {Object}
		 */
		function getFolderViewModelConfig(entitySchema, mainViewModel) {
			var viewModelConfig = {
				entitySchema: entitySchema,
				values: {
					/**
					 * Флаг, включает редактирование группы
					 * @type {Bollean}
					 */
					editMode: false
				},
				methods: {
					/**
					 * Создает новую группу
					 * @protected
					 * @private
					 * @param {string} folderType
					 * @param {string} parent
					 */
					createNewFolder: function(folderType, parent) {
						this.isNew = true;
						var validationConfig = this.validationConfig;
						this.validationConfig = null;
						Terrasoft.each(this.columns, function(column) {
							this.set(column.name, null);
						}, this);
						if ((parent === mainViewModel.allFoldersRecordItem.value) ||
							(parent === mainViewModel.favoriteRootRecordItem.value)) {
							parent = null;
						}
						this.validationConfig = validationConfig;
						this.setDefaultValues();
						this.set("Parent", {value: parent});
						this.set("FolderType", {value: folderType});
						this.set("editMode", true);
					},

					/**
					 * обновляет текущий выбранный элемент
					 * @protected
					 * @private
					 * @param {object} result
					 */
					updateCurrentSelectedElement: function(result) {
						if (result.success) {
							mainViewModel.load(false, function() {
								if (this.wasNew) {
									mainViewModel.set("ActiveRow", this.get(this.primaryColumnName));
								}
								mainViewModel.showFolderInfo();
							}, this);
							this.set("editMode", false);
						} else {
							this.showInformationDialog(result.errorInfo.message);
						}
					},

					/**
					 * Обрабатывает нажатие на кнопку "Сохранить"
					 * @protected
					 * @private
					 */
					saveButton: function() {
						if (this.isNew) {
							this.wasNew = true;
							var parent = this.get("Parent");
							if (parent && parent.value) {
								var expandedLevels = mainViewModel.get("ExpandHierarchyLevels").slice(0);
								if (!Terrasoft.contains(expandedLevels, parent.value)) {
									expandedLevels.push(parent.value);
								}
								mainViewModel.set("ExpandHierarchyLevels", expandedLevels);
							}
							var folderType = this.get("FolderType");
							if (folderType && folderType.value === ConfigurationConstants.Folder.Type.Search) {
								var filters = Ext.create("Terrasoft.FilterGroup");
								var serializationInfo = filters.getDefSerializationInfo();
								serializationInfo.serializeFilterManagerInfo = true;
								this.set("SearchData", filters.serialize(serializationInfo));
							}
						}
						this.saveEntity(this.updateCurrentSelectedElement);
					},

					/**
					 * Сохраняет выбранную группу и фильтрацию по ней
					 * @protected
					 * @private
					 * @param {object} serializedFilters
					 */
					saveLookupFolder: function(serializedFilters) {
						if (this.isNew) {
							this.wasNew = true;
							var parent = this.get("Parent");
							if (parent && parent.value) {
								var expandedLevels = mainViewModel.get("ExpandHierarchyLevels").slice(0);
								if (!Terrasoft.contains(expandedLevels, parent.value)) {
									expandedLevels.push(parent.value);
								}
								mainViewModel.set("ExpandHierarchyLevels", expandedLevels);
							}
						}
						var folderType = this.get("FolderType");
						if (folderType && folderType.value === ConfigurationConstants.Folder.Type.Search) {
							this.set("SearchData", serializedFilters);
						}
						this.saveEntity(function(result) {
							if (!result.success) {
								this.showInformationDialog(result.errorInfo.message);
							}
						});
					},

					/**
					 * Обрабатывает нажатие не кнопку отмены, отключает режим редатирования
					 * @protected
					 * @private
					 */
					cancelButton: function() {
						if (this.isNew) {
							var parent = this.get("Parent");
							if (parent && parent.value) {
								mainViewModel.showFolderInfo(parent.value);
							}
						} else {
							this.set("editMode", false);
						}
					},

					/**
					 * Включает режим редактрования
					 * @protected
					 * @private
					 */
					goToEditMode: function() {
						this.set("editMode", true);
					}
				}
			};
			viewModelConfig.columns = Terrasoft.deepClone(entitySchema.columns);
			Terrasoft.each(viewModelConfig.columns, function(column) {
				column.columnPath = column.name;
				column.type = Terrasoft.ViewModelColumnType.ENTITY_COLUMN;
			}, this);
			return viewModelConfig;
		}

		return {
			generate: generate,
			getFolderViewModelConfig: getFolderViewModelConfig
		};
	});
