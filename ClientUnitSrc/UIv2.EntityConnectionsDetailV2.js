define("EntityConnectionsDetailV2", ["terrasoft", "ViewUtilities", "EntityConnectionsDetailV2Resources",
		"EntityConnectionViewModel", "ConfigurationItemGenerator", "BaseDetailV2"],
	function(Terrasoft, ViewUtilities) {
		return {
			attributes: {

				/**
				 * Признак "данные загружены".
				 */
				IsDataLoaded: {
					dataValueType: Terrasoft.DataValueType.BOOLEAN
				},

				/**
				 * Информация об объекте для построения блока связей.
				 */
				EntityInfo: {
					dataValueType: Terrasoft.DataValueType.CUSTOM_OBJECT
				},

				/**
				 * Информация о детали. Содержит имя схемы и колонки фильтрации.
				 */
				DetailInfo: {
					dataValueType: Terrasoft.DataValueType.CUSTOM_OBJECT
				},

				/**
				 * Массив идентификаторов клонок-связей с объектом.
				 */
				LinkColumnsUId: {
					dataValueType: Terrasoft.DataValueType.CUSTOM_OBJECT
				},

				/**
				 * Направления сортировки полей по заголовку.
				 * @type {Terrasoft.OrderDirection} [SortDirection=Terrasoft.OrderDirection.ASC]
				 */
				SortDirection: Terrasoft.OrderDirection.ASC

			},
			messages: {

				/**
				 * @message GetEntityInfo
				 * Получает информацию о объекте для которого необходимо отобразить поля связи.
				 */
				"GetEntityInfo": {
					mode: Terrasoft.MessageMode.PTP,
					direction: Terrasoft.MessageDirectionType.PUBLISH
				},

				/**
				 * @message EntityInitialized
				 * Наступает при инициализации целевого объекта. Служит для начала загрузки данных о колонках связи.
				 */
				"EntityInitialized": {
					mode: Terrasoft.MessageMode.BROADCAST,
					direction: Terrasoft.MessageDirectionType.SUBSCRIBE
				},

				/**
				 * @message GetColumnsValues
				 * Запрашивает у целевого объекта значения переданных колонок.
				 */
				"GetColumnsValues": {
					mode: Terrasoft.MessageMode.PTP,
					direction: Terrasoft.MessageDirectionType.PUBLISH
				},

				/**
				 * @message LookupInfo
				 * Для работы LookupUtilities. Получение настроек лукапа.
				 */
				"LookupInfo": {
					mode: Terrasoft.MessageMode.PTP,
					direction: Terrasoft.MessageDirectionType.SUBSCRIBE
				},

				/**
				 * @message ResultSelectedRows
				 * Для работы LookupUtilities. Возврата данных от лукапа.
				 */
				"ResultSelectedRows": {
					mode: Terrasoft.MessageMode.PTP,
					direction: Terrasoft.MessageDirectionType.SUBSCRIBE
				},

				/**
				 * @message UpdateCardProperty
				 * Устанавливает атрибуты страницы редактирования.
				 */
				"UpdateCardProperty": {
					mode: Terrasoft.MessageMode.PTP,
					direction: Terrasoft.MessageDirectionType.PUBLISH
				},

				/**
				 * @message GetLookupQueryFilters
				 * Получает фильтры справочной колонки.
				 */
				"GetLookupQueryFilters": {
					mode: Terrasoft.MessageMode.PTP,
					direction: Terrasoft.MessageDirectionType.PUBLISH
				},

				/**
				 * @message GetLookupListConfig
				 * Получает информацию о настройках справочной колонки.
				 */
				"GetLookupListConfig": {
					mode: Terrasoft.MessageMode.PTP,
					direction: Terrasoft.MessageDirectionType.PUBLISH
				},

				/**
				 * @message EntityColumnChanged
				 * Реагирует на изменение значения колонки объекта карточки.
				 */
				"EntityColumnChanged": {
					mode: Terrasoft.MessageMode.PTP,
					direction: Terrasoft.MessageDirectionType.SUBSCRIBE
				},

				/**
				 * @message GetLookupValuePairs
				 * Возвращает информацию о значениях по умолчанию, передаваемых в новую запись справочной колонки.
				 */
				"GetLookupValuePairs": {
					mode: Terrasoft.MessageMode.PTP,
					direction: Terrasoft.MessageDirectionType.PUBLISH
				}

			},
			methods: {

				/**
				 * Формирует конфигурацию представления элемента связи объекта.
				 * @param {Object} itemConfig Ссылка на конфигурацию элемента в ContainerList.
				 */
				getItemViewConfig: function(itemConfig) {
					var itemViewConfig = this.get("ItemViewConfig");
					if (itemViewConfig) {
						itemConfig.config = itemViewConfig;
						return;
					}
					var config = ViewUtilities.getContainerConfig("item-view",
						["detail-edit-container-user-class", "control-width-15"]);
					var labelConfig = {
						id: "labelContainer",
						className: "Terrasoft.Container",
						classes: {
							wrapClassName: ["label-wrap"]
						},
						items: [
							{
								id: "label",
								className: "Terrasoft.Label",
								caption: {
									bindTo: "Caption"
								},
								markerValue: {
									bindTo: "MarkerValue"
								},
								classes: {
									labelClass: []
								}
							}
						]
					};
					var editConfig = {
						id: "editContainer",
						className: "Terrasoft.Container",
						classes: {
							wrapClassName: ["control-wrap"]
						},
						items: [
							{
								id: "edit",
								className: "Terrasoft.LookupEdit",
								list: {
									bindTo: "ValuesList"
								},
								value: {
									bindTo: "Value"
								},
								markerValue: {
									bindTo: "MarkerValue"
								},
								loadVocabulary: {
									bindTo: "loadVocabulary"
								},
								change: {
									bindTo: "onLookupChange"
								},
								href: { bindTo: "getHref" },
								linkclick: { bindTo: "onLinkClick" },
								showValueAsLink: true,
								hasClearIcon: true
							}
						]
					};
					config.items.push(labelConfig, editConfig);
					itemConfig.config = config;
					this.set("ItemViewConfig", config);
				},

				/**
				 * Загружает список колонок связи объекта.
				 * @private
				 * @param {Function} callback callback-функция.
				 * @param {Terrasoft.BaseSchemaViewModel} scope Контекст выполнения callback-функции.
				 */
				loadContainerListData: function(callback, scope) {
					if (this.get("IsDetailCollapsed")) {
						callback.call(scope);
						return;
					}
					var entityInfo = this.get("EntityInfo");
					var detailInfo = this.get("DetailInfo");
					var entitySchemaUId = entityInfo.entitySchemaUId;
					var collection = this.get("Collection");
					collection.clear();
					var select = this.Ext.create("Terrasoft.EntitySchemaQuery", {
						rootSchemaName: detailInfo.entitySchemaName,
						rowViewModelClassName: "Terrasoft.EntityConnectionViewModel",
						serverESQCacheParameters: {
							cacheLevel: Terrasoft.ESQServerCacheLevels.SESSION,
							cacheGroup: this.name,
							cacheItemName: entitySchemaUId
						}
					});
					select.addColumn("Id");
					select.addColumn("SysEntitySchemaUId");
					select.addColumn("ColumnUId");
					var entitySchemaFilter = Terrasoft.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL,
						"SysEntitySchemaUId", entitySchemaUId);
					select.filters.addItem(entitySchemaFilter);
					select.getEntityCollection(function(response) {
						if (response.success) {
							var entityCollection = response.collection;
							var linkColumnsUId = [];
							entityCollection.each(function(item) {
								item.sandbox = this.sandbox;// todo: хак для ContainerList
								item.Ext = this.Ext;
								item.Terrasoft = this.Terrasoft;
								var columnUId = item.get("ColumnUId");
								linkColumnsUId.push(columnUId);
								item.set("ValuesList", this.Ext.create("Terrasoft.Collection"));
								item.trackCardChanges(columnUId);
							}, this);
							this.set("LinkColumnsUId", linkColumnsUId);
							this.loadColumnValues(entityCollection);
							var sortDirection = this.get("SortDirection");
							entityCollection.sort(null, sortDirection, this.sortByCaptionAlphabetical);
							collection.loadAll(entityCollection);
							this.set("IsDataLoaded", true);
						}
						callback.call(scope);
					}, this);
				},

				/**
				 * Сравнивает поля детали по заголовку.
				 * Используется при сортировке.
				 * @param {Terrasoft.BaseViewModel} item1
				 * @param {Terrasoft.BaseViewModel} item2
				 * @return {Boolean}
				 */
				sortByCaptionAlphabetical: function(item1, item2) {
					var caption1 = item1.get("Caption");
					var caption2 = item2.get("Caption");
					return caption1.localeCompare(caption2);
				},

				/**
				 * Загружает данные в модели представления колонок связи объекта.
				 * @private
				 * @param {Terrasoft.BaseViewModelCollection} inputCollection (optional)
				 * Коллекция для наполнения данными.
				 */
				loadColumnValues: function(inputCollection) {
					var collection = inputCollection || this.get("Collection");
					var columnValues = this.getColumnValues();
					collection.each(function(item) {
						var columnUId = item.get("ColumnUId");
						var columnInfo = columnValues[columnUId];
						var columnValue = columnInfo.columnValue;
						item.set("Value", columnValue);
						var column = columnInfo.column;
						item.set("Caption", column.caption);
						item.set("ReferenceSchema", column.referenceSchema);
						item.set("ColumnName", column.name);
						var markerStr = this.Ext.String.format("{0} {1}", column.name, column.caption);
						item.set("MarkerValue", markerStr);
					}, this);
				},

				/**
				 * Получает значения клонок целевого объекта. Карточка объекта должна быть подписана на
				 * соответствующее сообщение.
				 * @private
				 * @return {Object} Значения колонок объекта.
				 */
				getColumnValues: function() {
					var sandbox = this.sandbox;
					var linkColumnsUId = this.get("LinkColumnsUId");
					return sandbox.publish("GetColumnsValues", linkColumnsUId, [sandbox.id]);
				},

				/**
				 * inheritdoc Terrasoft.BaseDetailV2#subscribeSandboxEvents
				 * @protected
				 * @overridden
				 */
				subscribeSandboxEvents: function() {
					this.callParent(arguments);
					var sandbox = this.sandbox;
					var messageTags = [sandbox.id];
					sandbox.subscribe("EntityInitialized", this.onEntityInitialized, this, messageTags);
				},

				/**
				 * Обработчик события иницализации объекта.
				 * @param {Object} entityInfo Информация о объекте. Имя, заголовок и первичные колонки.
				 * @private
				 */
				onEntityInitialized: function(entityInfo) {
					this.set("EntityInfo", entityInfo);
					if (this.get("IsDataLoaded")) {
						this.loadColumnValues();
					} else {
						this.loadContainerListData(this.Terrasoft.emptyFn);
					}
				},

				/**
				 * Инцициализация детали.
				 * @protected
				 * @overridden
				 * @param {Function} callback callback-функция.
				 * @param {Terrasoft.BaseSchemaViewModel} scope Контекст выполнения callback-функции.
				 */
				init: function(callback, scope) {
					this.callParent([function() {
						var sandbox = this.sandbox;
						var messageTags = [sandbox.id];
						var entityInfo = sandbox.publish("GetEntityInfo", null, messageTags);
						var detailInfo = this.getDetailInfo();
						this.set("EntityInfo", entityInfo);
						this.set("DetailInfo", detailInfo);
						this.onDetailCollapsedChanged(false);
						callback.call(scope);
					}, this]);
				},

				/**
				 * Обработчик развертывания и свертывания детали.
				 * @protected
				 * @param {Boolean} isCollapsed Свернута ли деталь.
				 */
				onDetailCollapsedChanged: function(isCollapsed) {
					this.callParent(arguments);
					if (!isCollapsed && !this.get("IsDataLoaded")) {
						this.loadContainerListData(this.Terrasoft.emptyFn);
					}
				}

			},
			diff: /**SCHEMA_DIFF*/[
				{
					"operation": "merge",
					"name": "Detail",
					"values": {
						caption: {bindTo: "Resources.Strings.Caption"}
					}
				},
				{
					"operation": "insert",
					"name": "CommunicationsContainer",
					"parentName": "Detail",
					"propertyName": "items",
					"values": {
						generator: "ConfigurationItemGenerator.generateContainerList",
						idProperty: "Id",
						collection: "Collection",
						observableRowNumber: 10,
						onGetItemConfig: "getItemViewConfig"
					}
				},
				{
					"operation": "insert",
					"name": "AddButton",
					"parentName": "Detail",
					"propertyName": "tools",
					"values": {
						visible: {bindTo: "getToolsVisible"},
						itemType: Terrasoft.ViewItemType.BUTTON,
						caption: {bindTo: "Resources.Strings.AddButtonCaption"},
						controlConfig: {
							menu: {
								items: {bindTo: "ToolsMenuItems"}
							}
						}
					}
				}
			]/**SCHEMA_DIFF*/
		};
	});
