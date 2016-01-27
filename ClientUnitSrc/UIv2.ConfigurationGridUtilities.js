define("ConfigurationGridUtilities", ["terrasoft", "BusinessRulesApplierV2", "ConfigurationEnums", "BusinessRuleModule",
	"GridUtilitiesV2"], function(Terrasoft, BusinessRulesApplier, ConfigurationEnums, BusinessRuleModule) {
	Ext.define("Terrasoft.configuration.mixins.ConfigurationGridUtilities", {

		alternateClassName: "Terrasoft.ConfigurationGridUtilities",

		/**
		 * Текущая активная колонка
		 * @protected
		 * @type {String}
		 */
		currentActiveColumnName: this.Terrasoft.emptyString,

		/**
		 * Конфигурация колонок
		 * @protected
		 * @type {String}
		 */
		columnsConfig: null,

		/**
		 * Коллекция названий системных колонок
		 * @protected
		 * @type {Array}
		 */
		systemColumns: ["Id", "CreatedOn", "CreatedBy", "ModifiedOn", "ModifiedBy", "ProcessListeners"],

		/**
		 * Обрабатывает снятие выбора со строки. Если есть измененные колонки, то сохраняет запись.
		 * @private
		 * @param {String} id Идентификатор записи.
		 */
		unSelectRow: function(id) {
			if (!id) {
				return;
			}
			var gridData = this.getGridData();
			if (!gridData.contains(id)) {
				return;
			}
			this.saveRowChanges(id);
		},

		/**
		 * Проверяет, изменились ли значения колонок строки.
		 * @private
		 * @param {Terrasoft.BaseViewModel} activeRow Строка реестра.
		 * @return {Boolean} Результат проверки.
		 */
		getIsRowChanged: function(activeRow) {
			var changed = activeRow.isNew;
			this.Terrasoft.each(activeRow.changedValues, function(changedValue, columnName) {
				var column = this.columns[columnName];
				changed = changed || (column && column.type === Terrasoft.ViewModelColumnType.ENTITY_COLUMN);
				return !changed;
			}, activeRow);
			return changed;
		},

		/**
		 * Обрабатывает нажатие "действия" активной записи.
		 * @param {String} buttonTag тэг "действия".
		 * @param {String} primaryColumnValue id активной записи.
		 */
		onActiveRowAction: function(buttonTag, primaryColumnValue) {
			switch (buttonTag) {
				case "card":
					this.editRecord(primaryColumnValue);
					break;
				case "remove":
					this.deleteRecords();
					break;
				case "cancel":
					this.discardChanges(primaryColumnValue);
					break;
				case "save":
					this.onActiveRowSave(primaryColumnValue);
					break;
			}
		},

		/**
		 * @obsolete
		 */
		onActivRowSave: function() {
			this.log(this.Ext.String.format(this.Terrasoft.Resources.ObsoleteMessages.ObsoleteMethodMessage,
				"onActivRowSave", "onActiveRowSave"));
			this.onActiveRowSave();
		},

		/**
		 * Обрабатывает нажатие "действия" активной записи.
		 * @private
		 */
		onActiveRowSave: function() {
			var activeRow = this.getActiveRow();
			this.Terrasoft.chain(
				function(next) {
					this.saveRowChanges(activeRow, next);
				},
				function(next) {
					this.activeRowSaved(activeRow, next);
				},
				function() {
					this.cachedActiveRow = null;
					this.setActiveRow(null);
				},
				this
			);
		},

		/**
		 * Проверяет значения активной строки.
		 * @private
		 * @param {Boolean} config.success True, если значения элементов управления корректны.
		 * @param {Object} config
		 */
		changeRow: function(config) {
			var oldId = config.oldId;
			if (!oldId) {
				return;
			}
			var gridData = this.getGridData();
			if (!gridData.contains(oldId)) {
				return;
			}
			var activeRow = gridData.get(oldId);
			var activeRowChanged = this.getIsRowChanged(activeRow);
			if (activeRowChanged) {
				this.Terrasoft.chain(
					function(next) {
						this.saveRowChanges(activeRow, next);
					},
					function() {
						this.set("ActiveRow", config.newId || null);
					},
					this
				);
				config.success = false;
			}
		},

		/**
		 * Отменяет изменения активной строки.
		 * @private
		 * @param {String} id Идентификатор записи.
		 */
		discardChanges: function(id) {
			if (!id) {
				return;
			}
			var activeRow = this.getActiveRow();
			if (activeRow.isNew) {
				this.removeGridRecords([activeRow.get("Id")]);
			} else {
				activeRow.onDiscardChangesClick();
			}
		},

		/**
		 * Сохраняет изменения строки.
		 * @private
		 * @param {Object} row Строка реестра.
		 * @param {Function} callback Функция обратного вызова.
		 * @param {Object} scope Контекст вызова функции обратного вызова.
		 */
		saveRowChanges: function(row, callback, scope) {
			scope = scope || this;
			callback = callback || this.Terrasoft.emptyFn;
			if (row && this.getIsRowChanged(row)) {
				row.save({
					callback: callback,
					isSilent: true,
					scope: scope
				});
			} else {
				callback.call(scope);
			}
		},

		/**
		 * Метод вызывается после сохранения строки.
		 * @protected
		 * @param {Object} row Строка реестра.
		 * @param {Function} callback Функция обратного вызова.
		 * @param {Object} scope Контекст вызова функции обратного вызова.
		 */
		activeRowSaved: function(row, callback, scope) {
			scope = scope || this;
			callback = callback || this.Terrasoft.emptyFn;
			callback.call(scope);
		},

		/**
		 * Инициализирует подписку на события нажатия кнопок в активной строке.
		 * @private
		 * @param {Array} keyMap Описание событий.
		 */
		initActiveRowKeyMap: function(keyMap) {
			keyMap.push({
				key: Ext.EventObject.ESC,
				defaultEventAction: "preventDefault",
				fn: this.onEscKeyPressed,
				scope: this
			});
			keyMap.push({
				key: Ext.EventObject.ENTER,
				ctrl: true,
				defaultEventAction: "preventDefault",
				fn: this.onCtrlEnterKeyPressed,
				scope: this
			});
			keyMap.push({
				key: Ext.EventObject.TAB,
				defaultEventAction: "preventDefault",
				fn: this.onTabKeyPressed,
				scope: this
			});
		},

		/**
		 * Обработчик события нажатия кнопки Esc в активной строке.
		 * Отменяет изменения.
		 * @private
		 */
		onEscKeyPressed: function() {
			var activeRow = this.getActiveRow();
			this.unfocusRowControls(activeRow);
			this.discardChanges(activeRow.get("Id"));
		},

		/**
		 * Обработчик события нажатия кнопкок Ctrl + Enter.
		 * Сохраняет изменения.
		 * @protected
		 */
		onCtrlEnterKeyPressed: function() {
			var activeRow = this.getActiveRow();
			this.unfocusRowControls(activeRow);
			this.Terrasoft.chain(
				function(next) {
					this.saveRowChanges(activeRow, next);
				},
				function(next) {
					this.activeRowSaved(activeRow, next);
				},
				function() {
					this.cachedActiveRow = null;
					this.setActiveRow(null);
				},
				this
			);
		},

		/**
		 * Обработчик события нажатия кнопки Tab.
		 * Переход по ячейкам
		 * @private
		 */
		onTabKeyPressed: function() {
			var activeRow = this.getActiveRow();
			if (this.currentActiveColumnName === this.getLastEnabledColumn(activeRow)) {
				this.unfocusRowControls(activeRow);
				var gridData = this.getGridData();
				var gridDataCount = gridData.getCount();
				var activeRowIndex = gridData.indexOf(activeRow);
				if (activeRowIndex === gridDataCount - 1) {
					this.addRow();
				} else {
					this.selectNextRow(activeRow, gridData, activeRowIndex);
				}
				return false;
			}
			this.currentActiveColumnName = this.getCurrentActiveColumnName(activeRow, this.columnsConfig);
			return true;
		},

		/**
		 * Осуществляет переход на следующую строку в реестре, сохраняя текущую.
		 * @private
		 * @param {Object} activeRow Текущая активная запись
		 * @param {Terrasoft.Collection} gridData Коллекция данных реестра.
		 * @param {Number} activeRowIndex Индекс текущей активной записи реестра.
		 */
		selectNextRow: function(activeRow, gridData, activeRowIndex) {
			this.Terrasoft.chain(
				function(next) {
					this.saveRowChanges(activeRow, next);
				},
				function(next) {
					this.activeRowSaved(activeRow, next);
				},
				function(next) {
					var newActiveRow = gridData.getByIndex(activeRowIndex + 1);
					this.setActiveRow(newActiveRow.get("Id"));
					this.setDefaultFocus(newActiveRow);
				},
				this
			);
		},

		getCurrentActiveColumnName: function(activeRow, columnsConfig) {
			var columnConfigCount = columnsConfig.length;
			var currentIndex = 0;
			for (var i = 0; i < columnConfigCount; i++) {
				if (this.currentActiveColumnName === columnsConfig[i].key[0].name.bindTo) {
					currentIndex = i;
				}
			}
			for (var index = currentIndex + 1; index < columnConfigCount; index++) {
				var nextColumnName = this.columnsConfig[index].key[0].name.bindTo;
				var methodName = BusinessRulesApplier.getMethodName(BusinessRuleModule.enums.Property.ENABLED,
					nextColumnName);
				var enabledMethod = activeRow[methodName];
				if (!enabledMethod || enabledMethod.call(activeRow)) {
					return nextColumnName;
				}
			}
		},

		getLastEnabledColumn: function(activeRow) {
			var index = this.columnsConfig.length - 1;
			var lastEnabledColumnName = this.Terrasoft.emptyString;
			while (index !== 0) {
				var column = this.columnsConfig[index];
				var methodName = BusinessRulesApplier.getMethodName(BusinessRuleModule.enums.Property.ENABLED,
					column.key[0].name.bindTo);
				var enabledMethod = activeRow[methodName];
				if (!enabledMethod || enabledMethod.call(activeRow)) {
					lastEnabledColumnName = column.key[0].name.bindTo;
					break;
				}
				index--;
			}
			return lastEnabledColumnName;
		},

		/**
		 * Обработчик события клика по реестру.
		 * @private
		 * @param {Object} config Конфигурация события клика по реестру.
		 * @param {String} config.columnName Название колонки, по которой был произведен клик.
		 */
		onGridClick: function(config) {
			this.focusActiveRowControl(config.columnName);
		},

		/**
		 * Устанавливает фокус в элементе редактирования.
		 * @private
		 * @param {String} columnName Название колонки.
		 */
		focusActiveRowControl: function(columnName) {
			if (!columnName) {
				return;
			}
			var activeRow = this.getActiveRow();
			activeRow.set("Is" + columnName + "Focused", true);
			this.currentActiveColumnName = columnName;
		},

		/**
		 * Устанавливает фокус в элементе редактирования первично для отображения колонки.
		 * @private
		 * @param {Object} row Строка реестра.
		 */
		setDefaultFocus: function(row) {
			var profileColumns = this.getProfileColumns();
			this.Terrasoft.each(profileColumns, function(column, name) {
				var methodName = BusinessRulesApplier.getMethodName(BusinessRuleModule.enums.Property.ENABLED, name);
				var enabledMethod = row[methodName];
				if (!enabledMethod || enabledMethod.call(row)) {
					this.focusActiveRowControl(name);
					return false;
				}
			}, this);
		},

		/**
		 * Снимает фокус с элементов редактирования активной строки.
		 * @private
		 * @param {Terrasoft.BaseViewModel} activeRow Строка реестра.
		 */
		unfocusRowControls: function(activeRow) {
			this.Terrasoft.each(activeRow.columns, function(changedValue, columnName) {
				var column = this.columns[columnName];
				if (column.type === Terrasoft.ViewModelColumnType.ENTITY_COLUMN) {
					this.set("Is" + columnName + "Focused", false);
				}
			}, activeRow);
		},

		/**
		 * @obsolete
		 */
		generatActiveRowControlsConfig: function(id, columnsConfig, rowConfig) {
			this.log(this.Ext.String.format(this.Terrasoft.Resources.ObsoleteMessages.ObsoleteMethodMessage,
				"generatActiveRowControlsConfig", "generateActiveRowControlsConfig"));
			this.generateActiveRowControlsConfig(id, columnsConfig, rowConfig);
		},

		/**
		 * Генерирует конфигурацию элементов редактирования активной строки реестра.
		 * @private
		 * @param {String} id Идентификатор строки.
		 * @param {Object} columnsConfig Конфигурация колонок реестра.
		 * @param {Array} rowConfig Конфигурация элементов редактирования.
		 */
		generateActiveRowControlsConfig: function(id, columnsConfig, rowConfig) {
			this.columnsConfig = columnsConfig;
			var gridLayoutItems = [];
			var currentColumnIndex = 0;
			this.Terrasoft.each(columnsConfig, function(columnConfig) {
				var columnName = columnConfig.key[0].name.bindTo;
				var column = this.entitySchema.getColumnByName(columnName);
				var cellConfig = this.getCellControlsConfig(column);
				cellConfig = this.Ext.apply({
					layout: {
						colSpan: columnConfig.cols,
						column: currentColumnIndex,
						row: 0,
						rowSpan: 1
					}
				}, cellConfig);
				gridLayoutItems.push(cellConfig);
				currentColumnIndex += columnConfig.cols;
			}, this);
			var gridData = this.getGridData();
			var activeRow = gridData.get(id);
			var rowClass = {prototype: activeRow};
			BusinessRulesApplier.applyRules(rowClass, gridLayoutItems);
			var viewGenerator = this.Ext.create("Terrasoft.ViewGenerator");
			viewGenerator.viewModelClass = {prototype: this};
			var gridLayoutConfig = viewGenerator.generateGridLayout({
				name: this.name,
				items: gridLayoutItems
			});
			rowConfig.push(gridLayoutConfig);
		},

		/**
		 * Возвращает конфигурацию элементов редактирования ячейки реестра.
		 * @protected
		 * @param {Terrasoft.EntitySchemaColumn} entitySchemaColumn Колонка ячейки реестра.
		 * @return {Object} конфигурация элементов редактирования ячейки реестра.
		 */
		getCellControlsConfig: function(entitySchemaColumn) {
			var columnName = entitySchemaColumn.name;
			var enabled = (entitySchemaColumn.usageType !== Terrasoft.EntitySchemaColumnUsageType.None) && !this.Ext.Array.contains(this.systemColumns, columnName);
			var config = {
				itemType: Terrasoft.ViewItemType.MODEL_ITEM,
				name: columnName,
				labelConfig: {visible: false},
				caption: entitySchemaColumn.caption,
				enabled: enabled
			};
			if (entitySchemaColumn.dataValueType === Terrasoft.DataValueType.LOOKUP) {
				config.showValueAsLink = false;
			}
			if (entitySchemaColumn.dataValueType !== Terrasoft.DataValueType.DATE_TIME &&
				entitySchemaColumn.dataValueType !== Terrasoft.DataValueType.BOOLEAN) {
				config.focused = {"bindTo": "Is" + columnName + "Focused"};
			}
			return config;
		},

		/**
		 * Создает и инициализирует новую строку.
		 * @private
		 * @param {String} rowId Идентификатор записи.
		 * @param {Function} callback Функция обратного вызова.
		 * @param {Object} scope Контекст вызова функции обратного вызова.
		 */
		createRowCopy: function(rowId, callback, scope) {
			var gridData = this.getGridData();
			var sourceRow = gridData.get(rowId);
			var rawData = {};
			var typeColumn = this.getTypeColumn(this.entitySchemaName);
			var typeColumnValue = sourceRow.get(typeColumn);
			if (typeColumn && typeColumnValue) {
				rawData[typeColumn.path] = {value: typeColumnValue};
			}
			var config = {rawData: rawData};
			var className = this.getGridRowViewModelClassName(config);
			var gridRowViewModelConfig = this.getGridRowViewModelConfig(config);
			Ext.apply(gridRowViewModelConfig, {isNew: true});
			var row = this.Ext.create(className, gridRowViewModelConfig);
			BusinessRulesApplier.applyDependencies(row);
			row.set("Operation", ConfigurationEnums.CardStateV2.COPY);
			row.set("PrimaryColumnValue", rowId);
			row.set("DefaultValues", this.getRowDefaultValues(typeColumnValue));
			row.initEntity(function() {
				row.hideBodyMask();
				callback.call(scope, row);
			}, this);
		},

		/**
		 * Создает и инициализирует новую строку.
		 * @private
		 * @param {String} id Идентификатор записи.
		 * @param {String} typeColumnValue Значение колонки типа.
		 * @param {Function} callback Функция обратного вызова.
		 */
		createNewRow: function(id, typeColumnValue, callback) {
			var typeColumn = this.getTypeColumn(this.entitySchemaName);
			var rawData = {};
			if (typeColumn && typeColumnValue) {
				rawData[typeColumn.path] = {
					value: typeColumnValue
				};
			}
			var config = {rawData: rawData};
			var className = this.getGridRowViewModelClassName(config);
			var gridRowViewModelConfig = this.getGridRowViewModelConfig(config);
			Ext.apply(gridRowViewModelConfig, {isNew: true});
			var row = this.Ext.create(className, gridRowViewModelConfig);
			BusinessRulesApplier.applyDependencies(row);
			row.set("Operation", ConfigurationEnums.CardStateV2.ADD);
			row.set("PrimaryColumnValue", id);
			row.set("DefaultValues", this.getRowDefaultValues(typeColumnValue));
			row.initEntity(function() {
				row.set("Id", id);
				row.set("IsEntityInitialized", true);
				row.hideBodyMask();
				callback.call(this, row);
			}, this);
		},

		/**
		 * Возвращает значения по умолчанию для строки.
		 * @private
		 * @param {String} typeColumnValue Значение колонки типа.
		 * @return {Array} Значения по умолчанию для строки.
		 */
		getRowDefaultValues: function(typeColumnValue) {
			var detailInfo = {
				valuePairs: this.get("DefaultValues") || []
			};
			var defaultValues = [];
			var sourceDefaultValues = Terrasoft.deepClone(detailInfo.valuePairs);
			while (!this.Ext.isEmpty(sourceDefaultValues)) {
				var defaultValue = sourceDefaultValues.pop();
				var values = this.Ext.isArray(defaultValue.name)
					? this.Terrasoft.mapObjectToCollection(defaultValue)
					: [defaultValue];
				defaultValues = defaultValues.concat(values);
			}
			var typeColumnName = this.get("TypeColumnName");
			if (typeColumnName && typeColumnValue) {
				defaultValues.push({
					name: typeColumnName,
					value: typeColumnValue
				});
			}
			return this.Terrasoft.deepClone(defaultValues);
		},

		/**
		 * Возвращает параметры вставки новой записи в реестр.
		 * @private
		 * @return {Object} Параметры вставки новой записи в реестр.
		 */
		getAddItemsToGridDataOptions: function() {
			var activeRow = this.findActiveRow();
			var options = null;
			var isEmpty = this.get("IsGridEmpty");
			if (isEmpty) {
				options = {
					mode: "bottom"
				};
			} else if (activeRow) {
				options = {
					mode: "after",
					target: activeRow.get("Id")
				};
			} else {
				options = {
					mode: "top"
				};
			}
			return options;
		},

		/**
		 * Добавляет скопированную строку.
		 * @protected
		 * @virtual
		 * @param {String} recordId Уникальный идентификатор копируемой записи.
		 */
		copyRow: function(recordId) {
			this.Terrasoft.chain(
				function(next) {
					var activeRow = this.findActiveRow();
					this.saveRowChanges(activeRow, next);
				},
				function(next) {
					this.createRowCopy(recordId, next, this);
				},
				function(next, newRow) {
					this.prepareResponseCollectionItem(newRow);
					this.addNewRowToCollection(newRow);
				},
				this
			);
		},

		/**
		 * Добавляет строку создания новой записи.
		 * @private
		 * @param {String} typeColumnValue Значение колонки типа.
		 */
		addRow: function(typeColumnValue) {
			var activeRow = this.findActiveRow();
			this.Terrasoft.chain(
				function(next) {
					this.saveRowChanges(activeRow, next);
				},
				function(next) {
					this.activeRowSaved(activeRow, next);
				},
				function(next) {
					var id = Terrasoft.generateGUID();
					this.createNewRow(id, typeColumnValue, next);
				},
				function(next, newRow) {
					this.prepareResponseCollectionItem(newRow);
					this.addNewRowToCollection(newRow);
				},
				this
			);
		},

		/**
		 * Добавляет новый редактируемый элемент в коллекцию.
		 * @protected
		 * @virtual
		 * @param {Object} newRow Строка реестра.
		 */
		addNewRowToCollection: function(newRow) {
			var id = newRow.get("Id");
			var collection = this.Ext.create("Terrasoft.BaseViewModelCollection");
			collection.add(id, newRow);
			var options = this.getAddItemsToGridDataOptions();
			this.initIsGridEmpty(collection);
			this.addNewRowToGridData(collection, options);
			this.setActiveRow(id);
			this.setDefaultFocus(newRow);
		},

		/**
		 * Добавляет новую строку в реестр.
		 * @protected
		 * @virtual
		 * @param {Terrasoft.BaseViewModelCollection} dataCollection Коллекция новых строк.
		 * @param {Object} options Параметры добавления новых строк.
		 */
		addNewRowToGridData: function(dataCollection, options) {
			//TODO: #CRM-13446
			var gridData = this.getGridData();
			dataCollection = this.clearLoadedRecords(dataCollection);
			if (this.getIsCurrentGridRendered() && (options && options.mode === "after")) {
				this.addItemToGridDataCollection(gridData, dataCollection, this.getGridItemIndex(gridData) + 1);
			} else  if (options && options.mode === "bottom") {
				this.addItemToGridDataCollection(gridData, dataCollection, gridData.getCount());
			} else {
				this.addItemToGridDataCollection(gridData, dataCollection, 0);
			}
		},

		/**
		 * Добавляет новые строки в коллекцию строк, с определенной позицией.
		 * @private
		 * @param {Terrasoft.Collection} gridData Коллекция данных реестра.
		 * @param {Terrasoft.Collection} dataCollection Коллекция новых вставляемых строк.
		 * @param {Number} index Позиция вставляемой строки в коллекции.
		 */
		addItemToGridDataCollection: function(gridData, dataCollection, index) {
			//TODO: #CRM-13446
			var tempGridDataCollection = new this.Terrasoft.Collection();
			tempGridDataCollection.loadAll(gridData);
			dataCollection.eachKey(function(key, item) {
				tempGridDataCollection.insert(index, key, item);
			}, this);
			gridData.clear();
			gridData.loadAll(tempGridDataCollection);
		},

		/**
		 * Получает индекс текущей активной записи из коллекции данных реестра.
		 * @private
		 * @param {Terrasoft.Collection} gridData Коллекция данных реестра.
		 * @return {Number} Индекс активной записи в коллекции данных.
		 */
		getGridItemIndex: function(gridData) {
			var activeRow = this.getActiveRow();
			if (activeRow) {
				return gridData.indexOf(activeRow);
			} else {
				return 0;
			}
		},

		/**
		 * Возвращает название схемы по умолчанию для модели предсталения элемента редактируемго реестра.
		 * @protected
		 * @return {String} Название схемы модели представления.
		 */
		getDefaultConfigurationGridItemSchemaName: function() {
			return "BasePageV2";
		},

		/**
		 * Инициализирует классы элементов коллекции редактируемого реестра.
		 * @protected
		 * @param {Function} callback Функция обратного вызова.
		 * @param {Object} scope Контекст выполнения функции обратного вызова.
		 */
		initEditableGridRowViewModel: function(callback, scope) {
			var entitySchemaName = this.entitySchemaName;
			var schemaBuilder = this.Ext.create("Terrasoft.SchemaBuilder");
			var config = {
				schemaName: "BaseConfigurationGridRow"
			};
			schemaBuilder.requireAllSchemaHierarchy(config, function(baseHierarchy) {
				var entityStructure = this.getEntityStructure(entitySchemaName);
				var chainArguments = [];
				var pages = [];
				if (entityStructure) {
					pages = entityStructure.pages;
				} else {
					pages.push({
						cardSchema: this.getDefaultConfigurationGridItemSchemaName(),
						entitySchemaName: entitySchemaName
					});
				}
				this.Terrasoft.each(pages, function(page) {
					var chainedFunction = function(next) {
						config = {
							schemaName: page.cardSchema,
							entitySchemaName: page.entitySchemaName
						};
						schemaBuilder.requireAllSchemaHierarchy(config, function(hierarchy) {
							var editableGridPageSchema = baseHierarchy[baseHierarchy.length - 1];
							var pageSchema = hierarchy[hierarchy.length - 1];
							var schemaName = pageSchema.schemaName;
							editableGridPageSchema.schemaName = schemaName + "ConfigurationGridRow";
							editableGridPageSchema.entitySchemaName = pageSchema.entitySchemaName;
							editableGridPageSchema.entitySchema = pageSchema.entitySchema;
							var viewModelGenerator = schemaBuilder.createViewModelGenerator();
							viewModelGenerator.generate({
								hierarchy: hierarchy.concat(baseHierarchy),
								schema: editableGridPageSchema
							}, next, this);
						}, schemaBuilder);
					};
					chainArguments.push(chainedFunction);
				}, this);
				chainArguments.push(function() {
					callback.call(scope);
				});
				chainArguments.push(this);
				this.Terrasoft.chain.apply(this, chainArguments);
			}, this);
		}
	});
	return Ext.create("Terrasoft.ConfigurationGridUtilities");
});
