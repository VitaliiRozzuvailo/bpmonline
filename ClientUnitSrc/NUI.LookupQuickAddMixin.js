define("LookupQuickAddMixin", ["LookupQuickAddMixinResources", "RightUtilities",
		"LookupUtilities", "MaskHelper"],
	function(resources, RightUtilities, LookupUtilities, MaskHelper) {
		/**
		 * @class Terrasoft.configuration.mixins.LookupQuickAddMixin
		 * Миксин, реализующий работу быстрого добавления в справочние через Lookup
		 */
		Ext.define("Terrasoft.configuration.mixins.LookupQuickAddMixin", {
			alternateClassName: "Terrasoft.LookupQuickAddMixin",

			/**
			 * Шаблон для customHtml элемента в выпадающем меню.
			 * @type {String}
			 */
			listItemCustomHtmlTpl: "<div data-value=\"{0}\" class=\"listview-new-item\">{1}</div>",

			/**
			 * Коллекция названий объектов которые не нужно проверять на наличие обязательных колонок,
			 * так как они могут заполнятся на сервере. Напр., для объекта Contact - переданное ФИО парсится на
			 * Фамилия Имя Отчество.
			 * @protected
			 * @return {Array} Коллекция названий объектов.
			 */
			getExcludedSchemaNamesForRequiredColumnsCheck: function() {
				return ["Contact"];
			},

			/**
			 * Коллекция названий объектов для которых нужно добавлять объект
			 * без открытия карточки даже если на поле наложены фильтры.
			 * @protected
			 * @return {Array} Коллекция названий объектов.
			 */
			getForceAddSchemaNames: function() {
				return [];
			},

			/**
			 * Список названий объектов для которых не будет выпадающего меню "Создать ..."
			 * @protected
			 * @return {Array} Коллекция названий объектов.
			 */
			getPreventQuickAddSchemaNames: function() {
				return ["SysAdminUnit", "VwSysSchemaInfo", "VwQueueSysProcess"];
			},

			/**
			 * Добавляет в выпадающий список для lookup элемент "Создать %введенное_значение%", но только
			 * если на поле не наложен сложный фильтр.
			 * @overridden
			 * @param {Object} config:
			 * @param {String} filterValue Фильтр для primaryDisplayColumn.
			 * @param {Terrasoft.Collection} list Коллекция, в которую будут загружены данные.
			 * @param {String} columnName Имя колонки ViewModel.
			 * @param {Boolean} isLookupEdit lookup или combobox.
			 */
			onLookupDataLoaded: function(config) {
				var isComplicatedFiltersExists = false;
				var filters = this.getLookupQueryFilters(config.columnName);
				isComplicatedFiltersExists = this.checkIsComplicatedFiltersExists(filters);
				var cacheObject = {
					filters: filters,
					isComplicatedFiltersExists: isComplicatedFiltersExists
				};
				this.setValueToLookupInfoCache(config.columnName, "lookupFiltersInfo", cacheObject);
				var refSchemaName = this.getLookupEntitySchemaName({}, config.columnName);
				var preventSchemaNames = this.getPreventQuickAddSchemaNames();
				if (config.isLookupEdit && !Ext.isEmpty(config.filterValue) &&
						!isComplicatedFiltersExists && preventSchemaNames.indexOf(refSchemaName) === -1) {
					this.setValueToLookupInfoCache(config.columnName, "filterValue", config.filterValue);
					config.objects[Terrasoft.GUID_EMPTY] = this.getNewListItemConfig(config.filterValue);
				}
			},

			/**
			 * Проверяет является ли фильтр сложным, то есть по наложенным фильтрам нельзя сказать конкретно
			 * какими значениями должны быть заполнены колонки объекта.
			 * Простой фильтр не может быть по обратным связям и не может содержать несколько FilterGroup с логическим
			 * оператором отличным от "И", также все условия должны быть с типом сравнения "РАВНО".
			 * @protected
			 * @param {Terrasoft.Collection} filters Фильтры.
			 * @return {Boolean} Есть ли сложные фильтры.
			 */
			checkIsComplicatedFiltersExists: function(filters) {
				var isComplicatedFiltersExists = false;
				var groupsCount = 0;
				if (!filters || filters.isEmpty()) {
					return isComplicatedFiltersExists;
				}
				filters.each(function(filter) {
					if (filter.filterType === Terrasoft.FilterType.FILTER_GROUP) {
						if (filter.logicalOperation !== Terrasoft.LogicalOperatorType.AND) {
							groupsCount++;
						}
						isComplicatedFiltersExists = isComplicatedFiltersExists || this.checkIsComplicatedFiltersExists(filter);
					} else if (filter.comparisonType !== Terrasoft.ComparisonType.EQUAL) {
						isComplicatedFiltersExists = true;
					} else if (filter.comparisonType === Terrasoft.ComparisonType.EQUAL) {
						var columnPath = filter.leftExpression.columnPath || filter.rightExpression.columnPath;
						isComplicatedFiltersExists = isComplicatedFiltersExists || columnPath.indexOf(".") !== -1;
					}
				}, this);
				return (isComplicatedFiltersExists || groupsCount > 1);
			},

			/**
			 * Получить конфиг для нового елемента в listView.
			 * @protected
			 * @param {String} value Значение введеное в поле.
			 */
			getNewListItemConfig: function(value) {
				var newValText = Ext.String.format(resources.localizableStrings.TipMessageTemplate, value);
				return {
					value: Terrasoft.GUID_EMPTY,
					displayValue: newValText,
					customHtml: this.Ext.String.format(this.listItemCustomHtmlTpl, Terrasoft.GUID_EMPTY, newValText)
				};
			},

			/**
			 * Установить значение в lookupAdditionalInfoCache. lookupAdditionalInfoCache содержит закешированную
			 * информацию по правам доступа на справочные объекты и введеные значеное значение в колонку.
			 * @private
			 * @param {String} key Название объекта или поля.
			 * @param {String} propertyName Название свойства.
			 * @param {Object} propertyValue Значение свойства.
			 */
			setValueToLookupInfoCache: function(key, propertyName, propertyValue) {
				if (!this.lookupAdditionalInfoCache) {
					this.lookupAdditionalInfoCache = {};
				}
				if (!this.lookupAdditionalInfoCache[key]) {
					this.lookupAdditionalInfoCache[key] = {};
				}
				this.lookupAdditionalInfoCache[key][propertyName] = propertyValue;
			},

			/**
			 * Получить значение из lookupAdditionalInfoCache.
			 * @private
			 * @param {String} key Название объекта или поля.
			 * @param {String} propertyName Имя колонки ViewModel.
			 * @return {Object} Объект со свойствами:
			 * - success {Boolean} - удалось ли получить значение.
			 * - value {Object} - значение свойства.
			 */
			tryGetValueFromLookupInfoCache: function(key, propertyName) {
				var resObj = {
					success: false,
					value: null
				};
				if (this.lookupAdditionalInfoCache && this.lookupAdditionalInfoCache[key]) {
					resObj.success = true;
					resObj.value = this.lookupAdditionalInfoCache[key][propertyName];
				}
				return resObj;
			},

			/**
			 * Добавляет запись в справочный объект(или открывает карточку для добавления)
			 * если есть права на добавление.
			 * @protected
			 * @param {String} searchValue Введенный текст.
			 * @param {String} columnName Имя поля.
			 */
			tryCreateEntityOrOpenCard: function(searchValue, columnName) {
				MaskHelper.ShowBodyMask();
				var refSchemaName = this.getLookupEntitySchemaName({}, columnName);
				var canAdd = this.tryGetValueFromLookupInfoCache(refSchemaName + "Schema", "canAdd");
				var lookupFiltersInfoCache = this.tryGetValueFromLookupInfoCache(columnName, "lookupFiltersInfo");
				var entityStructure = Terrasoft.configuration.EntityStructure[refSchemaName];
				var currentEntitySchema = this.tryGetValueFromLookupInfoCache(refSchemaName + "Schema", "entitySchema");
				var entitySchema = currentEntitySchema.success ? currentEntitySchema.value : {};
				if (!canAdd.success) {
					var checkCanAddCallback = function() {
						this.tryCreateEntityOrOpenCard(searchValue, columnName);
					};
					this.checkCanAddToLookupSchema(refSchemaName, checkCanAddCallback);
				} else if (canAdd.success && this.Ext.isEmpty(canAdd.value)) {
					var lookupFiltersInfo = lookupFiltersInfoCache.value;
					var valuePairsFromFilters = this.extractValuePairsFromFilters(entitySchema, columnName, lookupFiltersInfo.filters);
					var isImplicitColumnsExists = this.isRequiredColumnsToFillExists(entitySchema, valuePairsFromFilters);
					var isLookupQueryFiltersNotEmpty = lookupFiltersInfo.isComplicatedFiltersExists;
					var forceAddSchemaNames = this.getForceAddSchemaNames();
					var isNotForceAddSchemaName = forceAddSchemaNames.indexOf(entitySchema.name) === -1;
					var createEntityConfig = {
						entitySchema: entitySchema,
						columnName: columnName,
						displayColumnValue: searchValue,
						valuePairsFromFilters: valuePairsFromFilters
					};
					if (isImplicitColumnsExists || (isLookupQueryFiltersNotEmpty && isNotForceAddSchemaName)) {
						MaskHelper.HideBodyMask();
						this.validateColumn(columnName);
						if (entityStructure) {
							this.openPageForNewEntity(createEntityConfig);
						} else {
							this.set(columnName, null);
							this.showInformationDialog(resources.localizableStrings.CantOpenPage);
						}
					} else {
						this.createEntitySilently(createEntityConfig);
					}
				} else if (canAdd.success && !this.Ext.isEmpty(canAdd.value)) {
					MaskHelper.HideBodyMask();
					var message = Ext.String.format(canAdd.value, entitySchema.caption);
					this.set(columnName, null);
					this.showInformationDialog(message);
				}
			},

			/**
			 * Получает значения для заполнения колонок на основании наложенных фильтров.
			 * @protected
			 * @param  {Object} entitySchema Объект справочного поля.
			 * @param  {String} columnName Название колонки справочника.
			 * @param  {Terrasoft.Collection} lookupFilters Фильтры наложенные на колонку.
			 * @param {Terrasoft.Collection} valuePairs Коллекция объектов со значениями для колонок.
			 * @return {Terrasoft.Collection} Коллекция объектов со значениями для колонок.
			 */
			extractValuePairsFromFilters: function(entitySchema, columnName, lookupFilters, valuePairs) {
				if (!valuePairs) {
					valuePairs = new Terrasoft.Collection();
				}
				lookupFilters.each(function(filter) {
					if (filter.filterType === Terrasoft.FilterType.FILTER_GROUP) {
						this.extractValuePairsFromFilters(entitySchema, columnName, filter, valuePairs);
					} else if (filter.comparisonType === Terrasoft.ComparisonType.EQUAL) {
						var columnPath = filter.leftExpression.columnPath || filter.rightExpression.columnPath;
						var leftParameterValue, rightParameterValue;
						if (filter.leftExpression.parameter) {
							leftParameterValue = filter.leftExpression.parameter.getValue();
						}
						if (filter.rightExpression.parameter) {
							rightParameterValue = filter.rightExpression.parameter.getValue();
						}
						var columnValue = rightParameterValue || leftParameterValue;
						if (entitySchema.columns[columnPath] && !valuePairs.contains(columnPath)) {
							valuePairs.add(columnPath, {columnPath: columnPath, columnValue: columnValue});
						}
					}
				}, this);
				return valuePairs;
			},

			/**
			 * Создает запись в объекте, заполняя колонку для отображения, без открытия карточки.
			 * @protected
			 * @param {Object} config Объект с параметрами
			 * @param {String} config.entitySchema Объект справочного поля.
			 * @param {String} config.columnName Название колонки в которую нужно установить добавленное значение.
			 * @param {String} config.displayColumnValue Значения колонки для отображения новой записи.
			 * @param {String} config.valuePairsFromFilters Значения на основании фильтров поля.
			 */
			createEntitySilently: function(config) {
				var primaryColumnValue = Terrasoft.generateGUID();
				config.primaryColumnValue = primaryColumnValue;
				var insert = this.getInsertQueryForLookupEntity(config);
				insert.execute(function(result) {
					MaskHelper.HideBodyMask();
					if (result.success) {
						var resultCollection = new Terrasoft.Collection();
						var resObj = {
							value: primaryColumnValue,
							displayValue: config.displayColumnValue
						};
						resultCollection.add(resObj);
						this.onLookupResult({columnName: config.columnName, selectedRows: resultCollection});
					} else if (result.errorInfo) {
						this.set(config.columnName, null);
						this.showInformationDialog(result.errorInfo.message);
					}
				}, this);
			},

			/**
			 * Проверяет соответствует ли объект требованиям:
			 * - Есть права на добавление записи.
			 * - На объект зарегистрирован раздел.
			 * - Справочник зарегистрирован в разделе "Справочники" (т.е. не системный).
			 * @private
			 * @param {String} schemaName Название объекта.
			 * @param {Function} callback Функция обратного вызова.
			 */
			checkCanAddToLookupSchema: function(schemaName, callback) {
				Terrasoft.chain(
					function(next) {
						this.getLookupEntitySchemaByName(schemaName, next);
					},
					function(next, entitySchema) {
						this.setValueToLookupInfoCache(schemaName + "Schema", "entitySchema", entitySchema);
						next();
					},
					function(next) {
						this.checkRightsForObject(schemaName, next);
					},
					function(next, result) {
						this.checkRightsCallback(schemaName, result, callback, next);
					},
					function(next) {
						this.checkIsSysModule(schemaName, next);
					},
					function(next, isSysModule) {
						if (isSysModule) {
							this.setValueToLookupInfoCache(schemaName + "Schema", "canAdd", "");
							next();
						} else {
							this.checkIsRegisteredLookup(schemaName, next);
						}
					},
					function() {
						callback.call(this);
					}, this);
			},

			/**
			 * Проверить является ли справочник зарегистрированным или нет.
			 * @protected
			 * @param {String} schemaName Название объекта.
			 * @param {Function} callback Функция обратного вызова.
			 */
			checkIsRegisteredLookup: function(schemaName, callback) {
				var currentEntitySchema = this.tryGetValueFromLookupInfoCache(schemaName + "Schema", "entitySchema");
				var entitySchema = currentEntitySchema.success ? currentEntitySchema.value : {};
				var select = this.Ext.create("Terrasoft.EntitySchemaQuery", {
					rootSchemaName: "Lookup"
				});
				select.addAggregationSchemaColumn("Id", Terrasoft.AggregationType.COUNT, "IdCOUNT");
				select.filters.addItem(this.Terrasoft.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL,
					"SysEntitySchemaUId", entitySchema.uId));
				select.getEntityCollection(function(response) {
					var messageTpl = "";
					if (response.success) {
						var selectResult = response.collection.getByIndex(0);
						var lookupCount = selectResult.get("IdCOUNT");
						if (lookupCount === 0) {
							messageTpl = resources.localizableStrings.NotSysModuleNeitherLookup;
						}
					} else if (response.errorInfo) {
						messageTpl = response.errorInfo.message;
					}
					this.setValueToLookupInfoCache(schemaName + "Schema", "canAdd", messageTpl);
					callback();
				}, this);
			},

			/**
			 * Проверить есть ли у объекта зарегистрированный раздел.
			 * @protected
			 * @param {String} schemaName Название объекта.
			 * @param {Function} callback Функция обратного вызова.
			 */
			checkIsSysModule: function(schemaName, callback) {
				var isSysModule = !this.Ext.isEmpty(Terrasoft.configuration.ModuleStructure[schemaName]);
				callback(isSysModule);
			},

			/**
			 * Функция обратного вызова для проверки прав.
			 * @protected
			 * @param {String} schemaName Название объекта.
			 * @param {Object} result Результат проверки прав на объект.
			 * @param {Function} callback Функция обратного вызова.
			 * @param {Function} next Функция обратного вызова по цепочке.
			 */
			checkRightsCallback: function(schemaName, result, callback, next) {
				var hasRightToAdd = Ext.isEmpty(result);
				if (!hasRightToAdd) {
					var messageTpl = resources.localizableStrings.NoRightsToAdd;
					this.setValueToLookupInfoCache(schemaName + "Schema", "canAdd", messageTpl);
					callback.call(this);
				} else {
					next();
				}
			},

			/**
			 * Проверяет есть ли права на добавление новой записи в объект.
			 * @protected
			 * @param {String} schemaName Название объекта.
			 * @param {Function} callback Функция обратного вызова.
			 */
			checkRightsForObject: function(schemaName, callback) {
				var rightReqConfig = {
					schemaName: schemaName,
					primaryColumnValue: Terrasoft.GUID_EMPTY,
					isNew: true
				};
				RightUtilities.checkCanEdit(rightReqConfig, callback, this);
			},

			/**
			 * Событие изменения значения в поле. Если выбрано действие создать - пытаемся создать запись или
			 * открываем карточку.
			 * @public
			 * @param {Object} newValue Новое значение.
			 * @param {String} columnName Имя поля.
			 */
			onLookupChange: function(newValue, columnName) {
				var filterValue = this.tryGetValueFromLookupInfoCache(columnName, "filterValue");
				if (newValue && !this.Ext.isEmpty(filterValue.value) && newValue.isNewValue) {
					this.setValueToLookupInfoCache(columnName, "filterValue", null);
					this.tryCreateEntityOrOpenCard(filterValue.value, columnName);
				} else if (newValue && newValue.value === Terrasoft.GUID_EMPTY && !this.get(columnName) &&
						filterValue.success && !Ext.isEmpty(filterValue.value)) {
					newValue.isNewValue = true;
					newValue.displayValue = filterValue.value;
					this.set(columnName, newValue);
				}
			},

			/**
			 * Создает и возвращает InsertQuery для простого справочного объекта.
			 * @protected
			 * @param {Object} config Объект с параметрами.
			 * @param {Object} config.entitySchema Объект справочного поля.
			 * @param {Guid} config.primaryColumnValue Значение основной колонки.
			 * @param {String} config.displayColumnValue Значения колонки для отображения.
			 * @param {Terrasoft.Collection} config.valuePairsFromFilters Значение для колонок на основании фильтров.
			 * @return {Terrasoft.InsertQuery} Запрос на добавление простого справочного объекта.
			 */
			getInsertQueryForLookupEntity: function(config) {
				var entitySchema = config.entitySchema;
				var insertQuery = Ext.create("Terrasoft.InsertQuery", {
					rootSchemaName: entitySchema.name
				});
				if (config.valuePairsFromFilters) {
					config.valuePairsFromFilters.each(function(valuePair) {
						var dataType = entitySchema.columns[valuePair.columnPath].dataValueType;
						insertQuery.setParameterValue(valuePair.columnPath, valuePair.columnValue, dataType);
					});
				}
				insertQuery.setParameterValue(entitySchema.primaryColumnName, config.primaryColumnValue,
					this.Terrasoft.DataValueType.GUID);
				insertQuery.setParameterValue(entitySchema.primaryDisplayColumnName, config.displayColumnValue,
					this.Terrasoft.DataValueType.TEXT);
				return insertQuery;
			},

			/**
			 * Определяет есть ли колонки, которые пользователь должен заполнить чтобы создать объект.
			 * @private
			 * @param {Object} entitySchema Объект справочного поля.
			 * @param {Terrasoft.Collection} valuePairsFromFilters Значения которые будут заполнены на основании фильтров.
			 * @return {Boolean} Есть ли колонки которые необходимо заполнить для создания объекта.
			 */
			isRequiredColumnsToFillExists: function(entitySchema, valuePairsFromFilters) {
				var implicitColumnsExists = false;
				var excludeSchemas = this.getExcludedSchemaNamesForRequiredColumnsCheck();
				if (excludeSchemas.indexOf(entitySchema.name) !== -1) {
					return implicitColumnsExists;
				}
				for (var columnName in entitySchema.columns) {
					var column = entitySchema.columns[columnName];
					if (column.name === entitySchema.primaryDisplayColumnName) {
						continue;
					}
					if (column.isRequired && Ext.isEmpty(column.defaultValue) && !valuePairsFromFilters.contains(columnName)) {
						implicitColumnsExists = true;
						break;
					}
				}
				return implicitColumnsExists;
			},

			/**
			 * Открывает карточку для добавления новой записи в справочник.
			 * @protected
			 * @param {Object} newEntityConfig Объект с параметрами
			 * @param {String} newEntityConfig.entitySchema Объект справочного поля.
			 * @param {String} newEntityConfig.columnName Название колонки в которую нужно установить добавленное значение.
			 * @param {String} newEntityConfig.displayColumnValue Значения колонки для отображения новой записи.
			 * @param {String} newEntityConfig.valuePairsFromFilters Значения на основании фильтров поля.
			 */
			openPageForNewEntity: function(newEntityConfig) {
				var defValues = [{
					name: newEntityConfig.entitySchema.primaryDisplayColumnName,
					value: newEntityConfig.displayColumnValue
				}];
				newEntityConfig.valuePairsFromFilters.each(function(valuePair) {
					defValues.push({
						name: valuePair.columnPath,
						value: valuePair.columnValue
					});
				}, this);
				var lookupPageConfig = {
					searchValue: newEntityConfig.displayColumnValue
				};
				var config = this.getLookupPageConfig(lookupPageConfig, newEntityConfig.columnName);
				config.isQuickAdd = true;
				config.valuePairs = defValues;
				config.modalBoxClasses = "display-none";
				this.set(newEntityConfig.columnName, null);
				LookupUtilities.Open(this.sandbox, config, this.onLookupResult, this, null, false, false);
			},

			/**
			 * Метод возвращает объект по его имени.
			 * @protected
			 * @param {String} entitySchemaName Имя объекта.
			 * @param {Function} callback Функция обратного вызова.
			 * @param {Object} scope Контекст вызова функции обратного вызова.
			 */
			getLookupEntitySchemaByName: function(entitySchemaName, callback, scope) {
				scope = scope || this;
				scope.sandbox.requireModuleDescriptors(["force!" + entitySchemaName], function() {
					Terrasoft.require([entitySchemaName], callback, scope);
				}, scope);
			}

		});
		return Terrasoft.LookupQuickAddMixin;
	});
