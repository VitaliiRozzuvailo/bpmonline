define("SysSettingsSection", ["ConfigurationEnums"], function(ConfigurationEnums) {

	return {
		entitySchemaName: "VwSysSetting",
		messages: {
			"GetModuleSchema": {
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
				value: "CanManageAdministration"
			},

			/**
			 * Уникальный идентификатор контекстной справки.
			 */
			ContextHelpId: {
				dataValueType: Terrasoft.DataValueType.STRING,
				value: "269"
			}
		},
		methods: {

			/**
			 * @inheritdoc Terrasoft.BaseSectionV2#init
			 * @overridden
			 */
			init: function() {
				this.callParent(arguments);
				this.set("UseStaticFolders", true);
			},

			/**
			 * @inheritdoc Terrasoft.BaseSchemaViewModel#getModuleStructure
			 * @protected
			 * @overridden
			 */
			getModuleStructure: function() {
				return {
					"moduleCaption": this.get("Resources.Strings.SectionCaption"),
					"entitySchemaName": "VwSysSetting"
				};
			},

			/**
			 * @inheritdoc Terrasoft.BaseSchemaViewModel#getEntityStructure
			 * @protected
			 * @overridden
			 */
			getEntityStructure: function() {
				return {
					"pages": [{
						"cardSchema": "SysSettingPage",
						"caption": this.get("Resources.Strings.AddButtonCaption")
					}]
				};
			},

			/**
			 * Блокируем добавление элемента меню для вызова дизайнера раздела.
			 * @inheritdoc Terrasoft.BaseSchemaViewModel#addSectionDesignerViewOptions
			 * @protected
			 * @overridden
			 */
			addSectionDesignerViewOptions: Terrasoft.emptyFn,

			/**
			 * Генерирует запрос на выборку вхождение записей в группы.
			 * @protected
			 * @overridden
			 * @param {String[]} folders Массив уникальных идентификаторов групп.
			 * @param {String[]} records Массив уникальных идентификаторов записей.
			 * @return {Terrasoft.EntitySchemaQuery} Запрос на выборку вхождение записей в группы.
			 */
			createRecordsInFoldersSelectQuery: function(folders, records) {
				var select = this.Ext.create("Terrasoft.EntitySchemaQuery", {
					rootSchemaName: this.getInFolderEntityName()
				});
				var folderId = select.addColumn(this.folderColumnName, "Folder");
				var recordId = select.addColumn("[VwSysSetting:Id:SysSettings].Id", "Entity");
				select.filters.add("recordsFilter", Terrasoft.createColumnInFilterWithParameters(
					recordId.columnPath, records));
				select.filters.add("foldersFilter", Terrasoft.createColumnInFilterWithParameters(
					folderId.columnPath, folders));
				return select;
			},

			/**
			 * Генерирует название поля сущности раздела в сущности развязки объекта с группами.
			 * @protected
			 * @overridden
			 * @return {String} Название колонки.
			 */
			getEntityColumnNameInFolderEntity: function() {
				return "SysSettings";
			},

			/**
			 * Возвращает имя схемы груп для текущей сущности.
			 * @protected
			 * @overridden
			 * @return {String} Имя схемы груп.
			 */
			getFolderEntityName: function() {
				return "SysSettingsFolder";
			},

			/**
			 * Возвращает имя схемы развязки статических груп для текущей сущности.
			 * @protected
			 * @overridden
			 * @return {String} Имя схемы развязки статических груп.
			 */
			getInFolderEntityName: function() {
				return "SysSettingsInFolder";
			},

			/**
			 * Выполняет удаление при подтверждении удаления.
			 * @protected
			 * @overridden
			 */
			onDeleteAccept: function() {
				this.showBodyMask();
				var selectedItems = this.getSelectedItems();
				var request = Ext.create("Terrasoft.DeleteSysSettingRequest", {primaryColumnValues: selectedItems});
				request.execute(function(response) {
					this.hideBodyMask();
					if (response && response.success) {
						this.removeGridRecords(selectedItems);
					} else {
						this.showInformationDialog(response.errorInfo.message);
					}
					this.hideBodyMask();
					this.onDeleted(response);
				}, this);
			},

			/**
			 * @inheritodoc BaseSectionV2#getDefaultDataViews
			 * @protected
			 * @overridden
			 */
			getDefaultDataViews: function() {
				var dataViews = this.callParent(arguments);
				delete dataViews.AnalyticsDataView;
				return dataViews;
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
			}
		},

		diff: /**SCHEMA_DIFF*/[
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
