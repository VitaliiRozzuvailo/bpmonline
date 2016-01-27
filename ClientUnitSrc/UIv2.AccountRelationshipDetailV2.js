define("AccountRelationshipDetailV2", ["ConfigurationDiagramGenerator", "RelationshipDiagramViewModel",
	"RelationshipDiagram", "LookupQuickAddMixin", "css!AccountRelationshipDetailCss"
], function() {

	var relationshipMode = {
		Datagrid: "datagrid",
		Relationship: "relationship"
	};

	return {
		entitySchemaName: "VwAccountRelationship",
		mixins: {
			RelationshipDiagramViewModel: "Terrasoft.RelationshipDiagramViewModel",
			LookupQuickAddMixin: "Terrasoft.LookupQuickAddMixin"
		},
		messages: {
			/**
			 * @message UpdateRelationshipDiagram
			 * Перезагружает диаграмму взаимосвязей.
			 */
			"UpdateRelationshipDiagram": {
				mode: Terrasoft.MessageMode.PTP,
				direction: Terrasoft.MessageDirectionType.SUBSCRIBE
			}
		},
		methods: {

			/**
			 * Устанавливает режим отображения взаимосвязей.
			 * @protected
			 */
			initMode: function() {
				var profile = this.getProfile();
				var mode = !this.Ext.isEmpty(profile.Mode) ? profile.Mode : this.setDefaultMode();
				if (mode) {
					this.changeDetailMode(mode);
				}
			},

			/**
			 * @inheritdoc Terrasoft.BaseViewModel#onLookupDataLoaded
			 * @overridden
			 */
			onLookupDataLoaded: function(config) {
				this.callParent(arguments);
				var isComplicatedFiltersExists = false;
				var cacheObject = {
					filters: new Terrasoft.Collection(),
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
			 * @inheritdoc Terrasoft.BaseSchemaViewModel#onLookupChange
			 * @overridden
			 */
			onLookupChange: function(newValue, columnName) {
				this.callParent(arguments);
				this.mixins.LookupQuickAddMixin.onLookupChange.call(this, newValue, columnName);
				this.mixins.RelationshipDiagramViewModel.onLookupChange.call(this, newValue, columnName);
			},

			/**
			 * @inheritdoc Terrasoft.BaseViewModel#getLookupQuery
			 * @overridden
			 */
			getLookupQuery: function(filterValue, columnName) {
				var esq = this.callParent(arguments);
				var lookupColumn = this.columns[columnName];
				var lookupListConfig = lookupColumn.lookupListConfig;
				if (!lookupListConfig) {
					return esq;
				}
				this.Terrasoft.each(lookupListConfig.columns, function(column) {
					if (!esq.columns.contains(column)) {
						esq.addColumn(column);
					}
				}, this);
				var filterGroup = this.getLookupQueryFilters(columnName);
				esq.filters.addItem(filterGroup);
				var columns = esq.columns;
				if (lookupListConfig.orders) {
					var orders = lookupListConfig.orders;
					this.Terrasoft.each(orders, function(order) {
						var orderColumnPath = order.columnPath;
						if (!columns.contains(orderColumnPath)) {
							esq.addColumn(orderColumnPath);
						}
						var sortedColumn = columns.get(orderColumnPath);
						var direction = order.direction;
						sortedColumn.orderDirection = direction ? direction : this.Terrasoft.OrderDirection.ASC;
						var position = order.position;
						sortedColumn.orderPosition = position ? position : 1;
						this.shiftColumnsOrderPosition(columns, sortedColumn);
					}, this);
				}
				return esq;
			},

			/**
			 * Формирует фильтры, которые накладываются на справочные поля.
			 * @protected
			 * @param {String} columnName Название колонки.
			 * @return {Terrasoft.FilterGroup} Возвращает группу фильтров.
			 */
			getLookupQueryFilters: function(columnName) {
				var filterGroup = this.Ext.create("Terrasoft.FilterGroup");
				var column = this.columns[columnName];
				var lookupListConfig = column.lookupListConfig;
				if (lookupListConfig) {
					var filterArray = lookupListConfig.filters;
					this.Terrasoft.each(filterArray, function(item) {
						var filter;
						if (this.Ext.isObject(item) && this.Ext.isFunction(item.method)) {
							filter = item.method.call(this, item.argument);
						}
						if (this.Ext.isFunction(item)) {
							filter = item.call(this);
						}
						if (this.Ext.isEmpty(filter)) {
							throw new this.Terrasoft.InvalidFormatException({
								message: this.Ext.String.format(
									this.get("Resources.Strings.ColumnFilterInvalidFormatException"), columnName)
							});
						}
						filterGroup.addItem(filter);
					}, this);
					if (lookupListConfig.filter) {
						var filterItem = lookupListConfig.filter.call(this);
						if (filterItem) {
							filterGroup.addItem(filterItem);
						}
					}
				}
				return filterGroup;
			},

			/**
			 * Коллекция названий объектов для которых нужно добавлять объект
			 * без открытия карточки даже если на поле наложены фильтры.
			 * @protected
			 * @return {Array} Коллекция названий объектов.
			 */
			getForceAddSchemaNames: function() {
				return ["Account"];
			},

			/**
			* Генерирует идентификатор модуля страницы
			* @protected
			* @return {String} Возвращает идентификатор модуля страницы
			*/
			getCardModuleSandboxId: function() {
				return this.sandbox.id + "_CardModuleV2";
			},

			/**
			 * @inheritdoc Terrasoft.BaseDetailV2#initData
			 * @overridden
			 */
			initData: function(callback, scope) {
				this.callParent([
					function() {
						this.mixins.RelationshipDiagramViewModel.init.call(this);
						callback.call(scope);
						this.initMode();
					},
					this
				]);
			},

			/**
			 * @inheritdoc Terrasoft.BaseDetailV2#subscribeSandboxEvents
			 * @overridden
			 */
			subscribeSandboxEvents: function() {
				this.callParent(arguments);
				this.sandbox.subscribe("UpdateRelationshipDiagram", function() {
					if (!this.get("IsDetailCollapsed") && this.get("Mode") === relationshipMode.Relationship) {
						this.loadRelationship();
					}
				}, this, [this.getCardModuleSandboxId()]);
			},

			/**
			 * @inheritdoc Terrasoft.GridUtilitiesV2#loadGridData
			 * @overridden
			 */
			loadGridData: function() {
				if (this.get("Mode") === relationshipMode.Datagrid) {
					this.callParent(arguments);
				}
			},

			/**
			 * @inheritdoc Terrasoft.BaseDetailV2#updateDetail
			 * @overridden
			 */
			updateDetail: function() {
				this.callParent(arguments);
				if (!this.get("IsDetailCollapsed") && this.get("Mode") === relationshipMode.Relationship) {
					this.loadRelationship();
				}
			},

			/**
			 * @inheritdoc Terrasoft.BaseDetailV2#onDetailCollapsedChanged
			 * @overridden
			 */
			onDetailCollapsedChanged: function(isCollapsed) {
				this.callParent(arguments);
				if (!isCollapsed && this.get("Mode") === relationshipMode.Relationship) {
					this.loadRelationship();
				}
			},

			/**
			 * @inheritdoc Terrasoft.BaseDetailV2#getToolsVisible
			 * @overridden
			 */
			getToolsVisible: function() {
				return (this.callParent(arguments) && this.getDataGridVisible());
			},

			/**
			 * Возвращает значение отображения кнопок режимов.
			 * @protected
			 * @return {Boolean} Значение отображения кнопок режимов.
			 */
			getModeButtonsVisible: function() {
				return !this.get("IsDetailCollapsed");
			},

			/**
			 * Возвращает значение отображения модуля взаимосвязей.
			 * @protected
			 * @return {Boolean} Значение отображения модуля взаимосвязей.
			 */
			getRelationshipDataVisible: function() {
				return (this.get("Mode") === relationshipMode.Relationship);
			},

			/**
			 * Возвращает значение отображения реестра детали.
			 * @protected
			 * @return {Boolean} Значение отображения реестра детали.
			 */
			getDataGridVisible: function() {
				return (this.get("Mode") === relationshipMode.Datagrid);
			},

			/**
			 * Возвращает значение нажатия кнопки режима диаграммы.
			 * @protected
			 * @return {Boolean} Значение нажатия кнопки режима диаграммы.
			 */
			getRelationshipButtonPressed: function() {
				return (this.get("Mode") === relationshipMode.Relationship);
			},

			/**
			 * Возвращает значение нажатия кнопки режима списка.
			 * @protected
			 * @return {Boolean} Значение нажатия кнопки режима списка.
			 */
			getDataGridButtonPressed: function() {
				return (this.get("Mode") === relationshipMode.Datagrid);
			},

			/**
			 * Сохраняет текущий режим отображения в профиль.
			 * @protected
			 */
			saveModeToProfile: function() {
				var profile = this.getProfile();
				var key = this.getProfileKey();
				if (profile && key) {
					profile.Mode = this.get("Mode");
					this.set(this.getProfileColumnName(), profile);
					this.Terrasoft.utils.saveUserProfile(key, profile, false);
				}
			},

			/**
			 * Изменяет режим детали.
			 * @protected
			 * @param {String} mode Новый режим.
			 */
			changeDetailMode: function(mode) {
				if (mode === this.get("Mode")) {
					return;
				}
				var isDataGridMode = (mode === relationshipMode.Datagrid);
				this.set("Mode", mode);
				this.saveModeToProfile();
				this.deselectRows();
				if (isDataGridMode) {
					this.reloadGridData();
				} else if (!this.get("IsDetailCollapsed")) {
					this.loadRelationship();
				}
			},

			/**
			 * Устанавливает режим отображения модуля взаимосвязей.
			 * @protected
			 */
			setRelationshipMode: function() {
				this.changeDetailMode(relationshipMode.Relationship);
			},

			/**
			 * Устанавливает режим реестра.
			 * @protected
			 */
			setDataGridMode: function() {
				this.changeDetailMode(relationshipMode.Datagrid);
			},

			/**
			 * Устанавливает режим по умолчанию.
			 * @protected
			 */
			setDefaultMode: function() {
				this.setRelationshipMode();
			},

			/**
			 * Возвращает значение маркера.
			 * @protected
			 * @param {String} mode Режим.
			 * @return {String} Значение маркера.
			 */
			getDetailMarkerValue: function(mode) {
				var caption = this.get("Resources.Strings.Caption");
				return this.Ext.String.format("{0} {1}", caption, mode);
			}
		},

		diff: /**SCHEMA_DIFF*/ [{
			"operation": "merge",
			"name": "Detail",
			"values": {
				"classes": {
					"wrapClass": ["account-relationship", "detail"]
				},
				"markerValue": {
					"bindTo": "Mode",
					"bindConfig": {
						"converter": "getDetailMarkerValue"
					}
				}
			}
		}, {
			"operation": "merge",
			"name": "DataGrid",
			"values": {
				"visible": {
					"bindTo": "getDataGridVisible"
				}
			}
		}, {
			"operation": "insert",
			"name": "RelationshipDataContainer",
			"parentName": "Detail",
			"propertyName": "items",
			"values": {
				"id": "RelationshipDataContainer",
				"itemType": Terrasoft.ViewItemType.CONTAINER,
				"visible": {
					"bindTo": "getRelationshipDataVisible"
				},
				"items": []
			}
		}, {
			"operation": "insert",
			"name": "RelationshipDiagram",
			"parentName": "RelationshipDataContainer",
			"propertyName": "items",
			"values": {
				generator: "ConfigurationDiagramGenerator.generateDiagram",
				className: "Terrasoft.RelationshipDiagram",
				items: "Nodes"
			}
		}, {
			"operation": "insert",
			"name": "RelationshipModeButton",
			"parentName": "Detail",
			"propertyName": "tools",
			"values": {
				"itemType": this.Terrasoft.ViewItemType.BUTTON,
				"click": {
					"bindTo": "setRelationshipMode"
				},
				"visible": {
					"bindTo": "getModeButtonsVisible"
				},
				"pressed": {
					"bindTo": "getRelationshipButtonPressed"
				},
				"classes": {
					"wrapperClass": ["relationship-mode-button"],
					"pressedClass": ["mode-button-pressed"]
				},
				"controlConfig": {
					"imageConfig": {
						"bindTo": "Resources.Images.RelationshipViewIcon"
					}
				},
				"markerValue": relationshipMode.Relationship
			}
		}, {
			"operation": "insert",
			"name": "DataGridModeButton",
			"parentName": "Detail",
			"propertyName": "tools",
			"values": {
				"itemType": this.Terrasoft.ViewItemType.BUTTON,
				"click": {
					"bindTo": "setDataGridMode"
				},
				"visible": {
					"bindTo": "getModeButtonsVisible"
				},
				"pressed": {
					"bindTo": "getDataGridButtonPressed"
				},
				"classes": {
					"wrapperClass": ["datagrid-mode-button", "disable-left-margin"],
					"pressedClass": ["mode-button-pressed"]
				},
				"controlConfig": {
					"imageConfig": {
						"bindTo": "Resources.Images.DataGridViewIcon"
					}
				},
				"markerValue": relationshipMode.Datagrid
			}
		}] /**SCHEMA_DIFF*/
	};
});
