define("TagFilterViewModelGeneratorV2", ["TagFilterViewModelGeneratorV2Resources", "TagModuleSchemaHelper",
		"css!TagModuleSchemaStyles"],
	function(resources) {
		/**
		 * @class Terrasoft.configuration.TagFilterViewModel
		 * Класс модели фильтра по тегам.
		 */
		Ext.define("Terrasoft.configuration.TagFilterViewModel", {
			alternateClassName: "Terrasoft.TagFilterViewModel",
			extend: "Terrasoft.BaseFilterViewModel",

			mixins: {
				/**
				 * @class TagModuleSchemaHelper Класс, реализующий утилитные методы для работы с тегами.
				 */
				TagModuleSchemaHelper: "Terrasoft.TagModuleSchemaHelper"
			},

			columns: {
				/**
				 * Заголовок кнопки добавления фильтра по тегу.
				 * @Type {String}
				 */
				TagButtonCaption: {
					type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					name: "TagButtonCaption"
				},
				/**
				 * Текущее значение при редактировании фильтра по тегу.
				 * @Type {Object}
				 */
				TagFilterValue: {
					type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					isLookup: true,
					name: "TagFilterValue"
				},
				/**
				 * Список возможных значений при редактировании фильтра по тегу.
				 * @Type {Terrasoft.Collection}
				 */
				TagsList: {
					type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					name: "TagsList"
				}
			},

			/**
			 * @inheritdoc Terrasoft.BaseViewModel#constructor
			 * @virtual
			 * @overridden
			 */
			constructor: function() {
				this.callParent(arguments);
			},

			/**
			 * Инициализирует начальное состояние модели.
			 * @param {Function} callback Функция обратного вызова.
			 * @param {Object} scope Контекст.
			 */
			init: function(callback, scope) {
				this.Ext = this.get("Ext");
				this.Terrasoft = Terrasoft;
				this.initProperties();
				this.addEvents(
					"filterChanged"
				);
				if (callback) {
					callback.call(scope || this);
				}
			},

			/**
			 * Устанавливает начальные значения атрибутов.
			 */
			initProperties: function() {
				var editViewConfig = this.getTagEditViewConfig();
				var tagViewConfig = this.getTagViewConfig();
				this.set("TagFilters", this.Ext.create("Terrasoft.BaseViewModelCollection"));
				this.set("EditViewConfig", editViewConfig);
				this.set("TagViewConfig", tagViewConfig);
				this.set("TagsRowCount", 10);
				this.set("IsSeparateMode", true);
			},

			/**
			 * Возвращает фильтры по тегам.
			 * @return {Terrasoft.FilterGroup} Фильтры по тегам.
			 */
			getFilters: function() {
				var filters = this.Ext.create("Terrasoft.FilterGroup");
				var inTagSchemaName = this.get("InTagEntitySchemaName");
				var collection = this.get("TagFilters");
				collection.each(function(tag) {
					var tagId = tag.get("Id");
					var columnPath  = this.Ext.String.format("[{0}:Entity:Id].Tag", inTagSchemaName);
					var existsFilter = this.Terrasoft.createExistsFilter(columnPath);
					existsFilter.subFilters.addItem(this.Terrasoft.createColumnFilterWithParameter(
						this.Terrasoft.ComparisonType.EQUAL, "Tag", tagId));
					filters.add("TagFilters_" + tagId, existsFilter);
				}, this);
				return filters;
			},

			/**
			 * Метод добавлен для обратной совместимости.
			 * Результат работы в других моделях фильтров используется разделом,
			 * предположительно для сохранения значения фильтров.
			 */
			getFilterValue: Terrasoft.emptyFn,

			/**
			 * Удаляет тег из коллекции фильтров.
			 * @private
			 * @param {Terrasoft.BaseViewModel} tag Тег.
			 */
			removeTag: function(tag) {
				var collection = this.get("TagFilters");
				collection.remove(tag);
				this.fireEvent("filterChanged", "TagFilters");
				this.updateButtonCaption();
			},

			/**
			 * Устанавливает заголовок кнопки добавления фильтра по тегу.
			 */
			updateButtonCaption: function() {
				var collection = this.get("TagFilters");
				var isSeparateMode = this.get("IsSeparateMode");
				var caption = resources.localizableStrings.TagButtonCaption;
				if (!collection.isEmpty() && isSeparateMode) {
					caption = "";
				}
				this.set("TagButtonCaption", caption);
			},

			/**
			 * Проверяет наличие модели представления редактора фильтров по тегу в коллекции фильтров.
			 * Таким образом проверяется, отображен на странице редактор фильтров по тегу, или нет.
			 * @private
			 * @return {Boolean} Видимость редактора фильтров по тегу.
			 */
			isTagFilterEditVisible: function() {
				var collection = this.get("TagFilters");
				var editModel = collection.find("EditModel");
				return !this.Ext.isEmpty(editModel);
			},

			/**
			 * Отображает редактор фильтров по тегу.
			 */
			showTagFilterEdit: function() {
				if (!this.isTagFilterEditVisible()) {
					this.set("TagsList", null);
					this.set("TagFilterValue", null);
					this.set("IsFilterEditFocused", false);
					var collection = this.get("TagFilters");
					collection.add("EditModel", this);
				}
			},

			/**
			 * Скрывает редактор фильтров по тегу.
			 */
			removeTagFilterEdit: function() {
				if (this.isTagFilterEditVisible()) {
					var collection = this.get("TagFilters");
					collection.remove(this);
				}
			},

			/**
			 * Подписывает модель фильтров по тегу на события модели тега.
			 * @param {Terrasoft.BaseViewModel} filterModel Модель тега.
			 */
			subscribeFilterModelEvents: function(filterModel) {
				filterModel.on("remove", this.removeFilter, this);
			},

			/**
			 * Отписывает модель фильтров по тегу от событий модели тега.
			 * @param {Terrasoft.BaseViewModel} filterModel Модель тега.
			 */
			unsubscribeFilterModelEvents: function(filterModel) {
				filterModel.un("remove", this.removeFilter, this);
			},

			/**
			 * Создает модель фильтра по тегу и добавляет ее в коллекцию фильтров.
			 * @param {Object} tagConfig Параметры для создания фильтра.
			 * @param {Object} tagConfig.type Объект с значением справочной колонки типа.
			 * содержит свойства value и displayValue типа тега.
			 * @param {String} tagConfig.displayValue Название тега.
			 * @param {Guid} tagConfig.value Уникальный идентификатор тега.
			 */
			addFilter: function(tagConfig) {
				var filterModel = this.getTagFilterModel(tagConfig);
				this.subscribeFilterModelEvents(filterModel);
				var collection = this.get("TagFilters");
				collection.add(filterModel);
				this.fireEvent("filterChanged", "TagFilters");
				this.updateButtonCaption();
			},

			/**
			 * Обработчик события удаления фильтра. Удаляет модель фильтра из коллекции моделей фильтров.
			 * @param {Terrasoft.BaseViewModel} filterModel Модель тега.
			 */
			removeFilter: function(filterModel) {
				this.unsubscribeFilterModelEvents(filterModel);
				this.removeTag(filterModel);
			},

			/**
			 * Обработчик кнопки "Отмена" редактора фильтров по тегу.
			 */
			onCancelEditClick: function() {
				this.removeTagFilterEdit();
			},

			/**
			 * Обработчик события изменения значения в редакторе фильтров по тегу.
			 * Если новое значение фильтра не пустое, то сразу создается новый фильтр по тегу.
			 * @param {Object|*} newValue Выбранное значение.
			 */
			onTagFilterValueChange: function(newValue) {
				if (!this.Ext.isEmpty(newValue))  {
					this.addFilter(newValue);
					this.removeTagFilterEdit();
				}
				this.set("TagFilterValue", newValue);
			},

			/**
			 * Формирует коллекцию вариантов тегов по введенному значению.
			 * @param {String} searchValue Значение для фильтрации.
			 */
			getTagsList: function(searchValue) {
				var tagEntitySchemaName = this.get("TagEntitySchemaName");
				var esq = this.Ext.create("Terrasoft.EntitySchemaQuery", {
					rootSchemaName: tagEntitySchemaName
				});
				esq.addMacrosColumn(Terrasoft.QueryMacrosType.PRIMARY_COLUMN, "Id");
				esq.addMacrosColumn(Terrasoft.QueryMacrosType.PRIMARY_DISPLAY_COLUMN, "Name");
				esq.addColumn("Type");
				esq.rowCount = this.get("TagsRowCount");
				this.addTagSelectFilters(esq, searchValue);
				esq.getEntityCollection(function(result) {
					var collection = this.Ext.create("Terrasoft.Collection");
					if (result.success) {
						var selectedTags = result.collection;
						selectedTags.each(function(tag) {
							var tagId = tag.get("Id");
							var menuItemConfig = this.getTagMenuItemConfig(tag);
							collection.add(tagId, menuItemConfig);
						}, this);
					}
					this.set("TagsList", collection);
				}, this);
			},

			/**
			 * Добавляет в запрос фильтры по введенному значению и отсутствию среди выбранных тегов.
			 * @param {Terrasoft.EntitySchemaQuery} esq Запрос на выборку данных.
			 * @param {String} searchValue Введенное значение.
			 */
			addTagSelectFilters: function(esq, searchValue) {
				var filters = esq.filters;
				var tagTypesFilter = this.getTagTypesFilter();
				this.addPublicTagFilter(tagTypesFilter);
				var notSelectedTagFilter = this.getNotSelectedTagsFilter();
				filters.add("TagTypesFilter", tagTypesFilter);
				filters.add("NameFilter", Terrasoft.createColumnFilterWithParameter(
					Terrasoft.ComparisonType.START_WITH, "Name", searchValue));
				if (!this.Ext.isEmpty(notSelectedTagFilter)) {
					filters.add("NotSelectedTagFilter", notSelectedTagFilter);
				}
			},

			/**
			 * Формирует фильтр для выбора списка тегов, которые не были выбраны ранее.
			 * @return {Terrasoft.InFilter} Фильтр для выбора списка тегов, которые не были выбраны ранее.
			 */
			getNotSelectedTagsFilter: function() {
				var collection = this.get("TagFilters");
				return this.getFilterByExistsTag(collection, "Id");
			},

			/**
			 * Формирует параметры для пункта меню в редакторе фильтров по тегу.
			 * @param {Terrasoft.BaseViewModel} tag Модель тега.
			 * @return {Object} Параметры для пункта меню в редакторе фильтров по тегу.
			 */
			getTagMenuItemConfig: function(tag) {
				var tagId = tag.get("Id");
				var tagName = tag.get("Name");
				var tagType = tag.get("Type");
				var imageConfig = this.getImageConfigForExistsRecord(tagType.value);
				var config = {
					displayValue: tagName,
					value: tagId,
					type: tagType
				};
				if (!this.Ext.isEmpty(imageConfig)) {
					config.imageConfig = imageConfig;
				}
				return config;
			},

			/**
			 * Формирует параметры иконки для поля ввода в редакторе фильтров по тегу.
			 * @return {Object|*} Параметры иконки для пункта меню в редакторе фильтров по тегу.
			 */
			getFilterEditLeftIcon: function() {
				var filter = this.get("TagFilterValue");
				if (!this.Ext.isEmpty(filter)) {
					var type = filter.type;
					return this.getTagMenuImageConfig(type);
				}
				return null;
			},

			/**
			 * Обработчик события получения параметров представления фильтра по тегу.
			 * @param {Object} itemConfig Параметры для фильтра по тегу.
			 * @param {Terrasoft.BaseViewModel} item Модель представления фильтра по тегу.
			 */
			onGetTagItemConfig: function(itemConfig, item) {
				if (item === this) {
					var editViewConfig = this.get("EditViewConfig");
					itemConfig.config = Terrasoft.deepClone(editViewConfig);
				} else {
					var tagViewConfig = this.getTagItemViewConfig(item);
					itemConfig.config = tagViewConfig;
				}
			},

			/**
			 * Устанавливает фокус ввода в поле редактирования фильтра.
			 */
			setFilterEditFocused: function() {
				this.set("IsFilterEditFocused", true);
			},

			/**
			 * Формирует параметры представления фильтра тега.
			 * @param {Terrasoft.BaseViewModel} tag Модель фильтра тега.
			 * @return {Object} Параметры представления фильтра тега.
			 */
			getTagItemViewConfig: function(tag) {
				var config = this.get("TagViewConfig");
				var tagViewConfig = Terrasoft.deepClone(config);
				var classes = tagViewConfig.classes || {};
				var wrapperClass = classes.wrapperClass || [];
				var type = tag.get("Type");
				var typeClass = this.getTagItemContainerBorderStyle(type.value);
				wrapperClass.push(typeClass);
				var itemId = "TagItem";
				return {
					id: itemId,
					selectors: {wrapEl: "#" + itemId},
					classes: {
						wrapClassName: ["tag-filter-item-container"]
					},
					markerValue: {"bindTo": "DisplayValue"},
					items: [tagViewConfig]
				};
			},

			/**
			 * Формирует параметры представления редактора фильтров по тегу.
			 * @protected
			 * @return {Object} Параметры представления редактора фильтров по тегу.
			 */
			getTagEditViewConfig: function() {
				var tagEditViewId = "TagItem";
				return {
					className: "Terrasoft.Container",
					id: tagEditViewId,
					selectors: {wrapEl: "#" + tagEditViewId},
					classes: {
						wrapClassName: ["filter-inner-container", "tag-filter-edit-container"]
					},
					items: [
						{
							className: "Terrasoft.ComboBoxEdit",
							markerValue: "TagFilterEdit",
							classes: {wrapClass: "filter-simple-filter-edit"},
							value: {bindTo: "TagFilterValue"},
							list: {bindTo: "TagsList"},
							prepareList: {bindTo: "getTagsList"},
							change: {bindTo: "onTagFilterValueChange"},
							leftIconConfig: {"bindTo": "getFilterEditLeftIcon"},
							focused: {"bindTo": "IsFilterEditFocused"},
							afterrender: {"bindTo": "setFilterEditFocused"}
						},
						{
							className: "Terrasoft.Button",
							markerValue: "cancelButton",
							imageConfig: resources.localizableImages.CancelButtonImage,
							click: {bindTo: "onCancelEditClick"}
						}
					]
				};
			},

			/**
			 * Формирует параметры представления фильтра по тегу.
			 * @protected
			 * @return {Object} Параметры представления фильтра по тегу.
			 */
			getTagViewConfig: function() {
				return {
					className: "Terrasoft.Button",
					imageConfig: resources.localizableImages.RemoveTagImage,
					classes: {
						"wrapperClass": ["tag-button", "tag-filter-item"],
						"imageClass": ["filter-remove-button"],
						"textClass": ["tag-filter-item-label"]
					},
					caption: {"bindTo": "DisplayValue"},
					iconAlign: Terrasoft.controls.ButtonEnums.iconAlign.RIGHT,
					style: Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
					imageClick: {bindTo: "onRemove"},
					hint: {"bindTo": "DisplayValue"}
				};
			},

			/**
			 * Формирует модель представления фильтра по тегу.
			 * @protected
			 * @param {Object} tagConfig Параметры для создания модели фильтра.
			 * @param {Object} tagConfig.type Объект с значением справочной колонки типа.
			 * содержит свойства value и displayValue типа тега.
			 * @param {String} tagConfig.displayValue Название тега.
			 * @param {Guid} tagConfig.value Уникальный идентификатор тега.
			 * @return {Terrasoft.BaseVewModel} Модель представления фильтра по тегу.
			 */
			getTagFilterModel: function(tagConfig) {
				var tagFilterModel = this.Ext.create("Terrasoft.BaseViewModel", {
					values: {
						"Type": tagConfig.type,
						"DisplayValue": tagConfig.displayValue,
						"Id": tagConfig.value
					},
					methods: {
						onRemove: function() {
							this.fireEvent("remove", this);
						}
					}
				});
				tagFilterModel.addEvents(
					/**
					 * @event
					 * Событие удаления .
					 * @param {Object} viewModel Модель представления .
					 */
					"remove"
				);
				return tagFilterModel;
			}
		});

		/**
		 * @class Terrasoft.configuration.TagFilterViewModelGenerator
		 * Класс TagFilterViewModelGenerator Формирует параметры модели представления фильтров по тегу.
		 */
		return Ext.define("Terrasoft.configuration.TagFilterViewModelGenerator", {
			alternateClassName: "Terrasoft.TagFilterViewModelGenerator",

			/**
			 * Формирует параметры модели представления фильтров по тегу.
			 * @param {Object} config Параметры для генерации.
			 * @return {Object} Параметры для модели представления фильтров по тегам.
			 */
			generate: function(config) {
				var values = this.getValuesConfig(config);
				return {
					className: "Terrasoft.TagFilterViewModel",
					values: values
				};
			},

			/**
			 * Формирует начальные значения атрибутов модели представления.
			 * @param {Object} config Параметры для генерации.
			 * @return {Object} Начальные значения атрибутов модели представления.
			 */
			getValuesConfig: function(config) {
				var values = {
					TagButtonCaption: resources.localizableStrings.TagButtonCaption,
					TagFilters: null,
					Ext: config.Ext
				};
				if (!Ext.isEmpty(config.values)) {
					Ext.apply(values, config.values);
				}
				return values;
			}
		});
	});
