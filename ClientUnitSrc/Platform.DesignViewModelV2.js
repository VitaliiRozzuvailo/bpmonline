define("DesignViewModelV2", ["ext-base", "terrasoft", "DesignViewModelV2Resources", "PageDesignerUtilities",
	"SectionDesignDataModule", "SectionDesignerEnums", "SectionDesignerUtils"],
	function(Ext, Terrasoft, resources, pageDesignerUtilities, designData, sectionDesignerEnums,
			sectionDesignerUtils) {
		var globalNamespace = "Terrasoft";
		var modelNamespace = "Terrasoft.model";
		var resourceColumnRegex = /^Resources\./;
		var localizableStrings = resources.localizableStrings;

		function defineDesignViewModel(name, viewModelClass) {
			var columnsConfig = {
				schema: {
					type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					name: "schema"
				},
				TabsCollection: {
					dataValueType: Terrasoft.DataValueType.COLLECTION,
					type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN
				},
				selectedItem: {
					type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					name: "selectedItem"
				},
				ActiveTabName:  {
					dataValueType: Terrasoft.DataValueType.TEXT,
					type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN
				},
				header: {
					dataValueType: Terrasoft.DataValueType.TEXT,
					type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN
				}
			};
			var detailsConfig = {};
			Terrasoft.each(viewModelClass.prototype.details, function(detail, detailName) {
				detailsConfig[detailName] = Terrasoft.deepClone(detail);
			}, this);
			Terrasoft.each(viewModelClass.prototype.columns, function(column, columnName) {
				if (resourceColumnRegex.test(columnName)) {
					columnsConfig[columnName] = Terrasoft.deepClone(column);
				}
			}, this);
			var fullClassName = modelNamespace + "." + name;
			var alternateClassName = globalNamespace + "." + name;
			var config = {
				alternateClassName: alternateClassName,
				extend: "Terrasoft.BaseViewModel",
				columns: columnsConfig,
				details: detailsConfig,

				/**
				 *  Переход к указанному шагу.
				 * @private
				 * @param {Number} step шаг.
				 */
				goToStep: function(step) {
					var sandbox = this.get("sandbox");
					sandbox.publish("GoToStep", {
						stepCompleteResult: step
					});
				},

				/**
				 * Обработчик события нажатия на кнопку сохранения.
				 * @private
				 */
				onSaveButtonClick: function() {
					var schema = this.get("schema");
					pageDesignerUtilities.getRequireFieldNotInSchem(schema);
					this.goToStep(sectionDesignerEnums.StepType.FINISH);
				},

				/**
				 * Обработчик события нажатия на кнопку добавления новой колонки. Вызывает сервисное окно новой колонки.
				 * @params {String} tag Конфигурационная строка.
				 * @private
				 */
				addNewColumn: function(tag) {
					var args = tag.split(":");
					var type = args[0];
					type = parseInt(type, 10);
					var parentName = args[1];
					var col = args[2];
					var row = args[3];
					var schema = this.get("schema");
					var callback = function(config) {
						designData.createColumn(schema.entitySchemaName, config.column);
						this.addSchemaItem({
							parentName: parentName,
							column: col,
							row: row,
							name: config.column.name,
							caption: config.caption,
							textSize: config.textSize,
							format: config.format,
							contentType: config.contentType,
							labelConfig: config.labelConfig,
							readOnly: config.readOnly
						});
					};

					var column = pageDesignerUtilities.generateEntityColumnByDataValueType(type);
					var config = {
						isNew: true,
						scope: this,
						callback: callback,
						dataValueType: type,
						entitySchema: schema.entitySchema,
						column: column,
						textSize: 0,
						schema: schema
					};
					pageDesignerUtilities.showNewColumnWindow(config);
				},

				/**
				 * Обработчик события нажатия на кнопку добавления существующей колонки. Вызывает сервисное окно новой
				 * колонки.
				 * @params {String} tag Конфигурационная строка.
				 * @private
				 */
				addExistingColumn: function(tag) {
					var schema = this.get("schema");
					var args = tag.split(":");
					var parentName = args[0];
					var col = args[1];
					var row = args[2];
					var callback = function(columnConfig) {
						var column = schema.entitySchema.columns[columnConfig.value];
						var captionResourceName = "Resources.Strings." + column.name + "Caption";
						this.set(captionResourceName, column.caption, { "columnName": captionResourceName });
						this.addSchemaItem({
							parentName: parentName,
							column: col,
							row: row,
							name: column.name,
							caption: {
								bindTo: captionResourceName
							}
						});
					};
					pageDesignerUtilities.showExistingColumnWindow(schema, callback, this);
				},

				/**
				 * Определяет, является ли элемент колонкой.
				 * @private
				 * @returns {Boolean}
				 */
				getIsCurrentItemColumn: function() {
					var schema = this.get("schema");
					var schemaItem = this.getEditedItem(schema);
					if (!schemaItem) {
						return false;
					}
					var item = schemaItem.item;
					var columnName = item.bindTo || item.name;
					var column = schema.entitySchema.columns[columnName];
					return column ? true : false;
				},

				/**
				 * Обработчик события нажатия на кнопку редактирования колонки. Вызывает сервисное окно колонки.
				 * @private
				 */
				editColumn: function() {
					var schema = this.get("schema");
					var schemaClone = Terrasoft.deepClone(schema);
					var schemaItem = this.getEditedItem(schemaClone);
					var item = schemaItem.item;
					var callback = function(config) {
						designData.modifyColumn(schema.entitySchemaName, config.column.uId, config.column);
						item.caption = config.caption;
						item.hideCaption = config.hideCaption;
						item.textSize = config.textSize;
						item.format = config.format;
						item.contentType = config.contentType;
						item.labelConfig = config.labelConfig;
						item.enabled = Ext.isEmpty(config.readOnly) ? true : !config.readOnly;
						this.set("schema", schemaClone);
					};
					var columnName = item.bindTo || item.name;
					var column = schema.entitySchema.columns[columnName] || null;
					var readOnly = Ext.isEmpty(item.enabled) ? false :
						!item.enabled;

					var config = {
						isNew: false,
						scope: this,
						callback: callback,
						dataValueType: column.dataValueType,
						entitySchema: schema.entitySchema,
						column: column,
						hideCaption: item.hideCaption,
						textSize: item.textSize,
						format: item.format,
						contentType: item.contentType,
						readOnly: readOnly,
						labelConfig: item.labelConfig || {},
						schema: schema
					};
					pageDesignerUtilities.showNewColumnWindow(config);
				},

				/**
				 * Функция добавления элемента схемы. Изменяет схему дизайнера.
				 * @private
				 * @params {Object} config Конфигурационный объект элемента.
				 */
				addSchemaItem: function(config) {
					var schema = this.get("schema");
					var schemaClone = Terrasoft.deepClone(schema);
					var parent = this.getSchemaItemInfoByName(config.parentName, schemaClone.viewConfig);
					var col = parseInt(config.column, 10);
					var row = parseInt(config.row, 10);
					var calculatedColSpan = this.calculateColumnWidth(parent.item, col, row);
					var layout = {
						column: col,
						row: row,
						colSpan: calculatedColSpan,
						rowSpan: 1
					};
					var itemName = this.generateUniqName(config.name);
					var enabled =  Ext.isEmpty(config.readOnly) ? true :
						!config.readOnly;
					var item = {
						layout: layout,
						name: itemName,
						bindTo: config.name,
						caption: config.caption,
						textSize: config.textSize,
						format: config.format,
						contentType: config.contentType,
						labelConfig: config.labelConfig,
						enabled: enabled
					};
					parent.item.items.push(item);
					this.set("schema", schemaClone);
				},

				/**
				 * Обработчик события нажатия на кнопку добавления детали. Вызывает сервисное окно детали.
				 * @private
				 */
				addDetail: function() {
					pageDesignerUtilities.showEditDetailWindow(this, this.showDetailWindowCallback);
				},

				/**
				 * Функция обратного вызова сервисного окна детали. Изменяет схему дизайнера.
				 * @private
				 * @params {Object} detailConf Конфигурационный объект текущей детали.
				 * @params {String} detailConf.entitySchema Имя текущего объекта.
				 * @params {String} detailConf.name Имя схемы детали.
				 * @params {String} detailConf.detailKey Имя детали.
				 * @params {Object} detailConf.filter Объект колонок связи.
				 */
				showDetailWindowCallback: function(detailConf) {
					var schemaClone = Terrasoft.deepClone(this.get("schema"));
					var details = schemaClone.details;
					var detailName = detailConf.name;
					var detailEntitySchemaName = detailConf.entitySchema;
					var detailKey = (detailConf.detailKey)
						? detailConf.detailKey
						: this.generateUniqName(detailEntitySchemaName);
					var detailColumn = detailConf.filter.detailColumn;
					var masterColumn = detailConf.filter.masterColumn;
					var activeTabName = this.model.attributes.ActiveTabName;
					var viewConfig = schemaClone.viewConfig[0];
					details[detailKey] = {
						schemaName: detailName,
						entitySchemaName: detailEntitySchemaName,
						filter: {
							detailColumn : detailColumn,
							masterColumn : masterColumn
						}
					};
					this.details[detailKey] = details[detailKey];
					var activeTabContainer = this.getSchemaItemInfoByName(activeTabName, viewConfig);
					var detail = this.getSchemaItemInfoByName(detailKey, activeTabContainer.item);
					if (!detail) {
						var detailItemConfig = {
							itemType: Terrasoft.ViewItemType.DETAIL,
							name: detailKey
						};
						var activeTab = this.getSchemaItemInfoByName(activeTabName, viewConfig);
						activeTab.item.items.push(detailItemConfig);
					}
					var caption = localizableStrings.Detail + detailConf.caption;
					this.createDetailCaptionColumn(detailKey, caption);
					this.set("schema", schemaClone);
					designData.setDetailGridSettings(detailKey, detailConf.gridSettings);
				},

				/**
				 * Функция генерации уникального имени элемента схемы.
				 * @private
				 * @params {String} currentName Имя элемента схемы.
				 * @returns {String} resultName Уникальное имя схемы детали.
				 */
				generateUniqName: function(currentName) {
					var index = 1;
					var resultName = currentName;
					var schemaItem = this.getSchemaItemInfoByName(currentName);
					while (schemaItem) {
						resultName = currentName + index;
						index++;
						schemaItem = this.getSchemaItemInfoByName(resultName);
					}
					return resultName;
				},

				/**
				 * Функция расчета ширины колонки.
				 * @private
				 * @params {Object} item Объект элемента.
				 * @params {Number} col Номер колонки.
				 * @params {Number} row Номер ряда.
				 * @returns {Number} count Ширина колонки.
				 */
				calculateColumnWidth: function(item, col, row) {
					var matrix = pageDesignerUtilities.getFillingGridMatrix(item);
					var count = 0;
					for (var i = col; i < col + 12; i++) {
						if (!matrix[row]) {
							count = 12;
							return count;
						}
						if (!matrix[row][i] && i < 24) {
							count++;
						}
					}
					return count;
				},

				/**
				 * Обработчик события нажатия на кнопку добавления группы. Вызывает сервисное окно группы.
				 * @private
				 */
				addGroup: function() {
					var groupName = this.generateUniqName("group");
					var groupConfig = {
						name: groupName,
						caption: null
					};
					pageDesignerUtilities.showEditGroupWindow(this, this.showGroupWindowCallback, groupConfig);
				},

				/**
				 * Функция обратного вызова сервисного окна группы. Изменяет схему дизайнера.
				 * @private
				 * @params {Object} groupConfig Конфигурационный объект группы.
				 * @params {String} groupConfig.caption Заголовок группы.
				 * @params {String} groupConfig.name Имя группы.
				 */
				showGroupWindowCallback: function(groupConfig) {
					var schemaClone = Terrasoft.deepClone(this.get("schema"));
					var viewConfig = schemaClone.viewConfig[0];
					var activeTabName = this.model.attributes.ActiveTabName;
					var groupCaption = groupConfig.caption;
					var groupName = groupConfig.name;
					var captionResourceName = "Resources.Strings." + groupName + "Caption";
					this.set(captionResourceName, groupCaption, {"columnName": captionResourceName});
					var groupItemConfig = {
						itemType: Terrasoft.ViewItemType.CONTROL_GROUP,
						caption: {
							bindTo: captionResourceName
						},
						items: [{
							itemType: Terrasoft.ViewItemType.GRID_LAYOUT,
							name: groupName + "_gridLayout",
							items: []
						}],
						name: groupName,
						controlConfig: {
							collapsed: false
						}
					};
					var group = this.getSchemaItemInfoByName(groupName, viewConfig);
					if (!group) {
						var activeTab = this.getSchemaItemInfoByName(activeTabName, viewConfig);
						activeTab.item.items.push(groupItemConfig);
						this.createCollapsedColumn(groupName);
					} else {
						group.item.caption = groupItemConfig.caption;
					}
					this.set("schema", schemaClone);
				},

				/**
				 * Обрабатывает событие изменение вкладки Tabs.
				 * @private
				 * @virtual
				 * @param {Terrasoft.BaseViewModel} activeTab Выбранная вкладка.
				 */
				activeTabChange: function(activeTab) {
					var activeTabName = activeTab.get("Name");
					var tabsCollection = this.get("TabsCollection");
					tabsCollection.eachKey(function(tabName, tab) {
						var tabContainerVisibleBinding = tab.get("Name");
						this.set(tabContainerVisibleBinding, (tabName === activeTabName));
					}, this);
					pageDesignerUtilities.initializeGridLayoutDragAndDrop(Ext.bind(this.changeItemPosition, this));
				},

				/**
				 * Получает выбранный элемент.
				 * @private
				 * @params {Object} schema Схема дизайнера.
				 * @returns {Object} editedItemInfo Выбранный элемент.
				 */
				getEditedItem: function(schema) {
					var selectedItem = this.get("selectedItem");
					var editedItemInfo = this.getSchemaItemInfoByName(selectedItem, schema.viewConfig);
					return editedItemInfo;
				},

				/**
				 * Удаляет выбранный элемент. Изменяет схему дизайнера.
				 * @private
				 */
				removeItem: function() {
					var schema = this.get("schema");
					var clonedSchema = Terrasoft.deepClone(schema);
					var item = this.getEditedItem(clonedSchema);
					var itemsContainer = item.parent.items || item.parent;
					var index = itemsContainer.indexOf(item.item);
					itemsContainer.splice(index, 1);
					this.set("schema", clonedSchema);
				},

				/**
				 * Увеличивает ширини колонки на единицу. Изменяет схему дизайнера.
				 * @private
				 */
				incrementWidth: function() {
					var schema = this.get("schema");
					var newSchema = Terrasoft.deepClone(schema);
					var schemaItem = this.getEditedItem(newSchema);
					var item = schemaItem.item;
					var row = item.layout.row;
					var colSpan = item.layout.colSpan;
					if (!colSpan) {
						colSpan = 12;
					}
					var matrix = pageDesignerUtilities.getFillingGridMatrix(schemaItem.parent);
					var lengthCol = item.layout.column + colSpan;
					var lengthRow = row + item.layout.rowSpan;
					if (lengthCol === 24) {
						return;
					}
					for (var i = row; i < lengthRow; i++) {
						if (matrix[i][lengthCol] === true) {
							return;
						}
					}
					item.layout.colSpan = colSpan + 1;
					this.set("schema", newSchema);
				},

				/**
				 * Уменьшает ширини колонки на единицу. Изменяет схему дизайнера.
				 * @private
				 */
				decrementWidth: function() {
					var schema = this.get("schema");
					var newSchema = Terrasoft.deepClone(schema);
					var schemaItem = this.getEditedItem(newSchema);
					var item = schemaItem.item;
					var colSpan = item.layout.colSpan;
					var length = colSpan - 1;
					if (length < 1) {
						return;
					}
					item.layout.colSpan = colSpan - 1;
					this.set("schema", newSchema);
				},

				/**
				 * Растягивает колонку на доступную ширину. Изменяет схему дизайнера.
				 * @private
				 */
				stretch: function() {
					var schema = this.get("schema");
					var newSchema = Terrasoft.deepClone(schema);
					var schemaItem = this.getEditedItem(newSchema);
					var matrix = pageDesignerUtilities.getFillingGridMatrix(schemaItem.parent);
					var item = schemaItem.item;
					var row = item.layout.row;
					var column = item.layout.column;
					var colSpan = item.layout.colSpan;
					var calculatedColumn = column;
					for (var i = column; i > 0; i--) {
						if (matrix[row][i - 1] === true) {
							break;
						}
						calculatedColumn--;
						colSpan++;
					}
					for (var k = calculatedColumn + colSpan; k < matrix[row].length; k++) {
						if (matrix[row][k] === true) {
							break;
						}
						colSpan++;
					}
					item.layout.colSpan = colSpan;
					item.layout.column = calculatedColumn;
					this.set("schema", newSchema);
				},

				/**
				 * Увеличивает высоту колонки на единицу. Изменяет схему дизайнера.
				 * @private
				 */
				incrementHeight: function() {
					var schema = this.get("schema");
					var newSchema = Terrasoft.deepClone(schema);
					var schemaItem = this.getEditedItem(newSchema);
					var matrix = pageDesignerUtilities.getFillingGridMatrix(schemaItem.parent);
					var item = schemaItem.item;
					var row = item.layout.row;
					var bottomDivision = row + item.layout.rowSpan;
					if (matrix[bottomDivision]) {
						var divisionFilling = matrix[bottomDivision].splice(item.layout.column, item.layout.colSpan);
						if (divisionFilling.some(function(element) { return element; })) {
							return;
						}
					}
					item.layout.rowSpan++;
					this.set("schema", newSchema);
				},

				/**
				 * Уменьшает высоту колонки на единицу. Изменяет схему дизайнера.
				 * @private
				 */
				decrementHeight: function() {
					var schema = this.get("schema");
					var newSchema = Terrasoft.deepClone(schema);
					var schemaItem = this.getEditedItem(newSchema);
					var item = schemaItem.item;
					if (item.layout.rowSpan > 1) {
						item.layout.rowSpan--;
						this.set("schema", newSchema);
					}
				},

				/**
				 * Изменяет позицию элемента. Изменяет схему дизайнера.
				 * @private
				 * @params {String} parentName Схема дизайнера.
				 * @params {String} itemName Схема дизайнера.
				 * @params {Number} row Номер ряда.
				 * @params {Number} column номер колонки.
				 */
				changeItemPosition: function(parentName, itemName, row, column) {
					var schema = this.get("schema");
					var newSchema = Terrasoft.deepClone(schema);
					var editedItemInfo = this.getSchemaItemInfoByName(itemName, newSchema.viewConfig);
					var item = editedItemInfo.item;
					var items = editedItemInfo.parent.items || editedItemInfo.parent;
					var itemIndex = items.indexOf(item);
					items.splice(itemIndex, 1);
					var parentItemInfo = this.getSchemaItemInfoByName(parentName, newSchema.viewConfig);
					var parentItem = parentItemInfo ? parentItemInfo.item : newSchema.viewConfig;
					var matrix = pageDesignerUtilities.getFillingGridMatrix(parentItem);
					var colSpan = item.layout.colSpan || 12;
					var rowSpan = item.layout.rowSpan || 1;
					var maxColumn = column + colSpan;
					var maxRow = row + rowSpan;
					if (maxColumn > 24) {
						maxColumn = 24;
					}
					var abort = false;
					for (var i = row; i < maxRow; i++) {
						var matrixRow = matrix[i];
						if (!matrixRow) {
							continue;
						}
						for (var j = column; j < maxColumn; j++) {
							if (matrixRow[j] === true) {
								if (j === column) {
									maxRow = i;
									abort = true;
								} else {
									maxColumn = j;
								}
								break;
							}
						}
						if (abort) {
							break;
						}
					}
					item.layout.colSpan = maxColumn - column;
					item.layout.rowSpan = maxRow - row;
					item.layout.row = row;
					item.layout.column = column;
					items.push(item);
					this.set("schema", newSchema);
				},

				/**
				 * Создает колонки с заголовками модулей.
				 * @private
				 */
				createModuleCaptionColumns: function() {
					var schema = this.get("schema");
					var viewConfig = schema.viewConfig;
					Terrasoft.iterateChildItems(viewConfig, function(iterationConfig) {
						var item = iterationConfig.item;
						if (item.itemType === Terrasoft.ViewItemType.MODULE) {
							this.getModuleCaption(item, function(caption) {
								this.createModuleCaptionColumn(item.name, caption);
							}, this);
						}
					}, this);
				},

				/**
				 * Создает колонку с заголовком модуля.
				 * @private
				 * @params {String} itemName Имя элемента.
				 * @params {String} moduleCaption Заголовок модуля.
				 */
				createModuleCaptionColumn: function(itemName, moduleCaption) {
					var columnName = itemName + "_page_designer_module_caption";
					this.columns[columnName] = {
						type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
						name: columnName
					};
					var caption = localizableStrings.Module + " " + moduleCaption;
					this.set(columnName, caption);
				},

				/**
				 * Получает заголовок модуля.
				 * @private
				 * @params {Object} item Элемент.
				 * @params {Function} callback Функция обратного вызова.
				 */
				getModuleCaption: function(item, callback, scope) {
					sectionDesignerUtils.postServiceRequest({
						methodName: "GetModuleInfoByModuleName",
						parameters: {
							moduleName: item.moduleName
						},
						scope: scope || this,
						callback: function(request, success, response) {
							if (success) {
								var responseObject = Terrasoft.decode(response.responseText);
								var result = responseObject.GetModuleInfoByModuleNameResult;
								var caption = result.ModuleCaption;
								callback.call(this, caption);
							}
						}
					});
				},

				/**
				 * Создает колонки с заголовками деталей.
				 * @private
				 */
				createDetailsCaptionColumns: function() {
					var schema = this.get("schema");
					var viewConfig = schema.viewConfig;
					pageDesignerUtilities.getDetailsInfo(function(detailsInfo) {
						Terrasoft.iterateChildItems(viewConfig, function(iterationConfig) {
							var item = iterationConfig.item;
							var itemName = item.name;
							if (item.itemType === Terrasoft.ViewItemType.DETAIL) {
								var registeredDetailName = item.bindTo || itemName;
								var registeredDetailInfo = this.details[registeredDetailName];
								var registeredDetailSchemaName = registeredDetailInfo.schemaName;
								var registeredDetailEntitySchemaName = registeredDetailInfo.entitySchemaName;
								var detailItem = Ext.Array.findBy(detailsInfo, function(arrayItem) {
									var result = arrayItem.schemaName === registeredDetailSchemaName;
									if (result && registeredDetailEntitySchemaName) {
										result = result && arrayItem.entitySchemaName === registeredDetailEntitySchemaName;
									}
									return result;
								}, this);
								var detailCaption = (detailItem && detailItem.Caption);
								var caption = detailCaption
									? localizableStrings.Detail + detailCaption
									: localizableStrings.UnregisteredDetail + itemName;
								this.createDetailCaptionColumn(itemName, caption);
							}
						}, this);
					}, this);
				},

				/**
				 * Создает колонку с заголовком детали.
				 * @private
				 * @params {String} itemName Имя элемента.
				 * @params {String} caption Заголовок детали.
				 */
				createDetailCaptionColumn: function(itemName, caption) {
					var columnName = itemName + "_page_designer_detail_caption";
					if (!this.columns[columnName]) {
						this.columns[columnName] = {
							type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
							name: columnName
						};
					}
					this.set(columnName, caption);
				},

				/**
				 * Создает колонки свернутой контрольной группы.
				 * @private
				 */
				createControlGroupCollapsedColumns: function() {
					var schema = this.get("schema");
					var viewConfig = schema.viewConfig;
					Terrasoft.iterateChildItems(viewConfig, function(iterationConfig) {
						var item = iterationConfig.item;
						if (item.itemType === Terrasoft.ViewItemType.CONTROL_GROUP) {
							this.createCollapsedColumn(item.name);
						}
					}, this);
				},

				/**
				 * Создает колонку свернутой группы элементов.
				 * @params {String} itemName Имя элемента.
				 * @private
				 */
				createCollapsedColumn: function(itemName) {
					var columnName = itemName + "_page_designer_collapsed";
					this.columns[columnName] = {
						type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
						name: columnName
					};
					this.set(columnName, false);
				},

				/**
				 * Обработчик события нажатия на кнопку настройки детали. Вызывает сервисное окно детали.
				 * @private
				 */
				configureDetail: function() {
					var tag = arguments[3];
					var schema = this.get("schema");
					var details = schema.details;
					var detail = details[tag];
					if (!detail) {
						Terrasoft.showInformation(localizableStrings.CanNotEditParentSchemaDetails, null, null,
							{ buttons: ["ok"] });
						return;
					}
					if (!detail.filter) {
						detail.filter = {
							detailColumn: null,
							masterColumn: null
						};
					}
					var detailConfig = {
						detailSchemaName: detail.schemaName,
						entitySchemaName: detail.entitySchemaName,
						detailKey: tag,
						detailColumn: detail.filter.detailColumn,
						masterColumn: detail.filter.masterColumn
					};
					pageDesignerUtilities.showEditDetailWindow(this, this.showDetailWindowCallback, detailConfig);
				},

				/**
				 * Обработчик события нажатия на кнопку удаления детали. Изменяет схему дизайнера.
				 * @private
				 */
				removeDetail: function() {
					var tag = arguments[3];
					var schemaClone = Terrasoft.deepClone(this.get("schema"));
					var viewConfig = schemaClone.viewConfig[0];
					var item = this.getSchemaItemInfoByName(tag, viewConfig);
					if (item && item.item && (item.item.itemType === Terrasoft.ViewItemType.DETAIL)) {
						var parent = item.parent;
						delete schemaClone.details[tag];
						Terrasoft.each(parent.items, function(it, key) {
							if (it.name === tag) {
								parent.items.splice(key, 1);
								return false;
							}
						});
						this.set("schema", schemaClone);
						designData.deleteDetailGridSettings(tag);
					}
				},

				/**
				 * Обработчик события нажатия на кнопку настройки группы. Вызывает сервисное окно группы.
				 * @private
				 */
				configureGroup: function() {
					var tag = arguments[3];
					if (!tag) {
						return;
					}
					var caption = null;
					if (this.getSchemaItemInfoByName(tag)) {
						var schemaItem = this.getSchemaItemInfoByName(tag);
						caption = schemaItem.item.caption;
						if (caption && caption.bindTo) {
							caption = this.get(caption.bindTo);
						}
					}
					var groupConfig = {
						name: tag,
						caption: caption
					};
					pageDesignerUtilities.showEditGroupWindow(this, this.showGroupWindowCallback, groupConfig);
				},

				/**
				 * Обработчик события нажатия на кнопку удаления группы. Изменяет схему дизайнера.
				 * @private
				 */
				removeGroup: function() {
					var tag = arguments[3];
					var schemaClone = Terrasoft.deepClone(this.get("schema"));
					var viewConfig = schemaClone.viewConfig[0];
					var item =  this.getSchemaItemInfoByName(tag, viewConfig);
					if (item && item.item && item.item.itemType === 15) {
						var parent = item.parent;
						Terrasoft.each(parent.items, function(it, key) {
							if (it.name === tag) {
								parent.items.splice(key, 1);
								return false;
							}
						});
						this.set("schema", schemaClone);
					}
				},

				/**
				 * Обработчик события нажатия на кнопку изменения порядка элементов на закладке. Вызывает сервисное
				 * окно закладки.
				 * @private
				 */
				sortCurrentTab: function() {
					var activeTabName = this.get("ActiveTabName");
					var schemaItem = this.getSchemaItemInfoByName(activeTabName);
					var items = schemaItem.item.items;
					var tabCaptionResource = schemaItem.item.caption.bindTo;
					var tabCaption = this.get(tabCaptionResource);
					var itemsConfig = [];
					Terrasoft.each(items, function(item, key) {
						var index = parseInt(key, 10);
						var itemName = item.name;
						var caption;
						if (item.itemType === Terrasoft.ViewItemType.DETAIL) {
							var detailSchemaName = this.details[itemName].schemaName;
							var cachedDetails = Terrasoft.DomainCache.getItem("SectionDesigner_DetailsInfo");
							Terrasoft.each(cachedDetails, function(detail) {
								if (detail.schemaName === detailSchemaName) {
									caption = detail.Caption;
								}
							});
						} else {
							caption = item.caption;
						}
						if (caption && caption.bindTo) {
							var resource = caption.bindTo;
							caption = this.get(resource);
						}
						var it = {
							name: itemName,
							caption: caption,
							position: index
						};
						itemsConfig.push(it);
					}, this);
					var addConfig = {
						tabCaption: tabCaption
					};
					pageDesignerUtilities.showEditTabItemsWindow(this, itemsConfig, addConfig,
						this.showTabItemsWindowCallback);
				},

				/**
				 * Функция обратного вызова сервисного окна закладки. Изменяет схему дизайнера.
				 * @private
				 * @params {Array} tabItems Массив элементов текущей вкладки.
				 */
				showTabItemsWindowCallback: function(tabItems) {
					var schemaClone = Terrasoft.deepClone(this.get("schema"));
					var viewConfig = schemaClone.viewConfig[0];
					var newItems = [];
					Terrasoft.each(tabItems, function(tab, key) {
						var pos = parseInt(key, 10);
						var itemInSchema = this.getSchemaItemInfoByName(tab.name, viewConfig);
						newItems[pos] = itemInSchema.item;
					}, this);
					var activeTabName = this.get("ActiveTabName");
					var schemaItem = this.getSchemaItemInfoByName(activeTabName, viewConfig);
					schemaItem.item.items = newItems;
					this.cleanRegisteredDetails(schemaClone);
					this.set("schema", schemaClone);
				},

				/**
				 * Обработчик события нажатия на кнопку настройки закладок. Вызывает сервисное
				 * окно закладок.
				 * @private
				 */
				customizeTabs: function() {
					var tabItems = this.get("TabsCollection").getItems();
					var currentObjectName = this.get("schema").schemaName;
					var tabsConf = [];
					Terrasoft.each(tabItems, function(item, key) {
						var index = parseInt(key, 10);
						var tab = {
							name: item.values.Name,
							caption: item.values.Caption,
							position: index
						};
						tabsConf.push(tab);
					}, this);
					var addConfig = {
						currentObjectName: currentObjectName
					};
					pageDesignerUtilities.showEditTabsWindow(this, tabsConf, addConfig,
						this.showTabsWindowCallback);
				},

				/**
				 * Функция обратного вызова сервисного окна закладок. Изменяет схему дизайнера.
				 * @private
				 * @params {Array} tabs Массив закладок.
				 */
				showTabsWindowCallback: function(tabs) {
					var schemaClone = Terrasoft.deepClone(this.get("schema"));
					var viewConfig = schemaClone.viewConfig[0];
					var newTabs = [];
					Terrasoft.each(tabs, function(tab, key) {
						var pos = parseInt(key, 10);
						var tabInSchema = this.getSchemaItemInfoByName(tab.name, viewConfig);
						if (!tabInSchema) {
							tabInSchema = {};
							tabInSchema.item = {
								items: [],
								name: tab.name
							};
						}
						var captionResourceName = "Resources.Strings." + tab.name + "Caption";
						this.set(captionResourceName, tab.caption, { "columnName": captionResourceName });
						tabInSchema.item.caption = {
							bindTo: captionResourceName
						};
						newTabs[pos] = tabInSchema.item;
					}, this);
					this.getSchemaItemInfoByName("Tabs", viewConfig).item.tabs = newTabs;
					this.cleanRegisteredDetails(schemaClone);
					this.set("schema", schemaClone);
					this.initTabs();
				},

				/**
				 * Функция актуализации массива деталей. Изменяет копию схемы.
				 * @private
				 * @params {Object} schemaClone Копия схемы.
				 */
				cleanRegisteredDetails: function(schemaClone) {
					var viewConfig = schemaClone.viewConfig[0];
					var details = schemaClone.details;
					Terrasoft.each(details, function(det, key) {
						var schemaItem = this.getSchemaItemInfoByName(key, viewConfig);
						if (!schemaItem) {
							delete details[key];
						}
					}, this);
				},

				/**
				 * Обработчик события нажатия на элемент.
				 * @params {String} tag тип элемента на котором кликнули.
				 * @private
				 */
				selectItem: function(tag) {
					this.set("selectedItem", tag);
				},

				/**
				 * Обработчик события двойного нажатия на элемент.
				 * @private
				 */
				editItem: function() {
					this.editItem();
				},

				/**
				 * Функция инициализации модуля.
				 * @private
				 */
				init: function(initValues) {
					Terrasoft.each(initValues, function(value, itemName) {
						this.set(itemName, value);
					}, this);
					var sandbox = this.get("sandbox");
					sandbox.subscribe("IsStepReady", this.onGoToStep, this);
					this.createModuleCaptionColumns();
					this.createControlGroupCollapsedColumns();
					this.createDetailsCaptionColumns();
					this.initTabs();
				},

				/**
				 * Обработчик события смены шага.
				 * @params {Function} Функция обратного вызова.
				 * @private
				 */
				onGoToStep: function(callback) {
					var mainModuleName = designData.getMainModuleName();
					var moduleStructure = designData.getModuleStructure(mainModuleName);
					var schema = this.get("schema");
					var collection = pageDesignerUtilities.getRequireFieldNotInSchema(schema,
						moduleStructure.typeColumnId);
					var items = collection.collection.items;
					if (items.length > 0) {
						var message = localizableStrings.RequireFieldsIsNotAdd;
						Terrasoft.each(items, function(item) {
							message += "\r\n" + item;
						});
						this.showInformationDialog(message, function() {
							callback(true);
						});
						return false;
					}
				},

				/**
				 * Функция инициализации закладок.
				 * @private
				 */
				initTabs: function() {
					var schema = this.get("schema");
					var tabs = this.getSchemaItemInfoByName("Tabs", schema);
					var tabsValues = [];
					var tabsConfig = {};
					var viewModelColumns = this.columns;
					Terrasoft.each(tabs.item.tabs, function(item) {
						var itemName = item.name;
						viewModelColumns[itemName] = {
							dataValueType: Terrasoft.DataValueType.BOOLEAN,
							type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
							value: false
						};
						var caption = this.getTabCaption(item);
						tabsValues.push({
							Caption: caption,
							Name: itemName
						});
						var itemCaption = item.caption;
						if (itemCaption && itemCaption.bindTo) {
							tabsConfig[itemCaption.bindTo] = itemName;
						}
					}, this);
					viewModelColumns.TabsConfig = {
						dataValueType: Terrasoft.DataValueType.CUSTOM_OBJECT,
						type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
						value: tabsConfig
					};
					this.set("TabsConfig", tabsConfig);
					var tabsCollection = new Terrasoft.BaseViewModelCollection({
						entitySchema: new Terrasoft.BaseEntitySchema({
							columns: {},
							primaryColumnName: "Name"
						})
					});
					tabsCollection.loadFromColumnValues(tabsValues);
					viewModelColumns.TabsCollection = {
						dataValueType: Terrasoft.DataValueType.COLLECTION,
						type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
						value: tabsCollection
					};
					var prevTabsCollection = this.get("TabsCollection");
					if (prevTabsCollection) {
						prevTabsCollection.clear();
						prevTabsCollection.loadAll(tabsCollection);
					} else {
						this.set("TabsCollection", tabsCollection);
					}
					if (tabsValues.length > 0) {
						var activeTabName = tabsValues[0].Name;
						this.set("ActiveTabName", activeTabName);
						var activeTab = tabsCollection.getByIndex(0);
						this.activeTabChange(activeTab);
					}
				},

				/**
				 * Получает заголовок закладки.
				 * @private
				 * @params {Object} config Конфигурационный объект элемента.
				 * @returns {String} caption Заголовок закладки.
				 */
				getTabCaption: function(config) {
					var caption = config.caption;
					if (caption) {
						var resourceColumnValue = this.get(caption.bindTo);
						if (resourceColumnValue) {
							caption = resourceColumnValue;
						}
					}
					return caption;
				},

				getTabsContainerVisible: function() {
					return true;
				},

				/**
				 * Ищет элемент по имени в структуре переданного оъбекта.
				 * @private
				 * @param {String} name Имя элемента.
				 * @param {Object} parent Объект по которому идет поиск.
				 * @return {Object} Объект, содержащий информацию о найденном элементе.
				 */
				getSchemaItemInfoByName: function(name, parent) {
					var result = null;
					if (!parent) {
						var schema = this.get("schema");
						parent = { items: schema.viewConfig};
					}
					Terrasoft.iterateChildItems(parent, function(iterationConfig) {
						var item = iterationConfig.item;
						if (item.name === name) {
							result = {
								item: item,
								parent: iterationConfig.parent,
								propertyName: iterationConfig.propertyName
							};
						}
						return Ext.isEmpty(result);
					}, this);
					return result;
				},

				/**
				 * Обработчик события отрисовки представления.
				 * @private
				 */
				onViewRendered: function() {
					pageDesignerUtilities.initializeGridLayoutDragAndDrop(Ext.bind(this.changeItemPosition, this));
					var sandbox = this.get("sandbox");
					sandbox.publish("ModuleLoaded");
				}

			};
			return Ext.define(fullClassName, config);
		}

		return {
			create: function(name, viewModelClass) {
				var defineDesignViewClass = defineDesignViewModel(name, viewModelClass);
				return Ext.create(defineDesignViewClass);
			},
			define: function(name, viewModelClass) {
				return defineDesignViewModel(name, viewModelClass);
			}
		};
	});