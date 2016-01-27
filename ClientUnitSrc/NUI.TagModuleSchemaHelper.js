define("TagModuleSchemaHelper", ["TagModuleSchemaHelperResources", "TagConstantsV2", "ViewUtilities"],
	function(resources, TagConstants, ViewUtilities) {
		/**
		 * @class Terrasoft.configuration.mixins.TagModuleSchemaHelper
		 * Миксин, реализующий работу модуля тегов.
		 */
		Ext.define("Terrasoft.configuration.mixins.TagModuleSchemaHelper", {
			alternateClassName: "Terrasoft.TagModuleSchemaHelper",

			/**
			 * Возвращает запрос на выборку тегов в конкретной записи.
			 * @protected
			 * @param {string} entityInTagSchemaName название объекта выборки
			 * @return {Terrasoft.EntitySchemaQuery}
			 */
			getEntityInTagQuery: function(entityInTagSchemaName) {
				var esq = Ext.create("Terrasoft.EntitySchemaQuery", {
					rootSchemaName: entityInTagSchemaName
				});
				esq.addColumn("Id");
				esq.addColumn("Tag");
				esq.addColumn("Tag.Type", "Type");
				esq.addColumn("Entity");
				return esq;
			},

			/**
			 * Возвращает запрос на выборку всех тегов раздела.
			 * @protected
			 * @param {string} entityTagSchemaName название объекта выборки
			 * @return {Terrasoft.EntitySchemaQuery}
			 */
			getEntityTagQuery: function(entityTagSchemaName) {
				var esq = this.Ext.create("Terrasoft.EntitySchemaQuery", {
					rootSchemaName: entityTagSchemaName
				});
				esq.addMacrosColumn(this.Terrasoft.QueryMacrosType.PRIMARY_COLUMN, "value");
				esq.addMacrosColumn(this.Terrasoft.QueryMacrosType.PRIMARY_DISPLAY_COLUMN, "displayValue");
				esq.addColumn("Type");
				return esq;
			},

			/**
			 * Добавляет в запрос на выборку тегов раздела фильтр по уже добавленным к записи.
			 * @protected
			 * @param {Terrasoft.Collection} collection Коллекция моделей представления.
			 * @param {String} columnName Название колонки с идентификатором тега.
			 * @return {Terrasoft.FilterGroup} Фильтр для выбора списка тегов, которые не были выбраны ранее.
			 */
			getFilterByExistsTag: function(collection, columnName) {
				var filter = null;
				var entityTagCollection = [];
				columnName = columnName || "TagId";
				collection.each(function(item) {
					var tagId = item.get(columnName);
					if (!this.Ext.isEmpty(tagId)) {
						entityTagCollection.push(tagId);
					}
				}, this);
				if (entityTagCollection.length) {
					filter = this.Terrasoft.createColumnInFilterWithParameters("Id", entityTagCollection);
					filter.comparisonType = this.Terrasoft.ComparisonType.NOT_EQUAL;
				}
				return filter;
			},

			/**
			 * Возвращает фильтр по автору тегов (для личных) и по остальным тегам.
			 * @protected
			 * @return {Terrasoft.FilterGroup}
			 */
			getTagTypesFilter: function(prefixColumnName) {
				if (!prefixColumnName) {
					prefixColumnName = "";
				}
				var filterGroup = new this.Terrasoft.createFilterGroup();
				filterGroup.logicalOperation = this.Terrasoft.LogicalOperatorType.OR;
				this.addPrivateTagFilter(filterGroup, prefixColumnName);
				this.addCorporateTagFilter(filterGroup, prefixColumnName);
				return filterGroup;
			},

			/**
			 * Добавляет к фильтрам выборки тегов фильтр по личному тегу и по автору личного тега.
			 * @private
			 * @param {Terrasoft.FilterGroup} filterGroup группа фильтров по типам.
			 * @param {String} prefixColumnName имя колонки для фильтра по связанной сущности.
			 */
			addPrivateTagFilter: function(filterGroup, prefixColumnName) {
				if (!prefixColumnName) {
					prefixColumnName = "";
				}
				var privateTagFilterGroup = new this.Terrasoft.createFilterGroup();
				privateTagFilterGroup.add("CurrentUser", this.Terrasoft.createColumnFilterWithParameter(
					this.Terrasoft.ComparisonType.EQUAL, prefixColumnName + "CreatedBy",
					this.Terrasoft.SysValue.CURRENT_USER_CONTACT.value));
				privateTagFilterGroup.add("PrivateType", this.Terrasoft.createColumnFilterWithParameter(
					this.Terrasoft.ComparisonType.EQUAL, prefixColumnName + "Type", TagConstants.TagType.Private));
				filterGroup.addItem(privateTagFilterGroup);
			},

			/**
			 * Добавляет к фильтрам выборки тегов фильтр по корпоративному тегу.
			 * @private
			 * @param {Terrasoft.FilterGroup} filterGroup группа фильтров по типам.
			 * @param {String} prefixColumnName имя колонки для фильтра по связанной сущности.
			 */
			addCorporateTagFilter: function(filterGroup, prefixColumnName) {
				if (!prefixColumnName) {
					prefixColumnName = "";
				}
				var corporateTagFilterGroup = new this.Terrasoft.createFilterGroup();
				corporateTagFilterGroup.add("CorporateType", this.Terrasoft.createColumnFilterWithParameter(
					this.Terrasoft.ComparisonType.EQUAL, prefixColumnName + "Type", TagConstants.TagType.Corporate));
				filterGroup.addItem(corporateTagFilterGroup);
			},

			/**
			 * Добавляет к фильтрам выборки тегов фильтр по публичному тегу.
			 * @protected
			 * @param {Terrasoft.FilterGroup} filterGroup группа фильтров по типам.
			 * @param {String} prefixColumnName имя колонки для фильтра по связанной сущности.
			 */
			addPublicTagFilter: function(filterGroup, prefixColumnName) {
				if (!prefixColumnName) {
					prefixColumnName = "";
				}
				var publicTagFilterGroup = new this.Terrasoft.createFilterGroup();
				publicTagFilterGroup.add("PublicType", this.Terrasoft.createColumnFilterWithParameter(
					this.Terrasoft.ComparisonType.EQUAL, prefixColumnName + "Type", TagConstants.TagType.Public));
				filterGroup.addItem(publicTagFilterGroup);
			},

			/**
			 * Возвращает конфиг изображения для существующих записей по типу.
			 * @protected
			 * @param {string} typeId тип тега
			 * @return {*}
			 */
			getImageConfigForExistsRecord: function(typeId) {
				switch (typeId) {
					case TagConstants.TagType.Private:
						return resources.localizableImages.ExistsPrivateTagIcon;
					case TagConstants.TagType.Corporate:
						return resources.localizableImages.ExistsCorporateTagIcon;
					case TagConstants.TagType.Public:
						return resources.localizableImages.ExistsPublicTagIcon;
					default:
						return null;
				}
			},

			/**
			 * Возвращает стиль для рамки в зависимости от типа тега.
			 * @protected
			 * @param {string} typeId идентификатор типа
			 * @return {string}
			 */
			getTagItemContainerBorderStyle: function(typeId) {
				switch (typeId) {
					case TagConstants.TagType.Private:
						return "private-tag";
					case TagConstants.TagType.Corporate:
						return "corporate-tag";
					case TagConstants.TagType.Public:
						return "public-tag";
					default:
						return "";
				}
			},

			/**
			 * Возвращает новый элемент тега для существующих тегов.
			 * @protected
			 * @param {Object} item элемент выборки
			 * @param {string} recordId идентификатор записи
			 * @param {string} entityInTagSchemaName название схемы тегов в записи
			 * @return {Terrasoft.TagItemViewModel}
			 */
			getTagItem: function(item, recordId, entityInTagSchemaName) {
				var viewModelItem = Ext.create("Terrasoft.TagItemViewModel", {
					Ext: this.Ext,
					Terrasoft: this.Terrasoft,
					sandbox: this.sandbox,
					values: {
						Id: item.get("Id"),
						Caption: item.get("Tag").displayValue,
						TagId: item.get("Tag").value,
						TagTypeId: item.get("Type").value,
						RecordId: recordId,
						InTagSchemaName: entityInTagSchemaName
					}
				});
				viewModelItem.init();
				return viewModelItem;
			},

			/**
			 * Возвращает новый элемент тега для новых тегов.
			 * @param {string} newId идентификатор новой записи тегов
			 * @param {Object} selectedTag выбранный в справочнике тег
			 * @param {string} recordId идентификатор записи к которой привязывается тег
			 * @param {string} entityInTagSchemaName название объекта тегов в записи
			 * @return {Terrasoft.TagItemViewModel}
			 */
			getNewTagItem: function(newId, selectedTag, recordId, entityInTagSchemaName) {
				var newItemViewModel = Ext.create("Terrasoft.TagItemViewModel", {
					Ext: this.Ext,
					Terrasoft: this.Terrasoft,
					sandbox: this.sandbox,
					values: {
						Id: newId,
						Caption: selectedTag.displayValue,
						TagId: selectedTag.value,
						TagTypeId: selectedTag.TagTypeId,
						RecordId: recordId,
						InTagSchemaName: entityInTagSchemaName
					}
				});
				newItemViewModel.init();
				return newItemViewModel;
			},

			/**
			 * Возвращает конфиг представления элемента тега.
			 * @param {Object} config конфиг
			 * @return {*|Object}
			 */
			getTagItemViewConfig: function(config) {
				var containerStyles = [];
				var tagContainerStyle = this.getTagItemContainerBorderStyle(config.TagTypeId);
				if (!Ext.isEmpty(tagContainerStyle)) {
					containerStyles.push(tagContainerStyle);
				}
				var itemConfig = ViewUtilities.getContainerConfig("tag-item-view", containerStyles);
				var buttonConfig = {
					id: "tag-button-item-" + config.Id,
					className: "Terrasoft.Button",
					style: this.Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
					"classes": {
						"wrapperClass": ["tag-button"],
						"imageClass": ["tag-image-close"]
					},
					caption: {bindTo: "Caption"},
					imageConfig: config.ImageConfig,
					imageClick: {bindTo: "onRemoveTagFromEntityImageClick"},
					iconAlign: this.Terrasoft.controls.ButtonEnums.iconAlign.RIGHT,
					click: {bindTo: "onTagItemButtonClick"},
					tag: config.Id,
					markerValue: config.Caption
				};
				itemConfig.items.push(buttonConfig);
				return itemConfig;
			}
		});

	});