define("DocumentRelationshipDetailV2", ["ConfigurationEnums"], function(enums) {
	return {
		entitySchemaName: "DocumentRelationship",
		attributes: {},
		methods: {
			/**
			 * Отправляет сообщение на сохранение родительской страницы редактирования и инициирует вызов
			 * открытия справочника документов для связи с договором.
			 * @private
			 */
			linkWithExisting: function() {
				var editPages = this.get("EditPages");
				if (editPages.getCount() === 0) {
					return;
				}
				var editPage = editPages.getByIndex(0);
				var editPageUId = editPage.get("Tag");
				var cardState = this.sandbox.publish("GetCardState", null, [this.sandbox.id]);
				var isNew = (cardState.state === enums.CardStateV2.ADD ||
				cardState.state === enums.CardStateV2.COPY);
				if (isNew) {
					this.set("CardState", enums.CardStateV2.ADD);
					this.set("EditPageUId", editPageUId);
					var scope = this;
					var args = {
						isSilent: true,
						callback: function() {
							scope.openDocumentLookupToLink();
						},
						messageTags: [this.sandbox.id]
					};
					this.sandbox.publish("SaveRecord", args, [this.sandbox.id]);
				} else {
					this.openDocumentLookupToLink();
				}
			},

			/**
			 * Открывает справочник документов для выбора записей,
			 * которые необходимо связать с текущим документом.
			 * @private
			 */
			openDocumentLookupToLink: function() {
				var config = {
					entitySchemaName: "Document",
					multiSelect: true,
					columns: ["Number", "Account", "Type", "State"]
				};
				var recordId = this.get("MasterRecordId");
				var filters = this.Terrasoft.createFilterGroup();
				var idFilter = this.Terrasoft.createColumnFilterWithParameter(this.Terrasoft.ComparisonType.NOT_EQUAL,
					"Id", recordId);
				filters.addItem(idFilter);
				var notExistsFilter = this.Terrasoft.createNotExistsFilter("[DocumentRelationship:DocumentB].DocumentA");
				filters.addItem(notExistsFilter);
				config.filters = filters;
				this.openLookup(config, this.linkSelectedRecords, this);
			},

			/**
			 * Добавляет связи для выбранных записей с текущим документом.
			 * Производит подсчет добавленных записей и в конце генерирует сообщение,
			 * сколько документов было добавлено.
			 * @param {Object} args Объект вида {columnName: string, selectedRows: []}.
			 * Содержит массив выбранных записей из справочника.
			 * @private
			 */
			linkSelectedRecords: function(args) {
				var selectedRows = args.selectedRows.getItems();
				var totalCount = selectedRows.length;
				var addedCount = 0;
				var callsCount = 0;
				this.Terrasoft.each(selectedRows, function(item) {
					callsCount++;
					var insert = this.Ext.create("Terrasoft.InsertQuery", {
						rootSchemaName: "DocumentRelationship"
					});
					insert.setParameterValue("DocumentA", this.get("MasterRecordId"), this.Terrasoft.DataValueType.GUID);
					insert.setParameterValue("DocumentB", item.value, this.Terrasoft.DataValueType.GUID);
					insert.execute(function(response) {
						if (response && response.success) {
							addedCount++;
						}
						if (callsCount === totalCount) {
							var resultMessage =
								this.Ext.String.format(this.get("Resources.Strings.AddedLinksCountMessage"),
									addedCount, totalCount);
							this.Terrasoft.showInformation(resultMessage);
							this.reloadGridData();
						}
					}, this);
				}, this);
			},

			/**
			 * Удаляет связь подчиненного договора с текущим родителем.
			 * @private
			 */
			deleteLinkWithDocuments: function() {
				this.showConfirmationDialog(this.get("Resources.Strings.DeleteConfirmationMessage"),
						function(returnCode) {
					if (returnCode !== this.Terrasoft.MessageBoxButtons.YES.returnCode) {
						return;
					}
					this.showBodyMask();
					var selectedRows = this.getSelectedItems();
					var deleteQuery = this.Ext.create("Terrasoft.DeleteQuery", {
						rootSchemaName: "DocumentRelationship"
					});
					var masterRecordId = this.get("MasterRecordId");
					var filters = this.getDeleteRelationFilters(masterRecordId, selectedRows);
					deleteQuery.filters.add("DocumentsFilter", filters);
					deleteQuery.execute(function() {
						this.hideBodyMask();
						this.deselectRows();
						this.reloadGridData();
					}, this);
				}, [this.Terrasoft.MessageBoxButtons.YES.returnCode, this.Terrasoft.MessageBoxButtons.NO.returnCode]);
			},

			/**
			 * Возвращает фильтр для удаления связей документов из DocumentRelationship по Id записей таблицы Document.
			 * @protected
			 * @param {GUID} masterRecordId Id записи раздела.
			 * @param {Array} relatedDocumentIds Id выбранных записей детали.
			 * @return {Terrasoft.FilterGroup} фильтр для удаления связей документов из DocumentRelationship
			 * по Id записей таблицы Document.
			 */
			getDeleteRelationFilters: function(masterRecordId, relatedDocumentIds) {
				var mainFilter = this.Terrasoft.createFilterGroup();
				mainFilter.logicalOperation = this.Terrasoft.LogicalOperatorType.OR;
				var createRelationFilterFn = function(columnA, columnB) {
					var filter = this.Terrasoft.createFilterGroup();
					filter.addItem(this.Terrasoft.createColumnInFilterWithParameters(columnA, relatedDocumentIds));
					filter.addItem(this.Terrasoft.createColumnFilterWithParameter(this.Terrasoft.ComparisonType.EQUAL,
							columnB, masterRecordId));
					return filter;
				}.bind(this);
				mainFilter.addItem(createRelationFilterFn("DocumentA", "DocumentB"));
				mainFilter.addItem(createRelationFilterFn("DocumentB", "DocumentA"));
				return mainFilter;
			},

			/**
			 * Показывает/скрывает кнопку связи с существующим договором.
			 * @private
			 * @returns {boolean} Возвращает признак видимости кнопки.
			 */
			getLinkButtonVisible: function() {
				return (this.get("CardPageName") === "DocumentPageV2");
			},

			/**
			 ** Добавляет элементы манипулирования записями в коллекцию выпадающего списка функциональной кнопки.
			 * @inheritdoc Terrasoft.BaseGridDetailV2#addRecordOperationsMenuItems
			 * @overridden
			 */
			addRecordOperationsMenuItems: function(toolsButtonMenu) {
				this.callParent(arguments);
				toolsButtonMenu.addItem(this.getButtonMenuSeparator());
				toolsButtonMenu.addItem(this.getButtonMenuItem({
					Caption: {"bindTo": "Resources.Strings.LinkWithExistingCaption"},
					Click: {"bindTo": "linkWithExisting"},
					Visible: {"bindTo": "getLinkButtonVisible"}
				}));
				toolsButtonMenu.addItem(this.getButtonMenuItem({
					Caption: {"bindTo": "Resources.Strings.DeleteLinkWithDocumentsCaption"},
					Click: {"bindTo": "deleteLinkWithDocuments"},
					Visible: {"bindTo": "getLinkButtonVisible"},
					Enabled: {"bindTo": "getSelectedItems"}
				}));
			},

			init: function() {
				this.entitySchema.primaryDisplayColumnName = this.entitySchema.primaryDisplayColumnName || "DocumentB";
				this.callParent(arguments);
			}
		},
		diff: /**SCHEMA_DIFF*/[]/**SCHEMA_DIFF*/
	};
});
