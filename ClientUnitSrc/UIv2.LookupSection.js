define("LookupSection", ["ConfigurationEnums", "LookupSectionGridRowViewModel"],
function(ConfigurationEnums) {

	return {
		entitySchemaName: "Lookup",
		messages: {

			/**
			 * @message GetExtendedFilterConfig
			 * Генерирует настройки быстрых фильтров.
			 */
			"GetExtendedFilterConfig": {
				mode: Terrasoft.MessageMode.PTP,
				direction: Terrasoft.MessageDirectionType.SUBSCRIBE
			}
		},
		attributes: {
			/**
			 * Название операции доступ на которую должен быть у пользователя для использования секции
			 */
			SecurityOperationName: {
				dataValueType: Terrasoft.DataValueType.STRING,
				value: "CanManageLookups"
			},

			/**
			 * Уникальный идентификатор контекстной справки.
			 */
			ContextHelpId: {
				dataValueType: Terrasoft.DataValueType.STRING,
				value: "271"
			}
		},
		methods: {

			/**
			 * @inheritdoc Terrasoft.BaseSectionV2#init
			 * @overridden
			 */
			init: function() {
				this.callParent(arguments);
				this.set("UseTagModule", false);
				this.set("UseStaticFolders", true);
				this.set("TagButtonVisible", false);
			},

			/**
			 * @inheritdoc Terrasoft.BaseSectionV2#onRender
			 * @overridden
			 */
			onRender: function() {
				var restored = this.get("Restored");
				var historyStateInfo = this.getHistoryStateInfo();
				if (!restored && historyStateInfo.workAreaMode !== ConfigurationEnums.WorkAreaMode.COMBINED) {
					this.showFolderTree();
				}
				this.set("IgnoreFilterUpdate", false);
				this.callParent(arguments);
			},

			/**
			 * Открывает раздел справочника в цепочке.
			 * @protected
			 * @virtual
			 * @param {Object} config Конфигурация открывающегося модуля.
			 */
			openSectionInChain: function(config) {
				this.showBodyMask();
				this.set("IgnoreFilterUpdate", true);
				this.saveCardScroll();
				this.scrollCardTop();
				var schemaName = config.schemaName || "BaseLookupConfigurationSection";
				var newHash = Terrasoft.combinePath("LookupSectionModule", schemaName);
				this.sandbox.publish("PushHistoryState", {
					hash: newHash,
					silent: true,
					stateObj: {
						caption: config.caption,
						entitySchemaName: config.entitySchemaName
					}
				});
				this.sandbox.loadModule("LookupSectionModule", {
					renderTo: this.renderTo,
					id: config.moduleId,
					keepAlive: true
				});
			},

			/**
			 * Открывает наполение справочника в старом интерфейсе.
			 * @protected
			 * @virtual
			 * @param {String} sysLookup Уникальный идентификатор справочника в старом интерфейсе.
			 */
			openOldLookupConfiguration: function(sysLookup) {
				var sysLookupValue = (sysLookup && sysLookup.value) || sysLookup;
				var entitySchemaQuery = Ext.create("Terrasoft.EntitySchemaQuery", {rootSchemaName: "SysLookup"});
				entitySchemaQuery.addColumn("Id");
				entitySchemaQuery.addColumn("SysEditPageSchemaUId");
				entitySchemaQuery.addColumn("SysEntitySchemaUId");
				entitySchemaQuery.addColumn("SysGridPageSchemaUId");
				entitySchemaQuery.getEntity(sysLookupValue, function(result) {
					if (result.success) {
						var entity = result.entity;
						var sysGridPageSchemaUId = entity.get("SysGridPageSchemaUId");
						var parameters = {
							editMode: "true"
						};
						if (!Ext.isEmpty(sysGridPageSchemaUId)) {
							Ext.apply(parameters, {Id: sysGridPageSchemaUId});
						} else {
							var sysEditPageSchemaUId = entity.get("SysEntitySchemaUId");
							Ext.apply(parameters, {
								Id: "33cc4a3a-babb-464d-82a0-1b904d198d31",
								schemaUId: sysEditPageSchemaUId
							});
						}
						var parameterString = [];
						Terrasoft.each(parameters, function(parameterValue, parameterName) {
							parameterString.push(Ext.String.format("{0}={1}", parameterName, parameterValue));
						}, this);
						var url = this.Terrasoft.workspaceBaseUrl + "/ViewPage.aspx?" + parameterString.join("&");
						var width = 600;
						var height = 400;
						var left = screen.availLeft + (screen.availWidth - width) / 2;
						var top = screen.availTop + (screen.availHeight - height) / 2;
						var windowParams = Ext.String.format("resizable,width={0},height={1},left={2},top={3}",
							width, height, left, top);
						window.open(url, "_blank", windowParams);
					}
				}, this);
			},

			/**
			 * Открывает страницу редактирования записи
			 * @protected
			 * @param {String} primaryColumnValue Уникальный идентификатор записи
			 */
			editRecord: function(primaryColumnValue) {
				var gridData = this.getGridData();
				var activeRow = gridData.get(primaryColumnValue);
				var sysLookup = activeRow.get("SysLookup");
				if (sysLookup) {
					this.openOldLookupConfiguration(sysLookup);
					return;
				}
				var entitySchemaName = activeRow.get("EntitySchemaName");
				if (!entitySchemaName) {
					this.log("cann't find entity");
					return;
				}
				var schemaName = activeRow.get("PageSchemaName");
				var caption = activeRow.get("Name");
				var config = {
					caption: caption,
					entitySchemaName: entitySchemaName,
					schemaName: schemaName,
					moduleId: this.sandbox.id + "_BaseLookupConfigurationSection"
				};
				this.openSectionInChain(config);
			},

			/**
			 * @inheritodoc BaseSectionV2#onActiveRowAction
			 * @overridden
			 */
			onActiveRowAction: function(buttonTag, primaryColumnValue) {
				switch (buttonTag) {
					case "openConfiguration":
						this.openConfiguration(primaryColumnValue);
						break;
					default:
						this.callParent(arguments);
						break;
				}
			},

			/**
			 * @inheritodoc BaseSectionV2#getGridRowViewModelClassName
			 * @overridden
			 */
			getGridRowViewModelClassName: function() {
				return "Terrasoft.LookupSectionGridRowViewModel";
			},

			/**
			 * @inheritodoc BaseSectionV2#getDefaultDataViews
			 * @overridden
			 */
			getDefaultDataViews: function() {
				var dataViews = this.callParent(arguments);
				delete dataViews.AnalyticsDataView;
				return dataViews;
			},

			/**
			 * Добавляет в запрос колонку имени схемы.
			 * @protected
			 * @virtual
			 * @param {Terrasoft.EntitySchemaQuery} esq Объект запроса.
			 * @param {String} columnPath Путь к колонке.
			 * @param {String} columnAlias Псевдоним колонки.
			 */
			addSchemaNameColumn: function(esq, columnPath, columnAlias) {
				var expressionConfig = {
					columnPath: columnPath,
					parentCollection: this,
					aggregationType: Terrasoft.AggregationType.NONE
				};
				var column = Ext.create("Terrasoft.SubQueryExpression", expressionConfig);
				var filter = Terrasoft.createColumnFilterWithParameter(
					Terrasoft.ComparisonType.EQUAL,
					"SysWorkspace",
					Terrasoft.SysValue.CURRENT_WORKSPACE.value
				);
				column.subFilters.addItem(filter);
				var esqColumn = esq.addColumn(columnAlias);
				esqColumn.expression = column;
			},

			/**
			 * @inheritdoc Terrasoft.GridUtilitiesV2#initQueryColumns
			 * @overridden
			 */
			initQueryColumns: function(esq) {
				this.callParent(arguments);
				this.addSchemaNameColumn(esq, "[VwSysSchemaInfo:UId:SysEntitySchemaUId].Name", "EntitySchemaName");
				this.addSchemaNameColumn(esq, "[VwSysSchemaInfo:UId:SysPageSchemaUId].Name", "PageSchemaName");
				esq.addColumn("SysLookup");
			},

			/**
			 * Открывает страницу настройки справочника.
			 * @protected
			 * @virtual
			 * @param {String} primaryColumnValue Уникальный идентификатор редактируемой записи.
			 */
			openConfiguration: function(primaryColumnValue) {
				var activeRow = this.getActiveRow();
				var typeColumnValue = this.getTypeColumnValue(activeRow);
				var schemaName = this.getEditPageSchemaName(typeColumnValue);
				this.set("ShowCloseButton", true);
				this.openCard(schemaName, ConfigurationEnums.CardStateV2.EDIT, primaryColumnValue);
			},

			/**
			 * @inheritodoc BaseSectionV2#initFilters
			 * @overridden
			 */
			initFilters: function() {
				var sandbox = this.sandbox;
				var quickFilterModuleId = this.getQuickFilterModuleId();
				sandbox.subscribe("GetExtendedFilterConfig", function() {
					var foldersVisible = this.get("IsFolderManagerActionsContainerVisible");
					return {
						isExtendedModeHidden: foldersVisible,
						isFoldersHidden: !foldersVisible
					};
				}, this, [quickFilterModuleId]);
				this.callParent(arguments);
			}

		},
		diff: /**SCHEMA_DIFF*/[
			{
				"operation": "insert",
				"name": "DataGridActiveRowOpenConfigurationAction",
				"parentName": "DataGrid",
				"propertyName": "activeRowActions",
				"index": 1,
				"values": {
					"className": "Terrasoft.Button",
					"style": Terrasoft.controls.ButtonEnums.style.GREY,
					"caption": {"bindTo": "Resources.Strings.OpenConfigurationButtonCaption"},
					"tag": "openConfiguration"
				}
			},
			{
				"operation": "remove",
				"name": "DataGridActiveRowCopyAction"
			},
			{
				"operation": "merge",
				"name": "CombinedModeActionsButton",
				"values": {
					"visible": false
				}
			}
		]/**SCHEMA_DIFF*/
	};
});
